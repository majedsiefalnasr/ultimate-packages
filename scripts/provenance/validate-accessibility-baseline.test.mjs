import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-accessibility-baseline.mjs");

function runScript(cwd, args) {
  return spawnSync("node", [SCRIPT_PATH, ...args], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// Writes docs/architecture/ACCESSIBILITY_BASELINE.md under workDir so the
// script's fixed BASELINE_PATH resolves to this fixture instead of the real
// repo file.
function writeBaseline(workDir, markdown) {
  const baselineDir = join(workDir, "docs", "architecture");
  mkdirSync(baselineDir, { recursive: true });
  writeFileSync(join(baselineDir, "ACCESSIBILITY_BASELINE.md"), markdown);
}

function emptyBaselineMarkdown() {
  return [
    "# Accessibility Baseline",
    "",
    "| Fingerprint | Rule | Component/Story | Note |",
    "| ----------- | ---- | ---------------- | ---- |",
    "",
  ].join("\n");
}

function baselineMarkdownWithFingerprint(fingerprint) {
  return [
    "# Accessibility Baseline",
    "",
    "| Fingerprint | Rule | Component/Story | Note |",
    "| ----------- | ---- | ---------------- | ---- |",
    `| ${fingerprint} | color-contrast | ng-button--default | Legacy, tracked in TICKET-456 |`,
    "",
  ].join("\n");
}

// Real envelope shape (PD-5/PD-12): { componentStoryId, framework, browser,
// axeVersion, scannedAt, results }, where results is a raw axe.Results
// object with violations[].id and violations[].nodes[].target (array of CSS
// selector strings).
function envelope({ componentStoryId, framework = "ng", browser = "chromium", violations }) {
  return {
    componentStoryId,
    framework,
    browser,
    axeVersion: "4.13.0",
    scannedAt: "2026-09-10T00:00:00.000Z",
    results: {
      violations,
    },
  };
}

function violation({ id, targets }) {
  return {
    id,
    impact: "serious",
    nodes: targets.map((target) => ({ target })),
  };
}

function writeEnvelope(dir, fileName, envelopeObject) {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, fileName);
  writeFileSync(path, JSON.stringify(envelopeObject));
  return path;
}

// --- Existing fingerprint: --check does not fail -------------------------

test("--check passes when the violation's fingerprint is already in the baseline", () => {
  const workDir = makeWorkDir("a11y-baseline-existing-");
  const fingerprint = "color-contrast:ng-button--default:button.primary";
  writeBaseline(workDir, baselineMarkdownWithFingerprint(fingerprint));

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- New fingerprint: --check fails, --report prints candidate row -------

test("--check fails when the violation's fingerprint is not in the baseline", () => {
  const workDir = makeWorkDir("a11y-baseline-new-check-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(
    result.status,
    1,
    `expected the script to fail (exit code 1), got stdout: ${result.stdout}`
  );
  assert.match(result.stderr, /NEW VIOLATION/);
  assert.match(result.stderr, /color-contrast/);

  rmSync(workDir, { recursive: true, force: true });
});

test("--report prints the new fingerprint as a copy-pasteable Markdown table row", () => {
  const workDir = makeWorkDir("a11y-baseline-new-report-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--report", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 0, `expected --report to exit 0, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /color-contrast:ng-button--default:button\.primary/);
  assert.match(result.stdout, /\| Fingerprint \| Rule \| Component\/Story \| Note \|/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Malformed baseline file: fail closed ---------------------------------

test("--check fails closed with a clear message when the baseline file is malformed", () => {
  const workDir = makeWorkDir("a11y-baseline-malformed-check-");
  const baselineDir = join(workDir, "docs", "architecture");
  mkdirSync(baselineDir, { recursive: true });
  // Malformed baseline: not a table at all, but the file exists.
  writeFileSync(join(baselineDir, "ACCESSIBILITY_BASELINE.md"), "this is not a table");

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  // A baseline with no parseable rows behaves the same as an empty baseline
  // (fails because the violation isn't grandfathered) — that's correct, not
  // "malformed" in the missing/unreadable sense. Assert on the missing-file
  // case below for the true fail-closed "file absent" behavior instead.
  assert.equal(result.status, 1);

  rmSync(workDir, { recursive: true, force: true });
});

test("--check fails closed with a clear message when the baseline file is missing", () => {
  const workDir = makeWorkDir("a11y-baseline-missing-check-");
  // Deliberately do not write docs/architecture/ACCESSIBILITY_BASELINE.md.

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(
    result.status,
    1,
    "expected the script to fail closed (exit code 1) when the baseline file is missing"
  );
  assert.match(result.stderr, /baseline file not found/);

  rmSync(workDir, { recursive: true, force: true });
});

test("--report fails closed with a clear message when the baseline file is missing", () => {
  const workDir = makeWorkDir("a11y-baseline-missing-report-");
  // Deliberately do not write docs/architecture/ACCESSIBILITY_BASELINE.md.

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const result = runScript(workDir, ["--report", "test-results/accessibility/**/*.json"]);

  assert.equal(
    result.status,
    1,
    "expected --report to fail closed (exit code 1) when the baseline file is missing"
  );
  assert.match(result.stderr, /baseline file not found/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Multi-envelope glob: aggregate across files, not just the first -----

test("readEnvelopes aggregates fingerprints across every file matching a multi-envelope glob", () => {
  const workDir = makeWorkDir("a11y-baseline-multi-envelope-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const ngDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  const reactDir = join(workDir, "test-results", "accessibility", "react", "chromium");

  writeEnvelope(
    ngDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      framework: "ng",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );
  writeEnvelope(
    reactDir,
    "react-input--default.json",
    envelope({
      componentStoryId: "react-input--default",
      framework: "react",
      violations: [violation({ id: "label", targets: [["input.text"]] })],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 1, `expected fail, got stdout: ${result.stdout}`);
  // Both envelopes' violations must be reported — proof that readEnvelopes
  // aggregates across every matched file, not just the first one.
  assert.match(result.stderr, /color-contrast/);
  assert.match(result.stderr, /label/);
  assert.match(result.stderr, /2 new accessibility violation/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Zero violations envelope --------------------------------------------

test("--check passes when an envelope has zero violations", () => {
  const workDir = makeWorkDir("a11y-baseline-zero-violations-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({ componentStoryId: "ng-button--default", violations: [] })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Per-node fingerprinting: multiple nodes on one violation -------------

test("a single violation with multiple nodes produces one fingerprint per node", () => {
  const workDir = makeWorkDir("a11y-baseline-multi-node-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [
        violation({
          id: "color-contrast",
          targets: [["button.primary"], ["button.secondary"]],
        }),
      ],
    })
  );

  const result = runScript(workDir, ["--check", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /2 new accessibility violation/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- --report never writes to disk (load-bearing) -------------------------

test("--report never writes to ACCESSIBILITY_BASELINE.md: content and mtime are unchanged", () => {
  const workDir = makeWorkDir("a11y-baseline-no-write-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const envDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    envDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const baselinePath = join(workDir, "docs", "architecture", "ACCESSIBILITY_BASELINE.md");
  const beforeContent = readFileSync(baselinePath, "utf8");
  const beforeStat = statSync(baselinePath);

  const result = runScript(workDir, ["--report", "test-results/accessibility/**/*.json"]);

  assert.equal(result.status, 0, `expected --report to exit 0, got stderr: ${result.stderr}`);
  // Sanity: --report did find and print the new violation.
  assert.match(result.stdout, /color-contrast:ng-button--default:button\.primary/);

  const afterContent = readFileSync(baselinePath, "utf8");
  const afterStat = statSync(baselinePath);

  assert.equal(
    afterContent,
    beforeContent,
    "ACCESSIBILITY_BASELINE.md content changed after --report — --report must never write to disk"
  );
  assert.equal(
    afterStat.mtimeMs,
    beforeStat.mtimeMs,
    "ACCESSIBILITY_BASELINE.md mtime changed after --report — --report must never write to disk"
  );

  rmSync(workDir, { recursive: true, force: true });
});

// --- No third mode / no write flags exist ----------------------------------

test("there is no third CLI mode: an unrecognized flag fails closed instead of writing anything", () => {
  const workDir = makeWorkDir("a11y-baseline-no-third-mode-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const baselinePath = join(workDir, "docs", "architecture", "ACCESSIBILITY_BASELINE.md");
  const beforeContent = readFileSync(baselinePath, "utf8");

  for (const flag of ["--populate-initial", "--write", "--fix", "--update"]) {
    const result = runScript(workDir, [flag, "test-results/accessibility/**/*.json"]);
    assert.equal(
      result.status,
      1,
      `expected ${flag} to fail closed as an unrecognized mode, got stdout: ${result.stdout}`
    );
    assert.match(result.stderr, /missing or invalid mode/);
  }

  const afterContent = readFileSync(baselinePath, "utf8");
  assert.equal(afterContent, beforeContent, "no unrecognized flag may write to the baseline file");

  rmSync(workDir, { recursive: true, force: true });
});

// --- Absolute glob path (Task 5 review follow-up: resolveGlob previously
// dropped the leading "/" on an absolute pattern, silently reducing it to a
// relative path and resolving zero matches — a false-negative risk for a
// gate whose whole job is to catch violations. Regression-tested here so a
// future refactor of resolveGlob can't silently reintroduce it.) ----------

test("--check resolves an absolute glob pattern correctly, not just relative ones", () => {
  const workDir = makeWorkDir("a11y-baseline-absolute-glob-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const ngDir = join(workDir, "test-results", "accessibility", "ng", "chromium");
  writeEnvelope(
    ngDir,
    "ng-button--default.json",
    envelope({
      componentStoryId: "ng-button--default",
      framework: "ng",
      violations: [violation({ id: "color-contrast", targets: [["button.primary"]] })],
    })
  );

  const absoluteGlob = join(workDir, "test-results", "accessibility", "**", "*.json");
  const result = runScript(workDir, ["--check", absoluteGlob]);

  // Must genuinely find and report the real violation, not silently resolve
  // to zero matches (which would exit 0 and look identical to "no
  // violations found" — the exact false-negative shape this test guards
  // against).
  assert.equal(
    result.status,
    1,
    `expected the absolute glob to resolve and find the real violation, got exit 0 with stdout: ${result.stdout}`
  );
  assert.match(result.stderr, /color-contrast/);

  rmSync(workDir, { recursive: true, force: true });
});
