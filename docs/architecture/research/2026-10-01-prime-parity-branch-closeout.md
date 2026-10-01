# Prime-parity branch closeout — `feature/prime-parity-audit-gaps`

**Date:** 2026-10-01
**Audited at:** `4320ef1` (merge-base with `main`: `9265d02`)
**Status:** closeout audit recorded; final branch closure is a user decision.

This note records the overall branch closeout of the nine Prime-parity Implementation Plans (Table, Overlay, Display, Navigation, Form/Accessibility, Vue, Theming, SSR, Existing Commitments). Every Plan is closed: implemented, reviewed and approved. GAP statuses are in `docs/architecture/BLUEPRINT_GAPS.md`.

## GAP outcome

| Outcome                                   | GAPs                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| RESOLVED                                  | GAP-041–GAP-063, GAP-065–GAP-070 (29). GAP-059 is React only; Angular matches PrimeNG.                                    |
| PARTIAL                                   | GAP-064: the Batches 1-3 tranche of Aura modules was delivered (76 modules registered); the rest is tracked in its entry. |
| MISSING, registered during implementation | GAP-071–GAP-081 (11). Not in this branch's scope. GAP-081 is tied to the open DECISION-F.                                 |

## Deferred items

None of these items is unresolved implementation scope. Each was explicitly deferred by user decision during implementation.

1. **Linux-container screenshot baselines.** The `ng` Tooltip (Default/Right/Disabled), Dialog (Open/Non Closable) and Menu (Popup) visual baselines must be regenerated in the Linux Playwright container. GAP-066 and GAP-067 change their rendering. Menu Default/With Disabled also differ locally, probably because of macOS vs Linux rendering; check them in the same run. CI `track-a-browser-visual-a11y` fails until this is done.
2. **Clipped Tooltip story.** The `ng` Tooltip Default story positions its tooltip partly above the viewport. Before the baselines are regenerated, decide whether to accept the clipped `top` render or change the stories to a centered layout. A regenerated baseline would otherwise freeze the clipped render.
3. **React/Vue output growth and the size baseline.** The GAP-068 subpath builds use `splitting: false`, so shared code is duplicated per entry. React `.mjs` output grew from about 558 KB to about 1,048 KB (dist about 1.9 MB to 3.6 MB). Vue grew from about 942 KB to about 1,785 KB (dist about 6.4 MB to 9.3 MB). Whether to enable splitting is still open. The size gate is handled as designed: the code merge needs an explicit human override of the failing size check, then a `PERFORMANCE.md`-only baseline change off `main` records new sizes for every package that grew. That change is re-measured on `main` at that time.
4. **Vue Storybook declarations.** The Vue declaration build also ships 91 `*.stories.d.mts` files (see GAP-079).
5. **Source-map comments.** The renamed `.d.mts` files in React and Vue keep `sourceMappingURL` comments naming the old `.d.ts.map` files, and those maps point at unpublished `../src` (see GAP-079).
6. **CI SSR job build order.** `.github/workflows/ci.yml` `track-e-ssr-hydration` runs `pnpm --filter <playground> run build` with no step that builds `@ultimate/ng` first. Unverified locally; confirm on the first CI run of this branch.
7. **Local Node 23 vs Angular 21.** Angular 21 packages reject Node 23 (`ERR_PNPM_UNSUPPORTED_ENGINE`), while the root `engines` field (`>=20.0.0`) admits it and there is no `.nvmrc`. Use Node 20, which CI uses, or Node 24 locally. This is an environment difference, not a product defect.

## Branch-level checks (Node 20.19.2, pnpm 9.6.0, `--base-ref main`)

| Check                                 | HEAD                                                                                       | `main`                                | Classification                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provenance:validate` diff check      | FAIL: the diff touches `packages/{ng,react,vue}` but not `docs/architecture/PROVENANCE.md` | n/a                                   | Branch blocker                                                                                                                                                         |
| Provenance manifest completeness      | FAIL, 1,295 files without entries (first: `packages/ng/src/accordion/accordion-style.ts`)  | FAIL, 1,294                           | Pre-existing on `main` (`accordion-style.ts` added in `cbb4bf2`, 2026-09-19, never in `ng.json`). The branch adds one: `packages/vue/src/stepper/StepperSeparator.vue` |
| `format:check`                        | 534 tracked files fail                                                                     | 490                                   | Pre-existing; 44 new failures are in files this branch touched                                                                                                         |
| `lint` (tracked files)                | 64 errors                                                                                  | 61                                    | Pre-existing; 5 new `no-unused-vars` (`ng` `menu.ts:256`, `ng` `table.ts:764,766`, `react` `table.tsx:771,774`); 2 fixed (`ng` `split-button.ts`)                      |
| `size:validate`                       | FAIL: `ng-core`, `ng`, `react`, `themes`, `vue`                                            | FAIL: `ng-core`, `ng`, `react`, `vue` | Pre-existing on `main` except `themes`, which is expected growth (GAP-064); all handled by the post-merge baseline change                                              |
| `ceiling:validate`                    | OK                                                                                         | n/a                                   | Pass                                                                                                                                                                   |
| `integrity:pack-install @ultimate/ng` | OK                                                                                         | n/a                                   | Pass                                                                                                                                                                   |
| `typecheck`                           | OK                                                                                         | n/a                                   | Pass                                                                                                                                                                   |
| `build`                               | OK                                                                                         | FAIL (`@ultimate/ng` TS2729)          | Pre-existing on `main`; fixed by this branch (`4a47883`)                                                                                                               |

`lint` and `format:check` were run locally; untracked paths (`.claude/worktrees/`, `packages/*/storybook-static/`, `playwright-report/`) are excluded from the counts above.
