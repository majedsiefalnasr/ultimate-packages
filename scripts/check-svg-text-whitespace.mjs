#!/usr/bin/env node
// Fails when an SVG text-content element (text, tspan, textPath, title, desc) in an
// Angular @Component template or a Vue SFC template renders leading or trailing whitespace.
//
// Prettier's htmlWhitespaceSensitivity "strict" does not cover SVG elements, so it can
// move their content onto its own line. Angular (preserveWhitespaces: false) drops
// whitespace-only text nodes but keeps leading/trailing whitespace of any other text node
// (interpolations included), so it renders " value "; Vue does the same for static text.
//
// Angular templates are checked with a small structural scanner instead of
// @angular/compiler, whose engines range is narrower than this repository's Node floor.
// Vue templates are checked with vue/compiler-sfc. Fails closed: a template it cannot
// resolve statically or cannot scan, or SVG text content it does not model, is reported
// as a violation because it cannot be verified.
//
// Usage: node scripts/check-svg-text-whitespace.mjs [files...]   (default: all tracked templates)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ts = createRequire(resolve(root, "package.json"))("typescript");
const sfc = createRequire(resolve(root, "packages/vue/package.json"))("vue/compiler-sfc");

const SVG_TEXT = ["text", "tspan", "textPath", "title", "desc"];
const HTML_VOID = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta"];
HTML_VOID.push("source", "track", "wbr");
const NG_STRUCTURAL = ["ng-container", "ng-template", "ng-content"];
// Angular parses these elements' content as (escapable) raw text, also inside <svg>.
const RAW_TEXT = ["title", "textarea", "script", "style"];
// Elements Angular lets a closing ancestor tag close implicitly (HtmlTagDefinition.closedByParent).
const CLOSED_BY_PARENT = ["li", "dt", "dd", "rb", "rt", "rtc", "rp", "optgroup", "option", "p"];
CLOSED_BY_PARENT.push("thead", "tbody", "tfoot", "tr", "td", "th");
// Raw whitespace, or an entity Angular decodes to whitespace, at the start/end of a text node.
const WS_ENTITY = "&(?:nbsp|ngsp|#0*(?:9|10|13|32|160)|#x0*(?:9|a|d|20|a0));";
const WS_START = new RegExp(`^(?:\\s|${WS_ENTITY})`, "i");
const WS_END = new RegExp(`(?:\\s|${WS_ENTITY})$`, "i");
const MESSAGE = "renders leading/trailing whitespace";

// Static string value of an expression, as Angular's AOT compiler resolves it for the
// cases used here: string and template literals, `${...}` substitutions, parentheses, and
// identifiers bound to a same-file `const`. Returns null when it cannot be resolved.
function staticString(expr, sf, seen = new Set()) {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  if (ts.isParenthesizedExpression(expr)) return staticString(expr.expression, sf, seen);
  if (ts.isTemplateExpression(expr)) {
    let out = expr.head.text;
    for (const span of expr.templateSpans) {
      const value = staticString(span.expression, sf, seen);
      if (value === null) return null;
      out += value + span.literal.text;
    }
    return out;
  }
  if (ts.isIdentifier(expr) && !seen.has(expr.text)) {
    seen.add(expr.text);
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt) || !(stmt.declarationList.flags & ts.NodeFlags.Const))
        continue;
      for (const decl of stmt.declarationList.declarations)
        if (ts.isIdentifier(decl.name) && decl.name.text === expr.text && decl.initializer)
          return staticString(decl.initializer, sf, seen);
    }
  }
  return null;
}

function isComponentTemplate(prop) {
  const call = prop.parent?.parent;
  return (
    ts.isPropertyAssignment(prop) &&
    prop.name.getText() === "template" &&
    ts.isObjectLiteralExpression(prop.parent) &&
    call !== undefined &&
    ts.isCallExpression(call) &&
    ts.isDecorator(call.parent) &&
    call.expression.getText() === "Component"
  );
}

// Text outside interpolations. An unterminated `{{` runs to the end of the text run, as in
// Angular's lexer, so it is dropped as well.
const outsideInterpolation = (value) =>
  value.replace(/\{\{[\s\S]*?\}\}/g, "").replace(/\{\{[\s\S]*$/, "");

// Structural scan of an Angular template: elements, text, comments, and the braces of
// control-flow blocks and ICU expressions, with the same tag-start rule as Angular's lexer
// (`<` followed by a letter, `/` or `!` ends a text run, even inside an unterminated `{{`).
// Returns { tree } or { error, pos }.
function scanAngular(text) {
  const rootNode = { name: "#root", svg: false, children: [], closed: true, depth: 0 };
  const stack = [rootNode];
  let i = 0;
  const fail = (error, pos) => ({ error, pos });
  while (i < text.length) {
    const parent = stack.at(-1);
    if (text.startsWith("<!--", i)) {
      const end = text.indexOf("-->", i + 4);
      if (end < 0) return fail("unterminated comment", i);
      parent.children.push({ type: "comment" });
      i = end + 3;
    } else if (text.startsWith("</", i) && /[a-zA-Z]/.test(text[i + 2] ?? "")) {
      const end = text.indexOf(">", i);
      if (end < 0) return fail("unterminated closing tag", i);
      const name = text.slice(i + 2, end).trim();
      let at = stack.length - 1;
      while (at > 0 && stack[at].name !== name && CLOSED_BY_PARENT.includes(stack[at].name)) at--;
      if (at < 1 || stack[at].name !== name) return fail(`unexpected closing tag </${name}>`, i);
      if (stack.slice(at).some((el) => el.depth !== 0))
        return fail(`unclosed block or ICU before </${name}>`, i);
      stack[at].closed = true;
      stack.length = at;
      i = end + 1;
    } else if (text[i] === "<" && /[a-zA-Z]/.test(text[i + 1] ?? "")) {
      const name = /^[^\s/>]+/.exec(text.slice(i + 1))[0];
      let j = i + 1 + name.length;
      let selfClosing = false;
      for (;;) {
        while (/\s/.test(text[j] ?? "")) j++;
        if (j >= text.length) return fail(`unterminated start tag <${name}>`, i);
        if (text[j] === ">") {
          j++;
          break;
        }
        if (text.startsWith("/>", j)) {
          j += 2;
          selfClosing = true;
          break;
        }
        const attr = /^[^\s=/>]+/.exec(text.slice(j));
        j += attr ? attr[0].length : 1;
        while (/\s/.test(text[j] ?? "")) j++;
        if (text[j] !== "=") continue;
        j++;
        while (/\s/.test(text[j] ?? "")) j++;
        const quote = text[j];
        if (quote === '"' || quote === "'") {
          const close = text.indexOf(quote, j + 1);
          if (close < 0) return fail(`unterminated attribute value in <${name}>`, i);
          j = close + 1;
        } else {
          j += /^[^\s>]*/.exec(text.slice(j))[0].length;
        }
      }
      const svg = name === "svg" || (parent.svg && parent.name !== "foreignObject");
      const el = {
        type: "element",
        name,
        svg,
        pos: i,
        children: [],
        closed: selfClosing,
        depth: 0,
      };
      parent.children.push(el);
      if (!selfClosing && RAW_TEXT.includes(name.toLowerCase())) {
        const close = new RegExp(`</${name}\\s*>`, "i").exec(text.slice(j));
        if (!close) return fail(`unclosed <${name}>`, i);
        el.children.push({ type: "text", value: text.slice(j, j + close.index) });
        el.closed = true;
        j += close.index + close[0].length;
      } else if (!selfClosing && (svg || !HTML_VOID.includes(name.toLowerCase()))) stack.push(el);
      else el.closed = true;
      i = j;
    } else {
      let j = i + 1;
      while (j < text.length && !(text[j] === "<" && /[a-zA-Z/!]/.test(text[j + 1] ?? ""))) j++;
      const value = text.slice(i, j);
      for (const ch of outsideInterpolation(value)) {
        if (ch === "{") parent.depth++;
        else if (ch === "}" && parent.depth-- === 0) return fail("unexpected '}'", i);
      }
      parent.children.push({ type: "text", value });
      i = j;
    }
  }
  if (stack.some((el) => el.depth !== 0)) return fail("unclosed block or ICU", text.length);
  return { tree: rootNode };
}

// Problems for one resolved Angular template: [{ pos, message }].
function angularProblems(text) {
  const scan = scanAngular(text);
  if (scan.error)
    return [{ pos: scan.pos, message: `template cannot be scanned (${scan.error}); not verified` }];
  const problems = [];
  const walk = (el) => {
    for (const child of el.children) {
      if (child.type !== "element") continue;
      if (child.svg && SVG_TEXT.includes(child.name)) {
        const unverified = (why) =>
          problems.push({ pos: child.pos, message: `<${child.name}> ${why}; not verified` });
        // Angular drops comments and whitespace-only text nodes; the rest render as written.
        const rendered = child.children.filter(
          (c) => c.type === "element" || (c.type === "text" && !/^\s*$/.test(c.value))
        );
        if (!child.closed) unverified("is not closed");
        else if (
          rendered.some((c) => c.type === "text" && /[{}@]/.test(outsideInterpolation(c.value)))
        )
          unverified("contains control flow, ICU or '@' syntax");
        else if (rendered.some((c) => c.type === "element" && NG_STRUCTURAL.includes(c.name)))
          unverified("contains ng-container, ng-template or ng-content");
        else {
          const first = rendered[0];
          const last = rendered.at(-1);
          if (
            (first?.type === "text" && WS_START.test(first.value)) ||
            (last?.type === "text" && WS_END.test(last.value))
          )
            problems.push({ pos: child.pos, message: `<${child.name}> ${MESSAGE}` });
        }
      }
      walk(child);
    }
  };
  walk(scan.tree);
  return problems;
}

function checkAngular(file, src) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const problems = [];
  const visit = (node) => {
    if (isComponentTemplate(node)) {
      const init = node.initializer;
      const line = sf.getLineAndCharacterOfPosition(init.getStart(sf)).line;
      const exact = ts.isNoSubstitutionTemplateLiteral(init) || ts.isStringLiteral(init);
      const text = staticString(init, sf);
      if (text === null) {
        problems.push(`${file}:${line + 1}: template cannot be resolved statically; not verified`);
      } else {
        for (const { pos, message } of angularProblems(text)) {
          const spanLine = text.slice(0, pos).split("\n").length - 1;
          const where = exact
            ? `${file}:${line + spanLine + 1}`
            : `${file}:${line + 1} (resolved template line ${spanLine + 1})`;
          problems.push(`${where}: ${message}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return problems;
}

function vueEdge(child, edge) {
  if (!child) return "";
  if (child.type === 2) return child.content; // TEXT
  if (child.type === 8) {
    // COMPOUND_EXPRESSION: text + interpolation parts
    const parts = child.children.filter((p) => typeof p === "object");
    const p = edge === "start" ? parts[0] : parts.at(-1);
    return p?.type === 2 ? p.content : "";
  }
  return "";
}

function checkVue(file, src) {
  const { descriptor, errors: parseErrors } = sfc.parse(src, { filename: file });
  if (parseErrors.length)
    return [`${file}: SFC does not parse (${parseErrors[0].message}); not verified`];
  if (!descriptor.template) return [];
  const { ast, errors } = sfc.compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: "check",
  });
  if (errors.length || !ast) {
    const first = errors[0];
    return [`${file}: template does not compile (${first?.message ?? first}); not verified`];
  }
  const offset = descriptor.template.loc.start.line - 1;
  const problems = [];
  const walk = (list) => {
    for (const n of list ?? []) {
      if (n.type === 1 && SVG_TEXT.includes(n.tag) && n.children.length) {
        if (
          /^\s/.test(vueEdge(n.children[0], "start")) ||
          /\s$/.test(vueEdge(n.children.at(-1), "end"))
        )
          problems.push(`${file}:${offset + n.loc.start.line}: <${n.tag}> ${MESSAGE}`);
      }
      walk(n.children);
      n.branches?.forEach((b) => walk(b.children));
    }
  };
  walk(ast.children);
  return problems;
}

const args = process.argv.slice(2);
const files = (
  args.length
    ? args
    : execFileSync("git", ["ls-files", "*.ts", "*.vue"], { cwd: root, encoding: "utf8" }).split(
        "\n"
      )
).filter((f) => f.endsWith(".vue") || (f.endsWith(".ts") && !f.endsWith(".d.ts")));
const problems = [];
for (const file of files) {
  const src = readFileSync(resolve(root, file), "utf8");
  if (file.endsWith(".vue")) problems.push(...checkVue(file, src));
  else if (src.includes("@Component")) problems.push(...checkAngular(file, src));
}
if (problems.length) {
  console.error(problems.join("\n"));
  console.error(
    `\n${problems.length} problem(s). An SVG text element must not render leading/trailing whitespace: keep its content on the tag's line (add <!-- prettier-ignore --> before the element if Prettier reflows it). Templates that cannot be resolved or scanned cannot be verified.`
  );
  process.exitCode = 1; // not process.exit(): that can truncate stderr when it is a pipe
} else {
  console.log(
    `check-svg-text-whitespace: ${files.length} file(s) checked, no SVG text whitespace.`
  );
}
