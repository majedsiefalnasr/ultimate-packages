// scripts/provenance/validate-bundle-size.test.mjs
//
// Tests for validate-bundle-size.mjs's two-step baseline acceptance
// lifecycle (R6). Exercises the pure evaluatePackageSize() decision
// function directly with hand-written fixture inputs — merge-base baseline
// value, current measurement, and diff-shape boolean are all passed in
// directly, so no real git state or measured dist/ output is needed for
// any of these cases. This is deliberate: evaluatePackageSize() takes
// already-resolved inputs precisely so these tests don't need real git
// fixtures for every scenario (see task-6-brief.md's testing guidance).
//
// Also includes a light parser test for parsePhase10SizeTable(), the one
// other pure function in the module worth covering directly.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { evaluatePackageSize, parsePhase10SizeTable } from "./validate-bundle-size.mjs";
import { ALL_PUBLISHABLE_PACKAGES, measurePackage } from "./measure-package-size.mjs";

// --- Stage 1: no prior baseline ------------------------------------------

test("Stage 1 (no prior baseline): informational only, ok=true", () => {
  const result = evaluatePackageSize({
    packageName: "synthetic-pkg",
    isBaselineOnly: false,
    mergeBaseSizeKB: undefined, // no entry for this package at the merge-base
    freshMeasuredSizeKB: 42.3,
    headWrittenSizeKB: undefined,
  });

  assert.strictEqual(result.ok, true, "first-ever measurement must not fail the gate");
  assert.match(result.message, /INFO/);
  assert.match(result.message, /synthetic-pkg/);
});

// --- Stage 2 pass: 5% increase, under 15% threshold ----------------------

test("Stage 2 pass: 100.0 KB -> 105.0 KB (5% increase) is under the 15% threshold", () => {
  const result = evaluatePackageSize({
    packageName: "uix-utils",
    isBaselineOnly: false,
    mergeBaseSizeKB: 100.0,
    freshMeasuredSizeKB: 105.0,
    headWrittenSizeKB: undefined,
  });

  assert.strictEqual(result.ok, true, "5% increase must pass");
  assert.match(result.message, /OK/);
});

// --- Stage 2 fail: 20% increase, over 15% threshold (legitimate failure) --

test("Stage 2 fail (implementation PR, legitimate failure): 100.0 KB -> 120.0 KB (20% increase) exceeds the 15% threshold and names the package", () => {
  const result = evaluatePackageSize({
    packageName: "uix-utils",
    isBaselineOnly: false,
    mergeBaseSizeKB: 100.0,
    freshMeasuredSizeKB: 120.0,
    headWrittenSizeKB: undefined,
  });

  assert.strictEqual(result.ok, false, "20% increase must fail");
  assert.match(result.message, /REGRESSION FAIL/);
  assert.match(result.message, /uix-utils/);
});

// --- Same-diff-bypass negative test: THE most important test -------------
//
// Simulates a PR that both increased a package's size by 20% AND edited
// PERFORMANCE.md's HEAD-version baseline entry to 120.0 KB in the *same*
// diff as the source change. Because the diff touches the package's own
// source (isBaselineOnly=false), the regression branch runs — it must
// compare against the merge-base's value (100.0 KB, unedited) and must
// NEVER read or trust headWrittenSizeKB at all. This proves the integrity
// check branch cannot be reached by a source-changing PR no matter what it
// also writes into PERFORMANCE.md.

test("same-diff-bypass: a PR that changes source AND edits HEAD's PERFORMANCE.md to match still fails against the merge-base value", () => {
  const result = evaluatePackageSize({
    packageName: "uix-utils",
    isBaselineOnly: false, // diff touches packages/uix-utils/src/** too — NOT baseline-only
    mergeBaseSizeKB: 100.0, // merge-base's real, unedited recorded baseline
    freshMeasuredSizeKB: 120.0, // the actual new, regressed size (20% increase)
    headWrittenSizeKB: 120.0, // the PR dishonestly/optimistically wrote this into HEAD's PERFORMANCE.md
  });

  assert.strictEqual(
    result.ok,
    false,
    "a source-changing PR must still fail the regression check even if it also edited PERFORMANCE.md to match its own new size — the regression branch must never consult headWrittenSizeKB"
  );
  assert.match(result.message, /REGRESSION FAIL/);
  assert.match(result.message, /100/);
  assert.match(result.message, /120/);
});

// --- Baseline-only PR, honest value (lifecycle Step 2) --------------------

test("baseline-only PR, honest value: integrity check passes regardless of the merge-base's old value or the >15% relationship", () => {
  const result = evaluatePackageSize({
    packageName: "uix-utils",
    isBaselineOnly: true, // diff touches only PERFORMANCE.md for this package
    mergeBaseSizeKB: 100.0, // old, stale merge-base value — must be irrelevant here
    freshMeasuredSizeKB: 120.0, // real, current re-measurement of unchanged dist/ output
    headWrittenSizeKB: 120.0, // the PR writes exactly the truthful, fresh value
  });

  assert.strictEqual(
    result.ok,
    true,
    "a truthful baseline-only PR must pass the integrity check even though 120 vs 100 exceeds 15%, proving the regression branch is skipped entirely, not merely satisfied"
  );
  assert.match(result.message, /baseline-only/);
});

// --- Baseline-only PR, dishonest value (lifecycle Step 2 negative case) ---

test("baseline-only PR, dishonest value: integrity check fails when the written value does not match the fresh re-measurement", () => {
  const result = evaluatePackageSize({
    packageName: "uix-utils",
    isBaselineOnly: true,
    mergeBaseSizeKB: 100.0,
    freshMeasuredSizeKB: 120.0, // real re-measured size
    headWrittenSizeKB: 90.0, // false value written by the PR
  });

  assert.strictEqual(
    result.ok,
    false,
    "the integrity check must be a real, enforced check, not a rubber stamp for any baseline-only diff"
  );
  assert.match(result.message, /INTEGRITY FAIL/);
});

// --- parsePhase10SizeTable: light coverage of the table parser -----------

test("parsePhase10SizeTable extracts package sizes only from the Phase 10 section, ignoring earlier phase tables", () => {
  const markdown = [
    "# Performance Baseline",
    "",
    "## Package size",
    "",
    "| Package             | dist/ size | dist/ file count | index.mjs gzip size |",
    "| -------------------- | ---------- | ----------------- | -------------------- |",
    "| packages/uix-motion  | 999.9 KB   | 3                 | 2.05 KB              |",
    "",
    "## Phase 10 — CI/Security/Quality Gates",
    "",
    "### Package size",
    "",
    "| Package | dist/ size | dist/ file count | index.mjs gzip size |",
    "| ------- | ---------- | ----------------- | -------------------- |",
    "| packages/uix-utils | 100.0 KB | 24 | 13.30 KB |",
    "| packages/ng | 225.8 KB | 6 | 19.67 KB |",
    "",
  ].join("\n");

  const sizes = parsePhase10SizeTable(markdown);

  assert.strictEqual(
    sizes.get("uix-utils"),
    13.3,
    "must read the gzip column (index 3), not dist/ size (index 1)"
  );
  assert.strictEqual(
    sizes.get("ng"),
    19.67,
    "must read the gzip column (index 3), not dist/ size (index 1)"
  );
  assert.strictEqual(
    sizes.has("uix-motion"),
    false,
    "should not pick up rows from the Phase 1/2 tables above the Phase 10 heading"
  );
});

test("parsePhase10SizeTable returns an empty map when there is no Phase 10 section yet", () => {
  const markdown = ["# Performance Baseline", "", "## Package size", "", "no phase 10 yet"].join(
    "\n"
  );

  const sizes = parsePhase10SizeTable(markdown);

  assert.strictEqual(sizes.size, 0);
});

// --- ADR-066: real-Git CLI fixtures ------------------------------------------
//
// Each fixture commits packages/<name>/package.json and dist/index.mjs for
// all 17 packages at the merge-base, so the CLI measures real files. Honest
// values come from the exported measurePackage, formatted as the table is.

const validatorPath = fileURLToPath(new URL("./validate-bundle-size.mjs", import.meta.url));
const performancePath = "docs/architecture/PERFORMANCE.md";

function runGit(cwd, ...args) {
  return execFileSync(
    "git",
    ["-c", "commit.gpgsign=false", "-c", "core.fsmonitor=false", ...args],
    { cwd, encoding: "utf8" }
  ).trim();
}

function sizeTable(gzipKBByPackage) {
  return [
    "## Phase 10 — CI/Security/Quality Gates",
    "",
    "### Package size",
    "",
    "| Package | dist/ size | dist/ file count | index.mjs gzip size |",
    "| ------- | ---------- | ---------------- | ------------------- |",
    ...Object.entries(gzipKBByPackage).map(
      ([name, kb]) => `| packages/${name} | 10.0 KB | 1 | ${kb} KB |`
    ),
    "",
    "### Coverage",
    "",
    "| Package | line-coverage % |",
    "| ------- | --------------- |",
    "| ai | 75.7 |",
    "",
  ].join("\n");
}

// `buildMarkdowns(honest)` receives the honest gzip KB strings per package and
// returns { baseMarkdown, headMarkdown } (headMarkdown null deletes the file).
function runSizeCli(buildMarkdowns, { baseRef = "baseline" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "adr-066-size-"));
  try {
    runGit(root, "init", "-q");
    runGit(root, "config", "user.name", "Size Fixture");
    runGit(root, "config", "user.email", "size-fixture@example.invalid");

    const honest = {};
    ALL_PUBLISHABLE_PACKAGES.forEach((name, index) => {
      const pkgPath = join(root, "packages", name);
      mkdirSync(join(pkgPath, "dist"), { recursive: true });
      writeFileSync(join(pkgPath, "package.json"), JSON.stringify({ name: `@ultimate/${name}` }));
      const body = Array.from({ length: 40 * (index + 1) }, (_, i) => `export const v${i} = ${i};`);
      writeFileSync(join(pkgPath, "dist", "index.mjs"), `${body.join("\n")}\n`);
      honest[name] = (measurePackage(pkgPath).gzipBytes / 1024).toFixed(2);
    });

    const { baseMarkdown, headMarkdown } = buildMarkdowns(honest);
    mkdirSync(join(root, dirname(performancePath)), { recursive: true });
    writeFileSync(join(root, performancePath), baseMarkdown);
    runGit(root, "add", "-A");
    runGit(root, "commit", "-qm", "baseline");
    runGit(root, "branch", "baseline");

    if (headMarkdown === null) {
      runGit(root, "rm", "-q", performancePath);
    } else {
      writeFileSync(join(root, performancePath), headMarkdown);
      runGit(root, "add", performancePath);
    }
    runGit(root, "commit", "-qm", "feature");

    const result = spawnSync(process.execPath, [validatorPath, "--base-ref", baseRef], {
      cwd: root,
      encoding: "utf8",
    });
    return { status: result.status, output: `${result.stdout}\n${result.stderr}`, honest };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function addKB(value, delta) {
  return (parseFloat(value) + delta).toFixed(2);
}

const STAGE1_APPENDIX = [
  "## Stage 1 — Performance baselines (ADR-057)",
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
  "",
].join("\n");

test("R6: changed row on a PERFORMANCE.md-only diff gets integrity; unchanged stale row gets regression", () => {
  const result = runSizeCli((honest) => ({
    baseMarkdown: sizeTable({ ...honest, react: "0.10", cli: addKB(honest.cli, 0.2) }),
    headMarkdown: sizeTable({ ...honest, cli: addKB(honest.cli, 0.2) }),
  }));
  assert.strictEqual(result.status, 0, result.output);
  assert.match(result.output, /react: OK \(baseline-only, integrity check/);
  assert.match(result.output, /cli: OK \([\d.]+ KB -> [\d.]+ KB, -[\d.]+%\)/);
  assert.doesNotMatch(result.output, /cli: OK \(baseline-only/);
});

test("R6: changed row on a PERFORMANCE.md-only diff fails integrity when it does not match", () => {
  const result = runSizeCli((honest) => ({
    baseMarkdown: sizeTable({ ...honest, react: "0.10" }),
    headMarkdown: sizeTable({ ...honest, react: addKB(honest.react, 0.5) }),
  }));
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /react: INTEGRITY FAIL/);
});

test("R6: appending a Stage 1 table leaves a stale unchanged ng row on the regression path", () => {
  const result = runSizeCli((honest) => {
    const base = sizeTable({ ...honest, ng: addKB(honest.ng, 3) });
    return { baseMarkdown: base, headMarkdown: `${base}\n${STAGE1_APPENDIX}` };
  });
  assert.strictEqual(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /integrity/i);
  assert.match(result.output, /ng: OK \([\d.]+ KB -> [\d.]+ KB, -[\d.]+%\)/);
});

test("R6: a size row removed at HEAD fails as baseline removed", () => {
  const result = runSizeCli((honest) => {
    const withoutCli = { ...honest };
    delete withoutCli.cli;
    return { baseMarkdown: sizeTable(honest), headMarkdown: sizeTable(withoutCli) };
  });
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /cli: baseline removed/);
});

test("R6: an unreadable merge-base ref fails closed", () => {
  const result = runSizeCli(
    (honest) => ({ baseMarkdown: sizeTable(honest), headMarkdown: sizeTable(honest) + "\n" }),
    { baseRef: "no-such-ref-adr-066" }
  );
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /\[validate-bundle-size\] FAIL: could not read PERFORMANCE\.md/);
});

test("R6: a merge-base PERFORMANCE.md with no Phase 10 size table fails closed", () => {
  const result = runSizeCli((honest) => ({
    baseMarkdown: "# Performance Baseline\n\nNo Phase 10 section.\n",
    headMarkdown: sizeTable(honest),
  }));
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /merge-base PERFORMANCE\.md has no Phase 10 package size rows/);
});

test("R6: PERFORMANCE.md deleted at HEAD fails closed", () => {
  const result = runSizeCli((honest) => ({ baseMarkdown: sizeTable(honest), headMarkdown: null }));
  assert.strictEqual(result.status, 1, result.output);
  assert.match(result.output, /PERFORMANCE\.md does not exist at HEAD/);
});

test("parsePhase10SizeTable stops at the next heading after its table", () => {
  const sizes = parsePhase10SizeTable(
    `${sizeTable({ ng: "65.80", react: "87.16" })}\n${STAGE1_APPENDIX}`
  );
  assert.deepStrictEqual(
    [...sizes],
    [
      ["ng", 65.8],
      ["react", 87.16],
    ]
  );
});
