// scripts/provenance/validate-coverage.test.mjs
//
// Tests for validate-coverage.mjs's two-step baseline acceptance lifecycle
// (R7). Real committed Git-diff fixtures exercise the CLI's branch selection;
// pure evaluator fixtures preserve the threshold and integrity controls.
//
// Also includes a light parser test for parsePhase10CoverageTable(), the
// one other pure function in the module worth covering directly.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import {
  ALL_PACKAGES,
  FRESHNESS_TOLERANCE_SECONDS,
  evaluatePackageCoverage,
  evaluateReportFreshness,
  measuredSourceRoots,
  packageCoverageSummaryPath,
  parsePhase10CoverageTable,
} from "./validate-coverage.mjs";

// Exercise the CLI against committed Git diffs. A pure evaluator test cannot
// detect an incorrect baseline-only classification of vitest.config.ts.
const validatorPath = fileURLToPath(new URL("./validate-coverage.mjs", import.meta.url));

function runGit(cwd, ...args) {
  return execFileSync(
    "git",
    ["-c", "commit.gpgsign=false", "-c", "core.fsmonitor=false", ...args],
    {
      cwd,
      encoding: "utf8",
    }
  ).trim();
}

function coverageTable(overrides = {}) {
  return [
    "## Phase 10 — CI/Security/Quality Gates",
    "### Coverage",
    "| Package | line-coverage % |",
    "| ------- | ---------------- |",
    ...ALL_PACKAGES.map((name) => `| packages/${name} | ${overrides[name] ?? 85.0} |`),
    "",
  ].join("\n");
}

const performancePath = "docs/architecture/PERFORMANCE.md";

// Builds a temporary repository with a committed merge-base and a committed
// HEAD, writes a fresh coverage report per package, and runs the validator
// CLI with --base-ref. `headFiles` maps repository paths to HEAD contents;
// `measured` overrides the fresh line-coverage % (default 85).
// `sourceFiles` maps uncommitted repository paths to a modification time in
// seconds since the epoch; they are written after the commits, before the
// reports. `reportMtimes` sets a package's report modification time in seconds
// (default: now), which is how a stale report is simulated.
function runCoverageCli({
  baseMarkdown,
  headFiles,
  measured = {},
  baseRef = "baseline",
  sourceFiles = {},
  reportMtimes = {},
}) {
  const root = mkdtempSync(join(tmpdir(), "gap-091-coverage-"));
  try {
    runGit(root, "init", "-q");
    runGit(root, "config", "user.name", "Coverage Fixture");
    runGit(root, "config", "user.email", "coverage-fixture@example.invalid");
    mkdirSync(join(root, dirname(performancePath)), { recursive: true });
    writeFileSync(join(root, performancePath), baseMarkdown);
    runGit(root, "add", performancePath);
    runGit(root, "commit", "-qm", "baseline");
    runGit(root, "branch", "baseline");

    for (const [relativePath, content] of Object.entries(headFiles)) {
      const absolutePath = join(root, relativePath);
      if (content === null) {
        runGit(root, "rm", "-q", relativePath);
        continue;
      }
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content);
      runGit(root, "add", relativePath);
    }
    runGit(root, "commit", "-qm", "feature");

    for (const [relativePath, mtimeSeconds] of Object.entries(sourceFiles)) {
      const absolutePath = join(root, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, "// source\n");
      utimesSync(absolutePath, mtimeSeconds, mtimeSeconds);
    }

    for (const name of ALL_PACKAGES) {
      const reportPath = join(root, packageCoverageSummaryPath(name));
      mkdirSync(dirname(reportPath), { recursive: true });
      writeFileSync(
        reportPath,
        JSON.stringify({ total: { lines: { pct: measured[name] ?? 85 } } })
      );
      if (reportMtimes[name] !== undefined) {
        utimesSync(reportPath, reportMtimes[name], reportMtimes[name]);
      }
    }

    const result = spawnSync(process.execPath, [validatorPath, "--base-ref", baseRef], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "core.fsmonitor",
        GIT_CONFIG_VALUE_0: "false",
      },
    });
    return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function runDiffFixture({ packageName, changedPaths, writtenPct = 82, measuredPct = 82 }) {
  const headFiles = {};
  for (const relativePath of changedPaths) {
    headFiles[relativePath] =
      relativePath === performancePath
        ? coverageTable({ [packageName]: writtenPct })
        : "// changed in feature commit\n";
  }
  return runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles,
    measured: { [packageName]: measuredPct },
  });
}

for (const packageName of ["react", "vue"]) {
  test(`${packageName}: committed config plus baseline edit cannot bypass merge-base regression`, () => {
    const result = runDiffFixture({
      packageName,
      changedPaths: [`packages/${packageName}/vitest.config.ts`, performancePath],
    });
    assert.strictEqual(result.status, 1, result.output);
    assert.match(
      result.output,
      new RegExp(`${packageName}: REGRESSION FAIL.*85% -> 82\\.0%.*-3\\.0 points`)
    );
    assert.doesNotMatch(result.output, new RegExp(`${packageName}: OK \\(baseline-only`));
  });

  test(`${packageName}: honest committed PERFORMANCE.md-only edit uses integrity`, () => {
    const result = runDiffFixture({ packageName, changedPaths: [performancePath] });
    assert.strictEqual(result.status, 0, result.output);
    assert.match(result.output, new RegExp(`${packageName}: OK \\(baseline-only, integrity check`));
  });

  test(`${packageName}: dishonest committed PERFORMANCE.md-only edit fails integrity`, () => {
    const result = runDiffFixture({
      packageName,
      changedPaths: [performancePath],
      writtenPct: 84,
    });
    assert.strictEqual(result.status, 1, result.output);
    assert.match(result.output, new RegExp(`${packageName}: INTEGRITY FAIL`));
  });

  for (const [label, secondPath] of [
    ["source", `packages/${packageName}/src/runtime.ts`],
    ["unrelated file", "docs/unrelated.md"],
  ]) {
    test(`${packageName}: ${label} plus baseline edit uses merge-base regression`, () => {
      const result = runDiffFixture({
        packageName,
        changedPaths: [secondPath, performancePath],
      });
      assert.strictEqual(result.status, 1, result.output);
      assert.match(result.output, new RegExp(`${packageName}: REGRESSION FAIL.*85% -> 82\\.0%`));
    });
  }
}

// ADR-066 inverts the earlier "other package R7 keeps its existing
// per-package diff classification" test: a vitest.config.ts change is
// package-affecting for every package, so it takes the regression path.
test("other package R7: committed vitest.config.ts plus baseline edit uses merge-base regression", () => {
  const result = runDiffFixture({
    packageName: "uix-utils",
    changedPaths: ["packages/uix-utils/vitest.config.ts", performancePath],
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /uix-utils: REGRESSION FAIL.*85% -> 82\.0%.*-3\.0 points/);
  assert.doesNotMatch(result.output, /baseline-only/);
});

// --- ADR-066: integrity applies only to rows the diff changes ---------------

const STAGE1_APPENDIX = [
  "## Stage 1 — Performance baselines (ADR-057)",
  "",
  "Measured in the pinned Playwright CI environment of record.",
  "",
  "### P1 — Bundle size",
  "",
  "| Package | dist/ size | dist/ file count | index.mjs gzip size |",
  "| ------- | ---------- | ---------------- | ------------------- |",
  "| packages/ng | 70.0 KB | 4 | 12.30 KB |",
  "| packages/react | 50.0 KB | 3 | 9.10 KB |",
  "",
  "### P2 — Component creation",
  "",
  "| Package | Median (ms) | p95 (ms) | Runs |",
  "| ------- | ----------- | -------- | ---- |",
  "| react | 12.3 | 14.1 | 30 |",
  "| vue | 11.8 | 13.0 | 30 |",
  "| ng | 15.2 | 17.9 | 30 |",
  "",
].join("\n");

test("changed row on a PERFORMANCE.md-only diff gets integrity; unchanged stale row gets regression", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable({ react: "85.0", cli: "86.9" }),
    headFiles: { [performancePath]: coverageTable({ react: "90.0", cli: "86.9" }) },
    measured: { react: 90.0, cli: 86.3 },
  });
  assert.strictEqual(result.status, 0, result.output);
  assert.match(result.output, /react: OK \(baseline-only, integrity check: 90% matches/);
  assert.match(result.output, /cli: OK \(86\.9% -> 86\.3%, -0\.6 points\)/);
  assert.doesNotMatch(result.output, /cli: OK \(baseline-only/);
});

test("changed row on a PERFORMANCE.md-only diff fails integrity when it does not match", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable({ react: "85.0", cli: "86.9" }),
    headFiles: { [performancePath]: coverageTable({ react: "95.0", cli: "86.9" }) },
    measured: { react: 90.0, cli: 86.3 },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /react: INTEGRITY FAIL/);
  assert.doesNotMatch(result.output, /cli: .*FAIL/);
});

test("appending a Stage 1 table with package-named rows leaves stale rows on the regression path", () => {
  const base = coverageTable({ react: "85.0", ng: "88.6" });
  const result = runCoverageCli({
    baseMarkdown: base,
    headFiles: { [performancePath]: `${base}\n${STAGE1_APPENDIX}` },
    measured: { react: 89.0, ng: 90.1 },
  });
  assert.strictEqual(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /integrity/i);
  assert.match(result.output, /react: OK \(85% -> 89\.0%/);
});

test("a coverage row removed at HEAD fails as baseline removed", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: {
      [performancePath]: coverageTable()
        .split("\n")
        .filter((line) => !line.includes("| packages/cli |"))
        .join("\n"),
    },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /cli: baseline removed/);
});

test("an unreadable merge-base ref fails closed", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    baseRef: "no-such-ref-adr-066",
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /\[validate-coverage\] FAIL: could not read PERFORMANCE\.md/);
});

test("a merge-base PERFORMANCE.md with no Phase 10 coverage table fails closed", () => {
  const result = runCoverageCli({
    baseMarkdown: "# Performance Baseline\n\nNo Phase 10 section.\n",
    headFiles: { [performancePath]: coverageTable() },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /merge-base PERFORMANCE\.md has no Phase 10 coverage rows/);
});

test("PERFORMANCE.md deleted at HEAD fails closed", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { [performancePath]: null },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /PERFORMANCE\.md does not exist at HEAD/);
});

test("parsePhase10CoverageTable stops at the next heading after its table", () => {
  const coverage = parsePhase10CoverageTable(
    `${coverageTable({ react: "85.0" })}\n${STAGE1_APPENDIX}`
  );
  assert.strictEqual(coverage.get("react"), 85.0);
  assert.strictEqual(coverage.size, ALL_PACKAGES.length);
});

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

test("Stage 2 boundary: an exact 2-point drop remains permitted", () => {
  const result = evaluatePackageCoverage({
    packageName: "react",
    isBaselineOnly: false,
    mergeBasePct: 85.0,
    freshMeasuredPct: 83.0,
    headWrittenPct: undefined,
  });
  assert.strictEqual(result.ok, true);
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

// --- Report freshness (coverage-baselines-and-report-freshness Spec R1) -----------

const T0 = 1_800_000_000_000; // a fixed instant, in ms
const SEC = 1000;

test("FRESHNESS_TOLERANCE_SECONDS is a small positive number", () => {
  assert.equal(typeof FRESHNESS_TOLERANCE_SECONDS, "number");
  assert.ok(FRESHNESS_TOLERANCE_SECONDS > 0 && FRESHNESS_TOLERANCE_SECONDS <= 10);
});

test("freshness: a report newer than every source is ok", () => {
  const result = evaluateReportFreshness({
    reportMtimeMs: T0 + 60 * SEC,
    sourceMtimes: [
      { path: "packages/x/src/a.ts", mtimeMs: T0 },
      { path: "packages/x/src/b.ts", mtimeMs: T0 + 10 * SEC },
    ],
    toleranceSeconds: 2,
  });
  assert.deepEqual(result, { ok: true });
});

test("freshness: a report older than one source by more than the tolerance is stale and names that source", () => {
  const result = evaluateReportFreshness({
    reportMtimeMs: T0,
    sourceMtimes: [
      { path: "packages/x/src/old.ts", mtimeMs: T0 - 100 * SEC },
      { path: "packages/x/src/new.ts", mtimeMs: T0 + 3 * SEC },
    ],
    toleranceSeconds: 2,
  });
  assert.equal(result.ok, false);
  assert.equal(result.newestPath, "packages/x/src/new.ts");
  assert.equal(result.newestMtimeMs, T0 + 3 * SEC);
  assert.equal(result.reportMtimeMs, T0);
});

test("freshness: a source newer than the report by less than the tolerance is still ok", () => {
  const result = evaluateReportFreshness({
    reportMtimeMs: T0,
    sourceMtimes: [{ path: "packages/x/src/a.ts", mtimeMs: T0 + 1 * SEC }],
    toleranceSeconds: 2,
  });
  assert.deepEqual(result, { ok: true });
});

test("freshness: a source newer by exactly the tolerance is ok, one millisecond more is stale", () => {
  const at = evaluateReportFreshness({
    reportMtimeMs: T0,
    sourceMtimes: [{ path: "a", mtimeMs: T0 + 2 * SEC }],
    toleranceSeconds: 2,
  });
  const over = evaluateReportFreshness({
    reportMtimeMs: T0,
    sourceMtimes: [{ path: "a", mtimeMs: T0 + 2 * SEC + 1 }],
    toleranceSeconds: 2,
  });
  assert.equal(at.ok, true);
  assert.equal(over.ok, false);
});

test("freshness: equal times are ok", () => {
  const result = evaluateReportFreshness({
    reportMtimeMs: T0,
    sourceMtimes: [{ path: "a", mtimeMs: T0 }],
    toleranceSeconds: 2,
  });
  assert.deepEqual(result, { ok: true });
});

test("freshness: no source files means nothing to compare, so ok", () => {
  assert.deepEqual(
    evaluateReportFreshness({ reportMtimeMs: T0, sourceMtimes: [], toleranceSeconds: 2 }),
    { ok: true }
  );
});

test("measuredSourceRoots: Vitest-native packages measure src and vitest.config.ts", () => {
  assert.deepEqual(measuredSourceRoots("react"), [
    "packages/react/src",
    "packages/react/vitest.config.ts",
  ]);
});

test("measuredSourceRoots: ng and ng-core measure src and angular.json", () => {
  assert.deepEqual(measuredSourceRoots("ng"), ["packages/ng/src", "packages/ng/angular.json"]);
  assert.deepEqual(measuredSourceRoots("ng-core"), [
    "packages/ng-core/src",
    "packages/ng-core/angular.json",
  ]);
});

test("measuredSourceRoots: every gated package has a non-empty list under its own directory", () => {
  for (const name of ALL_PACKAGES) {
    const roots = measuredSourceRoots(name);
    assert.ok(roots.length > 0, name);
    for (const root of roots) assert.ok(root.startsWith(`packages/${name}/`), `${name}: ${root}`);
  }
});

// --- CLI: a stale report is rejected before any number is compared ---------------

const SEPTEMBER = Date.UTC(2026, 8, 9, 21, 20) / 1000;
const NOW = Math.floor(Date.now() / 1000);

test("a report older than a source file fails as stale and prints no percentage for it", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    sourceFiles: { "packages/uix-utils/src/index.ts": NOW },
    reportMtimes: { "uix-utils": NOW - 3600 },
  });
  assert.strictEqual(result.status, 1, result.output);
  const line = result.output.split("\n").find((l) => l.includes("uix-utils"));
  assert.match(line, /uix-utils: coverage report is stale/);
  assert.match(line, /packages\/uix-utils\/src\/index\.ts/);
  assert.doesNotMatch(line, /%/);
});

test("React and Vue reports left from September are reported stale, not as a regression", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable({ react: "89.69", vue: "92.13" }),
    headFiles: { "docs/unrelated.md": "changed\n" },
    measured: { react: 8.6, vue: 11.3 },
    sourceFiles: {
      "packages/react/src/index.ts": NOW,
      "packages/vue/src/index.ts": NOW,
    },
    reportMtimes: { react: SEPTEMBER, vue: SEPTEMBER },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /react: coverage report is stale/);
  assert.match(result.output, /vue: coverage report is stale/);
  assert.doesNotMatch(result.output, /REGRESSION FAIL/);
  assert.doesNotMatch(result.output, /8\.6%|11\.3%/);
});

test("ng is checked against its own angular.json and report path", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    sourceFiles: { "packages/ng/angular.json": NOW },
    reportMtimes: { ng: NOW - 3600 },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /ng: coverage report is stale.*packages\/ng\/angular\.json/);
});

test("a fresh report still goes through the existing regression path", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    measured: { "uix-utils": 82 },
    sourceFiles: { "packages/uix-utils/src/index.ts": NOW - 3600 },
    reportMtimes: { "uix-utils": NOW },
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /uix-utils: REGRESSION FAIL.*85% -> 82\.0%/);
  assert.doesNotMatch(result.output, /stale/);
});

test("a source file touched within the tolerance does not make a fresh report stale", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    sourceFiles: { "packages/uix-utils/src/index.ts": NOW + 1 },
    reportMtimes: { "uix-utils": NOW },
  });
  assert.strictEqual(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /stale/);
});

test("node_modules, dist, coverage and storybook-static under a package never make a report stale", () => {
  const result = runCoverageCli({
    baseMarkdown: coverageTable(),
    headFiles: { "docs/unrelated.md": "changed\n" },
    sourceFiles: {
      "packages/uix-utils/src/index.ts": NOW - 3600,
      "packages/uix-utils/src/node_modules/x/index.js": NOW + 3600,
      "packages/uix-utils/src/dist/out.js": NOW + 3600,
    },
    reportMtimes: { "uix-utils": NOW },
  });
  assert.strictEqual(result.status, 0, result.output);
});
