#!/usr/bin/env node
// scripts/provenance/validate-ai-boundary.mjs
//
// Direct structural sibling of validate-mcp-boundary.mjs (Phase 8), applied
// to @ultimate/ai per the approved Phase 9 spec §4/§10.1, proving:
//   - Reverse: packages/{ng,react,vue}* must never import or depend on
//     @ultimate/ai.
//   - Forward: @ultimate/ai must never depend on or import @ultimate/cli,
//     @ultimate/mcp, or any of @ultimate/ng, @ultimate/react, @ultimate/vue,
//     @ultimate/themes.
//
// Deliberately a sibling script, not a widening of validate-cli-boundary.mjs
// or validate-mcp-boundary.mjs — matches the exact precedent both of those
// scripts already set for themselves.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FRAMEWORK_PACKAGE_PREFIXES = ["ng", "react", "vue"];
const AI_PACKAGE_NAME = "@ultimate/ai";
const FORWARD_FORBIDDEN_PACKAGES = [
  "@ultimate/cli",
  "@ultimate/mcp",
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate:ai] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate:ai] OK: ${message}`);
}

function importPatternsFor(pkgName) {
  const escaped = pkgName.replace(/[/]/g, "\\/");
  return [
    new RegExp(`^\\s*import\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`^\\s*(?:import|export)\\b[\\s\\S]{0,200}?\\sfrom\\s+["']${escaped}(["'/])`, "m"),
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
const frameworkDirs = findDirsByPrefixes("packages", FRAMEWORK_PACKAGE_PREFIXES);
for (const dir of frameworkDirs) {
  const srcDir = join(dir, "src");
  const files = walk(srcDir);
  const found = scanFilesForImports(files, [AI_PACKAGE_NAME]);
  for (const { file, pattern } of found) {
    console.error(
      `[boundary:validate:ai] VIOLATION: ${file} imports ${AI_PACKAGE_NAME} (matched ${pattern}) — reverse-direction violation`
    );
    violations++;
  }
}

// Check 2: reverse-direction, package.json dependencies.
for (const dir of frameworkDirs) {
  const pkgJsonPath = join(dir, "package.json");
  if (!statSync(pkgJsonPath, { throwIfNoEntry: false })) continue;
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  if (Object.prototype.hasOwnProperty.call(deps, AI_PACKAGE_NAME)) {
    console.error(
      `[boundary:validate:ai] VIOLATION: ${pkgJsonPath} declares "dependencies" on ${AI_PACKAGE_NAME} — reverse-direction violation`
    );
    violations++;
  }
}

// Check 3: forward-direction, package.json dependencies + devDependencies.
const aiPkgJsonPath = join("packages", "ai", "package.json");
if (statSync(aiPkgJsonPath, { throwIfNoEntry: false })) {
  const pkg = JSON.parse(readFileSync(aiPkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  for (const forbidden of FORWARD_FORBIDDEN_PACKAGES) {
    if (Object.prototype.hasOwnProperty.call(deps, forbidden)) {
      console.error(
        `[boundary:validate:ai] VIOLATION: ${aiPkgJsonPath} declares "dependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
    if (Object.prototype.hasOwnProperty.call(devDeps, forbidden)) {
      console.error(
        `[boundary:validate:ai] VIOLATION: ${aiPkgJsonPath} declares "devDependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
  }
}

// Check 4: forward-direction, source imports.
const aiSrcDir = join("packages", "ai", "src");
const aiFiles = walk(aiSrcDir);
const aiFound = scanFilesForImports(aiFiles, FORWARD_FORBIDDEN_PACKAGES);
for (const { file, pkgName, pattern } of aiFound) {
  console.error(
    `[boundary:validate:ai] VIOLATION: ${file} imports ${pkgName} (matched ${pattern}) — forward-direction violation`
  );
  violations++;
}

if (violations > 0) {
  fail(`${violations} AI dependency-direction violation(s) found`);
}

pass(
  `scanned ${frameworkDirs.length} framework package(s) and packages/ai — zero AI dependency-direction violations`
);
process.exit(0);
