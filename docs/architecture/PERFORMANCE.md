# Performance Baseline

Phase 1 (`UltimateUIX Foundation`) baseline measurements, recorded once at Phase 1 completion for later comparison. Per the Blueprint's performance strategy ("do not optimize based on assumptions; establish benchmarks"), these numbers are not a budget or a CI gate — they are a reference point for Phase 2+.

## Package size

| Package             | dist/ size | dist/ file count | index.mjs gzip size |
| ------------------- | ---------- | ---------------- | ------------------- |
| packages/uix-motion | 33.3 KB    | 3                | 2.05 KB             |
| packages/uix-styled | 111.0 KB   | 3                | 8.10 KB             |
| packages/uix-styles | 14.3 KB    | 6                | 0.65 KB             |
| packages/uix-utils  | 371.7 KB   | 24               | 13.30 KB            |
| packages/uix-data   | 7.0 KB     | 3                | 0.34 KB             |

Measured with `node scripts/provenance/measure-package-size.mjs` against a fresh `pnpm run build` (Node v24.15.0, pnpm 9.6.0).

Note: `packages/uix-data` row measured 2026-09-02 under Node v24.20.0, pnpm 9.6.0 (the four earlier rows unchanged).

## Tree-shaking spot-check

Bundled `@ultimate/uix-utils/classnames` alone via esbuild 0.27.7 (`--bundle --format=esm`): output was `27` lines, containing zero references to `dom`-module-specific functions (`hasClass`, `getScrollableParents`, `blockBodyScroll`) — confirms subpath imports do not pull in unrelated submodules. The bundled output contains only the `classnames`/`cn` implementation.

Note: the brief's alias form (`--alias:@ultimate/uix-utils=<dist>`) does not resolve for a scoped, multi-segment specifier under esbuild's alias substitution — it does not walk the package's `exports` map (`"./*": "./dist/*/index.mjs"`) for subpaths. The check was run with the alias pointed at the resolved subpath file directly (`--alias:@ultimate/uix-utils/classnames=<dist>/classnames/index.mjs`), which is equivalent to how a bundler resolves the subpath export in practice.

## Notes

- No runtime/initialization-cost benchmark is included — these packages have no framework consumer yet (Phase 2+). Re-baseline runtime cost at Phase 2 exit.
- Numbers reflect an unoptimized first build; re-measure after any build-config change in a later phase.

## Phase 2 — UltimateNG

Phase 2 (`UltimateNG` Angular foundation) baseline measurements, recorded once at Phase 2 completion, extending the same `scripts/provenance/measure-package-size.mjs` script used for Phase 1 (its package-discovery filter now matches both `uix*` and `ng*` prefixes, mirroring `scripts/provenance/validate-provenance.mjs`'s `MANIFEST_WATCHED_PREFIXES` pattern). As with Phase 1, these numbers are a reference point, not a budget or CI gate.

### Package size

| Package          | dist/ size | dist/ file count | index.mjs gzip size |
| ---------------- | ---------- | ---------------- | ------------------- |
| packages/ng-core | 105.0 KB   | 6                | 9.91 KB             |
| packages/ng      | 225.8 KB   | 6                | 19.67 KB            |

Measured with `node scripts/provenance/measure-package-size.mjs` against a fresh `pnpm run build` (Node v23.11.0, pnpm 9.6.0). Unlike the tsup-built `uix-*` packages, `ng`/`ng-core` are built by `ng-packagr` in partial-compilation mode and publish their barrel entry as `dist/fesm2022/<package-name>.mjs` (declared via `package.json`'s `module`/`main` fields) rather than `dist/index.mjs`; the script now resolves each package's real entry file from its own `package.json` instead of assuming a fixed path, so both layouts are measured correctly by the same script.

Note: Node v23.11.0 was used for this measurement run (the active environment Node), which differs from Phase 1's Node v24.15.0 — recorded here for the record since the script's own comment cites the Node version used at measurement time; this difference does not affect build output size (`ng-packagr`/`tsup` output is deterministic given identical source and dependency versions).

### Component-creation cost

Measured via a throwaway benchmark (not committed, per the Phase 2 spec) that wrapped `TestBed.createComponent(...)` + `detectChanges()` + `destroy()` in `performance.now()` calls, 100 iterations each, for `UButton` (a simple component with no overlay) and `UDialog` (overlay + focus-trap + motion dependencies), run via `pnpm --filter @ultimate/ng test`:

| Component | mean         | median  | min     | max          |
| --------- | ------------ | ------- | ------- | ------------ |
| UButton   | 0.58–0.63 ms | 0.28 ms | 0.21 ms | 17.1–24.2 ms |
| UDialog   | 0.18–0.19 ms | 0.14 ms | 0.11 ms | 2.0–2.4 ms   |

Two consecutive runs produced consistent medians and minimums (UButton: 0.2876 ms / 0.2755 ms median; UDialog: 0.1385 ms / 0.1377 ms median); the mean and max in both components are dominated by a single first-iteration JIT-warmup outlier (visible only on iteration 1 of each 100-iteration loop), not by a per-component cost difference. Read the median as the representative per-creation cost. Counterintuitively, `UDialog`'s median creation cost measured lower than `UButton`'s across both runs — `UButton` is the first component instantiated in the suite's test file ordering in this benchmark, so its higher mean/max most likely reflects one-time TestBed/Angular DI warmup rather than `UDialog`'s overlay/focus-trap/motion dependencies being cheaper to construct. This ordering effect is a known limitation of this quick, non-isolated benchmark; a rigorous per-component isolation benchmark (separate warm-up phase, randomized order) is out of scope for this measurement-only task.

### Tree-shaking spot-check (Task 17 re-confirmation)

Re-ran `node scripts/provenance/verify-tree-shaking.mjs` against the fresh Phase 2 build: **still fails**, with the same exit code and message recorded in Task 17's report — `[verify-tree-shaking] FAIL: importing only UButton pulled in Dialog-related code`. This is not a regression; it reconfirms Task 17's documented, accepted finding: `ng-packagr`'s partial-compilation output carries no `/* @__PURE__ */` purity annotations on Angular's declared component/factory/directive fields, so a generic bundler (this script uses raw esbuild, not the Angular linker) cannot prove `UDialog`'s class body is safe to eliminate from the single `@ultimate/ng` barrel even when only `UButton` is imported. `sideEffects: true` (set in Task 17) accurately reflects this — it does not claim tree-shaking safety. See Task 17's report for the full root-cause investigation; this task only re-confirms the finding still holds against the current build, it does not attempt to fix it.

### Notes

- No app in this monorepo consumes `@ultimate/ng`/`@ultimate/ng-core` via normal `node_modules` resolution yet — both the package-size and tree-shaking measurements above reflect the packages' own published `dist/` output, not an application bundle produced through a real Angular CLI build (which would run the Angular linker and could tree-shake differently; see Task 17's report caveat).
- Numbers reflect the current single-barrel-export architecture (Task 12's correction — no per-component subpaths). Re-baseline after any future change to the package's entry-point structure.

## Phase 3 (React), Phase 4 (Vue), Phase 5 (Themes)

No dedicated narrative section was recorded at each phase's own completion (unlike Phase 1/2, which were baselined immediately). Real package-size and coverage measurements for `packages/react`, `packages/vue`, and `packages/themes` do exist, however — see the "Phase 10 — CI/Security/Quality Gates" section immediately below, whose baseline table (measured 2026-09-09 against commit `62480b6`) already includes all three packages alongside every other publishable package, once Phase 10 Track B extended the measurement script's scope from `uix*`/`ng*` to all 17 packages. No React/Vue/Themes-specific tree-shaking spot-check or component-creation-cost benchmark analogous to Phase 2's has been performed; this remains open backlog (tracked as GAP-037 in `docs/architecture/BLUEPRINT_GAPS.md`).

## Phase 10 — CI/Security/Quality Gates

Phase 10 Track B extends `scripts/provenance/measure-package-size.mjs`'s package-discovery scope from the `uix*`/`ng*` prefix filter to an explicit, exhaustive list of all 17 publishable packages, and adds `scripts/provenance/validate-bundle-size.mjs` as a CI gate (R6) enforcing a merge-base-anchored, two-step baseline acceptance lifecycle (see the spec and `task-6-brief.md` for the full design). This table is the gate's baseline of record: `size:validate` reads each row's value at the merge-base commit and fails a source-changing PR whose fresh measurement regresses more than 15% relative to that value.

Real Stage-1 baseline, measured 2026-09-09 against commit `62480b6` (Node v22.22.2, pnpm 9.6.0) via `pnpm run build && pnpm run size:measure`.

### Package size

| Package | dist/ size | dist/ file count | index.mjs gzip size |
| ------- | ---------- | ---------------- | ------------------- |
| packages/ai | 162.7 KB | 12 | 3.35 KB |
| packages/cli | 84.0 KB | 5 | 0.05 KB |
| packages/component-metadata | 165.0 KB | 3 | 7.93 KB |
| packages/component-schema | 29.3 KB | 3 | 2.37 KB |
| packages/mcp | 93.0 KB | 5 | 2.97 KB |
| packages/ng-core | 112.5 KB | 6 | 10.51 KB |
| packages/ng | 400.7 KB | 6 | 32.91 KB |
| packages/react-core | 67.0 KB | 3 | 6.64 KB |
| packages/react | 370.6 KB | 27 | 10.60 KB |
| packages/themes | 110.7 KB | 3 | 5.23 KB |
| packages/uix-data | 7.0 KB | 3 | 0.34 KB |
| packages/uix-motion | 32.8 KB | 3 | 2.06 KB |
| packages/uix-styled | 117.2 KB | 3 | 8.45 KB |
| packages/uix-styles | 195.7 KB | 33 | 0.65 KB |
| packages/uix-utils | 395.6 KB | 30 | 14.12 KB |
| packages/vue-core | 82.2 KB | 3 | 8.22 KB |
| packages/vue | 643.5 KB | 90 | 19.68 KB |

### Coverage

Task 7 adds `@vitest/coverage-v8` to all 15 Vitest-native packages (`coverage: { provider: "v8", reporter: ["text", "json-summary"], reportsDirectory: "./coverage" }` in each `vitest.config.ts`) plus `coverage`/`coverageReporters` on `ng`/`ng-core`'s `angular.json` `test` target (the Angular-idiomatic equivalent, invoked via `ng test --project=<name> --coverage`, using the same underlying Vitest 4.0.8 coverage engine `@angular/build` bundles), and adds `scripts/provenance/validate-coverage.mjs` as a CI gate (R7) enforcing the identical merge-base-anchored, two-step baseline acceptance lifecycle as R6 (see `task-6-brief.md`/`task-7-brief.md`). This table is the gate's baseline of record: `coverage:validate` reads each row's `line-coverage %` value at the merge-base commit and fails a source-changing PR whose fresh measurement drops more than 2 percentage points (absolute delta) below it.

Real Stage-1 baseline, measured 2026-09-09 against commit `62480b6` (Node v22.22.2, pnpm 9.6.0) via `pnpm run coverage:measure`. Each value is that package's real `total.lines.pct` from its own `coverage-summary.json` (15 packages) or `coverage/<projectName>/coverage-summary.json` (`ng`/`ng-core`).

| Package | line-coverage % |
| ------- | --------------- |
| ai | 75.7 |
| cli | 86.9 |
| component-metadata | 95.85 |
| component-schema | 80.41 |
| mcp | 78.33 |
| ng-core | 83.54 |
| ng | 88.6 |
| react-core | 89.39 |
| react | 89.69 |
| themes | 97.9 |
| uix-data | 40.0 |
| uix-motion | 33.45 |
| uix-styled | 43.76 |
| uix-styles | 28.57 |
| uix-utils | 18.16 |
| vue-core | 90.59 |
| vue | 92.13 |
