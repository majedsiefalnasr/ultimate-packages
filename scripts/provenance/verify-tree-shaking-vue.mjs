#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking-vue.mjs
//
// Confirms or corrects the sideEffects: false package-metadata decision for
// @ultimate/vue-core and @ultimate/vue (spec §3, §33 — a hard exit-criteria
// gate, not a default). Bundles a minimal consumer entry point via esbuild
// against each package's real built dist/ output (not src/), for both a
// direct/subpath import and a barrel import, then inspects the resulting
// bundle for evidence that required style-registration code was NOT
// eliminated by dead-code elimination.
//
// Deviation from the task brief's literal draft script: the brief's draft
// imports `@ultimate/vue/button` and `@ultimate/vue` via plain bare
// specifiers and lets esbuild's default node-resolution find them. That does
// NOT work in this monorepo: there is no top-level `node_modules/@ultimate/`
// symlink for any workspace package (confirmed empirically — pnpm's default
// linker only symlinks a workspace package into another workspace package's
// own node_modules when it is declared as that package's dependency; no app
// in this monorepo yet consumes @ultimate/vue as a real dependency). Plain
// bare-specifier resolution from repo root fails with "Could not resolve".
// This exact situation is already documented and solved by this repo's own
// prior art — scripts/provenance/verify-tree-shaking.mjs (Angular, Task 17)
// and verify-tree-shaking-react.mjs (React, Task 19) both hit it and both
// resolve it the same way: an explicit esbuild `alias` map pointing each
// `@ultimate/*` import directly at its built dist/ file, with
// `absWorkingDir` set to the consuming package's own directory (so its own
// node_modules, e.g. containing `vue` as a devDependency, resolves
// correctly), and the framework peer dependency (`vue`) marked `external`
// since it is irrelevant to the UButton/UDialog isolation question this
// script answers. This script follows that same established pattern rather
// than the brief's plain-bare-specifier draft.
//
// Also note: `platform: "browser"` + `treeShaking: true` is esbuild's
// correct combination for this check — `treeShaking` defaults to true
// whenever `bundle: true`, but is passed explicitly for clarity, and
// `platform: "browser"` (rather than "neutral"/"node") makes esbuild resolve
// package.json "browser"/"module"/"main" fields the way a real consumer
// bundler (Vite, webpack, etc.) would, and is what determines whether
// esbuild honors package.json "sideEffects" at all — the exact metadata
// claim under test here.

import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const vuePkgDir = join(repoRoot, "packages", "vue");
const vueCorePkgDir = join(repoRoot, "packages", "vue-core");

/** Resolve a workspace package's built entry file, failing loudly if missing. */
function distEntry(pkgDir, relPath) {
  const full = join(pkgDir, "dist", relPath);
  if (!existsSync(full)) {
    console.error(
      `[verify-tree-shaking-vue] FATAL: expected built file not found: ${full}\n` +
        `Build both packages first: pnpm --filter @ultimate/vue-core build && pnpm --filter @ultimate/vue build`
    );
    process.exit(1);
  }
  return full;
}

const alias = {
  "@ultimate/vue-core": distEntry(vueCorePkgDir, "index.mjs"),
  "@ultimate/vue": distEntry(vuePkgDir, "index.mjs"),
  "@ultimate/vue/button": distEntry(vuePkgDir, "button/index.mjs"),
};

const checks = [
  {
    label: "vue subpath import (UButton only, via @ultimate/vue/button)",
    source: `import { UButton } from "@ultimate/vue/button";\nconsole.log(typeof UButton);\n`,
    mustContain: ["registerComponentStyle", "createStyleElement"],
    mustNotContain: ["UDialog", "u-dialog", "UMenu", "u-menu"],
  },
  {
    label: "vue barrel import (UButton only, via @ultimate/vue)",
    source: `import { UButton } from "@ultimate/vue";\nconsole.log(typeof UButton);\n`,
    mustContain: ["registerComponentStyle", "createStyleElement"],
    // The brief's own draft script left this empty for the barrel check.
    // That is wrong: the whole reason a *separate* barrel check exists
    // alongside the subpath check (see this file's Deviation note above and
    // verify-tree-shaking-react.mjs's identical two-check shape) is to catch
    // exactly this class of regression — a barrel importing only UButton
    // must not pull in UDialog/UMenu any more than the subpath import does.
    // Leaving this empty makes the barrel check unable to ever fail on the
    // one thing it exists to catch.
    mustNotContain: ["UDialog", "u-dialog", "createBaseDialog", "UMenu", "u-menu", "createBaseMenu"],
  },
  {
    // vue-core has no subpath exports (single flat dist/index.mjs, splitting:
    // false, matching @ultimate/vue's own barrel — see distEntry above) — so
    // there is no partial-import case to test against; any consumer of any
    // single export gets the whole bundle regardless of sideEffects. This
    // check exists to confirm that structural fact concretely rather than
    // assume it by analogy to the barrel finding above: importing only one
    // narrow, unrelated foundation-tier export (useZIndex) must not pull in
    // an unrelated one (focusTrapDirective) if tree-shaking genuinely held.
    label: "vue-core narrow import (useZIndex only, via @ultimate/vue-core)",
    source: `import { useZIndex } from "@ultimate/vue-core";\nconsole.log(typeof useZIndex);\n`,
    mustContain: [],
    mustNotContain: ["focusTrapDirective", "createDisplayOrderMixin", "createGlobalEscapeKeyMixin"],
  },
];

async function bundleEntry(entrySource, label, workDir) {
  const entryFile = join(workDir, `${label.replace(/[^a-z0-9]+/gi, "-")}.mjs`);
  writeFileSync(entryFile, entrySource);

  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    treeShaking: true,
    absWorkingDir: vuePkgDir,
    alias,
    external: ["vue"],
  });

  const code = result.outputFiles[0].text;
  console.log(`[verify-tree-shaking-vue] ${label}: bundle size ${code.length} bytes`);
  return code;
}

const workDir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-vue-"));
let failed = false;

try {
  for (const check of checks) {
    const code = await bundleEntry(check.source, check.label, workDir);
    for (const term of check.mustContain) {
      if (!code.includes(term)) {
        console.error(`FAIL: ${check.label} — expected bundle to contain "${term}" but it was eliminated`);
        failed = true;
      }
    }
    for (const term of check.mustNotContain) {
      if (code.includes(term)) {
        console.error(`FAIL: ${check.label} — expected bundle to NOT contain "${term}" (tree-shaking failure)`);
        failed = true;
      }
    }
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

if (failed) {
  console.error(
    "\nsideEffects: false did not hold under real bundling. Correct the flag to true, or mark the " +
      "specific style-registration module sideEffects: true via the array-of-paths form. Do not weaken this check."
  );
  process.exit(1);
}

console.log(
  "[verify-tree-shaking-vue] all checks passed — sideEffects: false confirmed under real esbuild bundling " +
    "for @ultimate/vue-core and @ultimate/vue. Step 4 (a real Vitest mount against the built dist/ output) " +
    "still confirms runtime style injection actually executes, which this static bundle inspection cannot."
);
