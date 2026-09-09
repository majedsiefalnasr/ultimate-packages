// scripts/provenance/workspace-graph.test.mjs
//
// Tests for workspace-graph.mjs's direct-dependency and transitive-closure
// computation. These are real assertions against this repo's actual, current
// packages/*/package.json files (not fixtures) — R8's requirement, since
// this is exactly the kind of fact that must stay correct as dependencies
// evolve rather than getting silently invalidated by a stale hardcoded list.

import { test } from "node:test";
import assert from "node:assert/strict";
import { getDirectDependencies, getTransitiveClosure, getAllPackageNames } from "./workspace-graph.mjs";

test("getDirectDependencies('@ultimate/uix-utils') returns an empty array (a real leaf package)", () => {
  assert.deepEqual(getDirectDependencies("@ultimate/uix-utils"), []);
});

test("getDirectDependencies('@ultimate/ai') returns its 2 real workspace deps", () => {
  const deps = getDirectDependencies("@ultimate/ai").sort();
  assert.deepEqual(deps, ["@ultimate/component-metadata", "@ultimate/component-schema"]);
});

test("getDirectDependencies('@ultimate/ng') includes '@ultimate/themes' — a real devDependency-only edge, not silently dropped", () => {
  const deps = getDirectDependencies("@ultimate/ng");
  assert.ok(
    deps.includes("@ultimate/themes"),
    "@ultimate/ng's package.json declares @ultimate/themes only under devDependencies (used for its Angular theming tests) — getDirectDependencies must still surface it as a direct workspace edge"
  );
});

test("getDirectDependencies throws for an unknown package name", () => {
  assert.throws(() => getDirectDependencies("@ultimate/does-not-exist"), /unknown package/);
});

// --- getTransitiveClosure("@ultimate/ng") -----------------------------
//
// Required case #1 (task-8-brief.md verification): must return exactly the
// 7 packages this repo's real dependency map has today, including the real
// ng -> themes cross-edge (themes is a devDependency of ng, not a
// dependencies entry — see workspace-graph.mjs's header comment for why the
// closure algorithm is two-tiered to surface this edge without also pulling
// themes' own react/vue devDependencies transitively into ng's closure).

test("getTransitiveClosure('@ultimate/ng') returns exactly the real 7-package closure, including the themes cross-edge", () => {
  const closure = getTransitiveClosure("@ultimate/ng").sort();
  const expected = [
    "@ultimate/ng-core",
    "@ultimate/themes",
    "@ultimate/uix-data",
    "@ultimate/uix-motion",
    "@ultimate/uix-styled",
    "@ultimate/uix-styles",
    "@ultimate/uix-utils",
  ].sort();
  assert.deepEqual(closure, expected);
});

test("getTransitiveClosure('@ultimate/ng') does not include ng's own name", () => {
  const closure = getTransitiveClosure("@ultimate/ng");
  assert.ok(!closure.includes("@ultimate/ng"));
});

// --- getTransitiveClosure("@ultimate/themes") --------------------------
//
// Required case (task-8-brief.md verification): themes -> react/vue is the
// other half of the real cross-edge — themes' own package.json declares
// react and vue only under devDependencies (used for its cross-framework
// rendering tests), proving getDirectDependencies (used at the BFS root)
// surfaces devDependency-only workspace edges rather than assuming a
// "framework package = dependency leaf" shortcut.

test("getTransitiveClosure('@ultimate/themes') includes both '@ultimate/react' and '@ultimate/vue'", () => {
  const closure = getTransitiveClosure("@ultimate/themes");
  assert.ok(closure.includes("@ultimate/react"), "themes' closure must include react");
  assert.ok(closure.includes("@ultimate/vue"), "themes' closure must include vue");
});

test("getTransitiveClosure('@ultimate/themes') also includes react-core and vue-core (real dependencies of react/vue)", () => {
  const closure = getTransitiveClosure("@ultimate/themes");
  assert.ok(closure.includes("@ultimate/react-core"));
  assert.ok(closure.includes("@ultimate/vue-core"));
});

// --- Sanity checks over every real package ------------------------------

test("getTransitiveClosure is a superset of getDirectDependencies (dependencies-only) for every real package", () => {
  for (const pkgName of getAllPackageNames()) {
    const closure = new Set(getTransitiveClosure(pkgName));
    // Direct dependencies-only edges (not devDependencies) must always be
    // present in the closure — devDependency-only edges (like ng->themes)
    // are additionally present at the root but are not asserted here since
    // that's the dedicated ng/themes cases above.
    for (const dep of getDirectDependencies(pkgName)) {
      assert.ok(
        closure.has(dep) || dep === pkgName,
        `${pkgName}'s closure should contain its direct dep ${dep}`
      );
    }
  }
});

test("getTransitiveClosure('@ultimate/component-schema') is empty (a real leaf with zero workspace deps)", () => {
  assert.deepEqual(getTransitiveClosure("@ultimate/component-schema"), []);
});

test("getTransitiveClosure throws for an unknown package name", () => {
  assert.throws(() => getTransitiveClosure("@ultimate/does-not-exist"), /unknown package/);
});

test("getAllPackageNames includes all 17 real publishable packages", () => {
  const names = getAllPackageNames();
  assert.strictEqual(names.length, 17, `expected 17 packages, got ${names.length}: ${names}`);
  for (const expected of [
    "@ultimate/ai",
    "@ultimate/cli",
    "@ultimate/component-metadata",
    "@ultimate/component-schema",
    "@ultimate/mcp",
    "@ultimate/ng",
    "@ultimate/ng-core",
    "@ultimate/react",
    "@ultimate/react-core",
    "@ultimate/themes",
    "@ultimate/uix-data",
    "@ultimate/uix-motion",
    "@ultimate/uix-styled",
    "@ultimate/uix-styles",
    "@ultimate/uix-utils",
    "@ultimate/vue",
    "@ultimate/vue-core",
  ]) {
    assert.ok(names.includes(expected), `expected getAllPackageNames to include ${expected}`);
  }
});
