# GAP-131 Installed Compatibility Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED (user, Plan Review 2026-10-11), including Amendment A1. Execution method: subagent-driven development (a fresh implementer and a fresh reviewer per task). Stop conditions: Task 2 (OQ-2 probe), Task 3 (reproduce first), Task 7 (hard user stop).

**Goal:** Installed `@ultimate/cli` and `@ultimate/mcp` packages read the compatibility manifest from a copy built into their own `dist/`, proven by installed-package smoke tests after the defect is first reproduced.

**Architecture:** One shared build-time script copies the canonical `docs/architecture/compatibility-manifest.json` into each package's `dist/`. Each package resolves `<package root>/dist/compatibility-manifest.json` through a single path module. A new smoke harness packs the CLI/MCP closure, installs it into Angular, React and Vue pnpm consumers, and runs the published binaries.

**Tech Stack:** Node 24.15.0 (CI), pnpm 9.6.0, tsup, TypeScript, Vitest (package tests), `node:test` (script tests), `@modelcontextprotocol/sdk` 1.x stdio client (already a dependency of `@ultimate/mcp`), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-11-gap-131-installed-compatibility-manifest-design.md` (APPROVED 2026-10-11, commit `19181a8`).

**Branch:** `feature/gap-131-installed-compatibility-manifest` (from `main` `9baf086`).

## Global Constraints

- Canonical source stays `docs/architecture/compatibility-manifest.json`; the packaged copy is a build output, never edited (Spec §4).
- No new package; no new runtime dependency; `files` stays `["dist", "README.md"]` in both packages (Spec §4, AC-7).
- No runtime fallback to the monorepo path (Spec §4).
- MCP keeps its own reader and its structured `manifest_unreadable` error contract (Spec §4, AC-6).
- The smoke harness uses **pnpm only** (OQ-1). No Verdaccio or other local registry.
- **OQ-2 verify-or-stop:** pnpm override behaviour on `pnpm add <bare name>` is verified before it is relied on. If it does not work, stop and report the concrete limitation; do not expand scope.
- **OQ-3:** public-registry installs retained; no new registry service, cache or dependency; no new retry or timeout settings.
- **Reproduce first (Spec §6.1):** the harness runs against unmodified packages before any fix. If the failure does not reproduce, stop and report.
- GAP statuses do not change in this Plan. GAP-131 stays OPEN until closeout, by user decision.
- Commits: Conventional Commits, stage named files only, each ending with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01UEsaFKaM48LuWvz28kHToN`
- No push and no merge without separate user authorization.
- Execution ledger (git-ignored): `.superpowers/sdd/2026-10-11-gap-131-installed-manifest/progress.md`.

## Proposed Spec amendment (for Plan Review)

- **A1 — `generate` component name.** Spec §6.2 lists `ultimate generate button`. Metadata record names are capitalized (`packages/component-metadata/src/records/button.ts:26`: `name: "Button"`), and `runGenerate` matches the name exactly (`packages/cli/src/commands/generate.ts:93`), so `button` would exit 1. This Plan uses `ultimate generate Button`. The fix is factual only; scope is unchanged. Approval of this Plan approves A1, which is then folded into Spec §6.2 in Task 7.

## Review Focus

1. **pnpm's symlinked install layout:** an installed binary runs from the real path inside `node_modules/.pnpm/…`. The nearest `package.json` there is the installed package itself, so the resolver must find `dist/compatibility-manifest.json` beside it. Pinned by the smoke harness (Task 6), which installs with pnpm.
2. **Working directory unrelated to the package:** the binaries run from the consumer project's directory. The manifest path must not depend on `process.cwd()`. Pinned by the path tests in Tasks 4 and 5, which assert an absolute path under the package root.
3. **Stale packaged copy:** a manifest edit without a rebuild leaves an outdated `dist/` copy. Pinned by the byte-equality tests in Tasks 4 and 5.
4. **Copy step skipped** (for example `tsup` run directly): MCP must still return its structured `manifest_unreadable` error, not crash. Pinned by the existing missing-file test in `packages/mcp/test/manifest.test.ts`, kept unchanged and re-run in Task 5.
5. **CLI falls back to npm** because the consumer has no lockfile: pinned by the lockfile assertion in the harness (Task 2, AC-8).

---

## File structure

| File                                                   | Action | Responsibility                                                                |
| ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| `scripts/provenance/pack-install-integrity.mjs`        | Modify | Export existing helpers for reuse (no behaviour change)                       |
| `scripts/provenance/installed-cli-mcp-smoke.mjs`       | Create | Smoke harness: pack, create consumers, override probe, CLI checks, MCP checks |
| `scripts/provenance/installed-cli-mcp-smoke.test.mjs`  | Create | `node:test` unit tests for the harness's pure helpers                         |
| `scripts/copy-compatibility-manifest.mjs`              | Create | Copies the canonical manifest into `<package>/dist/`                          |
| `packages/cli/src/manifest-path.ts`                    | Create | Single CLI manifest path                                                      |
| `packages/cli/src/commands/{add,init,theme,doctor}.ts` | Modify | Import the path; delete local `MANIFEST_PATH`                                 |
| `packages/cli/test/manifest-path.test.ts`              | Create | Path and drift tests                                                          |
| `packages/cli/package.json`                            | Modify | `build` script runs the copy step                                             |
| `packages/mcp/src/manifest-path.ts`                    | Modify | Resolve `<package root>/dist/compatibility-manifest.json`                     |
| `packages/mcp/test/manifest-path.test.ts`              | Create | Path and drift tests                                                          |
| `packages/mcp/package.json`                            | Modify | `build` script runs the copy step                                             |
| `package.json`                                         | Modify | `smoke:installed` script                                                      |
| `.github/workflows/ci.yml`                             | Modify | "Installed-package smoke (CLI/MCP)" step                                      |

---

### Task 1: Export the pack/install helpers

**Files:**

- Modify: `scripts/provenance/pack-install-integrity.mjs` (the `toScopedName`, `packageRoot`, `getPackageDependenciesFromDisk` and `packOne` function declarations)
- Test: `scripts/provenance/pack-install-integrity.test.mjs` (existing, unchanged)

**Interfaces:**

- Produces: `export function toScopedName(pkgName: string): string`; `export function packageRoot(scopedName: string): string`; `export function getPackageDependenciesFromDisk(scopedName: string): string[]`; `export function packOne(scopedName: string, packDestDir: string): string` (returns the tarball's absolute path). `topologicalSort` is already exported.

- [ ] **Step 1: Write the failing test**

Append to `scripts/provenance/installed-cli-mcp-smoke.test.mjs` (new file):

```js
// scripts/provenance/installed-cli-mcp-smoke.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import * as packInstall from "./pack-install-integrity.mjs";

test("pack-install-integrity exports the helpers the smoke harness reuses", () => {
  for (const name of [
    "toScopedName",
    "packageRoot",
    "getPackageDependenciesFromDisk",
    "packOne",
    "topologicalSort",
  ]) {
    assert.equal(typeof packInstall[name], "function", `${name} is exported`);
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`
Expected: FAIL — `toScopedName is exported` (`undefined` !== `"function"`).

- [ ] **Step 3: Add `export` to the four declarations**

In `scripts/provenance/pack-install-integrity.mjs` change exactly these four lines:

```js
export function toScopedName(pkgName) {
```

```js
export function packageRoot(scopedName) {
```

```js
export function getPackageDependenciesFromDisk(scopedName) {
```

```js
export function packOne(scopedName, packDestDir) {
```

No other change.

- [ ] **Step 4: Run the new and the existing tests**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs scripts/provenance/pack-install-integrity.test.mjs`
Expected: PASS, all tests.

- [ ] **Step 5: Confirm the CLI behaviour is unchanged**

Run: `pnpm run build && pnpm run integrity:pack-install -- cli`
Expected: `[pack-install-integrity] OK: @ultimate/cli + … packed, installed, and verified …`

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/pack-install-integrity.mjs scripts/provenance/installed-cli-mcp-smoke.test.mjs
git commit -m "refactor(provenance): export pack/install helpers for reuse (GAP-131)"
```

(Message body ends with the two attribution lines from Global Constraints.)

---

### Task 2: Smoke harness — consumers and the OQ-2 override probe

**Files:**

- Create: `scripts/provenance/installed-cli-mcp-smoke.mjs`
- Test: `scripts/provenance/installed-cli-mcp-smoke.test.mjs`

**Interfaces:**

- Consumes (Task 1): `toScopedName`, `packageRoot`, `getPackageDependenciesFromDisk`, `packOne`, `topologicalSort`; `getTransitiveClosure` from `./workspace-graph.mjs`.
- Produces:
  - `export const CONSUMERS: Array<{ framework: "angular"|"react"|"vue"; frameworkPackage: string; mcpVersion: string; dependencies: Record<string,string> }>`
  - `export const SMOKE_ROOTS: string[]`
  - `export function buildConsumerPackageJson(consumer, tarballByName: Map<string,string>): object`
  - `export function packSmokeMembers(packDestDir: string): Map<string,string>`
  - `export function createConsumer(parentDir: string, consumer, tarballByName): string` (returns the consumer directory; throws if `pnpm-lock.yaml` is absent after install)
  - `export function probeOverride(consumerDir: string): void` (throws `Error` whose message starts `OQ-2:` when the bare `pnpm add` does not resolve locally)

- [ ] **Step 1: Write the failing tests**

Append to `scripts/provenance/installed-cli-mcp-smoke.test.mjs`:

```js
import { CONSUMERS, SMOKE_ROOTS, buildConsumerPackageJson } from "./installed-cli-mcp-smoke.mjs";

test("consumers cover angular, react and vue with manifest-satisfying versions", () => {
  assert.deepEqual(
    CONSUMERS.map((c) => c.framework),
    ["angular", "react", "vue"]
  );
  const angular = CONSUMERS[0];
  assert.equal(angular.dependencies["@angular/core"], "^21.2.22");
  assert.equal(angular.dependencies["@angular/cdk"], "^21.0.0");
  assert.equal(angular.dependencies.rxjs, "^7.8.1");
  assert.equal(CONSUMERS[1].dependencies.react, "^18.3.1");
  assert.equal(CONSUMERS[1].dependencies["react-dom"], "^18.3.1");
  assert.equal(CONSUMERS[2].dependencies.vue, "^3.5.13");
});

test("smoke roots are the CLI, MCP, the three framework packages, themes and uix-utils", () => {
  assert.deepEqual([...SMOKE_ROOTS].sort(), [
    "@ultimate/cli",
    "@ultimate/mcp",
    "@ultimate/ng",
    "@ultimate/react",
    "@ultimate/themes",
    "@ultimate/uix-utils",
    "@ultimate/vue",
  ]);
});

test("consumer package.json depends on the CLI and MCP tarballs and overrides every packed member", () => {
  const tarballs = new Map([
    ["@ultimate/cli", "/t/cli.tgz"],
    ["@ultimate/mcp", "/t/mcp.tgz"],
    ["@ultimate/uix-utils", "/t/uix-utils.tgz"],
  ]);
  const pkg = buildConsumerPackageJson(CONSUMERS[1], tarballs);
  assert.equal(pkg.private, true);
  assert.equal(pkg.dependencies["@ultimate/cli"], "file:/t/cli.tgz");
  assert.equal(pkg.dependencies["@ultimate/mcp"], "file:/t/mcp.tgz");
  assert.equal(pkg.dependencies.react, "^18.3.1");
  assert.deepEqual(pkg.pnpm.overrides, {
    "@ultimate/cli": "file:/t/cli.tgz",
    "@ultimate/mcp": "file:/t/mcp.tgz",
    "@ultimate/uix-utils": "file:/t/uix-utils.tgz",
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`
Expected: FAIL — `Cannot find module …/installed-cli-mcp-smoke.mjs`.

- [ ] **Step 3: Create the harness module (consumers, packing, probe)**

```js
// scripts/provenance/installed-cli-mcp-smoke.mjs
//
// GAP-131 installed-package smoke harness (Spec
// docs/superpowers/specs/2026-10-11-gap-131-installed-compatibility-manifest-design.md
// §6.2). Packs @ultimate/cli, @ultimate/mcp and the packages their commands
// install, installs them into Angular, React and Vue pnpm consumers, and runs
// the published binaries. pnpm only (OQ-1). The bare-name override behaviour
// is probed before it is relied on (OQ-2).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPackageDependenciesFromDisk,
  packageRoot,
  packOne,
  toScopedName,
  topologicalSort,
} from "./pack-install-integrity.mjs";
import { getTransitiveClosure } from "./workspace-graph.mjs";

export const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");

export const CONSUMERS = [
  {
    framework: "angular",
    frameworkPackage: "@ultimate/ng",
    mcpVersion: "21.2.22",
    dependencies: {
      "@angular/common": "^21.2.22",
      "@angular/core": "^21.2.22",
      "@angular/forms": "^21.2.22",
      "@angular/platform-browser": "^21.2.22",
      "@angular/router": "^21.2.22",
      "@angular/cdk": "^21.0.0",
      rxjs: "^7.8.1",
    },
  },
  {
    framework: "react",
    frameworkPackage: "@ultimate/react",
    mcpVersion: "18.3.1",
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
  },
  {
    framework: "vue",
    frameworkPackage: "@ultimate/vue",
    mcpVersion: "3.5.13",
    dependencies: { vue: "^3.5.13" },
  },
];

/** Packages the consumers depend on directly or that CLI commands install. */
export const SMOKE_ROOTS = [
  "@ultimate/cli",
  "@ultimate/mcp",
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
  "@ultimate/uix-utils",
];

export function buildConsumerPackageJson(consumer, tarballByName) {
  const overrides = {};
  for (const [name, tarball] of tarballByName) overrides[name] = `file:${tarball}`;
  return {
    name: `gap-131-smoke-${consumer.framework}`,
    version: "1.0.0",
    private: true,
    dependencies: {
      ...consumer.dependencies,
      "@ultimate/cli": `file:${tarballByName.get("@ultimate/cli")}`,
      "@ultimate/mcp": `file:${tarballByName.get("@ultimate/mcp")}`,
    },
    pnpm: { overrides },
  };
}

/** Packs every member of the union closure of SMOKE_ROOTS, dependencies first. */
export function packSmokeMembers(packDestDir) {
  const members = new Set();
  for (const root of SMOKE_ROOTS) {
    members.add(root);
    for (const dep of getTransitiveClosure(root)) members.add(toScopedName(dep));
  }
  const sorted = topologicalSort([...members], getPackageDependenciesFromDisk);
  const tarballByName = new Map();
  for (const member of sorted) tarballByName.set(member, packOne(member, packDestDir));
  return tarballByName;
}

/** Creates and installs one consumer. Installs WITH a lockfile (Spec §6.2, AC-8). */
export function createConsumer(parentDir, consumer, tarballByName) {
  const consumerDir = join(parentDir, consumer.framework);
  mkdirSync(consumerDir);
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(buildConsumerPackageJson(consumer, tarballByName), null, 2)
  );
  execFileSync("pnpm", ["install"], { cwd: consumerDir, stdio: "inherit" });
  if (!existsSync(join(consumerDir, "pnpm-lock.yaml"))) {
    throw new Error(
      `AC-8: ${consumer.framework} consumer has no pnpm-lock.yaml; the CLI would fall back to npm`
    );
  }
  return consumerDir;
}

/**
 * OQ-2: verifies that `pnpm add <bare name>` (the CLI's install form,
 * packages/cli/src/install-package.ts) resolves an unpublished @ultimate
 * package through pnpm.overrides instead of the registry.
 */
export function probeOverride(consumerDir) {
  const name = "@ultimate/uix-utils";
  const result = spawnSync("pnpm", ["add", name], { cwd: consumerDir, encoding: "utf8" });
  const installed = join(consumerDir, "node_modules", "@ultimate", "uix-utils", "package.json");
  const expectedVersion = JSON.parse(
    readFileSync(join(packageRoot(name), "package.json"), "utf8")
  ).version;
  const ok =
    result.status === 0 &&
    existsSync(installed) &&
    JSON.parse(readFileSync(installed, "utf8")).version === expectedVersion;
  if (!ok) {
    throw new Error(
      `OQ-2: pnpm add ${name} did not resolve through pnpm.overrides (exit ${result.status}).\n` +
        `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
}

function isMainModule() {
  return process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
}

if (isMainModule() && process.argv.includes("--probe-only")) {
  const packDir = mkdtempSync(join(tmpdir(), "gap-131-pack-"));
  const workDir = mkdtempSync(join(tmpdir(), "gap-131-consumers-"));
  try {
    const tarballs = packSmokeMembers(packDir);
    const consumerDir = createConsumer(workDir, CONSUMERS[1], tarballs);
    probeOverride(consumerDir);
    console.log("[installed-smoke] OQ-2 probe OK: bare pnpm add resolved through pnpm.overrides");
  } catch (error) {
    console.error(`[installed-smoke] ${error.message}`);
    process.exitCode = 1;
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  }
}
```

- [ ] **Step 4: Run the unit tests**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the OQ-2 probe (verify-or-stop)**

Run: `pnpm run build && node scripts/provenance/installed-cli-mcp-smoke.mjs --probe-only`
Expected: `[installed-smoke] OQ-2 probe OK: bare pnpm add resolved through pnpm.overrides`

**If it fails** (any message starting `OQ-2:` or an `AC-8:` lockfile failure): **STOP.** Record the full output in the ledger, do not commit, and report the concrete limitation to the user. Do not add a registry, change the CLI's install behaviour, or continue to Task 3.

- [ ] **Step 6: Record and commit**

Append the probe output to `.superpowers/sdd/2026-10-11-gap-131-installed-manifest/progress.md` (git-ignored), then:

```bash
git add scripts/provenance/installed-cli-mcp-smoke.mjs scripts/provenance/installed-cli-mcp-smoke.test.mjs
git commit -m "test(provenance): add GAP-131 smoke consumers and the pnpm override probe"
```

---

### Task 3: Harness CLI and MCP checks, then reproduce the defect (Spec §6.1)

**Files:**

- Modify: `scripts/provenance/installed-cli-mcp-smoke.mjs`
- Test: `scripts/provenance/installed-cli-mcp-smoke.test.mjs`

**Interfaces:**

- Consumes (Task 2): `CONSUMERS`, `packSmokeMembers`, `createConsumer`, `probeOverride`, `REPO_ROOT`.
- Produces:
  - `export function mentionsManifestFailure(output: string): boolean`
  - `export function runCliChecks(consumerDir: string, consumer): Array<{ check: string; ok: boolean; detail: string }>`
  - `export async function runMcpChecks(consumerDir: string): Promise<Array<{ check: string; ok: boolean; detail: string }>>`
  - `export async function runSmoke(): Promise<boolean>` (true when every check passes)

- [ ] **Step 1: Write the failing test**

Append to `scripts/provenance/installed-cli-mcp-smoke.test.mjs`:

```js
import { mentionsManifestFailure } from "./installed-cli-mcp-smoke.mjs";

test("mentionsManifestFailure detects a missing compatibility manifest", () => {
  assert.equal(
    mentionsManifestFailure(
      "Error: ENOENT: no such file or directory, open '/x/node_modules/docs/architecture/compatibility-manifest.json'"
    ),
    true
  );
  assert.equal(mentionsManifestFailure('{"code":"manifest_unreadable","message":"ENOENT"}'), true);
  assert.equal(
    mentionsManifestFailure("init: installed @ultimate/react and wrote ultimate.config.json."),
    false
  );
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`
Expected: FAIL — `mentionsManifestFailure` is not exported (`SyntaxError` on import).

- [ ] **Step 3: Add the checks and the full run**

In `scripts/provenance/installed-cli-mcp-smoke.mjs`, add `import { createRequire } from "node:module";` to the imports, then add before `isMainModule`:

```js
export function mentionsManifestFailure(output) {
  return (
    /manifest_unreadable/.test(output) ||
    /(ENOENT|no such file)[^\n]*compatibility-manifest\.json/.test(output) ||
    /compatibility-manifest\.json[^\n]*(ENOENT|no such file)/.test(output)
  );
}

function runBin(consumerDir, bin, args) {
  const result = spawnSync(join(consumerDir, "node_modules", ".bin", bin), args, {
    cwd: consumerDir,
    encoding: "utf8",
  });
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function readDeps(consumerDir) {
  return JSON.parse(readFileSync(join(consumerDir, "package.json"), "utf8")).dependencies ?? {};
}

export function runCliChecks(consumerDir, consumer) {
  const results = [];
  const record = (check, ok, detail) => results.push({ check, ok, detail });

  const init = runBin(consumerDir, "ultimate", ["init"]);
  record(
    "init",
    init.status === 0 &&
      existsSync(join(consumerDir, "ultimate.config.json")) &&
      consumer.frameworkPackage in readDeps(consumerDir),
    init.output
  );

  const add = runBin(consumerDir, "ultimate", ["add", "@ultimate/uix-utils"]);
  record(
    "add @ultimate/uix-utils",
    add.status === 0 && "@ultimate/uix-utils" in readDeps(consumerDir),
    add.output
  );

  const theme = runBin(consumerDir, "ultimate", ["theme", "aura"]);
  record(
    "theme aura",
    theme.status === 0 &&
      "@ultimate/themes" in readDeps(consumerDir) &&
      (existsSync(join(consumerDir, "ultimate-theme.ts")) ||
        existsSync(join(consumerDir, "ultimate-theme.js"))),
    theme.output
  );

  const doctor = runBin(consumerDir, "ultimate", ["doctor"]);
  record(
    "doctor",
    doctor.status === 0 && /(\d+) of \1 known components reported/.test(doctor.output),
    doctor.output
  );

  const generate = runBin(consumerDir, "ultimate", ["generate", "Button"]);
  record(
    "generate Button",
    generate.status === 0 && generate.output.trim().length > 0,
    generate.output
  );

  const all = [init, add, theme, doctor, generate].map((r) => r.output).join("\n");
  record("no manifest failure in CLI output", !mentionsManifestFailure(all), "");
  return results;
}

export async function runMcpChecks(consumerDir) {
  const require = createRequire(join(REPO_ROOT, "packages", "mcp", "package.json"));
  const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

  const results = [];
  const transport = new StdioClientTransport({
    command: join(consumerDir, "node_modules", ".bin", "ultimate-mcp"),
    args: [],
    cwd: consumerDir,
  });
  const client = new Client({ name: "gap-131-smoke", version: "1.0.0" });
  try {
    await client.connect(transport);
    results.push({ check: "mcp initialize", ok: true, detail: "" });

    const call = async (framework, frameworkVersion) => {
      const res = await client.callTool({
        name: "check_framework_compatibility",
        arguments: { framework, frameworkVersion },
      });
      const text = res.content?.[0]?.text ?? "";
      return { isError: res.isError === true, text, body: text ? JSON.parse(text) : {} };
    };

    for (const consumer of CONSUMERS) {
      const r = await call(consumer.framework, consumer.mcpVersion);
      results.push({
        check: `mcp ${consumer.framework} ${consumer.mcpVersion} compatible`,
        ok: !r.isError && r.body.compatible === true,
        detail: r.text,
      });
    }
    const out = await call("react", "16.0.0");
    results.push({
      check: "mcp react 16.0.0 incompatible (manifest-derived reason)",
      ok:
        !out.isError &&
        out.body.compatible === false &&
        typeof out.body.reason === "string" &&
        !mentionsManifestFailure(out.text),
      detail: out.text,
    });
  } catch (error) {
    results.push({ check: "mcp session", ok: false, detail: String(error?.stack ?? error) });
  } finally {
    await client.close().catch(() => {});
  }
  return results;
}

export async function runSmoke() {
  const packDir = mkdtempSync(join(tmpdir(), "gap-131-pack-"));
  const workDir = mkdtempSync(join(tmpdir(), "gap-131-consumers-"));
  let passed = true;
  try {
    const tarballs = packSmokeMembers(packDir);
    for (const consumer of CONSUMERS) {
      const consumerDir = createConsumer(workDir, consumer, tarballs);
      if (consumer.framework === "react") probeOverride(consumerDir);
      const results = runCliChecks(consumerDir, consumer);
      if (consumer.framework === "react") results.push(...(await runMcpChecks(consumerDir)));
      for (const r of results) {
        console.log(
          `[installed-smoke] ${r.ok ? "PASS" : "FAIL"} ${consumer.framework} :: ${r.check}`
        );
        if (!r.ok && r.detail)
          console.log(
            r.detail
              .trim()
              .split("\n")
              .map((l) => `    ${l}`)
              .join("\n")
          );
        if (!r.ok) passed = false;
      }
    }
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  }
  return passed;
}
```

Replace the `--probe-only` block at the end of the file with:

```js
if (isMainModule()) {
  if (process.argv.includes("--probe-only")) {
    const packDir = mkdtempSync(join(tmpdir(), "gap-131-pack-"));
    const workDir = mkdtempSync(join(tmpdir(), "gap-131-consumers-"));
    try {
      const tarballs = packSmokeMembers(packDir);
      const consumerDir = createConsumer(workDir, CONSUMERS[1], tarballs);
      probeOverride(consumerDir);
      console.log("[installed-smoke] OQ-2 probe OK: bare pnpm add resolved through pnpm.overrides");
    } catch (error) {
      console.error(`[installed-smoke] ${error.message}`);
      process.exitCode = 1;
    } finally {
      rmSync(packDir, { recursive: true, force: true });
      rmSync(workDir, { recursive: true, force: true });
    }
  } else {
    runSmoke()
      .then((passed) => {
        console.log(`[installed-smoke] ${passed ? "OK" : "FAIL"}`);
        process.exitCode = passed ? 0 : 1;
      })
      .catch((error) => {
        console.error(`[installed-smoke] FAIL: ${error.stack ?? error}`);
        process.exitCode = 1;
      });
  }
}
```

- [ ] **Step 4: Run the unit tests**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Reproduce the defect on unmodified packages (Spec §6.1, AC-1)**

Run: `pnpm run build && node scripts/provenance/installed-cli-mcp-smoke.mjs`
Expected (defect reproduced): exit 1; for each consumer, `FAIL … :: init` with output containing `ENOENT` and `compatibility-manifest.json`; `FAIL … :: no manifest failure in CLI output`; and `FAIL react :: mcp … compatible` with `manifest_unreadable` in the detail. `generate Button` may pass (it does not read the manifest).

Record the full output in the ledger.

**If no manifest failure appears** (every CLI and MCP manifest-dependent check passes, or they fail for a different reason): **STOP.** Do not commit and do not start Task 4. Report the evidence to the user, as Spec §6.1 requires.

- [ ] **Step 6: Commit (only if reproduced)**

```bash
git add scripts/provenance/installed-cli-mcp-smoke.mjs scripts/provenance/installed-cli-mcp-smoke.test.mjs
git commit -m "test(provenance): add GAP-131 installed CLI/MCP smoke checks"
```

The commit body records: "Reproduced against unmodified packages: <one line per failing check>."

---

### Task 4: Shared copy script and the CLI fix

**Files:**

- Create: `scripts/copy-compatibility-manifest.mjs`
- Create: `packages/cli/src/manifest-path.ts`
- Create: `packages/cli/test/manifest-path.test.ts`
- Modify: `packages/cli/src/commands/add.ts:35-42`, `init.ts:42-58`, `theme.ts:28-35`, `doctor.ts:29-36` (the `MANIFEST_PATH` constants and init's comment above it), and each `readManifest()`
- Modify: `packages/cli/package.json` (`scripts.build`)

**Interfaces:**

- Produces: `scripts/copy-compatibility-manifest.mjs <package-dir>` (CLI); `export const CANONICAL_MANIFEST: string`; `export function copyCompatibilityManifest(packageDir: string): string` (returns the target path). `packages/cli/src/manifest-path.ts`: `export const COMPATIBILITY_MANIFEST_PATH: string`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/cli/test/manifest-path.test.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPATIBILITY_MANIFEST_PATH } from "../src/manifest-path.js";

const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CANONICAL = join(
  PACKAGE_ROOT,
  "..",
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

describe("COMPATIBILITY_MANIFEST_PATH (GAP-131)", () => {
  it("is the packaged copy under this package's own dist/, independent of the working directory", () => {
    expect(COMPATIBILITY_MANIFEST_PATH).toBe(
      join(PACKAGE_ROOT, "dist", "compatibility-manifest.json")
    );
  });

  it("is byte-identical to the canonical manifest (run `pnpm --filter @ultimate/cli build` if this fails)", () => {
    expect(readFileSync(COMPATIBILITY_MANIFEST_PATH)).toEqual(readFileSync(CANONICAL));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @ultimate/cli exec vitest run test/manifest-path.test.ts`
Expected: FAIL — cannot resolve `../src/manifest-path.js`.

- [ ] **Step 3: Create the copy script**

```js
#!/usr/bin/env node
// scripts/copy-compatibility-manifest.mjs
//
// GAP-131: copies the canonical docs/architecture/compatibility-manifest.json
// byte-for-byte into <package-dir>/dist/, so an installed @ultimate/cli or
// @ultimate/mcp reads it from its own distribution. Run after tsup (which
// cleans dist/). The canonical file is never modified.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const CANONICAL_MANIFEST = join(
  REPO_ROOT,
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

export function copyCompatibilityManifest(packageDir) {
  if (!existsSync(CANONICAL_MANIFEST)) {
    throw new Error(
      `copy-compatibility-manifest: canonical manifest not found at ${CANONICAL_MANIFEST}`
    );
  }
  const distDir = join(resolve(packageDir), "dist");
  mkdirSync(distDir, { recursive: true });
  const target = join(distDir, "compatibility-manifest.json");
  copyFileSync(CANONICAL_MANIFEST, target);
  return target;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const packageDir = process.argv[2];
  if (!packageDir) {
    console.error(
      "copy-compatibility-manifest: usage: node scripts/copy-compatibility-manifest.mjs <package-dir>"
    );
    process.exit(1);
  }
  try {
    console.log(`copy-compatibility-manifest: wrote ${copyCompatibilityManifest(packageDir)}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
```

- [ ] **Step 4: Create the CLI path module**

```ts
// packages/cli/src/manifest-path.ts
//
// GAP-131: the single location from which @ultimate/cli reads the
// compatibility manifest — the copy built into this package's own dist/
// (scripts/copy-compatibility-manifest.mjs). The package root is the nearest
// directory containing package.json, which is the same in source (src/), in
// the tsup bundle (dist/) and in an installed package. No fallback to the
// monorepo's docs/ directory (Spec §4).
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`manifest-path: could not locate "package.json" above ${startDir}`);
    }
    dir = parent;
  }
}

export const COMPATIBILITY_MANIFEST_PATH = join(
  findPackageRoot(dirname(fileURLToPath(import.meta.url))),
  "dist",
  "compatibility-manifest.json"
);
```

- [ ] **Step 5: Use it in the four commands**

In each of `packages/cli/src/commands/add.ts`, `init.ts`, `theme.ts` and `doctor.ts`:

1. Delete the whole `const MANIFEST_PATH = join(CLI_PACKAGE_ROOT, "..", "..", "docs", "architecture", "compatibility-manifest.json");` statement (in `init.ts`, also delete the `/** Repo-root-relative location of the compatibility manifest (spec §6.4). … */` comment directly above it).
2. Add this import after the existing `../compatibility.js` import:

```ts
import { COMPATIBILITY_MANIFEST_PATH } from "../manifest-path.js";
```

3. In `readManifest()`, replace `readFileSync(MANIFEST_PATH, "utf-8")` with:

```ts
readFileSync(COMPATIBILITY_MANIFEST_PATH, "utf-8");
```

`findUp`, `CLI_PACKAGE_ROOT`, `CLI_PACKAGE_JSON_PATH` and `readCliVersion` stay unchanged.

- [ ] **Step 6: Run the copy step in the CLI build**

In `packages/cli/package.json` set:

```json
"build": "tsup && node scripts/rename-dts.mjs && node ../../scripts/copy-compatibility-manifest.mjs ."
```

- [ ] **Step 7: Build, then run the CLI tests and typecheck**

Run: `pnpm --filter @ultimate/cli build && pnpm --filter @ultimate/cli test && pnpm --filter @ultimate/cli typecheck`
Expected: build prints `copy-compatibility-manifest: wrote …/packages/cli/dist/compatibility-manifest.json`; all CLI tests PASS (including the two new ones); typecheck clean.

- [ ] **Step 8: Check AC-5 for the CLI**

Run: `grep -rnE '"docs"|docs/architecture' packages/cli/src --include=*.ts | grep -vE '^\S+:\s*(//|\*|/\*)'`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add scripts/copy-compatibility-manifest.mjs packages/cli/src/manifest-path.ts packages/cli/test/manifest-path.test.ts packages/cli/src/commands/add.ts packages/cli/src/commands/init.ts packages/cli/src/commands/theme.ts packages/cli/src/commands/doctor.ts packages/cli/package.json
git commit -m "fix(cli): read the compatibility manifest from the package's own dist (GAP-131)"
```

---

### Task 5: MCP fix

**Files:**

- Modify: `packages/mcp/src/manifest-path.ts` (whole file)
- Create: `packages/mcp/test/manifest-path.test.ts`
- Modify: `packages/mcp/package.json` (`scripts.build`)

**Interfaces:**

- Consumes (Task 4): `scripts/copy-compatibility-manifest.mjs`.
- Produces: `COMPATIBILITY_MANIFEST_PATH` (same export name; new value).

- [ ] **Step 1: Write the failing test**

```ts
// packages/mcp/test/manifest-path.test.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMPATIBILITY_MANIFEST_PATH } from "../src/manifest-path";

const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CANONICAL = join(
  PACKAGE_ROOT,
  "..",
  "..",
  "docs",
  "architecture",
  "compatibility-manifest.json"
);

describe("COMPATIBILITY_MANIFEST_PATH (GAP-131)", () => {
  it("is the packaged copy under this package's own dist/, independent of the working directory", () => {
    expect(COMPATIBILITY_MANIFEST_PATH).toBe(
      join(PACKAGE_ROOT, "dist", "compatibility-manifest.json")
    );
  });

  it("is byte-identical to the canonical manifest (run `pnpm --filter @ultimate/mcp build` if this fails)", () => {
    expect(readFileSync(COMPATIBILITY_MANIFEST_PATH)).toEqual(readFileSync(CANONICAL));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/manifest-path.test.ts`
Expected: FAIL on the first test — received `…/docs/architecture/compatibility-manifest.json`.

- [ ] **Step 3: Replace `packages/mcp/src/manifest-path.ts`**

```ts
// packages/mcp/src/manifest-path.ts
//
// This file's ONLY job is to hold the manifest's resolved absolute path as
// a separately-importable constant, so test/manifest.test.ts can mock it in
// isolation (via vi.doMock) without needing to mock node:fs's readFileSync
// for the "malformed content" case (only the "file does not exist" case
// needs the fs-level mock).
//
// GAP-131: the path is the copy built into this package's own dist/
// (scripts/copy-compatibility-manifest.mjs). The package root is the nearest
// directory containing package.json — the same in source, in the tsup bundle
// and in an installed package. No fallback to the monorepo's docs/ directory.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`manifest-path: could not locate "package.json" above ${startDir}`);
    }
    dir = parent;
  }
}

export const COMPATIBILITY_MANIFEST_PATH = join(
  findPackageRoot(dirname(fileURLToPath(import.meta.url))),
  "dist",
  "compatibility-manifest.json"
);
```

- [ ] **Step 4: Run the copy step in the MCP build**

In `packages/mcp/package.json` set:

```json
"build": "tsup && node scripts/rename-dts.mjs && node ../../scripts/copy-compatibility-manifest.mjs ."
```

- [ ] **Step 5: Build, then run the MCP tests and typecheck**

Run: `pnpm --filter @ultimate/mcp build && pnpm --filter @ultimate/mcp test && pnpm --filter @ultimate/mcp typecheck`
Expected: all MCP tests PASS, including the unchanged `test/manifest.test.ts` (real-manifest read, missing-file and invalid-JSON `manifest_unreadable` cases) and the two new tests; typecheck clean.

- [ ] **Step 6: Check AC-5 for MCP**

Run: `grep -rnE '"docs"|docs/architecture' packages/mcp/src --include=*.ts | grep -vE '^\S+:\s*(//|\*|/\*)'`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add packages/mcp/src/manifest-path.ts packages/mcp/test/manifest-path.test.ts packages/mcp/package.json
git commit -m "fix(mcp): read the compatibility manifest from the package's own dist (GAP-131)"
```

---

### Task 6: Smoke green, root script and CI step

**Files:**

- Modify: `package.json` (`scripts`)
- Modify: `.github/workflows/ci.yml` (after the "Pack/install integrity (affected)" step)

**Interfaces:**

- Consumes (Tasks 3–5): `node scripts/provenance/installed-cli-mcp-smoke.mjs`.
- Produces: root script `smoke:installed`; CI step "Installed-package smoke (CLI/MCP)".

- [ ] **Step 1: Run the smoke harness on the fixed packages**

Run: `pnpm run build && node scripts/provenance/installed-cli-mcp-smoke.mjs`
Expected: every line `[installed-smoke] PASS …` for angular, react and vue (init, add, theme, doctor, generate, no manifest failure) plus the five MCP checks on react; final line `[installed-smoke] OK`; exit 0.

- [ ] **Step 2: Verify AC-2 against the packed tarballs**

Run:

```bash
mkdir -p /tmp/gap-131-ac2 && for p in cli mcp; do (cd packages/$p && pnpm pack --pack-destination /tmp/gap-131-ac2 >/dev/null); done
for t in /tmp/gap-131-ac2/*.tgz; do tar -xOzf "$t" package/dist/compatibility-manifest.json | cmp - docs/architecture/compatibility-manifest.json && echo "AC-2 OK $t"; done
rm -rf /tmp/gap-131-ac2
```

Expected: `AC-2 OK …ultimate-cli-0.1.0.tgz` and `AC-2 OK …ultimate-mcp-0.1.0.tgz`.

- [ ] **Step 3: Add the root script**

In root `package.json` `scripts`, directly after `"integrity:pack-install"`:

```json
"smoke:installed": "node scripts/provenance/installed-cli-mcp-smoke.mjs",
```

- [ ] **Step 4: Add the CI step**

In `.github/workflows/ci.yml`, insert directly after the "Pack/install integrity (affected)" step:

```yaml
- name: Installed-package smoke (CLI/MCP)
  if: ${{ !cancelled() }}
  run: pnpm run smoke:installed
```

No path filter, timeout or retry setting (Spec §6.4, OQ-3).

- [ ] **Step 5: Run the script tests and the pack/install check**

Run: `node --test scripts/provenance/installed-cli-mcp-smoke.test.mjs scripts/provenance/pack-install-integrity.test.mjs && pnpm run integrity:pack-install -- cli && pnpm run integrity:pack-install -- mcp && pnpm run compatibility-manifest:validate && pnpm run boundary:validate:cli && pnpm run boundary:validate:mcp`
Expected: all PASS / OK.

- [ ] **Step 6: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "ci: run the installed CLI/MCP smoke test on every push and PR (GAP-131)"
```

---

### Task 7: Final verification and records (no status change)

**Files:**

- Modify: `docs/superpowers/specs/2026-10-11-gap-131-installed-compatibility-manifest-design.md` (§6.2: fold Amendment A1)
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-131 entry: add a "Reproduced" and a "Fix" evidence line only)

- [ ] **Step 1: Fold Amendment A1 into the Spec**

In Spec §6.2's CLI assertion table, replace `` `ultimate generate button` `` with `` `ultimate generate Button` ``, and add under §11: `**Amendment A1 (approved at Plan Review):** \`generate\` uses the record name \`Button\` (case-sensitive match, \`generate.ts:93\`).`

- [ ] **Step 2: Record the GAP-131 evidence**

Append two lines to the GAP-131 entry, leaving its `Status` and `Blocking level` lines unchanged:

```markdown
- **Reproduced (YYYY-MM-DD, Task 3):** the installed-package smoke harness failed on unmodified packages: <one line per failing check from the ledger>.
- **Fix (pending closeout):** <commit hashes of Tasks 4–6>; installed-package smoke green locally. Status unchanged until closeout by user decision.
```

(Replace the angle-bracket text with the recorded values from the ledger; no other placeholder remains.)

- [ ] **Step 3: Full verification**

Run: `pnpm run build && pnpm run typecheck && pnpm --filter @ultimate/cli test && pnpm --filter @ultimate/mcp test && pnpm run smoke:installed && pnpm run compatibility-manifest:validate && node scripts/provenance/validate-dependency-ceiling.mjs && node scripts/provenance/validate-agents-md-pointers.mjs`
Expected: all green.

Then check AC-7 and Spec §8's MIGRATION note:

Run: `git diff main -- packages/cli/package.json packages/mcp/package.json`
Expected: only the two `"build"` lines changed; `files`, `dependencies` and `peerDependencies` untouched. Because the installed layout gains only `dist/compatibility-manifest.json` and no consumer-facing API changes, no `MIGRATION.md` entry is written (Spec §8); state this in the ledger.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-11-gap-131-installed-compatibility-manifest-design.md docs/architecture/BLUEPRINT_GAPS.md
git commit -m "docs(gap-131): record the reproduction and fix evidence"
```

- [ ] **Step 5: HARD USER STOP**

Report the branch, commits, ledger evidence and verification output. Pushing, opening a PR, CI evidence, closeout (GAP-131 status, ROADMAP footnote 3) and merge each need separate user authorization.
