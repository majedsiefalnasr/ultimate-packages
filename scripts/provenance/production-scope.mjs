// scripts/provenance/production-scope.mjs
//
// Classifies a watched package's src/ files as production (distributed by the
// package's own build, in JS or declaration output) or excluded (GAP-094,
// ADR-062). The classification comes from build evidence — ng-packagr entry
// points, tsup entries and `exports`, emitting tsc/vue-tsc programs and the
// import graph from the entries — never from a file name alone. Builds this
// module cannot model fail closed: every file is production, or the result
// is an `{ error }` that the validator reports.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { URL, fileURLToPath } from "node:url";
import ts from "typescript";

const WATCHED_EXTENSIONS = [".ts", ".tsx", ".vue"];
const RESOLVE_SUFFIXES = [".ts", ".tsx", ".vue", ".d.ts", "/index.ts", "/index.tsx"];
const ASSET_PATTERN = /\.(css|scss|sass|less|json|svg|png|jpe?g|gif|webp|avif|woff2?)$/;
const EXPORT_CONDITIONS = new Set(["types", "import", "require", "default"]);
const SFC_LANGS = new Set([undefined, "ts", "tsx", "js"]);
// Every config file name tsup itself loads (plus the `tsup` package.json key);
// exactly one source of configuration must exist.
const TSUP_CONFIG_NAMES = [
  "tsup.config.ts",
  "tsup.config.cts",
  "tsup.config.mts",
  "tsup.config.js",
  "tsup.config.cjs",
  "tsup.config.mjs",
  "tsup.config.json",
];
// package.json `files` entries that cannot ship watched source.
const SAFE_PUBLISHED_FILES =
  /^(dist(\/.*)?|README\.md|THIRD-PARTY-NOTICES\.md|LICENSE(\.md)?|CHANGELOG\.md)$/;
const TSUP_DIST_COPY_OPTIONS = new Set(["publicDir", "onSuccess"]);
const NG_DISCOVERY_SKIP = new Set(["node_modules", ".git"]);

class ClassificationError extends Error {}

const failClassification = (message) => {
  throw new ClassificationError(message);
};

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Every watched source file (.ts, .tsx, .vue, including .d.ts) under `<pkgDir>/src`. */
export function listWatchedFiles(pkgDir) {
  const files = [];
  const walk = (rel) => {
    const abs = join(pkgDir, rel);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const childRel = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(childRel);
      else if (WATCHED_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        files.push(join(pkgDir, childRel));
      }
    }
  };
  walk("src");
  return files;
}

/**
 * Parses a `build` script into its recognised steps, or returns null when any
 * command is outside the allowlist (the caller then treats every file as
 * production). Commands are matched exactly, by name and whole argument list.
 */
export function parseBuildScript(script) {
  const result = { tsup: false, ngPackagr: null, tscPrograms: [] };
  for (const command of script.split(/&&|;/)) {
    const [tool, ...args] = command.trim().split(/\s+/);
    if (tool === "tsup" && args.length === 0) {
      result.tsup = true;
    } else if (tool === "ng-packagr" && args.length === 2 && args[0] === "-p") {
      result.ngPackagr = args[1];
    } else if (tool === "node" && args.length === 1 && args[0] === "scripts/rename-dts.mjs") {
      // Post-processor: renames and rewrites emitted .d.ts files only.
    } else if (tool === "tsc" || tool === "vue-tsc") {
      const program = parseTscArgs(tool, args);
      if (!program) return null;
      result.tscPrograms.push(program);
    } else {
      return null;
    }
  }
  return result;
}

function parseTscArgs(tool, args) {
  let project = "tsconfig.json";
  let declaration = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-p" && args[i + 1]) project = args[++i];
    else if (arg === "--outDir" && args[i + 1]) i++;
    else if (arg === "--declaration") declaration = true;
    else if (arg !== "--emitDeclarationOnly") return null;
  }
  return { tool, project, declaration };
}

/** True when any ng-package.json declares `assets` (ng-packagr's copy-into-dist option). */
function ngConfigsCopyAssets(pkgDir) {
  const visit = (dir) =>
    readdirSync(dir, { withFileTypes: true }).some((entry) => {
      if (entry.isDirectory()) {
        return (
          !NG_DISCOVERY_SKIP.has(entry.name) &&
          entry.name !== "dist" &&
          visit(join(dir, entry.name))
        );
      }
      if (entry.name !== "ng-package.json") return false;
      const assets = readJson(join(dir, entry.name)).assets;
      return Array.isArray(assets) && assets.length > 0;
    });
  return visit(pkgDir);
}

/** Recursively discovered ng-packagr entry points, as ng-packagr itself discovers them. */
export function ngEntries(pkgDir, rootConfig) {
  const rootConfigPath = join(pkgDir, rootConfig);
  if (!isFile(rootConfigPath)) failClassification(`${rootConfigPath} does not exist`);
  const rootDir = dirname(rootConfigPath);
  const dest = resolve(rootDir, readJson(rootConfigPath).dest ?? "dist");
  const entries = [];
  const selfMap = new Map();
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const child = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!NG_DISCOVERY_SKIP.has(entry.name) && resolve(child) !== dest) visit(child);
      } else if (entry.name === "ng-package.json") {
        const entryFile = resolve(dir, readJson(child).lib?.entryFile ?? "src/public_api.ts");
        if (!isFile(entryFile)) {
          failClassification(
            `${child} entryFile ${relative(resolve(pkgDir), entryFile)} does not exist`
          );
        }
        entries.push(entryFile);
        selfMap.set(relative(rootDir, dir).split("\\").join("/"), entryFile);
      }
    }
  };
  visit(rootDir);
  return { entries, selfMap };
}

function findDefineConfig(sourceFile) {
  const calls = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "defineConfig"
    ) {
      calls.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  if (
    calls.length !== 1 ||
    !calls[0].arguments[0] ||
    !ts.isObjectLiteralExpression(calls[0].arguments[0])
  ) {
    failClassification("tsup config must contain exactly one defineConfig({...}) call");
  }
  return calls[0].arguments[0];
}

const propertyName = (property) =>
  property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
    ? property.name.text
    : undefined;

function constInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if (!(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return declaration.initializer;
      }
    }
  }
  return undefined;
}

function singleParamArrow(node) {
  if (!node || !ts.isArrowFunction(node) || node.parameters.length !== 1) return undefined;
  const param = node.parameters[0].name;
  return ts.isIdentifier(param) ? param.text : undefined;
}

function callOf(node, method) {
  return node &&
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === method
    ? node
    : undefined;
}

// readdirSync("src", { withFileTypes: true }).filter((p) => p.isDirectory())
function isSrcDirectoryListing(node) {
  const filter = callOf(node, "filter");
  if (!filter || filter.arguments.length !== 1) return false;
  const read = filter.expression.expression;
  if (
    !ts.isCallExpression(read) ||
    !ts.isIdentifier(read.expression) ||
    read.expression.text !== "readdirSync"
  ) {
    return false;
  }
  const [dir, options] = read.arguments;
  const withFileTypes =
    options &&
    ts.isObjectLiteralExpression(options) &&
    options.properties.length === 1 &&
    propertyName(options.properties[0]) === "withFileTypes" &&
    options.properties[0].initializer?.kind === ts.SyntaxKind.TrueKeyword;
  if (!dir || !ts.isStringLiteral(dir) || dir.text !== "src" || !withFileTypes) return false;
  const param = singleParamArrow(filter.arguments[0]);
  const body = filter.arguments[0].body;
  const isDirectoryCall = callOf(body, "isDirectory");
  return Boolean(
    param &&
    isDirectoryCall &&
    isDirectoryCall.arguments.length === 0 &&
    ts.isIdentifier(isDirectoryCall.expression.expression) &&
    isDirectoryCall.expression.expression.text === param
  );
}

// `${X}${suffix}` where X is the callback parameter or `<param>.name`.
function isTemplate(node, head, suffix, param, viaName) {
  if (
    !node ||
    !ts.isTemplateExpression(node) ||
    node.head.text !== head ||
    node.templateSpans.length !== 1
  ) {
    return false;
  }
  const [span] = node.templateSpans;
  if (span.literal.text !== suffix) return false;
  const expr = span.expression;
  return viaName
    ? ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "name" &&
        ts.isIdentifier(expr.expression) &&
        expr.expression.text === param
    : ts.isIdentifier(expr) && expr.text === param;
}

// (p) => [`${X}/index`, `src/${X}/index.ts`]
function isEntryPairCallback(node, viaName) {
  const param = singleParamArrow(node);
  const body = node?.body;
  return Boolean(
    param &&
    body &&
    ts.isArrayLiteralExpression(body) &&
    body.elements.length === 2 &&
    isTemplate(body.elements[0], "", "/index", param, viaName) &&
    isTemplate(body.elements[1], "src/", "/index.ts", param, viaName)
  );
}

// The three directory-listing spread forms accepted by Spec erratum E1.
function isDirectoryListingEntries(sourceFile, node) {
  let call = node;
  if (ts.isIdentifier(node)) call = constInitializer(sourceFile, node.text);
  if (
    !call ||
    !ts.isCallExpression(call) ||
    !ts.isPropertyAccessExpression(call.expression) ||
    call.expression.getText(sourceFile) !== "Object.fromEntries" ||
    call.arguments.length !== 1
  ) {
    return false;
  }
  const map = callOf(call.arguments[0], "map");
  if (!map || map.arguments.length !== 1) return false;
  const source = map.expression.expression;
  if (isSrcDirectoryListing(source)) return isEntryPairCallback(map.arguments[0], true);
  if (ts.isIdentifier(source)) {
    const names = callOf(constInitializer(sourceFile, source.text), "map");
    const param = singleParamArrow(names?.arguments[0]);
    const body = names?.arguments[0]?.body;
    const mapsToName =
      param &&
      body &&
      ts.isPropertyAccessExpression(body) &&
      body.name.text === "name" &&
      ts.isIdentifier(body.expression) &&
      body.expression.text === param;
    return Boolean(
      mapsToName &&
      isSrcDirectoryListing(names.expression.expression) &&
      isEntryPairCallback(map.arguments[0], false)
    );
  }
  return false;
}

function srcDirectoryEntries(pkgDir) {
  const srcDir = join(pkgDir, "src");
  const entries = [];
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = resolve(srcDir, entry.name, "index.ts");
    if (!isFile(file))
      failClassification(`tsup directory entry src/${entry.name}/index.ts does not exist`);
    entries.push({ key: `${entry.name}/index`, file });
  }
  return entries;
}

/**
 * tsup entries from the single tsup config, or `{ allProduction }` when the
 * config copies extra files into dist.
 */
export function tsupEntries(pkgDir, pkg) {
  const configs = TSUP_CONFIG_NAMES.filter((name) => isFile(join(pkgDir, name)));
  const sources = configs.length + (pkg.tsup === undefined ? 0 : 1);
  if (sources !== 1 || configs.length !== 1 || configs[0] === "tsup.config.json") {
    failClassification(
      `expected exactly one tsup.config.{ts,cts,mts,js,cjs,mjs} and no other tsup configuration, found ${configs.join(", ") || "none"}${pkg.tsup === undefined ? "" : " + package.json tsup"}`
    );
  }
  const sourceFile = ts.createSourceFile(
    configs[0],
    readFileSync(join(pkgDir, configs[0]), "utf8"),
    ts.ScriptTarget.Latest,
    true
  );
  const options = findDefineConfig(sourceFile);
  // Only plainly named properties: a spread or computed key could override entry
  // or add a dist-copying option this parser cannot see.
  for (const property of options.properties) {
    const named =
      (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
      propertyName(property) !== undefined;
    if (!named) failClassification("unrecognised tsup config property (spread or computed key)");
  }
  if (options.properties.some((property) => TSUP_DIST_COPY_OPTIONS.has(propertyName(property)))) {
    return { allProduction: true };
  }
  const entryProperties = options.properties.filter(
    (property) => propertyName(property) === "entry"
  );
  if (entryProperties.length > 1) failClassification("tsup config has more than one entry");
  const [entryProperty] = entryProperties;
  if (!entryProperty || !ts.isPropertyAssignment(entryProperty))
    failClassification("tsup config has no entry");
  const init = entryProperty.initializer;
  const entries = [];
  const literal = (node, key) => {
    if (!ts.isStringLiteralLike(node)) failClassification("unrecognised tsup entry form");
    entries.push({ key, file: resolve(pkgDir, node.text) });
  };
  if (ts.isArrayLiteralExpression(init)) {
    for (const element of init.elements) literal(element, undefined);
  } else if (ts.isObjectLiteralExpression(init)) {
    for (const property of init.properties) {
      if (ts.isPropertyAssignment(property) && propertyName(property) !== undefined) {
        literal(property.initializer, propertyName(property));
      } else if (
        ts.isSpreadAssignment(property) &&
        isDirectoryListingEntries(sourceFile, property.expression)
      ) {
        entries.push(...srcDirectoryEntries(pkgDir));
      } else {
        failClassification("unrecognised tsup entry form");
      }
    }
  } else {
    failClassification("unrecognised tsup entry form");
  }
  for (const { file } of entries) {
    if (!isFile(file))
      failClassification(`tsup entry ${relative(resolve(pkgDir), file)} does not exist`);
  }
  return { entries };
}

function sourceForKey(pkgDir, key) {
  return [`${key}.ts`, `${key}.tsx`].map((name) => resolve(pkgDir, "src", name)).find(isFile);
}

const escapeRegExp = (text) => text.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

/**
 * Sources matching an export target pattern under Node's subpath-pattern rules:
 * `*` matches any string (including `/`), and every `*` in the target takes the
 * same value. Matched against every source path under src/ — conservative,
 * since a match may name a file the build does not emit.
 */
function patternMatches(pkgDir, keyPattern) {
  // First `*` captures; every later `*` must repeat that exact capture (\1).
  const source = keyPattern
    .split("*")
    .map(escapeRegExp)
    .reduce((acc, part, i) => acc + (i === 1 ? "(.+)" : "\\1") + part);
  const matcher = new RegExp(`^${source}$`);
  const matches = [];
  for (const file of listWatchedFiles(pkgDir)) {
    if (!/\.tsx?$/.test(file) || file.endsWith(".d.ts")) continue;
    const stem = relative(join(pkgDir, "src"), file)
      .split("\\")
      .join("/")
      .replace(/\.tsx?$/, "");
    const match = matcher.exec(stem);
    if (match) matches.push({ value: match[1], file: resolve(file) });
  }
  return matches;
}

/** Source files behind a tsup package's `exports` targets under ./dist/, keyed by self specifier. */
function exportEntries(pkgDir, pkg) {
  const entries = [];
  for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
    if (subpath === "./package.json") continue;
    if (value === null || typeof value !== "object") {
      failClassification(`export "${subpath}" has no recognised condition`);
    }
    for (const [condition, target] of Object.entries(value)) {
      if (!EXPORT_CONDITIONS.has(condition)) {
        failClassification(`export "${subpath}" uses unknown condition "${condition}"`);
      }
      if (typeof target !== "string" || !target.startsWith("./dist/")) {
        failClassification(`export "${subpath}" target ${String(target)} is outside ./dist/`);
      }
      const pattern =
        /\.d\.(mts|cts|ts)$/.test(target) && condition === "types"
          ? /\.d\.(mts|cts|ts)$/
          : /\.(mjs|cjs|js)$/;
      const key = target.slice("./dist/".length).replace(pattern, "");
      const selfSub = subpath === "." ? "" : subpath.slice(2);
      const keyStars = subpath.split("*").length - 1;
      if (keyStars > 1) failClassification(`export "${subpath}" has more than one * in its key`);
      if ((keyStars === 1) !== key.includes("*")) {
        failClassification(
          `export "${subpath}" target ${target}: * must appear in both key and target`
        );
      }
      if (keyStars === 1) {
        const matches = patternMatches(pkgDir, key);
        if (matches.length === 0) {
          failClassification(`export "${subpath}" target ${target} matches no source file`);
        }
        for (const { value, file } of matches) {
          // split/join: literal substitution, no `$` replacement patterns.
          entries.push({ self: selfSub.split("*").join(value), file });
        }
      } else {
        const file = sourceForKey(pkgDir, key);
        if (!file)
          failClassification(`export "${subpath}" target ${target} maps to no source file`);
        entries.push({ self: selfSub, file });
      }
    }
  }
  return entries;
}

let cachedSfcParser;

function defaultLoadSfcParser() {
  if (!cachedSfcParser) {
    const vuePackage = fileURLToPath(new URL("../../packages/vue/package.json", import.meta.url));
    cachedSfcParser = createRequire(vuePackage)("vue/compiler-sfc");
  }
  return cachedSfcParser;
}

function scriptText(file, loadSfcParser) {
  const text = readFileSync(file, "utf8");
  if (!file.endsWith(".vue")) return text;
  let parser;
  try {
    parser = loadSfcParser();
  } catch (error) {
    failClassification(`SFC parser (vue/compiler-sfc) could not be loaded: ${error.message}`);
  }
  const { descriptor, errors } = parser.parse(text, { filename: file });
  if (errors.length)
    failClassification(`${file}: SFC parse error: ${errors[0].message ?? errors[0]}`);
  const blocks = [descriptor.script, descriptor.scriptSetup].filter(Boolean);
  for (const block of blocks) {
    if (block.src) failClassification(`${file}: <script src> is not supported`);
    if (!SFC_LANGS.has(block.lang))
      failClassification(`${file}: unsupported <script lang="${block.lang}">`);
  }
  return blocks.map((block) => block.content).join("\n");
}

const isLiteralArg = (node) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node));

const isImportMeta = (node) =>
  ts.isMetaProperty(node) &&
  node.keywordToken === ts.SyntaxKind.ImportKeyword &&
  node.name.text === "meta";

function assertStaticLoads(file, text) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        !isLiteralArg(node.arguments[0])
      ) {
        failClassification(`${file}: non-literal dynamic import()`);
      }
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        !isLiteralArg(node.arguments[0])
      ) {
        failClassification(`${file}: non-literal require()`);
      }
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "glob" &&
      isImportMeta(node.expression)
    ) {
      failClassification(`${file}: import.meta.glob is not supported`);
    }
    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "URL" &&
      node.arguments?.[1] &&
      ts.isPropertyAccessExpression(node.arguments[1]) &&
      node.arguments[1].name.text === "url" &&
      isImportMeta(node.arguments[1].expression)
    ) {
      failClassification(`${file}: new URL(…, import.meta.url) is not supported`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

function resolveRelative(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [base, ...RESOLVE_SUFFIXES.map((suffix) => base + suffix)];
  if (/\.m?js$/.test(base)) {
    const stem = base.replace(/\.m?js$/, "");
    candidates.push(`${stem}.ts`, `${stem}.tsx`);
  }
  return candidates.find(isFile);
}

/** Files reachable from `entries` through static, type-only, re-export, dynamic and reference edges. */
export function reachable(entries, { pkgName, selfMap, loadSfcParser = defaultLoadSfcParser }) {
  const seen = new Set();
  const stack = [...entries];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = scriptText(file, loadSfcParser);
    assertStaticLoads(file, text);
    const info = ts.preProcessFile(text, true, true);
    for (const { fileName } of info.importedFiles) {
      if (fileName.startsWith(".") || fileName.startsWith("/")) {
        if (ASSET_PATTERN.test(fileName)) continue;
        const target = resolveRelative(file, fileName);
        if (!target) failClassification(`${file}: cannot resolve "${fileName}"`);
        stack.push(target);
      } else if (pkgName && (fileName === pkgName || fileName.startsWith(`${pkgName}/`))) {
        const target = selfMap.get(fileName === pkgName ? "" : fileName.slice(pkgName.length + 1));
        if (!target)
          failClassification(`${file}: cannot resolve self-package specifier "${fileName}"`);
        stack.push(target);
      }
    }
    for (const { fileName } of info.referencedFiles) {
      const target = resolveRelative(file, fileName);
      if (!target) failClassification(`${file}: cannot resolve reference path "${fileName}"`);
      stack.push(target);
    }
  }
  return seen;
}

/**
 * Non-.d.ts files of a tsc/vue-tsc program that emits output (JS and/or
 * declarations); a `noEmit` program distributes nothing.
 */
export function declarationFiles(pkgDir, program) {
  const configPath = resolve(pkgDir, program.project);
  if (!isFile(configPath))
    failClassification(`${program.tool} project ${program.project} does not exist`);
  const host = {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) =>
      failClassification(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")),
  };
  const extraFileExtensions =
    program.tool === "vue-tsc"
      ? [{ extension: ".vue", isMixedContent: true, scriptKind: ts.ScriptKind.Deferred }]
      : undefined;
  const optionsToExtend = program.declaration ? { declaration: true } : {};
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    optionsToExtend,
    host,
    undefined,
    undefined,
    extraFileExtensions
  );
  if (!parsed) failClassification(`${program.tool} project ${program.project} could not be parsed`);
  const configErrors = parsed.errors.filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (configErrors.length) {
    failClassification(
      `${program.tool} project ${program.project}: ${ts.flattenDiagnosticMessageText(configErrors[0].messageText, "\n")}`
    );
  }
  if (parsed.options.noEmit) return new Set();
  return new Set(
    parsed.fileNames.filter((file) => !file.endsWith(".d.ts")).map((file) => resolve(file))
  );
}

function allProduction(watched) {
  return { production: new Set(watched), excluded: new Set() };
}

function classify(pkgDir, options) {
  const watched = listWatchedFiles(pkgDir);
  const packageJsonPath = join(pkgDir, "package.json");
  if (!isFile(packageJsonPath)) return allProduction(watched);
  const pkg = readJson(packageJsonPath);
  const build = pkg.scripts?.build;
  if (!build) return allProduction(watched);
  const steps = parseBuildScript(build);
  if (!steps) return allProduction(watched);
  // Published content beyond dist (an absent `files`, or one naming src or a
  // glob) can ship watched source directly.
  if (!Array.isArray(pkg.files) || pkg.files.some((entry) => !SAFE_PUBLISHED_FILES.test(entry))) {
    return allProduction(watched);
  }

  const entries = [];
  const selfMap = new Map();
  if (steps.ngPackagr) {
    if (ngConfigsCopyAssets(pkgDir)) return allProduction(watched);
    const ng = ngEntries(pkgDir, steps.ngPackagr);
    entries.push(...ng.entries);
    for (const [key, file] of ng.selfMap) selfMap.set(key, file);
  }
  if (steps.tsup) {
    const tsup = tsupEntries(pkgDir, pkg);
    if (tsup.allProduction) return allProduction(watched);
    for (const { key, file } of tsup.entries) {
      entries.push(file);
      if (key?.endsWith("/index")) selfMap.set(key.slice(0, -"/index".length), file);
      if (key === "index") selfMap.set("", file);
    }
    for (const { self, file } of exportEntries(pkgDir, pkg)) {
      entries.push(file);
      selfMap.set(self, file);
    }
    if (entries.length === 0) failClassification("tsup build has zero entries");
  }

  // Emitting tsc/vue-tsc programs also emit output for files their roots import
  // (tsconfig `exclude` filters only the root set), so program files seed the walk.
  for (const program of steps.tscPrograms) entries.push(...declarationFiles(pkgDir, program));
  const distributed = reachable(entries, { pkgName: pkg.name, selfMap, ...options });

  // Each watched file lands in exactly one set, so the partition holds by construction.
  const production = new Set();
  const excluded = new Set();
  for (const file of watched) {
    (distributed.has(resolve(file)) ? production : excluded).add(file);
  }
  return { production, excluded };
}

/**
 * Classifies every watched file of `pkgDir`. Returns `{ production, excluded }`
 * (paths joined onto `pkgDir`) or `{ error }`.
 */
export function classifyPackage(pkgDir, options = {}) {
  try {
    return classify(pkgDir, options);
  } catch (error) {
    if (error instanceof ClassificationError) return { error: error.message };
    return { error: `unexpected classifier failure: ${error.message}` };
  }
}
