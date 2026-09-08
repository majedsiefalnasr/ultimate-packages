#!/usr/bin/env node
// scripts/provenance/measure-package-size.mjs
//
// Records dist size, gzip size, and file count for each publishable
// package's dist/ output, for the performance baselines
// (docs/architecture/PERFORMANCE.md). Not a CI gate on its own — a
// measurement script (also imported by validate-bundle-size.mjs, which
// gates on the numbers it produces), per the Blueprint's performance
// strategy ("do not optimize based on assumptions; establish benchmarks").

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Explicit, exhaustive list of all 17 publishable packages (the `uix`
// umbrella package itself is not published/measured). Replaces the prior
// prefix-based filter (`["uix", "ng"]`) now that the scope includes
// packages sharing no common prefix (react, vue, themes, cli, mcp, ai,
// component-schema, component-metadata).
export const ALL_PUBLISHABLE_PACKAGES = [
  "ai",
  "cli",
  "component-metadata",
  "component-schema",
  "mcp",
  "ng-core",
  "ng",
  "react-core",
  "react",
  "themes",
  "uix-data",
  "uix-motion",
  "uix-styled",
  "uix-styles",
  "uix-utils",
  "vue-core",
  "vue",
];

function findPackages(root = "packages") {
  return ALL_PUBLISHABLE_PACKAGES.map((name) => join(root, name));
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

// Per-package measurement logic, exported so both this script's own CLI
// loop and validate-bundle-size.mjs can call it directly (as a function,
// not shelled out to and re-parsed from stdout).
export function measurePackage(pkgPath) {
  const distDir = join(pkgPath, "dist");
  const { bytes, fileCount } = dirSizeBytes(distDir);
  const gzipBytes = barrelGzipSize(pkgPath);
  return { bytes, fileCount, gzipBytes };
}

// Only run the CLI report when this file is executed directly (not when
// imported by validate-bundle-size.mjs or a test).
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  console.log("| Package | dist/ size | dist/ file count | index.mjs gzip size |");
  console.log("|---|---|---|---|");

  for (const pkgPath of findPackages()) {
    const { bytes, fileCount, gzipBytes } = measurePackage(pkgPath);
    console.log(
      `| ${pkgPath} | ${(bytes / 1024).toFixed(1)} KB | ${fileCount} | ${(gzipBytes / 1024).toFixed(2)} KB |`
    );
  }
}
