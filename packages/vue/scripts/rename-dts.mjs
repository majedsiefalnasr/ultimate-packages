#!/usr/bin/env node
// Post-processes the declaration files `vue-tsc` emits into `dist` (this
// package's `build` script: `vue-tsc -p tsconfig.dts.json --declaration
// --emitDeclarationOnly --outDir dist`). Two steps; step 2 follows
// packages/react/scripts/rename-dts.mjs (GAP-068) for extensionless
// specifiers and additionally handles `.vue` and `.js` specifiers:
//
// 1. Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
//    so they match this package's `.mjs` exports map.
//
// 2. `vue-tsc` emits relative specifiers as written in source: extensionless
//    (`./base-button`) and SFC (`./Button.vue`). TypeScript resolves neither to
//    a `.d.mts` file, so consumers got TS2307 (GAP-079). Rewrite every relative
//    specifier to an explicit one:
//      `./x`      -> `./x.mjs`        when `x.d.mts` exists
//      `./x`      -> `./x/index.mjs`  when `x/index.d.mts` exists
//      `./X.vue`  -> `./X.vue.mjs`    when `X.vue.d.mts` exists
//      `./x.js`   -> `./x.mjs`        when `x.d.mts` exists (this script's
//                                     earlier behavior, for tsup's `.js`
//                                     cross-entry specifiers; kept)
//      `./x.mjs`  unchanged           when `x.d.mts` exists
//    TypeScript maps `./x.mjs` to `x.d.mts`. Bare/package specifiers and
//    relative `.cjs`/TS/JSON specifiers are left alone. Any other relative
//    specifier that resolves to nothing is a build error (non-zero exit), so
//    this defect cannot silently return.
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST = "dist";

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

// Matches the specifier in `from "..."`, `import("...")` and side-effect
// `import "..."`; only relative (`./`, `../`) specifiers are rewritten.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*|\.{1,2})\2/g;
// A relative specifier naming a JS module (`.js`/`.mjs`) must map to an
// emitted declaration; other extensions (`.cjs`, TS, JSON) are left alone.
// `.vue` is deliberately in neither list: an SFC specifier is resolved like
// an extensionless one, against the emitted `X.vue.d.mts`.
const JS_MODULE = /\.m?js$/;
const LEFT_ALONE = /\.(?:cjs|[cm]?ts|json)$/;

const unresolved = [];

function resolveSpecifier(file, specifier) {
  const target = resolve(dirname(file), specifier);

  if (JS_MODULE.test(specifier)) {
    if (existsSync(`${target.replace(JS_MODULE, "")}.d.mts`)) {
      return specifier.replace(JS_MODULE, ".mjs");
    }
    unresolved.push(`${file}: "${specifier}"`);
    return specifier;
  }
  if (LEFT_ALONE.test(specifier)) {
    return specifier;
  }

  if (existsSync(`${target}.d.mts`)) {
    return `${specifier}.mjs`;
  }
  if (existsSync(join(target, "index.d.mts"))) {
    return `${specifier.replace(/\/$/, "")}/index.mjs`;
  }

  unresolved.push(`${file}: "${specifier}"`);
  return specifier;
}

function rewriteSpecifiers(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      rewriteSpecifiers(fullPath);
    } else if (entry.name.endsWith(".d.mts")) {
      const original = readFileSync(fullPath, "utf8");
      const fixed = original.replace(
        SPECIFIER,
        (_match, prefix, quote, specifier) =>
          `${prefix}${quote}${resolveSpecifier(fullPath, specifier)}${quote}`
      );

      if (fixed !== original) {
        writeFileSync(fullPath, fixed);
      }
    }
  }
}

renameDtsToMts(DIST);
rewriteSpecifiers(DIST);

if (unresolved.length > 0) {
  console.error(
    `rename-dts: ${unresolved.length} relative specifier(s) resolve to no .d.mts file:\n` +
      unresolved.map((line) => `  ${line}`).join("\n")
  );
  process.exit(1);
}
