# Phase 7 — CLI Implementation Plan

**Status:** Complete — implemented and merged; Phase 7 marked Complete in `docs/architecture/ROADMAP.md` and GAP-028 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`.
**Approved spec:** `docs/superpowers/specs/2026-09-07-phase-7-cli-design.md` (APPROVED)
**Research:** `docs/architecture/research/2026-09-07-phase-7-cli-architecture.md`
**References:** `docs/architecture/BLUEPRINT.md` §6/§19/§20/§34/§40, `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md` GAP-028, `docs/architecture/DECISIONS.md` ADR-008, `packages/component-schema`, `packages/component-metadata`, `.github/workflows/ci.yml`, `scripts/provenance/validate-boundaries.mjs`, `scripts/provenance/validate-dependency-ceiling.mjs`

**This is an implementation plan, not a specification.** No architectural decision is made here that the approved spec did not already make. Where this plan makes a concrete tooling choice the spec left to implementation-time (e.g., which argument-parsing mechanism), the choice and its evidence are stated explicitly in the relevant task, never silently assumed.

---

## 0. Pre-flight findings (repository evidence gathered before authoring this plan)

These facts were confirmed by direct inspection and materially shape the tasks below — stated up front so no task silently assumes something not actually true of the repository:

1. **`docs/architecture/compatibility-manifest.json` does not exist yet.** The approved spec (§6.4) names this as the manifest's location; it has not been created. Task 1 creates it.
2. **No repository package declares a CLI argument-parsing library as a direct dependency.** `commander@14.0.3` appears in `pnpm-lock.yaml` only as a transitive dependency of the root `@changesets/cli` devDependency — it is not available or established as this repo's CLI-argument convention. This plan does not invent a dependency choice; Task 3 states the decision (minimal hand-rolled `process.argv` parsing, no third-party argument-parsing library) and its evidence-based justification, consistent with the spec's own "smallest behavior" principle (§7.2 of the spec) and YAGNI (no library is justified by five flat subcommands with no nested flags).
3. **`scripts/provenance/validate-boundaries.mjs` scans only `packages/uix*`** and **`scripts/provenance/validate-dependency-ceiling.mjs` scans only `packages/{uix,ng,react,vue,themes}*`** (its own `WATCHED_PREFIXES` constant). Neither script currently inspects `packages/cli` at all. This means: (a) `packages/cli` automatically passes both gates today with zero change to either script — nothing needs to be added to make CI's existing `boundary:validate`/`ceiling:validate` steps pass; (b) the dependency-direction guarantee required by spec §5/§11 (`cli → component-metadata`, never `ng/react/vue → cli`) is **not** mechanically enforced by these two scripts for the CLI's own direction and must instead be verified by an explicit test task (Task 9) that inspects `packages/cli`'s own `package.json`/imports and confirms no `packages/{ng,react,vue}` package ever imports `@ultimate/cli`.
4. **CI (`.github/workflows/ci.yml`) runs, in order:** install → lint → format:check → typecheck → build → test → test:scripts → provenance:validate → boundary:validate → ceiling:validate, all via root `pnpm -r --if-present run <script>` aggregation (except the provenance/boundary/ceiling scripts, which are direct `node scripts/...` invocations). `@ultimate/cli` must expose `build`/`test`/`typecheck` scripts matching this aggregation contract (Task 2), and needs no new CI step — the existing steps already cover it once those scripts exist.
5. **Confirmed package shape convention** (`packages/component-schema`, `packages/component-metadata`): `type: "module"`, single `tsup` ESM build (`outExtension` → `.mjs`), `dts: true` plus a `rename-dts.mjs` post-build step (`.d.ts` → `.d.mts`, required because `tsup`'s non-experimental `dts` generator ignores `outExtension().dts` for `"type": "module"` packages), `tsconfig.json` extending `../../tsconfig.base.json`, `vitest.config.ts` with `test.include: ["test/**/*.test.ts"]` and `test.typecheck.include: ["test/**/*.test-d.ts"]`, `workspace:*` internal dependencies, `exports` map with `types`/`import`/`default`. Task 2 follows this exactly, adding only what a shipped executable genuinely requires beyond it (a `bin` field) — per the spec's own §8 instruction, not inventing anything beyond that one addition.
6. **No `apps/cli-fixture`-style test-project precedent exists.** `apps/` currently holds `playground-angular`, `playground-react`, `playground-vue`, `showcase` — real, already-scaffolded example apps, not disposable CLI test fixtures. Task 5/6/7/8's command tests need throwaway target-project fixtures (a minimal existing Angular/React/Vue project directory to run `init`/`add`/`theme`/`doctor`/`generate` against) — these are created as **test fixtures within `packages/cli/test/fixtures/`**, not as new `apps/` playground entries, since they exist solely to be read/written by tests, not run as real apps. This is the smallest mechanism satisfying the test requirement without introducing a new top-level convention.

---

## 1. Scope Restatement (from approved spec, unchanged)

**In v1 (implemented by this plan):**
- `ultimate init` — existing-project-only, never scaffolds new projects (spec §7.1).
- `ultimate add <package>` — installs a specific `@ultimate/*` package via the target project's detected package manager, after a compatibility check (spec §7.1).
- `ultimate theme <preset>` — configures an `@ultimate/themes` preset into the target project (spec §7.1).
- `ultimate doctor` — reports installed/missing/compatibility status for the real 8-component `ALL_COMPONENTS` set only (spec §7.2).
- `ultimate generate <component>` — stdout-only import/usage snippet, never writes/modifies files (spec §7.2).
- `ultimate ai` — stub only: prints a clear "not yet available — Phase 9 not started" message, exits non-zero (spec §7.3).
- The compatibility manifest at `docs/architecture/compatibility-manifest.json`, its shape (spec §6.2/§6.3), and the deterministic multi-axis matching rule (spec §6.5).

**Deferred, not implemented by this plan (unchanged from spec §9):**
- `ultimate create`, `ultimate migrate`, `ultimate update` — absent from the v1 command surface entirely, not even stubbed.
- Any Phase 8 (MCP) or Phase 9 (AI Skills, beyond the `ai` stub) contract or behavior.
- `mcpVersionRange`/`aiSkillsVersionRange` manifest fields — present in the shape (reserved, optional), never populated or evaluated by any v1 logic.
- Metadata for any component beyond the real 8 currently in `@ultimate/component-metadata`'s `ALL_COMPONENTS`.
- Any change to `docs/architecture/COMPATIBILITY.md`.
- Any change to `packages/{ng,react,vue,uix-*,themes,component-schema,component-metadata}` source.
- ROADMAP.md/BLUEPRINT_GAPS.md updates — deferred to the final closeout task (Task 12), gated behind everything else, per the same convention as GAP-014/GAP-027's closure.

---

## 2. Task List

### Task 1 — Author the compatibility manifest data file

**Objective:** Create `docs/architecture/compatibility-manifest.json` at the exact location the approved spec (§6.4) names, populated with real v1 entries for the frameworks/packages that exist today.

**Files/packages affected:** `docs/architecture/compatibility-manifest.json` (new file).

**Implementation scope:**
- A JSON array of `CompatibilityEntry` objects, exactly matching the shape in spec §6.2:
  ```json
  [
    {
      "framework": "angular",
      "frameworkVersionRange": "^21.0.7",
      "ultimateFrameworkPackage": { "name": "@ultimate/ng", "versionRange": "^0.1.0" },
      "uixVersionRange": "^0.1.0",
      "themeVersionRange": "^0.1.0",
      "metadataSchemaVersion": "<exact current SCHEMA_VERSION string from @ultimate/component-schema>",
      "cliVersionRange": "^0.1.0"
    }
    // ...one entry each for "react" and "vue", mirroring COMPATIBILITY.md's existing peer ranges
    // (Angular ^21.0.7, Vue ^3.5.0, React ^17||^18||^19) per docs/architecture/COMPATIBILITY.md
  ]
  ```
- `frameworkVersionRange` values are taken directly from `docs/architecture/COMPATIBILITY.md`'s existing "Peer/framework compatibility" section (Angular `^21.0.7` and up, Vue `^3.5.0` line, React `^17.0.0 || ^18.0.0 || ^19.0.0`) — read, not invented.
- `metadataSchemaVersion` is read from the actual built `@ultimate/component-schema` package's exported `SCHEMA_VERSION` constant at authoring time (exact string copy, per spec §6.2's exact-equality contract) — not guessed.
- `mcpVersionRange`/`aiSkillsVersionRange` are omitted entirely from every entry (optional fields, unpopulated, per spec §6.3) — not present as `null` or empty-string placeholders, since the fields are typed optional and an absent key is the correct "unpopulated" representation.
- Every `versionRange` for axes without an established real Ultimate package version yet (`ultimateFrameworkPackage`, `uixVersionRange`, `themeVersionRange`, `cliVersionRange`) uses each package's actual current `package.json` `"version"` field as a `^`-prefixed range (read directly from `packages/ng/package.json`, `packages/uix-styles/package.json` or equivalent UIX-layer package, `packages/themes/package.json`, and the version this plan's Task 2 assigns `@ultimate/cli`) — never a fabricated version number.

**Tests required:**
- A new test file, `docs/architecture/compatibility-manifest.test.mjs` (Node's built-in test runner, matching `scripts/test:scripts`' existing pattern of `node --test scripts/provenance/*.test.mjs`), asserting: the file is valid JSON; every entry has exactly the keys defined in spec §6.2 plus optionally the two §6.3 reserved keys; `metadataSchemaVersion` in every entry exactly equals the real, currently-installed `@ultimate/component-schema`'s `SCHEMA_VERSION` (imported directly, not hardcoded twice); no entry contains `mcpVersionRange`/`aiSkillsVersionRange` populated with a non-empty value.
- Add this test file's glob to `test:scripts` (root `package.json`) alongside the existing `scripts/provenance/*.test.mjs` pattern, or add a new root script `test:manifest` — whichever keeps the existing `test:scripts` script's own glob scope (`scripts/provenance/*.test.mjs`) unchanged; prefer a new root script `compatibility-manifest:validate` (mirroring the existing `provenance:validate`/`boundary:validate`/`ceiling:validate` naming convention) invoked as its own CI step, added in Task 11.

**Acceptance criteria:**
- `node docs/architecture/compatibility-manifest.test.mjs` (or wherever the test is placed to mirror `scripts/provenance/*.test.mjs`'s convention) passes.
- File contains exactly 3 entries (angular, react, vue) — no more, no fewer, matching the three frameworks that exist today.
- No `packages/cli` code exists yet at this point in the plan; this task produces pure data.

**Dependencies:** None — this task can run first, independently of `packages/cli` existing yet.

---

### Task 2 — Scaffold `packages/cli` package shape

**Objective:** Create `packages/cli`'s `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, and build scripts, following the confirmed repository convention (Pre-flight #5) with the one addition a shipped executable genuinely requires.

**Files/packages affected:** `packages/cli/package.json`, `packages/cli/tsconfig.json`, `packages/cli/tsup.config.ts`, `packages/cli/vitest.config.ts`, `packages/cli/scripts/rename-dts.mjs` (copied verbatim from `packages/component-schema/scripts/rename-dts.mjs` — identical problem, identical fix, no repo evidence for a different mechanism).

**Implementation scope:**
- `package.json`: `"name": "@ultimate/cli"`, `"type": "module"`, `"version": "0.1.0"` (starting version, matching every other Phase 6-era package's initial `0.1.0`), `main`/`module`/`types`/`exports` matching `component-metadata`'s exact pattern, **plus** a `"bin": { "ultimate": "./dist/bin.mjs" }` field — the one confirmed-necessary addition (spec §8) beyond the inherited convention, using Node.js's own standard `bin` mechanism, not a novel one.
- `tsup.config.ts`: two entries — `index` (the library surface: exported functions for testing, e.g. `detectFramework`, `matchCompatibility`, `readAllComponents`) and `bin` (the actual CLI entry with a `#!/usr/bin/env node` shebang, `tsup`'s `banner` option, per its own documented mechanism for shebang injection — no custom scripting needed). `format: ["esm"]`, `outExtension` → `.mjs`, `dts: true` for `index` only (bin has no consumable types), `clean: true`, `splitting: false`.
- `tsconfig.json`: `extends: "../../tsconfig.base.json"`, `outDir: "dist"`, `rootDir: "src"`, `include: ["src"]` — identical to `component-schema`'s.
- `vitest.config.ts`: identical to `component-schema`'s (`test.include`/`test.typecheck.include` pattern) — no deviation, since Phase 7's test needs (unit tests + `.test-d.ts` type tests for the manifest/metadata-consuming types) are structurally the same shape.
- `scripts`: `"build": "tsup && node scripts/rename-dts.mjs"`, `"test": "vitest run --typecheck"`, `"typecheck": "tsc --noEmit"` — matching every existing package's script names exactly (required for `pnpm -r --if-present run <script>` aggregation, per Pre-flight #4).
- `dependencies`: `"@ultimate/component-metadata": "workspace:*"` only — per spec §5, no other Ultimate runtime package as a code dependency.
- `devDependencies`: `@types/node`, `tsup`, `typescript`, `vitest` — matching `component-metadata`'s exact devDependency set, no new library added (Pre-flight #2 — no argument-parsing library is introduced).

**Tests required:** None yet (this task is pure scaffolding — no source exists to test). Task 2's own acceptance is structural.

**Acceptance criteria:**
- `pnpm install` resolves `packages/cli` as a workspace member with no errors.
- `pnpm --filter @ultimate/cli run build` succeeds against a placeholder `src/index.ts` (`export {}`) and `src/bin.ts` (a no-op `console.log("@ultimate/cli placeholder")`) — proving the build pipeline itself works before any real command logic is written.
- `pnpm --filter @ultimate/cli run typecheck` and `test` succeed (trivially, against placeholders).

**Dependencies:** None (independent of Task 1; both can be done in either order, but Task 3+ depends on this task's scaffolding existing).

---

### Task 3 — Argument parsing and command dispatch (TDD)

**Objective:** Implement the CLI's top-level command dispatch (`ultimate <command> [args]`) with no third-party argument-parsing dependency, per Pre-flight #2's evidence-based decision.

**Files/packages affected:** `packages/cli/src/cli.ts` (dispatch logic), `packages/cli/src/bin.ts` (entry point, calls `cli.ts`), `packages/cli/test/cli.test.ts`.

**Implementation scope:**
- A single dispatch function, `runCli(argv: string[]): Promise<number>` (returns an exit code, never calls `process.exit` itself — keeps the function testable without a subprocess, following the same "keep logic testable, isolate I/O" shape implied by `component-metadata/scripts/validate-all.mjs`'s own separation of validation logic from its `process.exit` call site).
- `argv[0]` is the command name (`init`/`add`/`theme`/`doctor`/`generate`/`ai`); everything after is passed through as raw string arguments to the specific command handler (Tasks 5-8) — no flag-parsing library needed because v1's entire command surface (per spec §7) uses only positional arguments (`add <package>`, `generate <component>`, `theme <preset>`) and zero-arg commands (`init`, `doctor`, `ai`). This is the exact "smallest behavior" the spec's own §7.2 principle establishes for `generate`, applied at the dispatch layer.
- An unrecognized command name prints a clear error listing the five real v1 commands (plus `ai`, per spec §7.3) and returns a non-zero exit code — never silently no-ops.
- `bin.ts` is a thin wrapper: `const code = await runCli(process.argv.slice(2)); process.exit(code);` — the only place `process.exit` is called in the entire package, isolating the untestable I/O boundary to one line.

**Tests required (TDD — write first):**
- `runCli(["doctor"])` dispatches to the doctor handler (stub it as a jest/vitest mock or a minimal real handler landing in Task 7, whichever lands first — see dependency note below).
- `runCli(["nonsense"])` returns non-zero and the error message names all real v1 commands.
- `runCli([])` (no command) returns non-zero with a usage message.
- `runCli(["ai"])` dispatches to the stub handler (Task 8).

**Acceptance criteria:**
- All dispatch tests pass under `vitest run --typecheck`.
- No dependency on any argument-parsing library appears in `package.json`.
- `bin.ts` contains exactly one `process.exit` call site.

**Dependencies:** Task 2 (package scaffolding must exist). Tasks 5-8 provide the real handlers this task dispatches to — Task 3 can be implemented against minimal stub handlers first (strict TDD: write the dispatch contract, stub the handlers, then Tasks 5-8 replace stubs with real logic one command at a time), or after Tasks 5-8 land, at the implementer's discretion — either sequencing satisfies this plan, since the dispatch contract itself does not change either way.

---

### Task 4 — Framework detection (TDD)

**Objective:** Implement detection of which framework (Angular/React/Vue) a target project uses, reading only the target project's own `package.json`/config — never guessing beyond what's declared.

**Files/packages affected:** `packages/cli/src/detect-framework.ts`, `packages/cli/test/detect-framework.test.ts`, `packages/cli/test/fixtures/{angular,react,vue,unknown}-project/package.json` (minimal fixture files).

**Implementation scope:**
- `detectFramework(projectDir: string): "angular" | "react" | "vue" | null` — reads `<projectDir>/package.json`'s `dependencies`/`devDependencies`, checking for `@angular/core` (→ `"angular"`), `react` (→ `"react"`), or `vue` (→ `"vue"`). Returns `null` (not a throw) when none is found or the file doesn't exist — callers (Tasks 5-7) are responsible for turning `null` into the appropriate refusal message for their own command's context, keeping this function a pure, reusable detector rather than a command-specific one.
- If more than one framework dependency is present (an unusual but possible fixture), the function returns the first match in a fixed, documented priority order (`angular` → `react` → `vue`) rather than throwing — a deterministic, simple rule; no interactive "ask the user" prompt is implemented in v1 (out of scope — the approved spec's command definitions do not call for interactive prompts, and introducing one would be new scope beyond what §7 defines).

**Tests required (TDD — write first):**
- Returns `"angular"` for a fixture with `@angular/core` in `dependencies`.
- Returns `"react"` for a fixture with `react` in `dependencies`.
- Returns `"vue"` for a fixture with `vue` in `dependencies`.
- Returns `null` for a fixture with none of the three, and for a directory with no `package.json` at all.
- Returns `"angular"` (priority order) for a fixture declaring both `@angular/core` and `react`.

**Acceptance criteria:** All tests pass; function never throws for a missing/malformed `package.json` (catches and returns `null`).

**Dependencies:** Task 2.

---

### Task 5 — `ultimate init` (existing-project-only, real package installation) (TDD)

**Objective:** Implement `init` exactly per spec §7.1: detects framework, validates compatibility (Task 6's resolver), **installs the compatible `@ultimate/*` framework package** into the target project, and initializes Ultimate config — into an **existing** project only. Refuses if no existing framework project is found; never scaffolds one. This corrects the prior draft, which stopped at writing a config file and never performed the "initializes ... Ultimate package installation" step the approved spec requires.

**Files/packages affected:** `packages/cli/src/commands/init.ts`, `packages/cli/src/detect-package-manager.ts` (new — owned by this task, see below), `packages/cli/src/install-package.ts` (new — owned by this task, see below), `packages/cli/test/commands/init.test.ts`, `packages/cli/test/detect-package-manager.test.ts`, `packages/cli/test/install-package.test.ts`, `packages/cli/test/fixtures/{angular,react,vue,empty}-project/`.

**Task 5 owns the shared package-manager/install infrastructure.** `init` is the first v1 command requiring package-manager detection and installation, so this task creates and tests `detectPackageManager` and `installPackage` as standalone, independently-testable modules — not as `init`-private logic. Task 7 (`add`, `theme`) consumes these two modules as an already-built, already-tested dependency; Task 7 does not implement, redefine, or modify them. This removes the prior draft's circular dependency (Task 5 needing Task 7's helper while Task 7 needed Task 5's `init` to land first) by giving the shared infrastructure a single, unambiguous owner sequenced before its first consumer.

**Implementation scope — shared package-manager/install infrastructure (owned here, consumed by Task 7):**
- `detectPackageManager(projectDir: string): "npm" | "yarn" | "pnpm"` — reads for the presence of `pnpm-lock.yaml` → `pnpm`, `yarn.lock` → `yarn`, `package-lock.json` → `npm`, defaulting to `npm` if none is found (npm is the only package manager guaranteed present in any Node.js environment, per npm's own bundling with Node — a defensible default, not an arbitrary one). This is the *consumer* project's package manager (spec §8.1's disambiguation) — wholly independent of this monorepo's own pnpm-only tooling.
- `installPackage(projectDir: string, packageName: string): Promise<{ exitCode: number }>` — resolves the package manager via `detectPackageManager`, then invokes it via `child_process.spawn` (array-form arguments, never `exec`/a shell string — avoids shell-injection risk from an unsanitized package-name argument) with the correct install subcommand per manager (`npm install <pkg>` / `yarn add <pkg>` / `pnpm add <pkg>`), and resolves with the subprocess's real exit code. This single function is the only place any command in `@ultimate/cli` shells out to a package manager.

**Implementation scope — `init` itself (four required steps, each independently testable):**
1. **Detect/validate framework** — call `detectFramework(projectDir)` (Task 4). If `null`, return a non-zero exit code with a message stating that `init` requires an existing, already-scaffolded Angular/React/Vue project (an `angular.json` or a recognizable framework dependency in `package.json`) and that creating a new project is not supported by `init` — pointing to `ultimate create` by name as the (currently deferred, not implemented) command for that need, per spec §7.1's exact boundary text.
2. **Resolve the compatible Ultimate framework package** — call the compatibility resolver (Task 6) against the detected framework's version (read from the target's `package.json`) and the manifest (Task 1). If no entry matches on every populated axis, refuse with a diagnostic naming the failing axis (per spec §6.5) — never proceed to installation. On a match, the resolved `CompatibilityEntry.ultimateFrameworkPackage.name` (e.g. `"@ultimate/ng"`) is the package Step 3 installs — resolved from the manifest, never hardcoded per-framework in `init.ts` itself, so `init` and the manifest never drift independently.
3. **Install the resolved package** — call `installPackage(projectDir, resolvedPackageName)` (the module this same task owns, above) to install the exact package name resolved in Step 2 into the target project. Passes through the subprocess's real exit code; a failed install is `init`'s own failure, not swallowed.
4. **Create/update `ultimate.config.json`** — on successful install, write `{ framework, ultimatePackage: <resolved package name>, themePreset: null }` into the target project root (`themePreset` populated later by `ultimate theme`, Task 7). This file's exact shape remains implementation-detail-level (not a spec-level architectural decision) and is extended additively by `theme` (Task 7), never redesigned.

No additional configuration architecture is introduced beyond this one flat JSON file — per the correction's own instruction not to invent further config structure.

`init` never runs `ng new`, `create-vite`, or any package-manager `create`/`init` scaffolding command on the target's behalf — confirmed absent from this implementation by construction (no such subprocess invocation exists anywhere in `init.ts`) and by test (below).

**Tests required (TDD — write first):**
- `detectPackageManager` (shared infrastructure, tested here since this task owns it): three lockfile-presence cases (`pnpm-lock.yaml`/`yarn.lock`/`package-lock.json`) + the no-lockfile-defaults-to-npm case.
- `installPackage` (shared infrastructure, tested here since this task owns it): spies on `child_process.spawn` and asserts the correct binary/args for each of the three package managers; a subprocess-failure case (mock exit code 1) resolves with that same exit code; asserts `child_process.exec` is never called (array-form-only, no shell).
- Fixture with no `package.json` (or an "empty" fixture dir) → non-zero exit, message names `init`'s existing-project requirement and points to `create`; no compatibility check or install attempted (spy asserts zero `matchCompatibility` and zero `spawn` calls).
- Fixture with `@angular/core` but a framework version outside every manifest entry's `frameworkVersionRange` → non-zero exit, message names the specific failing axis; no install attempted (spy asserts zero `spawn` calls).
- Fixture with `@angular/core` at a version inside the manifest's Angular entry range → exit 0; spy asserts `spawn` was invoked with the resolved `@ultimate/ng` package name and the fixture's detected package manager's install command/args; `ultimate.config.json` is written with `{ "framework": "angular", "ultimatePackage": "@ultimate/ng", "themePreset": null }` only after the spied install call reports success.
- Repeat the success case for react/vue fixtures, asserting the correct `@ultimate/react`/`@ultimate/vue` package name is what gets installed.
- A simulated install failure (mocked `spawn` exit code 1) → `init` returns that same non-zero exit code and does **not** write `ultimate.config.json` (config is only written after a confirmed-successful install, per Step 4's ordering).
- Assert no subprocess/child_process call to `ng new`/`create-vite`/equivalent occurs across every case above (spy on `child_process` and assert zero calls to any `*new*`/`*create*`-named binary) — directly enforces the §4 boundary test's "never scaffolds a new project" rule as an executable assertion, not just a code-review expectation.

**Acceptance criteria:**
- All tests above pass.
- `init` performs all four steps in order for a compatible fixture project: detect → resolve → install (real `spawn` call, asserted by test) → config write.
- `init` never writes `ultimate.config.json` when installation fails or was never attempted.
- A separate, manual (non-automated-test) verification step is available for end-to-end confidence: running the built `bin.mjs`'s `init` command against one of the real, already-existing example apps in `apps/{playground-angular,playground-react,playground-vue}` (not a `packages/cli/test/fixtures/` fixture — fixtures are test-only inputs, never described as "real projects") is a manual smoke-check an implementer may perform before considering Task 5 done, but is not itself a required automated acceptance test.

**Dependencies:** Task 1 (manifest), Task 2, Task 4 (framework detection), Task 6 (compatibility resolver). No dependency on Task 7 — this task owns and implements `detectPackageManager`/`installPackage` itself (above), so Task 7's `add`/`theme` consume this task's output rather than the reverse, eliminating the prior draft's circular dependency between Tasks 5 and 7.

---

### Task 6 — Compatibility resolver: deterministic multi-axis matching (TDD)

**Objective:** Implement the exact rule from spec §6.5, verbatim: a manifest entry matches only when every populated v1 axis applicable to the target project satisfies its declared constraint; no match on any required axis, or no matching entry at all, is a refusal with a diagnostic naming the failing axis.

**Files/packages affected:** `packages/cli/src/compatibility.ts`, `packages/cli/test/compatibility.test.ts`.

**Implementation scope:**
- `matchCompatibility(input: { framework: "angular"|"react"|"vue"; frameworkVersion: string; ultimateFrameworkPackageVersion?: string; uixVersion?: string; themeVersion?: string; metadataSchemaVersion?: string; cliVersion: string }, manifest: CompatibilityEntry[]): { matched: true; entry: CompatibilityEntry } | { matched: false; reason: string }`.
- Uses a semver-range-satisfaction check (Node's built-in `node:module`/no built-in semver exists — evaluate: does the repo already depend on `semver` anywhere transitively suitable for direct use, or is a minimal caret-range comparator sufficient for v1's exact needs (all ranges in Task 1's manifest are simple `^x.y.z` caret ranges)? **Decision, stated explicitly per this plan's own Pre-flight #2 precedent:** implement a minimal caret-range-only comparator (parse `^`/exact/`||`-of-exact forms actually present in `docs/architecture/COMPATIBILITY.md`'s existing three real ranges — `^21.0.7`, `^3.5.0`, `^17.0.0 || ^18.0.0 || ^19.0.0`) rather than adding the `semver` npm package as a new dependency, since v1's manifest (Task 1) contains only these already-known, simple range shapes and no repo package currently depends on `semver` directly. This mirrors Pre-flight #2's same reasoning (no new dependency without repo evidence it's needed) applied to a second candidate library.
- For **every** axis present as a key in `input` (i.e., "populated ... applicable to the target project" per spec §6.5's exact wording): compare against the corresponding manifest entry field using range-satisfaction (all axes except one), or **exact string equality** for `metadataSchemaVersion` specifically (per spec §6.2/§6.4's distinguished contract — this is the one axis never range-compared).
- `mcpVersionRange`/`aiSkillsVersionRange` are never read from `input` and never evaluated, per spec §6.3/§6.5 — confirmed by this function's own type signature not accepting them as input fields at all (a compile-time guarantee, not just a runtime check).
- On no entry satisfying all populated axes: return `{ matched: false, reason: "<names every axis that failed on the closest/first entry, or 'no entry for framework X' if none exists for the framework at all>" }`.

**Tests required (TDD — write first):**
- All-axes-match case → `matched: true`.
- Framework-version-range mismatch only → `matched: false`, reason names `frameworkVersionRange`.
- `metadataSchemaVersion` exact-mismatch (e.g., manifest has `"1.0.0"`, input has `"1.0.1"`) → `matched: false`, reason explicitly distinguishes this as an exact-match failure, not a range failure — a directly executable assertion of spec §6.2's distinguished contract.
- `metadataSchemaVersion` range-like input (e.g., `"^1.0.0"`) is never treated as a range — test asserts it's compared as a literal string, so `"^1.0.0" !== "1.0.0"` correctly fails even though it would "satisfy" a caret-range check — proving the two comparison paths are genuinely different code paths, not the same comparator reused by accident.
- Omitting an optional input axis (e.g., no `themeVersion` supplied) is treated as "not applicable to the target project" per spec §6.5's own "applicable" qualifier — that axis is skipped, not treated as a failure — test asserts a match still succeeds when only `framework`/`frameworkVersion`/`cliVersion` are supplied and every other optional axis is omitted.
- No entry exists for the given `framework` at all → `matched: false`, reason states no entry exists for that framework.

**Acceptance criteria:** All tests pass; function signature has no `mcpVersionRange`/`aiSkillsVersionRange` input fields (compile-time enforced).

**Dependencies:** Task 1 (needs the manifest's real shape to test against, though tests may construct in-memory fixture entries directly rather than reading the real file).

---

### Task 7 — `ultimate add`, `ultimate theme`, `ultimate doctor` (TDD)

**Objective:** Implement the remaining core-orchestration and metadata-aware commands per spec §7.1/§7.2.

**Files/packages affected:** `packages/cli/src/commands/{add,theme,doctor}.ts`, `packages/cli/test/commands/{add,theme,doctor}.test.ts`. This task creates no new shared infrastructure module — `detectPackageManager`/`installPackage` are already implemented and tested by Task 5, which this task consumes as a plain import (`packages/cli/src/detect-package-manager.ts`, `packages/cli/src/install-package.ts`). This is a deliberate, one-directional consumption: Task 7 depends on Task 5's shared-infrastructure output; Task 5 has no dependency on Task 7 in return (see Task 5's own Dependencies line).

**Implementation scope — `ultimate add <package>`:**
- Runs `detectFramework` + `matchCompatibility` (Tasks 4/6) first, refusing exactly as `init` does (Task 5) on any mismatch.
- On match: calls `installPackage` (imported from Task 5's module, not reimplemented) with the named `@ultimate/*` package.
- Passes through `installPackage`'s exit code as `add`'s own exit code — never swallows a failed install as a false success.

**Implementation scope — `ultimate theme <preset>` (real integration, not metadata-only):**

Confirmed repository evidence (`packages/themes/README.md`, `packages/themes/package.json`): `@ultimate/themes` today ships **exactly one preset**, `auraPreset`, and a single framework-agnostic entry point, `applyUltimateTheme(options?)`, that every `*-core` package's style registration already reads from via `uix-styled`'s `Theme` singleton — there is no per-framework theming path and no multi-preset registry anywhere in the real package. `theme <preset>`'s v1 implementation is grounded in exactly this reality, not an invented preset system:

1. **Preset validation/resolution** — the only currently-valid preset name is the literal string `"aura"` (case-sensitive), mapping directly to `@ultimate/themes`'s real, sole exported `auraPreset`. `theme`'s valid-preset list is a single-element constant (`["aura"]`), read from one place so it does not silently drift if a second preset is ever added to `@ultimate/themes` later — but v1 does not invent a preset-discovery mechanism, since only one preset exists to discover.
2. **Compatibility check** — runs `detectFramework` + `matchCompatibility` (Tasks 4/6) first, same refusal behavior as `init`/`add`, before doing anything else.
3. **Package installation, if needed** — checks whether `@ultimate/themes` is already present in the target project's `package.json` dependencies; if absent, installs it using `installPackage` (imported from Task 5's module, not reimplemented — same `child_process.spawn`, array-form arguments, no shell). If already present, no reinstall is attempted.
4. **Project configuration modified** — on a valid, resolvable preset name: (a) updates `ultimate.config.json` (the same file `init`, Task 5, creates) setting `themePreset: "aura"`; (b) writes (creating if absent, or inserting if the file exists and does not already contain the call) a minimal theme-entry snippet — `import { applyUltimateTheme } from "@ultimate/themes";\napplyUltimateTheme();` — into a single, fixed, spec-permitted location: a new file at the target project root, `ultimate-theme.ts` (or `.js` if the target project has no TypeScript config, detected via presence/absence of a root `tsconfig.json` in the target project). This is a **new, dedicated file this command creates**, never an edit to an existing arbitrary application entry file (`main.ts`/`index.tsx`/etc.) — avoiding exactly the file-injection/AST/insertion-point architecture the approved correction explicitly forbids inventing, while still being a real, concrete, testable configuration change (not merely a config-value write). `theme`'s own stdout output additionally prints one line instructing the developer to import `./ultimate-theme` once, before mounting any Ultimate component (mirroring the real README's own "call this once, before mounting" usage instruction) — since Task 5/7's boundary test (§4) permits writing config/source files the target ecosystem already understands, but does not extend to auto-wiring that import into the target's actual bootstrap file, which would require framework-specific AST editing (Angular `main.ts` vs. React `index.tsx` vs. Vue `main.ts`) squarely outside the orchestrator boundary.
5. **Unknown preset name** — any value other than `"aura"` is refused with a non-zero exit and a clear message naming the exact one valid preset (`"aura"`) — no partial write of any kind occurs (neither `ultimate.config.json` nor `ultimate-theme.ts` is touched on this path).
6. Does not compile CSS itself (spec §7.1) — confirmed by construction: no CSS/Sass processing code exists in `theme.ts`; `applyUltimateTheme()` (a real, already-shipped function) owns that entirely, per its own README.

**Testing (folded into the shared "Tests required" list below):** unknown-preset refusal (no file writes); known-preset success with `@ultimate/themes` already present (no install attempted, both files written/updated correctly); known-preset success with `@ultimate/themes` absent (install attempted via `installPackage`, then both files written); re-running `theme aura` a second time does not duplicate the `applyUltimateTheme()` call inside `ultimate-theme.ts` (idempotent write, checked by string-presence before insertion).

**Implementation scope — `ultimate doctor`:**
- Reads `ALL_COMPONENTS` from `@ultimate/component-metadata` directly (real import, no fabrication — spec §7.2, Task requirement #11).
- Detects the target framework (Task 4).
- For each of the exactly 8 records in `ALL_COMPONENTS`: checks whether the corresponding `packages.<framework>.packageName` appears in the target project's `package.json` dependencies (installed/missing), and runs `matchCompatibility` (Task 6) for a compatibility status line.
- Output (stdout) is a per-component report table/list; explicitly prints a closing line stating the exact count "8 of 8 known components reported" (or similar), never implying broader coverage exists — a direct, testable assertion of spec §7.2's "report exactly what `ALL_COMPONENTS` contains, nothing implied beyond it."

**Tests required (TDD — write first).** `detectPackageManager`/`installPackage` are not re-tested here — they are Task 5's own tested output, consumed by this task's tests via mocking/spying only, never re-implemented or re-verified:
- `add`: compatibility-refusal case (spy confirms zero calls to `installPackage`/`spawn`); success case asserts `installPackage` was called with the named package; a failure case propagates `installPackage`'s non-zero exit code as `add`'s own.
- `theme`: (a) unknown preset name (e.g. `"material"`) → non-zero exit, message names `"aura"` as the only valid preset, and asserts zero writes to both `ultimate.config.json` and `ultimate-theme.ts`; (b) known preset (`"aura"`) with `@ultimate/themes` already in the fixture's `package.json` → exit 0, `installPackage`/`spawn` never called, `ultimate.config.json` updated with `themePreset: "aura"`, and `ultimate-theme.ts` created containing the `applyUltimateTheme` import + call; (c) known preset with `@ultimate/themes` absent from the fixture → `installPackage` is called with `"@ultimate/themes"` before either file is written; (d) running `theme aura` twice against the same fixture leaves exactly one `applyUltimateTheme()` call in `ultimate-theme.ts` (idempotency, per Task 7's theme description above).
- `doctor`: with a fixture project having 3 of the 8 components' packages "installed" (present in fixture `package.json`) and 5 missing, asserts the report correctly lists 3 installed / 5 missing, and the closing line reads exactly "8 of 8 known components reported" (or the plan's chosen exact phrasing) — never "8 of ~115" or any inventory-wide number.

**Acceptance criteria:** All tests pass; `add`/`theme`'s calls into `installPackage` are exclusively via that module's real exported function (imported, not duplicated) — verified by test (spying on the imported `installPackage`, not on a second, task-local reimplementation); `theme` never writes any file when the preset name is invalid.

**Dependencies:** Task 1, Task 2, Task 4, Task 6, **Task 5** (consumes the `detectPackageManager`/`installPackage` modules and the `ultimate.config.json` shape Task 5 already implements and tests). This dependency is one-directional: Task 7 depends on Task 5's output; Task 5 has no dependency on Task 7 (confirmed in Task 5's own Dependencies line) — the prior draft's circular Task 5 ↔ Task 7 relationship is resolved by this single-owner arrangement.

---

### Task 8 — `ultimate generate` (stdout-only) and `ultimate ai` (stub) (TDD)

**Objective:** Implement `generate` exactly per spec §7.2 (stdout-only, real metadata, 8-component ceiling enforced) and `ai`'s stub per spec §7.3.

**Files/packages affected:** `packages/cli/src/commands/{generate,ai}.ts`, `packages/cli/test/commands/{generate,ai}.test.ts`.

**Implementation scope — `ultimate generate <component>`:**
- Detects the target framework (Task 4) — refuses if undetectable (needed to know which framework's `api`/`packages` sub-record to print).
- Looks up the named component in `ALL_COMPONENTS` (`@ultimate/component-metadata`) by exact, case-sensitive `name` match (matching the schema's own duplicate-identity rule, per Phase 6 spec §13).
- If not found: prints an error to stderr naming the exact 8 real component names currently available (read from `ALL_COMPONENTS.map(c => c.name)`, never a hardcoded list that could drift) and returns non-zero — the message explicitly states the 8-component ceiling, e.g. "Component 'X' is not yet in the metadata proof set. Available: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip."
- If found: prints to **stdout only** — an import line built from `packages.<framework>.packageName`, and a minimal usage snippet built from `api.<framework>.props` filtering to `required: true` props only (keeps the example minimal and real, never inventing example prop values beyond what a `required`/`type` fact justifies — a placeholder value per type, e.g. `""` for `string`, `false` for `boolean`).
- **No filesystem write of any kind occurs in this command's implementation** — enforced both by code review (no `fs.writeFile`/`fs.write*` import in `generate.ts` at all) and by an executable test (spy on every `fs` write function and assert zero calls across a successful `generate` run).

**Implementation scope — `ultimate ai`:**
- Unconditionally prints "not yet available — Phase 9 (AI Skills) is not started" (or the plan's exact chosen wording, matching spec §7.3's required phrasing) to stderr and returns a non-zero exit code — no argument parsing, no partial behavior, regardless of what follows `ai` on the command line.

**Tests required (TDD — write first):**
- `generate("Button")` for a react-detected fixture → stdout contains an import from the real `packages.react.packageName` value and a snippet referencing only `required: true` props from `api.react.props`; exit code 0.
- `generate("NotAComponent")` → stderr names all 8 real component names (read from the real `ALL_COMPONENTS`, not a hardcoded test-side list, so the test breaks visibly if the proof set ever changes without this task's message being updated); exit code non-zero.
- Filesystem-write spy test: zero write calls across both the success and failure paths.
- `ai` (any input) → stderr contains the required phrasing, exit code non-zero, in a single unconditional test — no branching behavior to test since none exists.

**Acceptance criteria:** All tests pass; `generate.ts`/`ai.ts` contain no import of any `fs` write function.

**Dependencies:** Task 2, Task 4 (generate only; `ai` has no dependency beyond Task 2/3's dispatch).

---

### Task 9 — Dependency-direction boundary verification, both directions (verification-only)

**Objective:** Provide an explicit, executable test proving the spec's required dependency direction holds in **both** directions — since Pre-flight #3 confirmed the existing `boundary:validate`/`ceiling:validate` scripts do not inspect `packages/cli` at all and so cannot be relied on to catch a violation here:

- **Reverse direction (unchanged from the prior draft):** `packages/{ng,react,vue}` must never import `@ultimate/cli`.
- **Forward direction (strengthened per this correction):** `@ultimate/cli` must never depend on or import `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes` — the full runtime-package set named by the approved spec (§5's "no other Ultimate runtime package as a *code* dependency", generalized here to explicitly include `themes`, which the prior draft's check did not name).

**Files/packages affected:** `scripts/provenance/validate-cli-boundary.mjs` (new script, modeled directly on the existing `validate-boundaries.mjs`'s own structure — same `fail`/`pass` helper pattern, same file-walk approach), a matching `.test.mjs` self-test (mirroring `test:scripts`' existing convention), root `package.json` (adds one new script entry).

**Implementation scope — four checks, all in one script:**
1. **Reverse-direction, source imports:** walks `packages/{ng,react,vue}*/src/**/*.{ts,tsx,js,jsx,mjs,cjs}` (excluding `dist`/`node_modules`, matching `validate-boundaries.mjs`'s own exclusion pattern) and fails if any file imports `@ultimate/cli` in any form (`from "@ultimate/cli"`, `require("@ultimate/cli")`, dynamic `import("@ultimate/cli")`).
2. **Reverse-direction, package.json:** reads every `packages/{ng,react,vue}*/package.json`'s `dependencies` (not `devDependencies` — a dev-only reference, e.g. for cross-framework testing as `@ultimate/themes` itself already does with `@ultimate/react`/`@ultimate/vue`, is not a runtime dependency and is out of this check's scope) and fails if `@ultimate/cli` appears there.
3. **Forward-direction, package.json:** reads `packages/cli/package.json`'s own `dependencies` **and** `devDependencies` and fails if either lists any of `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes` — directly enforcing the corrected requirement that `@ultimate/cli` must not depend on the framework runtime packages or the themes runtime, in any dependency field.
4. **Forward-direction, source imports:** walks `packages/cli/src/**/*.{ts,tsx,js,jsx,mjs,cjs}` and fails if any file imports `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes` in any form (static `from "..."`, `require(...)`, or dynamic `import(...)`) — this is the check that specifically catches a violation a `package.json`-only check (#3) would miss, e.g. a stray import resolved through a transitive path or a copy-pasted reference that was never added to `package.json` at all.

All four checks run from one script (not four separate scripts) since they are one cohesive "CLI dependency-direction" concern, distinct from the existing `validate-boundaries.mjs`'s own separate `packages/uix*`-only concern (per Pre-flight #3, unchanged from the prior draft's reasoning for keeping this a sibling script rather than widening the existing one).

Named `boundary:validate:cli` in root `package.json`, run as its own step (added in Task 11) — deliberately not merged into the existing `boundary:validate` script, for the same reason as before: that script's own docstring and scope are explicitly `packages/uix*`-only, and widening its purpose would be an unrequested change to an already-shipped, working script.

**Tests required:** The script's own `.test.mjs` self-test (per `test:scripts`' existing convention) covering, for each of the four checks above, both a passing case (current real repo state, zero violations) and a synthetic-fixture failing case: (1) a planted `@ultimate/cli` source import inside a temp `packages/ng`-shaped fixture; (2) a planted `@ultimate/cli` entry in a temp `packages/react`-shaped `package.json`'s `dependencies`; (3) a planted `@ultimate/themes` entry in a temp `packages/cli`-shaped `package.json`'s `dependencies` **and**, separately, one planted in `devDependencies` (proving both fields are checked, per the correction's explicit instruction to check "dependencies/devDependencies"); (4) a planted `@ultimate/vue` source import inside a temp `packages/cli`-shaped fixture's `src/`. Each of these four synthetic cases must independently cause the script to fail — a test asserting all four together is not sufficient, since it would not prove which specific check caught which specific violation.

**Acceptance criteria:** `node scripts/provenance/validate-cli-boundary.mjs` passes against the real repository state once Tasks 1-8 land; its self-test passes independent of the real repo's current state and independently exercises all four checks (8 total self-test cases: 4 passing + 4 failing).

**Dependencies:** Task 2 (needs `packages/cli/package.json` to exist to check against) — logically this task could run any time after Task 2, but is sequenced last among the "verification-only" tasks since it is a cross-cutting gate over everything the earlier tasks produced.

---

### Task 10 — Orchestrator/build-tool boundary verification (verification-only)

**Objective:** Provide an explicit, executable check that no command implementation (Tasks 5-8) crosses the §4 boundary test into build-tool-replacement territory — since this is a design property the spec itself defines as a checkable rule, not something the existing CI gates verify automatically.

**Files/packages affected:** `packages/cli/test/boundary.test.ts` (new test file, lives inside `packages/cli`'s own test suite rather than the root `scripts/` gates, since this check is specific to this one package's source, not a cross-package repository invariant like Task 9's).

**Implementation scope:**
- A single test that greps (via Node's `fs`, not a shell `grep` subprocess — keeps the test hermetic and cross-platform) every `.ts` file under `packages/cli/src/` for import statements matching any bundler/compiler-class package name that would indicate build-tool-replacement behavior: `@angular/compiler`, `@babel/core`, `vite`, `webpack`, `rollup`, `esbuild` (excluding `tsup`'s own devDependency-only usage in config files, which the test explicitly scopes out by only scanning `src/`, never `tsup.config.ts`) — asserting zero matches.
- A second assertion: every command handler (Tasks 5-8) that invokes a subprocess (`add`'s package-manager install; nothing else in v1 shells out) uses `child_process.spawn`/`spawnSync` exclusively — greps for `child_process.exec(` (the shell-interpreting variant) across `src/` and asserts zero matches, directly enforcing the injection-safety rule stated in Task 7.

**Tests required:** This task *is* the test — no further sub-tests needed beyond what's described above.

**Acceptance criteria:** The test passes against the real `packages/cli/src/` tree once Tasks 2-8 land.

**Dependencies:** Tasks 2-8 (scans their real output).

---

### Task 11 — CI wiring for new gates

**Objective:** Add the two new root-level validation scripts (Task 1's manifest validator, Task 9's CLI-boundary validator) to CI, following the exact existing pattern (`provenance:validate`/`boundary:validate`/`ceiling:validate`) — no new CI *mechanism*, only new steps using the established one.

**Files/packages affected:** root `package.json` (two new script entries), `.github/workflows/ci.yml` (two new steps).

**Implementation scope:**
- root `package.json` scripts: `"compatibility-manifest:validate": "node docs/architecture/compatibility-manifest.test.mjs"` (or wherever Task 1 placed it) and `"boundary:validate:cli": "node scripts/provenance/validate-cli-boundary.mjs"`.
- `.github/workflows/ci.yml`: two new steps added after the existing `Prime dependency-ceiling validation` step, named `Compatibility manifest validation` and `CLI package boundary validation`, each a one-line `run: pnpm run <script>` — matching the existing steps' exact style (Pre-flight #4).
- No change to any existing step, script, or step ordering before these two new steps — purely additive.

**Tests required:** None beyond what Tasks 1/9 already specify — this task is wiring, verified by CI itself running green (Task 12's gate).

**Acceptance criteria:** A local `act`/manual dry-run (or simply running each new `pnpm run` script directly, per the existing convention of `pnpm run provenance:validate -- --base-ref origin/main` etc.) succeeds; the workflow YAML is valid (no syntax errors — checked by GitHub's own Actions YAML validation on push, or `yamllint` if available locally).

**Dependencies:** Task 1, Task 9.

---

### Task 12 — Full-suite verification, then documentation/GAP-028 closeout (gated, final)

**Objective:** Run every existing and new gate end-to-end against the complete Phase 7 implementation, then — only after everything is green — update `ROADMAP.md` and `BLUEPRINT_GAPS.md` to reflect GAP-028's closure, mirroring exactly the closeout pattern used for GAP-014/GAP-027 at their respective milestones.

**Files/packages affected:** `docs/architecture/ROADMAP.md`, `docs/architecture/BLUEPRINT_GAPS.md`. (No other file — this task is documentation-only.)

**Implementation scope — verification (must all pass before any doc edit is made):**
- `pnpm install`
- `pnpm run lint`
- `pnpm run format:check`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test` (covers every Task 2-10 test file via `pnpm -r --if-present run test`)
- `pnpm run test:scripts`
- `pnpm run provenance:validate -- --base-ref origin/main`
- `pnpm run boundary:validate`
- `pnpm run ceiling:validate`
- `pnpm run compatibility-manifest:validate` (Task 11)
- `pnpm run boundary:validate:cli` (Task 11)

**Implementation scope — documentation closeout (only after every command above exits 0):**
- `docs/architecture/ROADMAP.md`: change Phase 7's row from `Not started` to `Complete`, with a footnote (matching the existing `[^1]`/`[^2]` convention already used for Phases 5/6) stating the exact v1 scope actually shipped — the five real commands plus the `ai` stub, and the manifest's real scope: **three frameworks / six evaluated axes** (framework version, Ultimate framework package version, UIX version, theme version, exact metadata schema version, CLI version) **+ two reserved, unpopulated axes** (MCP, AI/Skills — excluded from all v1 compatibility evaluation, per spec §6.3/§6.5) — and explicitly naming that `create`/`migrate`/`update` remain unimplemented and metadata coverage remains the same real 8-component proof set (not expanded by Phase 7).
- `docs/architecture/BLUEPRINT_GAPS.md`: mark GAP-028 resolved, following GAP-027's own closure-entry format (a short "Resolved — see `docs/superpowers/plans/2026-09-07-phase-7-cli-implementation.md`" note, consistent with how the repository already records closure pointers rather than deleting the original gap analysis text).

**Tests required:** None (this task validates via the command list above, not new test files).

**Acceptance criteria:** Every command in the verification list exits 0; both documentation files are updated consistently with each other and with the real, as-implemented scope (never overclaiming what Tasks 1-11 actually built).

**Dependencies:** Tasks 1-11, all complete and green.

---

## 3. Task Summary Table

| # | Task | Type | Depends on |
|---|---|---|---|
| 1 | Compatibility manifest data file | Implementation + tests | — |
| 2 | `packages/cli` scaffolding | Implementation | — |
| 3 | Argument parsing / dispatch | Implementation + TDD | 2 |
| 4 | Framework detection | Implementation + TDD | 2 |
| 5 | `ultimate init` (real package install; owns shared `detectPackageManager`/`installPackage`) | Implementation + TDD | 1, 2, 4, 6 |
| 6 | Compatibility resolver (multi-axis rule) | Implementation + TDD | 1 |
| 7 | `ultimate add` / `theme` / `doctor` (consumes Task 5's shared install helper) | Implementation + TDD | 1, 2, 4, 5, 6 |
| 8 | `ultimate generate` / `ai` stub | Implementation + TDD | 2, 4 |
| 9 | Dependency-direction boundary check (both directions) | Verification-only | 2 |
| 10 | Orchestrator/build-tool boundary check | Verification-only | 2–8 |
| 11 | CI wiring | Implementation (wiring) | 1, 9 |
| 12 | Full verification + doc/GAP-028 closeout | Verification + final documentation | 1–11 |

---

## 4. Spec-Requirement Traceability Matrix

Every normative statement in the approved spec, mapped to the task(s) implementing/verifying it:

| Spec section | Requirement | Task(s) |
|---|---|---|
| §3 | CLI responsibilities (detect framework, invoke tooling, install packages, resolve theme, diagnose, validate compatibility) | 4, 5, 6, 7 |
| §4 | Orchestrator/build-tool boundary test | 5 (subprocess-absence-for-scaffolding test), 7 (`spawn`-only install), 10 |
| §5 | `cli → component-metadata` dependency, no other runtime package (`ng`/`react`/`vue`/`themes`) as a code dependency | 2 (deps list), 9 (both directions, `dependencies` + `devDependencies` + source imports) |
| §6.1 | Eight compatibility axes named | 1, 6 |
| §6.2 | `CompatibilityEntry` shape, `metadataSchemaVersion` no-`Range`-suffix distinction | 1, 6 |
| §6.3 | MCP/AI-Skills axes reserved, unpopulated, unevaluated | 1 (omitted from data), 6 (excluded from function signature) |
| §6.4 | Manifest at `docs/architecture/compatibility-manifest.json`, JSON array, owned by CLI workstream, consumed by `@ultimate/cli` | 1 |
| §6.5 | Deterministic multi-axis matching rule, exact-match for `metadataSchemaVersion`, refuse on any populated-axis mismatch | 6 |
| §7.1 | `init` existing-project-only, never scaffolds, installs the compatible Ultimate framework package | 5 |
| §7.1 | `add` — package manager invocation after compatibility check | 7 |
| §7.1 | `theme` — real `@ultimate/themes` preset resolution/config/entry-file, install if absent, unknown-preset refusal, no CSS compilation | 7 |
| §7.2 | `doctor` — exact 8-component ceiling, no overclaiming | 7 |
| §7.2 | `generate` — stdout-only, real metadata, refuses unknown components | 8 |
| §7.2 | `create` deferred | 5 (refusal message names it), not implemented (correctly absent) |
| §7.3 | `ai` stub — clear message, non-zero exit | 8 |
| §7.3 | `migrate`/`update` absent entirely | Not implemented (correctly absent from all tasks) |
| §8 | Package conventions (ESM/tsup/vitest/`workspace:*`), `bin` field addition | 2 |
| §8.1 | Package-manager detection is for consumer projects, distinct from monorepo's own pnpm | 7 |
| §9 | All explicit deferrals preserved | Confirmed absent throughout — no task implements `create`/`migrate`/`update`/MCP/AI-Skills-beyond-stub/broader metadata |

---

## 5. Plan Self-Review Against the Approved Specification (re-run after correction pass)

The approved specification (`docs/superpowers/specs/2026-09-07-phase-7-cli-design.md`) was re-read in full before this re-review, with particular attention to §4 (boundary test), §5 (dependency direction), §6.1-§6.5 (manifest/axes/matching rule), and §7.1 (`init`/`add`/`theme` exact wording), since those are the sections the correction pass touched.

1. **Does every spec normative requirement map to a task, including the corrected ones?** Yes — §4's traceability matrix (updated) covers §3 through §9 exhaustively; the §7.1 row now names `init`'s real package installation and `theme`'s real preset/config/entry-file behavior explicitly, matching the corrected Tasks 5/7.
2. **Is v1 scope preserved exactly (no silent broadening)?** Yes — the correction pass added *depth* to `init`/`theme` (real installation, real preset config) and *breadth* to Task 9's boundary check (both directions), but added no new command, no new package, and no `create`/`migrate`/`update`/MCP/AI-Skills/LLM-contract behavior anywhere. `create` still appears only as a name in `init`'s refusal message and the ROADMAP footnote (Task 12), never as implemented behavior.
3. **Does `init` now genuinely implement "initializes ... Ultimate package installation," not just a config stub?** Yes — Task 5 is now a four-step sequence (detect → resolve → install via the shared `installPackage` helper → config write), with a dedicated test for each step including an install-failure case that proves the config file is never written on a failed install.
4. **Does `theme` now genuinely configure the real `@ultimate/themes` preset, not just a metadata-only config value?** Yes — Task 7's `theme` section is grounded directly in the real, confirmed `@ultimate/themes` package shape (one preset, `auraPreset`; one entry point, `applyUltimateTheme()`) rather than an invented multi-preset system: it validates against the one real preset name, installs the package if absent (reusing Task 5's shared helper), writes a real, dedicated entry file that calls the real `applyUltimateTheme()` function, and updates `ultimate.config.json` — four concrete, testable behaviors, not an ambiguous "config write."
5. **Was a new theme abstraction or runtime architecture avoided while still being concrete?** Yes — `theme`'s entry-file mechanism creates one new file at a fixed location using the package's own already-shipped, real API; it does not invent a preset registry, a plugin system, or any AST-based injection into the target's existing bootstrap file (explicitly ruled out as outside the orchestrator boundary, §4).
6. **Is the multi-axis compatibility rule unchanged and still correctly tested?** Yes — Task 6 is untouched by this correction pass (the review did not flag it); its test suite still covers the full axis set and the `metadataSchemaVersion` exact-vs-range distinction.
7. **Is `init` strictly existing-project-only, still?** Yes — unchanged by the correction (Task 5's Step 1 and its "never runs `ng new`/`create-vite`" test are preserved verbatim in the corrected task), and the fixture/real-project wording contradiction flagged by the review is now resolved: Task 5's acceptance criteria explicitly distinguishes `packages/cli/test/fixtures/` (test-only fixtures) from a separate, manual smoke-check against the real, already-existing `apps/{playground-angular,playground-react,playground-vue}` example apps — never conflating the two.
8. **Is `generate` still strictly stdout-only?** Yes — untouched by this correction pass; Task 8 is unchanged.
9. **Is the CLI dependency-direction boundary check now genuinely bidirectional and complete, per the correction's exact instruction?** Yes — Task 9 now runs four checks in one script: reverse-direction source imports and `package.json` `dependencies` (unchanged from the prior draft), plus forward-direction `package.json` `dependencies`+`devDependencies` (both fields, as the correction explicitly required) and forward-direction source imports under `packages/cli/src/**` — covering all four of `@ultimate/ng`/`react`/`vue`/`themes` in both the manifest-declaration and actual-import-statement sense, so a violation that only shows up as a stray import (never declared in `package.json`) is still caught.
10. **Is the orchestrator/build-tool boundary still preserved as a checkable constraint?** Yes — Task 10 is unchanged by this correction pass; `theme`'s new install-if-absent step still uses the same `installPackage` helper Task 10 already checks for `spawn`-only usage, so no new subprocess-invocation surface was introduced outside what Task 10 already covers.
11. **Is `@ultimate/component-metadata` still used as the real source, with no fabricated coverage beyond 8 components?** Yes — unaffected by this correction pass; Tasks 5/7/8 are the only metadata-touching tasks and none of the corrections altered their metadata-reading logic.
12. **Are repository conventions still followed, with no blind copying?** Yes — the `theme` correction specifically avoided blind invention by grounding every behavior in the real `packages/themes/README.md`/`package.json` content (one preset, one entry point) rather than assuming a generic multi-preset CLI pattern from outside this repository.
13. **Is a second CLI package or new architectural layer still avoided?** Yes — the shared `installPackage`/`detectPackageManager` helpers, now owned by Task 5, live inside `packages/cli/src/` as plain modules, not a new package; `theme`'s new entry-file mechanism is a file this command writes into the *target* project, not a new file or package inside the Ultimate monorepo itself.
14. **Is `COMPATIBILITY.md` still left unmodified, and is the compatibility manifest still not broadened beyond v1 scope?** Yes — no task touches `COMPATIBILITY.md`; Task 1's manifest shape is unchanged by this correction pass (only Task 12's *description* of that shape was corrected for terminology accuracy, per correction #4 — the manifest's actual axis set was already correct in Task 1/6, only the summary wording in Task 12 was imprecise).
15. **Is ROADMAP/BLUEPRINT_GAPS closure still correctly gated last?** Yes — Task 12 is otherwise unchanged; only its terminology (three frameworks / six evaluated axes + two reserved axes, replacing the prior "three-framework/six-axis" phrasing that omitted the reserved axes) was corrected.
16. **Does executing this plan require the implementation team to make any new fundamental architectural decision?** No new architectural decision was introduced by this correction pass. The two implementation-level tooling choices already flagged in the prior review (no third-party argument-parsing library, Task 3; a minimal hand-rolled caret-range comparator instead of `semver`, Task 6) remain unchanged and are still the only such flagged choices. The shared `installPackage`/`detectPackageManager` module and the single fixed theme-entry-file location/name remain ordinary implementation-detail decisions inside the spec's own explicit text — reassigning their *ownership* from an ambiguous "either task" to Task 5 alone (this pass's correction) changes sequencing, not architecture.
17. **Is the full task dependency graph now acyclic?** Yes, verified by direct inspection of every task's "Dependencies" line after this pass's edits: Task 1 → none; Task 2 → none; Task 3 → 2; Task 4 → 2; Task 6 → 1; **Task 5 → 1, 2, 4, 6** (no longer references Task 7); **Task 7 → 1, 2, 4, 5, 6** (now explicitly depends on Task 5, one-directionally, for the shared helpers and `ultimate.config.json` shape it consumes); Task 8 → 2, 4; Task 9 → 2; Task 10 → 2–8; Task 11 → 1, 9; Task 12 → 1–11. This is a strict DAG — every edge points from a lower-numbered or equal-tier task to a task it genuinely consumes, and the prior draft's only cycle (Task 5 ↔ Task 7, both naming each other) is eliminated by giving `detectPackageManager`/`installPackage` a single owner (Task 5) sequenced before its sole consumer (Task 7).

**No architectural fork was discovered during this correction pass or its re-review.** The dependency-cycle fix was a pure sequencing/ownership correction — resolvable directly from the reviewer's own preferred resolution (make Task 5 the owner, since `init` is the first command needing the shared infrastructure) — and required no change to the approved specification, the command surface, the compatibility model, or any file/package structure already established by the prior correction pass.

**Revised plan status: fully implementation-ready.** All prior review findings remain addressed (Tasks 5, 7, 9, 12), and the task dependency graph is now confirmed acyclic (item 17 above) — no task requires another task that has not already fully landed, and the implementation team can execute Tasks 1 through 12 in a single, unambiguous forward order (or with the parallelism the Dependencies lines already permit) without needing to make any further sequencing decision.

---

**READY FOR FORMAL PHASE 7 IMPLEMENTATION PLAN REVIEW**
