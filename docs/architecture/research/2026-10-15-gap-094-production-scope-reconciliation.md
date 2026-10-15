# GAP-094 — Production-scope reconciliation and soundness evidence

**Date:** 2026-10-15
**Type:** Point-in-time evidence record for [GAP-094](../BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry) under [ADR-062](../DECISIONS.md), produced by Plan Task 7 of the [Implementation Plan](../../superpowers/plans/2026-10-15-gap-094-production-provenance-scope.md).
**Tree:** branch `feature/gap-094-production-provenance-scope` from `main` `ccb97d68`. The `packages/` tree is identical at `09973858`. Node 24.15.0.

## 1. Classifier result (`node scripts/provenance/validate-provenance.mjs`, exit 1)

| Package    |  Watched | Production | Excluded | Missing production entries | Excluded files without an entry |
| ---------- | -------: | ---------: | -------: | -------------------------: | ------------------------------: |
| ng         |      462 |        277 |      185 |                        172 |                             146 |
| ng-core    |       53 |         38 |       15 |                         11 |                               5 |
| react      |      438 |        265 |      173 |                        228 |                             156 |
| react-core |       51 |         37 |       14 |                          2 |                               1 |
| themes     |       87 |         87 |        0 |                          0 |                               0 |
| uix-data   |        7 |          7 |        0 |                          0 |                               0 |
| uix-motion |        4 |          4 |        0 |                          0 |                               0 |
| uix-styled |       25 |         25 |        0 |                          0 |                               0 |
| uix-styles |       14 |         14 |        0 |                          2 |                               0 |
| uix-utils  |      145 |        145 |        0 |                          0 |                               0 |
| vue        |      575 |        385 |      190 |                        277 |                             155 |
| vue-core   |       54 |         34 |       20 |                          4 |                               4 |
| **Total**  | **1915** |   **1318** |  **597** |                    **696** |                         **467** |

The validator reports exactly 696 problems, one per missing production file.

## 2. Reconciliation with the options draft

- **Watched files:** 1915 = 1318 production + 597 excluded. Each watched file is assigned to exactly one of the two sets, so the partition holds by construction.
- **Missing production entries:** 696, the same number as the draft. The draft counted these by file name; the classifier derives them from build evidence. The totals agree.
- **Excluded files, by role (597):**
  - 330 test files (`*.spec.*`): ng 96, ng-core 15, react 87, react-core 14, vue 98, vue-core 20;
  - 266 story files (`*.stories.*`): ng 89, react 86, vue 91;
  - 1 unreferenced `.d.ts` input, `packages/vue/src/shims-vue.d.ts`.

  No other file is excluded. All 330 + 266 test and story files are excluded because no entry imports them and, for vue/react, `tsconfig.dts.json` excludes them. They are not excluded because of their names. 467 of the 597 excluded files have no manifest entry; the other 130 (including `shims-vue.d.ts`) already had one, and those entries remain valid.

- **vue: 386 vs 385.** The draft's prototype counted 386 vue production files. The specified classifier counts 385 because `shims-vue.d.ts` is a compiler input that is never emitted, so it is now excluded as an unreferenced `.d.ts` input. The vue build emits 385 per-file declarations, matching the 385.
- **Name-based categories were estimates.** The draft's table assigned categories by file name, and some were wrong: for example, the two "barrels" missing in `uix-styles` (`src/inputtext/index.ts`, `src/inputnumber/index.ts`) are Prime-derived style modules. Per-file classification is left to the evidence-backed backfill (Spec §3.4).

## 3. Soundness against a real build

After `pnpm run build` (exit 0) on the same tree, a scratch script checked every distributed source against the classifier:

- For every `packages/<pkg>/dist/**/*.map`, it resolved each `sources` entry against the map's directory and `sourceRoot`, after stripping `ng://`/`webpack://` prefixes and `?` queries.
- For `vue` and `react`, it mapped every per-file declaration emitted after `rename-dts` back to `src`: `X.d.mts` to `X.ts`/`X.tsx`, and `X.vue.d.mts` to `X.vue`.
- It failed on any path it could not map, and it required a non-zero mapped count for every package.

| Package    | Distributed sources mapped | Distributed but not production | Unmappable | Skipped as virtual / generated                                                     |
| ---------- | -------------------------: | -----------------------------: | ---------: | ---------------------------------------------------------------------------------- |
| ng         |                        186 |                              0 |          0 | 71 ng-packagr generated flat-module indexes (`src/<entry>/ultimate-ng-<entry>.ts`) |
| ng-core    |                         21 |                              0 |          0 | 1 generated flat-module index (`src/ultimate-ng-core.ts`)                          |
| react      |                        265 |                              0 |          0 | —                                                                                  |
| react-core |                         25 |                              0 |          0 | —                                                                                  |
| themes     |                         82 |                              0 |          0 | —                                                                                  |
| uix-data   |                          3 |                              0 |          0 | —                                                                                  |
| uix-motion |                          2 |                              0 |          0 | —                                                                                  |
| uix-styled |                         22 |                              0 |          0 | —                                                                                  |
| uix-styles |                         12 |                              0 |          0 | —                                                                                  |
| uix-utils  |                        140 |                              0 |          0 | —                                                                                  |
| vue        |                        385 |                              0 |          0 | 89 `vue-sfc-export-helper` virtual modules                                         |
| vue-core   |                         22 |                              0 |          0 | —                                                                                  |

Result: **no distributed file is classified as excluded.**

- The ng-packagr flat-module indexes are files that ng-packagr generates at build time, named after the bundle. They never exist in the repository.
- The vue virtual modules are `@vitejs/plugin-vue` helpers, not repository files.

**Limitation (stated, not claimed).** Bundled declarations (tsup `dts: true` and ng-packagr) carry no per-file source mapping. For ng, ng-core, the `*-core` packages, themes and `uix-*`, type-only files are therefore covered only by the classifier's static reachability walk, which follows `import type` edges. The JS sourcemaps do not cover them. Mapped counts below the production counts (for example ng: 186 mapped vs 277 production) consist of such type-only modules and files compiled into declarations only.
