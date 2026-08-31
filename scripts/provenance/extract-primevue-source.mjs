#!/usr/bin/env node
// scripts/provenance/extract-primevue-source.mjs
//
// Extracts a specific source subdirectory from the pinned PrimeVue tarball.
// Unlike PrimeReact's single components/lib/ root, PrimeVue's real repo
// splits its source across two roots — confirmed during the Phase 4
// Real-Source Verification Gate (spec §1):
//   - packages/core/src/<name>     — foundation tier (BaseComponent,
//                                     BaseDirective, BaseEditableHolder,
//                                     BaseInput, utils, config, service)
//   - packages/primevue/src/<name> — components and directives (button,
//                                     checkbox, dialog, menu, tooltip,
//                                     focustrap, ripple, portal, badge)
// The <root> argument selects which of these two the requested
// <lib-relative-path> is resolved against.
//
// Usage: node extract-primevue-source.mjs <tarball-path> <root> <lib-relative-path> <output-dir>
//   <root> is one of: "core", "primevue"

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const VALID_ROOTS = {
  core: ["packages", "core", "src"],
  primevue: ["packages", "primevue", "src"],
};

const [, , tarballPath, root, libRelativePath, outputDir] = process.argv;

if (!tarballPath || !root || !libRelativePath || !outputDir) {
  console.error(
    "Usage: extract-primevue-source.mjs <tarball-path> <root> <lib-relative-path> <output-dir>\n" +
      '  <root> is one of: "core", "primevue"'
  );
  process.exit(1);
}

if (!VALID_ROOTS[root]) {
  console.error(`invalid root "${root}" — must be one of: ${Object.keys(VALID_ROOTS).join(", ")}`);
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

const extractDir = mkdtempSync(join(tmpdir(), "extract-primevue-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const rootSegments = VALID_ROOTS[root];
  const sourceDir = join(extractedRoot, ...rootSegments, libRelativePath);
  const displayPath = [...rootSegments, libRelativePath].join("/");

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`source directory not found in tarball: ${displayPath}`);
  }

  copyRecursive(sourceDir, outputDir);
  console.log(`[extract-primevue-source] copied ${displayPath} to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
