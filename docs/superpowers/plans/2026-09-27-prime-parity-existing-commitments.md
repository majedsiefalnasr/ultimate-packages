# Prime Parity: Existing Commitments Implementation Plan (GAP-066–GAP-068, GAP-070)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task. GAP-070's own two-step internal sequencing (characterize, then fix per-component) means its own task is itself split into a characterization sub-task and a fix sub-task, reviewed separately, since a wrong characterization would silently produce a wrong fix set.

**Goal:** Fix Angular Tooltip's visibility defect (GAP-066); build out Angular `UMenu`'s popup mechanism and simplify `USplitButton` to use it (GAP-067); extend React/Vue's `tsup` per-component subpath exports (GAP-068); characterize and extend Angular's `ng-packagr` secondary-entry-point convention to components shipped after the original proof set (GAP-070).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-existing-commitments-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-066 | Task 1 |
| GAP-067 | Task 2 (build popup mechanism), Task 3 (simplify SplitButton) |
| GAP-068 | Task 4 (React), Task 5 (Vue) |
| GAP-070 | Task 6 (characterization), Task 7 (fix, gated on Task 6) |

**Corrections (2026-10-01, pre-dispatch check, user decisions — see Spec §12):**
1. **TS2729 prerequisite (supersedes the Global Constraint "TS2729 is not addressed by any task" for this one blocker).** `pnpm --filter @ultimate/ng build` fails at the primary entry point with TS2729 ("Property 'instanceCount' is used before its initialization") in `packages/ng/src/autocomplete/autocomplete.ts:156` and `packages/ng/src/select/select.ts:162`, so no ng-packagr build — and therefore no Task 6 characterization — is possible. User decision: a new **Task 5b** fixes it minimally before Task 6 (declare each `private static instanceCount` before the instance field that reads it; no behavior change; existing tests must still pass; a full `@ultimate/ng` build must then get past these errors — any further build error is reported, not fixed).
2. **Advertised-but-unbuilt subpaths.** `packages/ng/package.json` `exports` already lists 81 component subpaths, but only 9 components have an `ng-package.json`, so 72 advertised subpaths point at artifacts the build never produces. Task 7 therefore *reconciles* rather than only adds: it adds entry points for components Task 6 marks passing (their `exports` entries mostly already exist), and reports the remaining advertised subpaths with no entry point (Task 6 failures plus GAP-009's excluded five) for a user decision on whether to keep or remove them — it does not remove them on its own.
3. Task 1 (revised after Task 1 stop, user decisions): (a) the Angular Storybook preview never provided `ComponentIdGenerator` (an app-provided `@Injectable()`, provided by the playground and unit tests), so every Tooltip and Dialog story fails with NG0201 and the Tooltip e2e cannot run — Task 1 adds it to the global providers in `packages/ng/.storybook/preview.ts` (tooling only); (b) the root cause is `.u-tooltip { display: none }` in `packages/uix-styles/src/tooltip/index.ts`; the inline `display: inline-block` is set in `create()`, not at the end of `align()` as Step 2 originally said, because `align()` measures the container first and a `display: none` element measures 0×0 (Vue's GAP-039 fix also sets it at creation); (c) visual baselines are generated in a Linux container to match CI and Docker is unavailable locally — Task 1 does not regenerate baselines; functional e2e assertions are verified locally, and the Tooltip (and, if affected, Dialog) visual baselines must be regenerated in the Linux container before merge.
4. Task 2 (after Task 2 stop, user decisions): (a) Escape registers at `ESCAPE_PRIORITIES.MENU`, not `OVERLAY_PANEL` — menu-type components use `MENU` (Angular `context-menu.ts:236`, React `menu.tsx:159`), consistent with the Review Focus; (b) "topmost" is decided by open order via `displayOrderRegistry` (group `"menu"`), as React's `useDisplayOrder` and Angular `UImage` (`image.ts:183-189`) do, not by UPopover's creation-order `instanceUid`; (c) `UOverlay` has no `baseZIndex` input (only `visible`/`appendTo`, base 1000), so `UMenu` applies `ZIndex.set("menu", <panel>, baseZIndex)` to its own panel and clears it on hide/destroy (default 0, matching Vue), as UPopover/UContextMenu/Vue Menu do — `UOverlay` is unchanged; (d) Step 1 test 8 has no UPopover assertion to copy — write it fresh against the panel's z-index and the overlay's `appendTo`. Clear-from-source behaviors: item click runs the command then hides (React `menu.tsx:312-313`); outside click and window resize hide (UPopover); anchor via the trigger's `getBoundingClientRect()`; `isPlatformBrowser` guards. Mechanical: `escapeRegistry` matches `event.code`; a function-form `appendTo` is resolved in `UMenu` (fallback `"body"`); `hide(event?)`; `toggle` is a no-op in inline mode.
5. Tasks 2+3 land together (after Task 2's second stop, user decision): making `popup` real hides `<u-menu [popup]="true">` until `show()`/`toggle()`, which breaks `USplitButton` (it renders the popup menu itself, `split-button.ts:68-72`) and the Menu `Popup` story (no trigger, `menu.stories.ts:49-55`; e2e `packages/ng/e2e/menu.spec.ts:73-82`). Task 3 is done in the same change so every commit stays green, with one joint review. GAP-067 also covers the story/e2e: add a trigger button to the `Popup` story that calls `toggle($event)`, make its e2e click it first, and add its screenshot baseline to the "regenerate in the Linux container before merge" list.
6. Task 3 acceptance bar (after Task 3 stop, user decision): the UMenu popup portals its panel to `document.body`, so USplitButton's pre-existing unit tests — which query the menu inside the component (`fixture.nativeElement`) — cannot find it, and the old Escape test dispatches a key-only event that `escapeRegistry` (which matches `event.code`) ignores. The tests' **queries** may change (find the menu via `debugElement`, as the Menu/Popover specs do; give the Escape event `code: "Escape"`) while **every assertion stays the same**. The menu's new DOM location (body portal instead of inside `.u-splitbutton`) is a disclosed consumer-facing change.
7. GAP-067 review fix-loop (user decisions after the Tasks 2+3 review): (a) **Escape key collision** — `escapeRegistry` keeps one handler per (tier, key) (`packages/uix-utils/src/escape/registry.ts:14,35-44`); `UMenu` keys by open order while Angular `UContextMenu` keyed by its own instance counter at the same `MENU` tier, so their keys can collide (lost handler) or mis-order. `UContextMenu` therefore also keys by `displayOrderRegistry` in the shared `"menu"` group, matching React/Vue ContextMenu (`useDisplayOrder`/`createDisplayOrderMixin`) — touches `context-menu.ts` + spec, with a cross-component Escape test; (b) **opening click** — `UMenu.show()` no longer stops propagation (React parity): the outside-click listener is bound after the opening click, so opening one popup closes others and other document listeners still see the click; (c) a function-form `appendTo` is resolved on each open, not cached.
8. Task 4 React build (after Task 4 stop, user decision): with every component entry, tsup's bundled declaration step (`dts: true`) exhausts the default Node heap (`ERR_WORKER_OUT_OF_MEMORY`), and CI's `pnpm run build` sets no heap size. React mirrors Vue's setup instead (`packages/vue/package.json` build script; `packages/vue/tsup.config.ts` `dts: false`): tsup `dts: false`, then `tsc --emitDeclarationOnly` with a declaration tsconfig, then the existing `scripts/rename-dts.mjs`, so every exported `.d.mts` still exists. No heap tuning. **Follow-up decision:** `tsc`'s per-file `.d.mts` output keeps extensionless relative specifiers (`./button`), which consumers cannot resolve, so React's `scripts/rename-dts.mjs` is extended to rewrite relative specifiers in the emitted declarations to `./x.mjs` / `./x/index.mjs`, verified by a scratch consumer type-check (Bundler and NodeNext). Vue's shipped declarations already have this defect plus unresolvable `./*.vue` imports (pre-existing) — registered separately as GAP-079, not fixed here. Vue's `ripple` entry without a `./ripple` export is left as is (not an advertised subpath).
9. **Task 5c, second prerequisite (after Task 5b, user decision):** with TS2729 fixed (`4a47883`), the `@ultimate/ng` build stops at "Writing package manifest": `Dependency @angular/cdk must be explicitly allowed using the "allowedNonPeerDependencies" option` (`@angular/cdk` was added to `dependencies` in `f757975` for OrderList/PickList drag-and-drop; `packages/ng/ng-package.json` never allowed it). Matching PrimeNG 21.1.9, `@angular/cdk` moves to `peerDependencies` (kept as a devDependency so the repo builds and tests), with the lockfile updated. Any further build error is reported, not fixed. The 20 ng-packagr warnings that `package.json` `exports` conditions would be overridden are input to Task 7.
10. **Task 7 scope after Task 6 (user decisions, 2026-10-01; evidence `docs/architecture/research/2026-10-01-gap-070-ng-secondary-entry-characterization.md`):** add `ng-package.json` secondary entries for the 61 components that build (no `exports` additions — all 61 are already advertised); **remove** from `packages/ng/package.json` `exports` the 11 advertised subpaths that can never build (`./textarea`, `./select-button`, `./file-upload`, `./split-button`, `./drawer`, `./confirm-dialog`, `./confirm-popup`, `./dynamic-dialog`, `./overlay-badge`, `./panel`, `./scroll-top`), so every advertised subpath is built and the CI pack/install integrity check (`scripts/provenance/pack-install-integrity.mjs`) passes for `@ultimate/ng`. Keep the hand-written `types`/`default` conditions despite ng-packagr's warnings (publishing resolves through the hand-written `package.json`). The corrected crash trigger is recorded in GAP-070 only; GAP-009/GAP-023 stay unchanged. The barrel/subpath duplicate-class hazard is GAP-081.
11. Test commands are per package (`pnpm --filter <pkg> test`), not full-monorepo `pnpm test`, which has pre-existing unrelated failures.

**Investigation result for GAP-067, authoritative for Task 2 (confirmed during Plan-stage investigation, human-approved corrected surface):**

- **Inputs:** `appendTo`, `baseZIndex`, `closeOnEscape`.
- **Outputs:** `onShow`, `onHide`.
- **Imperative public API:** `toggle(event)`, `show(event)`, `hide(event)` — Angular's own established template-reference/public-method convention, matching `UPopover`'s already-existing `toggle`/`show`/`hide` pattern (`packages/ng/src/popover/popover.ts`), not a new architectural pattern.
- **`closeOnEscape` is load-bearing, not optional:** confirmed via real React `UMenu`'s own `isCloseOnEscape = !!(visible && popup && closeOnEscape)` (`packages/react/src/menu/menu.tsx:112`) — the prop only has meaning once a real popup-visibility state machine exists to gate Escape against, which is exactly what Task 2 builds.

## Global Constraints

- **GAP-009/GAP-023 are not modified.** No task reads, tests, or reasons about changing either entry's own text in `docs/architecture/BLUEPRINT_GAPS.md` (Plan-stage: no doc changes are made by any task regardless).
- **GAP-009/GAP-023's own already-excluded 5 components** (`button`, `dialog`, `menu`, `table`, `input-text`) **are not reopened by Task 6/7.** Task 6's own characterization step explicitly excludes re-testing these 5 — they remain excluded on GAP-009's own already-established basis, not re-investigated.
- **TS2729 is not addressed by any task in this Plan.** Per the Spec's own §2.2, it relates only to the ng-packagr commitment's own build-verification prerequisite, not to any of GAP-066/067/068/070's own requirements. If TS2729 blocks a real build attempt during Task 6/7's own execution, that is reported as a blocker, not silently worked around.
- **React's and Vue's own already-working Menu/SplitButton popup mechanisms are the template for Task 2/3, never themselves modified.**
- **Angular's own structurally different `ng-packagr` mechanism (Task 6/7) is unrelated to React/Vue's `tsup` mechanism (Task 4/5)** — no task conflates the two.

## Review Focus

- **`UMenu`'s new popup mode combined with an already-open instance when a second `UMenu` is toggled open** — matching React's own `displayOrder`/Escape-priority-registry pattern (confirmed present in React's `UMenu` via `useDisplayOrder`/`ESCAPE_PRIORITIES`), a reasonable person expects Angular's own new popup mechanism to participate in the same cross-instance Escape-priority arbitration `UDialog`/`UPopover` already use (`escapeRegistry`), not a naive single-global-listener that would let two open popups' Escape handlers both fire on one keypress.
- **`USplitButton`'s existing consumers relying on its own current hand-rolled overlay's specific CSS classes/DOM structure** — Task 3's own simplification changes `USplitButton`'s internal implementation; its test suite must confirm the *externally observable* behavior (menu opens/closes, items are clickable, ARIA roles present) is unchanged, not merely that internal delegation happened.
- **GAP-070's characterization step producing a false negative** (a component that doesn't hit the `ShimReferenceTagger` trigger during a quick check but would under a full build) — Task 6's own verification must be a real `ng-packagr` build attempt per component, not a static import-graph guess, matching GAP-009's own original characterization methodology (a real, reproducible repro, not inferred).

---

### Task 1: Angular — GAP-066 Tooltip visibility fix

**Files:**
- Modify: `packages/ng/src/tooltip/tooltip.ts`
- Test: `packages/ng/e2e/tooltip.spec.ts` (real-browser Playwright test, confirmed already present and currently asserting the known failure per GAP-066's own evidence)

- [ ] **Step 1: Convert the existing failing-assertion test to assert correct behavior**

In `packages/ng/e2e/tooltip.spec.ts`, find the existing assertion `expect(computedDisplay).toBe("none")` (cited directly in GAP-066's own evidence) and convert it to `expect(computedDisplay).not.toBe("none")`, mirroring exactly how GAP-039's own resolution converted Vue's equivalent test (`packages/vue/e2e/tooltip.spec.ts`) — read that file's own diff/history (commit `26feee7`) as the direct template for this conversion's shape.

- [ ] **Step 2: Implement**

In `packages/ng/src/tooltip/tooltip.ts`'s `align()` method, add one line alongside the existing `this.renderer.setStyle(container, "left", ...)`/`"top"` calls: `this.renderer.setStyle(container, "display", "inline-block");` — the exact same property/value GAP-039 added to Vue's own `showTooltip()`, using Angular's own `Renderer2.setStyle` API instead of Vue's plain `style` object assignment (a mechanism difference, not a behavioral one).

- [ ] **Step 3: Run tests, verify green**

`pnpm --filter @ultimate/ng test -- tooltip.spec.ts` (unit), then the real-browser e2e suite (`pnpm --filter @ultimate/ng e2e` or this repo's own established e2e command — confirm exact command from `package.json`).

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 2: Angular — GAP-067 build UMenu's popup-overlay mechanism

**Files:**
- Modify: `packages/ng/src/menu/menu.ts`
- Test: `packages/ng/src/menu/menu.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
describe("popup-overlay mechanism (Spec §5.2, GAP-067)", () => {
  it("popup mode renders no menu until toggled open", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeFalsy();
  });

  it("show(event) opens the popup and emits onShow", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    const shown = vi.fn();
    fixture.componentInstance.onShow.subscribe(shown);
    fixture.detectChanges();
    fixture.componentInstance.show(new MouseEvent("click"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeTruthy();
    expect(shown).toHaveBeenCalled();
  });

  it("hide() closes the popup and emits onHide", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    const hidden = vi.fn();
    fixture.componentInstance.onHide.subscribe(hidden);
    fixture.detectChanges();
    fixture.componentInstance.show(new MouseEvent("click"));
    fixture.detectChanges();
    fixture.componentInstance.hide();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeFalsy();
    expect(hidden).toHaveBeenCalled();
  });

  it("toggle(event) opens when closed and closes when open", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    fixture.detectChanges();
    fixture.componentInstance.toggle(new MouseEvent("click"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeTruthy();
    fixture.componentInstance.toggle(new MouseEvent("click"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeFalsy();
  });

  it("Escape closes the popup when closeOnEscape is true (default)", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    fixture.detectChanges();
    fixture.componentInstance.show(new MouseEvent("click"));
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeFalsy();
  });

  it("Escape does not close the popup when closeOnEscape is false", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.componentRef.setInput("popup", true);
    fixture.componentRef.setInput("closeOnEscape", false);
    fixture.detectChanges();
    fixture.componentInstance.show(new MouseEvent("click"));
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeTruthy();
  });

  it("closeOnEscape has no effect when popup is false (inline mode)", () => {
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menu]")).toBeTruthy();
  });

  it("appendTo and baseZIndex are forwarded to the popup overlay", () => {
    // Assert UOverlay (or whichever composition UMenu uses for the popup)
    // receives these two inputs — exact assertion shape depends on
    // UOverlay's own testable contract; match UPopover's own existing test
    // for the equivalent assertion, do not invent a new one.
  });
});
```

- [ ] **Step 2: Implement**

1. Add inputs: `appendTo = input<HTMLElement | (() => HTMLElement)>();`, `baseZIndex = input<number>();`, `closeOnEscape = input(true, { transform: booleanAttribute });`.
2. Add outputs: `onShow = output<void>();`, `onHide = output<void>();`.
3. Add a `visible`/`render` signal pair, matching `UPopover`'s own exact two-signal pattern (`visible` for logical state, `render` for mount/unmount timing).
4. Add public methods `show(event: Event)`, `hide()`, `toggle(event: Event)`, matching `UPopover`'s own method bodies (positioning logic can reuse `UPopover`'s own `getBoundingClientRect()`-based approach if `UMenu`'s popup needs to anchor to a trigger element — confirm from the Spec whether anchoring is required, or if the popup simply renders in a fixed/default position; if unclear, treat anchoring-to-trigger as required, matching every other popup-family component in this codebase).
5. Compose `UOverlay` (matching `UPopover`/`UDialog`'s own established composition) for the body-append + z-index behavior, forwarding `appendTo`/`baseZIndex`.
6. Register/unregister with `escapeRegistry` (matching `UPopover`'s own `ESCAPE_PRIORITIES.OVERLAY_PANEL` registration) when `popup()` is true and `closeOnEscape()` is true and the menu is visible — addressing Review Focus item 1's cross-instance arbitration concern.
7. In the template, wrap the existing `<ul role="menu">` markup in the same `@if (render())` + `uOverlay` structure `UPopover`'s own template uses, but only when `popup()` is true — when `popup()` is false (inline mode), render unconditionally as today (matching the existing, unchanged inline-mode behavior — do not regress it).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 3: Angular — GAP-067 simplify USplitButton to delegate to UMenu's popup

**Files:**
- Modify: `packages/ng/src/split-button/split-button.ts`
- Test: `packages/ng/src/split-button/split-button.spec.ts`

**Depends on: Task 2 (hard — this task consumes Task 2's own new UMenu popup API).**

- [ ] **Step 1: Confirm existing tests still pass unmodified**

Before making any change, run `packages/ng/src/split-button/split-button.spec.ts`'s existing suite and note its current assertions — these must all still pass after Task 3's own refactor (per Review Focus item 2, this is an internal-implementation change, not a behavior change).

- [ ] **Step 2: Implement**

Replace `USplitButton`'s own hand-rolled overlay state/logic with a composed `<u-menu popup [model]="items()" [appendTo]="appendTo()" ...>` (using Task 2's own new popup API), triggered by the existing dropdown-toggle button's click handler calling the menu's `toggle(event)` method via a template reference variable (matching React's/Vue's own already-working delegation shape, and this codebase's own established `#ref` template-variable convention for imperative child-component method calls).

- [ ] **Step 3: Re-run the pre-existing test suite unmodified**

Confirm every assertion noted in Step 1 still passes — this is the acceptance bar for "externally observable behavior is unchanged."

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 4: React — GAP-068 extend tsup subpath exports

**Files:** `packages/react/tsup.config.ts`. No test file (a packaging-configuration change; verified via a real build, not a unit test).

- [ ] **Step 1: Establish the current failing state**

Run a real build (`pnpm --filter @ultimate/react build`), then attempt to import a component known to have shipped after the `entry` map was last updated via its own subpath (e.g. `@ultimate/react/organization-chart` or whichever component the current `entry` map's own diff against `packages/react/src/`'s directory listing reveals as missing — compute this diff first, do not guess which component is missing).

- [ ] **Step 2: Implement**

Extend `tsup.config.ts`'s `entry` map to include every currently-shipped component directory under `packages/react/src/` that is not already present, following the existing entries' own naming/path convention exactly.

- [ ] **Step 3: Verify**

Re-run the real build; confirm every component (old and newly-added) is importable via its own subpath, and confirm the main barrel import (`@ultimate/react`) still works unchanged.

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 5: Vue — GAP-068 extend tsup subpath exports

**Files:** `packages/vue/tsup.config.ts`. Same Steps 1-4 pattern as Task 4, for Vue's own `entry` map and `packages/vue/src/` directory listing.

---

### Task 6: Angular — GAP-070 characterize newer components against the `ShimReferenceTagger` trigger

**Files:** no source modification — this task's own deliverable is a characterization record (a table, committed as part of this plan's own eventual closeout documentation, not a source file).

**Depends on:** none. **Gates Task 7 (hard).**

- [ ] **Step 1: Enumerate candidate components**

Compute the exact diff: every directory under `packages/ng/src/` that is NOT one of GAP-009's own already-covered 9 (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple`, `input-number`) and NOT one of GAP-009's own already-excluded 5 (`button`, `dialog`, `menu`, `table`, `input-text`) — every remaining Angular component directory is a candidate for this characterization.

- [ ] **Step 2: For each candidate, attempt a real secondary-entry-point build**

For each candidate component, author a temporary `ng-package.json` (matching the existing 9's own established shape) and run `ng-packagr` against it in isolation, exactly as GAP-009's own original characterization did — a real, reproducible build attempt, not a static import-graph guess (per Review Focus item 3). Record pass/fail per component.

- [ ] **Step 3: For each failing candidate, confirm the failure matches the known `ShimReferenceTagger` trigger**

Confirm the failure is the same reproducible `ShimReferenceTagger`/`undefined`-destructuring crash GAP-009's own text describes, triggered by a direct import of another secondary-entry-point's root class — not a different, unrelated build error. If a candidate fails for a different reason, that is a new finding requiring its own report, not silently folded into this characterization.

- [ ] **Step 4: Produce the characterization table**

A table: component name → pass/fail → (if fail) the specific import that triggers it. This table is Task 7's own required input.

---

### Task 7: Angular — GAP-070 add secondary entry points to components that passed Task 6's characterization

**Files:** for each passing component from Task 6's table: create `packages/ng/<component>/ng-package.json`; modify `packages/ng/package.json`'s `exports` map.

**Depends on: Task 6 (hard).**

- [ ] **Step 1: For each passing component, author its own `ng-package.json`**

Matching the existing 9's own established shape exactly (same `lib.entryFile` convention, same output-path convention).

- [ ] **Step 2: Add each to `packages/ng/package.json`'s `exports` map**

Following the existing entries' own exact pattern (a subpath per component, matching React's/Vue's own already-correct convention).

- [ ] **Step 3: Verify**

Run a real full-package build. Confirm each newly-added component is importable via its own subpath, confirm the main barrel import still works, and confirm none of GAP-009's own already-excluded 5 components was touched (verify via `git diff` showing no change to `button`/`dialog`/`menu`/`table`/`input-text`'s own directories).

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

## Completion Criteria

- Task 1's e2e assertion passes with the tooltip actually visible.
- Task 2's `UMenu` popup mode is fully functional per its own tests (8 sketched here; 21 shipped, plus the fix-loop's cross-component tests); Task 3's `USplitButton` delegates to it with zero externally-observable behavior regression.
- Task 4/5's React/Vue subpath exports work for every currently-shipped component in each framework.
- Task 6's characterization table is complete for every candidate component; Task 7 adds secondary entry points only to those the table marks as passing.
- GAP-009/GAP-023 remain byte-for-byte unchanged (verify via `git diff` on `docs/architecture/BLUEPRINT_GAPS.md` showing no lines touched — the file was edited during this plan only to record user decisions and new GAPs (GAP-070 progress, GAP-079, GAP-080, GAP-081); GAP-009/GAP-023 themselves were never touched).
- `pnpm test`, `pnpm run ceiling:validate` pass after every task.

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-066/GAP-067/GAP-068 RESOLVED and GAP-070 RESOLVED (or PARTIAL, if Task 6 finds candidates requiring further investigation beyond this plan's own scope) in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
