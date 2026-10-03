# F2 Form / Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React `UToggleButton` (and `USelectButton`, which composes it) changes state exactly once per Space press in real browsers (GAP-075), and Vue `UPassword` supports `ariaLabelledby` (GAP-076).

**Architecture:** GAP-075 ports PrimeReact 10.9.9's Space handling: toggle, then `preventDefault()` so the native checkbox activation does not toggle again. It adds a real-browser Playwright regression test against the existing Storybook stories. GAP-076 adds one prop and binding, mirroring PrimeVue 4.5.5.

**Tech Stack:** React 19 + Vitest/RTL, Playwright (Storybook iframe, `react-*` projects), Vue 3 Options API + `@vue/test-utils`.

**Spec:** `docs/superpowers/specs/2026-10-02-prime-parity-followup-form-accessibility-design.md`

## Global Constraints

- Parity baseline: PrimeReact 10.9.9 and PrimeVue 4.5.5 only (ADR-048).
- GAP-076 is Vue only; do not touch Angular or React Password.
- `UToggleButton`'s Enter-key behavior is unchanged (Spec §8).
- Browser coverage must assert the observable state changes exactly once per Space press, not only that `preventDefault()` was called (Spec §12).
- The new Playwright tests assert no screenshot (`toHaveScreenshot` must not be used).
- No new Storybook stories; use the existing `React/ToggleButton` Default and `React/SelectButton` Default stories (`value: null`, `allowEmpty` defaults to `true`).
- Unit tests: `pnpm --filter @ultimate/react test`, `pnpm --filter @ultimate/vue test`. Node 20 (`export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`).
- Stage explicit files only.

## Review Focus

1. Clicking the toggle with a mouse must still toggle exactly once (the change path is untouched). Covered by the Task 1 browser test.
2. Pressing Space twice must return to the original state, which proves each press is a single toggle. Covered by a Task 1 browser test.
3. Space on a disabled toggle must not toggle. The existing unit test covers disabled; a new unit test asserts disabled Space does not call `onChange`.
4. In `USelectButton` single mode with `allowEmpty`, a second Space on the selected option must deselect it. Covered by a Task 1 browser test.
5. `ariaLabelledby` unset must not render an empty `aria-labelledby=""`. Covered by a Task 2 test.

---

### Task 1: GAP-075 — React `UToggleButton` Space toggles exactly once

**Files:**

- Modify: `packages/react/src/toggle-button/toggle-button.tsx:71-75`
- Test: `packages/react/src/toggle-button/toggle-button.spec.tsx`
- Create: `packages/react/e2e/toggle-button.spec.tsx`

**Interfaces:**

- Consumes: existing `toggle(originalEvent)` (`toggle-button.tsx:65-69`); `storyUrl(storyId)` from `packages/react/e2e/accessibility-envelope.ts:98`.
- Produces: no API change.

- [ ] **Step 1: Write the failing unit tests**

Append inside `describe("UToggleButton", ...)` in `packages/react/src/toggle-button/toggle-button.spec.tsx`:

```tsx
it("prevents the default action of a Space keydown so the native activation cannot toggle again (GAP-075)", () => {
  const onChange = vi.fn();
  render(<UToggleButton checked={false} onChange={onChange} />);
  const notPrevented = fireEvent.keyDown(screen.getByRole("checkbox", { hidden: true }), {
    key: " ",
  });
  expect(notPrevented).toBe(false);
  expect(onChange).toHaveBeenCalledOnce();
});

it("does not toggle on Space when disabled", () => {
  const onChange = vi.fn();
  render(<UToggleButton checked={false} onChange={onChange} disabled />);
  fireEvent.keyDown(screen.getByRole("checkbox", { hidden: true }), { key: " " });
  expect(onChange).not.toHaveBeenCalled();
});
```

(`fireEvent` returns `false` when the event's default was prevented.)

- [ ] **Step 2: Write the failing real-browser tests**

Create `packages/react/e2e/toggle-button.spec.tsx`:

```tsx
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for GAP-075. jsdom does not fire the native
 * checkbox activation on Space keyup, so only a real browser shows whether
 * one Space press changes the observable state exactly once. Each test
 * asserts the visible state after every press: one press must flip it, a
 * second press must flip it back. A double toggle per press would leave the
 * state unchanged after the first press. No screenshots are taken.
 */
test.describe("React/ToggleButton Space activation (GAP-075)", () => {
  test("Space changes the toggle state exactly once per press", async ({ page }) => {
    await page.goto(storyUrl("react-togglebutton--default"));
    const toggle = page.getByRole("checkbox");
    await expect(toggle).not.toBeChecked();

    await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();

    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();

    await page.keyboard.press("Space");
    await expect(toggle).not.toBeChecked();
  });

  test("mouse click still toggles exactly once", async ({ page }) => {
    await page.goto(storyUrl("react-togglebutton--default"));
    const toggle = page.getByRole("checkbox");
    await toggle.click({ force: true });
    await expect(toggle).toBeChecked();
  });
});

test.describe("React/SelectButton Space activation (GAP-075)", () => {
  test("single mode with allowEmpty: Space selects once, a second Space deselects", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-selectbutton--default"));
    const options = page.getByRole("checkbox");
    await expect(options).toHaveCount(3);
    await expect(options.nth(0)).not.toBeChecked();

    await page.keyboard.press("Tab");
    await expect(options.nth(0)).toBeFocused();

    await page.keyboard.press("Space");
    await expect(options.nth(0)).toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();

    await page.keyboard.press("Space");
    await expect(options.nth(0)).not.toBeChecked();
  });
});
```

Confirm the story IDs before running: open `http://localhost:6002/index.json` with the React Storybook running (`pnpm --filter @ultimate/react storybook`) and check that `react-togglebutton--default` and `react-selectbutton--default` exist. If Storybook generated different IDs, use those (the titles are `React/ToggleButton` and `React/SelectButton`, export `Default`).

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/react test`
Expected: the "prevents the default action" unit test FAILS (`notPrevented` is `true`).

Run: `npx playwright test --project=react-chromium packages/react/e2e/toggle-button.spec.tsx`
Expected: the ToggleButton Space test FAILS at the first `toBeChecked()` after Space (state toggled twice). The SelectButton test FAILS at the first `toBeChecked()` (selected and immediately deselected).

- [ ] **Step 4: Implement**

In `packages/react/src/toggle-button/toggle-button.tsx`, replace `onKeyDown` (lines 71-75) with:

```tsx
// PrimeReact 10.9.9 ToggleButton.js:47-51: toggle on Space and prevent the
// default action, so the native checkbox does not also toggle on keyup.
// Enter keeps its existing behavior (a native checkbox does not activate on Enter).
const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === " ") {
    toggle(event);
    event.preventDefault();
  } else if (event.key === "Enter") {
    toggle(event);
  }
};
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/react test`
Expected: all ToggleButton and SelectButton unit tests PASS, including the existing "toggles on Space keydown" and GAP-059 roving-tabindex tests.

Run: `npx playwright test --project=react-chromium --project=react-firefox --project=react-webkit packages/react/e2e/toggle-button.spec.tsx`
Expected: all 3 tests PASS in all three browsers.

- [ ] **Step 6: Typecheck and commit**

Run: `pnpm --filter @ultimate/react run typecheck` — Expected: no errors.

```bash
git add packages/react/src/toggle-button/toggle-button.tsx packages/react/src/toggle-button/toggle-button.spec.tsx packages/react/e2e/toggle-button.spec.tsx
git commit -m "fix(react): toggle UToggleButton exactly once on Space (GAP-075)"
```

---

### Task 2: GAP-076 — Vue `UPassword` `ariaLabelledby`

**Files:**

- Modify: `packages/vue/src/password/BasePassword.ts:39` (props)
- Modify: `packages/vue/src/password/Password.vue:11` (input bindings)
- Test: `packages/vue/src/password/password.spec.ts`

**Interfaces:**

- Consumes: existing `ariaLabel` prop pattern.
- Produces: prop `ariaLabelledby: { type: String, default: null }`.

- [ ] **Step 1: Write the failing tests**

Append inside `describe("UPassword", ...)` in `packages/vue/src/password/password.spec.ts`:

```ts
describe("ariaLabelledby (GAP-076)", () => {
  it("binds ariaLabelledby to the input's aria-labelledby", () => {
    const wrapper = mount(UPassword, { props: { modelValue: "", ariaLabelledby: "pw-label" } });
    expect(wrapper.find("input").attributes("aria-labelledby")).toBe("pw-label");
  });

  it("renders no aria-labelledby attribute when the prop is not set", () => {
    const wrapper = mount(UPassword, { props: { modelValue: "" } });
    expect(wrapper.find("input").attributes()).not.toHaveProperty("aria-labelledby");
  });

  it("keeps aria-label working alongside aria-labelledby", () => {
    const wrapper = mount(UPassword, {
      props: { modelValue: "", ariaLabel: "Password", ariaLabelledby: "pw-label" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("aria-label")).toBe("Password");
    expect(input.attributes("aria-labelledby")).toBe("pw-label");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test`
Expected: the first and third tests FAIL (`aria-labelledby` is `undefined`); the second passes.

- [ ] **Step 3: Implement**

In `packages/vue/src/password/BasePassword.ts`, add after `ariaLabel: { type: String, default: null },`:

```ts
      ariaLabelledby: { type: String, default: null },
```

In `packages/vue/src/password/Password.vue`, add directly before `:aria-label="ariaLabel"` (PrimeVue 4.5.5 `Password.vue:11` binds it in the same place):

```html
:aria-labelledby="ariaLabelledby"
```

Vue omits an attribute bound to `null`, so the unset case renders no attribute.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test`
Expected: all three GAP-076 tests PASS; all pre-existing Password tests (including GAP-061 ARIA tests) PASS.

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/vue run typecheck` — Expected: no errors.

```bash
git add packages/vue/src/password/BasePassword.ts packages/vue/src/password/Password.vue packages/vue/src/password/password.spec.ts
git commit -m "feat(vue): add ariaLabelledby to UPassword (GAP-076)"
```
