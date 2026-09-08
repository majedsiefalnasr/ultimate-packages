// scripts/provenance/baseline-lib.test.mjs
//
// Tests for baseline-lib.mjs merge-base-anchored baseline reading primitives.
// All tests use real git history from this repository.

import { test } from "node:test";
import assert from "node:assert/strict";
import { getMergeBaseSha, readFileAtRef } from "./baseline-lib.mjs";
import { execSync } from "node:child_process";

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
  assert.ok(
    parsed.name && parsed.version,
    "package.json should contain name and version fields"
  );
});

test("readFileAtRef(<real commit SHA>, 'this/path/does/not/exist.md') returns null, not an exception", () => {
  const commitSha = currentHeadSha;
  const result = readFileAtRef(commitSha, "this/path/does/not/exist.md");

  assert.strictEqual(result, null, "readFileAtRef should return null for non-existent file");
});
