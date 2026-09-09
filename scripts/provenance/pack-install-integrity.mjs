#!/usr/bin/env node
// scripts/provenance/pack-install-integrity.mjs
//
// R8: generalized pack/install integrity check. Generalizes the proven
// Phase 9 mechanism in packages/ai/test/packaging.test.ts (pack -> pnpm
// overrides with file: tarball paths -> scratch-consumer
// `pnpm install --no-lockfile` -> assert files exist) to any target package
// plus its full workspace:* transitive closure, and replaces that test's
// hand-copied assertion list with a data-driven one derived from the
// target's own package.json exports/main/module/types/bin/files fields.
//
// Usage: node scripts/provenance/pack-install-integrity.mjs <package-name>
//   <package-name> may be the short dir name ("ai", "ng") or the full
//   scoped name ("@ultimate/ai", "@ultimate/ng").
//
// This script only packs and installs — it never runs the target's own
// test suite (packages/ng's own `pnpm test` currently fails on an
// unrelated, pre-existing tooltip.ts TS2339 bug; irrelevant here).
//
// Which package(s) get checked on a given push/PR (path-scoped "affected
// package" selection) is Task 9's CI-level concern, not this script's — this
// script always tests exactly the one package it's given, plus its closure.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getTransitiveClosure } from "./workspace-graph.mjs";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PACKAGES_DIR = join(REPO_ROOT, "packages");

function toScopedName(pkgName) {
  return pkgName.startsWith("@ultimate/") ? pkgName : `@ultimate/${pkgName}`;
}

function toShortName(scopedName) {
  return scopedName.replace(/^@ultimate\//, "");
}

function packageRoot(scopedName) {
  return join(PACKAGES_DIR, toShortName(scopedName));
}

// --- Topological sort (Kahn's algorithm) --------------------------------
//
// Dependencies must be packed before dependents, so a member's own
// workspace:* dependencies (within the closure) are guaranteed to already
// have a tarball on disk when it's that member's turn — not required by
// `pnpm pack` itself (packing never needs sibling tarballs), but required
// so the scratch consumer's package.json can be built with every closure
// member's tarball path known up front, and so the packing order itself is
// a genuine dependency-respecting order rather than an arbitrary one.
//
// Edges use each member's real `dependencies` field (workspace:* only) —
// the same edge set getTransitiveClosure uses to expand a discovered node
// (see workspace-graph.mjs's header comment).
export function topologicalSort(members, getDeps) {
  const memberSet = new Set(members);
  const inDegree = new Map(members.map((m) => [m, 0]));
  const dependents = new Map(members.map((m) => [m, []]));

  for (const member of members) {
    for (const dep of getDeps(member)) {
      if (!memberSet.has(dep)) continue; // dep outside this closure (shouldn't happen, but stay defensive)
      inDegree.set(member, inDegree.get(member) + 1);
      dependents.get(dep).push(member);
    }
  }

  const queue = members.filter((m) => inDegree.get(m) === 0);
  const sorted = [];

  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    for (const dependent of dependents.get(node)) {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) queue.push(dependent);
    }
  }

  if (sorted.length !== members.length) {
    throw new Error(
      `pack-install-integrity: cycle detected in workspace:* dependency graph among [${members.join(", ")}]`
    );
  }

  return sorted;
}

function getPackageDependenciesFromDisk(scopedName) {
  const pkgJson = JSON.parse(readFileSync(join(packageRoot(scopedName), "package.json"), "utf8"));
  return Object.entries(pkgJson.dependencies || {})
    .filter(([, range]) => typeof range === "string" && range.startsWith("workspace:"))
    .map(([name]) => name);
}

// --- Packing --------------------------------------------------------------

// `pnpm pack` (unlike `npm pack`) has no `--json` flag in this pnpm
// version — it prints the tarball's absolute path as plain stdout text.
function packOne(scopedName, packDestDir) {
  const cwd = packageRoot(scopedName);
  const output = execFileSync("pnpm", ["pack", "--pack-destination", packDestDir], {
    cwd,
    encoding: "utf8",
  });
  return output.trim();
}

// --- Scratch consumer -------------------------------------------------

function buildScratchConsumer(consumerDir, targetName, targetTarball, overrideMembers, tarballByName) {
  const overrides = {};
  for (const member of overrideMembers) {
    overrides[member] = `file:${tarballByName.get(member)}`;
  }

  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "scratch-pack-install-consumer",
        version: "1.0.0",
        private: true,
        dependencies: {
          [targetName]: `file:${targetTarball}`,
        },
        pnpm: {
          overrides,
        },
      },
      null,
      2
    )
  );
}

function installScratchConsumer(consumerDir) {
  execFileSync("pnpm", ["install", "--no-lockfile"], { cwd: consumerDir, stdio: "ignore" });
}

// --- Data-driven assertion -----------------------------------------------
//
// Reads the TARGET package's own real package.json exports/main/module/
// types/bin/files fields and resolves every concrete path they reference
// (never a hand-copied literal list) — the actual point of this
// generalization over the Phase 9 precedent.
//
// A `*` in an exports subpath (e.g. "./dist/*/index.d.mts", the shape
// uix-utils and similar packages use for per-module subpath exports) is a
// glob pattern, not a resolvable literal path — those entries are skipped,
// since there's no single concrete file they name.
function collectExpectedRelativePaths(pkgJson) {
  const paths = new Set();

  function addIfConcrete(value) {
    if (typeof value !== "string") return;
    if (value.includes("*")) return; // pattern, not a literal path
    paths.add(value.replace(/^\.\//, ""));
  }

  function walkExportsValue(value) {
    if (typeof value === "string") {
      addIfConcrete(value);
      return;
    }
    if (value && typeof value === "object") {
      for (const v of Object.values(value)) walkExportsValue(v);
    }
  }

  addIfConcrete(pkgJson.main);
  addIfConcrete(pkgJson.module);
  addIfConcrete(pkgJson.types);

  if (typeof pkgJson.bin === "string") {
    addIfConcrete(pkgJson.bin);
  } else if (pkgJson.bin && typeof pkgJson.bin === "object") {
    for (const v of Object.values(pkgJson.bin)) addIfConcrete(v);
  }

  if (pkgJson.exports) walkExportsValue(pkgJson.exports);

  // `files` entries are directory/file names relative to the package root
  // (not necessarily individual files — "dist" names a whole directory) —
  // asserted as top-level existence, same as every other collected path.
  for (const entry of pkgJson.files || []) {
    addIfConcrete(entry);
  }

  return [...paths];
}

export function assertInstalledPackageMatchesManifest(installedPkgDir, targetPkgJsonPath) {
  const targetPkgJson = JSON.parse(readFileSync(targetPkgJsonPath, "utf8"));
  const expectedPaths = collectExpectedRelativePaths(targetPkgJson);

  const missing = expectedPaths.filter((relPath) => !existsSync(join(installedPkgDir, relPath)));

  if (missing.length > 0) {
    throw new Error(
      `pack-install-integrity: ${targetPkgJson.name} is missing ${missing.length} path(s) declared in its own package.json (exports/main/module/types/bin/files) under the installed tree ${installedPkgDir}: ${missing.join(", ")}`
    );
  }

  return expectedPaths;
}

// --- Orchestration ---------------------------------------------------------

export function runPackInstallIntegrity(targetPkgNameArg) {
  const targetName = toScopedName(targetPkgNameArg);
  const closure = getTransitiveClosure(targetName);
  const members = [targetName, ...closure];

  const sortedMembers = topologicalSort(members, (m) =>
    m === targetName ? getPackageDependenciesFromDisk(targetName) : getPackageDependenciesFromDisk(m)
  );

  const packDestDir = mkdtempSync(join(tmpdir(), "ultimate-pack-install-pack-"));
  const consumerDir = mkdtempSync(join(tmpdir(), "ultimate-pack-install-consumer-"));

  try {
    const tarballByName = new Map();
    for (const member of sortedMembers) {
      tarballByName.set(member, packOne(member, packDestDir));
    }

    const overrideMembers = sortedMembers.filter((m) => m !== targetName);
    buildScratchConsumer(
      consumerDir,
      targetName,
      tarballByName.get(targetName),
      overrideMembers,
      tarballByName
    );

    installScratchConsumer(consumerDir);

    const installedPkgDir = join(consumerDir, "node_modules", ...targetName.split("/"));
    const targetPkgJsonPath = join(packageRoot(targetName), "package.json");

    const checkedPaths = assertInstalledPackageMatchesManifest(installedPkgDir, targetPkgJsonPath);

    return { targetName, closureMembers: closure, sortedMembers, checkedPaths, installedPkgDir };
  } finally {
    rmSync(packDestDir, { recursive: true, force: true });
    rmSync(consumerDir, { recursive: true, force: true });
  }
}

// --- CLI wrapper --------------------------------------------------------

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

function runCli() {
  // `pnpm run integrity:pack-install -- <package-name>` forwards the
  // literal "--" separator token itself into argv rather than stripping
  // it (confirmed against the repo's pinned pnpm@9.6.0 — same behavior
  // already handled identically in validate-sast-baseline.mjs). Strip one
  // leading "--" so both invocation shapes resolve to the same positional
  // argument.
  const cliArgs = process.argv.slice(2);
  if (cliArgs[0] === "--") cliArgs.shift();
  const targetArg = cliArgs[0];
  if (!targetArg) {
    console.error(
      "[pack-install-integrity] FAIL: missing required CLI argument: node scripts/provenance/pack-install-integrity.mjs <package-name>"
    );
    process.exit(1);
  }

  const startedAt = Date.now();
  try {
    const result = runPackInstallIntegrity(targetArg);
    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[pack-install-integrity] OK: ${result.targetName} + ${result.closureMembers.length} closure member(s) [${result.closureMembers.join(", ")}] packed, installed, and verified (${result.checkedPaths.length} manifest path(s) checked) in ${(elapsedMs / 1000).toFixed(2)}s`
    );
    process.exit(0);
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    console.error(
      `[pack-install-integrity] FAIL (after ${(elapsedMs / 1000).toFixed(2)}s): ${error.message}`
    );
    process.exit(1);
  }
}

if (isMainModule()) {
  runCli();
}
