#!/usr/bin/env node
// scripts/provenance/validate-g3c1-accessibility.mjs
//
// GAP-064 G3-C1 differential accessibility check (G3-C1 Spec §10, §15 SR-C1-2). It
// covers only the G3-C1 verification stories, which CI excludes from the
// strict repository-wide scan (`--grep-invert "G3-A|G3-B|G3-C1"`). For one framework
// (ng or vue) it reads the axe envelopes the G3-C1 spec wrote to
// test-results/accessibility/<fw>/<browser>/<storyId>.json and:
//
//   - FAILS if any G3-C1 story is missing an envelope in any of the three
//     browsers. The story list is parsed from the spec's own STORIES table and
//     must have the approved size (ng 17, vue 17), so a skipped scan cannot pass;
//   - FAILS on any violation whose fingerprint is in neither
//     docs/architecture/ACCESSIBILITY_BASELINE.md nor the G3-C1 pre-existing
//     evidence list;
//   - reports pre-existing rows that are no longer observed as STALE
//     (informational, never a failure).
//
// Fingerprints come from validate-accessibility-baseline.mjs's exported
// computeFingerprint/parseBaselineFingerprints, so the identity contract
// (`rule:story:target`) is identical by construction. Strictly read-only.
// Tranche-scoped by design: validate-g3a-accessibility.mjs and validate-g3b-accessibility.mjs are left unchanged.
//
// Usage: node scripts/provenance/validate-g3c1-accessibility.mjs <ng|vue>

import { existsSync, readFileSync } from "node:fs";
import {
  BASELINE_PATH,
  computeFingerprint,
  parseBaselineFingerprints,
} from "./validate-accessibility-baseline.mjs";

const PREEXISTING_PATH =
  "docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md";
const BROWSERS = ["chromium", "firefox", "webkit"];
const EXPECTED_STORY_COUNT = { ng: 17, vue: 17 };

const PREFIX = "[validate-g3c1-accessibility]";

function fail(message) {
  console.error(`${PREFIX} FAIL: ${message}`);
  process.exit(1);
}

function readText(path, label) {
  if (!existsSync(path)) fail(`${label} not found at ${path}`);
  return readFileSync(path, "utf8");
}

// The spec's STORIES table is the single source of the G3-C1 story set.
function g3c1StoryIds(fw) {
  const specPath = `packages/${fw}/e2e/g3c1-aura-styles.spec.ts`;
  const ids = [
    ...new Set(
      Array.from(readText(specPath, "G3-C1 spec").matchAll(/story: "([a-z0-9-]+)"/g), (m) => m[1])
    ),
  ];
  if (ids.length !== EXPECTED_STORY_COUNT[fw]) {
    fail(`${specPath} lists ${ids.length} G3-C1 stories, expected ${EXPECTED_STORY_COUNT[fw]}`);
  }
  return ids;
}

function main(fw) {
  if (!(fw in EXPECTED_STORY_COUNT)) {
    fail(`usage: node scripts/provenance/validate-g3c1-accessibility.mjs <ng|vue> (got "${fw}")`);
  }

  const baseline = parseBaselineFingerprints(readText(BASELINE_PATH, "baseline file"));
  const preexisting = parseBaselineFingerprints(readText(PREEXISTING_PATH, "pre-existing list"));
  const storyIds = g3c1StoryIds(fw);

  const missing = [];
  const introduced = [];
  const observed = new Set();
  for (const storyId of storyIds) {
    for (const browser of BROWSERS) {
      const path = `test-results/accessibility/${fw}/${browser}/${storyId}.json`;
      if (!existsSync(path)) {
        missing.push(path);
        continue;
      }
      let envelope;
      try {
        envelope = JSON.parse(readFileSync(path, "utf8"));
      } catch (error) {
        fail(`envelope file at ${path} is not valid JSON: ${error.message}`);
      }
      if (envelope.componentStoryId !== storyId) {
        fail(`${path} has componentStoryId "${envelope.componentStoryId}", expected "${storyId}"`);
      }
      for (const violation of envelope.results?.violations || []) {
        for (const node of violation.nodes || []) {
          const fingerprint = computeFingerprint(storyId, violation, node);
          observed.add(fingerprint);
          if (!baseline.has(fingerprint) && !preexisting.has(fingerprint)) {
            introduced.push(`${fingerprint} (${browser})`);
          }
        }
      }
    }
  }

  const stale = [...preexisting].filter(
    (fingerprint) => fingerprint.split(":")[1].startsWith(`${fw}-`) && !observed.has(fingerprint)
  );
  for (const fingerprint of stale) {
    console.log(`${PREFIX} STALE (informational): ${fingerprint} is no longer observed`);
  }
  for (const path of missing) {
    console.error(`${PREFIX} MISSING REPORT: ${path}`);
  }
  for (const entry of introduced) {
    console.error(
      `${PREFIX} INTRODUCED VIOLATION: ${entry} — in neither ${BASELINE_PATH} nor ${PREEXISTING_PATH}`
    );
  }

  const expectedReports = storyIds.length * BROWSERS.length;
  if (missing.length > 0 || introduced.length > 0) {
    fail(
      `${missing.length} missing report(s) of ${expectedReports}, ${introduced.length} introduced violation node(s)`
    );
  }
  console.log(
    `${PREFIX} OK: ${fw} ${expectedReports}/${expectedReports} reports, 0 introduced violations, ${stale.length} stale pre-existing row(s)`
  );
}

main(process.argv[2]);
