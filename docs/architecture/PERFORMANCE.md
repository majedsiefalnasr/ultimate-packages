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

### Tree-shaking spot-check (Blueprint Completion re-run, secondary entry points added)

Following Blueprint Completion's addition of 8 real `ng-packagr` secondary entry points (GAP-009/GAP-023 — `packages/ng/{checkbox,paginator,scroller,tooltip,autofocus,badge,fluid,ripple}/ng-package.json`, each with its own `lib.entryFile`, plus a matching per-component `exports` map in `packages/ng/package.json`), `node scripts/provenance/verify-tree-shaking.mjs` was re-run against the new build: **still FAIL** — `[verify-tree-shaking] FAIL: importing only UButton pulled in Dialog-related code — the bundler is not eliminating unused exports from the single @ultimate/ng barrel`. (Re-running this script first required adding a missing `@ultimate/uix-utils/escape` alias entry to the script itself — Blueprint Completion's own WP5/Task 3 added that import to `dialog.ts` and never updated this script, a gap that only surfaced now because this is the first task to re-run it since.) The secondary-entry-point split did not resolve this specific script's failure mode, and could not have: this script only ever exercises the *primary* `@ultimate/ng` barrel import (`import { UButton } from "@ultimate/ng"`), which is unchanged by this task — `UButton` itself was not made a secondary entry point (see GAP-009's amended entry: `button` is one of 4 composites excluded by an unrelated upstream `ng-packagr` defect). `ng-packagr`'s Angular Package Format output still lacks `/* @__PURE__ */` purity annotations regardless (Task 17's own already-documented, unrelated root cause — only the real Angular linker inside a real application build adds those, which requires GAP-008's still-open real-consumer-app scope). Per-component `exports` subpaths are still added for the 8 leaf components regardless, since they resolve GAP-023's own distinct claim (no per-component subpath exports at all) independently of this script's result, and a consumer importing e.g. `@ultimate/ng/tooltip` directly now reaches a genuinely separate output file rather than the shared barrel — this script does not test that path.

### Notes

- No app in this monorepo consumes `@ultimate/ng`/`@ultimate/ng-core` via normal `node_modules` resolution yet — both the package-size and tree-shaking measurements above reflect the packages' own published `dist/` output, not an application bundle produced through a real Angular CLI build (which would run the Angular linker and could tree-shake differently; see Task 17's report caveat).
- Numbers reflect the current single-barrel-export architecture (Task 12's correction — no per-component subpaths) for the primary entry point. Blueprint Completion added 8 real per-component secondary entry points (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple`) — see the Blueprint Completion re-run note above; re-baseline after any future change to the package's entry-point structure.

## Phase 3 — UltimateReact

No dedicated narrative section was recorded at Phase 3's own completion (unlike Phase 1/2, which were baselined immediately). Real package-size and coverage measurements for `packages/react-core`/`packages/react` do exist, however — Phase 10 Track B extended `scripts/provenance/measure-package-size.mjs`'s scope from the original `uix*`/`ng*` prefix filter to all 17 publishable packages, so the "Phase 10 — CI/Security/Quality Gates" section below already carries both packages' real numbers as part of that later, broader baseline. See that section's Package size table for `packages/react-core` (67.0 KB dist, 3 files, 6.64 KB gzip) and `packages/react` (370.6 KB dist, 27 files, 10.60 KB gzip), and its Coverage table for `react-core` (89.39%) and `react` (89.69%) — both measured 2026-09-09 against commit `62480b6`. No React-specific tree-shaking spot-check or component-creation-cost benchmark analogous to Phase 2's has been performed; this remains open backlog (tracked as GAP-037 in `docs/architecture/BLUEPRINT_GAPS.md`).

## Phase 4 — UltimateVue

No dedicated narrative section was recorded at Phase 4's own completion. Real package-size and coverage measurements for `packages/vue-core`/`packages/vue` do exist, carried by the same Phase 10 Track B baseline-scope extension described above. See the "Phase 10 — CI/Security/Quality Gates" section below's Package size table for `packages/vue-core` (82.2 KB dist, 3 files, 8.22 KB gzip) and `packages/vue` (643.5 KB dist, 90 files, 19.68 KB gzip), and its Coverage table for `vue-core` (90.59%) and `vue` (92.13%) — both measured 2026-09-09 against commit `62480b6`. No Vue-specific tree-shaking spot-check or component-creation-cost benchmark analogous to Phase 2's has been performed; this remains open backlog (tracked as GAP-037 in `docs/architecture/BLUEPRINT_GAPS.md`).

## Phase 5 — Themes

No dedicated narrative section was recorded at Phase 5's own completion. Real package-size and coverage measurements for `packages/themes` do exist, carried by the same Phase 10 Track B baseline-scope extension described above. See the "Phase 10 — CI/Security/Quality Gates" section below's Package size table for `packages/themes` (110.7 KB dist, 3 files, 5.23 KB gzip), and its Coverage table for `themes` (97.9%) — both measured 2026-09-09 against commit `62480b6`. No Themes-specific tree-shaking spot-check or component-creation-cost benchmark analogous to Phase 2's has been performed; this remains open backlog (tracked as GAP-037 in `docs/architecture/BLUEPRINT_GAPS.md`).

## Phase 10 — CI/Security/Quality Gates

Phase 10 Track B extends `scripts/provenance/measure-package-size.mjs`'s package-discovery scope from the `uix*`/`ng*` prefix filter to an explicit, exhaustive list of all 17 publishable packages, and adds `scripts/provenance/validate-bundle-size.mjs` as a CI gate (R6) enforcing a merge-base-anchored, two-step baseline acceptance lifecycle (see the spec and `task-6-brief.md` for the full design). This table is the gate's baseline of record: `size:validate` reads each row's value at the merge-base commit and fails a source-changing PR whose fresh measurement regresses more than 15% relative to that value.

Real Stage-1 baseline, measured 2026-09-09 against commit `62480b6` (Node v22.22.2, pnpm 9.6.0) via `pnpm run build && pnpm run size:measure`.

Re-baselined rows (`ng-core`, `ng`, `react-core`, `react`, `themes`, `uix-utils`, `vue-core`, `vue`), measured 2026-10-03 against commit `986dbcc` (Node v20.19.2, pnpm 9.6.0) via `pnpm run build && pnpm run size:measure`: Prime-parity component additions (Phase C on `main`, then the Prime-parity audit and follow-up phases' Aura preset modules, 61 additional `ng` secondary entry points and per-component React/Vue subpaths) grew these barrels past the 15% gate. All other rows are unchanged from the Stage-1 baseline.

### Package size

| Package | dist/ size | dist/ file count | index.mjs gzip size |
| ------- | ---------- | ---------------- | ------------------- |
| packages/ai | 162.7 KB | 12 | 3.35 KB |
| packages/cli | 84.0 KB | 5 | 0.05 KB |
| packages/component-metadata | 165.0 KB | 3 | 7.93 KB |
| packages/component-schema | 29.3 KB | 3 | 2.37 KB |
| packages/mcp | 93.0 KB | 5 | 2.97 KB |
| packages/ng-core | 190.0 KB | 6 | 16.53 KB |
| packages/ng | 5281.3 KB | 286 | 202.86 KB |
| packages/react-core | 73.8 KB | 3 | 6.76 KB |
| packages/react | 3390.8 KB | 439 | 87.16 KB |
| packages/themes | 482.9 KB | 3 | 13.14 KB |
| packages/uix-data | 7.0 KB | 3 | 0.34 KB |
| packages/uix-motion | 32.8 KB | 3 | 2.06 KB |
| packages/uix-styled | 117.2 KB | 3 | 8.45 KB |
| packages/uix-styles | 195.7 KB | 33 | 0.65 KB |
| packages/uix-utils | 397.4 KB | 30 | 14.16 KB |
| packages/vue-core | 105.7 KB | 3 | 8.66 KB |
| packages/vue | 5282.9 KB | 575 | 132.30 KB |

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
