# GAP-094 Production-Scope Provenance Enforcement Implementation Plan (PR 1: classifier + validator)

> **For agentic workers:** Execute inline, test first, in red/green groups. Manifest backfill is **not** part of this plan; it follows in separate batch plans under the same Specification (§3.4).

**Status:** APPROVED (revision 3). Plan Review round 1 returned CHANGES REQUIRED, and findings 1–14 have been applied. Round 2 returned APPROVED WITH CHANGES, and findings N1–N4 have been applied (2026-10-15).

**Goal:** Enforce ADR-062. The provenance validator requires manifest entries only for production (distributed) files, classified from build evidence. It fails closed and reports every problem.

**Architecture:**

- `scripts/provenance/production-scope.mjs`: pure functions, with the exported `classifyPackage(pkgDir)`.
- `validate-provenance.mjs`: calls the classifier from the manifest-completeness section and switches to report-all.
- Fixture-based tests.
- A reconciliation research note.
- Tracking text in GAP-094 and C04.

**Tech stack:**

- Node 24.15.0 and `node:test`.
- `typescript` (root devDependency).
- `vue/compiler-sfc` `parse` (Spec erratum E2), loaded lazily with `createRequire` (from `node:module`) from `fileURLToPath(new URL("../../packages/vue/package.json", import.meta.url))`. `URL` and `fileURLToPath` are imported from `node:url`. A load failure becomes a classifier `{ error }`.

## Global constraints

- The [approved Specification](../specs/2026-10-15-gap-094-production-provenance-scope-design.md) revision 3 and errata E1/E2 govern: §§3.1–3.3, §3.5, and §4 items 1–5.
- **New files:**
  - `scripts/provenance/production-scope.mjs`
  - `scripts/provenance/production-scope.test.mjs`
  - `docs/architecture/research/2026-10-15-gap-094-production-scope-reconciliation.md`
- **Modified files:**
  - `scripts/provenance/validate-provenance.mjs` (manifest section only)
  - `scripts/provenance/validate-provenance-manifest.test.mjs`
  - `docs/architecture/BLUEPRINT_GAPS.md` (GAP-094 only)
  - `docs/architecture/COMPLETION_REGISTER.md` (C04 only)
  - ADR-062, the Spec, this Plan, and the decided options document
- **Not modified:** the manifests, the heading and diff checks, the CI workflow, and package configs.
- **ESLint:** `.mjs` globals are limited to `console`, `process` and `fetch`. Import everything else from `node:*`, or use `globalThis.`.
- **Path convention (finding 2):**
  - Every classifier path is `join(pkgDir, <posix path relative to pkgDir>)`. With the validator's `pkgDir = "packages/<name>"`, this is exactly the manifest `ultimateDestination` format, whatever the cwd. Tests pass an absolute temp dir and compare against `join(dir, "src/x.ts")`.
  - No `realpath` anywhere.
  - Relative paths in configs resolve against `pkgDir`, or against the config file's own directory for `ng-package.json` and `tsconfig` `-p`. They never resolve against the cwd.
- **Partition invariant (finding 11):** `production ∪ excluded` equals `listWatchedFiles(pkgDir)` and the two sets are disjoint. Per Spec erratum E3, this holds by construction: each watched file is assigned to exactly one set. The validator uses the same walker.

## Task 0: Environment

Run `pnpm install --frozen-lockfile` in the worktree, using Node 24.15.0.

## Task 1: Build-script parsing and fallbacks (red → green)

**Tests** (`production-scope.test.mjs`, with a helper `makePkg(files)` that writes a temp tree and returns its absolute dir):

- every file is production when:
  - there is no `package.json`;
  - there is no `build`;
  - `build: "vite build"`;
  - `build: "tsup src/index.ts"`;
  - `build: "tsup --config x.ts"`;
  - `build: "tsc -p tsconfig.json --watch"` (unrecognised flag);
- `parseBuildScript` recognises:
  - `tsup && node scripts/rename-dts.mjs`;
  - `ng-packagr -p ng-package.json`;
  - `tsup && vue-tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly --outDir dist && node scripts/rename-dts.mjs`.

Run the tests: expect red with "Cannot find module './production-scope.mjs'". Then implement `listWatchedFiles` and `parseBuildScript`, and the all-production fallback, with the allowlist from Spec §3.1(1). Expect green.

## Task 2: tsup entries and exports (red → green)

**Tests:**

- **Literal entries:** `entry: { index: "src/index.ts", "extra/index": "src/extra/index.ts" }` together with exports `{ ".": { types: "./dist/index.d.mts", import: "./dist/index.mjs", default: "./dist/index.mjs" } }`. Expect `index` and `extra/index` to be production, including when `extra` is absent from `exports`.
- **Real directory-listing configs:** verbatim copies of the real `packages/uix-styles/tsup.config.ts` and `packages/uix-utils/tsup.config.ts`, each with `src/a/index.ts` and `src/b/index.ts`. Expect both to be production. A `src/c/` without `index.ts` must give an error.
- **Wildcard export:** `"./*": { import: "./dist/*/index.mjs" }` must expand.
- **Errors:**
  - an export target that maps to no source file;
  - a target of `./lib/x.mjs`;
  - a condition of `browser`;
  - a string-valued (condition-less) export (Spec §3.1(3): a target without a recognised condition is an error);
  - zero entries;
  - `entry: makeEntries()`;
  - no `tsup.config`;
  - two `tsup.config` files;
  - a config with no `entry`.
- **Fallback:** a config with `publicDir: true`, and one with `onSuccess: "x"`, both make every file production.

**Implement `tsupEntries(pkgDir)`:**

- Build an AST with `ts.createSourceFile` and find the single `defineConfig({...})` call.
- Read the `entry` initializer:
  - accept an object or array literal of string literals;
  - accept a spread in exactly the three Spec E1 shapes, with the callback template using the parameter identifier or `<param>.name`, and the filter exactly `p => p.isDirectory()`.
- Union with `exports`. Condition mapping:
  - `import`, `require` and `default`: `.mjs`, `.cjs` or `.js` → `.ts`/`.tsx`;
  - `types`: `.d.mts`, `.d.cts` or `.d.ts` → `.ts`/`.tsx`.
- A string-valued export is an error, except `./package.json`.

## Task 3: ng-packagr entries (red → green)

**Tests:**

- Fixture: a root `ng-package.json` (`lib.entryFile: "src/index.ts"`, `dest: "dist"`), `button/ng-package.json` (`../src/button/index.ts`), and a nested `forms/input/ng-package.json`. Also `dist/x/ng-package.json` and `node_modules/y/ng-package.json`, which must be ignored.
- An entry file that is missing must give an error.
- A default `entryFile` resolves to `src/public_api.ts`.

**Implement `ngEntries(pkgDir)`.** Use recursive discovery that skips `node_modules`, `.git` and the root `dest`. Entries resolve relative to each config's directory.

## Task 4: Reachability (red → green)

**Production through reachability:**

- the entry imports `./a` and `import type { T } from "./types"`, so both are production;
- the entry imports `./helper.spec`, so it is production (the name is not proof);
- the entry imports `./Comp.vue`, whose `<script setup lang="ts">` imports `./dep`, so `dep` is production;
- the entry has `/// <reference path="./ambient.d.ts" />`, so `ambient.d.ts` is production;
- an unreferenced `.d.ts` is excluded;
- `service.require(opts)` (a member call) does not cause an error;
- a self import `pkgname/sub` resolves to the `sub` entry, including an ng secondary entry whose `ng-package.json` lives outside `src`. The walker may follow files outside `src`, but it reports only watched files;
- `@scope/pkgname-core` is **not** treated as self.

**Errors:**

- `./nope` cannot be resolved;
- `pkgname/missing` cannot be resolved;
- `import(variable)`;
- a bare `require(variable)`;
- `import.meta.glob("./*.ts")`;
- `new URL("./x", import.meta.url)`;
- `<script src="./x.ts">`;
- `<script lang="coffee">`;
- the SFC parser cannot be loaded. Simulate this through the seam: `reachable` and `classifyPackage` take an optional `{ loadSfcParser }` option, which defaults to the lazy `createRequire` loader.

A template literal with no substitutions inside `import()` or `require()` counts as a literal.

**Implement `reachable`:**

- Use `ts.preProcessFile(text, true, true)` to collect `importedFiles` and `referencedFiles`.
- Also scan the AST for:
  - `CallExpression` with an `ImportKeyword` callee;
  - a `require` callee that is a bare identifier;
  - `import.meta.glob`;
  - `new URL(_, import.meta.url)`.
- Self-specifier rule: the specifier equals `pkgName`, or starts with `pkgName + "/"`.
- Resolver: Spec §3.1(4).

## Task 5: Declaration programs and `classifyPackage` (red → green)

**Test fixture:**

- build script: `tsup && vue-tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly --outDir dist && node scripts/rename-dts.mjs`;
- `tsconfig.dts.json` extends a fixture `tsconfig.json`, which extends a base with `declaration: true`;
- the program has `include: ["src"]` and `exclude: ["src/**/*.spec.ts"]`.

**Expected classification:**

- `src/lone.ts` and `src/Lone.vue` are not imported but are in the program, so they are production. Program `.vue` files are production without being parsed, as intended (finding 13).
- `src/z.spec.ts` is excluded.
- `src/shims.d.ts` is unreferenced, so it is excluded.
- A recognised `tsc -p tsconfig.json` whose options set `noEmit: true` is not a declaration program.
- The partition invariant holds.

**Implement `declarationFiles`:**

- Use `ts.getParsedCommandLineOfConfigFile` with `extraFileExtensions` for `.vue` under `vue-tsc`.
- The CLI `--declaration` flag merges with the options from `extends`. It is a declaration program if `declaration` or `composite` is set and `noEmit` is not set.

Then implement `classifyPackage` (Spec §3.1(6)).

## Task 6: Validator report-all (red → green)

**Tests first** (`validate-provenance-manifest.test.mjs`):

- **report-all:** two fixture packages, each with a `package.json` and a tsup config. Package A has two missing production files. Package B has a classifier error. A third package has production files but no manifest. A fourth package has a manifest with invalid JSON. Expect exit 1, with stderr naming all of these.
- **excluded-only:** a missing excluded spec file, with exit 0.
- The existing orphan test (no `package.json`, so every file is production) must still exit 1.

Run them and expect red.

**Then change `validate-provenance.mjs`:**

- Classify each package and accumulate failures for a classifier error, a missing manifest when production files exist, unparseable manifest JSON, and each missing production file.
- Print one line per package: `OK` or `FAIL` with `production=… excluded=… missing=…`.
- At the end, print every failure and exit 1 if there was any.
- Packages with zero production files skip the manifest check.
- The earlier `fail()` calls before the manifest section stay unchanged.

Expect green.

## Task 7: Reconciliation and soundness evidence

1. Run `node scripts/provenance/validate-provenance.mjs` on the worktree. Capture the per-package counts and the missing list.
2. Reconcile against the options draft (1915 / 696 / 467):
   - list excluded files by role;
   - explain `shims-vue.d.ts` and every other difference;
   - record that the draft's file-name categories were name-based estimates (Spec §4.2).
3. Run `pnpm run build`, then a scratch soundness script:
   - for every `dist/**/*.map`, resolve each `sources` entry against the map's directory and `sourceRoot`, after stripping scheme and query prefixes (`ng://`, `webpack://`, `vue-sfc-export-helper:`, `?…`);
   - map every per-file declaration under `vue/dist` and `react/dist` back to `src`, after `rename-dts` has run. `X.d.mts` maps to `X.ts`/`X.tsx`, and `X.vue.d.mts` maps to `X.vue`;
   - fail on any path it cannot map;
   - print the mapped count per package, and require each to be non-zero;
   - require that 0 distributed files are classified as excluded.
4. Record the commands, counts, results and the bundled-declaration limitation in the research note.

**Stop rule:** if any distributed file is classified as excluded, stop and fix the classifier. Never adjust the evidence.

## Task 8: Tracking text

- **GAP-094** in `BLUEPRINT_GAPS.md`:
  - set Expected state per Spec §3.5;
  - set "Architectural decision required" to "Yes — decided, ADR-062";
  - add a "Reconciled scope (2026-10-15)" bullet with the counts and a link to the research note;
  - leave the status OPEN.
- **C04** in `COMPLETION_REGISTER.md`: set "Gate → next" to "Provenance scope decided (ADR-062); evidence-backed backfill batches under the GAP-094 Specification §3.4."

## Task 9: Verify, review, PR

1. `pnpm run build`, then `pnpm run test:scripts`. Expect 0 failures. With a build present, the pack-install real runs (`real run: @ultimate/ai + its 2-member closure packs, installs, and verifies (smallest real closure)` and `real run: @ultimate/ng + its 7-member closure …`) must pass.
2. `pnpm run lint` and `pnpm run format:check`.
3. Get an independent code review and fix in-scope findings.
4. Commit, then push with `git push -u origin feature/gap-094-production-provenance-scope:feature/gap-094-production-provenance-scope`. Verify the output shows no `-> main`.
5. Open the PR. It must state that "Provenance validation" stays red by design until the backfill (Spec §4.4), and that it now lists only missing production files. Compare against the current `main` CI and confirm there are no other new failures.
6. Merge only when review passes and no new failure is introduced.
