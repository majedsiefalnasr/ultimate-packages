#!/usr/bin/env node
// scripts/provenance/validate-coverage.mjs
//
// R7 line-coverage regression gate. For each of the 17 publishable
// packages, runs the merge-base-anchored, two-step baseline acceptance
// lifecycle described in task-6-brief.md's "R6/R7 baseline acceptance
// lifecycle" section (this task applies the identical lifecycle Task 6
// defined, with the coverage-specific numbers substituted):
//
//   - Baseline-only diff for this package (for React/Vue, the complete
//     diff touches only docs/architecture/PERFORMANCE.md; other packages
//     use baseline-lib.mjs's per-package classification, with their own
//     vitest.config.ts also package-affecting) AND the diff changes or adds
//     this package's row (ADR-066): run the INTEGRITY check — the value this
//     PR writes into PERFORMANCE.md must equal a fresh real measurement of
//     the package's current line coverage.
//   - A merge-base row removed at HEAD fails ("baseline removed"), as does
//     an unreadable PERFORMANCE.md or an empty merge-base table.
//   - Otherwise (including an unchanged row on a baseline-only diff): run the
//     REGRESSION check against the merge-base's own recorded baseline
//     value only — never a value the current diff itself wrote. No prior
//     entry: informational only (Stage 1). Prior entry: fail if the
//     ABSOLUTE percentage-point drop exceeds 2.0 points (never a
//     relative/ratio comparison — R7's threshold is a flat
//     percentage-point subtraction, a different shape from R6's 15%
//     relative-regression formula).
//
// This script never reads or trusts any PERFORMANCE.md value the current
// PR itself wrote for the regression branch — only the merge-base's.
//
// Coverage measurement: reads each package's own
// coverage/coverage-summary.json (Vitest-native packages, produced by
// `vitest run --coverage`) or, for ng/ng-core, coverage/<projectName>/
// coverage-summary.json (produced by `ng test --coverage`, which uses
// the same underlying Vitest 4.0.8 coverage engine bundled inside
// @angular/build — confirmed by inspecting @angular/build's installed
// unit-test builder source this session: reportsDirectory defaults to
// path.join("coverage", projectName)). Both shapes expose the same
// json-summary field this gate reads: total.lines.pct.

import {
  PERFORMANCE_MD_PATH,
  boundedTableRows,
  isBaselineOnlyDiff,
  readBaselineTables,
  selectBaselinePath,
} from "./baseline-lib.mjs";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REGRESSION_THRESHOLD_POINTS = 2.0;
const STRICT_BASELINE_PACKAGES = new Set(["react", "vue"]);

// Coverage configuration changes alter the R7 denominator. The shared R6
// detector does not classify vitest.config.ts as package-affecting, so:
//   - React/Vue (ADR-060): baseline-only only when the complete diff is
//     exactly PERFORMANCE.md;
//   - every other package (ADR-066): its own vitest.config.ts is
//     package-affecting, otherwise the shared per-package classification.
//     ng/ng-core configure coverage in angular.json, which this rule does
//     not cover.
// Git errors throw and fail the validator instead of falling through to the
// integrity path.
export function isCoverageBaselineOnlyDiff(mergeBaseSha, packageName) {
  const changedFiles = execFileSync(
    "git",
    ["diff", "--name-only", "-z", `${mergeBaseSha}...HEAD`, "--"],
    { encoding: "utf8" }
  )
    .split("\0")
    .filter(Boolean);

  if (STRICT_BASELINE_PACKAGES.has(packageName)) {
    return changedFiles.length === 1 && changedFiles[0] === PERFORMANCE_MD_PATH;
  }
  if (changedFiles.includes(`packages/${packageName}/vitest.config.ts`)) return false;
  return isBaselineOnlyDiff(mergeBaseSha, packageName);
}

// Explicit, exhaustive list of all 17 publishable packages (same set
// measure-package-size.mjs uses for R6). ng/ng-core's coverage report
// lives at a different relative path than the other 15 (see
// packageCoverageSummaryPath below), but all 17 are gated the same way.
export const ALL_PACKAGES = [
  "ai",
  "cli",
  "component-metadata",
  "component-schema",
  "mcp",
  "ng-core",
  "ng",
  "react-core",
  "react",
  "themes",
  "uix-data",
  "uix-motion",
  "uix-styled",
  "uix-styles",
  "uix-utils",
  "vue-core",
  "vue",
];

const ANGULAR_PACKAGES = new Set(["ng", "ng-core"]);

// Resolves each package's coverage-summary.json path. The 15 Vitest-native
// packages write to <pkg>/coverage/coverage-summary.json (this task's
// `reportsDirectory: "./coverage"` in each vitest.config.ts). ng/ng-core
// are driven through `ng test --coverage`, whose builder (confirmed by
// reading @angular/build@21.2.22's installed unit-test/runners/vitest/
// plugins.js this session) defaults reportsDirectory to
// path.join("coverage", projectName) — i.e. <pkg>/coverage/<pkg>/
// coverage-summary.json, one extra directory level versus the other 15.
export function packageCoverageSummaryPath(packageName) {
  const pkgRoot = join("packages", packageName);
  if (ANGULAR_PACKAGES.has(packageName)) {
    return join(pkgRoot, "coverage", packageName, "coverage-summary.json");
  }
  return join(pkgRoot, "coverage", "coverage-summary.json");
}

// Reads total.lines.pct from a package's real coverage-summary.json.
// This is Vitest's (and, via @angular/build's bundled Vitest 4.0.8,
// Angular's) own json-summary reporter output — empirically verified
// this session by running `vitest run --coverage` for real against
// packages/uix-utils and inspecting the produced
// coverage/coverage-summary.json: its top-level "total" object has a
// "lines" field shaped { total, covered, skipped, pct }, and .pct is
// exactly the line-coverage percentage number spec §4 R7 gates on.
export function readLineCoveragePct(summaryPath) {
  const raw = readFileSync(summaryPath, "utf8");
  const summary = JSON.parse(raw);
  return summary.total.lines.pct;
}

// Simple line-based Markdown table parser for the "### Coverage" table
// under "## Phase 10 — ...", mirroring
// validate-bundle-size.mjs's parsePhase10SizeTable. Extracts
// { packageDirName -> lineCoveragePct } from the "Package" and
// "line-coverage %" columns. Only the Phase 10 table is parsed, and parsing
// stops at the next "##"/"###" heading after that table starts.
export function parsePhase10CoverageTable(markdown) {
  const coverageByPackage = new Map();
  if (!markdown) return coverageByPackage;

  const phase10Index = markdown.indexOf("## Phase 10");
  if (phase10Index === -1) return coverageByPackage;

  const section = markdown.slice(phase10Index);
  const coverageHeadingIndex = section.indexOf("### Coverage");
  if (coverageHeadingIndex === -1) return coverageByPackage;

  const coverageSection = section.slice(coverageHeadingIndex + "### Coverage".length);
  const rowLines = boundedTableRows(coverageSection);

  for (const line of rowLines) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 2) continue; // need Package + line-coverage %
    if (cells[0].toLowerCase() === "package") continue; // header row
    if (/^-+$/.test(cells[0])) continue; // separator row

    const packageDirName = cells[0].replace(/^packages\//, "");
    const pctMatch = cells[1].match(/^([\d.]+)\s*%?$/);
    if (!pctMatch) continue;

    coverageByPackage.set(packageDirName, parseFloat(pctMatch[1]));
  }

  return coverageByPackage;
}

// --- Pure decision logic ----------------------------------------------
//
// Takes already-resolved inputs (no git/filesystem access) so tests can
// exercise every branch of the two-step lifecycle directly, without
// needing real git fixtures or real coverage reports for every case.
// This is the function the CLI wrapper below calls once per package with
// real, git-derived and measurement-derived inputs.
//
// Params:
//   packageName        - e.g. "uix-utils"
//   isBaselineOnly      - boolean, true when selectBaselinePath returns "integrity"
//   mergeBasePct        - number|undefined, the merge-base PERFORMANCE.md's recorded line-coverage % for this package
//   freshMeasuredPct    - number, a fresh re-measurement of the package's current line coverage
//   headWrittenPct      - number|undefined, the value the current diff's HEAD version of PERFORMANCE.md records for this package (only consulted in the baseline-only branch)
//
// Returns { ok: boolean, message: string }.
export function evaluatePackageCoverage({
  packageName,
  isBaselineOnly,
  mergeBasePct,
  freshMeasuredPct,
  headWrittenPct,
}) {
  if (isBaselineOnly) {
    // Integrity check: the value this PR writes into PERFORMANCE.md must
    // match reality — a fresh measurement of the package's own, unchanged
    // line coverage. Tolerance matches the table's own one-decimal-place
    // rounding (toFixed(1)-scale), consistent with Task 6's own
    // tolerance choice, not a new invented fudge factor.
    if (headWrittenPct === undefined) {
      return {
        ok: false,
        message: `${packageName}: baseline-only diff but PERFORMANCE.md has no entry to verify`,
      };
    }
    const diff = Math.abs(headWrittenPct - freshMeasuredPct);
    if (diff > 0.05) {
      return {
        ok: false,
        message: `${packageName}: INTEGRITY FAIL — PERFORMANCE.md writes ${headWrittenPct}% but fresh measurement is ${freshMeasuredPct.toFixed(1)}%`,
      };
    }
    return {
      ok: true,
      message: `${packageName}: OK (baseline-only, integrity check: ${headWrittenPct}% matches fresh measurement)`,
    };
  }

  // Regression branch: compares only against the merge-base's own
  // recorded baseline value, never a value the current diff itself wrote.
  if (mergeBasePct === undefined) {
    return {
      ok: true,
      message: `${packageName}: INFO (no prior baseline at merge-base — first measurement: ${freshMeasuredPct.toFixed(1)}%)`,
    };
  }

  // Absolute percentage-point delta — NOT a relative/ratio comparison.
  // This is the exact terminology the spec's Minor review finding
  // corrected for R7 (a different shape from R6's relative 15%
  // regression formula): a flat subtraction, gated at 2.0 points.
  const pointDrop = mergeBasePct - freshMeasuredPct;
  if (pointDrop > REGRESSION_THRESHOLD_POINTS) {
    return {
      ok: false,
      message: `${packageName}: REGRESSION FAIL — ${mergeBasePct}% -> ${freshMeasuredPct.toFixed(1)}% (-${pointDrop.toFixed(1)} points, exceeds ${REGRESSION_THRESHOLD_POINTS}-point threshold)`,
    };
  }

  return {
    ok: true,
    message: `${packageName}: OK (${mergeBasePct}% -> ${freshMeasuredPct.toFixed(1)}%, ${pointDrop >= 0 ? "-" : "+"}${Math.abs(pointDrop).toFixed(1)} points)`,
  };
}

// --- CLI wrapper --------------------------------------------------------

function fail(message) {
  console.error(`[validate-coverage] FAIL: ${message}`);
}

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

function runCli() {
  const baseRefIndex = process.argv.indexOf("--base-ref");
  const baseRef = baseRefIndex !== -1 ? process.argv[baseRefIndex + 1] : "origin/main";

  let baselines;
  try {
    baselines = readBaselineTables(baseRef, parsePhase10CoverageTable, "coverage");
  } catch (error) {
    fail(`could not read PERFORMANCE.md baselines (${error.message})`);
    process.exit(1);
  }
  const { mergeBaseSha, mergeBase: mergeBaseCoverage, head: headCoverage } = baselines;

  let anyFailed = false;

  for (const packageName of ALL_PACKAGES) {
    let freshMeasuredPct;
    try {
      const summaryPath = packageCoverageSummaryPath(packageName);
      freshMeasuredPct = readLineCoveragePct(summaryPath);
    } catch (error) {
      fail(
        `${packageName}: could not read coverage report (${error.message}) — run "pnpm run coverage:measure" first`
      );
      anyFailed = true;
      continue;
    }

    const mergeBasePct = mergeBaseCoverage.get(packageName);
    const headWrittenPct = headCoverage.get(packageName);
    const baselinePath = selectBaselinePath({
      baselineOnly: isCoverageBaselineOnlyDiff(mergeBaseSha, packageName),
      mergeBaseValue: mergeBasePct,
      headValue: headWrittenPct,
    });
    if (baselinePath === "removed") {
      fail(
        `${packageName}: baseline removed — merge-base PERFORMANCE.md records ${mergeBasePct}% but HEAD has no row`
      );
      anyFailed = true;
      continue;
    }

    const result = evaluatePackageCoverage({
      packageName,
      isBaselineOnly: baselinePath === "integrity",
      mergeBasePct,
      freshMeasuredPct,
      headWrittenPct,
    });

    if (result.ok) {
      console.log(`[validate-coverage] ${result.message}`);
    } else {
      fail(result.message);
      anyFailed = true;
    }
  }

  if (anyFailed) {
    console.error("[validate-coverage] one or more packages failed the coverage gate");
    process.exit(1);
  }

  console.log("[validate-coverage] all packages passed the coverage gate");
  process.exit(0);
}

if (isMainModule()) {
  runCli();
}
