#!/usr/bin/env node
// scripts/copy-compatibility-manifest.mjs
//
// GAP-131: copies the canonical docs/architecture/compatibility-manifest.json
// byte-for-byte into <package-dir>/dist/, so an installed @ultimate/cli or
// @ultimate/mcp reads it from its own distribution. Run after tsup (which
// cleans dist/). The canonical file is never modified.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const CANONICAL_MANIFEST = join(
  REPO_ROOT,
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

export function copyCompatibilityManifest(packageDir) {
  if (!existsSync(CANONICAL_MANIFEST)) {
    throw new Error(
      `copy-compatibility-manifest: canonical manifest not found at ${CANONICAL_MANIFEST}`
    );
  }
  const distDir = join(resolve(packageDir), "dist");
  mkdirSync(distDir, { recursive: true });
  const target = join(distDir, "compatibility-manifest.json");
  copyFileSync(CANONICAL_MANIFEST, target);
  return target;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const packageDir = process.argv[2];
  if (!packageDir) {
    console.error(
      "copy-compatibility-manifest: usage: node scripts/copy-compatibility-manifest.mjs <package-dir>"
    );
    process.exit(1);
  }
  try {
    console.log(`copy-compatibility-manifest: wrote ${copyCompatibilityManifest(packageDir)}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
