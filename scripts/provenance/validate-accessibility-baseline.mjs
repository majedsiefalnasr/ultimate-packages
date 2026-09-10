#!/usr/bin/env node
// scripts/provenance/validate-accessibility-baseline.mjs
//
// Compares axe-core accessibility scan envelopes (Task 6/7/8's future
// per-story JSON reports under test-results/accessibility/<framework>/
// <browser>/<storyId>.json — PD-12's real path convention) against the
// grandfathered-violations table in docs/architecture/ACCESSIBILITY_BASELINE.md.
// Any violation fingerprint not already present in that table is a new,
// unbaselined violation and fails the check.
//
// Structural template: scripts/provenance/validate-sast-baseline.mjs (pure-
// function core + thin CLI wrapper, fail-closed loadBaseline/fail() pattern).
//
// Fingerprint formula (spec R4.6): `<axe rule ID>:<component-story
// identifier>:<CSS selector/target path>`, computed per-violation, per-node
// — a single axe rule violation can report multiple nodes[], each a distinct
// DOM location needing its own fingerprint entry. `componentStoryId` comes
// from the envelope wrapper (see readEnvelopes below), never from the raw
// axe.Results object itself, which has no such field natively.
//
// Envelope shape (PD-5/PD-12 — the shape Tasks 6/7/8 will write):
//   {
//     "componentStoryId": "ng-button--default",
//     "framework": "ng",
//     "browser": "chromium",
//     "axeVersion": "4.13.0",
//     "scannedAt": "<ISO-8601 timestamp>",
//     "results": { /* raw axe.Results object, unmodified */ }
//   }
//
// This script has EXACTLY TWO modes, both strictly read-only (PD-11):
//   --check <glob>   fails (non-zero exit) if any envelope's violation
//                     fingerprint is not in the baseline; exits 0 otherwise.
//   --report <glob>  prints each not-yet-baselined fingerprint to stdout as
//                     a copy-pasteable Markdown table row, for a human to
//                     review and manually add to ACCESSIBILITY_BASELINE.md.
//                     This mode NEVER writes to any file, under any flag or
//                     environment variable — there is no third mode, no
//                     --populate-initial, no --write/--fix/--update. Adding
//                     a baseline entry is always a human-authored git change
//                     to the Markdown file directly (PD-11), mirroring
//                     validate-sast-baseline.mjs's own zero-write-mode
//                     precedent exactly. Do not add one "to make a later
//                     task easier" — that is the exact mistake PD-11
//                     corrected during Plan Review.
//
// Usage:
//   node scripts/provenance/validate-accessibility-baseline.mjs --check <glob>
//   node scripts/provenance/validate-accessibility-baseline.mjs --report <glob>
//
// The baseline file path is not configurable — it is always
// docs/architecture/ACCESSIBILITY_BASELINE.md, matching SAST's fixed-path
// contract. Only the envelope glob varies per invocation.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const BASELINE_PATH = "docs/architecture/ACCESSIBILITY_BASELINE.md";

function fail(message) {
  console.error(`[validate-accessibility-baseline] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[validate-accessibility-baseline] OK: ${message}`);
}

// Simple line-based Markdown table parser: finds lines starting with "|",
// skips the header row and the "|---|---|---|---|" separator row, and
// extracts each data row's first cell (the fingerprint) into a Set. No
// Markdown-parsing library needed for one fixed-column table — mirrors
// validate-sast-baseline.mjs's parseBaselineFingerprints exactly.
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

// Read-only: parses the baseline Markdown into a Set of fingerprints. Fails
// closed (non-zero exit) if the file doesn't exist or can't be read, per
// R4.11 — mirrors validate-sast-baseline.mjs's loadBaseline exactly. This
// function never writes to BASELINE_PATH under any circumstance.
function loadBaseline(path) {
  if (!existsSync(path)) {
    fail(`baseline file not found at ${path}`);
  }
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    fail(`baseline file at ${path} could not be read: ${error.message}`);
  }
  return parseBaselineFingerprints(raw);
}

// Per-violation, per-node fingerprint (spec R4.6):
// `<axe rule ID>:<component-story identifier>:<CSS selector/target path>`.
// `node.target` is axe-core's own array of CSS selector strings identifying
// one DOM location; joined with a space to form the third formula segment.
function computeFingerprint(componentStoryId, violation, node) {
  const target = (node.target || []).join(" ");
  return `${violation.id}:${componentStoryId}:${target}`;
}

// Translates a small subset of glob syntax (`*`, `**`, `?`) into a RegExp.
// No glob library dependency, matching this repo's established convention
// of hand-rolled directory walking (see validate-boundaries.mjs et al.) —
// this is a minimal addition needed because the CLI contract (R4.6/PD-12)
// requires accepting a glob pattern, not a fixed directory.
function globToRegExp(pattern) {
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === "*") {
      if (pattern[i + 1] === "*") {
        // "**" matches across directory separators, including zero segments.
        let j = i + 2;
        if (pattern[j] === "/") j++;
        out += ".*";
        i = j - 1;
      } else {
        // "*" matches within a single path segment only.
        out += "[^/]*";
      }
    } else if (char === "?") {
      out += "[^/]";
    } else if (".+^${}()|[]\\".includes(char)) {
      out += `\\${char}`;
    } else {
      out += char;
    }
  }
  return new RegExp(`^${out}$`);
}

// Recursively walks `root`, returning every regular file's path relative to
// `root` using forward slashes (so glob patterns written with "/" match
// consistently across platforms).
function walkFiles(root) {
  const results = [];
  if (!existsSync(root)) return results;

  function recurse(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        recurse(fullPath);
      } else if (entry.isFile()) {
        results.push(relative(root, fullPath).split(sep).join("/"));
      }
    }
  }

  recurse(root);
  return results;
}

// Resolves a glob pattern (e.g. "test-results/accessibility/**/*.json") to
// the list of matching file paths, by walking from the deepest ancestor
// directory that contains no glob metacharacters and matching the remainder
// against each candidate's relative path.
function resolveGlob(pattern) {
  const isAbsolute = pattern.startsWith("/");
  const segments = pattern.split("/").filter((segment) => segment.length > 0);
  const literalSegments = [];
  let i = 0;
  while (i < segments.length && !/[*?]/.test(segments[i])) {
    literalSegments.push(segments[i]);
    i++;
  }
  const joined = literalSegments.length > 0 ? join(...literalSegments) : ".";
  const root = isAbsolute ? join("/", joined) : joined;
  const remainderPattern = segments.slice(i).join("/");

  if (remainderPattern === "") {
    // The whole pattern was literal — treat it as a single file path.
    return existsSync(root) && statSync(root).isFile() ? [root] : [];
  }

  const regExp = globToRegExp(remainderPattern);
  return walkFiles(root)
    .filter((relativePath) => regExp.test(relativePath))
    .map((relativePath) => join(root, relativePath));
}

// Reads every envelope file matching `globPattern`, parsing each as
// { componentStoryId, framework, browser, axeVersion, scannedAt, results }
// and computing a fingerprint per violation per node, aggregated across the
// full set of matched files (not just the first match). Fails closed if a
// matched file is not valid JSON.
function readEnvelopes(globPattern) {
  const paths = resolveGlob(globPattern);
  const fingerprints = [];

  for (const path of paths) {
    let envelope;
    try {
      envelope = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      fail(`envelope file at ${path} is not valid JSON: ${error.message}`);
    }

    const componentStoryId = envelope.componentStoryId;
    const violations = envelope.results?.violations || [];
    for (const violation of violations) {
      for (const node of violation.nodes || []) {
        fingerprints.push({
          fingerprint: computeFingerprint(componentStoryId, violation, node),
          rule: violation.id,
          componentStoryId,
          target: (node.target || []).join(" "),
          sourcePath: path,
        });
      }
    }
  }

  return fingerprints;
}

// Set-membership check (R4.8): returns every violation fingerprint entry
// from `envelopeFingerprints` whose fingerprint is not present in
// `baseline`, across all envelopes supplied.
function findNewViolations(envelopeFingerprints, baseline) {
  return envelopeFingerprints.filter((entry) => !baseline.has(entry.fingerprint));
}

function runCheck(globPattern) {
  const baseline = loadBaseline(BASELINE_PATH);
  const envelopeFingerprints = readEnvelopes(globPattern);
  const newViolations = findNewViolations(envelopeFingerprints, baseline);

  if (newViolations.length > 0) {
    for (const entry of newViolations) {
      console.error(
        `[validate-accessibility-baseline] NEW VIOLATION: ${entry.rule} on ${entry.componentStoryId} (${entry.target}) — not in ${BASELINE_PATH}`
      );
    }
    fail(`${newViolations.length} new accessibility violation(s) not present in ${BASELINE_PATH}`);
  }

  pass(
    `scanned ${envelopeFingerprints.length} violation node(s) — zero new violations outside ${BASELINE_PATH}`
  );
  process.exit(0);
}

// Prints each not-yet-baselined fingerprint as a copy-pasteable Markdown
// table row, matching ACCESSIBILITY_BASELINE.md's `| Fingerprint | Rule |
// Component/Story | Note |` column shape. Writes ONLY to stdout — this
// function must never open BASELINE_PATH (or any other file) for writing.
function runReport(globPattern) {
  const baseline = loadBaseline(BASELINE_PATH);
  const envelopeFingerprints = readEnvelopes(globPattern);
  const newViolations = findNewViolations(envelopeFingerprints, baseline);

  if (newViolations.length === 0) {
    pass(`no new accessibility violations outside ${BASELINE_PATH} — nothing to report`);
    process.exit(0);
  }

  console.log(
    "The following violations are not yet in the baseline. Review each, then manually add"
  );
  console.log(`the row(s) you accept to ${BASELINE_PATH}'s table:`);
  console.log("");
  console.log("| Fingerprint | Rule | Component/Story | Note |");
  console.log("| ----------- | ---- | ---------------- | ---- |");

  const seen = new Set();
  for (const entry of newViolations) {
    if (seen.has(entry.fingerprint)) continue;
    seen.add(entry.fingerprint);
    console.log(`| ${entry.fingerprint} | ${entry.rule} | ${entry.componentStoryId} |  |`);
  }

  process.exit(0);
}

function parseCliArgs(argv) {
  const args = argv.slice();
  if (args[0] === "--") args.shift();

  const mode = args[0];
  const globPattern = args[1];

  if (mode !== "--check" && mode !== "--report") {
    fail(
      "missing or invalid mode: node scripts/provenance/validate-accessibility-baseline.mjs --check <glob> | --report <glob>"
    );
  }
  if (!globPattern) {
    fail(`missing required <glob> argument for ${mode}`);
  }

  return { mode, globPattern };
}

// Only run the CLI when this file is executed directly (not when imported
// by the test file), so the test suite can import the pure functions above
// without triggering process.exit via the CLI path.
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const { mode, globPattern } = parseCliArgs(process.argv.slice(2));
  if (mode === "--check") {
    runCheck(globPattern);
  } else {
    runReport(globPattern);
  }
}

export {
  BASELINE_PATH,
  computeFingerprint,
  parseBaselineFingerprints,
  loadBaseline,
  readEnvelopes,
  findNewViolations,
  resolveGlob,
  globToRegExp,
};
