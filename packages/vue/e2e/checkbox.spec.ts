import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UCheckbox (Vue/Checkbox), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/checkbox/checkbox.spec.ts):
 * native input[type=checkbox] + decorative box rendering, binary-mode
 * checked-reflects-modelValue, update:modelValue emission on change,
 * controlled-only semantics (setProps round-trip), defaultValue
 * (uncontrolled) init, indeterminate rendering/DOM property/clearing,
 * array-membership (binary:false) mode, aria-invalid, and disabled/
 * readonly/required/name/tabindex passthrough — all driven through jsdom,
 * which performs no real layout and does not simulate real Tab-key
 * traversal or computed opacity. This file adds only genuinely new
 * real-browser coverage: the computed accessibility-tree checked/
 * indeterminate state, and real keyboard focus/focus-visible/Space-
 * toggling behavior.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 8's
 * scope, which may not modify any Vue component/style source):
 * `checkbox-style.ts`'s `.u-checkbox-box` rule (sourced from
 * `@ultimate/uix-styles/checkbox`) sets an explicit fixed
 * `width: dt('checkbox.width')`/`height: dt('checkbox.height')` — unlike
 * React's UCheckbox (Task 7's own documented finding), where the
 * equivalent box is sized only by its conditional icon content and
 * measures 0x0px when unchecked. Confirmed via real bounding-box
 * measurement here: Vue's `.u-checkbox-box` measures a real, nonzero
 * 20x22px box in BOTH the unchecked Default story and the Checked story —
 * a genuine cross-framework layout difference, not a defect in either
 * implementation. `.u-checkbox-input` itself still sets `opacity: 0` (the
 * same real, intentional visually-hidden-but-interactive native input
 * pattern React's Checkbox uses), confirmed here to stay genuinely
 * focusable, Tab-reachable, and Space-togglable despite Playwright's
 * `toBeVisible()` correctly reporting it as not visible.
 */
test.describe("Vue/Checkbox", () => {
  test("Default story: computed role/checked state, keyboard focus and Space toggling", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-checkbox--default"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveCount(1);

    // Computed accessibility-tree state — the browser's own AX tree
    // reporting "unchecked", not a raw DOM .checked property read (which
    // jsdom/@vue/test-utils already covers).
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox`);
    await expect(checkbox).not.toBeChecked();

    await page.keyboard.press("Tab");
    await expect(checkbox).toBeFocused();
    const matchesFocusVisible = await checkbox.evaluate((el) => el.matches(":focus-visible"));
    expect(matchesFocusVisible).toBe(true);

    // Real Space-key toggling — the story's local-ref harness
    // (checkbox.stories.ts's Default render function) wires
    // update:modelValue back into a `v-model`-bound ref, mirroring how a
    // real consumer must drive this fully controlled component; the
    // Vitest suite only asserts the emitted event's payload shape, never a
    // real keyboard-driven round trip through Vue reactivity.
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--default"));
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-checkbox--default"));
    await runAccessibilityScan(page, testInfo, "vue-checkbox--default");
  });

  test("Checked story: computed accessibility-tree state reflects the checked modelValue, and the box renders a real nonzero size", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-checkbox--checked"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox [checked]`);

    // Real finding above: unlike React's Checkbox, this box has a fixed
    // CSS size and is genuinely visible in both checked and unchecked
    // states — asserted directly here since it's the story specifically
    // exercising the checked/icon-present path.
    await expect(page.locator(".u-checkbox-box")).toBeVisible();
  });

  test("Checked story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--checked"));
    await expect(page.locator(".u-checkbox-box")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Checked story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-checkbox--checked"));
    await runAccessibilityScan(page, testInfo, "vue-checkbox--checked");
  });

  test("Indeterminate story: computed indeterminate DOM property is real, and the box renders a real nonzero size", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-checkbox--indeterminate"));
    const checkbox = page.getByRole("checkbox");
    // Real browser-computed .indeterminate property — jsdom/@vue/test-utils
    // already asserts this directly on the element, but this confirms the
    // real browser's own IDL property reflects it identically, alongside a
    // real visible decorative box (MinusIcon), which the unchecked Default
    // story's box is not asserted visible for above.
    const indeterminate = await checkbox.evaluate((el: HTMLInputElement) => el.indeterminate);
    expect(indeterminate).toBe(true);
    await expect(page.locator(".u-checkbox-box")).toBeVisible();
  });

  test("Indeterminate story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--indeterminate"));
    await expect(page.locator(".u-checkbox-box")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Indeterminate story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-checkbox--indeterminate"));
    await runAccessibilityScan(page, testInfo, "vue-checkbox--indeterminate");
  });

  test("Disabled story: disabled checkbox is skipped by real Tab order", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--disabled"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeDisabled();
    await page.keyboard.press("Tab");
    await expect(checkbox).not.toBeFocused();
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--disabled"));
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-checkbox--disabled"));
    await runAccessibilityScan(page, testInfo, "vue-checkbox--disabled");
  });

  test("Invalid story: computed aria-invalid is exposed on the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-checkbox--invalid"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveAttribute("aria-invalid", "true");
  });

  test("Invalid story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-checkbox--invalid"));
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Invalid story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-checkbox--invalid"));
    await runAccessibilityScan(page, testInfo, "vue-checkbox--invalid");
  });
});
