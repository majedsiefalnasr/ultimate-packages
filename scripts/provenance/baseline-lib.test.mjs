// scripts/provenance/baseline-lib.test.mjs
//
// Tests for baseline-lib.mjs merge-base-anchored baseline reading primitives.
// The getMergeBaseSha/readFileAtRef tests use real git history from this
// repository; the isBaselineOnlyDiff tests build a scratch git repo in a
// temp directory so the diff shape under test is fully controlled rather
// than depending on this repository's own commit history.

import { test } from "node:test";
import assert from "node:assert/strict";
import { getMergeBaseSha, readFileAtRef, isBaselineOnlyDiff } from "./baseline-lib.mjs";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Get the current HEAD SHA for reference in tests
const currentHeadSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();

test("getMergeBaseSha('HEAD') returns current HEAD SHA (merge-base of a ref with itself is itself)", () => {
  const mergeBaseSha = getMergeBaseSha("HEAD");
  assert.strictEqual(mergeBaseSha, currentHeadSha, "merge-base(HEAD, HEAD) should return HEAD");
});

test("readFileAtRef(<real commit SHA>, 'package.json') returns real file content matching git show output", () => {
  // Use the current HEAD commit
  const commitSha = currentHeadSha;

  // Get content via readFileAtRef
  const content = readFileAtRef(commitSha, "package.json");

  // Verify it's not null
  assert.notStrictEqual(
    content,
    null,
    "readFileAtRef should return content for package.json at HEAD"
  );

  // Cross-check: get the same file via direct git show command
  const directContent = execSync(`git show ${commitSha}:package.json`, {
    encoding: "utf8",
  });

  assert.strictEqual(
    content,
    directContent,
    "readFileAtRef content should match direct git show output"
  );

  // Verify it's valid JSON and contains expected root keys
  const parsed = JSON.parse(content);
  assert.ok(parsed.name && parsed.version, "package.json should contain name and version fields");
});

test("readFileAtRef(<real commit SHA>, 'this/path/does/not/exist.md') returns null, not an exception", () => {
  const commitSha = currentHeadSha;
  const result = readFileAtRef(commitSha, "this/path/does/not/exist.md");

  assert.strictEqual(result, null, "readFileAtRef should return null for non-existent file");
});

// --- isBaselineOnlyDiff -----------------------------------------------------
//
// Builds a scratch git repo per test with a merge-base commit, then a
// branch commit whose changed files are fully controlled by the test, and
// runs isBaselineOnlyDiff with the real cwd pointed at that scratch repo
// (execFileSync inherits process.cwd() by default, so these tests chdir
// into the scratch repo for the duration of the call and restore cwd after,
// matching the module's own git-invocation pattern rather than needing an
// injected cwd parameter it doesn't have).

function runGit(cwd, args) {
  execSync(`git ${args}`, { cwd, stdio: "pipe" });
}

function makeScratchRepo() {
  const dir = mkdtempSync(join(tmpdir(), "baseline-lib-scratch-"));
  runGit(dir, "init -q");
  runGit(dir, 'config user.email "test@example.com"');
  runGit(dir, 'config user.name "Test"');
  return dir;
}

function commitAll(dir, message) {
  runGit(dir, "add -A");
  runGit(dir, `commit -q -m "${message}"`);
}

function withCwd(dir, fn) {
  const original = process.cwd();
  process.chdir(dir);
  try {
    return fn();
  } finally {
    process.chdir(original);
  }
}

test("isBaselineOnlyDiff returns true when the diff touches only PERFORMANCE.md for the given package", () => {
  const dir = makeScratchRepo();

  mkdirSync(join(dir, "docs", "architecture"), { recursive: true });
  writeFileSync(join(dir, "docs", "architecture", "PERFORMANCE.md"), "# Performance Baseline\n");
  commitAll(dir, "initial");

  const mergeBaseSha = execSync("git rev-parse HEAD", { cwd: dir, encoding: "utf8" }).trim();

  writeFileSync(
    join(dir, "docs", "architecture", "PERFORMANCE.md"),
    "# Performance Baseline\n\nUpdated baseline value.\n"
  );
  commitAll(dir, "update baseline only");

  const result = withCwd(dir, () => isBaselineOnlyDiff(mergeBaseSha, "uix-utils"));

  assert.strictEqual(result, true, "diff touching only PERFORMANCE.md should be baseline-only");

  rmSync(dir, { recursive: true, force: true });
});

test("isBaselineOnlyDiff returns false when the diff also touches the package's own src file", () => {
  const dir = makeScratchRepo();

  mkdirSync(join(dir, "docs", "architecture"), { recursive: true });
  mkdirSync(join(dir, "packages", "uix-utils", "src"), { recursive: true });
  writeFileSync(join(dir, "docs", "architecture", "PERFORMANCE.md"), "# Performance Baseline\n");
  writeFileSync(join(dir, "packages", "uix-utils", "src", "index.ts"), "export {};\n");
  commitAll(dir, "initial");

  const mergeBaseSha = execSync("git rev-parse HEAD", { cwd: dir, encoding: "utf8" }).trim();

  writeFileSync(
    join(dir, "docs", "architecture", "PERFORMANCE.md"),
    "# Performance Baseline\n\nUpdated baseline value.\n"
  );
  writeFileSync(join(dir, "packages", "uix-utils", "src", "index.ts"), "export const a = 1;\n");
  commitAll(dir, "change source and baseline");

  const result = withCwd(dir, () => isBaselineOnlyDiff(mergeBaseSha, "uix-utils"));

  assert.strictEqual(
    result,
    false,
    "diff touching the package's own src file should not be baseline-only"
  );

  rmSync(dir, { recursive: true, force: true });
});

test("isBaselineOnlyDiff returns false when the diff touches the package's package.json (manifest) only, without touching PERFORMANCE.md", () => {
  const dir = makeScratchRepo();

  mkdirSync(join(dir, "packages", "uix-utils"), { recursive: true });
  writeFileSync(
    join(dir, "packages", "uix-utils", "package.json"),
    JSON.stringify({ name: "@ultimate/uix-utils", version: "1.0.0" })
  );
  commitAll(dir, "initial");

  const mergeBaseSha = execSync("git rev-parse HEAD", { cwd: dir, encoding: "utf8" }).trim();

  writeFileSync(
    join(dir, "packages", "uix-utils", "package.json"),
    JSON.stringify({ name: "@ultimate/uix-utils", version: "1.0.1" })
  );
  commitAll(dir, "bump version");

  const result = withCwd(dir, () => isBaselineOnlyDiff(mergeBaseSha, "uix-utils"));

  assert.strictEqual(
    result,
    false,
    "diff not touching PERFORMANCE.md at all is not a baseline-only diff"
  );

  rmSync(dir, { recursive: true, force: true });
});
