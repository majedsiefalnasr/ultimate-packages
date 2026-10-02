# Prime Parity: SSR Implementation Plan (GAP-065)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task. The 8 verification tasks (Task 2-9) are lower-risk than the 2 fix tasks (Task 1) — but per the human decision's own explicit condition, each still gets its own independently-reviewed cycle rather than being batched, since each is a distinct, citable piece of evidence.

**Goal:** Fix the 2 confirmed Angular SSR defects (`ScrollPanel`, `ContextMenu`); individually verify and document, per confirmed component, why the remaining 8 (`Breadcrumb`, `ColorPicker`, `ConfirmPopup`, `Knob`, `Popover`, `Slider`, `Splitter`, `StyleClass`) require no code fix.

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-ssr-design.md`.

**Investigation result, authoritative for this Plan (confirmed during Plan-stage investigation, human-approved):**

| Component    | Result               | Evidence                                                                                                                                                                                                                                                                                                                                   |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ScrollPanel  | **Confirmed defect** | `ngAfterViewInit()` unconditionally calls `this.moveBar()` (→ `window.getComputedStyle`) and `window.addEventListener("resize", ...)`.                                                                                                                                                                                                     |
| ContextMenu  | **Confirmed defect** | `ngOnInit()` unconditionally calls `document.addEventListener("contextmenu", ...)` when `global()` is true.                                                                                                                                                                                                                                |
| Breadcrumb   | **Confirmed safe**   | `isCurrent()`'s `window.location` access is already guarded by `typeof window !== "undefined"`.                                                                                                                                                                                                                                            |
| ColorPicker  | **Confirmed safe**   | `document.addEventListener` calls live only in `bindDragListeners()`, reachable only from `onColorMouseDown`/`onHueMouseDown` (mouse event handlers, never a lifecycle hook).                                                                                                                                                              |
| ConfirmPopup | **Confirmed safe**   | `document`/`window.addEventListener` calls live only in `bindDismissListeners()`, reachable only from `show()`, itself reachable only from a `UConfirmationService` subscription callback that fires only on a real user-triggered `confirm()` call.                                                                                       |
| Knob         | **Confirmed safe**   | `document.addEventListener` call lives only in `onMouseDown` (a mouse event handler). Zero lifecycle hooks in the file.                                                                                                                                                                                                                    |
| Popover      | **Confirmed safe**   | Same pattern as ConfirmPopup — `document`/`window.addEventListener` calls live only in `bindDismissListeners()`, reachable only from the imperatively-invoked public `show()` method.                                                                                                                                                      |
| Slider       | **Confirmed safe**   | `document.addEventListener` call lives only in `bindDragListeners()`, reachable only from `onMouseDown` (a mouse event handler).                                                                                                                                                                                                           |
| Splitter     | **Confirmed safe**   | `ngAfterContentInit()` (a lifecycle hook that does run server-side) calls only `this.panels()`/`this.panelSizes.set(...)`/`this.destroyRef.onDestroy(...)` — zero `window`/`document` access. All `document.addEventListener` calls live in `bindMouseListeners()`/`bindTouchListeners()`, reachable only from mouse/touch event handlers. |
| StyleClass   | **Confirmed safe**   | `document.querySelector` (in `resolveTarget()`) and all `document`/`window.addEventListener` calls are reachable only from `onClick()` (a `@HostListener("click")` handler), never from a lifecycle hook.                                                                                                                                  |

**This table is the binding basis for Tasks 1-9 below — no task re-derives this evidence; each verification task cites its own row directly.** (Re-checked against HEAD 2026-10-01: still accurate. Destroy paths — which also run server-side — only remove listeners that were actually registered, so they are safe too.)

**Verification method — corrected 2026-10-01 (pre-dispatch check, user decision; see Spec §12):** the test sketches below mount under `PLATFORM_ID: 'server'` and assert "does not throw". Unit tests run in jsdom, where `window` and `document` always exist, so such assertions can never fail and prove nothing; the "Tooltip spec pattern" they point to does not exist (`tooltip.spec.ts` has no `PLATFORM_ID` override; `tooltip.ts:101` guards with `isPlatformBrowser(this.platformId)`). **Every task instead uses spy-based tests:** provide `{ provide: PLATFORM_ID, useValue: "server" }`, spy on the browser-global APIs the component touches (e.g. `window`/`document` `addEventListener`/`removeEventListener`, `window.getComputedStyle`, `document.querySelector`, and `window.location` reads where relevant), then mount, run change detection (including any lifecycle hooks the component has) and destroy the fixture, and assert **zero** calls. Task 1's tests must fail against the current `ScrollPanel`/`ContextMenu` before the fix and pass after; Task 1 also keeps a browser-platform test proving `global()` still registers its listener client-side. Tasks 2-9 add the same spy-based test for their component with no production change. Breadcrumb (Task 2) is guarded by `typeof window`, not `PLATFORM_ID`, so its test asserts the guarded `window.location` read is not reached when `window` is undefined, or otherwise documents the guard precisely — the implementer chooses the narrowest real assertion and explains it. The real Playwright SSR harness is not changed.

## Global Constraints

- **No task adds an `isPlatformBrowser` guard to any of the 8 confirmed-safe components.** Adding a defensive guard to code that provably never executes server-side would be unnecessary code, not requested by any GAP.
- **React's and Vue's own equivalent components are not touched by any task.** Parity Confirmed, kept separate.
- **Track E's original 8-component proof set is not touched.** Already verified safe.
- **The fix pattern is fixed, not redesigned:** `isPlatformBrowser(this.platformId)` via `UBaseComponent`'s existing `inject(PLATFORM_ID)`, matching `Tooltip`'s own already-proven pattern exactly.

## Review Focus

- **`ScrollPanel`'s fix guarding `ngAfterViewInit`'s `window` calls but not `calculateContainerHeight`'s own separate `window.getComputedStyle` calls (called from `moveBar`)** — both call sites need the guard, or the guard needs to wrap the outer call such that neither inner call is reached server-side; a partial fix that guards one `window` access but not the other, reachable via the same code path, would leave the defect only partially fixed.
- **`ContextMenu`'s fix must not disable the `global()` feature entirely** — the guard should skip the `document.addEventListener` registration during SSR and register it once hydration completes client-side (matching Angular's own standard SSR-then-hydrate pattern for deferred browser-only setup), not silently drop the `global` binding capability for the app's entire lifetime.

---

### Task 1: Angular — GAP-065 fix `ScrollPanel` and `ContextMenu`

**Files:**

- Modify: `packages/ng/src/scroll-panel/scroll-panel.ts`, `packages/ng/src/context-menu/context-menu.ts`
- Test: `packages/ng/src/scroll-panel/scroll-panel.spec.ts`, `packages/ng/src/context-menu/context-menu.spec.ts`, plus an SSR-specific test if this repo's existing SSR harness (`apps/playground-angular/e2e/ssr-hydration.spec.ts`) supports adding new component cases — check that file's own existing structure first.

- [ ] **Step 1: Write the failing tests**

```typescript
// scroll-panel.spec.ts, additive:
describe("SSR safety (Spec §5, GAP-065)", () => {
  it("ngAfterViewInit does not throw when window/document are unavailable", () => {
    // Simulate SSR by stubbing PLATFORM_ID to 'server', matching this
    // repo's own existing SSR-simulation pattern (check Tooltip's own
    // spec file for the established TestBed provider-override shape used
    // to prove its own isPlatformBrowser guard — copy that pattern here).
    const fixture = TestBed.createComponent(
      UScrollPanel /* with PLATFORM_ID overridden to 'server' */
    );
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

// context-menu.spec.ts, additive:
describe("SSR safety (Spec §5, GAP-065)", () => {
  it("ngOnInit does not throw when window/document are unavailable, even with global=true", () => {
    const fixture = TestBed.createComponent(
      UContextMenu /* with PLATFORM_ID overridden to 'server' */
    );
    fixture.componentRef.setInput("global", true);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it("registers the global contextmenu listener once running client-side", () => {
    // Confirm the guard doesn't permanently disable the feature — once
    // isPlatformBrowser is true (the normal client-side case, the default
    // TestBed platform), the listener still registers and still works,
    // matching this file's own pre-existing "global" test if one exists.
  });
});
```

- [ ] **Step 2: Implement**

In `packages/ng/src/scroll-panel/scroll-panel.ts`:

1. Inject `PLATFORM_ID` and import `isPlatformBrowser` from `@angular/common` (matching `Tooltip`'s own exact import/injection pattern).
2. Wrap `ngAfterViewInit`'s entire body in `if (isPlatformBrowser(this.platformId)) { ... }` — this covers `moveBar()`, `calculateContainerHeight()`, and the `window.addEventListener` call in one guard, addressing Review Focus item 1 by guarding the outer call rather than each inner one separately.

In `packages/ng/src/context-menu/context-menu.ts`:

1. Same injection pattern.
2. Wrap `ngOnInit`'s `if (this.global()) { ... }` block in an additional `isPlatformBrowser(this.platformId) &&` check (or nest it), so the `document.addEventListener("contextmenu", ...)` call is skipped server-side but still registers normally once the component runs client-side (addressing Review Focus item 2 — this is a guard on _when_ registration happens, not a permanent feature removal).

- [ ] **Step 3: Run tests, verify green**

`pnpm --filter @ultimate/ng test -- scroll-panel.spec.ts context-menu.spec.ts`.

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm --filter @ultimate/ng test`, ng typecheck, `pnpm run ceiling:validate` (corrected 2026-10-01: originally `pnpm test`).

---

### Task 2: Angular — GAP-065 verify Breadcrumb (no fix)

**Files:** no source modification. Test: `packages/ng/src/breadcrumb/breadcrumb.spec.ts` (additive verification test only).

- [ ] **Step 1: Write the verification test**

```typescript
describe("SSR safety verification (Spec §5 tier 2, GAP-065)", () => {
  it("isCurrent does not throw when window is unavailable (already-guarded)", () => {
    const fixture = TestBed.createComponent(UBreadcrumb);
    fixture.componentRef.setInput("model", [{ label: "A", routerLink: "/a" }]);
    // isCurrent's own typeof window !== "undefined" guard (confirmed at
    // breadcrumb.ts:122) is what this test asserts remains present and
    // effective — no PLATFORM_ID simulation is needed here since the
    // guard is a plain typeof check, not an Angular-specific mechanism.
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
```

- [ ] **Step 2: No implementation change.** Confirmed evidence: `isCurrent()`'s `window.location.pathname` access is already guarded by `typeof window !== "undefined"` (`breadcrumb.ts:122`), called from the template's `[attr.aria-current]` binding, which does evaluate server-side, but the guard itself prevents any actual `window` access from occurring when `window` is undefined.

- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling (regression check only — no new production code to verify beyond the existing guard).

---

### Task 3: Angular — GAP-065 verify ColorPicker (no fix)

**Files:** no source modification. Test: `packages/ng/src/color-picker/color-picker.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `UColorPicker` under a `PLATFORM_ID: 'server'` override, call `fixture.detectChanges()`, assert no throw. Do **not** trigger `onColorMouseDown`/`onHueMouseDown` in this test (those are real mouse handlers that would only run client-side in production; the test's own point is that mounting/rendering alone, which is what genuinely happens during SSR, never reaches `bindDragListeners()`).
- [ ] **Step 2: No implementation change.** Confirmed evidence: `document.addEventListener` calls live only inside `bindDragListeners()`, itself called only from `onColorMouseDown`/`onHueMouseDown` — both mouse event handlers, never invoked during SSR (no user interaction exists server-side, and neither is called from any lifecycle hook).
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 4: Angular — GAP-065 verify ConfirmPopup (no fix)

**Files:** no source modification. Test: `packages/ng/src/confirm-popup/confirm-popup.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `UConfirmPopup` under `PLATFORM_ID: 'server'`, `detectChanges()`, assert no throw, without firing a confirmation via `UConfirmationService` (the test's own point is that mere mounting never reaches `show()`).
- [ ] **Step 2: No implementation change.** Confirmed evidence: `document`/`window.addEventListener` calls live only in `bindDismissListeners()`, called only from `show()`, itself called only from the constructor's `requireConfirmation$.subscribe()` callback — which only fires when a real confirmation matching this component's `key()` is actually requested, never during initial mount/SSR.
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 5: Angular — GAP-065 verify Knob (no fix)

**Files:** no source modification. Test: `packages/ng/src/knob/knob.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `UKnob` under `PLATFORM_ID: 'server'`, `detectChanges()`, assert no throw, without triggering `onMouseDown`.
- [ ] **Step 2: No implementation change.** Confirmed evidence: the file's only `document.addEventListener` call lives inside `onMouseDown`, a mouse event handler; the file contains zero lifecycle hooks of any kind.
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 6: Angular — GAP-065 verify Popover (no fix)

**Files:** no source modification. Test: `packages/ng/src/popover/popover.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `UPopover` under `PLATFORM_ID: 'server'`, `detectChanges()`, assert no throw, without calling `show()`.
- [ ] **Step 2: No implementation change.** Confirmed evidence: same pattern as ConfirmPopup — `bindDismissListeners()` is reachable only via the imperatively-invoked public `show()` method, never from a lifecycle hook.
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 7: Angular — GAP-065 verify Slider (no fix)

**Files:** no source modification. Test: `packages/ng/src/slider/slider.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `USlider` under `PLATFORM_ID: 'server'`, `detectChanges()`, assert no throw, without triggering `onMouseDown`.
- [ ] **Step 2: No implementation change.** Confirmed evidence: `document.addEventListener` calls live only in `bindDragListeners()`, called only from `onMouseDown`, a mouse event handler.
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 8: Angular — GAP-065 verify Splitter (no fix)

**Files:** no source modification. Test: `packages/ng/src/splitter/splitter.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — mount `USplitter` under `PLATFORM_ID: 'server'`, `detectChanges()` (which does run `ngAfterContentInit`, a real lifecycle hook that genuinely executes server-side), assert no throw.
- [ ] **Step 2: No implementation change.** Confirmed evidence: `ngAfterContentInit` (the one lifecycle hook in this file that does run server-side) touches only `this.panels()`, `this.panelSizes.set(...)`, and `this.destroyRef.onDestroy(...)` — zero `window`/`document` access. All actual `document.addEventListener` calls live in `bindMouseListeners()`/`bindTouchListeners()`, reachable only from `onGutterMouseDown`/`onGutterTouchStart` (mouse/touch event handlers).
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

### Task 9: Angular — GAP-065 verify StyleClass (no fix)

**Files:** no source modification. Test: `packages/ng/src/style-class/style-class.spec.ts` (additive).

- [ ] **Step 1: Write the verification test** — instantiate `UStyleClass` (a directive, not a component with its own template — check the existing spec file's own established harness for testing a directive-only class, likely via a small host test component) under `PLATFORM_ID: 'server'`, assert no throw, without triggering a `click`.
- [ ] **Step 2: No implementation change.** Confirmed evidence: `document.querySelector` (`resolveTarget()`) and every `document`/`window.addEventListener` call are reachable only from `onClick()` (`@HostListener("click")`), never from `ngOnDestroy` or any other lifecycle context.
- [ ] **Step 3-4:** Run the new test, full suite, dependency ceiling.

---

## Completion Criteria

- Task 1's fix stops `ScrollPanel` and `ContextMenu` from touching browser globals under a server `PLATFORM_ID` (spy-based; corrected 2026-10-01 from "render without throwing", which jsdom cannot detect).
- Tasks 2-9 each add one verification test confirming the already-safe behavior, with zero production-code changes (verify via `git diff` showing only test-file additions for Tasks 2-9).
- `pnpm --filter @ultimate/ng test`, the ng typecheck and `pnpm run ceiling:validate` pass after every task (corrected 2026-10-01: originally `pnpm test`; the full-monorepo run has pre-existing unrelated failures).
- Every new SSR test is spy-based and non-vacuous (see "Verification method" above); Task 1's tests are shown failing before the fix.
- React and Vue files are untouched (verify via `git status`).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-065 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`, updating its own "PARTIAL (2 of 10 fully confirmed...)" status line to reflect that all 10 are now confirmed (2 fixed, 8 verified safe) — not performed by this plan document.
