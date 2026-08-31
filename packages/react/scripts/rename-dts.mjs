#!/usr/bin/env node
// tsup's non-experimental `dts: true` generator does not honor a custom
// `outExtension().dts` when the package is already `"type": "module"`
// (it falls back to `.d.ts`, since `.ts` is unambiguous ESM in that case).
// Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
// after the build so they match this package's `.mjs` exports map.
import { readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
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

// This package has multiple tsup entry points (barrel + per-component
// subpaths). tsup's DTS rollup emits cross-entry re-export specifiers
// (e.g. `export { UButton } from './button/index.js'`) with a hardcoded
// `.js` extension, unaffected by `outExtension()`. Under this package's
// `"type": "module"` + NodeNext resolution, `.js` does not resolve to the
// actual `.mjs` files on disk, so rewrite relative `./...js` specifiers in
// the renamed `.d.mts` files to `.mjs`. Bare specifiers (`react`,
// `@ultimate/react-core`, ...) are untouched.
function fixCrossEntryDtsExtensions(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      fixCrossEntryDtsExtensions(fullPath);
    } else if (entry.name.endsWith(".d.mts")) {
      const original = readFileSync(fullPath, "utf8");
      const fixed = original.replace(
        /(from\s+['"]\.[^'"]*?)\.js(['"])/g,
        "$1.mjs$2",
      );

      if (fixed !== original) {
        writeFileSync(fullPath, fixed);
      }
    }
  }
}

fixCrossEntryDtsExtensions("dist");
