// scripts/provenance/affected-packages.test.mjs
//
// Tests for affected-packages.mjs's pure changed-files -> affected-packages
// computation (R10 / Task 9's "Determine affected packages" CI step logic).
// These exercise computeAffectedPackages directly with hand-built changed
// file lists (no live git fixture needed — the git-diff resolution itself
// is a thin, untested-here wrapper around already-proven primitives:
// baseline-lib.mjs's isBaselineOnlyDiff uses the identical
// `git diff --name-only <mergeBase>...HEAD` shape and is tested elsewhere),
// but assert against this repo's REAL, current workspace dependency graph
// via workspace-graph.mjs's getReverseTransitiveClosure — same
// real-data-not-fixture convention as workspace-graph.test.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAffectedPackages, mapChangedFileToPackageName } from "./affected-packages.mjs";
import { getAllPackageNames, getReverseTransitiveClosure } from "./workspace-graph.mjs";

const ALL_SHORT_NAMES = getAllPackageNames()
  .map((name) => name.replace(/^@ultimate\//, ""))
  .sort();

test("mapChangedFileToPackageName extracts the short package dir name from a packages/<name>/... path", () => {
  assert.strictEqual(mapChangedFileToPackageName("packages/uix-data/src/index.ts"), "uix-data");
  assert.strictEqual(mapChangedFileToPackageName("packages/ng/package.json"), "ng");
});

test("mapChangedFileToPackageName returns null for a path not under packages/", () => {
  assert.strictEqual(mapChangedFileToPackageName("docs/architecture/PERFORMANCE.md"), null);
  assert.strictEqual(
    mapChangedFileToPackageName("scripts/provenance/validate-provenance.mjs"),
    null
  );
  assert.strictEqual(mapChangedFileToPackageName("package.json"), null);
});

// --- Required case (a): a single leaf-package change -----------------
//
// task-9-brief.md verification (a): a single leaf-package change (e.g.
// only packages/uix-data/src/... changed) correctly identifies just
// uix-data plus whatever legitimately depends on it.

test("computeAffectedPackages: a change under packages/uix-data/src/ identifies uix-data plus its real dependents, nothing else", () => {
  const changedFiles = ["packages/uix-data/src/some-file.ts"];
  const affected = computeAffectedPackages(changedFiles);

  const expectedDependents = getReverseTransitiveClosure("@ultimate/uix-data").map((n) =>
    n.replace(/^@ultimate\//, "")
  );
  const expected = ["uix-data", ...expectedDependents].sort();

  assert.deepEqual(affected, expected);
});

test("computeAffectedPackages: a change under a real leaf-in-reverse package (packages/cli/src/) identifies only cli itself", () => {
  // @ultimate/cli has zero real dependents in the current graph (see
  // workspace-graph.test.mjs's equivalent getReverseTransitiveClosure
  // assertion) — a genuine single-package result with no expansion.
  const changedFiles = ["packages/cli/src/index.ts"];
  const affected = computeAffectedPackages(changedFiles);
  assert.deepEqual(affected, ["cli"]);
});

// --- Required case (b): a widely-depended-on package change -----------
//
// task-9-brief.md verification (b): a widely-depended-on package change
// (e.g. packages/uix-utils/src/...) correctly identifies uix-utils plus
// EVERY real downstream package: uix-styled, uix-motion, uix-data,
// ng-core, react-core, vue-core, ng, react, vue, themes — verified here
// against the real dependency graph (matches task-9-brief.md's exact list
// and workspace-graph.test.mjs's dedicated getReverseTransitiveClosure
// assertion for uix-utils).

test("computeAffectedPackages: a change under packages/uix-utils/src/ identifies uix-utils plus every real downstream package", () => {
  const changedFiles = ["packages/uix-utils/src/deeply/nested/file.ts"];
  const affected = computeAffectedPackages(changedFiles);

  const expected = [
    "uix-utils",
    "uix-styled",
    "uix-motion",
    "uix-data",
    "ng-core",
    "react-core",
    "vue-core",
    "ng",
    "react",
    "vue",
    "themes",
  ].sort();

  assert.deepEqual(affected, expected);
});

test("computeAffectedPackages: a change to packages/uix-utils/package.json (manifest, not src/) also counts as a package change", () => {
  const changedFiles = ["packages/uix-utils/package.json"];
  const affected = computeAffectedPackages(changedFiles);
  assert.ok(affected.includes("uix-utils"));
  assert.ok(
    affected.includes("uix-styled"),
    "uix-styled must still be pulled in via the reverse closure"
  );
});

// --- Non-package changes and multi-package diffs -----------------------

// ADR-069 replaced the earlier contract here: a workflow or tool-read docs
// change used to select no package (the fail-open gap, research F-2).
test("computeAffectedPackages: a non-package change that is not docs-only widens to every package", () => {
  const changedFiles = [
    "docs/architecture/PERFORMANCE.md",
    "README.md",
    ".github/workflows/ci.yml",
  ];
  assert.deepEqual(computeAffectedPackages(changedFiles), ALL_SHORT_NAMES);
});

test("computeAffectedPackages returns an empty list when every changed file is docs-only Markdown", () => {
  assert.deepEqual(computeAffectedPackages(["README.md", "docs/superpowers/plans/x.md"]), []);
});

test("computeAffectedPackages ignores a changed path under packages/uix/ (not a real workspace package — no package.json)", () => {
  const changedFiles = ["packages/uix/some-shared-asset.css"];
  assert.deepEqual(computeAffectedPackages(changedFiles), []);
});

test("computeAffectedPackages unions and deduplicates results across multiple changed packages in one diff", () => {
  const changedFiles = ["packages/cli/src/index.ts", "packages/uix-data/src/index.ts"];
  const affected = computeAffectedPackages(changedFiles);

  const uixDataDependents = getReverseTransitiveClosure("@ultimate/uix-data").map((n) =>
    n.replace(/^@ultimate\//, "")
  );
  const expected = [...new Set(["cli", "uix-data", ...uixDataDependents])].sort();

  assert.deepEqual(affected, expected);
});

test("computeAffectedPackages result is always sorted with no duplicates", () => {
  const changedFiles = [
    "packages/uix-utils/src/a.ts",
    "packages/uix-utils/src/b.ts",
    "packages/ng/src/c.ts",
  ];
  const affected = computeAffectedPackages(changedFiles);
  const sortedUnique = [...new Set(affected)].sort();
  assert.deepEqual(affected, sortedUnique);
});

// --- ADR-069: root and shared changes widen to every package ------------
//
// A changed path outside packages/ that is not docs-only Markdown (the
// lockfile, root config, scripts/, apps/, workflows) can affect any
// package, so it must select all of them rather than none.

test("computeAffectedPackages: a lockfile change affects every package", () => {
  assert.deepEqual(computeAffectedPackages(["pnpm-lock.yaml"]), ALL_SHORT_NAMES);
  assert.equal(ALL_SHORT_NAMES.length, 17);
});

test("computeAffectedPackages: a scripts/ change affects every package", () => {
  assert.deepEqual(computeAffectedPackages(["scripts/provenance/x.mjs"]), ALL_SHORT_NAMES);
});

test("computeAffectedPackages: a docs-only change affects no package", () => {
  assert.deepEqual(computeAffectedPackages(["docs/superpowers/specs/x-design.md"]), []);
});
