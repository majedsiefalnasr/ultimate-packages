#!/usr/bin/env node
// scripts/provenance/validate-agents-md-pointers.mjs
//
// Deliberately narrow: verify every file/directory path referenced in
// AGENTS.md's "Where to find things" pointer table exists on disk. Does
// not check AGENTS.md's prose for conceptual accuracy, does not check any
// link outside that one table, and does not flag a pointer that is
// missing from the table but should exist — only an existing row whose
// target no longer does.

import { existsSync, readFileSync } from "node:fs";

const AGENTS_MD_PATH = "AGENTS.md";

function fail(message) {
  console.error(`[agents-md-pointers:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[agents-md-pointers:validate] OK: ${message}`);
}

if (!existsSync(AGENTS_MD_PATH)) {
  fail(`${AGENTS_MD_PATH} does not exist`);
}

const content = readFileSync(AGENTS_MD_PATH, "utf8");

// Extract the first backtick-quoted repository-relative path in each data
// row's "See" column. The table's rows look like:
//   | Current phase/track status | `docs/architecture/ROADMAP.md` |
// Some rows annotate the path with trailing prose (e.g. "(dated files)")
// or reference a non-filesystem target (e.g. a package name) alongside a
// real path — this extracts only the first backtick-quoted token per row,
// which is always the checkable filesystem path when one is present. Rows
// whose "See" column has no backtick-quoted token (nothing to check as a
// path) are skipped, not failed. A small, targeted parse of exactly this
// table shape, not a general Markdown parser.
const tableSectionMatch = content.match(/## \d+\. Where to find things[\s\S]*?(?=\n## |\n$)/);
if (!tableSectionMatch) {
  fail(`could not locate the "Where to find things" section in ${AGENTS_MD_PATH}`);
}

const tableSection = tableSectionMatch[0];
const dataRows = [...tableSection.matchAll(/^\|(?!---)(.+)\|(.+)\|$/gm)].filter(
  ([, forCol]) => !/^\s*For\.\.\.\s*$/.test(forCol)
);

if (dataRows.length === 0) {
  fail(`no pointer-table data rows found in ${AGENTS_MD_PATH}`);
}

let checked = 0;
for (const [, , seeCol] of dataRows) {
  const pathMatch = seeCol.match(/`([^`]+)`/);
  if (!pathMatch) continue; // no backtick-quoted reference in this row
  const candidate = pathMatch[1].trim();
  // Only repository-relative paths are checkable filesystem references.
  // A reference like `@ultimate/component-metadata` names an npm package,
  // not a path on disk relative to the repo root — skip it rather than
  // failing on something this check was never meant to validate.
  if (candidate.startsWith("@") || !candidate.includes("/")) continue;
  if (!existsSync(candidate)) {
    fail(`AGENTS.md pointer table references "${candidate}", which does not exist`);
  }
  checked++;
}

pass(`all ${checked} path(s) referenced in AGENTS.md's pointer table exist`);
process.exit(0);
