// scripts/provenance/baseline-lib.mjs
//
// Merge-base-anchored baseline reading library for R6 and R7.
// Provides primitives to read a committed file's content as it existed
// at the merge-base commit with a given base ref.

import { execFileSync } from "node:child_process";

export const PERFORMANCE_MD_PATH = "docs/architecture/PERFORMANCE.md";

export function getMergeBaseSha(baseRef) {
  return execFileSync("git", ["merge-base", baseRef, "HEAD"], { encoding: "utf8" }).trim();
}

export function readFileAtRef(ref, relativePath) {
  try {
    return execFileSync("git", ["show", `${ref}:${relativePath}`], { encoding: "utf8" });
  } catch {
    return null; // file did not exist at that ref — caller decides how to handle (e.g. "no baseline yet" for Stage 1→2 transition)
  }
}

// Fail-closed variant for baseline reads (ADR-066). Returns the file text, or
// null only when Git reports that the path does not exist at that ref (an
// empty `git ls-tree` listing). A bad ref or any other Git error throws.
export function readFileAtRefStrict(ref, relativePath) {
  const listing = execFileSync("git", ["ls-tree", "--name-only", ref, "--", relativePath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (listing.trim() === "") return null;
  return execFileSync("git", ["show", `${ref}:${relativePath}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

// ADR-066 changed-rows rule shared by R6 and R7. Values are the parsed
// numbers from the baseline table Maps (undefined when there is no row), so
// 89.70 and 89.7 count as unchanged.
//   "removed"    - the merge-base has a row that HEAD dropped (fails closed);
//   "integrity"  - a baseline-only diff that changes or adds this row;
//   "regression" - every other case, against the merge-base value.
export function selectBaselinePath({ baselineOnly, mergeBaseValue, headValue }) {
  if (mergeBaseValue !== undefined && headValue === undefined) return "removed";
  if (baselineOnly && headValue !== mergeBaseValue) return "integrity";
  return "regression";
}

// Returns the "|"-led rows of the first Markdown table in `text`, stopping at
// the next "##" or "###" heading after that table starts, so a later table
// (for example a Stage 1 performance table with package-named rows) is never
// read as a baseline.
export function boundedTableRows(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim().startsWith("|"));
  if (start === -1) return [];
  const rows = [];
  for (const line of lines.slice(start)) {
    if (/^#{2,3} /.test(line)) break;
    if (line.trim().startsWith("|")) rows.push(line);
  }
  return rows;
}

// Reads PERFORMANCE.md at the merge-base with `baseRef` and at HEAD, and
// parses each with `parseTable`. Fails closed (throws) when the merge-base
// cannot be resolved, the file is unreadable or absent at either ref, or the
// merge-base table is empty or missing (ADR-066).
export function readBaselineTables(baseRef, parseTable, tableLabel) {
  const mergeBaseSha = getMergeBaseSha(baseRef);
  const tables = new Map();
  for (const [label, ref] of [
    ["merge-base", mergeBaseSha],
    ["HEAD", "HEAD"],
  ]) {
    const markdown = readFileAtRefStrict(ref, PERFORMANCE_MD_PATH);
    if (markdown === null) throw new Error(`PERFORMANCE.md does not exist at ${label}`);
    tables.set(label, parseTable(markdown));
  }
  if (tables.get("merge-base").size === 0) {
    throw new Error(`merge-base PERFORMANCE.md has no Phase 10 ${tableLabel} rows`);
  }
  return { mergeBaseSha, mergeBase: tables.get("merge-base"), head: tables.get("HEAD") };
}

// Diff-shape detector shared by R6 (validate-bundle-size.mjs) and R7
// (Task 9's affected-package computation is expected to reuse this rather
// than reimplementing its own git diff — see task-6-brief.md's sequencing
// note: this function is written here, in its final location, ahead of
// Task 9 so Task 9 can import it untouched).
//
// Returns true when, relative to the merge-base, the current diff touches
// only docs/architecture/PERFORMANCE.md and none of this package's own
// source/manifest paths — i.e. a "baseline-only" diff for this package,
// which selectBaselinePath routes to the integrity check when the diff also
// changes this package's baseline row (ADR-066). Returns false otherwise (including when
// the diff touches this package's source with or without also touching
// PERFORMANCE.md, and when the diff touches neither — the caller decides
// what "false because nothing relevant changed" means for its own gate).
export function isBaselineOnlyDiff(mergeBaseSha, packageName) {
  const changedFiles = execFileSync("git", ["diff", "--name-only", `${mergeBaseSha}...HEAD`], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

  const srcPrefix = `packages/${packageName}/src/`;
  const manifestPath = `packages/${packageName}/package.json`;

  const touchesPackage = changedFiles.some(
    (file) => file.startsWith(srcPrefix) || file === manifestPath
  );
  const touchesPerformanceDoc = changedFiles.includes(PERFORMANCE_MD_PATH);

  return touchesPerformanceDoc && !touchesPackage;
}
