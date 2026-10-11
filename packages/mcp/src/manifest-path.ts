// packages/mcp/src/manifest-path.ts
//
// This file's ONLY job is to hold the manifest's resolved absolute path as
// a separately-importable constant, so test/manifest.test.ts can mock it in
// isolation (via vi.doMock) without needing to mock node:fs's readFileSync
// for the "malformed content" case (only the "file does not exist" case
// needs the fs-level mock).
//
// GAP-131: the path is the copy built into this package's own dist/
// (scripts/copy-compatibility-manifest.mjs). The package root is the nearest
// directory containing package.json — the same in source, in the tsup bundle
// and in an installed package. No fallback to the monorepo's docs/ directory.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`manifest-path: could not locate "package.json" above ${startDir}`);
    }
    dir = parent;
  }
}

export const COMPATIBILITY_MANIFEST_PATH = join(
  findPackageRoot(dirname(fileURLToPath(import.meta.url))),
  "dist",
  "compatibility-manifest.json"
);
