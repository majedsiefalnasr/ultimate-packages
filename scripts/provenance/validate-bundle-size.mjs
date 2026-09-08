#!/usr/bin/env node
// scripts/provenance/validate-bundle-size.mjs
//
// R6 bundle-size regression gate. For each of the 17 publishable packages,
// runs the merge-base-anchored, two-step baseline acceptance lifecycle
// described in task-6-brief.md's "R6/R7 baseline acceptance lifecycle"
// section:
//
//   - Baseline-only diff for this package (per
//     baseline-lib.mjs's isBaselineOnlyDiff — the diff touches only
//     docs/architecture/PERFORMANCE.md, not this package's own
//     packages/<name>/src/** or packages/<name>/package.json): run the
//     INTEGRITY check — the value this PR writes into PERFORMANCE.md must
//     equal a fresh real measurement of the package's current (unchanged)
//     dist/ output.
//   - Otherwise (diff touches this package's source/manifest): run the
//     REGRESSION check against the merge-base's own recorded baseline
//     value only — never a value the current diff itself wrote. No prior
//     entry: informational only (Stage 1). Prior entry: fail if the
//     relative increase exceeds 15% (Stage 2).
//
// This script never reads or trusts any PERFORMANCE.md value the current
// PR itself wrote for the regression branch — only the merge-base's.

import { getMergeBaseSha, readFileAtRef, isBaselineOnlyDiff } from "./baseline-lib.mjs";
import { measurePackage, ALL_PUBLISHABLE_PACKAGES } from "./measure-package-size.mjs";
import { join } from "node:path";

const REGRESSION_THRESHOLD = 0.15;
const PERFORMANCE_MD_PATH = "docs/architecture/PERFORMANCE.md";

// Simple line-based Markdown table parser, same style as
// validate-sast-baseline.mjs's parseBaselineFingerprints: finds "|"-led
// rows in the "### Package size" table under "## Phase 10 — ..." and
// extracts { packageDirName -> gzipSizeKB } from the "Package" and
// "index.mjs gzip size" columns. The gate tracks gzip barrel size (the
// metric that matters for consumers), not the uncompressed dist/ size
// column, which includes sourcemaps and type declarations irrelevant to
// what ships over the wire. Only the Phase 10 table is parsed — Phase 1/2's
// tables use the same column shape but are a different section, and this
// gate only tracks the Phase 10 baseline of record.
export function parsePhase10SizeTable(markdown) {
  const sizesByPackage = new Map();
  if (!markdown) return sizesByPackage;

  const phase10Index = markdown.indexOf("## Phase 10");
  if (phase10Index === -1) return sizesByPackage;

  const section = markdown.slice(phase10Index);
  const lines = section.split("\n");
  const rowLines = lines.filter((line) => line.trim().startsWith("|"));

  for (const line of rowLines) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 4) continue; // need Package + dist/ size + file count + gzip size
    if (cells[0].toLowerCase() === "package") continue; // header row
    if (/^-+$/.test(cells[0])) continue; // separator row

    const packageDirName = cells[0].replace(/^packages\//, "");
    const sizeMatch = cells[3].match(/^([\d.]+)\s*KB$/i);
    if (!sizeMatch) continue;

    sizesByPackage.set(packageDirName, parseFloat(sizeMatch[1]));
  }

  return sizesByPackage;
}

// --- Pure decision logic ----------------------------------------------
//
// Takes already-resolved inputs (no git/filesystem access) so tests can
// exercise every branch of the two-step lifecycle directly, without
// needing real git fixtures for every case. This is the function the CLI
// wrapper below calls once per package with real, git-derived inputs.
//
// Params:
//   packageName        - e.g. "uix-utils"
//   isBaselineOnly      - boolean, from isBaselineOnlyDiff(mergeBaseSha, packageName)
//   mergeBaseSizeKB     - number|undefined, the merge-base PERFORMANCE.md's recorded dist/ size for this package
//   freshMeasuredSizeKB - number, a fresh re-measurement of the package's current dist/ output
//   headWrittenSizeKB   - number|undefined, the value the current diff's HEAD version of PERFORMANCE.md records for this package (only consulted in the baseline-only branch)
//
// Returns { ok: boolean, message: string }.
export function evaluatePackageSize({
  packageName,
  isBaselineOnly,
  mergeBaseSizeKB,
  freshMeasuredSizeKB,
  headWrittenSizeKB,
}) {
  if (isBaselineOnly) {
    // Integrity check: the value this PR writes into PERFORMANCE.md must
    // match reality — a fresh measurement of the package's own, unchanged
    // gzip barrel output. Tolerance matches the script's own .toFixed(2)
    // rounding (0.005 KB half-a-last-digit), not a new invented fudge
    // factor. This must be tight: measure-package-size.mjs formats the
    // gzip column with 2 decimal places, so a 0.05 KB tolerance (sized for
    // the old 1-decimal dist/ size column) would be 100% of a small
    // package's entire gzip size (e.g. cli at 0.05 KB) and accept a
    // completely wrong value.
    if (headWrittenSizeKB === undefined) {
      return {
        ok: false,
        message: `${packageName}: baseline-only diff but PERFORMANCE.md has no entry to verify`,
      };
    }
    const diff = Math.abs(headWrittenSizeKB - freshMeasuredSizeKB);
    if (diff > 0.005) {
      return {
        ok: false,
        message: `${packageName}: INTEGRITY FAIL — PERFORMANCE.md writes ${headWrittenSizeKB} KB but fresh measurement is ${freshMeasuredSizeKB.toFixed(2)} KB`,
      };
    }
    return {
      ok: true,
      message: `${packageName}: OK (baseline-only, integrity check: ${headWrittenSizeKB} KB matches fresh measurement)`,
    };
  }

  // Regression branch: compares only against the merge-base's own
  // recorded baseline value, never a value the current diff itself wrote.
  if (mergeBaseSizeKB === undefined) {
    return {
      ok: true,
      message: `${packageName}: INFO (no prior baseline at merge-base — first measurement: ${freshMeasuredSizeKB.toFixed(1)} KB)`,
    };
  }

  const relativeChange = (freshMeasuredSizeKB - mergeBaseSizeKB) / mergeBaseSizeKB;
  if (relativeChange > REGRESSION_THRESHOLD) {
    return {
      ok: false,
      message: `${packageName}: REGRESSION FAIL — ${mergeBaseSizeKB} KB -> ${freshMeasuredSizeKB.toFixed(1)} KB (+${(relativeChange * 100).toFixed(1)}%, exceeds 15% threshold)`,
    };
  }

  return {
    ok: true,
    message: `${packageName}: OK (${mergeBaseSizeKB} KB -> ${freshMeasuredSizeKB.toFixed(1)} KB, ${(relativeChange * 100).toFixed(1)}%)`,
  };
}

// --- CLI wrapper --------------------------------------------------------

function fail(message) {
  console.error(`[validate-bundle-size] FAIL: ${message}`);
}

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

function runCli() {
  const baseRefIndex = process.argv.indexOf("--base-ref");
  const baseRef = baseRefIndex !== -1 ? process.argv[baseRefIndex + 1] : "origin/main";

  const mergeBaseSha = getMergeBaseSha(baseRef);
  const mergeBaseMarkdown = readFileAtRef(mergeBaseSha, PERFORMANCE_MD_PATH);
  const mergeBaseSizes = parsePhase10SizeTable(mergeBaseMarkdown);

  const headMarkdown = readFileAtRef("HEAD", PERFORMANCE_MD_PATH);
  const headSizes = parsePhase10SizeTable(headMarkdown);

  let anyFailed = false;

  for (const packageName of ALL_PUBLISHABLE_PACKAGES) {
    const pkgPath = join("packages", packageName);

    let freshMeasuredSizeKB;
    try {
      const { gzipBytes } = measurePackage(pkgPath);
      freshMeasuredSizeKB = gzipBytes / 1024;
    } catch (error) {
      fail(
        `${packageName}: could not measure package (${error.message}) — run "pnpm run build" first`
      );
      anyFailed = true;
      continue;
    }

    const baselineOnly = isBaselineOnlyDiff(mergeBaseSha, packageName);

    const result = evaluatePackageSize({
      packageName,
      isBaselineOnly: baselineOnly,
      mergeBaseSizeKB: mergeBaseSizes.get(packageName),
      freshMeasuredSizeKB,
      headWrittenSizeKB: headSizes.get(packageName),
    });

    if (result.ok) {
      console.log(`[validate-bundle-size] ${result.message}`);
    } else {
      fail(result.message);
      anyFailed = true;
    }
  }

  if (anyFailed) {
    console.error("[validate-bundle-size] one or more packages failed the bundle-size gate");
    process.exit(1);
  }

  console.log("[validate-bundle-size] all packages passed the bundle-size gate");
  process.exit(0);
}

if (isMainModule()) {
  runCli();
}
