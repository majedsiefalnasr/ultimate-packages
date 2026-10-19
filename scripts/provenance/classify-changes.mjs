#!/usr/bin/env node
// scripts/provenance/classify-changes.mjs
//
// Change classifier for scoped CI (ADR-069). Decides two things for a
// pull request:
//
//   - scope: "docs" when every changed path is Markdown that no CI script
//     reads, so the required `ci` job may skip its expensive steps; "full"
//     otherwise.
//   - frameworks: which of ng/react/vue the Browser track-a jobs must run.
//
// It fails closed: a push, an empty diff, an unknown path or any error
// yields scope "full" with all three frameworks.
//
// Usage (CLI): node scripts/provenance/classify-changes.mjs --event <github.event_name> [--base-ref origin/develop]
//   Prints the result and, inside GitHub Actions ($GITHUB_OUTPUT set),
//   appends `scope=<docs|full>` and `frameworks=<JSON array>`.

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { getMergeBaseSha } from "./baseline-lib.mjs";

const ALL_FRAMEWORKS = ["ng", "react", "vue"];

// Markdown under these prefixes is product or tool input, never docs-only.
const NON_DOCS_PREFIXES = ["packages/", "apps/", "skills/", "tooling/", ".github/", ".husky/"];

// Markdown files that CI scripts read (research §2.5).
const TOOL_READ_MARKDOWN = new Set([
  "AGENTS.md",
  "docs/architecture/PERFORMANCE.md",
  "docs/architecture/ACCESSIBILITY_BASELINE.md",
  "docs/architecture/SAST_BASELINE.md",
  "docs/architecture/PROVENANCE.md",
  "docs/architecture/COMPATIBILITY.md",
]);
const ACCESSIBILITY_PREEXISTING =
  /^docs\/architecture\/research\/[^/]*-accessibility-preexisting\.md$/;

const FRAMEWORK_PREFIXES = {
  ng: [
    "packages/ng/",
    "packages/ng-core/",
    "apps/playground-angular/",
    "tooling/prime-reference/ng/",
  ],
  react: ["packages/react/", "packages/react-core/", "apps/playground-react/"],
  vue: [
    "packages/vue/",
    "packages/vue-core/",
    "apps/playground-vue/",
    "tooling/prime-reference/vue/",
  ],
};

// --- Pure logic ----------------------------------------------------------

export function isDocsOnlyPath(path) {
  if (!path.endsWith(".md")) return false;
  if (NON_DOCS_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  if (TOOL_READ_MARKDOWN.has(path)) return false;
  return !ACCESSIBILITY_PREEXISTING.test(path);
}

function frameworksForPath(path) {
  if (isDocsOnlyPath(path)) return [];
  const matched = ALL_FRAMEWORKS.filter((fw) =>
    FRAMEWORK_PREFIXES[fw].some((prefix) => path.startsWith(prefix))
  );
  return matched.length > 0 ? matched : ALL_FRAMEWORKS;
}

export function classifyChanges(paths, { event }) {
  if (event !== "pull_request" || paths.length === 0) {
    return { scope: "full", frameworks: [...ALL_FRAMEWORKS] };
  }
  const scope = paths.every(isDocsOnlyPath) ? "docs" : "full";
  const frameworks = new Set(paths.flatMap(frameworksForPath));
  return { scope, frameworks: ALL_FRAMEWORKS.filter((fw) => frameworks.has(fw)) };
}

// `git diff --name-status -M` output: status, then one path (or two for a
// rename or copy). Every path column counts.
export function parseNameStatus(text) {
  return text
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => line.split("\t").slice(1));
}

export function formatOutput({ scope, frameworks }) {
  return `scope=${scope}\nframeworks=${JSON.stringify(frameworks)}\n`;
}

// --- Git-backed resolution and CLI -----------------------------------------

function getChangedPaths(baseRef) {
  const mergeBaseSha = getMergeBaseSha(baseRef);
  return parseNameStatus(
    execFileSync("git", ["diff", "--name-status", "-M", `${mergeBaseSha}...HEAD`], {
      encoding: "utf8",
    })
  );
}

function argValue(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : undefined;
}

function runCli() {
  const args = process.argv.slice(2);
  const event = argValue(args, "--event") ?? "";
  const baseRef = argValue(args, "--base-ref");

  let result;
  try {
    const paths = event === "pull_request" ? getChangedPaths(baseRef) : [];
    result = classifyChanges(paths, { event });
  } catch (error) {
    console.error(`[classify-changes] could not classify, running everything: ${error.message}`);
    result = classifyChanges([], { event: "error" });
  }

  console.log(
    `[classify-changes] event=${event} base=${baseRef ?? "(none)"} scope=${result.scope} frameworks=${JSON.stringify(result.frameworks)}`
  );
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, formatOutput(result));
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
