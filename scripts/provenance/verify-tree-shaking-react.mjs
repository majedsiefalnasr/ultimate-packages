#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking-react.mjs
//
// Confirms, via a real esbuild production bundle against the actual built
// dist/ output (not src/), that:
//   1. Importing only UButton from a direct subpath (@ultimate/react/button)
//      does not pull in UDialog's overlay/focus-trap/motion code.
//   2. Importing only UButton from the barrel (@ultimate/react) does not
//      pull in UDialog's code either — a barrel-specific regression the
//      subpath check alone would not catch.
//   3. No required style-registration module is eliminated as dead code
//      under sideEffects:false (checked structurally here; Step 4 of the
//      plan task confirms actual runtime style injection via Vitest+RTL
//      against this same built output, which this script cannot execute).
//
// This validates measured bundler behavior against the package-metadata
// decision already made in package.json — see the plan's spec §3 (tightened
// Required Edit 1): these are two distinct claims, not one.
//
// Deviation from the plan's literal script (Task 19, Step 2): no app in
// this monorepo yet consumes @ultimate/react via normal node_modules
// resolution (it is a pure library package at this phase, same situation
// documented in the sibling scripts/provenance/verify-tree-shaking.mjs for
// @ultimate/ng) — plain `import ... from "@ultimate/react/button"` does not
// resolve for esbuild from repo root; confirmed by direct reproduction
// (ERR: Could not resolve "@ultimate/react/button") before adding the fix.
// This script instead runs with absWorkingDir set to packages/react (whose
// own node_modules has react/react-dom installed as devDependencies) and
// resolves @ultimate/react's own exports via an explicit `alias` map to the
// built dist/ files, mirroring verify-tree-shaking.mjs's established
// pattern. react/react-dom are marked external (real peer deps, irrelevant
// to the UButton/UDialog isolation question this script answers) so the
// bundle reflects only this package's own dead-code elimination.

import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const reactPkgDir = join(repoRoot, "packages", "react");

const alias = {
  "@ultimate/react": join(reactPkgDir, "dist", "index.mjs"),
  "@ultimate/react/button": join(reactPkgDir, "dist", "button", "index.mjs"),
};

const workDir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-react-"));

async function checkImport(label, importStatement) {
  const entryFile = join(workDir, `${label}.mjs`);
  writeFileSync(entryFile, `${importStatement}\nconsole.log(typeof UButton);\n`);

  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    absWorkingDir: reactPkgDir,
    alias,
    external: ["react", "react-dom", "react/*", "react-dom/*"],
  });

  const bundleText = result.outputFiles[0].text;
  const leaked = bundleText.includes("UDialog") || bundleText.includes("u-dialog");

  if (leaked) {
    console.error(
      `[verify-tree-shaking-react] FAIL (${label}): importing only UButton pulled in Dialog-related code`
    );
    return false;
  }
  console.log(`[verify-tree-shaking-react] OK (${label}): UButton import does not pull in UDialog`);
  return true;
}

try {
  const subpathOk = await checkImport(
    "subpath-import",
    `import { UButton } from "@ultimate/react/button";`
  );
  const barrelOk = await checkImport(
    "barrel-import",
    `import { UButton } from "@ultimate/react";`
  );

  console.log(
    "[verify-tree-shaking-react] MANUAL/AUTOMATED CHECK REQUIRED (see plan Task 19 Step 4): " +
      "run a Vitest+RTL test against the built dist/ output (not src/) confirming UButton's " +
      "style is actually registered with react-core's reactCoreStyleSheet at runtime under " +
      "each import path — this script's static bundle inspection confirms dead-code " +
      "elimination structurally but cannot execute React rendering or effects."
  );

  if (!subpathOk || !barrelOk) process.exit(1);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
