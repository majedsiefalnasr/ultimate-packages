#!/usr/bin/env node
// scripts/provenance/generate-manifest.mjs
//
// Walks a packages/uix-*/src/ tree and writes docs/architecture/provenance/<name>.json,
// one entry per .ts file, defaulting modificationStatus based on whether
// scripts/provenance/adapt-imports.mjs touched the file (detected by checking
// for an @ultimate/uix- import that would only exist post-adaptation).
//
// Usage: node generate-manifest.mjs <package-dir> <package-name>
// Example: node generate-manifest.mjs packages/uix-utils uix-utils

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const [, , packageDir, packageName] = process.argv;

if (!packageDir || !packageName) {
  console.error("Usage: generate-manifest.mjs <package-dir> <package-name>");
  process.exit(1);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = join(packageDir, "src");
const files = walk(srcDir);

const entries = files.map((file) => {
  const content = readFileSync(file, "utf8");
  const relPath = relative(packageDir, file);
  const modified = /@ultimate\/uix-/.test(content);
  return {
    originalPath: relPath.replace(/^src\//, "src/"),
    ultimateDestination: relative(process.cwd(), file),
    modificationStatus: modified ? "import-path-adapted" : "unmodified",
    modificationDescription: modified
      ? "cross-package @primeuix/* import specifiers rewritten to @ultimate/uix-* via scripts/provenance/adapt-imports.mjs"
      : "none",
  };
});

mkdirSync("docs/architecture/provenance", { recursive: true });
const outPath = join("docs/architecture/provenance", `${packageName}.json`);
writeFileSync(outPath, JSON.stringify(entries, null, 2) + "\n");
console.log(`[generate-manifest] wrote ${entries.length} entries to ${outPath}`);
