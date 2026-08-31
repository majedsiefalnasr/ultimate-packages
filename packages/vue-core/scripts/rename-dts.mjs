#!/usr/bin/env node
// tsup's non-experimental `dts: true` generator does not honor a custom
// `outExtension().dts` when the package is already `"type": "module"`
// (it falls back to `.d.ts`, since `.ts` is unambiguous ESM in that case).
// Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
// after the build so they match this package's `.mjs` exports map.
//
// Identical to react-core's scripts/rename-dts.mjs (Phase 3 precedent for
// the same tsup limitation) — reused as-is rather than reimplemented.
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

function renameDtsToMts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameDtsToMts(fullPath);
    } else if (entry.name.endsWith(".d.ts.map")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts\.map$/, ".d.mts.map"));
    } else if (entry.name.endsWith(".d.ts")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts$/, ".d.mts"));
    }
  }
}

renameDtsToMts("dist");
