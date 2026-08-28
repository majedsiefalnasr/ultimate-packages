#!/usr/bin/env node
// scripts/provenance/extract-source.mjs
//
// Recovers original per-file TypeScript source from a pinned npm tarball's
// embedded sourcemap sourcesContent. The pinned @primeuix/* tarballs ship
// only compiled dist output (.mjs/.d.mts) — no src/ directory — but every
// .mjs.map inside embeds the full original file content per source path.
// This is the exact pinned MIT baseline, at file granularity, reproducible
// from the same checksummed tarball every time (Phase 0's vendor-snapshot.mjs
// already recorded each tarball's sha256 in docs/architecture/checksums.json).
//
// Usage: node extract-source.mjs <tarball-path> <output-dir>

import { mkdirSync, writeFileSync, readdirSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, normalize } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, outputDir] = process.argv;

if (!tarballPath || !outputDir) {
  console.error("Usage: extract-source.mjs <tarball-path> <output-dir>");
  process.exit(1);
}

function findMapFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findMapFiles(full, files);
    } else if (entry.name.endsWith(".mjs.map")) {
      files.push(full);
    }
  }
  return files;
}

// Resolves a sourcemap's relative "source" path (e.g. "../../src/dom/methods/hasClass.ts",
// recorded relative to the .mjs.map file's own directory) down to a path rooted at "src/",
// discarding any leading ../ segments that merely walk back up to the package root.
function resolveToSrcRelative(sourcePath) {
  const normalized = normalize(sourcePath)
    .split("/")
    .filter((seg) => seg !== "..");
  const srcIndex = normalized.indexOf("src");
  if (srcIndex === -1) {
    throw new Error(`sourcemap source path does not contain a "src" segment: ${sourcePath}`);
  }
  return normalized.slice(srcIndex).join("/");
}

const extractDir = mkdtempSync(join(tmpdir(), "extract-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const mapFiles = findMapFiles(extractDir);
  if (mapFiles.length === 0) {
    throw new Error(`no .mjs.map files found in ${tarballPath}`);
  }

  let written = 0;
  for (const mapFile of mapFiles) {
    const map = JSON.parse(readFileSync(mapFile, "utf8"));
    const sources = map.sources || [];
    const sourcesContent = map.sourcesContent || [];

    if (sources.length !== sourcesContent.length) {
      throw new Error(`${mapFile}: sources/sourcesContent length mismatch`);
    }

    for (let i = 0; i < sources.length; i++) {
      const content = sourcesContent[i];
      if (content == null) {
        throw new Error(
          `${mapFile}: sourcesContent[${i}] (${sources[i]}) is missing — cannot recover this file from sourcemap`
        );
      }
      const relPath = resolveToSrcRelative(sources[i]);
      const destPath = join(outputDir, relPath);
      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, content);
      written++;
    }
  }

  console.log(
    `[extract-source] wrote ${written} file(s) from ${mapFiles.length} sourcemap(s) to ${outputDir}`
  );
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
