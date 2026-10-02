# Prime-parity branch closeout — `feature/prime-parity-audit-gaps`

**Date:** 2026-10-01
**Audited at:** `4320ef1`; checks re-run after the closeout corrections `ae2971d` (provenance) and `c9be11c` (format/lint). Merge-base with `main`: `9265d02`.
**Status:** FINALLY CLOSED (2026-10-01, approved by the user). GAP-071–GAP-081 are registered follow-up scope, not branch blockers. No further changes without a new user-requested phase.

This note records the overall branch closeout of the nine Prime-parity Implementation Plans (Table, Overlay, Display, Navigation, Form/Accessibility, Vue, Theming, SSR, Existing Commitments). Every Plan is closed: implemented, reviewed and approved. GAP statuses are in `docs/architecture/BLUEPRINT_GAPS.md`.

## GAP outcome

| Outcome                                   | GAPs                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| RESOLVED                                  | GAP-041–GAP-063, GAP-065–GAP-070 (29). GAP-059 is React only; Angular matches PrimeNG.                                    |
| PARTIAL                                   | GAP-064: the Batches 1-3 tranche of Aura modules was delivered (76 modules registered); the rest is tracked in its entry. |
| MISSING, registered during implementation | GAP-071–GAP-081 (11). Not in this branch's scope. GAP-081 is tied to the open DECISION-F.                                 |

## Deferred items

None of these items is unresolved implementation scope. Each was explicitly deferred or accepted by user decision.

1. **Linux-container screenshot baselines.** The `ng` Tooltip (Default/Right/Disabled), Dialog (Open/Non Closable) and Menu (Popup) visual baselines must be regenerated in the Linux Playwright container, because GAP-066 and GAP-067 change their rendering. Menu Default/With Disabled also differ locally (probably macOS vs Linux rendering); check them in the same run. CI `track-a-browser-visual-a11y` fails until then.
2. **Clipped Tooltip story (accepted, deferred visual issue).** The `ng` Tooltip Default story positions its tooltip partly above the viewport. User decision at closeout: keep the story as-is; it is a story/baseline concern, not an implementation defect. The regenerated baseline will record the clipped render.
3. **React/Vue output growth (accepted).** The GAP-068 subpath builds use `splitting: false`, so shared code is duplicated per entry. React `.mjs` output grew from about 558 KB to about 1,048 KB (dist about 1.9 MB to 3.6 MB); Vue from about 942 KB to about 1,785 KB (dist about 6.4 MB to 9.3 MB). User decision at closeout: accept this as a consequence of the per-component entry points and type declarations; no code-splitting work now. The size gate follows its designed path: the code merge needs an explicit human override of the failing size check, then a `PERFORMANCE.md`-only baseline change off `main`, re-measured there, records new sizes for every package that grew.
4. **Vue Storybook declarations.** The Vue declaration build also ships 91 `*.stories.d.mts` files (see GAP-079).
5. **Source-map comments.** The renamed `.d.mts` files in React and Vue keep `sourceMappingURL` comments naming the old `.d.ts.map` files, and those maps point at unpublished `../src` (see GAP-079).
6. **CI SSR job build order.** The `.github/workflows/ci.yml` `track-e-ssr-hydration` job builds the playground app with no step that builds `@ultimate/ng` first. Unverified locally; confirm on the first CI run of this branch.
7. **Local Node version (environment follow-up).** This branch's local checks used Node 20.19.2. In CI, the main `ci` job uses Node 20, while the Storybook (`track-a-browser-visual-a11y`) and SSR (`track-e-ssr-hydration`) jobs use Node 24.15.0 (`.github/workflows/ci.yml:30,150,205`; corrected 2026-10-02 — this line previously said all CI uses Node 20). Angular 21 packages reject local Node 23 (`ERR_PNPM_UNSUPPORTED_ENGINE`), while the root `engines` field declares `>=20.0.0` and there is no `.nvmrc`. User decision at closeout: no repository change now.

## Branch-level checks (Node 20.19.2, pnpm 9.6.0, `--base-ref main`, after `c9be11c`)

| Check                                                                  | Branch                                                                                    | `main`                                | Classification                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provenance:validate` diff check                                       | OK                                                                                        | n/a                                   | Fixed at closeout (`ae2971d`)                                                                                                                                                                      |
| Provenance manifest completeness                                       | FAIL, 1,294 files without entries (first: `packages/ng/src/accordion/accordion-style.ts`) | FAIL, 1,294                           | Inherited from `main`: same files. `accordion-style.ts` was added in `cbb4bf2` (2026-09-19) and never recorded in `ng.json`. The branch's one gap (`StepperSeparator.vue`) was fixed in `ae2971d`. |
| `format:check`                                                         | 490 tracked files fail                                                                    | 490                                   | Inherited from `main`; every failing file is on `main`'s list. The 44 branch-introduced failures were fixed in `c9be11c`.                                                                          |
| `lint` (tracked files)                                                 | 59 errors                                                                                 | 61                                    | Inherited from `main`; no file has more errors than on `main`. The 5 branch-introduced errors were fixed in `c9be11c`; the branch also fixed 2 on `main`.                                          |
| `size:validate`                                                        | FAIL: `ng-core`, `ng`, `react`, `themes`, `vue`                                           | FAIL: `ng-core`, `ng`, `react`, `vue` | Inherited from `main`, except `themes` and the branch's extra growth, which are accepted and handled by the post-merge baseline change                                                             |
| `build`                                                                | OK                                                                                        | FAIL (`@ultimate/ng` TS2729)          | Broken on `main`; fixed by this branch (`4a47883`)                                                                                                                                                 |
| `typecheck`, `ceiling:validate`, `integrity:pack-install @ultimate/ng` | OK                                                                                        | n/a                                   | Pass                                                                                                                                                                                               |
| Unit tests (`ng`, `react`, `vue`)                                      | 899 / 854 / 872 passed                                                                    | n/a                                   | Pass                                                                                                                                                                                               |

`lint` and `format:check` were run locally; untracked paths (`.claude/worktrees/`, `packages/*/storybook-static/`, `playwright-report/`) are excluded from the counts above.

## Expected CI-red items at closure

1. **Provenance manifest completeness** — inherited from `main` (1,294 files without entries).
2. **Size gate** — needs the agreed explicit human override at merge, followed by the `PERFORMANCE.md`-only baseline change off `main`.
3. **Visual regression** (`track-a-browser-visual-a11y`) — pending the Linux screenshot baseline regeneration (deferred item 1).
