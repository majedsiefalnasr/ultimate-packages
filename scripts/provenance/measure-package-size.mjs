#!/usr/bin/env node
// scripts/provenance/measure-package-size.mjs
//
// Records dist size, gzip size, and file count for each packages/uix-* and
// packages/ng* package, for the Phase 1/Phase 2 performance baselines
// (docs/architecture/PERFORMANCE.md). Not a CI gate — a one-shot measurement
// script, per the Phase 1 spec's "record measurable baselines for later
// comparison, do not optimize prematurely" requirement.

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Matches scripts/provenance/validate-provenance.mjs's
// MANIFEST_WATCHED_PREFIXES pattern (kept as a local literal rather than a
// shared constant — only 2 scripts need this list so far, per YAGNI).
const PACKAGE_PREFIXES = ["uix", "ng"];

function findUixPackages(root = "packages") {
  return readdirSync(root)
    .filter(
      (name) => PACKAGE_PREFIXES.some((prefix) => name.startsWith(prefix)) && name !== "uix"
    )
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

// Resolves each package's barrel entry file from its own root package.json
// rather than assuming a fixed `dist/index.mjs` path — uix-* packages (tsup)
// publish `dist/index.mjs`, but ng/ng-core (ng-packagr) publish
// `dist/fesm2022/<name>.mjs` and declare it via `module`/`main`.
function barrelGzipSize(pkgPath) {
  const pkgJson = JSON.parse(readFileSync(join(pkgPath, "package.json"), "utf8"));
  const entryRelPath = pkgJson.module ?? pkgJson.main ?? "dist/index.mjs";
  const content = readFileSync(join(pkgPath, entryRelPath));
  return gzipSync(content).length;
}

console.log("| Package | dist/ size | dist/ file count | index.mjs gzip size |");
console.log("|---|---|---|---|");

for (const pkgPath of findUixPackages()) {
  const distDir = join(pkgPath, "dist");
  const { bytes, fileCount } = dirSizeBytes(distDir);
  const gzip = barrelGzipSize(pkgPath);
  console.log(
    `| ${pkgPath} | ${(bytes / 1024).toFixed(1)} KB | ${fileCount} | ${(gzip / 1024).toFixed(2)} KB |`
  );
}
