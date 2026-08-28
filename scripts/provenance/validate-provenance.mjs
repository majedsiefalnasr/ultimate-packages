#!/usr/bin/env node
// scripts/provenance/validate-provenance.mjs
//
// Validates that docs/architecture/PROVENANCE.md exists and contains an
// entry for each package area that carries Prime-derived source. In CI,
// also checks that any PR touching packages/{uix,ng,react,vue}* includes
// a PROVENANCE.md update in the same diff.

import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const PROVENANCE_PATH = "docs/architecture/PROVENANCE.md";
const REQUIRED_HEADINGS = [
  "PrimeNG",
  "PrimeVue",
  "PrimeReact",
  "@primeuix/utils",
  "@primeuix/styled",
  "@primeuix/styles",
  "@primeuix/motion",
];
const WATCHED_PATH_PREFIXES = ["packages/uix", "packages/ng", "packages/react", "packages/vue"];

function fail(message) {
  console.error(`[provenance:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[provenance:validate] OK: ${message}`);
}

if (!existsSync(PROVENANCE_PATH)) {
  fail(`${PROVENANCE_PATH} does not exist`);
}

const content = readFileSync(PROVENANCE_PATH, "utf8");
const headings = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

for (const required of REQUIRED_HEADINGS) {
  if (!headings.includes(required)) {
    fail(`missing required PROVENANCE.md entry: "${required}"`);
  }
}
pass(`all ${REQUIRED_HEADINGS.length} required baseline entries present`);

const baseRefIndex = process.argv.indexOf("--base-ref");
const baseRef = baseRefIndex !== -1 ? process.argv[baseRefIndex + 1] : null;

if (baseRef) {
  let changedFiles = [];
  try {
    changedFiles = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch (err) {
    fail(`could not compute git diff against ${baseRef}: ${err.message}`);
  }

  const touchesWatchedPath = changedFiles.some((f) =>
    WATCHED_PATH_PREFIXES.some((prefix) => f.startsWith(prefix))
  );
  const touchesProvenance = changedFiles.includes(PROVENANCE_PATH);

  if (touchesWatchedPath && !touchesProvenance) {
    fail(`diff touches a Prime-derived package path but does not update ${PROVENANCE_PATH}`);
  }
  pass(`diff check against ${baseRef} passed`);
}

console.log("[provenance:validate] all checks passed");
process.exit(0);
