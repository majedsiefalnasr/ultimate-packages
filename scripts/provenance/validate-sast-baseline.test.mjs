import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-sast-baseline.mjs");

function runScript(cwd, sarifPath) {
  return spawnSync("node", [SCRIPT_PATH, sarifPath], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// Writes docs/architecture/SAST_BASELINE.md under workDir so the script's
// fixed BASELINE_PATH ("docs/architecture/SAST_BASELINE.md", resolved
// relative to cwd) resolves to this fixture instead of the real repo stub.
function writeBaseline(workDir, markdown) {
  const baselineDir = join(workDir, "docs", "architecture");
  mkdirSync(baselineDir, { recursive: true });
  writeFileSync(join(baselineDir, "SAST_BASELINE.md"), markdown);
}

function emptyBaselineMarkdown() {
  return [
    "# SAST Baseline",
    "",
    "| Fingerprint | Rule | File | Note |",
    "| ----------- | ---- | ---- | ---- |",
    "",
  ].join("\n");
}

function baselineMarkdownWithFingerprint(fingerprint) {
  return [
    "# SAST Baseline",
    "",
    "| Fingerprint | Rule | File | Note |",
    "| ----------- | ---- | ---- | ---- |",
    `| ${fingerprint} | js/sql-injection | packages/cli/src/db.ts | Legacy, tracked in TICKET-123 |`,
    "",
  ].join("\n");
}

// Real CodeQL SARIF 2.1.0 shape: runs[].results[] with level, ruleId,
// message, locations[].physicalLocation.artifactLocation.uri, and
// partialFingerprints (CodeQL's documented per-result stable-fingerprint
// extension field).
function sarifWithResults(results) {
  return {
    version: "2.1.0",
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "CodeQL",
            rules: [],
          },
        },
        results,
      },
    ],
  };
}

function makeResult({ level, ruleId, uri, fingerprint }) {
  return {
    ruleId,
    level,
    message: { text: `Test finding for ${ruleId}` },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri },
          region: { startLine: 1 },
        },
      },
    ],
    partialFingerprints: {
      primaryLocationLineHash: fingerprint,
    },
  };
}

// --- New finding, not in baseline ---------------------------------------

test("fails with NEW FINDING when an error-level SARIF result is not in an empty baseline", () => {
  const workDir = makeWorkDir("sast-baseline-new-finding-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const sarifPath = join(workDir, "results.sarif");
  writeFileSync(
    sarifPath,
    JSON.stringify(
      sarifWithResults([
        makeResult({
          level: "error",
          ruleId: "js/sql-injection",
          uri: "packages/cli/src/db.ts",
          fingerprint: "abc123newfinding",
        }),
      ])
    )
  );

  const result = runScript(workDir, sarifPath);

  assert.equal(
    result.status,
    1,
    `expected the script to fail (exit code 1), got stdout: ${result.stdout}`
  );
  assert.match(result.stderr, /NEW FINDING/);
  assert.match(result.stderr, /js\/sql-injection/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Grandfathered finding, in baseline ----------------------------------

test("passes when the matching fingerprint is present in SAST_BASELINE.md", () => {
  const workDir = makeWorkDir("sast-baseline-grandfathered-");
  writeBaseline(workDir, baselineMarkdownWithFingerprint("abc123grandfathered"));

  const sarifPath = join(workDir, "results.sarif");
  writeFileSync(
    sarifPath,
    JSON.stringify(
      sarifWithResults([
        makeResult({
          level: "error",
          ruleId: "js/sql-injection",
          uri: "packages/cli/src/db.ts",
          fingerprint: "abc123grandfathered",
        }),
      ])
    )
  );

  const result = runScript(workDir, sarifPath);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- note-level finding, never compared ----------------------------------

test("passes and skips note-level findings entirely, even against an empty baseline", () => {
  const workDir = makeWorkDir("sast-baseline-note-level-");
  writeBaseline(workDir, emptyBaselineMarkdown());

  const sarifPath = join(workDir, "results.sarif");
  writeFileSync(
    sarifPath,
    JSON.stringify(
      sarifWithResults([
        makeResult({
          level: "note",
          ruleId: "js/unused-local-variable",
          uri: "packages/cli/src/util.ts",
          fingerprint: "noteonlyfingerprint",
        }),
      ])
    )
  );

  const result = runScript(workDir, sarifPath);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.doesNotMatch(result.stderr, /NEW FINDING/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Malformed/missing baseline file --------------------------------------

test("fails closed with a clear message when SAST_BASELINE.md is missing", () => {
  const workDir = makeWorkDir("sast-baseline-missing-baseline-");
  // Deliberately do not write docs/architecture/SAST_BASELINE.md.

  const sarifPath = join(workDir, "results.sarif");
  writeFileSync(
    sarifPath,
    JSON.stringify(
      sarifWithResults([
        makeResult({
          level: "error",
          ruleId: "js/sql-injection",
          uri: "packages/cli/src/db.ts",
          fingerprint: "abc123anything",
        }),
      ])
    )
  );

  const result = runScript(workDir, sarifPath);

  assert.equal(
    result.status,
    1,
    "expected the script to fail closed (exit code 1) when the baseline file is missing"
  );
  assert.match(result.stderr, /baseline file not found/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Baseline-removal-for-fixed-code behavior ------------------------------

test("passes when a baseline entry was removed and the corresponding finding is genuinely gone from SARIF", () => {
  const workDir = makeWorkDir("sast-baseline-removed-entry-");
  // Simulates a reviewed PR that fixed the underlying finding and removed
  // its baseline row: the baseline no longer lists the old fingerprint, and
  // the new SARIF run no longer produces that finding either.
  writeBaseline(workDir, emptyBaselineMarkdown());

  const sarifPath = join(workDir, "results.sarif");
  writeFileSync(sarifPath, JSON.stringify(sarifWithResults([])));

  const result = runScript(workDir, sarifPath);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});
