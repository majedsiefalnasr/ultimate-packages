#!/usr/bin/env node
// scripts/provenance/affected-packages.mjs
//
// R10 (Task 9): "Determine affected packages" CI step's logic, extracted
// into a real, testable pure function per this plan's established "pure
// logic function + thin CLI/step wrapper" pattern (same shape as
// validate-bundle-size.mjs's evaluatePackageSize / validate-coverage.mjs's
// evaluatePackageCoverage).
//
// A changed package must expand to everything that could break downstream
// of it — the REVERSE transitive closure (workspace-graph.mjs's
// getReverseTransitiveClosure), not the forward one R8's pack/install
// integrity suite uses. This is the opposite direction from "what does X
// depend on": here we ask "what depends on X".
//
// Usage (CLI): node scripts/provenance/affected-packages.mjs [--base-ref origin/main]
//   Prints the affected package list, one per line (short dir names, e.g.
//   "uix-data"), and — when running inside GitHub Actions ($GITHUB_OUTPUT
//   set) — writes `packages=<space-separated list>` to $GITHUB_OUTPUT for
//   the next step to loop over.

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { getAllPackageNames, getReverseTransitiveClosure } from "./workspace-graph.mjs";
import { getMergeBaseSha } from "./baseline-lib.mjs";

function toShortName(scopedName) {
  return scopedName.replace(/^@ultimate\//, "");
}

function toScopedName(shortName) {
  return shortName.startsWith("@ultimate/") ? shortName : `@ultimate/${shortName}`;
}

// --- Pure logic ----------------------------------------------------------

// Maps a single changed file path to the short package dir name it belongs
// to, or null if the path isn't under packages/<name>/... at all (e.g. a
// root config file, docs/, scripts/ change — irrelevant to package-scoped
// gates).
export function mapChangedFileToPackageName(filePath) {
  const match = /^packages\/([^/]+)\//.exec(filePath);
  return match ? match[1] : null;
}

// Takes the already-resolved list of changed file paths (no git access) so
// tests can exercise this directly with real, hand-built path lists rather
// than needing a live git fixture. Returns the affected package list as
// short dir names, sorted and deduplicated: every directly-changed package
// plus every real package that transitively depends on it (per
// workspace-graph.mjs's getReverseTransitiveClosure), intersected against
// getAllPackageNames() so a changed path under a non-workspace directory
// (e.g. packages/uix/, which has no package.json) is silently ignored
// rather than throwing.
export function computeAffectedPackages(changedFiles) {
  const allRealPackages = new Set(getAllPackageNames());

  const directlyChangedShortNames = new Set(
    changedFiles.map(mapChangedFileToPackageName).filter(Boolean)
  );

  const affected = new Set();
  for (const shortName of directlyChangedShortNames) {
    const scopedName = toScopedName(shortName);
    if (!allRealPackages.has(scopedName)) continue; // e.g. packages/uix/ has no package.json — not a real workspace package

    affected.add(shortName);
    for (const dependent of getReverseTransitiveClosure(scopedName)) {
      affected.add(toShortName(dependent));
    }
  }

  return [...affected].sort();
}

// --- Git-backed resolution -------------------------------------------------

function getChangedFiles(baseRef) {
  const mergeBaseSha = getMergeBaseSha(baseRef);
  return execFileSync("git", ["diff", "--name-only", `${mergeBaseSha}...HEAD`], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
}

// --- CLI wrapper --------------------------------------------------------

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

function runCli() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs[0] === "--") cliArgs.shift();
  const baseRefIndex = cliArgs.indexOf("--base-ref");
  const baseRef = baseRefIndex !== -1 ? cliArgs[baseRefIndex + 1] : "origin/main";

  const changedFiles = getChangedFiles(baseRef);
  const affectedPackages = computeAffectedPackages(changedFiles);

  console.log(
    `[affected-packages] ${affectedPackages.length} affected package(s) relative to ${baseRef}: ${affectedPackages.join(", ") || "(none)"}`
  );

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `packages=${affectedPackages.join(" ")}\n`);
  }
}

if (isMainModule()) {
  runCli();
}
