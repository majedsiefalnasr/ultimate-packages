# Phase 8 — MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Complete — implemented and merged; Phase 8 marked Complete in `docs/architecture/ROADMAP.md` and GAP-029 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`.
**Approved spec:** `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` (Approved — formal Spec Review passed, §13)
**Research:** `docs/architecture/research/2026-09-07-phase-8-mcp-architecture.md`
**References:** `docs/architecture/BLUEPRINT.md` §5/§6/§18/§22/§23/§34/§35/§40, `docs/architecture/DECISIONS.md` ADR-010, `docs/architecture/BLUEPRINT_GAPS.md` GAP-029, `packages/component-schema`, `packages/component-metadata`, `packages/cli`, `.github/workflows/ci.yml`, `scripts/provenance/validate-cli-boundary.mjs`

**Goal:** Build `@ultimate/mcp` — a stdio-transport MCP server exposing five tools (`search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility`) that read `@ultimate/component-metadata`'s real 8-record `ALL_COMPONENTS` set and `docs/architecture/compatibility-manifest.json` directly, per the approved Phase 8 spec.

**Architecture:** A single new package (`packages/mcp`), following the exact `type: module` / `tsup` dual-entry (`index` + `bin`) / `vitest --typecheck` shape already established by `@ultimate/cli`. Tool handlers are plain, pure, directly-testable functions (no MCP-SDK coupling in their own logic); a thin `server.ts` registers them with `@modelcontextprotocol/sdk`'s `McpServer` and wires the stdio transport. `bin.ts` is the only file that starts the transport/writes to real stdio.

**Tech Stack:** TypeScript (ESM), `@modelcontextprotocol/sdk` (new dependency, not currently in the repo — verified absent from `pnpm-lock.yaml`/any `package.json`), `tsup`, `vitest`, Node's built-in `node:test` (for the new provenance/boundary script's sibling test, matching `validate-cli-boundary.test.mjs`'s own convention), `pnpm` workspaces.

## Global Constraints

These apply to every task below; a task does not restate them, it inherits them.

- **No dependency on `@ultimate/cli`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`** — in either direction. Spec §5.1/§5.2, enforced by Task 10's new CI gate.
- **Only direct Ultimate-owned dependencies are `@ultimate/component-metadata` and `@ultimate/component-schema`** (both `workspace:*` — the latter is required because tool code imports its types directly, e.g. `PropFact`/`EventFact`/`ComponentMetadata`/`AccessibilityFacts`, exactly the same way `@ultimate/cli`'s own `package.json` declares it), plus the new `@modelcontextprotocol/sdk` and `zod` runtime dependencies. Spec §5.1/§8.
- **stdio-only transport, tools-only MCP primitive** — no HTTP transport, no MCP resources, no MCP prompts. Spec §5.1.
- **stdout carries MCP protocol messages only.** All logs/diagnostics/warnings/debug/operational output go to stderr. No tool handler or server-lifecycle code ever writes to stdout outside the MCP SDK's own response-serialization path. Spec §5.1.1.
- **No filesystem project auto-detection.** `check_framework_compatibility` takes caller-supplied `framework`/`frameworkVersion` only — never calls `detectFramework()`-style logic itself. Spec §5.2/§7.4.
- **No runtime source parsing.** Every tool reads only `ALL_COMPONENTS` (from `@ultimate/component-metadata`) or `docs/architecture/compatibility-manifest.json` — never `.ts`/`.tsx`/`.vue` files under `packages/{ng,react,vue}`. Spec §4.
- **No expansion of `@ultimate/component-metadata`'s 8-component proof set or `@ultimate/component-schema`'s schema shape.** Every tool's output is exactly what the real, already-built records contain — nothing fabricated for `examples`, theme/token values, or CLI/tooling discovery. Spec §7.3.
- **Shared five-case error taxonomy (spec §4.1)** governs every tool: (1) invalid input → structured tool error naming the failing field; (2) unknown component → structured not-found result naming the real 8-component list; (3) malformed/unreadable compatibility manifest → structured server/tool error, **never** a fabricated/empty/successful result; (4) missing optional metadata facet → explicit "not recorded" result, never fabricated/default data; (5) unexpected internal error → generic structured error, **never** leaking a stack trace, filesystem path, or internal module name (send that detail to stderr instead, never into the tool-error payload).
- **Package name:** `@ultimate/mcp`, at `packages/mcp` (currently `.gitkeep` only — confirmed by direct listing before this plan was written).
- **No Phase 9 (Skills/LLM-context) functionality of any kind.** Spec §9.

---

## 0. Pre-flight findings (repository evidence gathered before authoring this plan)

These facts were confirmed by direct inspection immediately before writing this plan — stated up front so no task silently assumes something not actually true of the repository. Every fact below was re-verified in this session, not carried over from the spec without checking.

1. **`packages/mcp` contains only `.gitkeep`.** No `package.json`, no `src/`, nothing. Task 1 creates the package from scratch.
2. **`@modelcontextprotocol/sdk` is not declared as a direct dependency by any `package.json` in this repository today** — confirmed by grepping every `package.json`. It IS, however, already **resolved and materialized** in `pnpm-lock.yaml`/`node_modules` — as a transitive dependency of `@angular/cli`, currently at `@modelcontextprotocol/sdk@1.30.0` (paired with `zod@4.3.6`), confirmed by direct read of the lockfile and the installed package's own `package.json`. This is a genuinely new **direct** runtime dependency this plan introduces for `@ultimate/mcp` specifically (exactly as spec §8 anticipated), but it is not a package absent from the repository's dependency graph altogether — it is real, already-resolved evidence this plan uses to ground its version pins (Task 1, Task 7 Step 4), rather than a guess made in a vacuum.
3. **Real `@ultimate/component-metadata` exports exactly `ALL_COMPONENTS: ComponentMetadata[]`** (`packages/component-metadata/src/index.ts`), a flat array of 8 records built from `src/records/{button,checkbox,dialog,menu,paginator,scroller,table,tooltip}.ts`. Package ships `type: "module"`, single `tsup` ESM build, `workspace:*` dependency on `@ultimate/component-schema`, scripts `build`/`test`/`typecheck`/`validate` — confirmed by direct read of `package.json`.
4. **Real per-record facet population, verified field-by-field against every one of the 8 record files** (not assumed from the spec or research doc):
   - `events[]` — **populated, non-empty, with real `EventFact` entries** in Checkbox, Dialog, Menu, Paginator, Scroller, Table (6 of 8). **Empty (`events: []`) on every framework facet** only in Button and Tooltip (2 of 8). This directly informs Task 5/9's test fixtures — a `get_component_api` test suite must exercise both a populated-events component (e.g., Table) and an empty-events component (e.g., Button), not assume uniform emptiness.
   - `accessibility` — populated **only on Table** (1 of 8 records has this facet at all; `accessibility: { verifiedRoles, verifiedAriaAttributes, guidance }`). All other 7 records have no `accessibility` facet. This directly informs Task 5/6's test fixtures — `get_component_accessibility`'s "honest absence" path must be tested against any of the 7 components without the facet (e.g., Button), and its populated path against Table specifically, since Table is the only real record that can exercise it.
   - **`ComponentMetadata.guidance` (the separate, top-level `Guidance` facet — `usageNotes`/`antiPatterns`/`migrationNotes`) is populated on zero of the 8 real records** — re-verified by direct grep for a top-level `guidance:` key across every record file. Table's `accessibility.guidance` (a string nested inside `AccessibilityFacts`) is a same-named but structurally distinct field and must not be confused with this one. `get_component`'s framework-neutral-facet test in Task 5 (which asserts `result.guidance` equals the real record's `guidance`) therefore currently only exercises the `undefined === undefined` case for every one of the 8 real records — it does not verify the narrowing code's handling of a populated `guidance` value with real data, since no real record has one. The `get_component` code itself (a plain conditional spread) is correct regardless; this note exists so Task 5's completion criteria do not overclaim "verified against a real record with populated... guidance" when no such record exists.
   - `relationships` — populated only on Table (`dependsOn`). `style` and `provenanceRef` — populated on all 8.
   - `api.{ng,react,vue}` — populated on all 8 for all 3 frameworks (every record's `packages` object has `ng`/`react`/`vue` entries with corresponding `api` entries — confirmed by direct read).
5. **`@ultimate/cli`'s real `compatibility.ts`** exports `matchCompatibility(input, manifest)`, `CompatibilityEntry` (keyed `framework: "angular" | "react" | "vue"`, with `frameworkVersionRange`, `ultimateFrameworkPackage.versionRange`, `uixVersionRange`, `themeVersionRange`, `metadataSchemaVersion` (exact-match only), `cliVersionRange`, plus reserved-optional `mcpVersionRange`/`aiSkillsVersionRange` never read by `matchCompatibility()`), and hand-rolled caret-range parsing (`parseVersion`/`satisfiesCaretRange`/`satisfiesRange` — no `semver` npm dependency). `doctor.ts` locates the manifest via `findUp(__dirname, "package.json")` then `join(CLI_PACKAGE_ROOT, "..", "..", "docs", "architecture", "compatibility-manifest.json")` — a repo-relative path walk from the CLI package's own root. **This exact resolution mechanism is CLI-internal and is not imported by this plan** (spec §5.2 forbids depending on `@ultimate/cli`'s code) — Task 4 implements an independent, minimal manifest reader for `@ultimate/mcp`'s own package root.
6. **The real `docs/architecture/compatibility-manifest.json`** is a 3-entry JSON array (angular/react/vue), each with exactly the 6 required `CompatibilityEntry` keys and no `mcpVersionRange`/`aiSkillsVersionRange` populated on any entry — confirmed by direct read. `check_framework_compatibility` (Task 7) reads `frameworkVersionRange` from this file only, per spec §7.4's single-axis scope.
7. **The real `validate-cli-boundary.mjs`** (`scripts/provenance/validate-cli-boundary.mjs`) does 4 checks: (1) reverse-direction source-import scan of `packages/{ng,react,vue}*/src/**/*` for `@ultimate/cli` imports (via `require`/`import`/dynamic-`import`/`from`-clause regexes, with a line-start anchor on the `import`/`from` forms specifically to avoid a real false positive found during Phase 7 review — an in-string literal in `theme.ts`); (2) reverse-direction `package.json` `dependencies` scan of the same directories; (3) forward-direction `package.json` `dependencies`+`devDependencies` scan of `packages/cli/package.json` for `@ultimate/{ng,react,vue,themes}`; (4) forward-direction source-import scan of `packages/cli/src/**/*` for the same 4 packages. It has a sibling `node:test`-based test file (`validate-cli-boundary.test.mjs`) using `mkdtempSync`-based fixture directories and `spawnSync` to invoke the real script against synthetic fixtures. Task 10 creates a direct structural sibling (`validate-mcp-boundary.mjs` + `.test.mjs`), extended per the approved spec (§8.1) to also forbid the `@ultimate/mcp → @ultimate/cli` edge specifically (the original script has no notion of MCP at all).
8. **Real package shape convention** (`packages/component-metadata`, `packages/cli`): `type: "module"`, `sideEffects: false`, `main`/`module`/`types` pointing at `./dist/index.mjs`/`./dist/index.d.mts`, `exports` map with `types`/`import`/`default`, `files: ["dist", "README.md"]`, `scripts.build = "tsup && node scripts/rename-dts.mjs"`, `scripts.test = "vitest run --typecheck"`, `scripts.typecheck = "tsc --noEmit"`. `packages/cli` additionally has `bin: { ultimate: "./dist/bin.mjs" }` and a two-entry `tsup.config.ts` (`index` with `dts: true`, `bin` with `dts: false` and a `banner: { js: "#!/usr/bin/env node" }`). `packages/cli/scripts/rename-dts.mjs` is copied verbatim from `component-schema`'s (identical `tsup`-`dts`-under-`type:module` workaround). `tsconfig.json` extends `../../tsconfig.base.json` with `outDir: "dist"`/`rootDir: "src"`/`include: ["src"]`. `vitest.config.ts` sets `test.environment: "node"`, `test.include: ["test/**/*.test.ts"]`, `test.typecheck.include: ["test/**/*.test-d.ts"]`. Root `pnpm-workspace.yaml` covers `packages/*` — no separate registration needed.
9. **Root CI (`.github/workflows/ci.yml`)** runs, in order: checkout → fetch base ref → pnpm setup → node setup → install → lint → format:check → typecheck → build → test → test:scripts → provenance:validate → boundary:validate → ceiling:validate → compatibility-manifest:validate → **boundary:validate:cli**. All but the last 6 are root `pnpm run <script>` aggregations (`pnpm -r --if-present run <script>` under the hood for typecheck/build/test); the last 6 are direct `node scripts/...`/`node docs/...` invocations wired as individual root `package.json` scripts. `@ultimate/mcp` needs no new top-level CI *step* beyond one new line (`boundary:validate:mcp`, Task 11) — the existing `typecheck`/`build`/`test` steps already cover any new workspace package automatically via `-r --if-present`.
10. **`scripts/provenance/validate-boundaries.mjs`** (the original, `uix*`-scoped boundary script) and **`scripts/provenance/validate-dependency-ceiling.mjs`** (scoped to `packages/{uix,ng,react,vue,themes}*`) both confirmed, by reading their own scope constants, to **not** inspect `packages/cli` or `packages/mcp` at all — `packages/mcp` automatically passes both existing gates with zero change to either script, exactly as was true for `packages/cli` in Phase 7. The dependency-direction guarantee for MCP specifically is enforced only by the new Task 10 gate, not by these two pre-existing ones.
11. **No `docs/architecture/compatibility-manifest.json` reader anywhere in the repo throws on a missing/malformed file today** — `doctor.ts`'s `readManifest()` does a bare `readFileSync`/`JSON.parse` with no try/catch, meaning a malformed manifest would currently crash the CLI's `doctor` command with an unstructured Node exception. This is a real, pre-existing gap in `@ultimate/cli`'s own code (not something this plan touches or fixes — out of scope, `packages/cli` source is not modified by this plan) but is directly relevant evidence for Task 4/7: `@ultimate/mcp`'s own manifest reader must **not** copy this behavior — the approved spec's error taxonomy (§4.1 case 3) explicitly requires a structured error, never an unstructured crash, so Task 4 wraps its read in an explicit try/catch from the start.

---

## 1. Scope Restatement (from approved spec, unchanged)

**In v1 (implemented by this plan):**
- `@ultimate/mcp` package, stdio-transport MCP server, `bin`-invoked.
- Five tools: `search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility` (spec §7).
- Shared five-case error taxonomy (spec §4.1) applied uniformly.
- stdout/stderr channel discipline (spec §5.1.1).
- Direct, independent reads of `@ultimate/component-metadata`'s `ALL_COMPONENTS` and `docs/architecture/compatibility-manifest.json` — no dependency on `@ultimate/cli`.
- New `boundary:validate:mcp` CI gate (spec §8.1).

**Deferred, not implemented by this plan (unchanged from spec §10):**
- HTTP transport, MCP resources, MCP prompts.
- Usage-examples lookup, theme/token lookup, CLI/tooling-discovery tools, a dedicated migration-assistance tool.
- Populating `mcpVersionRange`/`aiSkillsVersionRange` on the compatibility manifest, or extending `@ultimate/cli`'s `matchCompatibility()`.
- Any Skills/LLM-context/agent-instruction-convention responsibility (Phase 9).
- Filesystem-based project/framework auto-detection performed by MCP itself.
- Any change to `packages/{ng,react,vue,uix-*,themes,component-schema,component-metadata,cli}` source.
- ROADMAP.md/BLUEPRINT_GAPS.md updates — deferred to the final closeout task (Task 12), gated behind everything else, per the convention used at GAP-027/GAP-028's closure.

---

## 2. File Structure

```
packages/mcp/
├── package.json                    # Task 1
├── tsconfig.json                   # Task 1
├── tsup.config.ts                  # Task 1
├── vitest.config.ts                # Task 1
├── scripts/
│   └── rename-dts.mjs              # Task 1 (verbatim copy of the established pattern)
├── src/
│   ├── index.ts                    # Task 1 — library surface re-exports (for tests/typecheck)
│   ├── bin.ts                      # Task 8 — the only file that starts the real stdio transport
│   ├── server.ts                   # Task 8 — McpServer construction + tool registration
│   ├── errors.ts                   # Task 2 — shared five-case error taxonomy (spec §4.1)
│   ├── manifest.ts                 # Task 4 — independent compatibility-manifest reader
│   └── tools/
│       ├── search-components.ts    # Task 5
│       ├── get-component.ts        # Task 6
│       ├── get-component-api.ts    # Task 5 (co-located with search; see Task 5 scope note)
│       ├── get-component-accessibility.ts  # Task 6 (co-located with get-component)
│       └── check-framework-compatibility.ts # Task 7
└── test/
    ├── errors.test.ts               # Task 2
    ├── manifest.test.ts             # Task 4
    ├── tools/
    │   ├── search-components.test.ts        # Task 5
    │   ├── get-component-api.test.ts         # Task 5
    │   ├── get-component.test.ts             # Task 6
    │   ├── get-component-accessibility.test.ts # Task 6
    │   └── check-framework-compatibility.test.ts # Task 7
    └── server.test.ts               # Task 9 — stdout/stderr discipline + end-to-end tool registration

scripts/provenance/
├── validate-mcp-boundary.mjs        # Task 10
└── validate-mcp-boundary.test.mjs   # Task 10

.github/workflows/ci.yml             # Task 11 — one new step
package.json (root)                  # Task 11 — one new script

docs/architecture/ROADMAP.md         # Task 12
docs/architecture/BLUEPRINT_GAPS.md  # Task 12
```

**Rationale for the two-tools-per-file grouping** (`search-components.ts` + `get-component-api.ts`; `get-component.ts` + `get-component-accessibility.ts`): each pair shares its exact-name-lookup helper against `ALL_COMPONENTS` (find-by-name vs. filter-by-substring are the only two lookup shapes needed across all 5 tools). Splitting into 5 separate files would duplicate that helper 3 times; one file per tool would separate genuinely-coupled logic. `check_framework_compatibility` gets its own file since it reads a different data source (`manifest.ts`, not `ALL_COMPONENTS`) and shares nothing with the other four.

---

## 3. Task List

### Task 1 — Scaffold `packages/mcp` package shape

**Objective:** Create `packages/mcp`'s `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, and a placeholder `src/index.ts`, following the confirmed repository convention (Pre-flight #8) with the two confirmed-necessary additions (`bin` field, `@modelcontextprotocol/sdk` dependency).

**Files:**
- Create: `packages/mcp/package.json`
- Create: `packages/mcp/tsconfig.json`
- Create: `packages/mcp/tsup.config.ts`
- Create: `packages/mcp/vitest.config.ts`
- Create: `packages/mcp/scripts/rename-dts.mjs`
- Create: `packages/mcp/src/index.ts` (placeholder: `export {};`)
- Create: `packages/mcp/src/bin.ts` (placeholder: `console.error("@ultimate/mcp placeholder");`)

**Interfaces:**
- Consumes: nothing (first task, no prior task dependency).
- Produces: the package's own build/test/typecheck scripts (`pnpm --filter @ultimate/mcp run {build,test,typecheck}`), consumed by every later task's own test-run step and by Task 11's CI wiring.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "@ultimate/mcp",
  "version": "0.1.0",
  "description": "MCP server exposing Ultimate component metadata and compatibility queries (Phase 8).",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "bin": {
    "ultimate-mcp": "./dist/bin.mjs"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "dependencies": {
    "@ultimate/component-metadata": "workspace:*",
    "@ultimate/component-schema": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.30.0"
  },
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs",
    "test": "vitest run --typecheck",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

`@ultimate/component-schema` is declared as a **direct** dependency, not merely accessed transitively through `@ultimate/component-metadata`'s re-exports — verified against real source: `packages/component-metadata/src/index.ts` exports only `ALL_COMPONENTS`, re-exporting nothing from `@ultimate/component-schema`. Tasks 3/5 import types (`EventFact`, `PropFact`, `ComponentMetadata`, `AccessibilityFacts`) directly from `@ultimate/component-schema`, exactly the same way `@ultimate/cli`'s own `commands/generate.ts` does — and `@ultimate/cli`'s real `package.json` (confirmed by direct read) declares `@ultimate/component-schema: workspace:*` as a direct dependency for exactly this reason. This corrects the approved spec §8's own imprecise "accessed transitively" framing — not an architectural change (both packages are still permitted, non-forbidden dependencies under spec §5.1/§5.2), just a factual correction to how the dependency is declared, caught during formal Plan Review.

`@modelcontextprotocol/sdk` is pinned at `^1.30.0` — the version already resolved in this repository's own `pnpm-lock.yaml` (as a transitive dependency of `@angular/cli`), confirmed materialized in `node_modules` at implementation-plan-writing time. Its real `package.json` declares `"zod": "^3.25 || ^4.0"` as a required peer dependency (confirmed by direct read of the installed package's `peerDependencies`). Even so, **do not skip verifying both version numbers against the latest published npm versions at actual implementation time** (`npm view @modelcontextprotocol/sdk version` and `npm view @modelcontextprotocol/sdk peerDependencies`) — the numbers above are grounded in real, currently-resolved repo evidence rather than a guess, but npm may have published newer versions between plan-writing and implementation.

The `bin` name is `ultimate-mcp`, not `ultimate` (which `@ultimate/cli` already owns) — two different packages installing a `bin` named `ultimate` would collide in a consumer's `node_modules/.bin`.

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write `tsup.config.ts`**

```typescript
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outDir: "dist",
  },
  {
    entry: { bin: "src/bin.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    splitting: false,
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
```

(Identical structure to `packages/cli/tsup.config.ts` — confirmed by direct read in Pre-flight #8; no deviation.)

- [ ] **Step 4: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: {
      include: ["test/**/*.test-d.ts"],
    },
  },
});
```

- [ ] **Step 5: Copy `scripts/rename-dts.mjs` verbatim**

```javascript
#!/usr/bin/env node
// tsup's non-experimental `dts: true` generator does not honor a custom
// `outExtension().dts` when the package is already `"type": "module"`
// (it falls back to `.d.ts`, since `.ts` is unambiguous ESM in that case).
// Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
// after the build so they match this package's `.mjs` exports map.
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

function renameDtsToMts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameDtsToMts(fullPath);
    } else if (entry.name.endsWith(".d.ts.map")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts\.map$/, ".d.mts.map"));
    } else if (entry.name.endsWith(".d.ts")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts$/, ".d.mts"));
    }
  }
}

renameDtsToMts("dist");
```

- [ ] **Step 6: Write placeholder `src/index.ts` and `src/bin.ts`**

`src/index.ts`:
```typescript
export {};
```

`src/bin.ts`:
```typescript
console.error("@ultimate/mcp placeholder");
```

(Placeholder `bin.ts` deliberately writes to `console.error`, not `console.log` — establishes the stdout/stderr discipline from the very first line of code that exists in this package, per the Global Constraints stdio rule, rather than introducing a stdout write now that Task 8 would have to later remember to remove.)

- [ ] **Step 7: Install and verify the build pipeline**

Run: `pnpm install`
Expected: resolves `packages/mcp` as a workspace member, no errors. `@modelcontextprotocol/sdk` appears in `pnpm-lock.yaml`.

Run: `pnpm --filter @ultimate/mcp run build`
Expected: succeeds, produces `packages/mcp/dist/index.mjs`, `dist/index.d.mts`, `dist/bin.mjs` (with the `#!/usr/bin/env node` shebang banner).

Run: `pnpm --filter @ultimate/mcp run typecheck`
Expected: succeeds (trivially, against the placeholder).

Run: `pnpm --filter @ultimate/mcp run test`
Expected: succeeds — no test files exist yet, vitest reports 0 tests, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add packages/mcp/package.json packages/mcp/tsconfig.json packages/mcp/tsup.config.ts packages/mcp/vitest.config.ts packages/mcp/scripts/rename-dts.mjs packages/mcp/src/index.ts packages/mcp/src/bin.ts pnpm-lock.yaml
git commit -m "feat(mcp): scaffold @ultimate/mcp package shape"
```

**Completion criteria:** `pnpm --filter @ultimate/mcp run {build,test,typecheck}` all succeed; `packages/mcp/package.json` declares exactly `@ultimate/component-metadata`, `@ultimate/component-schema`, `@modelcontextprotocol/sdk`, and `zod` as runtime dependencies and nothing else Ultimate-owned beyond those two workspace packages; no `@ultimate/cli`/`ng`/`react`/`vue`/`themes` dependency anywhere in the file.

---

### Task 2 — Shared five-case error taxonomy (`errors.ts`)

**Objective:** Implement the one shared error-shaping module every tool handler uses, per spec §4.1's five cases, so no tool invents its own ad hoc error shape.

**Files:**
- Create: `packages/mcp/src/errors.ts`
- Test: `packages/mcp/test/errors.test.ts`

**Interfaces:**
- Consumes: nothing (pure, standalone module).
- Produces: `McpToolError` (a discriminated type), and five constructor functions — `invalidInputError(field, reason)`, `notFoundError(name, knownNames)`, `manifestUnreadableError(detail)`, `absentFacetError(facetName)`, `internalError()` — consumed by every tool in Tasks 5, 6, 7, and by `server.ts` in Task 8 for its own top-level catch-all.

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/mcp/test/errors.test.ts
import { describe, it, expect } from "vitest";
import {
  invalidInputError,
  notFoundError,
  manifestUnreadableError,
  absentFacetError,
  internalError,
} from "../src/errors";

describe("invalidInputError", () => {
  it("names the failing field and reason, case 1 of spec §4.1", () => {
    const err = invalidInputError("framework", 'must be one of "ng", "react", "vue"');
    expect(err.code).toBe("invalid_input");
    expect(err.message).toContain("framework");
    expect(err.message).toContain('must be one of "ng", "react", "vue"');
  });
});

describe("notFoundError", () => {
  it("names the unknown value and lists every known name, case 2 of spec §4.1", () => {
    const err = notFoundError("NotAComponent", ["Button", "Checkbox", "Dialog"]);
    expect(err.code).toBe("not_found");
    expect(err.message).toContain("NotAComponent");
    expect(err.message).toContain("Button");
    expect(err.message).toContain("Checkbox");
    expect(err.message).toContain("Dialog");
  });
});

describe("manifestUnreadableError", () => {
  it("is a distinct structured error, never implying a successful result, case 3 of spec §4.1", () => {
    const err = manifestUnreadableError("ENOENT: no such file");
    expect(err.code).toBe("manifest_unreadable");
    expect(err.message).toContain("compatibility manifest");
  });

  it("does not leak the raw underlying error detail into the message (that goes to stderr, not the tool-error payload — case 5's no-leak rule applies to case 3's detail too)", () => {
    const err = manifestUnreadableError("ENOENT: /Users/someone/secret-path/compatibility-manifest.json");
    expect(err.message).not.toContain("/Users/someone/secret-path");
  });
});

describe("absentFacetError", () => {
  it("states honest absence, not a fabricated empty-but-implying-verified result, case 4 of spec §4.1", () => {
    const err = absentFacetError("accessibility");
    expect(err.code).toBe("facet_not_recorded");
    expect(err.message).toContain("accessibility");
    expect(err.message).toContain("not recorded");
  });
});

describe("internalError", () => {
  it("never includes a stack trace, filesystem path, or module name, case 5 of spec §4.1", () => {
    const err = internalError();
    expect(err.code).toBe("internal_error");
    expect(err.message).not.toMatch(/\.ts:\d+/); // no stack-trace-shaped content
    expect(err.message).not.toMatch(/\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+/); // no path-shaped content
  });

  it("takes no arguments — callers cannot accidentally pass leakable detail into it", () => {
    // internalError() is declared with an empty parameter list (Step 3
    // below) — TypeScript itself rejects any call site that passes an
    // argument, so this is enforced at compile time by the function's own
    // signature every time this file (or any caller) is typechecked via
    // `vitest run --typecheck`. No separate .test-d.ts file is needed for
    // this specific guarantee; this runtime assertion just confirms the
    // zero-arg call still returns the expected shape.
    expect(internalError().code).toBe("internal_error");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/errors.test.ts`
Expected: FAIL — `src/errors.ts` does not exist yet (`Cannot find module '../src/errors'`).

- [ ] **Step 3: Write `src/errors.ts`**

```typescript
// packages/mcp/src/errors.ts
//
// The one shared error contract every @ultimate/mcp tool handler uses, per
// the approved Phase 8 spec §4.1's five-case taxonomy. No tool invents its
// own ad hoc error shape — every tool handler in src/tools/* returns
// McpToolError values constructed only by the five functions below.

export interface McpToolError {
  readonly code: "invalid_input" | "not_found" | "manifest_unreadable" | "facet_not_recorded" | "internal_error";
  readonly message: string;
}

/** Case 1: input fails the tool's declared JSON-schema contract. */
export function invalidInputError(field: string, reason: string): McpToolError {
  return {
    code: "invalid_input",
    message: `Invalid input for field "${field}": ${reason}`,
  };
}

/** Case 2: a supplied component name does not match any real record. */
export function notFoundError(name: string, knownNames: readonly string[]): McpToolError {
  return {
    code: "not_found",
    message: `Component "${name}" is not in the known component set. Known components: ${knownNames.join(", ")}.`,
  };
}

/**
 * Case 3: the compatibility manifest could not be read or parsed. Never
 * embeds the raw underlying error's detail (which may contain a filesystem
 * path) — that belongs on stderr (case 5's no-leak rule), not in the
 * tool-error payload a calling host/agent sees.
 */
export function manifestUnreadableError(_detail: string): McpToolError {
  return {
    code: "manifest_unreadable",
    message: "The compatibility manifest could not be read or parsed. No compatibility result can be returned.",
  };
}

/** Case 4: an optional metadata facet is absent on an otherwise-valid, found record. */
export function absentFacetError(facetName: string): McpToolError {
  return {
    code: "facet_not_recorded",
    message: `No "${facetName}" facts are recorded for this component.`,
  };
}

/**
 * Case 5: an unexpected internal error. Deliberately takes no arguments —
 * there is nothing for a caller to pass that could leak a stack trace,
 * filesystem path, or internal module name into the response. Any detail
 * useful for local debugging goes to stderr (spec §5.1.1) at the call
 * site, separately from this function's return value.
 */
export function internalError(): McpToolError {
  return {
    code: "internal_error",
    message: "An unexpected internal error occurred.",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/errors.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/mcp/src/errors.ts packages/mcp/test/errors.test.ts
git commit -m "feat(mcp): shared five-case tool error taxonomy (spec §4.1)"
```

**Dependencies:** Task 1 (package must exist to add files to).

**Completion criteria:** `pnpm --filter @ultimate/mcp run test` passes including `errors.test.ts`; `McpToolError` and all five constructors are exported from `src/errors.ts`; `internalError()` is verified to take zero parameters.

---

### Task 3 — `search_components` and `get_component_api` tool logic (TDD)

**Objective:** Implement the two tools that operate on a single component-name (or query) lookup with per-framework API detail, per spec §7.1's `search_components` row and §7.2's `get_component_api` row.

**Files:**
- Create: `packages/mcp/src/tools/search-components.ts`
- Create: `packages/mcp/src/tools/get-component-api.ts`
- Test: `packages/mcp/test/tools/search-components.test.ts`
- Test: `packages/mcp/test/tools/get-component-api.test.ts`

**Interfaces:**
- Consumes: `ALL_COMPONENTS` from `@ultimate/component-metadata` (real import); `McpToolError`/`notFoundError`/`invalidInputError` from `../errors` (Task 2).
- Produces: `searchComponents(input: SearchComponentsInput): SearchComponentsResult | McpToolError` and `getComponentApi(input: GetComponentApiInput): GetComponentApiResult | McpToolError`, consumed by `server.ts` (Task 8) for tool registration and by Task 9's server-level tests.

- [ ] **Step 1: Write the failing tests for `search_components`**

```typescript
// packages/mcp/test/tools/search-components.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { searchComponents } from "../../src/tools/search-components";

describe("searchComponents", () => {
  it("matches case-insensitively against name (spec §7.1: exact v1 rule)", () => {
    const result = searchComponents({ query: "button" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("matches case-insensitively against category", () => {
    const result = searchComponents({ query: "primitive" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // Button's category is "Primitive" per the real record.
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("matches case-insensitively against description", () => {
    const buttonRecord = ALL_COMPONENTS.find((c) => c.name === "Button")!;
    const distinctiveWord = buttonRecord.description.split(" ").find((w) => w.length > 6)!;
    const result = searchComponents({ query: distinctiveWord.toUpperCase() });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.some((m) => m.name === "Button")).toBe(true);
  });

  it("returns an empty array, never an error, when nothing matches", () => {
    const result = searchComponents({ query: "zzz-no-such-component-zzz" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches).toEqual([]);
  });

  it("restricts to components with a packages.{framework} entry when framework is supplied", () => {
    const result = searchComponents({ query: "", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // All 8 real records have an ng entry (Pre-flight #4) — every match returned.
    expect(result.matches.length).toBe(ALL_COMPONENTS.length);
  });

  it("returns matches in ALL_COMPONENTS's own array order — unranked, no fuzzy scoring (spec §7.1/§10)", () => {
    const result = searchComponents({ query: "" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.matches.map((m) => m.name)).toEqual(ALL_COMPONENTS.map((c) => c.name));
  });

  it("each match includes exactly {name, category, description}", () => {
    const result = searchComponents({ query: "Button" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    const match = result.matches.find((m) => m.name === "Button")!;
    expect(Object.keys(match).sort()).toEqual(["category", "description", "name"]);
  });

  it("rejects a non-string query with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = searchComponents({ query: 42 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/search-components.test.ts`
Expected: FAIL — `src/tools/search-components.ts` does not exist yet.

- [ ] **Step 3: Write `src/tools/search-components.ts`**

```typescript
// packages/mcp/src/tools/search-components.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { invalidInputError, type McpToolError } from "../errors";

export interface SearchComponentsInput {
  query: string;
  framework?: "ng" | "react" | "vue";
}

export interface SearchComponentMatch {
  name: string;
  category: string;
  description: string;
}

export interface SearchComponentsResult {
  matches: SearchComponentMatch[];
}

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * v1 matching rule (spec §7.1, exact): case-insensitive substring match of
 * `query` against a component's name, category, OR description (any one
 * qualifies). Restricted to components with a `packages.{framework}` entry
 * when `framework` is supplied. Returns matches in ALL_COMPONENTS's own
 * array order — unranked. Fuzzy matching/relevance ranking is explicitly
 * deferred (spec §10), not implemented here.
 */
export function searchComponents(input: SearchComponentsInput): SearchComponentsResult | McpToolError {
  if (typeof input.query !== "string") {
    return invalidInputError("query", "must be a string");
  }
  if (input.framework !== undefined && !KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue" when supplied');
  }

  const needle = input.query.toLowerCase();

  const matches = ALL_COMPONENTS.filter((component) => {
    if (input.framework !== undefined && component.packages[input.framework] === undefined) {
      return false;
    }
    return (
      component.name.toLowerCase().includes(needle) ||
      component.category.toLowerCase().includes(needle) ||
      component.description.toLowerCase().includes(needle)
    );
  }).map((component) => ({
    name: component.name,
    category: component.category,
    description: component.description,
  }));

  return { matches };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/search-components.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the failing tests for `get_component_api`**

```typescript
// packages/mcp/test/tools/get-component-api.test.ts
import { describe, it, expect, vi } from "vitest";
import { getComponentApi } from "../../src/tools/get-component-api";

describe("getComponentApi", () => {
  it("returns the real, non-empty events array for Table/react (Pre-flight #4: populated, not empty)", () => {
    const result = getComponentApi({ name: "Table", framework: "react" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.events.length).toBeGreaterThan(0);
  });

  it("returns an empty events array for Button/ng, exactly as recorded (Pre-flight #4: this record is genuinely empty)", () => {
    const result = getComponentApi({ name: "Button", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.events).toEqual([]);
  });

  it("returns the real props array, exactly as recorded, with no reshaping", () => {
    const result = getComponentApi({ name: "Button", framework: "react" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.props.some((p) => p.name === "label")).toBe(true);
  });

  it("returns a structured not-found error for an unknown component name (case 2)", () => {
    const result = getComponentApi({ name: "NotAComponent", framework: "ng" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
  });

  it("real v1 data sanity check: every real record has api.{framework} populated for all 3 frameworks (Pre-flight #4) — this call never hits the facet_not_recorded path today", () => {
    const result = getComponentApi({ name: "Button", framework: "ng" });
    expect("code" in result).toBe(false);
  });

  it("returns facet_not_recorded (case 4), not an error, when packages.{framework}/api.{framework} is absent for an otherwise-valid record — exercised via a synthetic mocked record, since no real v1 record has this gap", async () => {
    vi.resetModules();
    vi.doMock("@ultimate/component-metadata", () => ({
      ALL_COMPONENTS: [
        {
          name: "SyntheticGapComponent",
          category: "Test",
          description: "A synthetic record with no react api entry, used only to exercise the facet_not_recorded path.",
          schemaVersion: "1.0.0",
          metadataVersion: 1,
          packages: { ng: { packageName: "@ultimate/ng", sourcePath: "n/a" } },
          // Deliberately no `api` key at all — the real-world shape this
          // synthesizes is a component with a packages.ng entry but no
          // recorded api facts for it.
        },
      ],
    }));

    const { getComponentApi: getComponentApiWithMock } = await import("../../src/tools/get-component-api");
    const result = getComponentApiWithMock({ name: "SyntheticGapComponent", framework: "ng" });

    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("facet_not_recorded");

    vi.doUnmock("@ultimate/component-metadata");
    vi.resetModules();
  });

  it("rejects an invalid framework value with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong value for the runtime check
    const result = getComponentApi({ name: "Button", framework: "svelte" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component-api.test.ts`
Expected: FAIL — `src/tools/get-component-api.ts` does not exist yet.

- [ ] **Step 7: Write `src/tools/get-component-api.ts`**

```typescript
// packages/mcp/src/tools/get-component-api.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { EventFact, PropFact } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, absentFacetError, type McpToolError } from "../errors";

export interface GetComponentApiInput {
  name: string;
  framework: "ng" | "react" | "vue";
}

export interface GetComponentApiResult {
  props: PropFact[];
  events: EventFact[];
}

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * Returns `api.{framework}.{props,events}` exactly as recorded on the real
 * metadata record — no reshaping, no filtering. `events` is real per-record
 * data: non-empty on 6 of the 8 v1 records, empty (`[]`) on exactly Button
 * and Tooltip (verified against packages/component-metadata/src/records/*.ts;
 * this tool never assumes a uniform "no events" shape across the proof set).
 * Returns `facet_not_recorded` (case 4) rather than an error when
 * `packages.{framework}` or `api.{framework}` is absent for an otherwise
 * valid component/framework pair.
 */
export function getComponentApi(input: GetComponentApiInput): GetComponentApiResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }
  if (!KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue"');
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  const frameworkApi = component.api?.[input.framework];
  if (frameworkApi === undefined) {
    return absentFacetError(`api.${input.framework}`);
  }

  return { props: frameworkApi.props, events: frameworkApi.events };
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component-api.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 9: Commit**

```bash
git add packages/mcp/src/tools/search-components.ts packages/mcp/src/tools/get-component-api.ts packages/mcp/test/tools/search-components.test.ts packages/mcp/test/tools/get-component-api.test.ts
git commit -m "feat(mcp): search_components and get_component_api tool logic"
```

**Dependencies:** Task 1 (package scaffold), Task 2 (`errors.ts`).

**Completion criteria:** All 15 tests across both files pass (8 in `search-components.test.ts`, 7 in `get-component-api.test.ts`); `search_components`'s matching rule matches spec §7.1 exactly (case-insensitive substring, 3 named fields, unranked, array order); `get_component_api`'s events output is verified non-empty for at least one real component (Table) and empty for at least one real component (Button), not assumed uniform; the `facet_not_recorded` (case 4) branch is exercised via a mocked synthetic record, not left untested merely because no real v1 record currently has this gap.

---

### Task 4 — Independent compatibility-manifest reader (`manifest.ts`)

**Objective:** Implement a `@ultimate/mcp`-owned, independent read of `docs/architecture/compatibility-manifest.json` — never importing `@ultimate/cli`'s `matchCompatibility()`/`detectFramework()`, per spec §5.2. Fails closed (structured error) on any read/parse failure, never crashing unstructured or fabricating a result — correcting the exact gap Pre-flight #11 found in `@ultimate/cli`'s own `doctor.ts`.

**Files:**
- Create: `packages/mcp/src/manifest.ts`
- Test: `packages/mcp/test/manifest.test.ts`

**Interfaces:**
- Consumes: `manifestUnreadableError` from `../errors` (Task 2).
- Produces: `readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError` and `CompatibilityManifestEntry` (the minimal shape this package needs — `framework`, `frameworkVersionRange` only, per spec §7.4's single-axis scope; **not** a full port of CLI's 6-field `CompatibilityEntry`), consumed by `check-framework-compatibility.ts` (Task 7).

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/mcp/test/manifest.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("readCompatibilityManifest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the real, currently-checked-in compatibility-manifest.json and returns all 3 framework entries", async () => {
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    const frameworks = result.map((e) => e.framework).sort();
    expect(frameworks).toEqual(["angular", "react", "vue"]);
  });

  it("each entry has framework and frameworkVersionRange only — the single axis this tool needs, not the CLI's full 6-axis shape (spec §7.4)", async () => {
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    for (const entry of result) {
      expect(Object.keys(entry).sort()).toEqual(["framework", "frameworkVersionRange"]);
    }
  });

  it("returns a structured manifest_unreadable error, never throws and never a fabricated/empty successful result, when the file does not exist (case 3, spec §4.1)", async () => {
    vi.resetModules();
    vi.doMock("node:fs", async (importOriginal) => {
      const actual = await importOriginal<typeof import("node:fs")>();
      return {
        ...actual,
        readFileSync: () => {
          throw new Error("ENOENT: no such file or directory");
        },
      };
    });
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("manifest_unreadable");
    vi.doUnmock("node:fs");
  });

  it("returns a structured manifest_unreadable error, not a crash, when the file contains invalid JSON (case 3)", async () => {
    const workDir = mkdtempSync(join(tmpdir(), "mcp-manifest-malformed-"));
    writeFileSync(join(workDir, "compatibility-manifest.json"), "{ this is not valid JSON");

    vi.resetModules();
    vi.doMock("../src/manifest-path.js", () => ({
      COMPATIBILITY_MANIFEST_PATH: join(workDir, "compatibility-manifest.json"),
    }));
    const { readCompatibilityManifest } = await import("../src/manifest");
    const result = readCompatibilityManifest();
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("manifest_unreadable");

    vi.doUnmock("../src/manifest-path.js");
    rmSync(workDir, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/manifest.test.ts`
Expected: FAIL — `src/manifest.ts` (and `src/manifest-path.ts`) do not exist yet.

- [ ] **Step 3: Write `src/manifest-path.ts` (isolates path resolution for the malformed-file test's mock seam)**

```typescript
// packages/mcp/src/manifest-path.ts
//
// This file's ONLY job is to hold the manifest's resolved absolute path as
// a separately-importable constant, so test/manifest.test.ts can mock it in
// isolation (via vi.doMock) without needing to mock node:fs's readFileSync
// for the "malformed content" case (only the "file does not exist" case
// needs the fs-level mock).
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// This file lives at <repo-root>/packages/mcp/src/manifest-path.ts — resolve
// relative to THIS file's location (not process.cwd(), which varies by
// invocation context), matching the exact convention already established by
// @ultimate/component-schema/src/validate.ts's own REPO_ROOT resolution.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

export const COMPATIBILITY_MANIFEST_PATH = join(
  REPO_ROOT,
  "docs",
  "architecture",
  "compatibility-manifest.json"
);
```

- [ ] **Step 4: Write `src/manifest.ts`**

```typescript
// packages/mcp/src/manifest.ts
//
// An independent, minimal reader of docs/architecture/compatibility-manifest.json.
// Deliberately does NOT import @ultimate/cli's matchCompatibility()/
// detectFramework() (spec §5.2) — reads the same shared, plain-JSON data
// file @ultimate/cli itself reads, but does so on its own, narrowly, for
// exactly the one axis check_framework_compatibility needs
// (frameworkVersionRange). This is a deliberately smaller shape than CLI's
// own 6-field CompatibilityEntry — not a port of it.
import { readFileSync } from "node:fs";
import { manifestUnreadableError, type McpToolError } from "./errors";
import { COMPATIBILITY_MANIFEST_PATH } from "./manifest-path";

export interface CompatibilityManifestEntry {
  framework: "angular" | "react" | "vue";
  frameworkVersionRange: string;
}

function isValidEntry(value: unknown): value is CompatibilityManifestEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    (entry.framework === "angular" || entry.framework === "react" || entry.framework === "vue") &&
    typeof entry.frameworkVersionRange === "string"
  );
}

/**
 * Reads docs/architecture/compatibility-manifest.json and returns exactly
 * the {framework, frameworkVersionRange} facts this package's one
 * compatibility tool needs — ignoring every other real field the file
 * contains (ultimateFrameworkPackage, uixVersionRange, themeVersionRange,
 * metadataSchemaVersion, cliVersionRange, and the reserved
 * mcpVersionRange/aiSkillsVersionRange axes), since this tool makes no
 * claim about any of those (spec §7.4).
 *
 * Fails closed per spec §4.1 case 3: any read or parse failure returns a
 * structured manifest_unreadable error — never throws an unstructured
 * exception (unlike @ultimate/cli's own doctor.ts, which does not guard
 * this read — see this plan's Pre-flight #11), and never falls back to an
 * empty array or a fabricated successful result.
 */
export function readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError {
  let raw: string;
  try {
    raw = readFileSync(COMPATIBILITY_MANIFEST_PATH, "utf-8");
  } catch (error) {
    return manifestUnreadableError(error instanceof Error ? error.message : String(error));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return manifestUnreadableError(error instanceof Error ? error.message : String(error));
  }

  if (!Array.isArray(parsed)) {
    return manifestUnreadableError("compatibility-manifest.json did not parse to an array");
  }

  const entries: CompatibilityManifestEntry[] = [];
  for (const item of parsed) {
    if (!isValidEntry(item)) {
      return manifestUnreadableError("compatibility-manifest.json contained a malformed entry");
    }
    entries.push({ framework: item.framework, frameworkVersionRange: item.frameworkVersionRange });
  }

  return entries;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/manifest.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/mcp/src/manifest.ts packages/mcp/src/manifest-path.ts packages/mcp/test/manifest.test.ts
git commit -m "feat(mcp): independent compatibility-manifest reader, no @ultimate/cli dependency"
```

**Dependencies:** Task 1 (package scaffold), Task 2 (`errors.ts`).

**Completion criteria:** All 4 tests pass; `src/manifest.ts` contains no `import` of `@ultimate/cli` anywhere (grep-verifiable); a malformed or missing manifest file never throws out of `readCompatibilityManifest()` and never returns a value indistinguishable from a real successful read.

---

### Task 5 — `get_component` and `get_component_accessibility` tool logic (TDD)

**Objective:** Implement `get_component`'s exact framework-narrowing rule (spec §7.1) and `get_component_accessibility`'s honest-degradation contract (spec §7.2), grounded against the real per-record facet population confirmed in Pre-flight #4.

**Files:**
- Create: `packages/mcp/src/tools/get-component.ts`
- Create: `packages/mcp/src/tools/get-component-accessibility.ts`
- Test: `packages/mcp/test/tools/get-component.test.ts`
- Test: `packages/mcp/test/tools/get-component-accessibility.test.ts`

**Interfaces:**
- Consumes: `ALL_COMPONENTS` from `@ultimate/component-metadata`; `notFoundError`/`invalidInputError`/`absentFacetError` from `../errors` (Task 2).
- Produces: `getComponent(input: GetComponentInput): GetComponentResult | McpToolError` and `getComponentAccessibility(input: GetComponentAccessibilityInput): GetComponentAccessibilityResult | McpToolError`, consumed by `server.ts` (Task 8).

- [ ] **Step 1: Write the failing tests for `get_component`**

```typescript
// packages/mcp/test/tools/get-component.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { getComponent } from "../../src/tools/get-component";

describe("getComponent", () => {
  it("without framework: returns the complete metadata record unmodified, across all frameworks it covers (spec §7.1)", () => {
    const real = ALL_COMPONENTS.find((c) => c.name === "Table")!;
    const result = getComponent({ name: "Table" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result).toEqual(real);
  });

  it("with framework: keeps every framework-neutral facet in full — name, category, description, accessibility, style, relationships, guidance, provenanceRef (spec §7.1's exact rule)", () => {
    const real = ALL_COMPONENTS.find((c) => c.name === "Table")!;
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.name).toBe(real.name);
    expect(result.category).toBe(real.category);
    expect(result.description).toBe(real.description);
    expect(result.accessibility).toEqual(real.accessibility);
    expect(result.style).toEqual(real.style);
    expect(result.relationships).toEqual(real.relationships);
    expect(result.guidance).toEqual(real.guidance);
    expect(result.provenanceRef).toEqual(real.provenanceRef);
  });

  it("with framework: narrows packages to exactly {ng: ...}, dropping react/vue entries", () => {
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(Object.keys(result.packages)).toEqual(["ng"]);
  });

  it("with framework: narrows api to exactly {ng: ...}, dropping react/vue entries", () => {
    const result = getComponent({ name: "Table", framework: "ng" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(Object.keys(result.api ?? {})).toEqual(["ng"]);
  });

  it("returns a structured not-found error naming the known-8-component list for an unknown name (case 2)", () => {
    const result = getComponent({ name: "NotAComponent" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
    for (const component of ALL_COMPONENTS) {
      expect(result.message).toContain(component.name);
    }
  });

  it("never falls back to a partial-match on an unknown name — exact name match only", () => {
    const result = getComponent({ name: "Butto" }); // deliberately truncated "Button"
    expect("code" in result).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component.test.ts`
Expected: FAIL — `src/tools/get-component.ts` does not exist yet.

- [ ] **Step 3: Write `src/tools/get-component.ts`**

```typescript
// packages/mcp/src/tools/get-component.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, type McpToolError } from "../errors";

export interface GetComponentInput {
  name: string;
  framework?: "ng" | "react" | "vue";
}

export type GetComponentResult = ComponentMetadata;

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * Exactly one output rule (spec §7.1, no ambiguity):
 * - Without `framework`: the complete metadata record, unmodified.
 * - With `framework`: every framework-neutral facet (name, category,
 *   description, accessibility?, style?, relationships?, guidance?,
 *   provenanceRef?) returned in full — none of these are framework-specific,
 *   so none are dropped or filtered — PLUS only that one framework's
 *   entries for the two facets that ARE structured per-framework:
 *   `packages` narrowed to `packages.{framework}` alone, `api` narrowed to
 *   `api.{framework}` alone (the whole `api` key is omitted if the
 *   framework has no api entry — not returned as an empty object; per
 *   spec §4.1 case 4, absence is signaled by the key's absence here, since
 *   this is a facet already present on the base record, not a
 *   caller-facing error condition on its own).
 */
export function getComponent(input: GetComponentInput): GetComponentResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }
  if (input.framework !== undefined && !KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue" when supplied');
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  if (input.framework === undefined) {
    return component;
  }

  const narrowedPackages: ComponentMetadata["packages"] = {};
  const packageEntry = component.packages[input.framework];
  if (packageEntry !== undefined) {
    narrowedPackages[input.framework] = packageEntry;
  }

  const narrowedApi = component.api?.[input.framework];

  return {
    name: component.name,
    category: component.category,
    description: component.description,
    schemaVersion: component.schemaVersion,
    metadataVersion: component.metadataVersion,
    packages: narrowedPackages,
    ...(narrowedApi !== undefined ? { api: { [input.framework]: narrowedApi } } : {}),
    ...(component.accessibility !== undefined ? { accessibility: component.accessibility } : {}),
    ...(component.style !== undefined ? { style: component.style } : {}),
    ...(component.relationships !== undefined ? { relationships: component.relationships } : {}),
    ...(component.guidance !== undefined ? { guidance: component.guidance } : {}),
    ...(component.provenanceRef !== undefined ? { provenanceRef: component.provenanceRef } : {}),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the failing tests for `get_component_accessibility`**

```typescript
// packages/mcp/test/tools/get-component-accessibility.test.ts
import { describe, it, expect } from "vitest";
import { getComponentAccessibility } from "../../src/tools/get-component-accessibility";

describe("getComponentAccessibility", () => {
  it("returns Table's real, populated accessibility facet (Pre-flight #4: Table is the only real record with one)", () => {
    const result = getComponentAccessibility({ name: "Table" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.guidance).toBeDefined();
  });

  it("returns an explicit facet_not_recorded result, not a fabricated empty-but-implying-verified response, for a component with no accessibility facet (case 4)", () => {
    // Button has no accessibility facet at all (Pre-flight #4).
    const result = getComponentAccessibility({ name: "Button" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("facet_not_recorded");
  });

  it("returns a structured not-found error for an unknown component name (case 2)", () => {
    const result = getComponentAccessibility({ name: "NotAComponent" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("not_found");
  });

  it("rejects a non-string name with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = getComponentAccessibility({ name: 42 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component-accessibility.test.ts`
Expected: FAIL — `src/tools/get-component-accessibility.ts` does not exist yet.

- [ ] **Step 7: Write `src/tools/get-component-accessibility.ts`**

```typescript
// packages/mcp/src/tools/get-component-accessibility.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { AccessibilityFacts } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, absentFacetError, type McpToolError } from "../errors";

export interface GetComponentAccessibilityInput {
  name: string;
}

export type GetComponentAccessibilityResult = AccessibilityFacts;

/**
 * Returns a component's accessibility.{verifiedRoles, verifiedAriaAttributes,
 * guidance} facet if populated, or an explicit facet_not_recorded result
 * (case 4, spec §4.1) if the optional facet is absent — never a fabricated
 * empty-but-implying-verified response. Per Pre-flight #4, only Table (1 of
 * 8 real records) currently populates this facet; this function does not
 * assume or special-case that — it degrades honestly for whichever record
 * is queried, based on the real data present.
 */
export function getComponentAccessibility(
  input: GetComponentAccessibilityInput
): GetComponentAccessibilityResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  if (component.accessibility === undefined) {
    return absentFacetError("accessibility");
  }

  return component.accessibility;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/get-component-accessibility.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add packages/mcp/src/tools/get-component.ts packages/mcp/src/tools/get-component-accessibility.ts packages/mcp/test/tools/get-component.test.ts packages/mcp/test/tools/get-component-accessibility.test.ts
git commit -m "feat(mcp): get_component and get_component_accessibility tool logic"
```

**Dependencies:** Task 1 (package scaffold), Task 2 (`errors.ts`).

**Completion criteria:** All 10 tests across both files pass; `getComponent`'s framework-narrowed output is verified field-by-field (not just "roughly matches") against a real record with populated `accessibility` and `relationships` (Table) — its `guidance` field is verified only as `undefined === undefined`, since no real v1 record populates the top-level `guidance` facet (Pre-flight #4); `getComponentAccessibility`'s honest-absence path is exercised against a real component that genuinely lacks the facet (Button), not a synthetic one.

---

### Task 6 — `check_framework_compatibility` tool logic (TDD)

**Objective:** Implement the narrowly-scoped, single-axis compatibility tool per spec §7.4, consuming Task 4's independent manifest reader — never `@ultimate/cli`'s `matchCompatibility()`.

**Files:**
- Create: `packages/mcp/src/tools/check-framework-compatibility.ts`
- Test: `packages/mcp/test/tools/check-framework-compatibility.test.ts`

**Interfaces:**
- Consumes: `readCompatibilityManifest` from `../manifest` (Task 4); `invalidInputError` from `../errors` (Task 2). Uses hand-rolled caret-range satisfaction (mirroring, not importing, `@ultimate/cli`'s own `satisfiesRange` logic in `compatibility.ts` — spec §5.2 forbids the import, but the algorithm itself is public, well-understood caret-range semantics, not CLI-proprietary logic).
- Produces: `checkFrameworkCompatibility(input: CheckFrameworkCompatibilityInput): CheckFrameworkCompatibilityResult | McpToolError`, consumed by `server.ts` (Task 8).

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/mcp/test/tools/check-framework-compatibility.test.ts
import { describe, it, expect } from "vitest";
import { checkFrameworkCompatibility } from "../../src/tools/check-framework-compatibility";

describe("checkFrameworkCompatibility", () => {
  it("returns compatible: true for a version satisfying the real manifest's angular frameworkVersionRange", () => {
    // Real manifest entry: angular frameworkVersionRange "^21.0.7" (Pre-flight #6).
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: "21.0.7" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(true);
  });

  it("returns compatible: false with a reason for a version below the real manifest's range floor", () => {
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: "20.0.0" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("returns compatible: true for a version satisfying react's multi-range union (^17||^18||^19, Pre-flight #6)", () => {
    const result = checkFrameworkCompatibility({ framework: "react", frameworkVersion: "18.2.0" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    expect(result.compatible).toBe(true);
  });

  it("evaluates ONLY frameworkVersionRange — never claims to evaluate ultimateFrameworkPackage/uix/theme/metadataSchema/cli axes (spec §7.4's corrected terminology)", () => {
    const result = checkFrameworkCompatibility({ framework: "vue", frameworkVersion: "3.5.0" });
    expect("code" in result).toBe(false);
    if ("code" in result) return;
    // Structural check: result shape is exactly {compatible, reason?} — no
    // other axis fields (ultimateFrameworkPackageCompatible, uixCompatible,
    // etc.) exist anywhere on the return type.
    for (const key of Object.keys(result)) {
      expect(["compatible", "reason"]).toContain(key);
    }
  });

  it("rejects an unknown framework value with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong value for the runtime check
    const result = checkFrameworkCompatibility({ framework: "svelte", frameworkVersion: "1.0.0" });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });

  it("rejects a non-string frameworkVersion with a structured invalid-input error (case 1)", () => {
    // @ts-expect-error deliberately wrong type for the runtime check
    const result = checkFrameworkCompatibility({ framework: "angular", frameworkVersion: 21 });
    expect("code" in result).toBe(true);
    if (!("code" in result)) return;
    expect(result.code).toBe("invalid_input");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/check-framework-compatibility.test.ts`
Expected: FAIL — `src/tools/check-framework-compatibility.ts` does not exist yet.

- [ ] **Step 3: Write `src/tools/check-framework-compatibility.ts`**

```typescript
// packages/mcp/src/tools/check-framework-compatibility.ts
import { readCompatibilityManifest } from "../manifest";
import { invalidInputError, type McpToolError } from "../errors";

export interface CheckFrameworkCompatibilityInput {
  framework: "angular" | "react" | "vue";
  frameworkVersion: string;
}

export interface CheckFrameworkCompatibilityResult {
  compatible: boolean;
  reason?: string;
}

const KNOWN_FRAMEWORKS = new Set(["angular", "react", "vue"]);

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): ParsedVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/** Public, well-understood caret-range semantics — not imported from @ultimate/cli (spec §5.2). */
function satisfiesCaretRange(version: ParsedVersion, range: ParsedVersion): boolean {
  if (compareVersions(version, range) < 0) return false;
  if (range.major > 0) return version.major === range.major;
  if (range.minor > 0) return version.major === 0 && version.minor === range.minor;
  return version.major === 0 && version.minor === 0 && version.patch === range.patch;
}

function satisfiesRange(versionString: string, rangeString: string): boolean {
  const version = parseVersion(versionString);
  if (!version) return false;

  return rangeString
    .split("||")
    .map((part) => part.trim())
    .some((alternative) => {
      if (alternative.startsWith("^")) {
        const range = parseVersion(alternative.slice(1));
        return range !== null && satisfiesCaretRange(version, range);
      }
      const exact = parseVersion(alternative);
      return exact !== null && compareVersions(version, exact) === 0;
    });
}

/**
 * A single-axis framework-version compatibility check (spec §7.4, corrected
 * terminology: NOT a full multi-axis "compatibility verdict" — evaluates
 * ONLY frameworkVersionRange against the real compatibility-manifest.json,
 * via Task 4's independent reader, never @ultimate/cli's matchCompatibility().
 * Makes no claim about ultimateFrameworkPackage version, uix version, theme
 * version, metadata schema version, cli version, or any other axis
 * @ultimate/cli's own resolver evaluates.
 */
export function checkFrameworkCompatibility(
  input: CheckFrameworkCompatibilityInput
): CheckFrameworkCompatibilityResult | McpToolError {
  if (!KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "angular", "react", "vue"');
  }
  if (typeof input.frameworkVersion !== "string") {
    return invalidInputError("frameworkVersion", "must be a string");
  }

  const manifestResult = readCompatibilityManifest();
  if ("code" in manifestResult) {
    return manifestResult;
  }

  const entry = manifestResult.find((e) => e.framework === input.framework);
  if (entry === undefined) {
    return { compatible: false, reason: `no compatibility-manifest entry for framework "${input.framework}"` };
  }

  const matched = satisfiesRange(input.frameworkVersion, entry.frameworkVersionRange);
  if (matched) {
    return { compatible: true };
  }
  return {
    compatible: false,
    reason: `frameworkVersion "${input.frameworkVersion}" does not satisfy "${entry.frameworkVersionRange}"`,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/tools/check-framework-compatibility.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/mcp/src/tools/check-framework-compatibility.ts packages/mcp/test/tools/check-framework-compatibility.test.ts
git commit -m "feat(mcp): check_framework_compatibility tool, single-axis only, no CLI dependency"
```

**Dependencies:** Task 1 (package scaffold), Task 2 (`errors.ts`), Task 4 (`manifest.ts`).

**Completion criteria:** All 6 tests pass; `check-framework-compatibility.ts` contains no `import` of `@ultimate/cli` anywhere; `CheckFrameworkCompatibilityResult`'s type has exactly `compatible`/`reason?` fields, no fields naming any other axis.

---

### Task 7 — MCP server bootstrap and tool registration

**Objective:** Wire all 5 tool functions (Tasks 3, 5, 6) into a real `@modelcontextprotocol/sdk` `McpServer`, register the stdio transport, and make `bin.ts` the sole file that starts it — satisfying the stdout/stderr discipline (spec §5.1.1) end-to-end.

**Files:**
- Create: `packages/mcp/src/server.ts`
- Modify: `packages/mcp/src/bin.ts` (replace placeholder)
- Modify: `packages/mcp/src/index.ts` (replace placeholder — export the tool functions/types for library-surface consumption by tests and any future consumer)

**Interfaces:**
- Consumes: `searchComponents`/`SearchComponentsInput` (Task 3), `getComponentApi`/`GetComponentApiInput` (Task 3), `getComponent`/`GetComponentInput` (Task 5), `getComponentAccessibility`/`GetComponentAccessibilityInput` (Task 5), `checkFrameworkCompatibility`/`CheckFrameworkCompatibilityInput` (Task 6), `McpToolError` (Task 2).
- Produces: `createMcpServer(): McpServer` (a constructed-but-not-yet-connected server instance, for testability without a real stdio connection), consumed by `bin.ts` (this task) and by Task 9's server-registration tests.

- [ ] **Step 1: Write `src/server.ts`**

```typescript
// packages/mcp/src/server.ts
//
// Constructs the McpServer and registers all 5 v1 tools. Deliberately
// exports createMcpServer() as a separate function from the transport
// connection (done only in bin.ts) so this file's tool-registration logic
// is testable without spawning a real stdio process (spec §5.1.1: nothing
// in this file writes to stdout — only tool return values flow through the
// SDK's own response-serialization path).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { searchComponents } from "./tools/search-components";
import { getComponentApi } from "./tools/get-component-api";
import { getComponent } from "./tools/get-component";
import { getComponentAccessibility } from "./tools/get-component-accessibility";
import { checkFrameworkCompatibility } from "./tools/check-framework-compatibility";
import { internalError, type McpToolError } from "./errors";

const FRAMEWORK_ENUM_NG = z.enum(["ng", "react", "vue"]);
const FRAMEWORK_ENUM_ANGULAR = z.enum(["angular", "react", "vue"]);

/**
 * Wraps a tool function's `Result | McpToolError` return into the MCP SDK's
 * own tool-response shape. Per spec §4.1 case 5: any exception thrown by
 * the tool function itself (not a structured McpToolError return, a real
 * unhandled throw) is caught here and converted into a generic
 * internalError() — never lets a raw stack trace or exception message
 * reach the response. That raw detail goes to stderr (spec §5.1.1), never
 * into the tool-response payload.
 */
function toToolResponse<T>(result: T | McpToolError) {
  if (result !== null && typeof result === "object" && "code" in result) {
    const err = result as McpToolError;
    return {
      isError: true,
      content: [{ type: "text" as const, text: JSON.stringify({ code: err.code, message: err.message }) }],
    };
  }
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result) }],
  };
}

function safeHandler<TInput>(fn: (input: TInput) => unknown) {
  return (input: TInput) => {
    try {
      return toToolResponse(fn(input));
    } catch (error) {
      // Real internal detail goes to stderr only — never into the response.
      console.error("[@ultimate/mcp] unexpected internal error:", error);
      return toToolResponse(internalError());
    }
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "@ultimate/mcp", version: "0.1.0" });

  server.registerTool(
    "search_components",
    {
      description: "Case-insensitive substring search over Ultimate component name/category/description.",
      inputSchema: {
        query: z.string(),
        framework: FRAMEWORK_ENUM_NG.optional(),
      },
    },
    safeHandler(searchComponents)
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Returns the full metadata record for a known component, optionally narrowed to one framework's packages/api entries.",
      inputSchema: {
        name: z.string(),
        framework: FRAMEWORK_ENUM_NG.optional(),
      },
    },
    safeHandler(getComponent)
  );

  server.registerTool(
    "get_component_api",
    {
      description: "Returns a component's props/events for one specific framework, exactly as recorded.",
      inputSchema: {
        name: z.string(),
        framework: FRAMEWORK_ENUM_NG,
      },
    },
    safeHandler(getComponentApi)
  );

  server.registerTool(
    "get_component_accessibility",
    {
      description: "Returns a component's recorded accessibility facts, or an honest not-recorded result.",
      inputSchema: {
        name: z.string(),
      },
    },
    safeHandler(getComponentAccessibility)
  );

  server.registerTool(
    "check_framework_compatibility",
    {
      description:
        "Checks a caller-supplied framework/version pair against the compatibility manifest's frameworkVersionRange axis only — not a full multi-axis compatibility check.",
      inputSchema: {
        framework: FRAMEWORK_ENUM_ANGULAR,
        frameworkVersion: z.string(),
      },
    },
    safeHandler(checkFrameworkCompatibility)
  );

  return server;
}
```

- [ ] **Step 2: Write `src/bin.ts`**

```typescript
// packages/mcp/src/bin.ts
//
// The ONLY file in this package that starts the real stdio transport. Per
// spec §5.1.1: stdout is the MCP protocol wire from the moment this
// process starts — no console.log anywhere in this file or anything it
// calls. Startup diagnostics go to stderr.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[@ultimate/mcp] server started (stdio)");
}

main().catch((error) => {
  console.error("[@ultimate/mcp] fatal startup error:", error);
  process.exit(1);
});
```

- [ ] **Step 3: Write `src/index.ts`**

```typescript
// packages/mcp/src/index.ts
export { createMcpServer } from "./server";
export { searchComponents, type SearchComponentsInput, type SearchComponentsResult } from "./tools/search-components";
export { getComponentApi, type GetComponentApiInput, type GetComponentApiResult } from "./tools/get-component-api";
export { getComponent, type GetComponentInput, type GetComponentResult } from "./tools/get-component";
export {
  getComponentAccessibility,
  type GetComponentAccessibilityInput,
  type GetComponentAccessibilityResult,
} from "./tools/get-component-accessibility";
export {
  checkFrameworkCompatibility,
  type CheckFrameworkCompatibilityInput,
  type CheckFrameworkCompatibilityResult,
} from "./tools/check-framework-compatibility";
export { readCompatibilityManifest, type CompatibilityManifestEntry } from "./manifest";
export {
  type McpToolError,
  invalidInputError,
  notFoundError,
  manifestUnreadableError,
  absentFacetError,
  internalError,
} from "./errors";
```

- [ ] **Step 4: Add `zod` as a dependency**

`@modelcontextprotocol/sdk`'s `registerTool` input-schema shape (as used above) expects raw Zod schemas per field — `zod` must be declared as an explicit direct dependency (not merely a transitive one pulled in by the SDK), since `server.ts` imports it directly.

Modify `packages/mcp/package.json`'s `dependencies` (adds `zod` to the set Task 1 already declared):
```json
"dependencies": {
  "@ultimate/component-metadata": "workspace:*",
  "@ultimate/component-schema": "workspace:*",
  "@modelcontextprotocol/sdk": "^1.30.0",
  "zod": "^3.25.0 || ^4.0.0"
}
```

`zod: "^3.25.0 || ^4.0.0"` matches `@modelcontextprotocol/sdk@1.30.0`'s own real, confirmed `peerDependencies` entry (`"zod": "^3.25 || ^4.0"`, verified by direct read of the installed package's `package.json` — `zod@4.3.6` is already resolved in this repo's own `pnpm-lock.yaml` as the SDK's transitive peer). **Re-verify both this range and the SDK version at actual implementation time** (`npm view @modelcontextprotocol/sdk peerDependencies`) — the numbers above are grounded in real, currently-resolved repo evidence, not guessed, but do not skip the check, since npm may have published a newer SDK/zod pairing between plan-writing and implementation. This is the same verification discipline Pre-flight #6/ADR-042 already established for peer ranges in this repo.

- [ ] **Step 5: Run build and typecheck**

Run: `pnpm install && pnpm --filter @ultimate/mcp run build`
Expected: succeeds, `dist/bin.mjs` now contains real server-startup logic with the shebang banner.

Run: `pnpm --filter @ultimate/mcp run typecheck`
Expected: succeeds.

- [ ] **Step 6: Manual smoke test — confirm stdout carries only protocol output**

Run: `node packages/mcp/dist/bin.mjs < /dev/null 2>/tmp/mcp-stderr.log; cat /tmp/mcp-stderr.log`
Expected: the process starts, logs `[@ultimate/mcp] server started (stdio)` to `/tmp/mcp-stderr.log` (stderr), and produces **no output on stdout** (nothing printed to the terminal directly — everything visible came from the redirected stderr file). This is a manual verification step confirming Step 2's discipline before Task 9 automates the same check.

- [ ] **Step 7: Commit**

```bash
git add packages/mcp/src/server.ts packages/mcp/src/bin.ts packages/mcp/src/index.ts packages/mcp/package.json pnpm-lock.yaml
git commit -m "feat(mcp): wire all 5 tools into McpServer, stdio bootstrap in bin.ts"
```

**Dependencies:** Task 1 (scaffold), Task 2 (errors), Task 3 (`search_components`/`get_component_api`), Task 5 (`get_component`/`get_component_accessibility`), Task 6 (`check_framework_compatibility`).

**Completion criteria:** `pnpm --filter @ultimate/mcp run build` and `typecheck` succeed; the manual stdio smoke test (Step 6) confirms zero stdout output outside the protocol path; `bin.ts` contains exactly the code shown (no additional `console.log` anywhere in the file or in `server.ts`).

---

### Task 8 — Server-level tests: tool registration, error handling, stdout/stderr discipline

**Objective:** Automate what Task 7 Step 6 verified manually — confirm all 5 tools are registered, the shared error taxonomy round-trips correctly through the SDK's response shape, and no code path writes to stdout.

**Files:**
- Create: `packages/mcp/test/server.test.ts`

**Interfaces:**
- Consumes: `createMcpServer` from `../src/server` (Task 7).
- Produces: nothing consumed by later tasks — this is a terminal test task for the package's own internal correctness.

- [ ] **Step 1: Write the tests**

```typescript
// packages/mcp/test/server.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { createMcpServer } from "../src/server";

describe("createMcpServer", () => {
  it("registers all 5 v1 tools by name", () => {
    const server = createMcpServer();
    // McpServer exposes registered tool names via its internal server
    // object's request handlers in the real SDK; the concrete assertion
    // here uses the SDK's own listTools-equivalent surface, confirmed
    // against the installed @modelcontextprotocol/sdk version at
    // implementation time (the exact introspection API name is an SDK
    // implementation detail to confirm against the real package, not
    // guessed here — this step's assertion list is the contract, its
    // exact mechanism is an implementation-time lookup).
    const registeredNames = ["search_components", "get_component", "get_component_api", "get_component_accessibility", "check_framework_compatibility"];
    // Placeholder assertion shape — implementer confirms the real
    // introspection call against @modelcontextprotocol/sdk's actual API
    // and replaces this comment with the concrete check; the required
    // names list above must not be reduced or renamed.
    expect(registeredNames).toHaveLength(5);
    expect(server).toBeDefined();
  });
});

describe("stdout/stderr discipline (spec §5.1.1)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createMcpServer() writes nothing to stdout during construction/registration", () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    createMcpServer();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("no tool handler writes to stdout when invoked with valid input", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { searchComponents } = await import("../src/tools/search-components");
    searchComponents({ query: "Button" });
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("no tool handler writes to stdout when invoked with invalid input (error path)", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { getComponent } = await import("../src/tools/get-component");
    getComponent({ name: "NotAComponent" });
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("an unexpected internal error (case 5) never appears in stdout, and its detail never appears in the returned error message", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Simulate the internal-error path directly against the shared taxonomy
    // (Task 2), since forcing a real tool function to throw would require
    // reaching into its internals — this test asserts the contract
    // safeHandler()/internalError() establish, not a specific tool's
    // internals.
    const { internalError } = await import("../src/errors");
    const err = internalError();

    expect(err.message).not.toMatch(/\.ts:\d+/);
    expect(stdoutSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm --filter @ultimate/mcp exec vitest run test/server.test.ts`
Expected: PASS. If the tool-registration introspection assertion (Step 1's first test) needs a real SDK-specific API call the implementer must look up against the installed `@modelcontextprotocol/sdk` version — do this now, replacing the placeholder comment with a real assertion against the SDK's actual tool-listing mechanism, and do not mark this task complete with the placeholder still in place.

- [ ] **Step 3: Commit**

```bash
git add packages/mcp/test/server.test.ts
git commit -m "test(mcp): server-level tool registration and stdout/stderr discipline"
```

**Dependencies:** Task 7 (`server.ts`, `bin.ts`).

**Completion criteria:** All server tests pass; the tool-registration test uses a real SDK introspection call (not the placeholder); every stdout-discipline test genuinely asserts zero `process.stdout.write` calls across both the success and error paths of at least 2 different tools plus server construction itself.

---

### Task 9 — New `boundary:validate:mcp` provenance/CI gate

**Objective:** Create a direct structural sibling of `scripts/provenance/validate-cli-boundary.mjs` (Pre-flight #7), extended to prove: (a) `packages/{ng,react,vue}*` never depend on `@ultimate/mcp`; (b) `@ultimate/mcp` never depends on `@ultimate/cli` or `@ultimate/{ng,react,vue,themes}` — per approved spec §8.1.

**Files:**
- Create: `scripts/provenance/validate-mcp-boundary.mjs`
- Create: `scripts/provenance/validate-mcp-boundary.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks (standalone script, mirrors `validate-cli-boundary.mjs`'s own standalone shape).
- Produces: a `node scripts/provenance/validate-mcp-boundary.mjs` CLI invocation with exit code 0 (pass) / 1 (fail), consumed by Task 11's CI wiring and root `package.json` script.

- [ ] **Step 1: Write the failing tests**

```javascript
// scripts/provenance/validate-mcp-boundary.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-mcp-boundary.mjs");

function runScript(cwd) {
  return spawnSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
}

function makeWorkDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

// --- Check 1: reverse-direction, framework packages never import @ultimate/mcp ---

test("passes when packages/ng*/src has no @ultimate/mcp import", () => {
  const workDir = makeWorkDir("mcp-boundary-check1-pass-");
  const srcDir = join(workDir, "packages", "ng", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { Button } from "@ultimate/ng-core";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);
  assert.match(result.stdout, /OK/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/react*-shaped fixture's src imports @ultimate/mcp", () => {
  const workDir = makeWorkDir("mcp-boundary-check1-fail-");
  const srcDir = join(workDir, "packages", "react", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { searchComponents } from "@ultimate/mcp";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on reverse-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/vue*-shaped fixture's package.json declares @ultimate/mcp in dependencies", () => {
  const workDir = makeWorkDir("mcp-boundary-check2-fail-");
  const pkgDir = join(workDir, "packages", "vue");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/vue", dependencies: { "@ultimate/mcp": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on reverse-direction package.json violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /reverse-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 3: forward-direction, @ultimate/mcp never depends on cli/ng/react/vue/themes ---

test("passes when packages/mcp/package.json declares only the permitted Ultimate dependencies (component-metadata, component-schema)", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-pass-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({
      name: "@ultimate/mcp",
      dependencies: {
        "@ultimate/component-metadata": "workspace:*",
        "@ultimate/component-schema": "workspace:*",
        "@modelcontextprotocol/sdk": "^1.30.0",
        zod: "^3.25.0 || ^4.0.0",
      },
    })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's package.json declares @ultimate/cli in dependencies (the specific edge spec §5.2/§8.1 forbids)", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-fail-cli-deps-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/mcp", dependencies: { "@ultimate/cli": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction dependencies violation (mcp -> cli)");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"dependencies"/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's package.json declares @ultimate/themes in devDependencies", () => {
  const workDir = makeWorkDir("mcp-boundary-check3-fail-devdeps-");
  const pkgDir = join(workDir, "packages", "mcp");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/mcp", devDependencies: { "@ultimate/themes": "workspace:*" } })
  );

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction devDependencies violation");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /"devDependencies"/);

  rmSync(workDir, { recursive: true, force: true });
});

// --- Check 4: forward-direction, source imports ---

test("passes when packages/mcp/src has no forbidden cli/framework/themes import", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-pass-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(srcDir, "index.ts"),
    `import { ALL_COMPONENTS } from "@ultimate/component-metadata";\n`
  );

  const result = runScript(workDir);

  assert.equal(result.status, 0, `expected pass, got stderr: ${result.stderr}`);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's src imports @ultimate/cli (the specific edge spec §5.2 forbids)", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-fail-cli-import-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "manifest.ts"), `import { matchCompatibility } from "@ultimate/cli";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction source-import violation (mcp -> cli)");
  assert.match(result.stderr, /VIOLATION/);
  assert.match(result.stderr, /forward-direction/);

  rmSync(workDir, { recursive: true, force: true });
});

test("fails when a packages/mcp-shaped fixture's src imports @ultimate/vue", () => {
  const workDir = makeWorkDir("mcp-boundary-check4-fail-vue-");
  const srcDir = join(workDir, "packages", "mcp", "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(join(srcDir, "index.ts"), `import { something } from "@ultimate/vue";\n`);

  const result = runScript(workDir);

  assert.equal(result.status, 1, "expected fail on forward-direction source-import violation");
  assert.match(result.stderr, /VIOLATION/);

  rmSync(workDir, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/provenance/validate-mcp-boundary.test.mjs`
Expected: FAIL — `scripts/provenance/validate-mcp-boundary.mjs` does not exist yet.

- [ ] **Step 3: Write `scripts/provenance/validate-mcp-boundary.mjs`**

```javascript
#!/usr/bin/env node
// scripts/provenance/validate-mcp-boundary.mjs
//
// Direct structural sibling of validate-cli-boundary.mjs (Phase 7),
// extended per the approved Phase 8 spec §8.1 to prove:
//   - Reverse: packages/{ng,react,vue}* must never import or depend on
//     @ultimate/mcp.
//   - Forward: @ultimate/mcp must never depend on or import @ultimate/cli
//     (the specific edge spec §5.2 rules out) or any of @ultimate/ng,
//     @ultimate/react, @ultimate/vue, @ultimate/themes.
//
// Deliberately a sibling script, not a widening of validate-cli-boundary.mjs
// or validate-boundaries.mjs — matches the exact precedent Phase 7 set for
// itself (see that script's own header comment).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FRAMEWORK_PACKAGE_PREFIXES = ["ng", "react", "vue"];
const MCP_PACKAGE_NAME = "@ultimate/mcp";
const FORWARD_FORBIDDEN_PACKAGES = [
  "@ultimate/cli",
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate:mcp] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate:mcp] OK: ${message}`);
}

// Identical anchoring convention to validate-cli-boundary.mjs (see that
// script's own detailed comment for the false-positive rationale this
// mirrors) — line-start-anchored import/from forms, unanchored
// require/dynamic-import forms.
function importPatternsFor(pkgName) {
  const escaped = pkgName.replace(/[/]/g, "\\/");
  return [
    new RegExp(`^\\s*import\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`^\\s*(?:import|export)\\b[\\s\\S]{0,200}?\\sfrom\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`require\\(["']${escaped}(["'/])`),
    new RegExp(`import\\(["']${escaped}(["'/])`),
  ];
}

function findDirsByPrefixes(root, prefixes) {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  return readdirSync(root)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .map((name) => join(root, name));
}

function walk(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function scanFilesForImports(files, pkgNames) {
  const violations = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const pkgName of pkgNames) {
      for (const pattern of importPatternsFor(pkgName)) {
        if (pattern.test(content)) {
          violations.push({ file, pkgName, pattern });
        }
      }
    }
  }
  return violations;
}

let violations = 0;

// Check 1: reverse-direction, source imports.
const frameworkDirs = findDirsByPrefixes("packages", FRAMEWORK_PACKAGE_PREFIXES);
for (const dir of frameworkDirs) {
  const srcDir = join(dir, "src");
  const files = walk(srcDir);
  const found = scanFilesForImports(files, [MCP_PACKAGE_NAME]);
  for (const { file, pattern } of found) {
    console.error(
      `[boundary:validate:mcp] VIOLATION: ${file} imports ${MCP_PACKAGE_NAME} (matched ${pattern}) — reverse-direction violation`
    );
    violations++;
  }
}

// Check 2: reverse-direction, package.json dependencies.
for (const dir of frameworkDirs) {
  const pkgJsonPath = join(dir, "package.json");
  if (!statSync(pkgJsonPath, { throwIfNoEntry: false })) continue;
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  if (Object.prototype.hasOwnProperty.call(deps, MCP_PACKAGE_NAME)) {
    console.error(
      `[boundary:validate:mcp] VIOLATION: ${pkgJsonPath} declares "dependencies" on ${MCP_PACKAGE_NAME} — reverse-direction violation`
    );
    violations++;
  }
}

// Check 3: forward-direction, package.json dependencies + devDependencies.
const mcpPkgJsonPath = join("packages", "mcp", "package.json");
if (statSync(mcpPkgJsonPath, { throwIfNoEntry: false })) {
  const pkg = JSON.parse(readFileSync(mcpPkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  for (const forbidden of FORWARD_FORBIDDEN_PACKAGES) {
    if (Object.prototype.hasOwnProperty.call(deps, forbidden)) {
      console.error(
        `[boundary:validate:mcp] VIOLATION: ${mcpPkgJsonPath} declares "dependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
    if (Object.prototype.hasOwnProperty.call(devDeps, forbidden)) {
      console.error(
        `[boundary:validate:mcp] VIOLATION: ${mcpPkgJsonPath} declares "devDependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
  }
}

// Check 4: forward-direction, source imports.
const mcpSrcDir = join("packages", "mcp", "src");
const mcpFiles = walk(mcpSrcDir);
const mcpFound = scanFilesForImports(mcpFiles, FORWARD_FORBIDDEN_PACKAGES);
for (const { file, pkgName, pattern } of mcpFound) {
  console.error(
    `[boundary:validate:mcp] VIOLATION: ${file} imports ${pkgName} (matched ${pattern}) — forward-direction violation`
  );
  violations++;
}

if (violations > 0) {
  fail(`${violations} MCP dependency-direction violation(s) found`);
}

pass(
  `scanned ${frameworkDirs.length} framework package(s) and packages/mcp — zero MCP dependency-direction violations`
);
process.exit(0);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/provenance/validate-mcp-boundary.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 5: Run the real script against the actual repository**

Run: `node scripts/provenance/validate-mcp-boundary.mjs`
Expected: `[boundary:validate:mcp] OK: scanned 3 framework package(s) and packages/mcp — zero MCP dependency-direction violations` (assuming Tasks 1–8 already landed `packages/mcp` with the correct dependency shape — if this task runs before those, it should still pass since `packages/mcp` not yet existing, or existing with only the correct deps, produces zero violations either way).

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/validate-mcp-boundary.mjs scripts/provenance/validate-mcp-boundary.test.mjs
git commit -m "feat(provenance): add MCP dependency-direction boundary validator"
```

**Dependencies:** None strictly (the script is standalone and can be written independent of `packages/mcp`'s own implementation tasks), but running Step 5 meaningfully against the real repo benefits from Task 1 having landed first. Listed after Task 8 in this plan's narrative order only because it validates what Tasks 1–8 produced; it has no code dependency on any of them.

**Completion criteria:** All 9 script tests pass; running the real script against the actual repository (post Task 1) reports zero violations; the script's forward-direction forbidden-package list explicitly includes `@ultimate/cli` (not just the 4 framework/themes packages `validate-cli-boundary.mjs` checks).

---

### Task 10 — CI and root `package.json` wiring

**Objective:** Add the new `boundary:validate:mcp` root script and CI step, per spec §8.1 and Pre-flight #9's confirmed CI structure.

**Files:**
- Modify: `package.json` (root) — add one script.
- Modify: `.github/workflows/ci.yml` — add one step.

**Interfaces:**
- Consumes: `scripts/provenance/validate-mcp-boundary.mjs` (Task 9).
- Produces: nothing consumed by later tasks — terminal CI-wiring task.

- [ ] **Step 1: Add the root script**

Modify `package.json`'s `"scripts"` block, adding one line after the existing `"boundary:validate:cli"` entry:

```json
"boundary:validate:cli": "node scripts/provenance/validate-cli-boundary.mjs",
"boundary:validate:mcp": "node scripts/provenance/validate-mcp-boundary.mjs"
```

- [ ] **Step 2: Add the CI step**

Modify `.github/workflows/ci.yml`, adding one step after the existing `"CLI package boundary validation"` step:

```yaml
      - name: CLI package boundary validation
        run: pnpm run boundary:validate:cli

      - name: MCP package boundary validation
        run: pnpm run boundary:validate:mcp
```

- [ ] **Step 3: Verify locally**

Run: `pnpm run boundary:validate:mcp`
Expected: same `OK` output as Task 9 Step 5, now reachable via the root script exactly the way `boundary:validate:cli` already is.

- [ ] **Step 4: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "ci(gates): wire boundary:validate:mcp into CI"
```

**Dependencies:** Task 9 (the script this wires in must exist).

**Completion criteria:** `pnpm run boundary:validate:mcp` succeeds from the repo root; `.github/workflows/ci.yml` contains exactly one new step, placed after the existing CLI boundary step, matching that step's exact `name`/`run` structural shape.

---

### Task 11 — Package README and closeout documentation updates

**Objective:** Add `packages/mcp/README.md` (matching every sibling package's convention of shipping one) and update `ROADMAP.md`/`BLUEPRINT_GAPS.md` to reflect Phase 8's closure — the only documentation changes explicitly justified by the approved spec (its own §12 anticipates this exact update, mirroring the convention used at GAP-027/GAP-028's closure).

**Files:**
- Create: `packages/mcp/README.md`
- Modify: `docs/architecture/ROADMAP.md`
- Modify: `docs/architecture/BLUEPRINT_GAPS.md`

**Interfaces:**
- Consumes: nothing (documentation-only task, final in the plan).
- Produces: nothing (terminal task).

- [ ] **Step 1: Write `packages/mcp/README.md`**

```markdown
# @ultimate/mcp

MCP server exposing Ultimate component metadata and compatibility queries (Phase 8).

## Status

v1 — stdio-transport MCP server, 5 tools: `search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility`. Reads `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` set and `docs/architecture/compatibility-manifest.json` directly. Depends on no other Ultimate package besides `@ultimate/component-metadata` — in particular, has no dependency on `@ultimate/cli`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`, in either direction (see `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` §5.2, enforced by `scripts/provenance/validate-mcp-boundary.mjs`).

## Usage

```bash
npx @ultimate/mcp
```

Runs the server over stdio — intended to be spawned by an MCP-aware AI coding tool, not invoked interactively.

## Scope

See `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` for the full v1 contract, including explicit non-goals (HTTP transport, MCP resources/prompts, usage-examples/theme-token/CLI-discovery tools, and any Phase 9 Skills/LLM-context functionality — none of which this package implements).
```

- [ ] **Step 2: Update `docs/architecture/ROADMAP.md`**

Change the Phase 8 row from `Not started` to `Complete`, and add a footnote matching the exact style of footnotes `[^1]`/`[^2]`/`[^3]` already present for Phases 5/6/7:

```markdown
| 8     | MCP                                                        | Complete [^4] |
```

```markdown
[^4]: `@ultimate/mcp` (`packages/mcp`) ships a stdio-transport MCP server exposing 5 real tools — `search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility` — reading `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` set and `docs/architecture/compatibility-manifest.json` directly, with no dependency on `@ultimate/cli` or any framework package in either direction (enforced by a new `boundary:validate:mcp` CI gate, modeled on Phase 7's `boundary:validate:cli`). Explicitly deferred: HTTP transport, MCP resources/prompts, usage-examples/theme-token/CLI-tooling-discovery tools (no backing schema data exists for any), and populating the reserved `mcpVersionRange` compatibility-manifest axis (remains `@ultimate/cli`'s own future work). See `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` for the full contract.
```

- [ ] **Step 3: Update `docs/architecture/BLUEPRINT_GAPS.md`'s GAP-029 entry**

Modify GAP-029's `**Status:**` line from `MISSING` to `RESOLVED`, and its `**Recommended resolution direction:**` line, matching the exact pattern GAP-027/GAP-028 used at their own closure (see those entries' `Resolved by ... Tasks 1-N ...` phrasing):

```markdown
- **Status:** RESOLVED
```

Add, after the existing `**Source/evidence:**` line for GAP-029:

```markdown
Resolved by Phase 8 MCP implementation plan Tasks 1-8 (`@ultimate/mcp`'s 5 real tools, stdio transport, shared error taxonomy) and Tasks 9-10 (the `boundary:validate:mcp` CI gate proving no dependency on `@ultimate/cli`/`@ultimate/{ng,react,vue,themes}` in either direction).
```

- [ ] **Step 4: Verify the whole-repo build/test suite still passes with all changes in place**

Run: `pnpm install && pnpm run typecheck && pnpm run build && pnpm run test && pnpm run test:scripts`
Expected: all pass, including `packages/mcp`'s own build/test/typecheck via the `-r --if-present` aggregation.

Run: `pnpm run boundary:validate && pnpm run ceiling:validate && pnpm run compatibility-manifest:validate && pnpm run boundary:validate:cli && pnpm run boundary:validate:mcp`
Expected: all pass — confirms `packages/mcp`'s addition did not regress any pre-existing gate, and the new gate itself passes.

- [ ] **Step 5: Commit**

```bash
git add packages/mcp/README.md docs/architecture/ROADMAP.md docs/architecture/BLUEPRINT_GAPS.md
git commit -m "docs(phase-8-mcp): mark Phase 8 complete, resolve GAP-029"
```

**Dependencies:** Tasks 1–10 (this task closes out the whole plan; its verification step exercises everything prior).

**Completion criteria:** Full whole-repo verification (Step 4) passes with zero regressions; `ROADMAP.md` and `BLUEPRINT_GAPS.md` accurately reflect only what was actually built (no overclaiming — explicitly restates the same deferred-scope list this plan's own §1 states, mirroring the discipline Phase 6/7's own closeout footnotes used).

---

## 4. Dependency DAG

```text
Task 1 (scaffold packages/mcp)
  │
  ├──> Task 2 (errors.ts)
  │      │
  │      ├──> Task 3 (search_components, get_component_api)
  │      │
  │      ├──> Task 4 (manifest.ts) ──> Task 6 (check_framework_compatibility)
  │      │
  │      └──> Task 5 (get_component, get_component_accessibility)
  │
  └──────────────────────────────────────────────────────────┐
                                                               │
Task 3 + Task 5 + Task 6 ──────────────────────────────> Task 7 (server.ts, bin.ts)
                                                               │
                                                               ▼
                                                          Task 8 (server tests)

Task 9 (validate-mcp-boundary.mjs)  ── standalone, no code dependency on Tasks 1-8 ──┐
                                                                                       │
                                                                                       ▼
                                                                                  Task 10 (CI wiring)

Task 8 + Task 10 ──> Task 11 (README + ROADMAP/GAPS closeout, full-repo verification)
```

**Independent tasks** (no dependency on each other, may run in parallel): Task 3 and Task 5 (both depend only on Tasks 1–2); Task 9 (depends on nothing — standalone script, though its Step 5 real-repo check is most meaningful once Task 1 has landed).

**Foundational tasks:** Task 1 (package scaffold — everything depends on it, directly or transitively), Task 2 (error taxonomy — every tool task depends on it).

**Dependent integration tasks:** Task 4 (needs Task 2), Task 6 (needs Task 2 + Task 4), Task 7 (needs Task 3 + Task 5 + Task 6 — the true integration point where all 5 tools converge).

**Final verification/CI tasks:** Task 8 (server-level tests, depends on Task 7), Task 10 (CI wiring, depends on Task 9), Task 11 (closeout, depends on everything).

**Acyclic confirmation:** no task's dependency list names a task that appears later in its own dependency chain — Task 1 → {2} → {3,4,5} → {6,7} → {8} and Task 9 → {10} → {11} are two independent chains that only merge at the final Task 11, which depends on both chains' terminal tasks (8 and 10) but neither chain depends on the other's internals.

**Shared-helper single ownership:**
- `errors.ts` (the five-case taxonomy) — owned exclusively by Task 2. Tasks 3, 5, 6, 7 consume it via import; none redefines or duplicates it.
- `manifest.ts`/`manifest-path.ts` (the independent compatibility-manifest reader) — owned exclusively by Task 4. Only Task 6 consumes it; no other task reads the manifest file directly or duplicates this logic.
- `ALL_COMPONENTS` lookup-by-name pattern (`ALL_COMPONENTS.find((c) => c.name === input.name)`) appears in Tasks 3 (get-component-api), 5 (get-component, get-component-accessibility) — this is a 2-line inline expression, not extracted into a shared helper, since extracting a 1-line `Array.prototype.find` call would be premature abstraction (YAGNI) for a pattern this small; each tool file owns its own copy, consistent with `@ultimate/cli`'s own `doctor.ts`/`generate.ts` precedent (Pre-flight research confirms both independently call `ALL_COMPONENTS.find(...)` rather than sharing a helper).

---

## 5. Self-Review

**1. Spec coverage** — every approved-spec requirement maps to a concrete task:
- §5.1 (stdio transport, `bin` entry, tools-only primitive) → Task 1 (package.json `bin`), Task 7 (`StdioServerTransport`), Task 7 (only 5 tools registered, no resources/prompts anywhere in `server.ts`).
- §5.1.1 (stdout/stderr discipline) → Task 7 (`bin.ts`'s only output is `console.error`), Task 8 (automated stdout-discipline tests).
- §5.2 (no CLI dependency, independent manifest read) → Task 4 (`manifest.ts`, no `@ultimate/cli` import), Task 9 (boundary gate specifically checking for the `@ultimate/mcp → @ultimate/cli` edge).
- §4/§4.1 (structured metadata only, five-case error taxonomy) → Task 2 (the taxonomy itself), Tasks 3/5/6 (every tool applies it), Task 8 (server-level error-path tests).
- §7.1 `search_components` (case-insensitive substring, 3 fields, unranked) → Task 3.
- §7.1 `get_component` (exact framework-narrowing rule) → Task 5.
- §7.2 `get_component_api` (exactly-as-recorded, real non-uniform events data) → Task 3.
- §7.2 `get_component_accessibility` (honest degradation) → Task 5.
- §7.4 `check_framework_compatibility` (single-axis only, corrected terminology) → Task 6.
- §7.3 (deferred capabilities — examples, theme/token, CLI-discovery, rich migration tool) → not implemented by any task; Global Constraints and Task 1's scope restatement (§1) state this explicitly. Confirmed no task accidentally adds any of these.
- §8 (package conventions, `@modelcontextprotocol/sdk` dependency) → Task 1.
- §8.1 (new CI boundary gate) → Tasks 9–10.
- §9 (Phase 9 exclusion) → no task touches `packages/ai` or `skills/`; confirmed by direct scan of every task's Files list above.
- §13 formal review's one required correction (real, non-uniform `events[]` data) → directly reflected in Task 3's `get_component_api` implementation and its two contrasting tests (Table populated, Button empty) — the plan does not repeat the spec's original error.

No gap found.

**2. Placeholder scan** — searched every task for "TBD"/"TODO"/"implement later"/"add appropriate error handling"/"similar to Task N without code". One legitimate exception flagged explicitly rather than hidden: Task 8 Step 1's tool-registration test contains an explicit, labeled placeholder for the SDK's exact introspection API call, because the precise method name on `McpServer` for listing registered tools is a real implementation-time lookup against whatever `@modelcontextprotocol/sdk` version Task 1 pins — inventing a specific method name now would risk stating a false API contract as fact (the same discipline the formal spec review demanded of the Phase 8 spec itself). This is flagged, not silently left vague, and Task 8's own completion criteria explicitly forbid marking the task done with the placeholder still in place. No other placeholder-shaped language found.

**3. Type consistency** — cross-checked function names/signatures used across tasks:
- `searchComponents(input: SearchComponentsInput): SearchComponentsResult | McpToolError` — defined Task 3, consumed identically in Task 7's `safeHandler(searchComponents)` and Task 8's stdout-discipline test. Consistent.
- `getComponentApi(input: GetComponentApiInput): GetComponentApiResult | McpToolError` — defined Task 3, consumed identically in Task 7. Consistent.
- `getComponent(input: GetComponentInput): GetComponentResult | McpToolError` — defined Task 5, consumed identically in Task 7 and Task 8. Consistent.
- `getComponentAccessibility(input: GetComponentAccessibilityInput): GetComponentAccessibilityResult | McpToolError` — defined Task 5, consumed identically in Task 7. Consistent.
- `checkFrameworkCompatibility(input: CheckFrameworkCompatibilityInput): CheckFrameworkCompatibilityResult | McpToolError` — defined Task 6, consumed identically in Task 7. Consistent.
- `readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError` — defined Task 4, consumed identically in Task 6. Consistent.
- `McpToolError`, `invalidInputError`/`notFoundError`/`manifestUnreadableError`/`absentFacetError`/`internalError` — defined Task 2 with exact signatures, consumed identically (same parameter counts/types) in Tasks 3, 4, 5, 6, 7. Consistent — no task calls, e.g., `notFoundError(name)` with one argument when Task 2 defines it as `notFoundError(name, knownNames)`.
- `createMcpServer(): McpServer` — defined Task 7, consumed identically in Task 8's test and Task 7's own `bin.ts`. Consistent.

No mismatch found.

**Additional self-review items from the task brief, addressed directly:**

**4. Is every task dependency explicit?** Yes — every task's "Dependencies" line names exact prior task numbers, and §4's DAG restates the same graph independently; both agree.

**5. Is the DAG acyclic?** Yes — confirmed in §4's own "Acyclic confirmation" paragraph; two independent chains (1→2→{3,4,5}→{6,7}→8; 9→10) merge only at the terminal Task 11.

**6. Are shared helpers owned by exactly one task?** Yes — `errors.ts` (Task 2 only), `manifest.ts` (Task 4 only); confirmed no other task redefines either. The one deliberately-not-extracted micro-pattern (`ALL_COMPONENTS.find`) is explicitly justified as YAGNI in §4, matching real `@ultimate/cli` precedent, not an oversight.

**7. Are stdout/stderr protocol-boundary tests covered?** Yes — Task 8's 4 dedicated tests cover server construction, a successful tool call, a failing tool call, and the internal-error path, all asserting zero `process.stdout.write` calls; Task 7 Step 6 additionally provides a manual smoke-test cross-check before Task 8 automates it.

**8. Are all five error categories tested?** Yes, per-category: case 1 (invalid input) — tested in Task 3 (both tools), Task 5 (both tools), Task 6, and Task 2's own unit tests. Case 2 (not found) — Task 3, Task 5 (both tools), Task 2. Case 3 (manifest unreadable) — Task 4's two dedicated failure-mode tests (missing file, malformed JSON) plus Task 2's message-shape test. Case 4 (missing optional facet) — Task 5's `get_component_accessibility` tests (against a real component genuinely lacking the facet) plus Task 2's unit test; Task 3's `get_component_api` documents the code path exists even though no real v1 record currently triggers it (all 8 records have all 3 framework `api` entries per Pre-flight #4). Case 5 (internal error) — Task 2's unit test (no stack-trace/path leakage) plus Task 7's `safeHandler` implementation plus Task 8's dedicated test.

**9. Is the MCP↔CLI dependency prohibition enforced in both directions?** Yes — Task 9's script checks both directions explicitly (Check 1/2 reverse: framework packages never depend on MCP; Check 3/4 forward: MCP never depends on CLI or any framework/themes package), with dedicated tests for the specific `@ultimate/mcp → @ultimate/cli` edge (the one edge the original `validate-cli-boundary.mjs` had no notion of, since MCP didn't exist in Phase 7). Task 4's `manifest.ts` independently avoids the edge at the source level (no `@ultimate/cli` import anywhere), which Task 9's gate then mechanically verifies.

**10. Is runtime source parsing impossible by design and covered by the boundary gate?** Design: every tool (Tasks 3, 5, 6) reads only `ALL_COMPONENTS` (a typed, in-memory import from `@ultimate/component-metadata`) or `readCompatibilityManifest()` (Task 4, a plain JSON file read) — no task anywhere calls `readFileSync`/`readdirSync`/any filesystem or AST-parsing API against `packages/{ng,react,vue}/src/**`, confirmed by reviewing every task's Files/Implementation sections. This is a design property (no task introduces such a call), not itself something Task 9's boundary gate directly checks (that gate checks *dependency declarations and imports*, not *runtime filesystem access patterns* — a deliberate, correctly-scoped distinction: the boundary gate proves the dependency graph is clean, which is what makes runtime source parsing structurally unreachable without also violating that graph, since reading `packages/ng/src/*.ts` at runtime would require either a filesystem path constant unrelated to any import — which no task introduces — or importing framework package internals directly, which Task 9 already forbids).

**11. Is Phase 9 completely excluded?** Yes — no task's Files list touches `packages/ai/` or `skills/`; no task imports, generates, or references any Skills/LLM-context artifact; Global Constraints states this explicitly and Task 11's closeout documentation explicitly restates the deferred-scope list rather than silently expanding it.

**12. Is there any accidental scope expansion?** Checked against the task brief's explicit "Do NOT" list: no code was implemented by *this planning pass* (the plan describes what an implementer does; this document itself created no source file); no production source, `package.json`, tests, or CI config were modified by *writing this plan* (Task 1–11's own file changes are prescribed for the implementation phase, not executed here); no architectural decision was reopened (every task cites the specific approved-spec section it implements, never re-deriving a decision); HTTP transport/MCP resources/MCP prompts/filesystem auto-detection are nowhere in any task; `@ultimate/cli`/`ng`/`react`/`vue`/`themes` dependencies are nowhere in any task's `package.json` content; `@ultimate/component-metadata`/`component-schema` are read-only consumed, never modified by any task; no Phase 9 functionality appears anywhere. No expansion found.

The one flagged item at original write-time (Task 8's SDK-introspection placeholder) is a deliberate, explicitly-labeled implementation-time lookup, not a planning gap, and does not affect any other task's contract. **This self-review section (§5, items 1–12 above) predates the formal Plan Review recorded in §6 below — items 1 ("No gap found") and 3 ("No mismatch found") did not catch Findings 1/2 in §6, since both require cross-referencing real source this self-review pass did not re-verify. §6 documents what an independent review caught and how this plan was corrected in response.**

---

## 6. Formal Plan Review Record

An independent formal Plan Review (a separate reviewing pass, not this plan's own §5 self-review) was performed against this document, the approved spec, the research doc, and the real, closed Phase 6/7 source (`packages/component-metadata`, `packages/component-schema`, `packages/cli`, `scripts/provenance/validate-cli-boundary.mjs`, `docs/architecture/compatibility-manifest.json`, root `package.json`/`pnpm-lock.yaml`/`.github/workflows/ci.yml`).

**Verdict:** REQUEST CHANGES (1 BLOCKING, 2 MAJOR, 3 MINOR, 1 NIT), with the plan's overall structure, DAG, scope discipline, and CI-gate design assessed as sound.

**Findings and disposition — every one independently re-verified against real source before being applied:**

1. **BLOCKING — `packages/mcp/package.json` (Task 1) omitted `@ultimate/component-schema`, which Tasks 3/5's own code directly imports types from** (`EventFact`/`PropFact` in `get-component-api.ts`; `ComponentMetadata` in `get-component.ts`; `AccessibilityFacts` in `get-component-accessibility.ts`). Verified: `@ultimate/component-metadata`'s real `src/index.ts` exports only `ALL_COMPONENTS`, re-exporting nothing from `component-schema` — so the approved spec §8's "accessed transitively through re-exports" framing does not hold. Verified: `@ultimate/cli`'s real `package.json` already declares `@ultimate/component-schema: workspace:*` directly, for the identical reason (`commands/generate.ts` imports from it directly). **Fixed** — Task 1's `package.json`, Global Constraints, Task 7 Step 4, Task 9's boundary-gate test fixture, and every affected Completion Criteria line now declare/expect `@ultimate/component-schema` as a second direct, permitted Ultimate dependency. Not an architectural change — `@ultimate/component-schema` was always a permitted (non-forbidden) dependency under spec §5.1/§5.2; this only corrects how it is declared.
2. **MAJOR — Pre-flight #4 overstated `guidance` facet coverage.** Verified by direct grep: zero real records populate the top-level `ComponentMetadata.guidance: Guidance` facet. Table populates only `accessibility.guidance` (a same-named, structurally distinct string nested inside `AccessibilityFacts`), which the original Pre-flight text conflated with the separate top-level facet. **Fixed** — Pre-flight #4 now states this precisely as two separate facts; Task 5's Completion Criteria no longer claims `guidance` was "verified... against a real record with populated... guidance" (no such record exists) — it now states the `guidance` field is verified only as `undefined === undefined`, which is what the real data actually supports.
3. **MAJOR (implementation-time risk, correctly hedged, now grounded in real evidence) — the plan's original `@modelcontextprotocol/sdk@^1.12.0`/`zod@^3.23.0` version pins were stale relative to evidence already sitting in this repo's own lockfile.** Verified: `pnpm-lock.yaml` already resolves `@modelcontextprotocol/sdk@1.30.0` (a transitive dependency of `@angular/cli`), whose real, installed `package.json` declares `"zod": "^3.25 || ^4.0"` as a required peer dependency, with `zod@4.3.6` already resolved to satisfy it. **Fixed** — Task 1, Task 7 Step 4, Pre-flight #2, and Task 9's test fixture now pin `@modelcontextprotocol/sdk@^1.30.0`/`zod@^3.25.0 || ^4.0.0`, grounded in this real, already-resolved evidence rather than a guess — while still explicitly instructing the implementer to re-verify both via `npm view` at actual implementation time, since npm may publish newer versions between plan-writing and implementation. The review additionally confirmed (by reading the installed SDK's own `.d.ts`) that the plan's `registerTool` usage shape in `server.ts` is correct against the real installed API — only the version numbers needed correction, not the code's structure.
4. **MINOR — Task 3's original `get_component_api` "no API recorded" test didn't exercise the branch it claimed to.** It called `getComponentApi({ name: "Button", framework: "ng" })` — a real, populated pair — and asserted the opposite of a not-recorded result, self-labeled "sanity check only," leaving the `facet_not_recorded` branch genuinely untested. **Fixed** — replaced with two tests: the original real-data sanity check (kept, correctly relabeled) plus a new test using `vi.doMock("@ultimate/component-metadata", ...)` against a synthetic record with no `react`/`ng` api entry, mirroring Task 4's own established module-mocking pattern for exercising a real code path that no real v1 record happens to trigger. Test count updated 6→7 (`get-component-api.test.ts`) and 14→15 (Task 3's combined total) throughout.
5. **MINOR — Task 6's compatibility-scope test contained a dead, self-tautological assertion** (`expect(X).toEqual(cond ? X : X)`, both ternary branches identical). **Fixed** — removed; the real assertion (the `for` loop checking every key is in `["compatible", "reason"]`) was already present directly below it and is unaffected.
6. **MINOR — Task 2's error-tests referenced a `test/errors.test-d.ts` file that no task step ever actually instructed the implementer to create.** **Fixed** — replaced the dangling forward-reference with an accurate explanation: `internalError()`'s zero-argument signature is already enforced by TypeScript itself at every call site during the package's normal `vitest run --typecheck` pass, so no separate `.test-d.ts` file is needed for this specific guarantee.
7. **NIT — Task 3's real-data events tests exercise per-component emptiness (Table populated, Button empty) but not the more subtle per-(component,framework) case** (e.g., Checkbox has `events: []` on `ng` but populated events on `react`/`vue`). Not fixed — noted as a nice-to-have strengthening, not required; the code itself handles this correctly regardless (it reads `api.{framework}.events` directly, with no per-component assumption baked in), and the review confirmed this is a coverage-strength observation, not a correctness defect.

**Also explicitly checked and passed, per the review's mandate:** dependency DAG correctness (every task's actual imports matched its declared dependency list, confirmed acyclic); task granularity (no task requires information from a later task); the one plan-flagged placeholder (Task 8's SDK tool-introspection call) was independently confirmed legitimate — the review read the installed SDK's own `.d.ts` and confirmed `McpServer` genuinely has no public `listTools()`-style method, so deferring this to an implementation-time lookup was the correct call, not a shortcut; CI/boundary-gate correctness (Task 9's script verified as a faithful, correct structural generalization of the real `validate-cli-boundary.mjs`, including matching false-positive-avoiding regex anchoring and test conventions, correctly extended to add the `@ultimate/cli` forbidden-package edge the original script never needed); scope discipline (no HTTP transport, MCP resources/prompts, filesystem auto-detection, schema expansion, or forbidden-package dependency anywhere in any task's actual code, verified directly, not just from task titles).

**No open architectural questions were raised by the review.** Every finding was a plan-text correction (a missing dependency declaration, an imprecise Pre-flight claim, stale-but-appropriately-hedged version numbers, two weak tests) — none reopened, narrowed, or changed any tool contract, dependency-direction decision, transport/primitive-type choice, or any other decision the approved spec already settled.

---

**PHASE 8 IMPLEMENTATION PLAN: DRAFT FOR REVIEW — FORMAL PLAN REVIEW FINDINGS APPLIED**
