// scripts/perf/run-identity.mjs
//
// Identity block recorded with every Stage 1 performance result (the
// `identity` field of the artifact shape
// { identity, protocol: { W, R, I }, category, results: [...] }).
// It never throws: a git or pnpm call that fails yields "unknown".
// `browser` is optional and is filled in by the browser-based measurements.

import { execFileSync } from "node:child_process";

/** Run a command and return its stdout, or null when it fails. */
function tryCommand(file, args) {
  try {
    return execFileSync(file, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

function textOrUnknown(output) {
  const text = typeof output === "string" ? output.trim() : "";
  return text === "" ? "unknown" : text;
}

/**
 * Pure assembly of the identity block from already-collected inputs, so it can
 * be tested without git or pnpm.
 */
export function buildIdentity({ sha, pnpm, nodeVersion, arch, env, now }) {
  return {
    sha: textOrUnknown(sha),
    date: now.toISOString(),
    node: nodeVersion,
    pnpm: textOrUnknown(pnpm),
    arch,
    runner: env.RUNNER_NAME || "local",
    image: env.PERF_IMAGE || "unknown",
  };
}

/** Identity of the current run: `{ sha, date, node, pnpm, arch, runner, image, browser? }`. */
export function runIdentity() {
  return buildIdentity({
    sha: tryCommand("git", ["rev-parse", "HEAD"]),
    pnpm: tryCommand("pnpm", ["--version"]),
    nodeVersion: process.version,
    arch: process.arch,
    env: process.env,
    now: new Date(),
  });
}
