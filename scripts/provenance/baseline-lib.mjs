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
