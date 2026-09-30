# Prime Parity: Vue Implementation Plan (GAP-062–GAP-063)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task.

**Goal:** Add PageUp/PageDown scroll-into-view to Vue `Tab.vue` (GAP-062); add vertical-mode separator rendering to Vue `StepPanel.vue` (GAP-063).

**Corrections (2026-09-30, before implementation):** Task 1's mechanism and Task 2's scope and supporting pieces were corrected against real PrimeVue 4.5.5 by user decision; the horizontal Step separator is registered separately as GAP-077. See Spec §12.

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-vue-design.md`.

**GAP → Task mapping:** GAP-062 → Task 1. GAP-063 → Task 2.

## Global Constraints

- **Vue Stepper's active-state internal mode-aware comparison difference is not touched.** DEFERRED, per Spec §2.2 — Task 2 adds separator rendering only, not a mode-aware active-state check.
- **Task 1 must not change the selected tab.** PageUp/PageDown is scroll-only, per Spec §5.1's own explicit clarification — confirmed real PrimeVue's own `onPageDownKey`/`onPageUpKey` never call `activate()`/`updateValue()`.

## Review Focus

- **PageDown/PageUp pressed when there is nothing to scroll (all tabs already fit in view)** — a reasonable person expects `scrollIntoView` to simply be a no-op in this case (browsers handle already-visible elements gracefully), not an error; Task 1's test should include this case to confirm no exception.
- **Task 2's `isSeparatorVisible` computation requires a stable step marker** — confirmed 2026-09-30 that Ultimate's `UStep` renders none (only `data-u-active`/`data-u-disabled`); Task 2 adds one following the `data-u-*` convention, not PrimeVue's literal `data-pc-name`.
- **Task 2 must not change horizontal Stepper markup** — horizontal separators are GAP-077.

---

### Task 1: Vue — GAP-062 Tabs PageUp/PageDown

**Files:** `packages/vue/src/tabs/Tab.vue`, `packages/vue/src/tabs/tabs.spec.ts` (the existing test file).

- [ ] **Step 1: Write the failing tests**

```typescript
describe("PageUp/PageDown scroll-into-view (Spec §5.1, GAP-062)", () => {
  it("PageDown scrolls the tab list into view without changing the selected tab", async () => {
    const scrollIntoViewMock = vi.fn();
    // mount a UTabs/UTabList with several UTab children, one active
    const wrapper = mount(/* ... */);
    const activeValueBefore = wrapper.vm.$pcTabs?.d_value; // or however active value is inspected in this file's existing tests
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    await wrapper.find('[role=tab]').trigger('keydown', { code: 'PageDown' });
    expect(scrollIntoViewMock).toHaveBeenCalled();
    expect(wrapper.vm.$pcTabs?.d_value).toBe(activeValueBefore);
  });

  it("PageUp scrolls the tab list into view without changing the selected tab", async () => {
    // equivalent, code: 'PageUp'
  });

  it("does not throw when there is nothing to scroll", async () => {
    const wrapper = mount(/* single tab, fits in view */);
    await expect(wrapper.find('[role=tab]').trigger('keydown', { code: 'PageDown' })).resolves.not.toThrow();
  });
});
```

(Exact mount setup must match `Tab.vue`'s own existing test file's established harness for mounting a tab within its `$pcTabs` injection context — copy that file's existing setup for the other keydown tests already present there, e.g. the existing ArrowRight/Home/End tests, do not invent a new harness.)

- [ ] **Step 2: Implement**

**Corrected 2026-09-30 (pre-dispatch source check, user decision — Spec §12):** real PrimeVue 4.5.5 `Tab.vue:88-95,122-123` scrolls the **last** tab into view on PageDown and the **first** on PageUp, with `{ block: 'nearest' }`, then `preventDefault()`; it moves neither focus nor selection. (This step originally scrolled the focused tab itself with `inline: "end"/"start"`.)

In `packages/vue/src/tabs/Tab.vue`'s `onKeyDown`, add `PageDown`/`PageUp` cases that call the file's existing `findLastTab()`/`findFirstTab()` helpers and its existing `scrollIntoView({ block: "nearest" })` call (currently at `Tab.vue:121`), then `event.preventDefault()`. Match the key-matching convention already used by the other cases in this `onKeyDown` (check whether it switches on `event.code` or `event.key`). Do not focus the target tab, and do not call `this.activate()` or `this.$pcTabs.updateValue(...)` — per Global Constraints.

Tests (Step 1, adjusted): stub `scrollIntoView` and assert it is called on the **last** tab element for PageDown and the **first** for PageUp, with `{ block: "nearest" }`; the selected value and `document.activeElement` are unchanged; `preventDefault` is called; a single tab does not throw.

- [ ] **Step 3: Run tests, verify green**

`pnpm --filter @ultimate/vue test -- tab` (or the exact existing test command for this file).

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 2: Vue — GAP-063 Stepper vertical separator

**Files:** `packages/vue/src/stepper/StepPanel.vue`, `StepItem.vue`, `Step.vue` (marker attribute only), `stepper-style.ts`, `stepper.spec.ts`, and one new internal separator file in `packages/vue/src/stepper/` (not exported from `index.ts`).

**Corrected 2026-09-30 (pre-dispatch source check, user decision — Spec §12).** Real PrimeVue 4.5.5 `steppanel/StepPanel.vue`: `isVertical = !!$pcStepItem`; the vertical template wraps content in a `contentWrapper` div with `<StepperSeparator v-if="isSeparatorVisible" />` before the `content` div; `updateSeparator()` (on `mounted` and `updated`) finds all `[data-pc-name="step"]` in the stepper root, the index of the `step` inside `$pcStepItem.$el`, and sets `isSeparatorVisible = isVertical && index !== stepElements.length - 1`. Ultimate has none of the supporting pieces: no `StepperSeparator` component (only an unused horizontal `.u-stepper-separator` rule, `stepper-style.ts:21`), `StepItem.vue` provides nothing, and `Step.vue` has no marker attribute. This task originally asked only for `StepPanel.vue` changes and a "no separator in horizontal mode" test; PrimeVue's horizontal separator lives in `Step.vue` and is GAP-077, out of scope.

- [ ] **Step 1: Write the failing tests** (in `stepper.spec.ts`, reusing its existing mount harness) — vertical Stepper (`UStepItem` each containing `UStep` + `UStepPanel`) with 3 items: separators render in the first two panels and not the last; the separator sits inside the panel's content wrapper before the content; adding/removing an item updates separator visibility (the `updated` path); horizontal Stepper (`UStepList` + `UStepPanels`) renders no separators and its existing markup is unchanged; `StepPanel`'s `active` computed is unchanged (existing tests still pass).
- [ ] **Step 2: Implement**
  1. `StepItem.vue`: `provide` its instance (e.g. `$pcStepItem: this`), matching how `Stepper.vue` provides `$pcStepper` (`Stepper.vue:32`).
  2. `Step.vue`: add a stable marker attribute on the step root, following this codebase's `data-u-*` convention (e.g. `data-u-step`); no other `Step.vue` change.
  3. New internal separator element (e.g. `StepperSeparator.vue`, a `<span>` with the existing `stepperSeparator` class), registered locally in `StepPanel.vue`, not exported.
  4. `StepPanel.vue`: inject `$pcStepItem` with a `null` default; add `isSeparatorVisible` data, `isVertical` computed (`!!$pcStepItem`), and `updateSeparator()` mirroring PrimeVue (using the marker attribute), called from `mounted()` and `updated()`. In vertical mode, wrap the slot in a content-wrapper div with the separator before a content div; horizontal markup unchanged. Do not change the existing `active` computed (DEFERRED, Spec §2.2).
  5. `stepper-style.ts`: add vertical rules based on `@primeuix/styles` 2.0.3 stepper — separator inside a step item: `flex: 0 0 auto; width: <separator size>; height: auto; margin: <separator margin>` (PrimeUIX also uses `position: relative; left: calc(-1 * size)`), content wrapper `display: flex; flex: 1 1 auto; min-height: 0`, content `width: 100%`. Scope them under the step-item class so the existing horizontal `.u-stepper-separator` rule is unaffected. Use this file's existing value conventions (it uses literal values, not `dt()` tokens — verify).
- [ ] **Step 3-4:** Tests, full Vue suite, typecheck, dependency ceiling.
- [ ] **Step 5 (added 2026-09-30, user decision after Task 2 review — follow-up commit after `bd4c025`): vertical StepItem layout.** Task 2 shipped the separator logic, but `.u-step-item` is a centred row (`stepper-style.ts:15`), so in a vertical Stepper the panel sits beside the step header and the separator runs alongside the content instead of under the step number as a connector. PrimeUIX 2.0.3 stepper instead makes the step item a column and the panel a grid. In `stepper-style.ts` only, add the PrimeUIX vertical-layout rules: `.u-step-item` column (`flex-direction: column; flex: initial`), active item `flex: 1 1 auto`, `.u-step-item .u-step { flex: initial }`, `.u-step-item .u-step-panel { display: grid; grid-template-rows: 1fr }`, content `margin-inline-start: 1rem`, RTL separator offset (`.u-step-item .u-stepper-separator:dir(rtl)`), and last-item panel padding (`.u-step-item:last-of-type .u-step-panel { padding-inline-start: <step number size> }`). Keep the step header left-aligned in a vertical item so the separator's `1.625rem` offset lines up under the step number (Ultimate's `.u-step` is a centred column, unlike PrimeUIX's row). Do not alter horizontal (`.u-step-list`) layout, and keep the panel hidden when inactive. Add a CSS-string guard test.

- Both tasks pass their own tests.
- `pnpm --filter @ultimate/vue test`, `pnpm --filter @ultimate/vue run typecheck` and `pnpm run ceiling:validate` pass after each task. (Corrected 2026-09-30: originally `pnpm test`; the full-monorepo run has pre-existing unrelated dist-artifact failures.)
- Neither task adds a mode-aware active-state comparison to `StepPanel.vue`'s existing `active` computed property (verify via `git diff` — that property must remain unchanged).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-062/GAP-063 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
