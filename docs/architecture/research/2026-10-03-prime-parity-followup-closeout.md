# Prime-parity follow-up phase closeout — `feature/prime-parity-followup`

**Date:** 2026-10-03
**Range:** implementation `2cc92af..bcbc06c` (12 commits) on a branch from `main` `c520fed`.
**Status:** closeout recorded; merge awaits user authorization. Nothing pushed or merged.

## Outcome

F1–F5 implementation and verification are complete. Every task passed its task review. The final whole-branch review (2cc92af..6360a83, plus the comment fix `bcbc06c`) found no Critical or Important issues.

| GAP                                        | Status                                         | Delivered by                                |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| GAP-071 Angular Tabs overflow detection    | RESOLVED                                       | F1 `f0d446a`                                |
| GAP-072 Vue Tabs re-evaluation             | RESOLVED                                       | F1 `a7fd362`                                |
| GAP-073 Angular Breadcrumb href/RouterLink | RESOLVED                                       | F1 `90602d3`                                |
| GAP-075 React ToggleButton Space           | RESOLVED                                       | F2 `f52e842`                                |
| GAP-076 Vue Password `ariaLabelledby`      | RESOLVED                                       | F2 `c786c15`                                |
| GAP-077 Vue Stepper horizontal separators  | RESOLVED                                       | F3 `96332a0`, `bcaa306`, `bcbc06c`          |
| GAP-079 Vue declarations                   | RESOLVED for declaration/package resolvability | F5 `041e7eb`, `6360a83`                     |
| GAP-080 Angular Scroller SSR               | RESOLVED                                       | F4 `ea28372` (CI build-order fix `8edc668`) |
| GAP-082 Typed Vue props (new)              | MISSING                                        | registered at this closeout                 |
| GAP-064 Aura coverage                      | PARTIAL (unchanged)                            | later theming phase                         |
| GAP-074, GAP-078, GAP-081                  | MISSING (designs approved, not in this phase)  | later phases                                |

Verification:

- Unit suites: Angular 911, React 856, Vue 897.
- Real-browser tests: GAP-075 state per Space press and GAP-077 layout, in Chromium, Firefox and WebKit.
- Angular SSR prerender log clear of the `ResizeObserver` error; `ng-ssr-chromium` 9/9.
- CI SSR build failure confirmed on a clean worktree for all three playgrounds, then fixed: `pnpm --filter-prod "${{ matrix.dir }}..." run build`, which builds 9 packages per playground, each once. The real GitHub run cannot be exercised until the branch is pushed.
- F5 consumer check: all 94 exported Vue subpaths type-check under `Bundler` and `NodeNext` with zero errors; the pre-fix commit fails with TS2307.
- Pack/install integrity OK for `@ultimate/vue` and `@ultimate/react`.

## Typed Vue props (excluded from GAP-079)

The F5 acceptance row "passing a wrongly typed prop to `UButton` is a type error" was not met. Vue base factories return an untyped `ComponentOptions`, so components ship an empty props type. User decision (2026-10-03): GAP-079 is resolved for resolvability only; typed props are out of scope for GAP-079/F5 and are registered as GAP-082, which needs a dedicated architectural/retyping phase. No retyping was done.

## Accepted rulings

1. One combined F1–F5 final review instead of one per Plan (the Plans share no files).
2. The Vue whole-package import test timeout is an existing, load-related flake: it passes in isolation (2.2–5.1s against a 5s limit).
3. The extra wait in the Stepper browser test (`toBeVisible()` before `count()`) is a test-stability adjustment.
4. The F5 consumer check used per-package `pnpm pack`, because the installed pnpm rejected the filtered pack invocation (verification only).
5. Of the final-review findings, only the stale `StepList.vue` comment was fixed; the rest stay deferred.
6. The final comment-only fix was checked by the controller reading its diff.
7. The five git-ignored progress logs remain available for review: `.superpowers/sdd/2026-10-02-prime-parity-followup-*/progress.md`.

## Deferred findings (dispositions unchanged)

All per-task minor findings and their "keep deferred" dispositions remain as triaged by the final review and recorded in the progress logs. Out of phase scope:

- local Playwright web-server timeout on a cold Angular Storybook start;
- inherited prettier failures in touched files (no new ones added).

No new GAPs were created from them.
