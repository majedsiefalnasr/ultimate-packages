# Prime-parity approved-designs phase closeout — `feature/prime-parity-approved-designs`

**Date:** 2026-10-03
**Range:** implementation `96d6096..0608e6d` (8 commits) on a branch from `main` `cdcc65e`. Spec `8bbdc85`, Plan `cdffb6e` and Plan Review corrections `96d6096`.
**Status:** closeout recorded. Merge awaits user authorization. Nothing pushed or merged.

## Outcome

All six Plan tasks are complete, and each passed its task review. The final whole-phase review (`cdcc65e..28e0212`) found no Critical issues and one Important issue. That issue and two Minor findings were fixed in `0608e6d`, and a scoped re-review of the fix was clean.

| GAP                                            | Status              | Delivered by                                  |
| ---------------------------------------------- | ------------------- | --------------------------------------------- |
| GAP-078 Angular per-document style injection   | RESOLVED            | Tasks 1–2 `a5720f0`, `b735582`; fix `0608e6d` |
| GAP-074 shared `u-hidden-accessible`           | RESOLVED            | Tasks 3–4 `63b7a6a`, `7572867`, `3126b70`     |
| GAP-081 Angular barrel re-exports (DECISION-F) | RESOLVED            | Tasks 5–6 `6bc1e6c`, `28e0212`                |
| GAP-064 Aura coverage                          | PARTIAL (unchanged) | later theming phase                           |
| GAP-082 Typed Vue props                        | MISSING (unchanged) | later retyping phase                          |

**Final-review fix (`0608e6d`).**

- Angular `<style>` elements use their own key attribute, `data-u-ng-style`. Vue already writes `data-u-style` with the same keys, so a page hosting both frameworks would have had Angular adopt Vue's elements.
- An adopted server-rendered element has its CSS refreshed in place when it differs from the client's CSS.
- Stale comments and READMEs that described the Angular sheet as a singleton were corrected.

## Verification

- **Unit suites at `0608e6d`:**

  | Package    | Tests passed |
  | ---------- | ------------ |
  | ng-core    | 62           |
  | ng         | 912          |
  | react-core | 69           |
  | react      | 856          |
  | vue-core   | 96           |
  | vue        | 898          |
  | uix-styled | 15           |
  | themes     | 559          |

- **Angular SSR:** `ng-ssr-chromium` passed 10/10 at `0608e6d`.
  - Raw server HTML contains the keyed `u-common-variables`, `button` and `u-hidden-accessible` styles.
  - After hydration, each key occurs exactly once.
- **React/Vue server contract:** node-environment tests confirm that a server render emits no `<style>` and registers nothing.
- **GAP-074 browser check:** the Vue Rating radios are visually hidden but stay discoverable with `getByRole("radio")` in Chromium, Firefox and WebKit.
- **GAP-081 measurements:**
  - Duplicated component classes in the primary bundle: 86 → 0.
  - Barrel vs subpath class identity: 6/6, with no `NG0912`.
  - `typecheck` passes with no prior build, and Storybook builds.
  - Clean builds with and without the `tsconfig.json` mapping produce identical output (286 files, matching manifests). ng-packagr uses its bundled tsconfig and does not read the mapping.
  - `integrity:pack-install @ultimate/ng` passes.
  - The `exports` map and all 136 barrel export names are unchanged, and `UInputNumber` stays subpath-only.
- **Linux visual baselines:** run in Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` (arm64) on a `git archive` export with a fresh install. The run built the workspace, then ran all 9 Storybook projects (ng, react and vue in Chromium, Firefox and WebKit) with `CI=true`.

  | Commit    | Passed | Flaky | Failed | Duration |
  | --------- | ------ | ----- | ------ | -------- |
  | `28e0212` | 705    | 0     | 0      | 5.2 min  |
  | `0608e6d` | 701    | 4     | 0      | 12.7 min |

  No baselines changed.

- **Flaky tests at `0608e6d`.** All four passed on retry, and none is a screenshot assertion:
  - React Menu (Firefox): `getByRole('menu')` was not visible within 5 s.
  - React Button (WebKit): the "Save" button was not found within 5 s.
  - Vue Button and Vue Paginator: two axe scans failed with "Axe is already running".

  They are classified as environment/load flakes, not regressions. The same suite passed with no flaky tests at `28e0212`, and `0608e6d` changes only comments in React and Vue code.

- **Formatting:** prettier diff counts are unchanged in every touched file, so no new formatting failures were introduced.
- **Working tree:** clean at closeout.

## Verification boundary

- **Real CI SSR run.** It has not been exercised, because the branch has not been pushed. This is a pending external event, not an implementation defect.
  - The CI job builds with `pnpm --filter-prod "${{ matrix.dir }}..." run build`, using the package name `playground-angular`.
  - This was verified locally to select the complete 9-package Angular dependency chain.

## Existing open external item

- **The CI visual job has no build step.**
  - `.github/workflows/ci.yml` installs dependencies, installs browsers and runs Playwright without building the workspace.
  - On a fresh checkout, Angular Storybook then fails: "Package path . is exported from package `@ultimate/themes`, but no valid target file was found".
  - The failure reproduces identically on `main` `cdcc65e`, so it predates this phase.
  - It is recorded here as an open external item. CI was not modified, and no GAP was created.

## Accepted rulings

1. **One Linux visual run after Task 6 instead of one per task.** Visual runs on macOS cannot validate the Linux baselines, and Tasks 5–6 touch files disjoint from Tasks 3–4.
2. **Build directories moved, not deleted.** For the GAP-081 clean-build comparisons, `dist` and cache directories were moved to `/tmp/claude-501/gap081-moved*` instead of deleted, because the shell hook blocks `rm -rf`. Each build still started with none present. The moved directories are scratch outside the repository and can be deleted.
3. **Trailer finding rejected.** A task reviewer asked the commit trailer to name a different model; the Plan mandates the trailer used.
4. **Visual run with a build step.** The visual suite was run with `pnpm run build` first, because of the CI visual-job item above.
5. **Final-review Important #1 and Minors #2–#3 fixed** in `0608e6d`.
6. **Final-review Minor #4 accepted without change.** `HIDDEN_ACCESSIBLE_KEY` and `hiddenAccessibleCss` are public exports of `@ultimate/uix-styled` alongside `registerHiddenAccessible`. The approved Plan prescribed these exports, and Spec §5.3 permits exporting the CSS.
7. **Final-review Minor #5 deferred without change.** The unneeded `"baseUrl": "."` stays in `packages/ng/tsconfig.json`. Removing it would reopen the GAP-081 build-isolation proofs.

## Deferred findings (dispositions unchanged)

The final review triaged every per-task minor finding as keep-deferred:

- **Task 1:**
  - `meta.attrs` is not applied to Angular `<style>` elements; no CSP nonce support exists in any core.
  - Adoption scans every head `<style>`.
  - Redundant `this.doc!` assertion and a redundant guarded add in a test.
  - A spy is restored outside `finally`.
- **Task 2:**
  - The React/Vue server-contract tests are weak regression guards, because registration never runs on the server by design.
  - Ragged README line breaks.
- **Task 3:**
  - The Angular no-theme test depends on test order.
  - The React spec matches a literal CSS substring.
- **Task 4:**
  - Password test naming, a page-wide role check, and no explicit clip assertion.
  - The Vue Password live region loses `opacity`, `pointer-events` and `white-space`; it is still hidden, matching the PrimeNG variant the Spec mandates.
- **Task 6:** type-only imports without the `type` modifier in `order-list`, `pick-list` and `table` (pre-existing).
- **Final fix:** a stale "no identifying attribute" comment in `packages/themes/test/cross-framework-consistency.test.ts`; the test logic is still correct.
- **Out of phase scope:** inherited prettier failures in touched files (no new ones added).

No new GAPs were created. The git-ignored progress log remains available for review: `.superpowers/sdd/2026-10-03-prime-parity-approved-designs/progress.md`.
