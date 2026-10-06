# Specification — GAP-064 C2-0: Angular ContextMenu Runtime and Story Corrections

**Date:** 2026-10-06
**Branch:** `feature/gap-064-c2-0-runtime-fixes` (from `docs/gap-064-cross-tranche-study` `95f3c65`)
**Status:** **Approved** (Revision 2, user, 2026-10-06). Spec Review decisions OI-1..OI-4 are recorded in §13. Implementation needs an approved Plan.
**Research input:** `docs/architecture/research/2026-10-06-gap-064-cross-tranche-study.md` — §4.1 (F-3c), §10 ("C2-0") and §11 (Spec Review amendments: the X-12 provenance correction, the TieredMenu popup defect, the scroll-aware divergence, the G3-C research correction). Additional facts verified for this Spec are in §4.
**Baseline (ADR-048):** PrimeNG 21.1.9 (`.vendor-cache/primeng-21.1.9.tar.gz`).

## 1. Purpose and scope

C2-0 is a small corrective step, approved to run **before** G3-C2 (study §10). It fixes pre-existing Angular ContextMenu runtime and story defects that would otherwise make G3-C2's ContextMenu open-state evidence meaningless. It is not Prime CSS parity work.

C2-0 contains only:

1. **R1 — Angular ContextMenu post-render positioning:** a timing-only fix.
2. **R2 — Angular ContextMenu non-global host trigger:** a documentation and Default-story correction (Option (b)).
3. **R3 — Verification:** the unit and e2e checks for R1 and R2.
4. **R4 — Provenance:** manifest entries for the source files C2-0 changes, plus changed-file completeness evidence.

C2-0 must not contain:

- TieredMenu popup positioning or a TieredMenu story change (removed, OI-1);
- Vue or React changes;
- CSS changes (component style modules untouched);
- public API changes (inputs, outputs, methods, signatures);
- DOM or template restructuring (X-2);
- PrimeNG's scroll-aware placement (OI-2);
- repository-wide provenance remediation (OI-3).

F-3a and F-3b belong to G3-C2.

## 2. Decisions this specification implements

- Study §10 "C2-0" items 1–2, as amended by §11 and the Spec Review decisions in §13.
- **X-2:** C2-0 is the separately authorized runtime/component correction X-2 refers to, limited to R1/R2. No DOM change is made to suit selectors.
- **X-3b:** R2 must not weaken any existing interaction guard.
- **X-6:** browser checks use fixed coordinates and park the pointer before resting checks.
- **X-12, as corrected in study §11:** provenance evidence is changed-file completeness (R4), not the repository-wide validator's output.
- C-4 (no new JavaScript inside the C2 CSS port) is unaffected: C2-0 is outside the port, by explicit authorization.

## 3. Framework applicability

Angular only (`packages/ng`). Vue ContextMenu already positions correctly (study §4.1). React is out of scope.

## 4. Existing behaviour (verified at `95f3c65`, Angular Storybook dev server, Playwright 1.63)

### 4.1 ContextMenu positioning (F-3c(i))

- `UContextMenu.show(event)` (`packages/ng/src/context-menu/context-menu.ts:158`) sets `visible` and `render`, then calls `queueMicrotask(() => this.position(pageX, pageY))`.
- `position()` (`:184`) reads `this.listRef?.nativeElement.parentElement` and returns early when it is undefined.
- The list lives inside `@if (render())`, so it does not exist until Angular runs change detection. The microtask runs first and `position()` returns early. The container keeps the CSS `.u-contextmenu { position: absolute; top: 0; left: 0 }`.
  - **Observed:** Global story, right-click at (60, 45) → menu at **(0, 0)**, inline `top`/`left` empty. 3/3 runs in Chromium, Firefox and WebKit.
- `ZIndex.set("menu", container, 1000)` is also inside `position()`, so the same early return skips it.
- **PrimeNG 21.1.9 reference (timing):** `show()` stores `pageX`/`pageY` and sets `visible`. Positioning happens in `onBeforeEnter(event)`, once the container element exists. If the menu is already visible, `show()` calls `position()` directly.
- **Algorithm (unchanged by C2-0):** PrimeNG's flip/fit is scroll-aware; Ultimate's is not. Recorded as a known divergence in study §11.
- **Unit tests:** `context-menu.spec.ts` asserts that the menu renders and the native menu is suppressed, but never asserts position.

### 4.2 ContextMenu non-global trigger (F-3c(ii))

- The only inputs are `model` and `global` (`:102–104`). There is **no `target` input**, although the class doc comment (`:21–33`) claims one.
- The host binding `"(contextmenu)": "onHostContextMenu($event)"` (`:54–55`) calls `show(event)` when `global` is false. This is the supported non-global trigger.
- The template renders only `@if (render()) { <div uOverlay appendTo="body"> … }`, with no `<ng-content>`, so the host has no content and an inline zero-width box (observed `0×18` Chromium/WebKit, `0×16` Firefox).
- The Default story places `<u-context-menu>` inside a dashed `div`. Right-clicking that area never reaches the host. **Observed: no menu, 3/3 runs × 3 engines.** The story file's comment ("right-click inside the story's canvas area") is inaccurate.
- **Hit-area feasibility (verified for this revision).** With only inline style on the existing host element (`display:block; min-height:6rem; border:1px dashed #999`), and no component change, in Chromium, Firefox and WebKit:
  - the host box becomes 1182×98 and still has no child elements;
  - a right-click inside it opens the menu (currently at (0,0), the R1 defect);
  - a right-click below it does not open the menu;
  - an outside left-click dismisses it.

  The host is therefore a genuine, testable right-click target under the existing component behaviour.

- **PrimeNG reference:** listens on `document` (`global`) or on `target`; no host fallback. Ultimate's host trigger is an Ultimate adaptation, documented as such under Option (b).

### 4.3 Provenance

At `95f3c65`, none of the files C2-0 would change has a `docs/architecture/provenance/ng.json` entry. The repository-wide validator stops at the first missing entry, so it cannot show this (study §11).

## 5. Required behaviour

### 5.1 R1 — ContextMenu positions after render (timing only)

- On every `show(event)`, the container's inline `left`/`top` are computed by the **existing, unchanged** `position()` algorithm **after** the list element exists. Every right-click repositions the menu, including while it is open, matching PrimeNG's timing.
- Placement stays: `left = pageX + 1`, `top = pageY + 1`; flipped by the container's size when it would exceed `innerWidth`/`innerHeight`; clamped at ≥ 0. No scroll-aware change.
- `ZIndex.set("menu", container, 1000)` runs on the same path.
- The timing mechanism (for example `afterNextRender` with the component injector, the precedent in `dialog.ts:290`) is chosen in the Plan. Requirements:
  - no new public API;
  - SSR-safe (no browser access on the server; the GAP-065 tests stay green);
  - no change to show/hide semantics, dismissal, Escape arbitration (GAP-067), or `onShow`/`onHide` emission.
- No CSS change. The `.u-contextmenu { top: 0; left: 0 }` default stays as the pre-position state.

### 5.2 R2 — Non-global host trigger documented and demonstrated

- **Class doc comment:**
  - remove the `target` claim;
  - state that the non-global trigger is a right-click on the `<u-context-menu>` host element;
  - state that the host renders no content (the menu is appended to `document.body`), so the consumer gives the host a hit area or uses `global`;
  - state that PrimeNG uses `target`/`global` with no host fallback, so the host trigger is an Ultimate adaptation.
- **Default story:** gives the `<u-context-menu>` host element a visible hit area through inline style in the story template only (the §4.2 feasibility form; exact values fixed in the Plan), with the instruction text outside the host.
- **Story file comment:** corrected to describe the host trigger (Default) and `global` (Global).
- **Unchanged:** the Global story; `onHostContextMenu`, `global` and every listener; the component template and CSS.
- **Stop rule:** if the implemented hit area is not reliable under these constraints in all three engines, stop and report. No other mechanism is introduced, and the rejected public `target` option is not revived.

### 5.3 R3 — Verification

See acceptance criteria AC1–AC3 (§9).

### 5.4 R4 — Changed-file provenance

- Add one `docs/architecture/provenance/ng.json` entry for **each source file C2-0 actually changes**: expected to be `context-menu.ts`, `context-menu.spec.ts`, `context-menu.stories.ts` and the new `packages/ng/e2e/context-menu.spec.ts` only if the validator's source walk covers `e2e/` (it walks `packages/ng/src` only, so expected not).
- The `modificationStatus` and wording follow the repository's existing conventions for Ultimate-adapted files. Exact text is fixed in the Plan.
- **Evidence:** a check over the C2-0 changed-file list (`git diff --name-only <branch point>...HEAD`, filtered to `packages/ng/src/**/*.{ts,tsx,vue}`) confirming that every file has a matching `ultimateDestination`. Recorded in the closeout.
- **Not done:** no change to `validate-provenance.mjs`, no other missing entries added, no attempt to make `provenance:validate` green. Its failures stay classified as pre-existing debt.

## 6. Removed from C2-0 (Spec Review)

- **TieredMenu popup (former R3, OI-1 = (b)).** No story change, no anchoring. Recorded in study §11 as a pre-existing Angular + Vue defect for a separate decision.
- **Scroll-aware placement (OI-2).** Recorded in study §11 as a known divergence.

## 7. API requirements

None. The public surface of `UContextMenu` is identical before and after, proven by typecheck and an unchanged exports/declaration comparison.

## 8. Affected files (at implementation; none changed by this Spec)

- `packages/ng/src/context-menu/context-menu.ts` — R1 timing, R2 doc comment.
- `packages/ng/src/context-menu/context-menu.spec.ts` — R1 unit tests.
- `packages/ng/src/context-menu/context-menu.stories.ts` — R2 Default story and comments.
- `packages/ng/e2e/context-menu.spec.ts` (new) — R1/R2 browser checks.
- `docs/architecture/provenance/ng.json` — R4 entries for the changed `src` files only.
- `docs/architecture/MIGRATION.md` — consumer-visible-change entry for R1 (exact text approved at Plan Review).

## 9. Acceptance criteria

1. **AC1 — Position (unit).** After `show(event)` and one render, the container's inline `left`/`top` equal `pageX + 1` / `pageY + 1` within the viewport, and the flipped values near the right/bottom edges. `ZIndex` is applied. The new test fails on the pre-change code.
2. **AC2 — Position (browser).** New `packages/ng/e2e/context-menu.spec.ts`, Global story, right-click at fixed coordinates (X-6): the menu's top-left is at (x + 1, y + 1) in Chromium, Firefox and WebKit, identical across 3 consecutive opens; a second right-click while open repositions it. Layout assertions only, no screenshot, no accessibility scan.
3. **AC3 — Host trigger (browser).** Default story, all 3 engines:
   - a right-click inside the host's visible hit area opens the menu at the pointer (x + 1, y + 1);
   - a right-click outside the host does not open it;
   - an outside left-click dismisses it.

   The native-menu suppression stays covered by the existing unit test (`preventDefault` spy).

4. **AC4 — No regressions.** The existing `context-menu.spec.ts` tests pass unchanged (show, select, disabled, outside-click, Escape, SSR GAP-065, Escape arbitration GAP-067). The Angular unit suite, typecheck and Angular SSR check pass.
5. **AC5 — Scope.** The diff touches only the §8 files. No `*-style.ts`, template-structure, input/output, Vue, React or TieredMenu change.
6. **AC6 — Doc accuracy.** No mention of a `target` input remains in `context-menu.ts` or the story file; the comments match §5.2.
7. **AC7 — Provenance (R4).** Every changed source file under `packages/ng/src` has an `ng.json` entry, shown by the §5.4 check. `provenance:validate`'s output is not used as evidence.
8. **AC8 — CI (X-12 as corrected).** On the merge commit, green by status: Build, Typecheck, Coverage measurement, the strict ng Playwright run (which includes the new e2e spec), and the accessibility baseline validation. Known pre-existing failures are unchanged.
9. **AC9 — Accessibility.** No new accessibility violation. The new e2e spec runs no scan and adds no baseline row. Whether any existing strict scan covers the changed Default story is confirmed at Plan time; any introduced violation stops the work.

## 10. Explicit out of scope

G3-C2 parity CSS and F-3a/F-3b; the TieredMenu popup defect and any TieredMenu change; Vue and React; PrimeNG's scroll-aware algorithm; ContextMenu nested submenus, touch long-press and a `target` input; the provenance validator and the remaining missing entries; U1, U2, BlockUI, the Axe race and F-1 removal.

## 11. Stop conditions

Stop and report, with no workaround, if:

- R1 cannot be met without a public API change or a template structure change;
- the R2 hit area is not reliable in all three engines under the §5.2 constraints;
- any existing ContextMenu test needs modification to pass;
- the Default story change introduces an accessibility violation;
- an unrelated test or baseline changes;
- a Vue, React, TieredMenu or CSS file would need to change.

## 12. Open items for re-review

None new. The revision applies OI-1..OI-4 as decided (§13).

## 13. Spec Review decisions (2026-10-06, user)

1. **OI-1 = (b).** F-3d removed from C2-0. Recorded in study §11 as a pre-existing TieredMenu popup defect (no positioning in Angular or Vue; `toggle()`/`show()` take no event; `-9999px` is only an off-screen initial position). Separate decision for both frameworks. No misleading story, no anchoring.
2. **OI-2 = timing-only.** The existing placement algorithm is kept. The scroll-aware difference is recorded in study §11 as a known divergence.
3. **F-3c(ii) Option (b), conditionally retained.** Kept only if the host hit area is real and testable with the existing component: no new API, no template change, no CSS change, no behaviour change. Verified feasible (§4.2); the stop rule in §5.2 applies at implementation.
4. **OI-3 = changed-file entries only.** `ng.json` entries for exactly the source files C2-0 changes. Not a validator fix and no global remediation. X-12 corrected (study §11): tranche-level changed-file completeness is the authoritative provenance evidence; the repository-wide validator is pre-existing debt and never establishes completeness.
5. **OI-4.** G3-C research correction recorded in study §11: Ultimate does not position the TieredMenu popup in JavaScript in either framework.
