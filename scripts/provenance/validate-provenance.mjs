#!/usr/bin/env node
// scripts/provenance/validate-provenance.mjs
//
// Validates that docs/architecture/PROVENANCE.md exists and contains an
// entry for each package area that carries Prime-derived source. In CI,
// also checks that any PR touching packages/{uix,ng,react,vue}* includes
// a PROVENANCE.md update in the same diff.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

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

const baseRefIndex = process.argv.indexOf("--base-ref");
const baseRef = baseRefIndex !== -1 ? process.argv[baseRefIndex + 1] : null;

if (baseRef) {
  let changedFiles = [];
  try {
    changedFiles = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch (err) {
    fail(`could not compute git diff against ${baseRef}: ${err.message}`);
  }

  const touchesWatchedPath = changedFiles.some((f) =>
    WATCHED_PATH_PREFIXES.some((prefix) => f.startsWith(prefix))
  );
  const touchesProvenance = changedFiles.includes(PROVENANCE_PATH);

  if (touchesWatchedPath && !touchesProvenance) {
    fail(`diff touches a Prime-derived package path but does not update ${PROVENANCE_PATH}`);
  }
  pass(`diff check against ${baseRef} passed`);
}

// Manifest completeness: every .ts/.tsx file under packages/{uix,ng,react}-*/src/ must have
// a corresponding entry in docs/architecture/provenance/<package-name>.json.
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react"];

function findWatchedPackageDirs(root = "packages") {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => MANIFEST_WATCHED_PREFIXES.some((prefix) => name.startsWith(prefix)))
    .map((name) => ({ name, path: join(root, name) }))
    .filter(({ path }) => statSync(path).isDirectory());
}

function walkTsFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, files);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

const watchedPackages = findWatchedPackageDirs();
for (const { name, path } of watchedPackages) {
  const manifestPath = join("docs/architecture/provenance", `${name}.json`);
  const srcFiles = walkTsFiles(join(path, "src"));

  if (srcFiles.length === 0) continue;

  if (!existsSync(manifestPath)) {
    fail(`${path} has source files but no manifest at ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const manifestPaths = new Set(manifest.map((entry) => entry.ultimateDestination));

  for (const file of srcFiles) {
    if (!manifestPaths.has(file)) {
      fail(`${file} has no entry in ${manifestPath}`);
    }
  }
  pass(`${name}: all ${srcFiles.length} source file(s) have manifest entries`);
}

console.log("[provenance:validate] all checks passed");
process.exit(0);
