// scripts/provenance/classify-changes.test.mjs
//
// Tests for classify-changes.mjs (ADR-069): the docs-only fast path for the
// required `ci` job and the per-framework scope of the Browser track-a jobs.
// Every uncertain case must classify as "full" with all three frameworks.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  classifyChanges,
  deriveFrameworkClosures,
  formatOutput,
  TRACK_A_SHARDS,
  trackAMatrix,
  isDocsOnlyPath,
  isNonBrowserPath,
  NON_BROWSER_PATHS,
  noClosurePackages,
  parseNameStatus,
} from "./classify-changes.mjs";
import { getTransitiveClosure } from "./workspace-graph.mjs";

const ALL = ["ng", "react", "vue"];
const FULL_TRACK_A =
  '{"include":[{"framework":"ng","shard":1},{"framework":"ng","shard":2},{"framework":"ng","shard":3},{"framework":"react","shard":1},{"framework":"vue","shard":1},{"framework":"vue","shard":2},{"framework":"vue","shard":3}]}';
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

test('formatOutput: frameworks and track_a are compact JSON, so the empty cases are exactly [] and {"include":[]}', () => {
  assert.equal(
    formatOutput({ scope: "docs", frameworks: [] }),
    'scope=docs\nframeworks=[]\ntrack_a={"include":[]}\n'
  );
  assert.equal(
    formatOutput({ scope: "full", frameworks: ["ng"] }),
    'scope=full\nframeworks=["ng"]\ntrack_a={"include":[{"framework":"ng","shard":1},{"framework":"ng","shard":2},{"framework":"ng","shard":3}]}\n'
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
  assert.equal(output, `scope=full\nframeworks=["ng","react","vue"]\ntrack_a=${FULL_TRACK_A}\n`);
});

test("CLI: the log line includes the track_a matrix", () => {
  const notARepo = mkdtempSync(join(tmpdir(), "classify-norepo-"));
  const { stdout } = runCli(["--event", "push"], notARepo);
  assert.match(
    stdout,
    new RegExp(
      `frameworks=\\["ng","react","vue"\\] track_a=${FULL_TRACK_A.replace(/[{}[\]]/g, "\\$&")}`
    )
  );
});

test("CLI: an unresolvable base ref fails closed to full and exits 0", () => {
  const { output } = runCli(
    ["--event", "pull_request", "--base-ref", "origin/no-such-branch-for-test"],
    process.cwd()
  );
  assert.equal(output, `scope=full\nframeworks=["ng","react","vue"]\ntrack_a=${FULL_TRACK_A}\n`);
});

// --- ADR-070: framework closures, the non-browser list and the removal modes ---

const REPO_ROOT = resolve(import.meta.dirname, "..", "..");
const SHORT = (name) => name.replace(/^@ultimate\//, "");

// A throwaway workspace: { "packages/x": { dependencies: {...} }, ... } → temp dir.
function makeTree(manifests, extraFiles = {}) {
  const root = mkdtempSync(join(tmpdir(), "classify-tree-"));
  for (const [dir, manifest] of Object.entries(manifests)) {
    mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(
      join(root, dir, "package.json"),
      JSON.stringify({
        name: dir.startsWith("packages/") ? `@ultimate/${dir.slice(9)}` : dir.replaceAll("/", "-"),
        ...manifest,
      })
    );
  }
  for (const [path, content] of Object.entries(extraFiles)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

// Every default framework root, so the CLI's default roots resolve in a fixture.
function defaultRoots(extra = {}) {
  const roots = {};
  for (const dir of [
    "packages/ng",
    "packages/ng-core",
    "packages/react",
    "packages/react-core",
    "packages/vue",
    "packages/vue-core",
    "apps/playground-angular",
    "apps/playground-react",
    "apps/playground-vue",
    "tooling/prime-reference/ng",
    "tooling/prime-reference/vue",
  ]) {
    roots[dir] = {};
  }
  return { ...roots, ...extra };
}

test("deriveFrameworkClosures: shared packages are in every closure, tooling packages in none", () => {
  const closures = deriveFrameworkClosures(REPO_ROOT);
  for (const fw of ALL) {
    for (const shared of [
      "themes",
      "uix-data",
      "uix-motion",
      "uix-styled",
      "uix-styles",
      "uix-utils",
    ]) {
      assert.ok(closures[fw].has(shared), `${shared} in ${fw}`);
    }
    for (const tool of ["ai", "cli", "mcp", "component-metadata", "component-schema"]) {
      assert.ok(!closures[fw].has(tool), `${tool} not in ${fw}`);
    }
  }
  assert.ok(!closures.ng.has("react"), "themes' devDependency on react does not reach ng");
  assert.ok(
    closures.all.has("cli") && closures.all.has("ng"),
    "all lists every packages/* manifest"
  );
});

test("deriveFrameworkClosures: agrees with workspace-graph's getTransitiveClosure for the package roots", () => {
  const closures = deriveFrameworkClosures(REPO_ROOT);
  const packageRoots = {
    ng: ["ng", "ng-core"],
    react: ["react", "react-core"],
    vue: ["vue", "vue-core"],
  };
  for (const fw of ALL) {
    const expected = new Set(packageRoots[fw]);
    for (const root of packageRoots[fw]) {
      for (const dep of getTransitiveClosure(`@ultimate/${root}`)) expected.add(SHORT(dep));
    }
    // The apps/ and tooling/ roots add nothing beyond the package roots today.
    assert.deepEqual([...closures[fw]].sort(), [...expected].sort(), fw);
  }
});

test("deriveFrameworkClosures: a peer or optional workspace edge throws", () => {
  for (const field of ["peerDependencies", "optionalDependencies"]) {
    const root = makeTree({
      "packages/fw": {},
      "packages/x": { [field]: { "@ultimate/fw": "workspace:*" } },
    });
    assert.throws(
      () => deriveFrameworkClosures(root, { ng: ["packages/fw"], react: [], vue: [] }),
      field
    );
  }
});

test("deriveFrameworkClosures: two projects with one package name throw", () => {
  const root = makeTree({ "packages/fw": {}, "packages/other": { name: "@ultimate/fw" } });
  assert.throws(
    () => deriveFrameworkClosures(root, { ng: ["packages/fw"], react: [], vue: [] }),
    /share the package name @ultimate\/fw/
  );
});

test("deriveFrameworkClosures: devDependencies count only at the roots", () => {
  const root = makeTree({
    "packages/fw": { devDependencies: { "@ultimate/shared": "workspace:*" } },
    "packages/shared": {
      dependencies: { "@ultimate/base": "workspace:*" },
      devDependencies: { "@ultimate/testonly": "workspace:*" },
    },
    "packages/base": {},
    "packages/testonly": {},
    "packages/tool": {},
  });
  const closures = deriveFrameworkClosures(root, { ng: ["packages/fw"], react: [], vue: [] });
  assert.deepEqual([...closures.ng].sort(), ["base", "fw", "shared"]);
  assert.deepEqual(noClosurePackages(closures), ["testonly", "tool"]);
});

test("noClosurePackages: on the real tree, exactly the tooling packages are in no closure", () => {
  const closures = deriveFrameworkClosures(REPO_ROOT);
  assert.deepEqual(noClosurePackages(closures), [
    "ai",
    "cli",
    "component-metadata",
    "component-schema",
    "mcp",
  ]);
  for (const pkg of closures.all) {
    if (noClosurePackages(closures).includes(pkg)) continue;
    const inSome = ALL.filter((fw) => closures[fw].has(pkg));
    assert.ok(
      inSome.length === 3 ||
        ["ng", "ng-core", "react", "react-core", "vue", "vue-core"].includes(pkg),
      `${pkg} is a framework root or in all three closures`
    );
  }
});

test("isNonBrowserPath: every listed entry matches", () => {
  for (const p of [
    "docs/architecture/provenance/react.json",
    ".changeset/x.md",
    ".changeset/config.json",
    ".github/codeql/codeql-config.yml",
    "AGENTS.md",
    "docs/architecture/PROVENANCE.md",
    "docs/architecture/PERFORMANCE.md",
    "docs/architecture/SAST_BASELINE.md",
    "docs/architecture/COMPATIBILITY.md",
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    ".github/workflows/perf-stage1.yml",
    "scripts/provenance/validate-provenance.mjs",
    "scripts/provenance/validate-sast-baseline.test.mjs",
  ]) {
    assert.equal(isNonBrowserPath(p), true, p);
  }
  for (const p of [...NON_BROWSER_PATHS.exact]) assert.equal(isNonBrowserPath(p), true, p);
});

test("isNonBrowserPath: neighbours of listed entries do not match", () => {
  for (const p of [
    "docs/architecture/provenance.json",
    "scripts/perf/x.ts",
    "scripts/perf/browser/harness.ts",
    "docs/architecture/compatibility-manifest.json",
    "scripts/copy-compatibility-manifest.mjs",
    "skills/x",
    "docs/architecture/ACCESSIBILITY_BASELINE.md",
    "scripts/provenance/classify-changes.mjs",
    "scripts/provenance/baseline-lib.mjs",
    "scripts/provenance/validate-g3a-accessibility.mjs",
    ".github/workflows/browser.yml",
    "playwright.config.ts",
    "docs/architecture/AGENTS.md",
  ]) {
    assert.equal(isNonBrowserPath(p), false, p);
  }
});

test("NON_BROWSER_PATHS: the tracked files it matches are this snapshot, and none is a browser input", () => {
  const tracked = execFileSync("git", ["ls-files"], { cwd: REPO_ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const matched = tracked.filter(isNonBrowserPath).sort();
  assert.deepEqual(matched, [
    ".changeset/README.md",
    ".changeset/config.json",
    ".github/codeql/codeql-config.yml",
    ".github/workflows/ci.yml",
    ".github/workflows/perf-stage1.yml",
    ".github/workflows/release.yml",
    "AGENTS.md",
    "docs/architecture/COMPATIBILITY.md",
    "docs/architecture/PERFORMANCE.md",
    "docs/architecture/PROVENANCE.md",
    "docs/architecture/SAST_BASELINE.md",
    "docs/architecture/provenance/ng-core.json",
    "docs/architecture/provenance/ng.json",
    "docs/architecture/provenance/react-core.json",
    "docs/architecture/provenance/react.json",
    "docs/architecture/provenance/themes.json",
    "docs/architecture/provenance/uix-data.json",
    "docs/architecture/provenance/uix-motion.json",
    "docs/architecture/provenance/uix-styled.json",
    "docs/architecture/provenance/uix-styles.json",
    "docs/architecture/provenance/uix-utils.json",
    "docs/architecture/provenance/vue-core.json",
    "docs/architecture/provenance/vue.json",
    "scripts/provenance/affected-packages.mjs",
    "scripts/provenance/affected-packages.test.mjs",
    "scripts/provenance/generate-manifest.mjs",
    "scripts/provenance/installed-cli-mcp-smoke.mjs",
    "scripts/provenance/installed-cli-mcp-smoke.test.mjs",
    "scripts/provenance/measure-package-size.mjs",
    "scripts/provenance/pack-install-integrity.mjs",
    "scripts/provenance/pack-install-integrity.test.mjs",
    "scripts/provenance/production-scope.mjs",
    "scripts/provenance/production-scope.test.mjs",
    "scripts/provenance/validate-bundle-size.mjs",
    "scripts/provenance/validate-bundle-size.test.mjs",
    "scripts/provenance/validate-coverage.mjs",
    "scripts/provenance/validate-coverage.test.mjs",
    "scripts/provenance/validate-provenance-diff.test.mjs",
    "scripts/provenance/validate-provenance-manifest.test.mjs",
    "scripts/provenance/validate-provenance.mjs",
    "scripts/provenance/validate-sast-baseline.mjs",
    "scripts/provenance/validate-sast-baseline.test.mjs",
  ]);
  const browserText =
    readFileSync(join(REPO_ROOT, ".github/workflows/browser.yml"), "utf8") +
    readFileSync(join(REPO_ROOT, "playwright.config.ts"), "utf8");
  for (const p of matched) {
    assert.ok(
      !/^(packages|apps|skills|tooling)\//.test(p),
      `${p} is outside the package and tooling trees`
    );
    assert.ok(
      !browserText.includes(p),
      `${p} is not referenced by browser.yml or playwright.config.ts`
    );
  }
});

function runMode(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });
}

test("CLI --remove-non-browser-paths: deletes exactly the tracked listed files", () => {
  const root = makeTree(
    {},
    {
      "AGENTS.md": "a",
      "docs/architecture/provenance/a.json": "{}",
      "scripts/provenance/classify-changes.mjs": "",
      "README.md": "r",
    }
  );
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "."], { cwd: root });
  writeFileSync(join(root, "untracked.md"), "u");
  mkdirSync(join(root, ".changeset"));
  writeFileSync(join(root, ".changeset/u.md"), "u");
  const result = runMode(["--remove-non-browser-paths", "--repo-root", root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!existsSync(join(root, "AGENTS.md")));
  assert.ok(!existsSync(join(root, "docs/architecture/provenance/a.json")));
  for (const kept of [
    "scripts/provenance/classify-changes.mjs",
    "README.md",
    ".changeset/u.md",
    "untracked.md",
  ]) {
    assert.ok(existsSync(join(root, kept)), `${kept} kept`);
  }
  assert.match(result.stdout, /AGENTS\.md/);
  assert.match(result.stdout, /docs\/architecture\/provenance\/a\.json/);
});

test("CLI --remove-non-browser-paths: exits non-zero outside a git repository", () => {
  const notARepo = mkdtempSync(join(tmpdir(), "classify-norepo-"));
  const result = runMode(["--remove-non-browser-paths", "--repo-root", notARepo], notARepo);
  assert.notEqual(result.status, 0);
});

test("CLI --remove-out-of-closure-packages: empties no-closure packages except a script-less package.json", () => {
  const root = makeTree(
    defaultRoots({
      "packages/ng": { dependencies: { "@ultimate/uix-utils": "workspace:*" } },
      "packages/uix-utils": { scripts: { build: "tsup" } },
      "packages/cli": {
        version: "1.2.3",
        scripts: { build: "tsup", prepare: "x" },
        dependencies: { "@ultimate/uix-utils": "workspace:*" },
      },
    }),
    {
      "packages/cli/src/a.ts": "x",
      "packages/cli/dist/a.js": "x",
      "packages/uix-utils/src/b.ts": "y",
    }
  );
  const result = runMode(["--remove-out-of-closure-packages", "--repo-root", root], root);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(join(root, "packages/cli")), ["package.json"]);
  // Spec Amendment A1: without scripts, a whole-workspace build skips it.
  assert.deepEqual(JSON.parse(readFileSync(join(root, "packages/cli/package.json"), "utf8")), {
    name: "@ultimate/cli",
    version: "1.2.3",
    dependencies: { "@ultimate/uix-utils": "workspace:*" },
  });
  assert.ok(existsSync(join(root, "packages/uix-utils/src/b.ts")), "closure package untouched");
  assert.deepEqual(
    JSON.parse(readFileSync(join(root, "packages/uix-utils/package.json"), "utf8")).scripts,
    { build: "tsup" },
    "closure package keeps its scripts"
  );
  assert.match(result.stdout, /cli/);
});

test("CLI --remove-out-of-closure-packages: exits non-zero when the closures cannot be derived", () => {
  const root = makeTree(
    defaultRoots({ "packages/x": { peerDependencies: { "@ultimate/ng": "workspace:*" } } })
  );
  const result = runMode(["--remove-out-of-closure-packages", "--repo-root", root], root);
  assert.notEqual(result.status, 0);
  assert.ok(existsSync(join(root, "packages/x/package.json")));
});

// --- ADR-070: the framework rule (Spec R5.4) and PRs into main (R6) ---

const CLOSURES = {
  ng: new Set(["ng", "ng-core", "uix-utils", "onlyng"]),
  react: new Set(["react", "react-core", "uix-utils"]),
  vue: new Set(["vue", "vue-core", "uix-utils"]),
  all: new Set([
    "ng",
    "ng-core",
    "react",
    "react-core",
    "vue",
    "vue-core",
    "uix-utils",
    "onlyng",
    "cli",
  ]),
};
const PRC = { event: "pull_request", baseRef: "origin/develop", closures: CLOSURES };
const frameworksOf = (paths, options = PRC) => classifyChanges(paths, options).frameworks;

test("rule 3: a package in no closure selects no framework", () => {
  assert.deepEqual(frameworksOf(["packages/cli/src/x.ts"]), []);
});

test("rule 3: a package in every closure, in only some closures, or unknown selects all", () => {
  for (const p of ["packages/uix-utils/x", "packages/onlyng/x", "packages/nope/x"]) {
    assert.deepEqual(frameworksOf([p]), ALL, p);
  }
});

test("rule 4: listed non-browser paths select no framework", () => {
  for (const p of [
    "docs/architecture/provenance/react.json",
    "AGENTS.md",
    ".changeset/x.md",
    ".github/codeql/codeql-config.yml",
    ".github/workflows/ci.yml",
    "scripts/provenance/validate-provenance.mjs",
  ]) {
    assert.deepEqual(frameworksOf([p]), [], p);
  }
});

test("rule 5: unlisted paths, browser inputs and new paths select all", () => {
  for (const p of [
    "scripts/perf/browser/harness.ts",
    "scripts/provenance/validate-g3a-accessibility.mjs",
    "scripts/provenance/new.mjs",
    "docs/architecture/compatibility-manifest.json",
    "docs/architecture/ACCESSIBILITY_BASELINE.md",
    "skills/a/b.md",
    ".github/workflows/browser.yml",
    "playwright.config.ts",
    "pnpm-lock.yaml",
    "apps/docs/x",
    "newdir/x",
  ]) {
    assert.deepEqual(frameworksOf([p]), ALL, p);
  }
});

test("rules combine: a no-closure package next to a framework change selects that framework", () => {
  assert.deepEqual(frameworksOf(["packages/cli/x", "packages/react/y"]), ["react"]);
});

test("renames count on both sides across classes", () => {
  assert.deepEqual(frameworksOf(parseNameStatus("R100\tpackages/ng/a.ts\tpackages/cli/a.ts\n")), [
    "ng",
  ]);
  assert.deepEqual(
    frameworksOf(
      parseNameStatus("R100\tdocs/architecture/provenance/a.json\tdocs/architecture/a.json\n")
    ),
    ALL
  );
});

test("without closures, packages select all; listed and docs-only paths need none", () => {
  const options = { ...PRC, closures: null };
  assert.deepEqual(frameworksOf(["packages/cli/x"], options), ALL);
  assert.deepEqual(frameworksOf(["AGENTS.md"], options), []);
  assert.deepEqual(classifyChanges(["docs/a.md"], options), { scope: "docs", frameworks: [] });
});

test("R6: a pull request into main runs everything, even when docs-only", () => {
  assert.deepEqual(
    classifyChanges(["docs/a.md"], {
      event: "pull_request",
      baseRef: "origin/main",
      closures: CLOSURES,
    }),
    { scope: "full", frameworks: ALL }
  );
});

test("CLI: closures that cannot be derived leave packages selecting all, and exit 0", () => {
  const root = makeTree(
    defaultRoots({
      "packages/tool": {},
      "packages/x": { peerDependencies: { "@ultimate/ng": "workspace:*" } },
    })
  );
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q", "-b", "base");
  git("add", ".");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "base");
  git("switch", "-q", "-c", "head");
  writeFileSync(join(root, "packages/tool/x.ts"), "x");
  git("add", ".");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "head");
  const { output } = runCli(
    ["--event", "pull_request", "--base-ref", "base", "--repo-root", root],
    root
  );
  assert.equal(output, `scope=full\nframeworks=["ng","react","vue"]\ntrack_a=${FULL_TRACK_A}\n`);
});

test("CLI: a no-closure package change selects no framework", () => {
  const root = makeTree(defaultRoots({ "packages/tool": {} }));
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q", "-b", "base");
  git("add", ".");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "base");
  git("switch", "-q", "-c", "head");
  writeFileSync(join(root, "packages/tool/x.ts"), "x");
  git("add", ".");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "head");
  const { output } = runCli(
    ["--event", "pull_request", "--base-ref", "base", "--repo-root", root],
    root
  );
  assert.equal(output, 'scope=full\nframeworks=[]\ntrack_a={"include":[]}\n');
});

// --- ADR-071: the track-a shard matrix ---

test("trackAMatrix: ng and vue get three shards, react one, in framework then shard order", () => {
  const { include } = trackAMatrix(["ng", "react", "vue"]);
  assert.deepEqual(include, [
    { framework: "ng", shard: 1 },
    { framework: "ng", shard: 2 },
    { framework: "ng", shard: 3 },
    { framework: "react", shard: 1 },
    { framework: "vue", shard: 1 },
    { framework: "vue", shard: 2 },
    { framework: "vue", shard: 3 },
  ]);
  for (const entry of include) assert.equal(typeof entry.shard, "number");
  assert.deepEqual({ ...TRACK_A_SHARDS }, { ng: 3, react: 1, vue: 3 });
  assert.ok(Object.isFrozen(TRACK_A_SHARDS));
});

test("trackAMatrix: one framework, and no framework", () => {
  assert.deepEqual(trackAMatrix(["react"]), { include: [{ framework: "react", shard: 1 }] });
  assert.deepEqual(trackAMatrix([]), { include: [] });
});

test("trackAMatrix: a framework without a shard count throws instead of vanishing", () => {
  assert.throws(() => trackAMatrix(["svelte"]), /no track-a shard count for svelte/);
});
