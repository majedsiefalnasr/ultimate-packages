#!/usr/bin/env node
// scripts/provenance/extract-primereact-source.mjs
//
// Extracts a specific components/lib/ subdirectory from the pinned
// PrimeReact tarball. This tarball is a real git-archive of the
// primefaces/primereact monorepo at the pinned commit — its repository
// root is the project's Next.js showcase app, NOT the library; the real
// library source lives under components/lib/, confirmed during the Phase 3
// Real-Source Verification Gate. This script copies only from that path,
// never from the repository root.
//
// Usage: node extract-primereact-source.mjs <tarball-path> <lib-relative-path> <output-dir>

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, libRelativePath, outputDir] = process.argv;

if (!tarballPath || !libRelativePath || !outputDir) {
  console.error(
    "Usage: extract-primereact-source.mjs <tarball-path> <lib-relative-path> <output-dir>"
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

const extractDir = mkdtempSync(join(tmpdir(), "extract-primereact-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const sourceDir = join(extractedRoot, "components", "lib", libRelativePath);

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`source directory not found in tarball: components/lib/${libRelativePath}`);
  }

  copyRecursive(sourceDir, outputDir);
  console.log(`[extract-primereact-source] copied components/lib/${libRelativePath} to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
