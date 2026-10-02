# Specification — F4 SSR: Angular Scroller Browser Guard (GAP-080) and CI SSR Build-Order Verification

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-10-02
**Branch:** `feature/prime-parity-followup`
**Origin:** post-closeout scope lock (`docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §6–§7), GAP-080, branch closeout deferred item 6 (`docs/architecture/research/2026-10-01-prime-parity-branch-closeout.md`). Parity baseline: ADR-048 (PrimeNG 21.1.9).

**Required sequence:** Scope Lock → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for the last known Angular SSR crash-class defect, and define the operational check of the CI SSR job's build order.

**In scope:**

- GAP-080: `packages/ng/src/scroller/scroller.ts` reaches `ResizeObserver` from a server-executed hook.
- CI SSR build-order verification (operational item, not a GAP): whether `.github/workflows/ci.yml`'s `track-e-ssr-hydration` job can build its playground on a clean checkout.

**Out of scope:**

- the SSR styling contract (GAP-078, approved but deferred);
- making the CI SSR job fail on server-side prerender errors (named in GAP-080's resolution direction; not part of the locked scope);
- React/Vue SSR;
- any other CI job.

---

## 2. Human Decisions This Specification Implements

1. F4 contains GAP-080 plus the CI SSR build-order verification as an operational item; no new GAP is created for it (scope lock §7.8, user decision 2026-10-02 item 10).
2. GAP-080 uses GAP-065's proven pattern: an `isPlatformBrowser` guard plus spy-based server tests.
3. Pinned PrimeNG 21.1.9 is the normative reference (ADR-048).

---

## 3. Framework Applicability

GAP-080: Angular only. CI verification: the job's matrix (`playground-angular`, `playground-react`, `playground-vue`).

---

## 4. Existing Behavior

- **GAP-080:** `UScroller.ngAfterViewInit` (`scroller.ts:134-145`) reads `offsetHeight` and runs `new ResizeObserver(...)` with no browser guard. `ngAfterViewInit` runs during server rendering, where `ResizeObserver` is undefined. The Angular playground's prerender logs `ERROR ReferenceError: ResizeObserver is not defined`, but the build exits 0 and `ng-ssr-chromium` passes, so CI does not catch it. `ngOnDestroy` (`:147-148`) disconnects with optional chaining.
- **CI SSR job** (`ci.yml:183-228`): an independent job (no `needs:`, no shared artifacts). It runs on Node 24.15.0 (`:205`; the main `ci` job uses Node 20, `:30`): `pnpm install --frozen-lockfile`, then only `pnpm --filter ${{ matrix.dir }} run build` (`:211-212`), then the Playwright SSR project.
  - The playgrounds' `build` scripts (`ng build`, `vite build …`) do not build workspace packages.
  - The `@ultimate/*` packages they depend on export from `dist` (e.g. `@ultimate/react` `exports["."]` → `./dist/index.mjs`).
  - No playground aliases `@ultimate/*` to source.
  - On a clean checkout `dist` does not exist, so the job is expected to fail. This has never been confirmed by a real run, and the repository has no remote.

**Baseline Prime:** PrimeNG 21.1.9 `scroller/scroller.ts` does all view-init work inside `viewInit()`, guarded by `isPlatformBrowser(this.platformId) && !this.initialized` (`:679-680`), and binds its resize listener only under `isPlatformBrowser` (`:1142-1143`).

---

## 5. Required Behavior

### 5.1 GAP-080

1. Under a non-browser `PLATFORM_ID`, `UScroller.ngAfterViewInit` reaches no browser-only API: no `ResizeObserver` and no layout measurement. This matches PrimeNG's guard placement.
2. In the browser, behavior is unchanged: the initial `offsetHeight` measurement and the observer's re-measurement.
3. `ngOnDestroy` is safe on the server (no observer was created).
4. The Angular playground's prerender no longer logs the `ResizeObserver` error.

### 5.2 CI SSR build-order verification

1. Reproduce the job as CI would run it:
   - a fresh clone of `feature/prime-parity-followup` (no existing `dist`);
   - Node 24.15.0 and `pnpm install --frozen-lockfile`;
   - then exactly `pnpm --filter <dir> run build` for each of the three matrix entries.
2. Record the result per entry (pass/fail, first error) in this Spec's Plan ledger and in the closeout record.
3. Remediation if the failure is confirmed: **open question for Spec Review, §12.**

---

## 6. API Requirements

None.

---

## 7. Dependency Relationships

GAP-080 is independent. The CI verification is independent of GAP-080's code change. The Angular SSR playground prerender in 5.1.4 is observed with a locally built workspace.

---

## 8. Intentional Divergences That Must Remain Unchanged

`UScroller` keeps its `ResizeObserver`-based re-measurement (PrimeNG uses a window resize listener). Only where it runs changes.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                                        | Traces to                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Spy-based unit test: under a server `PLATFORM_ID`, mounting `UScroller` through change detection and destroy calls `ResizeObserver` zero times and does not throw; the test fails before the fix | GAP-080                  |
| Browser-platform tests: existing Scroller tests pass unchanged                                                                                                                                   | GAP-080 (non-regression) |
| `apps/playground-angular` production build/prerender log contains no `ResizeObserver is not defined`                                                                                             | GAP-080                  |
| `ng-ssr-chromium` Playwright project still passes                                                                                                                                                | Non-regression           |
| Clean-checkout reproduction of `track-e-ssr-hydration`'s build step recorded for all three matrix entries                                                                                        | CI verification          |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-080, GAP-065; `docs/architecture/research/2026-10-01-prime-parity-branch-closeout.md` (deferred item 6); `.github/workflows/ci.yml`; `apps/playground-{angular,react,vue}/package.json`; PrimeNG 21.1.9 `packages/primeng/src/scroller/scroller.ts` (in `.vendor-cache/`).

---

## 11. Explicit Out-of-Scope Items

GAP-078; failing CI on prerender errors; React/Vue SSR; other CI jobs; newer commercial Prime releases (ADR-048).

---

## 12. Open Question for Spec Review

If the clean-checkout reproduction confirms the build fails:

- **(a) Record only.** The result goes into the closeout record; any workflow change becomes later operational work.
- **(b) Record and apply the minimal workflow fix in this phase.** In `track-e-ssr-hydration`, build each playground's workspace dependencies before the playground (e.g. `pnpm --filter "<dir>..." run build`), then re-verify by the same reproduction. This touches `ci.yml` only.

Recommendation: (b). Without it the SSR job, which is the CI evidence for GAP-080 and the earlier GAP-065 work, cannot run green on a clean checkout. The change is one workflow step and adds no new check.
