# F3 Vue Stepper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A horizontal Vue Stepper renders a separator after every step header except the last, laid out as a row between the headers, while the vertical (StepItem) layout from GAP-063 stays exactly as it is (GAP-077).

**Architecture:** `UStepList` provides itself as `$pcStepList` (mirroring PrimeVue 4.5.5 and GAP-063's `StepItem` `provide()`). `UStep` renders the existing internal `UStepperSeparator` when it is inside a step list and is not the last `[data-u-step]` in that list, re-computed on mount and update. `UStepList.updated()` refreshes its registered steps, because existing steps do not re-render when a sibling is added or removed. Horizontal layout rules from `@primeuix/styles` 2.0.3 are added, scoped under `.u-step-list`, so vertical steps (not inside a step list) are untouched.

**Tech Stack:** Vue 3 Options API, Vitest + `@vue/test-utils`, Playwright (Vue Storybook, `vue-*` projects).

**Spec:** `docs/superpowers/specs/2026-10-02-prime-parity-followup-vue-stepper-design.md`

## Global Constraints

- Parity baseline: PrimeVue 4.5.5 `step/Step.vue` and `@primeuix/styles` 2.0.3 `stepper` (ADR-048).
- Vue only. No new public API; the step-list context and separator stay internal (not exported from `index.ts`).
- PrimeVue's `isCompleted` is not added. Stepper CSS stays hand-written (no Aura tokens; GAP-064 deferred).
- Vertical non-regression (Spec §12): every existing GAP-063 test in `stepper.spec.ts` (`UStepPanel vertical separator (GAP-063)` and `Stepper vertical StepItem layout CSS (GAP-063)`) passes unchanged, except the single horizontal assertion updated in Task 1 Step 1.
- The new Playwright test asserts no screenshot.
- Unit tests: `pnpm --filter @ultimate/vue test`. Node 20 (`export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`). Stage explicit files only.

## Review Focus

1. A single-step horizontal Stepper must render no separator. Covered by a Task 1 test.
2. Removing the last step must give the new last step no separator. Covered by the Task 1 add/remove test.
3. Vertical steps must never render the new step-header separator (only the GAP-063 panel separator). Covered by a Task 1 test.
4. Horizontal separators must sit on the same row as, and between, the headers in a real browser. Covered by the Task 2 bounding-box test.
5. The vertical `.u-step-item .u-step` rule must still win over the new horizontal rules for vertical steps. Covered by keeping the new rules under `.u-step-list` plus the unchanged GAP-063 CSS tests.

---

### Task 1: GAP-077 — horizontal step separators and layout

**Files:**

- Modify: `packages/vue/src/stepper/StepList.vue` (script: add `provide()`, step registry, `updated()`)
- Modify: `packages/vue/src/stepper/Step.vue` (template: separator; script: inject, data, hooks, method)
- Modify: `packages/vue/src/stepper/stepper-style.ts:14-15` (`.u-step-list` rule) and add scoped horizontal rules after the `.u-stepper-separator` rule (line 19)
- Test: `packages/vue/src/stepper/stepper.spec.ts`

**Interfaces:**

- Consumes: `UStepperSeparator` (`packages/vue/src/stepper/StepperSeparator.vue`, class `u-stepper-separator`); the `data-u-step` marker on `UStep`'s root (`Step.vue:2`).
- Produces: `UStepList` provides `$pcStepList` (the `UStepList` instance) with methods `registerStep(step)` / `unregisterStep(step)`. `UStep` has data `isSeparatorVisible: boolean` and method `updateSeparator(): void`.

- [ ] **Step 1: Write the failing tests and update the one superseded assertion**

In `packages/vue/src/stepper/stepper.spec.ts`, replace the existing test `"horizontal mode renders no separators and no content wrapper"` with this version. Under GAP-077, horizontal steps now render step-header separators, but horizontal panels must still have no separator and no content wrapper:

```ts
it("horizontal mode renders no panel separators and no content wrapper", async () => {
  const wrapper = mountStepper();
  await nextTick();
  expect(wrapper.findAll('[role="tabpanel"] .u-stepper-separator').length).toBe(0);
  expect(wrapper.find(".u-step-panel-content-wrapper").exists()).toBe(false);
  expect(wrapper.find('[role="tabpanel"]').html()).toContain("Panel One");
});
```

Then change the `@vue/test-utils` import at the top of the file to `import { mount, type VueWrapper } from "@vue/test-utils";` and append:

```ts
describe("UStep horizontal separators (GAP-077)", () => {
  function mountHorizontal(count = 3) {
    return mount({
      components: { UStepper, UStepList, UStep },
      data() {
        return { count };
      },
      template: `
        <UStepper :value="1">
          <UStepList>
            <UStep v-for="n in count" :key="n" :value="n">Step {{ n }}</UStep>
          </UStepList>
        </UStepper>
      `,
    });
  }

  const stepSepCounts = (w: VueWrapper) =>
    w.findAll("[data-u-step]").map((s) => s.findAll(".u-stepper-separator").length);

  it("renders a separator after every step header except the last", async () => {
    const wrapper = mountHorizontal(3);
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 1, 0]);
    const firstStep = wrapper.find("[data-u-step]").element;
    const kids = Array.from(firstStep.children);
    expect(kids[0].classList.contains("u-step-header")).toBe(true);
    expect(kids[1].classList.contains("u-stepper-separator")).toBe(true);
  });

  it("renders no separator for a single step", async () => {
    const wrapper = mountHorizontal(1);
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([0]);
  });

  it("moves the separator-less position when steps are added or removed", async () => {
    const wrapper = mountHorizontal(3);
    await nextTick();
    (wrapper.vm as unknown as { count: number }).count = 4;
    await nextTick();
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 1, 1, 0]);
    (wrapper.vm as unknown as { count: number }).count = 2;
    await nextTick();
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 0]);
  });

  it("renders no step-header separator for vertical steps (StepItem layout)", async () => {
    const wrapper = mount({
      components: { UStepper, UStepItem, UStep, UStepPanel },
      template: `
        <UStepper :value="1">
          <UStepItem v-for="n in 3" :key="n" :value="n">
            <UStep :value="n">Step {{ n }}</UStep>
            <UStepPanel :value="n">Content {{ n }}</UStepPanel>
          </UStepItem>
        </UStepper>
      `,
    });
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([0, 0, 0]);
  });
});

describe("Stepper horizontal layout CSS (GAP-077)", () => {
  const css = stepperStyleModule.css as string;
  const rule = (selector: string) => {
    const m = css.match(
      new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`, "m")
    );
    return m ? m[1].trim() : null;
  };

  it("spaces steps across a centred list row", () => {
    expect(rule(".u-step-list")).toBe(
      "display: flex; position: relative; justify-content: space-between; align-items: center;"
    );
  });

  it("lays horizontal steps out as growing rows, last step not growing", () => {
    expect(rule(".u-step-list .u-step")).toBe("flex-direction: row; flex: 1 1 auto;");
    expect(rule(".u-step-list .u-step:last-of-type")).toBe("flex: initial;");
  });

  it("leaves the global .u-step rule and the vertical rules unchanged", () => {
    expect(rule(".u-step")).toBe(
      "display: flex; flex-direction: column; align-items: center; position: relative; flex: 0 0 auto;"
    );
    expect(rule(".u-step-item .u-step")).toBe("flex: initial; align-items: flex-start;");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test`
Expected: the GAP-077 separator tests FAIL (`[0, 0, 0]` instead of `[1, 1, 0]`); "spaces steps" and "lays horizontal steps" FAIL (rules missing). All GAP-063 tests and the updated horizontal-panel test PASS.

- [ ] **Step 3: Implement `UStepList`**

In `packages/vue/src/stepper/StepList.vue` `<script>`, add to the component options (after `inheritAttrs: false,`):

```js
  // Mirrors PrimeVue 4.5.5's `$pcStepList` (Step.vue:37) so a UStep can tell
  // it is in a horizontal list. Steps register themselves; updated() fires
  // whenever this list re-renders its slot (e.g. a step added or removed),
  // and existing steps do not re-render on their own then, so refresh them here.
  provide() {
    return { $pcStepList: this };
  },
  created() {
    this.steps = new Set();
  },
  updated() {
    this.steps.forEach((step) => step.updateSeparator());
  },
  methods: {
    registerStep(step) {
      this.steps.add(step);
    },
    unregisterStep(step) {
      this.steps.delete(step);
    },
  },
```

`this.steps` is a plain instance property (not in `data()`), so it is not reactive and cannot cause re-render loops.

- [ ] **Step 4: Implement `UStep`**

In `packages/vue/src/stepper/Step.vue`:

1. Template: add the separator after the `</button>` inside the root `div`:

```html
<UStepperSeparator v-if="isSeparatorVisible" />
```

2. Script: add `import UStepperSeparator from "./StepperSeparator.vue";` next to the other imports, and replace `inject: ["$pcStepper"],` with:

```js
  components: { UStepperSeparator },
  inject: {
    $pcStepper: { from: "$pcStepper" },
    $pcStepList: { from: "$pcStepList", default: null },
  },
  data() {
    return { isSeparatorVisible: false };
  },
  mounted() {
    this.$pcStepList?.registerStep(this);
    this.updateSeparator();
  },
  updated() {
    this.updateSeparator();
  },
  beforeUnmount() {
    this.$pcStepList?.unregisterStep(this);
  },
```

3. Add to `methods`:

```js
    // Mirrors PrimeVue 4.5.5 Step.vue:43-49: inside a step list, every step
    // except the last shows a separator after its header.
    updateSeparator() {
      if (!this.$el || !this.$pcStepList?.$el) {
        this.isSeparatorVisible = false;
        return;
      }
      const steps = Array.from(this.$pcStepList.$el.querySelectorAll("[data-u-step]"));
      this.isSeparatorVisible = steps.indexOf(this.$el) !== steps.length - 1;
    },
```

- [ ] **Step 5: Implement the horizontal layout CSS**

In `packages/vue/src/stepper/stepper-style.ts`:

1. Replace the `.u-step-list` line with:

```css
.u-step-list {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
}
```

2. Directly after the `.u-stepper-separator { flex: 1 1 0; ... }` line, add (from `@primeuix/styles` 2.0.3 `.p-step` / `.p-step:last-of-type`, scoped to step lists):

```css
.u-step-list .u-step {
  flex-direction: row;
  flex: 1 1 auto;
}
.u-step-list .u-step:last-of-type {
  flex: initial;
}
```

Do not edit the global `.u-step` rule or any `.u-step-item ...` rule.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test`
Expected: all GAP-077 tests PASS; every GAP-063 test PASSES unchanged; all other Stepper tests PASS.

- [ ] **Step 7: Typecheck and commit**

Run: `pnpm --filter @ultimate/vue run typecheck` — Expected: no errors.

```bash
git add packages/vue/src/stepper/StepList.vue packages/vue/src/stepper/Step.vue packages/vue/src/stepper/stepper-style.ts packages/vue/src/stepper/stepper.spec.ts
git commit -m "feat(vue): render horizontal Stepper separators between steps (GAP-077)"
```

---

### Task 2: GAP-077 — real-browser horizontal layout check

**Files:**

- Create: `packages/vue/e2e/stepper.spec.ts`

**Interfaces:**

- Consumes: `storyUrl(storyId)` from `packages/vue/e2e/accessibility-envelope.ts:99`; the existing `Vue/Stepper` Default story (`packages/vue/src/stepper/stepper.stories.ts:12`, horizontal `UStepList`).
- Produces: nothing used by other tasks.

- [ ] **Step 1: Confirm the story is horizontal and find its ID**

Open `packages/vue/src/stepper/stepper.stories.ts` and confirm the `Default` story renders `UStepList` with at least 2 `UStep`s. With the Vue Storybook running (`pnpm --filter @ultimate/vue storybook`), confirm the ID `vue-stepper--default` exists in `http://localhost:6003/index.json`; if Storybook generated a different ID, use it.

- [ ] **Step 2: Write the test**

Create `packages/vue/e2e/stepper.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * Real-browser layout check for GAP-077: jsdom has no layout, so only a real
 * browser shows that each separator sits between two step headers on the
 * same row. No screenshots are taken.
 */
test.describe("Vue/Stepper horizontal separators (GAP-077)", () => {
  test("each separator lies between consecutive step headers on one row", async ({ page }) => {
    await page.goto(storyUrl("vue-stepper--default"));
    const headers = page.locator(".u-step-list .u-step-header");
    const separators = page.locator(".u-step-list .u-stepper-separator");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(1);
    await expect(separators).toHaveCount(headerCount - 1);

    for (let i = 0; i < headerCount - 1; i++) {
      const left = await headers.nth(i).boundingBox();
      const sep = await separators.nth(i).boundingBox();
      const right = await headers.nth(i + 1).boundingBox();
      expect(left && sep && right).toBeTruthy();
      expect(sep!.width).toBeGreaterThan(0);
      expect(sep!.x).toBeGreaterThanOrEqual(left!.x + left!.width);
      expect(sep!.x + sep!.width).toBeLessThanOrEqual(right!.x);
      const sepMid = sep!.y + sep!.height / 2;
      expect(sepMid).toBeGreaterThan(left!.y);
      expect(sepMid).toBeLessThan(left!.y + left!.height);
    }
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit packages/vue/e2e/stepper.spec.ts`
Expected: PASS in all three browsers. (Run Task 1 first; before Task 1 there are no separators and the `toHaveCount` assertion fails.)

- [ ] **Step 4: Commit**

```bash
git add packages/vue/e2e/stepper.spec.ts
git commit -m "test(vue): verify horizontal Stepper separator layout in real browsers (GAP-077)"
```
