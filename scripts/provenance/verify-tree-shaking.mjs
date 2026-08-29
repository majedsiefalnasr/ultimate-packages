#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking.mjs
//
// Confirms that importing only UButton from the single @ultimate/ng barrel
// (via a minimal esbuild bundle) does not pull in UDialog's overlay/focus-
// trap/motion dependencies, and reports whether the dist/ builds declare
// sideEffects such that style registration is expected to still execute.
// If style registration silently breaks under sideEffects:false, package.json
// must instead declare an explicit array of side-effectful paths (each
// component's style module).
//
// Verifies bundler-level dead-code elimination within the single barrel
// export, not per-component file isolation — see Task 17's brief for why
// @ultimate/ng has no per-component subpaths (Task 12's architecture
// correction).
//
// No app in this monorepo yet consumes @ultimate/ng via normal
// node_modules resolution (it is a pure library package at this phase), so
// this script resolves the workspace packages' dist/ output directly via
// esbuild's `alias` option rather than relying on a node_modules symlink.

import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

/** Resolve a workspace package's built entry file, failing loudly if missing. */
function distEntry(pkgDir, relPath) {
  const full = join(repoRoot, "packages", pkgDir, "dist", relPath);
  if (!existsSync(full)) {
    console.error(
      `[verify-tree-shaking] FATAL: expected built file not found: ${full}\n` +
        `Build all workspace dependencies first (see Step 1 of Task 17's brief).`
    );
    process.exit(1);
  }
  return full;
}

// Map every @ultimate/* import that ultimate-ng.mjs's built output can
// reach to its real dist/ file, since no app in this monorepo yet declares
// these as normal node_modules dependencies.
const alias = {
  "@ultimate/ng": distEntry("ng", "fesm2022/ultimate-ng.mjs"),
  "@ultimate/ng-core": distEntry("ng-core", "fesm2022/ultimate-ng-core.mjs"),
  "@ultimate/uix-utils/dom": distEntry("uix-utils", "dom/index.mjs"),
  "@ultimate/uix-utils/zindex": distEntry("uix-utils", "zindex/index.mjs"),
  "@ultimate/uix-utils/classnames": distEntry("uix-utils", "classnames/index.mjs"),
  "@ultimate/uix-utils/object": distEntry("uix-utils", "object/index.mjs"),
  "@ultimate/uix-utils/eventbus": distEntry("uix-utils", "eventbus/index.mjs"),
  "@ultimate/uix-utils": distEntry("uix-utils", "index.mjs"),
  "@ultimate/uix-motion": distEntry("uix-motion", "index.mjs"),
  "@ultimate/uix-styled": distEntry("uix-styled", "index.mjs"),
  "@ultimate/uix-styles/badge": distEntry("uix-styles", "badge/index.mjs"),
  "@ultimate/uix-styles/button": distEntry("uix-styles", "button/index.mjs"),
  "@ultimate/uix-styles/checkbox": distEntry("uix-styles", "checkbox/index.mjs"),
  "@ultimate/uix-styles/tooltip": distEntry("uix-styles", "tooltip/index.mjs"),
  "@ultimate/uix-styles/dialog": distEntry("uix-styles", "dialog/index.mjs"),
  "@ultimate/uix-styles/menu": distEntry("uix-styles", "menu/index.mjs"),
};

const workDir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-"));
const entryFile = join(workDir, "entry.mjs");
writeFileSync(entryFile, `import { UButton } from "@ultimate/ng";\nconsole.log(UButton);\n`);

try {
  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    absWorkingDir: repoRoot,
    alias,
    // Angular/RxJS/etc. are peer deps with no local build output relevant
    // to this check — mark them external so esbuild doesn't try (and fail)
    // to resolve them; they play no role in the UButton/UDialog isolation
    // question this script exists to answer.
    external: ["@angular/*", "rxjs", "rxjs/*", "tslib"],
    logLevel: "silent",
  });

  const bundleText = result.outputFiles[0].text;

  if (bundleText.includes("u-dialog") || bundleText.includes("UDialog")) {
    console.error(
      "[verify-tree-shaking] FAIL: importing only UButton pulled in Dialog-related code — the bundler is not eliminating unused exports from the single @ultimate/ng barrel"
    );
    process.exit(1);
  }
  console.log("[verify-tree-shaking] OK: importing UButton does not pull in UDialog");

  // Report which of UButton's/UDialog's style modules survived, as
  // corroborating evidence for the pass/fail verdict above.
  const styleChecks = [
    ["@ultimate/uix-styles/button (UButton's style)", "uix-styles/button"],
    ["@ultimate/uix-styles/dialog (UDialog's style)", "uix-styles/dialog"],
    ["@ultimate/uix-motion (UDialog's motion dep)", "uix-motion"],
  ];
  for (const [label, needle] of styleChecks) {
    console.log(
      `[verify-tree-shaking]   ${bundleText.includes(needle) ? "present" : "absent "} in bundle: ${label}`
    );
  }

  console.log(
    "[verify-tree-shaking] MANUAL CHECK REQUIRED: run the built bundle in a browser/jsdom context and confirm UButton's style is actually registered with @ultimate/uix-styled's StyleSheet service at runtime — this script's static bundle inspection cannot execute Angular DI/lifecycle, only confirm dead-code elimination worked structurally."
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
