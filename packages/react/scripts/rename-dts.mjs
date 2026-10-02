#!/usr/bin/env node
// Post-processes the declaration files `tsc` emits into `dist` (see this
// package's `build` script: `tsc -p tsconfig.dts.json --declaration
// --emitDeclarationOnly --outDir dist`). tsup's own `dts` is disabled
// (see tsup.config.ts). Two steps:
//
// 1. `tsc` emits `.d.ts` / `.d.ts.map`, but this package's exports map
//    declares `.d.mts` (it is `"type": "module"` and ships `.mjs`). Rename the
//    emitted files to `.d.mts` / `.d.mts.map`.
//
// 2. `tsc` emits per-file declarations with extensionless relative specifiers
//    (`from "./button"`, `export * from "./avatar"`). TypeScript resolves an
//    extensionless specifier only to `.ts` / `.d.ts` / `<dir>/index.d.ts`,
//    never to `.d.mts`, so consumers could not resolve them. Rewrite every
//    relative specifier in the `.d.mts` files to an explicit one:
//      `./x`  -> `./x.mjs`        when `x.d.mts` exists
//      `./x`  -> `./x/index.mjs`  when `x/index.d.mts` exists
//    TypeScript maps `./x.mjs` to `x.d.mts`. Bare/package specifiers
//    (`react`, `@ultimate/react-core`, ...) and relative specifiers that
//    already carry an extension are left alone. A relative specifier that
//    resolves to neither is a build error (non-zero exit).
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
const EXTENSIONED = /\.(?:[cm]?js|[cm]?ts|json|vue)$/;

const unresolved = [];

function resolveSpecifier(file, specifier) {
  if (EXTENSIONED.test(specifier)) {
    return specifier;
  }

  const target = resolve(dirname(file), specifier);

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
