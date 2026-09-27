# Prime Parity: Vue Implementation Plan (GAP-062–GAP-063)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task.

**Goal:** Add PageUp/PageDown scroll-into-view to Vue `Tab.vue` (GAP-062); add vertical-mode separator rendering to Vue `StepPanel.vue` (GAP-063).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-vue-design.md`.

**GAP → Task mapping:** GAP-062 → Task 1. GAP-063 → Task 2.

## Global Constraints

- **Vue Stepper's active-state internal mode-aware comparison difference is not touched.** DEFERRED, per Spec §2.2 — Task 2 adds separator rendering only, not a mode-aware active-state check.
- **Task 1 must not change the selected tab.** PageUp/PageDown is scroll-only, per Spec §5.1's own explicit clarification — confirmed real PrimeVue's own `onPageDownKey`/`onPageUpKey` never call `activate()`/`updateValue()`.

## Review Focus

- **PageDown/PageUp pressed when there is nothing to scroll (all tabs already fit in view)** — a reasonable person expects `scrollIntoView` to simply be a no-op in this case (browsers handle already-visible elements gracefully), not an error; Task 1's test should include this case to confirm no exception.
- **Task 2's `isSeparatorVisible` computation requires the same `data-pc-name="step"`-style DOM query real PrimeVue uses, or Ultimate's own equivalent data-attribute** — confirm which data attribute Ultimate's own `UStep`/`UStepItem` already renders (if any) before assuming `data-pc-name` exists in this codebase; Ultimate likely uses its own `data-u-*` convention (matching every other component in this codebase), not PrimeVue's literal `data-pc-name` string.

---

### Task 1: Vue — GAP-062 Tabs PageUp/PageDown

**Files:** `packages/vue/src/tabs/Tab.vue`, `tab.spec.ts` (or wherever `Tab.vue`'s existing tests live — confirm exact filename first).

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

In `packages/vue/src/tabs/Tab.vue`'s `onKeyDown` method, add:

```javascript
case "PageDown":
  this.$el.scrollIntoView?.({ block: "nearest", inline: "end" });
  event.preventDefault();
  break;
case "PageUp":
  this.$el.scrollIntoView?.({ block: "nearest", inline: "start" });
  event.preventDefault();
  break;
```

(Confirm the exact `scrollIntoView` options real PrimeVue's own `onPageDownKey`/`onPageUpKey` pass — re-check the pinned source before finalizing `inline: "end"`/`"start"`, do not assume without verifying.) Do not call `this.activate()` or `this.$pcTabs.updateValue(...)` in either new case — this is the one thing that must not happen, per Global Constraints.

- [ ] **Step 3: Run tests, verify green**

`pnpm --filter @ultimate/vue test -- tab` (or the exact existing test command for this file).

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 2: Vue — GAP-063 Stepper vertical separator

**Files:** `packages/vue/src/stepper/StepPanel.vue`, its test file.

- [ ] **Step 1: Write the failing tests**

First confirm what data attribute Ultimate's own `UStep`/`UStepItem` components actually render (check `packages/vue/src/stepper/Step.vue` and `StepItem.vue` for any existing `data-u-*` marker before assuming one exists — if none exists yet, this task must add one, since real PrimeVue's own `updateSeparator()` depends on being able to query sibling step elements by a stable marker).

```typescript
describe("vertical-mode separator (Spec §5.2, GAP-063)", () => {
  it("renders a separator between two vertical steps except after the last", async () => {
    // mount a vertical UStepper with 2 UStepItem/UStepPanel pairs, matching
    // this file's own existing test harness for a vertical Stepper (if one
    // exists) or the Stepper family's own established multi-component mount
    // pattern
    const wrapper = mount(/* vertical stepper, 2 items */);
    const separators = wrapper.findAllComponents({ name: "UStepperSeparator" });
    expect(separators.length).toBe(1); // one separator, between step 1 and step 2, none after the last
  });

  it("renders no separator in horizontal mode", async () => {
    const wrapper = mount(/* horizontal stepper, 2 items */);
    expect(wrapper.findAllComponents({ name: "UStepperSeparator" }).length).toBe(0);
  });
});
```

- [ ] **Step 2: Implement**

1. If no stable per-step data attribute exists yet, add one to `UStep`/`UStepItem` (e.g. `data-u-step` — matching this codebase's own `data-u-*` naming convention, not PrimeVue's literal `data-pc-name`).
2. In `StepPanel.vue`, add `isSeparatorVisible` to `data()`, and a `updateSeparator()` method mirroring real PrimeVue's own logic exactly (adapted to Ultimate's own data attribute from Step 1): query all step elements within the stepper's root, find this panel's own step's index, set `isSeparatorVisible = isVertical && index !== stepElements.length - 1`. `isVertical` must be derived from whatever existing mechanism the Stepper family already uses to know its own orientation (check `$pcStepper`'s injected properties for an existing orientation field before adding a new one).
3. Call `updateSeparator()` from `mounted()` and `updated()` (matching real PrimeVue's own lifecycle hooks exactly).
4. Render `<UStepperSeparator v-if="isSeparatorVisible" />` in the template, inside the vertical-mode branch, before the existing `<slot>`.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- Both tasks pass their own tests.
- `pnpm test`, `pnpm run ceiling:validate` pass after each task.
- Neither task adds a mode-aware active-state comparison to `StepPanel.vue`'s existing `active` computed property (verify via `git diff` — that property must remain unchanged).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-062/GAP-063 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
