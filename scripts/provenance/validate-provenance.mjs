#!/usr/bin/env node
// scripts/provenance/validate-provenance.mjs
//
// Validates that docs/architecture/PROVENANCE.md exists and contains an
// entry for each package area that carries Prime-derived source. In CI,
// also checks that a source-affecting PR diff in the watched package families
// includes a PROVENANCE.md update in the same diff.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { TextDecoder } from "node:util";
import { classifyPackage, listWatchedFiles } from "./production-scope.mjs";
import { parseKnownMissing, compareKnownMissing } from "./known-missing.mjs";

const PROVENANCE_PATH = "docs/architecture/PROVENANCE.md";
const REQUIRED_HEADINGS = [
  "PrimeNG",
  "PrimeVue",
  "PrimeReact",
  "@primeuix/utils",
  "@primeuix/styled",
  "@primeuix/styles",
  "@primeuix/motion",
];
const WATCHED_PATH_PREFIXES = ["packages/uix", "packages/ng", "packages/react", "packages/vue"];
const TOOLING_CONFIG_PATHS = new Set([
  "packages/react/vitest.config.ts",
  "packages/vue/vitest.config.ts",
]);

function fail(message) {
  console.error(`[provenance:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[provenance:validate] OK: ${message}`);
}

if (!existsSync(PROVENANCE_PATH)) {
  fail(`${PROVENANCE_PATH} does not exist`);
}

const content = readFileSync(PROVENANCE_PATH, "utf8");
const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

for (const required of REQUIRED_HEADINGS) {
  if (!headings.includes(required)) {
    fail(`missing required PROVENANCE.md entry: "${required}"`);
  }
}
pass(`all ${REQUIRED_HEADINGS.length} required baseline entries present`);

function gitOutput(args, description) {
  try {
    return execFileSync("git", args, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    fail(`${description}: ${err.message}`);
  }
}

function decodeGitOutput(output, description) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(output);
  } catch {
    fail(`${description}: invalid UTF-8`);
  }
}

function validRepositoryPath(path) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").some((part) => part === "" || part === "." || part === "..")
  );
}

function changedPathsFromDiff(baseCommit) {
  const output = gitOutput(
    [
      "diff",
      "--name-status",
      "-z",
      "--find-renames",
      "--no-ext-diff",
      "--no-textconv",
      `${baseCommit}...HEAD`,
    ],
    "could not compute git diff"
  );
  if (output.length === 0) return [];
  if (output.at(-1) !== 0) fail("malformed git diff: missing final NUL");

  const fields = decodeGitOutput(output, "malformed git diff").split("\0");
  fields.pop();
  const paths = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index++];
    const pathCount = /^R\d{1,3}$/.test(status) ? 2 : /^[AMDT]$/.test(status) ? 1 : 0;
    if (pathCount === 0 || fields.length - index < pathCount) {
      fail(`malformed git diff: unsupported or incomplete status ${JSON.stringify(status)}`);
    }
    for (let number = 0; number < pathCount; number++) {
      const path = fields[index++];
      if (!validRepositoryPath(path)) {
        fail(`malformed git diff: unclassifiable path ${JSON.stringify(path)}`);
      }
      paths.push(path);
    }
  }
  return paths;
}

function manifestDestinations(packageName, cache) {
  if (cache.has(packageName)) return cache.get(packageName);
  const manifestPath = join("docs/architecture/provenance", `${packageName}.json`);
  if (!existsSync(manifestPath)) fail(`cannot classify watched package without ${manifestPath}`);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    fail(`cannot classify watched package: invalid ${manifestPath}: ${err.message}`);
  }
  if (
    !Array.isArray(manifest) ||
    manifest.some((entry) => !entry || !validRepositoryPath(entry.ultimateDestination ?? ""))
  ) {
    fail(`cannot classify watched package: invalid destinations in ${manifestPath}`);
  }
  const destinations = new Set(manifest.map((entry) => entry.ultimateDestination));
  cache.set(packageName, destinations);
  return destinations;
}

function requiresProvenance(path, cache) {
  if (!WATCHED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  const [, packageName, ...insidePackage] = path.split("/");
  if (!packageName || insidePackage.length === 0) {
    fail(`cannot classify watched path ${JSON.stringify(path)}`);
  }
  if (insidePackage[0] === "src") return true;
  // Only an exempt config's classification depends on the manifest; every other
  // watched path requires provenance whether or not its package has a manifest.
  if (!TOOLING_CONFIG_PATHS.has(path)) return true;
  return manifestDestinations(packageName, cache).has(path);
}

const baseRefIndex = process.argv.indexOf("--base-ref");
if (baseRefIndex !== -1) {
  const baseRef = process.argv[baseRefIndex + 1];
  if (!baseRef) fail("--base-ref requires a value");
  const resolvedBase = decodeGitOutput(
    gitOutput(
      ["rev-parse", "--verify", "--end-of-options", `${baseRef}^{commit}`],
      "invalid --base-ref"
    ),
    "invalid --base-ref"
  ).trim();
  if (!/^[0-9a-f]{40,64}$/i.test(resolvedBase)) fail("invalid --base-ref: expected one commit SHA");

  const changedPaths = changedPathsFromDiff(resolvedBase);
  const cache = new Map();
  let needsProvenance = false;
  for (const path of changedPaths) {
    if (requiresProvenance(path, cache)) needsProvenance = true;
  }
  if (needsProvenance && !changedPaths.includes(PROVENANCE_PATH)) {
    fail(`source-affecting or unclassified watched path does not update ${PROVENANCE_PATH}`);
  }
  pass(`diff check against ${baseRef} passed`);
}

// Manifest completeness (ADR-062): every production file — one the package's
// own build distributes, classified from build evidence by production-scope.mjs
// — under packages/{uix,ng,react,vue,themes}*/src/ must have an entry in
// docs/architecture/provenance/<package-name>.json. Every problem is collected
// and reported before the exit code is set.
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react", "vue", "themes"];

function findWatchedPackageDirs(root = "packages") {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => MANIFEST_WATCHED_PREFIXES.some((prefix) => name.startsWith(prefix)))
    .map((name) => ({ name, path: join(root, name) }))
    .filter(({ path }) => statSync(path).isDirectory());
}

function readManifestPaths(manifestPath) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!Array.isArray(manifest)) return { error: "is not a JSON array" };
    return { paths: new Set(manifest.map((entry) => entry?.ultimateDestination)) };
  } catch (err) {
    return { error: `is invalid: ${err.message}` };
  }
}

// Ratchet (ADR-072): with --known-missing <path>, a missing entry is excused only
// when the committed list names it, and a listed file that is no longer missing
// fails, so the list only shrinks. Without the flag nothing below changes.
const knownMissingIndex = process.argv.indexOf("--known-missing");
let knownMissing = null;
let knownMissingPath = null;
if (knownMissingIndex !== -1) {
  knownMissingPath = process.argv[knownMissingIndex + 1];
  if (!knownMissingPath || knownMissingPath.startsWith("--")) {
    fail("--known-missing requires a value");
  }
  if (!existsSync(knownMissingPath)) fail(`known-missing list ${knownMissingPath} does not exist`);
  let text;
  try {
    text = readFileSync(knownMissingPath, "utf8");
  } catch (err) {
    fail(`known-missing list ${knownMissingPath} is unreadable: ${err.message}`);
  }
  const parsed = parseKnownMissing(text);
  if (!parsed.ok) fail(`known-missing list ${knownMissingPath}: ${parsed.error}`);
  knownMissing = parsed.list;
}
// Packages whose missing set was computed, or that failed for another reason.
// A list key for a package that failed otherwise is not compared: its missing
// set is unknown, and the other failure is already reported.
const comparedPackages = new Set();
const erroredPackages = new Set();
let knownRemaining = 0;

const failures = [];
for (const { name, path } of findWatchedPackageDirs()) {
  if (listWatchedFiles(path).length === 0) {
    comparedPackages.add(name);
    continue;
  }
  const scope = classifyPackage(path);
  if (scope.error) {
    erroredPackages.add(name);
    failures.push(`${name}: classifier error: ${scope.error}`);
    continue;
  }
  const counts = `production=${scope.production.size} excluded=${scope.excluded.size}`;
  if (scope.production.size === 0) {
    comparedPackages.add(name);
    pass(`${name}: ${counts} missing=0`);
    continue;
  }

  const manifestPath = join("docs/architecture/provenance", `${name}.json`);
  if (!existsSync(manifestPath)) {
    erroredPackages.add(name);
    failures.push(`${name}: production files but no manifest at ${manifestPath}`);
    continue;
  }
  const manifest = readManifestPaths(manifestPath);
  if (manifest.error) {
    erroredPackages.add(name);
    failures.push(`${name}: manifest ${manifestPath} ${manifest.error}`);
    continue;
  }

  const missing = [...scope.production].filter((file) => !manifest.paths.has(file)).sort();
  comparedPackages.add(name);

  if (knownMissing === null) {
    const summary = `${name}: ${counts} missing=${missing.length}`;
    if (missing.length === 0) pass(summary);
    else console.error(`[provenance:validate] FAIL: ${summary}`);
    for (const file of missing) failures.push(`${file} has no entry in ${manifestPath}`);
    continue;
  }

  const { added, stale, remaining } = compareKnownMissing(
    { [name]: missing },
    { [name]: knownMissing[name] ?? [] }
  );
  knownRemaining += remaining;
  const summary = `${name}: ${counts} missing=${missing.length} known=${remaining} new=${added.length}`;
  if (added.length === 0 && stale.length === 0) pass(summary);
  else console.error(`[provenance:validate] FAIL: ${summary} stale=${stale.length}`);
  for (const file of added) {
    failures.push(`${file} has no entry in ${manifestPath} and is not in the known-missing list`);
  }
  for (const file of stale) {
    failures.push(
      `${file} is listed in ${knownMissingPath} but is no longer missing; remove it from the list`
    );
  }
}

// A list key for a package that was never compared (renamed, removed, or whose
// production set is empty) cannot excuse anything: every line under it is stale.
// Packages that failed for another reason are skipped; that failure is reported.
if (knownMissing !== null) {
  for (const [name, files] of Object.entries(knownMissing)) {
    if (comparedPackages.has(name) || erroredPackages.has(name)) continue;
    for (const file of files) {
      failures.push(
        `${file} is listed in ${knownMissingPath} but package ${name} was not checked; remove it from the list`
      );
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`[provenance:validate] FAIL: ${failure}`);
  console.error(`[provenance:validate] ${failures.length} manifest problem(s)`);
  process.exit(1);
}

console.log("[provenance:validate] all checks passed");
if (knownMissing !== null)
  console.log(`[provenance:validate] known-missing: ${knownRemaining} remaining`);
process.exit(0);
