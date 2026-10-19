// scripts/provenance/classify-changes.test.mjs
//
// Tests for classify-changes.mjs (ADR-069): the docs-only fast path for the
// required `ci` job and the per-framework scope of the Browser track-a jobs.
// Every uncertain case must classify as "full" with all three frameworks.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  classifyChanges,
  formatOutput,
  isDocsOnlyPath,
  parseNameStatus,
} from "./classify-changes.mjs";

const ALL = ["ng", "react", "vue"];
const PR = { event: "pull_request" };
const SCRIPT = resolve(import.meta.dirname, "classify-changes.mjs");

test("isDocsOnlyPath: Markdown outside code and tool-read paths is docs-only", () => {
  for (const p of [
    "docs/superpowers/specs/x-design.md",
    "docs/architecture/research/2026-10-19-x.md",
    "README.md",
    "CHANGELOG.md",
    "SECURITY.md",
  ]) {
    assert.equal(isDocsOnlyPath(p), true, p);
  }
});

test("isDocsOnlyPath: Markdown that a CI script reads is not docs-only", () => {
  for (const p of [
    "AGENTS.md",
    "docs/architecture/PERFORMANCE.md",
    "docs/architecture/ACCESSIBILITY_BASELINE.md",
    "docs/architecture/SAST_BASELINE.md",
    "docs/architecture/PROVENANCE.md",
    "docs/architecture/COMPATIBILITY.md",
    "docs/architecture/research/2026-10-08-gap-064-g3e-accessibility-preexisting.md",
  ]) {
    assert.equal(isDocsOnlyPath(p), false, p);
  }
});

test("isDocsOnlyPath: Markdown under code, skills, tooling or config directories is not docs-only", () => {
  for (const p of [
    "packages/ng/README.md",
    "apps/playground-vue/README.md",
    "skills/x/SKILL.md",
    "tooling/prime-reference/ng/README.md",
    ".github/x.md",
    ".husky/x.md",
  ]) {
    assert.equal(isDocsOnlyPath(p), false, p);
  }
});

test("isDocsOnlyPath: non-Markdown files are never docs-only", () => {
  for (const p of [
    "docs/architecture/provenance/vue.json",
    "docs/architecture/checksums.json",
    "docs/architecture/compatibility-manifest.json",
    "pnpm-lock.yaml",
  ]) {
    assert.equal(isDocsOnlyPath(p), false, p);
  }
});

test("classifyChanges: a docs-only pull request is scope docs with no frameworks", () => {
  assert.deepEqual(classifyChanges(["docs/a.md", "README.md"], PR), {
    scope: "docs",
    frameworks: [],
  });
});

test("classifyChanges: one tool-read Markdown file makes the scope full", () => {
  assert.equal(
    classifyChanges(["docs/a.md", "docs/architecture/PERFORMANCE.md"], PR).scope,
    "full"
  );
});

test("classifyChanges: a framework package change selects only that framework", () => {
  assert.deepEqual(classifyChanges(["packages/ng/README.md"], PR), {
    scope: "full",
    frameworks: ["ng"],
  });
  assert.deepEqual(classifyChanges(["packages/react-core/src/a.ts"], PR), {
    scope: "full",
    frameworks: ["react"],
  });
  assert.deepEqual(classifyChanges(["apps/playground-vue/src/x.ts"], PR), {
    scope: "full",
    frameworks: ["vue"],
  });
  assert.deepEqual(
    classifyChanges(["apps/playground-angular/x.ts", "tooling/prime-reference/vue/x.ts"], PR),
    {
      scope: "full",
      frameworks: ["ng", "vue"],
    }
  );
});

test("classifyChanges: docs-only paths add no framework next to a framework change", () => {
  assert.deepEqual(classifyChanges(["packages/vue/src/a.ts", "docs/a.md"], PR), {
    scope: "full",
    frameworks: ["vue"],
  });
});

test("classifyChanges: shared packages, the lockfile and unknown paths select all frameworks", () => {
  for (const p of [
    "packages/uix-utils/src/a.ts",
    "packages/themes/src/a.ts",
    "pnpm-lock.yaml",
    "scripts/x.mjs",
    "somewhere/new.txt",
  ]) {
    assert.deepEqual(classifyChanges([p], PR), { scope: "full", frameworks: ALL }, p);
  }
});

test("classifyChanges: a push is always full with all frameworks", () => {
  assert.deepEqual(classifyChanges(["docs/a.md"], { event: "push" }), {
    scope: "full",
    frameworks: ALL,
  });
});

test("classifyChanges: an empty change list is full with all frameworks", () => {
  assert.deepEqual(classifyChanges([], PR), { scope: "full", frameworks: ALL });
});

test("parseNameStatus: both sides of a rename count, so a file moved out of packages/ is not docs-only", () => {
  const paths = parseNameStatus("R100\tpackages/ng/src/a.md\tdocs/a.md\nM\tdocs/b.md\n");
  assert.deepEqual(paths, ["packages/ng/src/a.md", "docs/a.md", "docs/b.md"]);
  assert.deepEqual(classifyChanges(paths, PR), { scope: "full", frameworks: ["ng"] });
});

test("formatOutput: frameworks are compact JSON, so the empty case is exactly []", () => {
  assert.equal(formatOutput({ scope: "docs", frameworks: [] }), "scope=docs\nframeworks=[]\n");
  assert.equal(
    formatOutput({ scope: "full", frameworks: ["ng"] }),
    'scope=full\nframeworks=["ng"]\n'
  );
});

function runCli(args, cwd) {
  const out = join(mkdtempSync(join(tmpdir(), "classify-")), "github-output");
  writeFileSync(out, "");
  const stdout = execFileSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GITHUB_OUTPUT: out },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { stdout, output: readFileSync(out, "utf8") };
}

test("CLI: a push is full with all frameworks and calls no git command", () => {
  const notARepo = mkdtempSync(join(tmpdir(), "classify-norepo-"));
  const { output } = runCli(["--event", "push"], notARepo);
  assert.equal(output, 'scope=full\nframeworks=["ng","react","vue"]\n');
});

test("CLI: an unresolvable base ref fails closed to full and exits 0", () => {
  const { output } = runCli(
    ["--event", "pull_request", "--base-ref", "origin/no-such-branch-for-test"],
    process.cwd()
  );
  assert.equal(output, 'scope=full\nframeworks=["ng","react","vue"]\n');
});
