#!/usr/bin/env node
// scripts/provenance/workspace-graph.mjs
//
// Pure module computing the `workspace:*` dependency graph across all
// packages/* and its transitive closure, for R8's generalized pack/install
// integrity suite (pack-install-integrity.mjs).
//
// Edge-reading rule (deliberately two-tiered, not a single flat merge):
//
//   - getDirectDependencies(pkgName) reads a package's OWN `dependencies`
//     *and* `devDependencies` fields for `workspace:*`-specifier entries.
//     This is required to discover the real `@ultimate/ng -> @ultimate/themes`
//     edge: `themes` is a devDependency of `ng` (used only for `ng`'s own
//     Angular-side theming tests), not a `dependencies` entry — but it is a
//     genuine cross-edge this repo's dependency map has today, and a
//     `dependencies`-only read would silently drop it.
//
//   - getTransitiveClosure(pkgName) starts the BFS from the root's direct
//     deps (dependencies + devDependencies, as above), but expands every
//     *discovered* node using `dependencies` only. A devDependency is real
//     for the package that declares it (its own build/test tooling), but is
//     not a supply-chain relationship anything downstream needs to inherit:
//     once @ultimate/themes is reached from @ultimate/ng, what matters for
//     ng's packed/installed closure is what themes itself *ships with*
//     (`dependencies`), not what themes' own test suite happens to devDepend
//     on somewhere three hops removed from ng's real dependents.
//
// This hybrid is what makes both of the following true simultaneously,
// which a single flat dependencies+devDependencies merge cannot do without
// pulling react/react-core/vue/vue-core into `ng`'s closure transitively:
//   - getTransitiveClosure("@ultimate/ng") is exactly the 7 packages this
//     repo's real, current package.json files describe: ng-core, uix-data,
//     uix-motion, uix-styled, uix-styles, uix-utils, themes.
//   - getTransitiveClosure("@ultimate/themes") includes react and vue
//     (themes' own devDependencies), proving the cross-edge is handled and
//     not silently dropped by an assume-leaf shortcut.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const PACKAGES_DIR = join(REPO_ROOT, "packages");

function isWorkspaceSpecifier(versionRange) {
  return typeof versionRange === "string" && versionRange.startsWith("workspace:");
}

function extractWorkspaceDeps(depsObject) {
  return Object.entries(depsObject || {})
    .filter(([, range]) => isWorkspaceSpecifier(range))
    .map(([name]) => name);
}

function readPackageJson(pkgDir) {
  const pkgJsonPath = join(PACKAGES_DIR, pkgDir, "package.json");
  return JSON.parse(readFileSync(pkgJsonPath, "utf8"));
}

// Lazily built, memoized once per process: name -> { dependencies, devDependencies }
// (each already reduced to just the workspace:* dep-name arrays).
let manifestsByName = null;

function loadManifests() {
  if (manifestsByName) return manifestsByName;

  manifestsByName = new Map();
  for (const entry of readdirSync(PACKAGES_DIR)) {
    const entryPath = join(PACKAGES_DIR, entry);
    if (!statSync(entryPath).isDirectory()) continue;
    const pkgJsonPath = join(entryPath, "package.json");
    if (!existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    manifestsByName.set(pkgJson.name, {
      dependencies: extractWorkspaceDeps(pkgJson.dependencies),
      devDependencies: extractWorkspaceDeps(pkgJson.devDependencies),
    });
  }
  return manifestsByName;
}

function requireManifest(pkgName) {
  const manifests = loadManifests();
  const manifest = manifests.get(pkgName);
  if (!manifest) {
    throw new Error(`workspace-graph: unknown package "${pkgName}" (not found under packages/*)`);
  }
  return manifest;
}

// Direct deps of the queried package: dependencies + devDependencies,
// merged and deduplicated. See module header for why devDependencies is
// included here but not during closure recursion.
export function getDirectDependencies(pkgName) {
  const manifest = requireManifest(pkgName);
  return [...new Set([...manifest.dependencies, ...manifest.devDependencies])];
}

// Full deduplicated transitive closure of pkgName's workspace:* deps.
// Root expands via getDirectDependencies (dependencies + devDependencies);
// every subsequently discovered node expands via `dependencies` only.
export function getTransitiveClosure(pkgName) {
  const manifests = loadManifests();
  requireManifest(pkgName); // validates pkgName exists, same error as getDirectDependencies

  const closure = new Set();
  const queue = [...getDirectDependencies(pkgName)];

  while (queue.length > 0) {
    const current = queue.shift();
    if (closure.has(current)) continue;
    closure.add(current);

    const manifest = manifests.get(current);
    if (!manifest) {
      throw new Error(
        `workspace-graph: "${pkgName}" depends on "${current}", which has no packages/* manifest`
      );
    }
    for (const dep of manifest.dependencies) {
      if (!closure.has(dep)) queue.push(dep);
    }
  }

  return [...closure];
}

// All package names discoverable under packages/*, for callers that want to
// enumerate every package rather than query one by name.
export function getAllPackageNames() {
  return [...loadManifests().keys()];
}

// Reverse of getTransitiveClosure: every package that transitively depends
// ON pkgName, rather than what pkgName itself depends on. Required by R10's
// "Determine affected packages" CI step (Task 9) — a changed package must
// expand to everything that could break downstream of it, not to its own
// dependencies. Built by asking, for every other real package, whether
// pkgName appears in that package's own forward getTransitiveClosure(); this
// repo's workspace graph (17 packages) is small enough that recomputing the
// forward closure per candidate is simple and fast enough that a separate
// memoized reverse-adjacency structure would be premature.
export function getReverseTransitiveClosure(pkgName) {
  requireManifest(pkgName); // validates pkgName exists, same error as getDirectDependencies/getTransitiveClosure

  const dependents = [];
  for (const candidate of getAllPackageNames()) {
    if (candidate === pkgName) continue;
    if (getTransitiveClosure(candidate).includes(pkgName)) {
      dependents.push(candidate);
    }
  }
  return dependents;
}
