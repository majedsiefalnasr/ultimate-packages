#!/usr/bin/env node
// scripts/provenance/validate-sast-baseline.mjs
//
// Compares a CodeQL SARIF results file against the grandfathered-findings
// table in docs/architecture/SAST_BASELINE.md. Any "error"- or
// "warning"-level SARIF result whose partialFingerprints do not match a
// baseline entry is a new finding and fails the check; "note"-level results
// are below spec §4 R3's severity threshold and are skipped entirely.
//
// Usage: node scripts/provenance/validate-sast-baseline.mjs <sarif-path>
//
// The baseline file path is not configurable — it is always
// docs/architecture/SAST_BASELINE.md, matching the spec's fixed contract.
// Only the SARIF path varies per invocation (see task-4-brief.md's fix for
// the prior draft's invalid "<sarif-path>" root-script placeholder).

import { existsSync, readFileSync } from "node:fs";

const BASELINE_PATH = "docs/architecture/SAST_BASELINE.md";
const QUALIFYING_LEVELS = new Set(["error", "warning"]);

function fail(message) {
  console.error(`[validate-sast-baseline] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[validate-sast-baseline] OK: ${message}`);
}

// Simple line-based Markdown table parser: finds lines starting with "|",
// skips the header row and the "|---|---|---|---|" separator row, and
// extracts each data row's first cell (the fingerprint) into a Set. No
// Markdown-parsing library needed for one fixed-column table.
function parseBaselineFingerprints(markdown) {
  const fingerprints = new Set();
  const lines = markdown.split("\n");
  const rowLines = lines.filter((line) => line.trim().startsWith("|"));

  for (const line of rowLines) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length === 0) continue;
    if (cells[0].toLowerCase() === "fingerprint") continue; // header row
    if (/^-+$/.test(cells[0])) continue; // separator row (---)
    fingerprints.add(cells[0]);
  }

  return fingerprints;
}

function loadBaseline(path) {
  if (!existsSync(path)) {
    fail(`baseline file not found at ${path}`);
  }
  const raw = readFileSync(path, "utf8");
  return parseBaselineFingerprints(raw);
}

function loadSarif(path) {
  if (!existsSync(path)) {
    fail(`SARIF file not found at ${path}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`SARIF file at ${path} is not valid JSON: ${error.message}`);
  }
  return parsed;
}

function isGrandfathered(result, baselineFingerprints) {
  const partialFingerprints = result.partialFingerprints || {};
  return Object.values(partialFingerprints).some((value) => baselineFingerprints.has(value));
}

function resultLocation(result) {
  const location = result.locations?.[0]?.physicalLocation?.artifactLocation?.uri;
  return location || "<unknown location>";
}

// `pnpm run sast:validate -- <sarif-path>` (Task 9's CI invocation shape,
// per task-4-brief.md) forwards the literal "--" separator token itself
// into argv alongside the real path, rather than stripping it — confirmed
// against the repo's pinned pnpm@9.6.0. A direct `node
// validate-sast-baseline.mjs <sarif-path>` invocation (this script's own
// tests, and any other direct caller) has no such token. Strip one leading
// "--" so both invocation shapes resolve to the same positional argument.
const cliArgs = process.argv.slice(2);
if (cliArgs[0] === "--") cliArgs.shift();
const sarifPath = cliArgs[0];
if (!sarifPath) {
  fail(
    "missing required CLI argument: node scripts/provenance/validate-sast-baseline.mjs <sarif-path>"
  );
}

const baselineFingerprints = loadBaseline(BASELINE_PATH);
const sarif = loadSarif(sarifPath);

const runs = sarif.runs || [];
let newFindingCount = 0;
let qualifyingCount = 0;

for (const run of runs) {
  const results = run.results || [];
  for (const result of results) {
    if (!QUALIFYING_LEVELS.has(result.level)) continue;
    qualifyingCount++;

    if (isGrandfathered(result, baselineFingerprints)) continue;

    const rule = result.ruleId || "<unknown rule>";
    const file = resultLocation(result);
    console.error(
      `[validate-sast-baseline] NEW FINDING: ${rule} at ${file} — not in SAST_BASELINE.md`
    );
    newFindingCount++;
  }
}

if (newFindingCount > 0) {
  fail(`${newFindingCount} new SAST finding(s) not present in ${BASELINE_PATH}`);
}

pass(
  `scanned ${qualifyingCount} qualifying (error/warning) SARIF result(s) — zero new findings outside ${BASELINE_PATH}`
);
process.exit(0);
