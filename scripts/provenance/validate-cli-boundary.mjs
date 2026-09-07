#!/usr/bin/env node
// scripts/provenance/validate-cli-boundary.mjs
//
// Proves the spec's required @ultimate/cli dependency direction holds in
// both directions:
//   - Reverse: packages/{ng,react,vue}* must never import or depend on
//     @ultimate/cli.
//   - Forward: @ultimate/cli must never depend on or import any other
//     Ultimate runtime package (@ultimate/ng, @ultimate/react,
//     @ultimate/vue, @ultimate/themes) as a code dependency.
//
// This is deliberately a sibling script to validate-boundaries.mjs (which
// is scoped to packages/uix*'s framework-neutrality concern) rather than a
// widening of it — see task-9-brief.md for the reasoning.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FRAMEWORK_PACKAGE_PREFIXES = ["ng", "react", "vue"];
const CLI_PACKAGE_NAME = "@ultimate/cli";
const FORWARD_FORBIDDEN_PACKAGES = [
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate:cli] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate:cli] OK: ${message}`);
}

// Only the bare `import "pkg"` and `from "pkg"` patterns are anchored to
// line-start (only leading whitespace before them), matching
// validate-boundaries.mjs's own convention for its bare-`import` pattern.
// This is the minimal fix for the one real false positive found during
// review: packages/cli/src/commands/theme.ts embeds a `from "@ultimate/
// themes"`-shaped substring mid-line inside an unrelated string literal (a
// code-generation template written into a *target* project's file, not a
// real import of the CLI itself). `require(...)` and dynamic `import(...)`
// never had that false-positive problem and are deliberately left
// unanchored so they still match their normal assigned form, e.g.
// `const x = require("pkg")` or `const m = await import("pkg")`, where the
// line does not start with `require`/`import`.
function importPatternsFor(pkgName) {
  const escaped = pkgName.replace(/[/]/g, "\\/");
  return [
    new RegExp(`^\\s*import\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`^\\s*(?:export\\s+)?import\\b[^;\\n]*\\sfrom\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`require\\(["']${escaped}(["'/])`),
    new RegExp(`import\\(["']${escaped}(["'/])`),
  ];
}

function findDirsByPrefixes(root, prefixes) {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  return readdirSync(root)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .map((name) => join(root, name));
}

function walk(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function scanFilesForImports(files, pkgNames) {
  const violations = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const pkgName of pkgNames) {
      for (const pattern of importPatternsFor(pkgName)) {
        if (pattern.test(content)) {
          violations.push({ file, pkgName, pattern });
        }
      }
    }
  }
  return violations;
}

let violations = 0;

// Check 1: reverse-direction, source imports.
// packages/{ng,react,vue}*/src/**/* must never import @ultimate/cli.
const frameworkDirs = findDirsByPrefixes("packages", FRAMEWORK_PACKAGE_PREFIXES);
for (const dir of frameworkDirs) {
  const srcDir = join(dir, "src");
  const files = walk(srcDir);
  const found = scanFilesForImports(files, [CLI_PACKAGE_NAME]);
  for (const { file, pattern } of found) {
    console.error(
      `[boundary:validate:cli] VIOLATION: ${file} imports ${CLI_PACKAGE_NAME} (matched ${pattern}) — reverse-direction violation`
    );
    violations++;
  }
}

// Check 2: reverse-direction, package.json dependencies.
// packages/{ng,react,vue}*/package.json's "dependencies" must never list
// @ultimate/cli. devDependencies are out of scope (see brief).
for (const dir of frameworkDirs) {
  const pkgJsonPath = join(dir, "package.json");
  if (!statSync(pkgJsonPath, { throwIfNoEntry: false })) continue;
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  if (Object.prototype.hasOwnProperty.call(deps, CLI_PACKAGE_NAME)) {
    console.error(
      `[boundary:validate:cli] VIOLATION: ${pkgJsonPath} declares "dependencies" on ${CLI_PACKAGE_NAME} — reverse-direction violation`
    );
    violations++;
  }
}

// Check 3: forward-direction, package.json dependencies + devDependencies.
// packages/cli/package.json must never list @ultimate/ng, @ultimate/react,
// @ultimate/vue, or @ultimate/themes in either field.
const cliPkgJsonPath = join("packages", "cli", "package.json");
if (statSync(cliPkgJsonPath, { throwIfNoEntry: false })) {
  const pkg = JSON.parse(readFileSync(cliPkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  for (const forbidden of FORWARD_FORBIDDEN_PACKAGES) {
    if (Object.prototype.hasOwnProperty.call(deps, forbidden)) {
      console.error(
        `[boundary:validate:cli] VIOLATION: ${cliPkgJsonPath} declares "dependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
    if (Object.prototype.hasOwnProperty.call(devDeps, forbidden)) {
      console.error(
        `[boundary:validate:cli] VIOLATION: ${cliPkgJsonPath} declares "devDependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
  }
}

// Check 4: forward-direction, source imports.
// packages/cli/src/**/* must never import @ultimate/ng, @ultimate/react,
// @ultimate/vue, or @ultimate/themes.
const cliSrcDir = join("packages", "cli", "src");
const cliFiles = walk(cliSrcDir);
const cliFound = scanFilesForImports(cliFiles, FORWARD_FORBIDDEN_PACKAGES);
for (const { file, pkgName, pattern } of cliFound) {
  console.error(
    `[boundary:validate:cli] VIOLATION: ${file} imports ${pkgName} (matched ${pattern}) — forward-direction violation`
  );
  violations++;
}

if (violations > 0) {
  fail(`${violations} CLI dependency-direction violation(s) found`);
}

pass(
  `scanned ${frameworkDirs.length} framework package(s) and packages/cli — zero CLI dependency-direction violations`
);
process.exit(0);
