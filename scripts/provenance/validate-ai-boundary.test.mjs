#!/usr/bin/env node
// scripts/provenance/validate-ai-boundary.test.mjs
//
// Self-test for validate-ai-boundary.mjs, mirroring
// validate-mcp-boundary.test.mjs's exact structure and node:test usage.
// Verifies the script correctly detects each of the 4 violation checks
// (reverse-import, reverse-package.json, forward-package.json,
// forward-import) against synthetic fixture directories, and passes clean
// on the real repository state.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the real validate-ai-boundary.mjs path ONCE, from this test
// file's own location — never from process.cwd(), which the synthetic-
// fixture tests below deliberately point at a throwaway temp directory
// (the script itself must still be found there, while its target-repo
// scan runs against that temp directory via the child process's own cwd).
const SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), "validate-ai-boundary.mjs");

function runScript(cwd) {
  try {
    const output = execFileSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
    return { exitCode: 0, output };
  } catch (error) {
    return { exitCode: error.status, output: error.stdout + error.stderr };
  }
}

test("passes clean against the real repository state", () => {
  const result = runScript(process.cwd());
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /zero AI dependency-direction violations/);
});

test("detects a reverse-direction source import violation", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "react", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "react", "src", "bad.ts"), 'import "@ultimate/ai";\n');
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /reverse-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a reverse-direction package.json dependency (a framework package declaring @ultimate/ai)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "vue", "src"), { recursive: true });
    writeFileSync(
      join(dir, "packages", "vue", "package.json"),
      JSON.stringify({ dependencies: { "@ultimate/ai": "workspace:*" } })
    );
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /reverse-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a forward-direction package.json dependency on @ultimate/mcp", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(
      join(dir, "packages", "ai", "package.json"),
      JSON.stringify({ dependencies: { "@ultimate/mcp": "workspace:*" } })
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /forward-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a forward-direction source import (@ultimate/ai importing @ultimate/cli)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "src", "bad.ts"), 'import "@ultimate/cli";\n');
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /forward-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
