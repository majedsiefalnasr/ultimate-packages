// packages/cli/src/manifest-path.ts
//
// GAP-131: the single location from which @ultimate/cli reads the
// compatibility manifest — the copy built into this package's own dist/
// (scripts/copy-compatibility-manifest.mjs). The package root is the nearest
// directory containing package.json, which is the same in source (src/), in
// the tsup bundle (dist/) and in an installed package. No fallback to the
// monorepo's docs/ directory (Spec §4).
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
