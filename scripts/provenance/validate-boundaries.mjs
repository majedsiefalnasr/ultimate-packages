#!/usr/bin/env node
// scripts/provenance/validate-boundaries.mjs
//
// Fails if any file under packages/uix* imports a framework-specific
// package (Angular, React, or Vue). UIX packages must remain
// framework-neutral per Blueprint §5 (Shared UIX Packages) and
// spec Repository Requirements.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const UIX_PREFIX = "packages/uix";
const FRAMEWORK_IMPORT_PATTERNS = [
  /from\s+["']@angular\//,
  /from\s+["']react(["'/])/,
  /from\s+["']react-dom(["'/])/,
  /from\s+["']vue(["'/])/,
  /require\(["']@angular\//,
  /require\(["']react(["'/])/,
  /require\(["']vue(["'/])/,
  /import\(["']@angular\//,
  /import\(["']react(["'/])/,
  /import\(["']vue(["'/])/,
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate] OK: ${message}`);
}

function findUixDirs(root = "packages") {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  return readdirSync(root)
    .filter((name) => name.startsWith("uix"))
    .map((name) => join(root, name));
}

function walk(dir, files = []) {
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

const uixDirs = findUixDirs();
if (uixDirs.length === 0) {
  pass("no packages/uix* directories exist yet — nothing to validate");
  process.exit(0);
}

let violations = 0;
for (const dir of uixDirs) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    for (const pattern of FRAMEWORK_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        console.error(
          `[boundary:validate] VIOLATION: ${file} imports a framework-specific package (matched ${pattern})`
        );
        violations++;
      }
    }
  }
}

if (violations > 0) {
  fail(`${violations} framework-specific import(s) found in packages/uix*`);
}

pass(`scanned ${uixDirs.length} uix package(s), zero framework-specific imports found`);
process.exit(0);
