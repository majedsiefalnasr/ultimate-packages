#!/usr/bin/env node
// scripts/provenance/classify-changes.mjs
//
// Change classifier for scoped CI (ADR-069). Decides two things for a
// pull request:
//
//   - scope: "docs" when every changed path is Markdown that no CI script
//     reads, so the required `ci` job may skip its expensive steps; "full"
//     otherwise.
//   - frameworks: which of ng/react/vue the Browser jobs must run. Only a
//     workspace package in no framework closure, or a path on the closed
//     NON_BROWSER_PATHS list, selects none; the Browser jobs physically remove
//     both (ADR-070).
//
// It fails closed: a push, a pull request into main, an empty diff, an
// unknown path or any error yields scope "full" with all three frameworks.
//
// Usage (CLI): node scripts/provenance/classify-changes.mjs --event <github.event_name> [--base-ref origin/develop] [--repo-root <dir>]
//   Prints the result and, inside GitHub Actions ($GITHUB_OUTPUT set),
//   appends `scope=<docs|full>`, `frameworks=<JSON array>` and
//   `track_a=<JSON matrix>`, the Browser track-a shard matrix (ADR-071).
//   --remove-non-browser-paths / --remove-out-of-closure-packages [--repo-root <dir>]:
//   the Browser jobs' removal steps; they exit non-zero on any error.

import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getMergeBaseSha } from "./baseline-lib.mjs";

const ALL_FRAMEWORKS = ["ng", "react", "vue"];

// Markdown under these prefixes is product or tool input, never docs-only.
const NON_DOCS_PREFIXES = ["packages/", "apps/", "skills/", "tooling/", ".github/", ".husky/"];

// Markdown files that CI scripts read.
const TOOL_READ_MARKDOWN = new Set([
  "AGENTS.md",
  "docs/architecture/PERFORMANCE.md",
  "docs/architecture/ACCESSIBILITY_BASELINE.md",
  "docs/architecture/SAST_BASELINE.md",
  "docs/architecture/PROVENANCE.md",
  "docs/architecture/COMPATIBILITY.md",
]);
const ACCESSIBILITY_PREEXISTING =
  /^docs\/architecture\/baselines\/[^/]*-accessibility-preexisting\.md$/;

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

// Spec R5.4 (ADR-070), rules in order. Only rules 3 and 4 narrow, and the
// Browser jobs physically remove what they narrow. Without closures, rule 3
// selects all three.
function frameworksForPath(path, closures) {
  if (isDocsOnlyPath(path)) return [];
  const matched = ALL_FRAMEWORKS.filter((fw) =>
    FRAMEWORK_PREFIXES[fw].some((prefix) => path.startsWith(prefix))
  );
  if (matched.length > 0) return matched;
  const pkg = /^packages\/([^/]+)\//.exec(path)?.[1];
  if (pkg !== undefined) {
    const inNoClosure =
      closures?.all.has(pkg) && !ALL_FRAMEWORKS.some((fw) => closures[fw].has(pkg));
    return inNoClosure ? [] : ALL_FRAMEWORKS;
  }
  return isNonBrowserPath(path) ? [] : ALL_FRAMEWORKS;
}

export function classifyChanges(paths, { event, baseRef, closures = null }) {
  // ADR-070 (CO-5): a pull request into main runs everything.
  if (event !== "pull_request" || paths.length === 0 || baseRef === "origin/main") {
    return { scope: "full", frameworks: [...ALL_FRAMEWORKS] };
  }
  const scope = paths.every(isDocsOnlyPath) ? "docs" : "full";
  const frameworks = new Set(paths.flatMap((path) => frameworksForPath(path, closures)));
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

// ADR-071 (CO-8): the Browser track-a jobs per framework. ng and vue run as
// three shards each; react runs as one.
export const TRACK_A_SHARDS = Object.freeze({ ng: 3, react: 1, vue: 3 });

// A framework without a shard count throws, so its track-a job can never
// silently vanish from the matrix.
export function trackAMatrix(frameworks) {
  return {
    include: frameworks.flatMap((framework) => {
      const shards = TRACK_A_SHARDS[framework];
      if (!Object.hasOwn(TRACK_A_SHARDS, framework)) {
        throw new Error(`no track-a shard count for ${framework}`);
      }
      return Array.from({ length: shards }, (_, i) => ({ framework, shard: i + 1 }));
    }),
  };
}

export function formatOutput({ scope, frameworks }) {
  return (
    `scope=${scope}\nframeworks=${JSON.stringify(frameworks)}\n` +
    `track_a=${JSON.stringify(trackAMatrix(frameworks))}\n`
  );
}

// --- Browser inputs (ADR-070) ------------------------------------------------

// Paths no Browser job may read. Both browser jobs delete these files before
// installing (removeNonBrowserPaths), so no browser result can depend on them.
// Adding an entry is a classifier change, which runs all three frameworks with
// the new exclusion already applied, proving the entry on its own PR.
export const NON_BROWSER_PATHS = Object.freeze({
  prefixes: Object.freeze(["docs/architecture/provenance/", ".changeset/", ".github/codeql/"]),
  exact: Object.freeze([
    "AGENTS.md",
    "docs/architecture/PROVENANCE.md",
    "docs/architecture/PERFORMANCE.md",
    "docs/architecture/SAST_BASELINE.md",
    "docs/architecture/COMPATIBILITY.md",
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    ".github/workflows/perf-stage1.yml",
    ...[
      "validate-provenance.mjs",
      "validate-provenance-diff.test.mjs",
      "validate-provenance-manifest.test.mjs",
      "production-scope.mjs",
      "production-scope.test.mjs",
      "generate-manifest.mjs",
      "validate-coverage.mjs",
      "validate-coverage.test.mjs",
      "validate-bundle-size.mjs",
      "validate-bundle-size.test.mjs",
      "measure-package-size.mjs",
      "affected-packages.mjs",
      "affected-packages.test.mjs",
      "pack-install-integrity.mjs",
      "pack-install-integrity.test.mjs",
      "installed-cli-mcp-smoke.mjs",
      "installed-cli-mcp-smoke.test.mjs",
      "validate-sast-baseline.mjs",
      "validate-sast-baseline.test.mjs",
      "coverage-measure.test.mjs",
      "known-missing.mjs",
      "known-missing.test.mjs",
    ].map((name) => `scripts/provenance/${name}`),
  ]),
});

export function isNonBrowserPath(path) {
  return (
    NON_BROWSER_PATHS.exact.includes(path) ||
    NON_BROWSER_PATHS.prefixes.some((prefix) => path.startsWith(prefix))
  );
}

const FRAMEWORK_ROOTS = {
  ng: ["packages/ng", "packages/ng-core", "apps/playground-angular", "tooling/prime-reference/ng"],
  react: ["packages/react", "packages/react-core", "apps/playground-react"],
  vue: ["packages/vue", "packages/vue-core", "apps/playground-vue", "tooling/prime-reference/vue"],
};
const PROJECT_PARENTS = ["packages", "apps", "tooling/prime-reference"];

function workspaceDeps(field) {
  return Object.entries(field ?? {})
    .filter(([, spec]) => String(spec).startsWith("workspace:"))
    .map(([name]) => name);
}

// Every project manifest under the workspace parents, keyed by package name.
function readProjects(repoRoot) {
  const byName = new Map();
  for (const parent of PROJECT_PARENTS) {
    const parentPath = join(repoRoot, parent);
    if (!existsSync(parentPath)) continue;
    for (const entry of readdirSync(parentPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = `${parent}/${entry.name}`;
      const manifestPath = join(repoRoot, dir, "package.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      const unmodeled = [
        ...workspaceDeps(manifest.peerDependencies),
        ...workspaceDeps(manifest.optionalDependencies),
      ];
      if (unmodeled.length > 0) {
        throw new Error(`${dir} has peer or optional workspace edges, which are not modeled`);
      }
      if (byName.has(manifest.name)) {
        throw new Error(
          `${byName.get(manifest.name).dir} and ${dir} share the package name ${manifest.name}`
        );
      }
      byName.set(manifest.name, {
        dir,
        dependencies: workspaceDeps(manifest.dependencies),
        devDependencies: workspaceDeps(manifest.devDependencies),
      });
    }
  }
  return byName;
}

// Each framework's closure: the packages/* directory names reachable from its
// roots, following the roots' dependencies and devDependencies, then
// dependencies only (workspace-graph.mjs's getTransitiveClosure semantics).
// `all` is every packages/* directory with a manifest. Throws on any error.
export function deriveFrameworkClosures(repoRoot, roots = FRAMEWORK_ROOTS) {
  const projects = readProjects(repoRoot);
  const byDir = new Map([...projects.values()].map((project) => [project.dir, project]));
  const packageName = (dir) => (dir.startsWith("packages/") ? dir.slice("packages/".length) : null);

  const closures = {};
  for (const fw of ALL_FRAMEWORKS) {
    const closure = new Set();
    const queue = [];
    for (const rootDir of roots[fw] ?? []) {
      const root = byDir.get(rootDir);
      if (!root) throw new Error(`framework root ${rootDir} has no manifest`);
      if (packageName(rootDir)) closure.add(packageName(rootDir));
      queue.push(...root.dependencies, ...root.devDependencies);
    }
    const seen = new Set();
    while (queue.length > 0) {
      const name = queue.shift();
      if (seen.has(name)) continue;
      seen.add(name);
      const project = projects.get(name);
      if (!project) throw new Error(`workspace dependency ${name} has no manifest`);
      if (packageName(project.dir)) closure.add(packageName(project.dir));
      queue.push(...project.dependencies);
    }
    closures[fw] = closure;
  }
  closures.all = new Set([...byDir.keys()].map(packageName).filter(Boolean));
  return closures;
}

export function noClosurePackages(closures) {
  return [...closures.all]
    .filter((pkg) => !ALL_FRAMEWORKS.some((fw) => closures[fw].has(pkg)))
    .sort();
}

// Deletes every tracked file NON_BROWSER_PATHS matches. Throws on any error.
function removeNonBrowserPaths(repoRoot) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: repoRoot, encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  const removed = tracked.filter(isNonBrowserPath);
  for (const path of removed) rmSync(join(repoRoot, path), { force: true });
  console.log(`[classify-changes] removed ${removed.length} non-browser file(s):`);
  for (const path of removed) console.log(`  ${path}`);
}

// Empties every packages/* directory in no framework closure, except its
// package.json, which keeps the pnpm workspace intact. The browser jobs run
// this before building, so the kept package.json loses its scripts and a
// whole-workspace build skips the package (Spec Amendment A1). Throws on any
// error.
function removeOutOfClosurePackages(repoRoot) {
  const packages = noClosurePackages(deriveFrameworkClosures(repoRoot));
  console.log(
    `[classify-changes] emptying ${packages.length} package(s) outside the framework closures:`
  );
  for (const pkg of packages) {
    const dir = join(repoRoot, "packages", pkg);
    const entries = readdirSync(dir).filter((entry) => entry !== "package.json");
    for (const entry of entries) rmSync(join(dir, entry), { recursive: true, force: true });
    const manifestPath = join(dir, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    delete manifest.scripts;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(
      `  packages/${pkg}: ${entries.length} entr${entries.length === 1 ? "y" : "ies"} removed`
    );
  }
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

// The removal modes fail loudly: a browser job must never run with a
// non-browser input still present.
function runRemoval(mode, repoRoot) {
  try {
    if (mode === "--remove-non-browser-paths") removeNonBrowserPaths(repoRoot);
    else removeOutOfClosurePackages(repoRoot);
  } catch (error) {
    console.error(`[classify-changes] ${mode} failed: ${error.message}`);
    process.exit(1);
  }
}

function runCli() {
  const args = process.argv.slice(2);
  const repoRoot = argValue(args, "--repo-root") ?? process.cwd();
  const removalMode = ["--remove-non-browser-paths", "--remove-out-of-closure-packages"].find(
    (mode) => args.includes(mode)
  );
  if (removalMode) return runRemoval(removalMode, repoRoot);

  const event = argValue(args, "--event") ?? "";
  const baseRef = argValue(args, "--base-ref");

  let closures = null;
  try {
    closures = deriveFrameworkClosures(repoRoot);
  } catch (error) {
    console.error(
      `[classify-changes] framework closures unavailable, packages select all frameworks: ${error.message}`
    );
  }

  let result;
  try {
    const paths = event === "pull_request" ? getChangedPaths(baseRef) : [];
    result = classifyChanges(paths, { event, baseRef, closures });
  } catch (error) {
    console.error(`[classify-changes] could not classify, running everything: ${error.message}`);
    result = classifyChanges([], { event: "error" });
  }

  console.log(
    `[classify-changes] event=${event} base=${baseRef ?? "(none)"} scope=${result.scope} frameworks=${JSON.stringify(result.frameworks)} track_a=${JSON.stringify(trackAMatrix(result.frameworks))}`
  );
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, formatOutput(result));
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
