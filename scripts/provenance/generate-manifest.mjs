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

// Known files whose true provenance the regex-based default classification
// (line ~40 below) cannot detect: these were never produced by sourcemap
// extraction at all, so "unmodified" is factually wrong for them. Rather
// than import-adapted extracted source, they are either hand-rebuilt barrel
// re-exports (the sourcemap doesn't capture a pure re-export barrel as a
// separately-mapped file) or manually transcribed from a compiled
// `.d.mts` declaration file (because no `.ts` source existed in the
// sourcemap for that file). Keyed by ultimateDestination (relative to repo
// root, matching the `ultimateDestination` field written below).
const KNOWN_OVERRIDES = {
  "packages/uix-styled/src/index.ts": {
    modificationStatus: "reconstructed",
    modificationDescription:
      "Top-level barrel hand-rebuilt by cross-referencing the built .d.mts/.mjs output (not one of the 19 sourcemap-extracted files); also adds ~40 lines of hand-written JSDoc and manually-declared types (StyleOptions, StyleType, ThemeOptions, ColorScale) absent from any extracted source file.",
  },
  "packages/uix-styled/src/helpers/index.ts": {
    modificationStatus: "reconstructed",
    modificationDescription:
      "Barrel re-export hand-rebuilt by cross-referencing the built .d.mts/.mjs output; the original upstream barrel was a pure re-export the sourcemap does not capture as a separately-mapped file.",
  },
  "packages/uix-styled/src/utils/index.ts": {
    modificationStatus: "reconstructed",
    modificationDescription:
      "Barrel re-export hand-rebuilt by cross-referencing the built .d.mts/.mjs output; the original upstream barrel was a pure re-export the sourcemap does not capture as a separately-mapped file.",
  },
  "packages/uix-styles/src/index.ts": {
    modificationStatus: "reconstructed",
    modificationDescription:
      "Barrel re-export hand-rebuilt by cross-referencing the built .d.mts/.mjs output; the original upstream barrel was a pure re-export the sourcemap does not capture as a separately-mapped file.",
  },
  "packages/uix-styles/src/types.ts": {
    modificationStatus: "transcribed",
    modificationDescription:
      "Manually transcribed from the tarball's dist/types.d.mts declaration file (dist/types.mjs.map has empty sources, so extract-source.mjs recovers nothing for it); StyleType was deliberately narrowed from upstream's real union type and the @primeuix/styled import was stripped, per this file's own header comment.",
  },
  "packages/uix-motion/src/types.ts": {
    modificationStatus: "transcribed",
    modificationDescription:
      "Manually transcribed from the tarball's dist/index.d.mts declaration file (the sourcemap extraction genuinely skipped it — no src path segment in its sourcemap entry).",
  },
  "packages/uix-motion/src/index.ts": {
    modificationStatus: "reconstructed",
    modificationDescription:
      "Barrel re-export hand-rebuilt (new barrel, not sourcemap-extracted); the original upstream barrel was a pure re-export the sourcemap does not capture as a separately-mapped file.",
  },
};

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
  const ultimateDestination = relative(process.cwd(), file);
  const modified = /@ultimate\/uix-/.test(content);

  const override = KNOWN_OVERRIDES[ultimateDestination];
  if (override) {
    return {
      originalPath: relPath.replace(/^src\//, "src/"),
      ultimateDestination,
      modificationStatus: override.modificationStatus,
      modificationDescription: override.modificationDescription,
    };
  }

  return {
    originalPath: relPath.replace(/^src\//, "src/"),
    ultimateDestination,
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
