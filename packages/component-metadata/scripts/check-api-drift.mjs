// Metadata-versus-source API drift check (Spec B4-R3, ADR-058 DOC-2).
//
// Extracts each framework's public prop and event names from the ground-truth
// source files listed in ./source-map.json (copied from each record's
// "Ground truth" header comment) and compares them with the record's own
// `api.<framework>.props[].name` and `api.<framework>.events[].frameworkName`.
// Exits 1 when any record and its source disagree.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "../../..");
export const FRAMEWORKS = ["ng", "react", "vue"];

// Button record convention: an output/emit that only re-emits the native DOM
// click/focus/blur event one-to-one is a native passthrough, not an EventFact.
// React needs no list: native handlers come from the inherited DOM attribute
// types, which are never read.
export const NATIVE_EVENT_PASSTHROUGH = {
  ng: ["onBlur", "onClick", "onFocus"],
  react: [],
  vue: ["blur", "click", "focus"],
};

const NG_PROP_CALLEES = ["input", "input.required", "model"];
const NG_EVENT_CALLEES = ["output"];

function parseSource(sourcePath) {
  const absolute = resolve(REPO_ROOT, sourcePath);
  let text = readFileSync(absolute, "utf8");
  if (extname(absolute) === ".vue") {
    const script = /<script\b[^>]*>([\s\S]*?)<\/script>/.exec(text);
    if (!script) throw new Error(`[drift] no <script> block in ${sourcePath}`);
    text = script[1];
  }
  const kind = extname(absolute) === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true, kind);
}

function propertyName(node) {
  const name = node.name;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function isExported(node) {
  return (node.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function forEachDescendant(node, visit) {
  ts.forEachChild(node, (child) => {
    visit(child);
    forEachDescendant(child, visit);
  });
}

function bindingAlias(call) {
  for (const arg of call.arguments) {
    if (!ts.isObjectLiteralExpression(arg)) continue;
    for (const prop of arg.properties) {
      if (ts.isPropertyAssignment(prop) && propertyName(prop) === "alias") {
        if (ts.isStringLiteralLike(prop.initializer)) return prop.initializer.text;
      }
    }
  }
  return undefined;
}

function calleeText(call) {
  const callee = call.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
    return `${callee.expression.text}.${callee.name.text}`;
  }
  return undefined;
}

function extractNg(sourceFile) {
  const props = [];
  const events = [];
  forEachDescendant(sourceFile, (node) => {
    if (!ts.isClassDeclaration(node)) return;
    for (const member of node.members) {
      if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
      if (!ts.isCallExpression(member.initializer)) continue;
      const callee = calleeText(member.initializer);
      const name = bindingAlias(member.initializer) ?? propertyName(member);
      if (NG_PROP_CALLEES.includes(callee)) props.push(name);
      else if (NG_EVENT_CALLEES.includes(callee)) events.push(name);
    }
  });
  return { props, events };
}

function localTypeDeclarations(sourceFile) {
  const declarations = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      declarations.set(statement.name.text, statement);
    }
  }
  return declarations;
}

// Members declared on a Props type itself, plus those of extended interfaces
// declared in the same file (Ultimate-owned). Anything else it extends, such as
// React's native attribute types, is not read.
function ownMemberNames(declaration, declarations) {
  const names = [];
  const fromTypeNode = (typeNode) => {
    if (ts.isTypeLiteralNode(typeNode)) {
      for (const member of typeNode.members) names.push(propertyName(member));
    } else if (ts.isIntersectionTypeNode(typeNode)) {
      typeNode.types.forEach(fromTypeNode);
    } else if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
      const local = declarations.get(typeNode.typeName.text);
      if (local) names.push(...ownMemberNames(local, declarations));
    }
  };
  if (ts.isTypeAliasDeclaration(declaration)) {
    fromTypeNode(declaration.type);
    return names;
  }
  for (const member of declaration.members) names.push(propertyName(member));
  for (const clause of declaration.heritageClauses ?? []) {
    for (const heritage of clause.types) {
      if (!ts.isIdentifier(heritage.expression)) continue;
      const local = declarations.get(heritage.expression.text);
      if (local) names.push(...ownMemberNames(local, declarations));
    }
  }
  return names;
}

function extractReact(sourceFile) {
  const declarations = localTypeDeclarations(sourceFile);
  const propsTypes = [...declarations.values()].filter(
    (d) => isExported(d) && d.name.text.endsWith("Props")
  );
  if (propsTypes.length !== 1) {
    throw new Error(
      `[drift] expected exactly one exported *Props type in ${sourceFile.fileName}, found ${propsTypes.length}`
    );
  }
  const props = [];
  const events = [];
  for (const name of ownMemberNames(propsTypes[0], declarations)) {
    (/^on[A-Z]/.test(name) ? events : props).push(name);
  }
  return { props, events };
}

function keysOf(node) {
  if (ts.isObjectLiteralExpression(node)) return node.properties.map(propertyName);
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.filter(ts.isStringLiteralLike).map((element) => element.text);
  }
  return [];
}

function vueComponentObjects(sourceFile) {
  const objects = [];
  forEachDescendant(sourceFile, (node) => {
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      objects.push(node.expression);
    }
    if (
      ts.isCallExpression(node) &&
      calleeText(node) === "defineComponent" &&
      node.arguments[0] &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      objects.push(node.arguments[0]);
    }
  });
  return objects;
}

function extractVue(sourceFile) {
  const props = [];
  const events = [];
  const components = vueComponentObjects(sourceFile);
  for (const component of components) {
    for (const option of component.properties) {
      if (!ts.isPropertyAssignment(option)) continue;
      if (propertyName(option) === "props") props.push(...keysOf(option.initializer));
      if (propertyName(option) === "emits") events.push(...keysOf(option.initializer));
    }
  }
  if (components.length === 0) {
    // A directive (Tooltip) has no component options; its public surface is
    // the exported binding-value interface.
    const declarations = localTypeDeclarations(sourceFile);
    for (const declaration of declarations.values()) {
      if (isExported(declaration) && declaration.name.text.endsWith("BindingValue")) {
        props.push(...ownMemberNames(declaration, declarations));
      }
    }
  }
  return { props, events };
}

const EXTRACTORS = { ng: extractNg, react: extractReact, vue: extractVue };

export function extractApi(framework, sourcePath) {
  const extractor = EXTRACTORS[framework];
  if (!extractor) throw new Error(`[drift] unknown framework ${framework}`);
  const { props, events } = extractor(parseSource(sourcePath));
  const passthrough = NATIVE_EVENT_PASSTHROUGH[framework];
  return {
    props: [...new Set(props)],
    events: [...new Set(events)].filter((name) => !passthrough.includes(name)),
  };
}

// Merges the extraction of every ground-truth file of each framework.
export function extractSources(entry) {
  const extracted = {};
  for (const framework of FRAMEWORKS) {
    const props = new Set();
    const events = new Set();
    for (const sourcePath of entry[framework] ?? []) {
      const api = extractApi(framework, sourcePath);
      api.props.forEach((name) => props.add(name));
      api.events.forEach((name) => events.add(name));
    }
    extracted[framework] = { props: [...props], events: [...events] };
  }
  return extracted;
}

function compareNames(framework, recordNames, sourceNames) {
  const drift = [];
  for (const name of sourceNames) {
    if (!recordNames.includes(name)) drift.push({ framework, kind: "missing-in-record", name });
  }
  for (const name of recordNames) {
    if (!sourceNames.includes(name)) drift.push({ framework, kind: "missing-in-source", name });
  }
  return drift;
}

export function diffApi(record, extracted) {
  const drift = [];
  for (const framework of FRAMEWORKS) {
    const source = extracted[framework];
    if (!source) continue;
    const api = record.api?.[framework] ?? { props: [], events: [] };
    drift.push(
      ...compareNames(
        framework,
        api.props.map((prop) => prop.name),
        source.props
      ),
      ...compareNames(
        framework,
        api.events.map((event) => event.frameworkName),
        source.events
      )
    );
  }
  return drift;
}

export function readSourceMap() {
  return JSON.parse(readFileSync(resolve(SCRIPT_DIR, "source-map.json"), "utf8"));
}

async function main() {
  const { ALL_COMPONENTS } = await import("../dist/index.mjs");
  const sourceMap = readSourceMap();
  const problems = [];
  for (const name of Object.keys(sourceMap)) {
    if (!ALL_COMPONENTS.some((record) => record.name === name)) {
      problems.push(`source-map.json entry ${name} has no metadata record`);
    }
  }
  for (const record of ALL_COMPONENTS) {
    const entry = sourceMap[record.name];
    if (!entry) {
      problems.push(`${record.name}: no source-map.json entry`);
      continue;
    }
    const missingFiles = FRAMEWORKS.flatMap((fw) => entry[fw] ?? []).filter(
      (sourcePath) => !existsSync(resolve(REPO_ROOT, sourcePath))
    );
    if (missingFiles.length > 0) {
      problems.push(`${record.name}: source file(s) not found: ${missingFiles.join(", ")}`);
      continue;
    }
    for (const drift of diffApi(record, extractSources(entry))) {
      problems.push(`${record.name} ${drift.framework} ${drift.kind}: ${drift.name}`);
    }
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`[drift] ${problem}`);
    console.error(`[drift] FAILED: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log(`[drift] OK: ${ALL_COMPONENTS.length} record(s) match their sources`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
