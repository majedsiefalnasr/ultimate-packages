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

function componentName(component) {
  const option = component.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && propertyName(prop) === "name"
  );
  return option && ts.isStringLiteralLike(option.initializer)
    ? option.initializer.text
    : "<unnamed component>";
}

// Only literal option keys are read. Any other initializer (an identifier, a
// call) or a spread would silently drop keys, so it is an error instead.
function keysOf(option, component, sourceFile) {
  const node = option.initializer;
  const where = () =>
    `\`${propertyName(option)}\` of ${componentName(component)} in ${sourceFile.fileName}`;
  if (ts.isObjectLiteralExpression(node)) {
    if (node.properties.some(ts.isSpreadAssignment)) {
      throw new Error(`[drift] spread in ${where()} cannot be read`);
    }
    return node.properties.map(propertyName);
  }
  if (ts.isArrayLiteralExpression(node)) {
    if (node.elements.some(ts.isSpreadElement)) {
      throw new Error(`[drift] spread in ${where()} cannot be read`);
    }
    return node.elements.filter(ts.isStringLiteralLike).map((element) => element.text);
  }
  throw new Error(`[drift] ${where()} is not an object or array literal`);
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
      if (propertyName(option) === "props") props.push(...keysOf(option, component, sourceFile));
      if (propertyName(option) === "emits") events.push(...keysOf(option, component, sourceFile));
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

function compareNames(framework, apiKind, recordNames, sourceNames) {
  const drift = [];
  for (const name of sourceNames) {
    if (!recordNames.includes(name)) {
      drift.push({ framework, kind: "missing-in-record", apiKind, name });
    }
  }
  for (const name of recordNames) {
    if (!sourceNames.includes(name)) {
      drift.push({ framework, kind: "missing-in-source", apiKind, name });
    }
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
        "prop",
        api.props.map((prop) => prop.name),
        source.props
      ),
      ...compareNames(
        framework,
        "event",
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

export function readExclusions() {
  return JSON.parse(readFileSync(resolve(SCRIPT_DIR, "drift-exclusions.json"), "utf8"));
}

// Every drift problem across `records`, as structured items. A drift item is
// { component, framework, kind, apiKind, name } with kind "missing-in-record"
// or "missing-in-source"; any other kind ("orphan-entry", "no-entry",
// "missing-files") is a structural problem.
export function collectDrift(records, sourceMap) {
  const problems = [];
  for (const name of Object.keys(sourceMap)) {
    if (!records.some((record) => record.name === name)) {
      problems.push({ component: name, kind: "orphan-entry" });
    }
  }
  for (const record of records) {
    const entry = sourceMap[record.name];
    if (!entry) {
      problems.push({ component: record.name, kind: "no-entry" });
      continue;
    }
    const missingFiles = FRAMEWORKS.flatMap((fw) => entry[fw] ?? []).filter(
      (sourcePath) => !existsSync(resolve(REPO_ROOT, sourcePath))
    );
    if (missingFiles.length > 0) {
      problems.push({ component: record.name, kind: "missing-files", files: missingFiles });
      continue;
    }
    for (const drift of diffApi(record, extractSources(entry))) {
      problems.push({ component: record.name, ...drift });
    }
  }
  return problems;
}

export function formatProblem(problem) {
  switch (problem.kind) {
    case "orphan-entry":
      return `source-map.json entry ${problem.component} has no metadata record`;
    case "no-entry":
      return `${problem.component}: no source-map.json entry`;
    case "missing-files":
      return `${problem.component}: source file(s) not found: ${problem.files.join(", ")}`;
    default:
      return `${problem.component} ${problem.framework} ${problem.kind}: ${problem.name}`;
  }
}

// Every drift problem across `records`, as printable lines.
export function driftProblems(records, sourceMap) {
  return collectDrift(records, sourceMap).map(formatProblem);
}

const EXCLUSION_FIELDS = ["component", "framework", "apiKind", "name", "rationale", "source"];
const API_KINDS = ["prop", "event"];
const WILDCARD = /[*?]/;
// A file:line (or file:start-end) citation, or an ADR id.
const CITATION = /^[^\s:]+:\d+(-\d+)?$|\bADR-\d+\b/;

function exclusionKey(entry) {
  return `${entry.component} ${entry.framework} ${entry.apiKind} ${entry.name}`;
}

function exclusionError(entry, components) {
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return "must be an object";
  }
  const unexpected = Object.keys(entry).find((key) => !EXCLUSION_FIELDS.includes(key));
  if (unexpected) return `unexpected field "${unexpected}"`;
  const missing = EXCLUSION_FIELDS.find(
    (field) => typeof entry[field] !== "string" || entry[field].trim() === ""
  );
  if (missing) return `"${missing}" must be a non-empty string`;
  if (WILDCARD.test(entry.component) || WILDCARD.test(entry.name)) {
    return "wildcards are not allowed";
  }
  if (!components.includes(entry.component)) return `unknown component "${entry.component}"`;
  if (!FRAMEWORKS.includes(entry.framework)) return `unknown framework "${entry.framework}"`;
  if (!API_KINDS.includes(entry.apiKind)) return `unknown apiKind "${entry.apiKind}"`;
  if (!CITATION.test(entry.source)) return "source must cite a file:line or an ADR";
  return undefined;
}

// Suppresses each missing-in-record item that one valid exclusion names
// exactly by (component, framework, apiKind, name). missing-in-source items
// and structural problems are never suppressed. `components` lists the known
// record names, so an exclusion for an unknown component is invalid.
export function applyExclusions(problems, exclusions, components) {
  const invalid = [];
  const valid = new Map();
  exclusions.forEach((entry, index) => {
    const isObject = typeof entry === "object" && entry !== null;
    const label = `exclusion #${index + 1}${isObject ? ` (${exclusionKey(entry)})` : ""}`;
    const error = exclusionError(entry, components);
    if (error) invalid.push(`${label}: ${error}`);
    else if (valid.has(exclusionKey(entry))) invalid.push(`${label}: duplicates an earlier entry`);
    else valid.set(exclusionKey(entry), entry);
  });
  const used = new Set();
  const remaining = problems.filter((problem) => {
    if (problem.kind !== "missing-in-record") return true;
    const key = exclusionKey(problem);
    if (!valid.has(key)) return true;
    used.add(key);
    return false;
  });
  const stale = [...valid].filter(([key]) => !used.has(key)).map(([, entry]) => entry);
  return { remaining, stale, invalid };
}

// Prints the result and returns the process exit code.
export function runDriftCheck(records, sourceMap, exclusions = []) {
  const { remaining, stale, invalid } = applyExclusions(
    collectDrift(records, sourceMap),
    exclusions,
    records.map((record) => record.name)
  );
  const lines = [
    ...remaining.map(formatProblem),
    ...stale.map(
      (entry) => `stale exclusion ${exclusionKey(entry)}: matches no missing-in-record item`
    ),
    ...invalid,
  ];
  if (lines.length > 0) {
    for (const line of lines) console.error(`[drift] ${line}`);
    console.error(`[drift] FAILED: ${lines.length} problem(s)`);
    return 1;
  }
  const applied =
    exclusions.length > 0 ? ` (${exclusions.length} documented exclusion(s) applied)` : "";
  console.log(`[drift] OK: ${records.length} record(s) match their sources${applied}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { ALL_COMPONENTS } = await import("../dist/index.mjs");
  process.exit(runDriftCheck(ALL_COMPONENTS, readSourceMap(), readExclusions()));
}
