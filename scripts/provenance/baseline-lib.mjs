// scripts/provenance/baseline-lib.mjs
//
// Merge-base-anchored baseline reading library for R6 and R7.
// Provides primitives to read a committed file's content as it existed
// at the merge-base commit with a given base ref.

import { execFileSync } from "node:child_process";

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

// Diff-shape detector shared by R6 (validate-bundle-size.mjs) and R7
// (Task 9's affected-package computation is expected to reuse this rather
// than reimplementing its own git diff — see task-6-brief.md's sequencing
// note: this function is written here, in its final location, ahead of
// Task 9 so Task 9 can import it untouched).
//
// Returns true when, relative to the merge-base, the current diff touches
// only docs/architecture/PERFORMANCE.md and none of this package's own
// source/manifest paths — i.e. a "baseline-only" diff for this package,
// which the R6/R7 two-step lifecycle routes to the integrity check instead
// of the regression comparison. Returns false otherwise (including when
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
  const touchesPerformanceDoc = changedFiles.includes("docs/architecture/PERFORMANCE.md");

  return touchesPerformanceDoc && !touchesPackage;
}
