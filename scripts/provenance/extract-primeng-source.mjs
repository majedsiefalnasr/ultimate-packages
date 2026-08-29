#!/usr/bin/env node
// scripts/provenance/extract-primeng-source.mjs
//
// Extracts a specific src/ subdirectory from the pinned PrimeNG tarball.
// Unlike scripts/provenance/extract-source.mjs (Phase 1, sourcemap recovery
// for @primeuix/* packages that ship no src/), this tarball is a real
// git-archive of the primefaces/primeng monorepo at the pinned commit —
// it already contains full original TypeScript source under
// packages/primeng/src/, so this is a direct copy, not a recovery.
//
// Usage: node extract-primeng-source.mjs <tarball-path> <src-relative-path> <output-dir>

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, srcRelativePath, outputDir] = process.argv;

if (!tarballPath || !srcRelativePath || !outputDir) {
  console.error(
    "Usage: extract-primeng-source.mjs <tarball-path> <src-relative-path> <output-dir>"
  );
  process.exit(1);
}

function findExtractedRoot(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length !== 1) {
    throw new Error(
      `expected exactly one top-level directory in extracted tarball, found ${entries.length}`
    );
  }
  return join(dir, entries[0].name);
}

function copyRecursive(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

const extractDir = mkdtempSync(join(tmpdir(), "extract-primeng-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const sourceDir = join(extractedRoot, "packages", "primeng", "src", srcRelativePath);

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(
      `source directory not found in tarball: packages/primeng/src/${srcRelativePath}`
    );
  }

  copyRecursive(sourceDir, outputDir);
  console.log(
    `[extract-primeng-source] copied packages/primeng/src/${srcRelativePath} to ${outputDir}`
  );
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
