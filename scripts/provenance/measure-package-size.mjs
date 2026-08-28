#!/usr/bin/env node
// scripts/provenance/measure-package-size.mjs
//
// Records dist size, gzip size, and file count for each packages/uix-*
// package, for the Phase 1 performance baseline (docs/architecture/PERFORMANCE.md).
// Not a CI gate — a one-shot measurement script, per the Phase 1 spec's
// "record measurable baselines for later comparison, do not optimize
// prematurely" requirement.

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

function findUixPackages(root = "packages") {
  return readdirSync(root)
    .filter((name) => name.startsWith("uix") && name !== "uix")
    .map((name) => join(root, name));
}

function dirSizeBytes(dir) {
  let total = 0;
  let fileCount = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = dirSizeBytes(full);
      total += sub.bytes;
      fileCount += sub.fileCount;
    } else {
      total += statSync(full).size;
      fileCount++;
    }
  }
  return { bytes: total, fileCount };
}

function barrelGzipSize(distDir) {
  const barrelPath = join(distDir, "index.mjs");
  const content = readFileSync(barrelPath);
  return gzipSync(content).length;
}

console.log("| Package | dist/ size | dist/ file count | index.mjs gzip size |");
console.log("|---|---|---|---|");

for (const pkgPath of findUixPackages()) {
  const distDir = join(pkgPath, "dist");
  const { bytes, fileCount } = dirSizeBytes(distDir);
  const gzip = barrelGzipSize(distDir);
  console.log(
    `| ${pkgPath} | ${(bytes / 1024).toFixed(1)} KB | ${fileCount} | ${(gzip / 1024).toFixed(2)} KB |`
  );
}
