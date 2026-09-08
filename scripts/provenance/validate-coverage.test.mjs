// scripts/provenance/validate-coverage.test.mjs
//
// Tests for validate-coverage.mjs's two-step baseline acceptance lifecycle
// (R7). Exercises the pure evaluatePackageCoverage() decision function
// directly with hand-written fixture inputs — merge-base baseline value,
// current measurement, and diff-shape boolean are all passed in directly,
// so no real git state or measured coverage report is needed for any of
// these cases. This mirrors validate-bundle-size.test.mjs's approach for
// R6 (see task-6-brief.md's testing guidance, reused verbatim for R7 per
// task-7-brief.md).
//
// Also includes a light parser test for parsePhase10CoverageTable(), the
// one other pure function in the module worth covering directly.

import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluatePackageCoverage, parsePhase10CoverageTable } from "./validate-coverage.mjs";

// --- Stage 1: no prior baseline ------------------------------------------

test("Stage 1 (no prior baseline): informational only, ok=true", () => {
  const result = evaluatePackageCoverage({
    packageName: "synthetic-pkg",
    isBaselineOnly: false,
    mergeBasePct: undefined, // no entry for this package at the merge-base
    freshMeasuredPct: 42.3,
    headWrittenPct: undefined,
  });

  assert.strictEqual(result.ok, true, "first-ever measurement must not fail the gate");
  assert.match(result.message, /INFO/);
  assert.match(result.message, /synthetic-pkg/);
});

// --- Stage 2 pass: 1-point drop, under the 2-point threshold -------------

test("Stage 2 pass: 85.0% -> 84.0% (1-point drop) is under the 2-point threshold", () => {
  const result = evaluatePackageCoverage({
    packageName: "uix-utils",
    isBaselineOnly: false,
    mergeBasePct: 85.0,
    freshMeasuredPct: 84.0,
    headWrittenPct: undefined,
  });

  assert.strictEqual(result.ok, true, "1-point drop must pass");
  assert.match(result.message, /OK/);
});

// --- Stage 2 fail: 3-point drop, over the 2-point threshold (legitimate) -

test("Stage 2 fail (implementation PR, legitimate failure): 85.0% -> 82.0% (3-point drop) exceeds the 2-point threshold and names the package", () => {
  const result = evaluatePackageCoverage({
    packageName: "uix-utils",
    isBaselineOnly: false,
    mergeBasePct: 85.0,
    freshMeasuredPct: 82.0,
    headWrittenPct: undefined,
  });

  assert.strictEqual(result.ok, false, "3-point drop must fail");
  assert.match(result.message, /REGRESSION FAIL/);
  assert.match(result.message, /uix-utils/);
});

// --- Same-diff-bypass negative test: THE most important test -------------
//
// Simulates a PR that both dropped a package's coverage by 3 points AND
// edited PERFORMANCE.md's HEAD-version baseline entry to mask it in the
// *same* diff as the source change. Because the diff touches the
// package's own source (isBaselineOnly=false), the regression branch
// runs — it must compare against the merge-base's value (85.0%,
// unedited) and must NEVER read or trust headWrittenPct at all. This
// proves the integrity-check branch cannot be reached by a
// source-changing PR no matter what it also writes into PERFORMANCE.md.

test("same-diff-bypass: a PR that changes source AND edits HEAD's PERFORMANCE.md to match still fails against the merge-base value", () => {
  const result = evaluatePackageCoverage({
    packageName: "uix-utils",
    isBaselineOnly: false, // diff touches packages/uix-utils/src/** too — NOT baseline-only
    mergeBasePct: 85.0, // merge-base's real, unedited recorded baseline
    freshMeasuredPct: 82.0, // the actual new, regressed coverage (3-point drop)
    headWrittenPct: 82.0, // the PR dishonestly/optimistically wrote this into HEAD's PERFORMANCE.md
  });

  assert.strictEqual(
    result.ok,
    false,
    "a source-changing PR must still fail the regression check even if it also edited PERFORMANCE.md to match its own new coverage — the regression branch must never consult headWrittenPct"
  );
  assert.match(result.message, /REGRESSION FAIL/);
  assert.match(result.message, /85/);
  assert.match(result.message, /82/);
});

// --- Baseline-only PR, honest value (lifecycle Step 2) --------------------

test("baseline-only PR, honest value: integrity check passes regardless of the merge-base's old value or the >2-point relationship", () => {
  const result = evaluatePackageCoverage({
    packageName: "uix-utils",
    isBaselineOnly: true, // diff touches only PERFORMANCE.md for this package
    mergeBasePct: 85.0, // old, stale merge-base value — must be irrelevant here
    freshMeasuredPct: 82.0, // real, current re-measurement of unchanged coverage
    headWrittenPct: 82.0, // the PR writes exactly the truthful, fresh value
  });

  assert.strictEqual(
    result.ok,
    true,
    "a truthful baseline-only PR must pass the integrity check even though 85 -> 82 exceeds the 2-point threshold, proving the regression branch is skipped entirely, not merely satisfied"
  );
  assert.match(result.message, /baseline-only/);
});

// --- Baseline-only PR, dishonest value (lifecycle Step 2 negative case) ---

test("baseline-only PR, dishonest value: integrity check fails when the written value does not match the fresh re-measurement", () => {
  const result = evaluatePackageCoverage({
    packageName: "uix-utils",
    isBaselineOnly: true,
    mergeBasePct: 85.0,
    freshMeasuredPct: 82.0, // real re-measured coverage
    headWrittenPct: 85.0, // false value written by the PR (doesn't match reality)
  });

  assert.strictEqual(
    result.ok,
    false,
    "the integrity check must be a real, enforced check, not a rubber stamp for any baseline-only diff"
  );
  assert.match(result.message, /INTEGRITY FAIL/);
});

// --- Absolute-not-relative confirmation test ------------------------------
//
// baseline 10.0%, current 8.3% — a 1.7-point ABSOLUTE drop (must pass,
// under the 2-point threshold), which is ALSO a 17% RELATIVE drop
// ((10.0-8.3)/10.0 = 0.17). If the implementation mistakenly reused R6's
// relative-percentage formula ((old-new)/old > 0.15) instead of R7's
// absolute-delta formula (old-new > 2.0), this exact fixture would
// incorrectly fail (a 17% relative drop clears R6's strict >15%
// threshold with margin — deliberately not the 8.5% boundary case, which
// sits at exactly 15% relative and would pass even under a relative-
// formula mutant due to R6's strict `>` comparison, making it a
// non-discriminating fixture; see Task 7's task-reviewer finding). This
// is a direct regression test against exactly the terminology bug the
// spec's Minor review finding fixed for R7 — it must never silently
// reappear in the implementation.

test("absolute-not-relative confirmation: 10.0% -> 8.3% (1.7-point absolute drop, ALSO a 17% relative drop) passes under the absolute-delta formula", () => {
  const result = evaluatePackageCoverage({
    packageName: "synthetic-pkg",
    isBaselineOnly: false,
    mergeBasePct: 10.0,
    freshMeasuredPct: 8.3,
    headWrittenPct: undefined,
  });

  assert.strictEqual(
    result.ok,
    true,
    "a 1.7-point absolute drop must pass R7's 2-point absolute threshold, even though it is also a 17% relative drop that would fail R6's relative formula — proves evaluatePackageCoverage() uses (mergeBasePct - freshMeasuredPct), never a relative ratio"
  );
  assert.match(result.message, /OK/);
});

// --- parsePhase10CoverageTable: light coverage of the table parser -------

test("parsePhase10CoverageTable extracts package coverage only from the Phase 10 Coverage section, ignoring the Package size table above it", () => {
  const markdown = [
    "# Performance Baseline",
    "",
    "## Phase 2 — UltimateNG",
    "",
    "### Package size",
    "",
    "| Package          | dist/ size | dist/ file count | index.mjs gzip size |",
    "| ---------------- | ---------- | ----------------- | -------------------- |",
    "| packages/ng-core | 105.0 KB   | 6                | 9.91 KB             |",
    "",
    "## Phase 10 — CI/Security/Quality Gates",
    "",
    "### Package size",
    "",
    "| Package | dist/ size | dist/ file count | index.mjs gzip size |",
    "| ------- | ---------- | ----------------- | -------------------- |",
    "| packages/uix-utils | 100.0 KB | 24 | 13.30 KB |",
    "",
    "### Coverage",
    "",
    "| Package | line-coverage % |",
    "| ------- | ---------------- |",
    "| packages/uix-utils | 85.0 |",
    "| packages/ng | 72.4 |",
    "",
  ].join("\n");

  const coverage = parsePhase10CoverageTable(markdown);

  assert.strictEqual(coverage.get("uix-utils"), 85.0, "must read the line-coverage % column");
  assert.strictEqual(coverage.get("ng"), 72.4, "must read the line-coverage % column");
  assert.strictEqual(
    coverage.has("ng-core"),
    false,
    "should not pick up rows from the Phase 2 Package size table above the Phase 10 Coverage heading"
  );
});

test("parsePhase10CoverageTable returns an empty map when there is no Phase 10 Coverage section yet", () => {
  const markdown = [
    "# Performance Baseline",
    "",
    "## Phase 10 — CI/Security/Quality Gates",
    "",
    "### Package size",
    "",
    "no coverage table yet",
  ].join("\n");

  const coverage = parsePhase10CoverageTable(markdown);

  assert.strictEqual(coverage.size, 0);
});
