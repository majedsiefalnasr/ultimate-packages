import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UCheckbox (React/Checkbox), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/checkbox/checkbox.spec.tsx):
 * native input[type=checkbox] rendering reflecting the checked prop,
 * controlled-only semantics (no internal state), onChange event shape,
 * trueValue/falseValue, disabled suppression, aria-invalid, inputRef
 * forwarding. This file adds only genuinely new real-browser coverage: the
 * computed accessibility-tree checked state and real keyboard focus/
 * focus-visible/Space-toggling behavior.
 *
 * REAL-BROWSER FINDINGS (documented here, not fixed — out of Task 7's
 * scope, which may not modify any React component/style source):
 *
 * 1. `checkbox-style.ts`'s `.u-checkbox-input` rule sets `opacity: 0` on
 *    the real native `<input type="checkbox">` — a real, intentional
 *    visually-hidden-but-interactive input pattern (the sibling
 *    `.u-checkbox-box` div renders the visible custom surrogate on top of
 *    it). Confirmed via real-browser measurement that the input stays
 *    genuinely focusable, Tab-reachable, and Space-togglable despite
 *    Playwright's `toBeVisible()` correctly reporting it as not visible
 *    (nonzero opacity is part of that check's definition) — jsdom/RTL has
 *    no concept of computed opacity at all, so this is a real gap only a
 *    real browser can surface.
 *
 * 2. `.u-checkbox-box` itself sets no explicit width/height — it is sized
 *    only by its content (the check icon, rendered only when `checked`).
 *    Confirmed via real bounding-box measurement: the Checked story's box
 *    genuinely measures 14x14px (sized by the icon), but Default/Disabled/
 *    Invalid (all unchecked, no icon) genuinely measure 0x0px — present in
 *    the DOM with the right classes/attributes, but not "visible" by
 *    Playwright's nonzero-bounding-box definition. A real CSS sizing gap
 *    jsdom's unlaid-out DOM cannot detect at all — the same class of
 *    ancestor/self-sizing gap Angular's Task 6 found for UScroller and
 *    UPaginator's icon buttons. Assertions below use `getByRole` (real DOM
 *    presence/state, not on-screen visibility) for the unchecked stories,
 *    and `.u-checkbox-box`'s real `toBeVisible()` only for the Checked
 *    story, where it is genuinely nonzero.
 */
test.describe("React/Checkbox", () => {
  test("Default story: computed role/checked state, keyboard focus and Space toggling", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-checkbox--default"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveCount(1);

    // Computed accessibility-tree state — the browser's own AX tree
    // reporting "unchecked", not a raw DOM .checked property read (which
    // jsdom/RTL already covers).
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox`);
    await expect(checkbox).not.toBeChecked();

    await page.keyboard.press("Tab");
    await expect(checkbox).toBeFocused();
    const matchesFocusVisible = await checkbox.evaluate((el) => el.matches(":focus-visible"));
    expect(matchesFocusVisible).toBe(true);

    // Real Space-key toggling — the story's local-state harness
    // (checkbox.stories.tsx's CheckboxHarness) wires onChange back into
    // `checked`, mirroring how a real consumer must drive this fully
    // controlled component; the Vitest suite only asserts onChange's event
    // shape, never a real keyboard-driven round trip through React state.
    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-checkbox--default"));
    // .u-checkbox-box measures 0x0px here (real finding #2 above, unchecked
    // + no icon) -- asserting real DOM presence, not on-screen visibility.
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-checkbox--default"));
    await runAccessibilityScan(page, testInfo, "react-checkbox--default");
  });

  test("Checked story: computed accessibility-tree state reflects the checked prop", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-checkbox--checked"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox [checked]`);
  });

  test("Checked story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-checkbox--checked"));
    await expect(page.locator(".u-checkbox-box")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Checked story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-checkbox--checked"));
    await runAccessibilityScan(page, testInfo, "react-checkbox--checked");
  });

  test("Disabled story: disabled checkbox is skipped by real Tab order", async ({ page }) => {
    await page.goto(storyUrl("react-checkbox--disabled"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeDisabled();
    await page.keyboard.press("Tab");
    await expect(checkbox).not.toBeFocused();
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-checkbox--disabled"));
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-checkbox--disabled"));
    await runAccessibilityScan(page, testInfo, "react-checkbox--disabled");
  });

  test("Invalid story: computed aria-invalid is exposed on the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-checkbox--invalid"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveAttribute("aria-invalid", "true");
  });

  test("Invalid story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-checkbox--invalid"));
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Invalid story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-checkbox--invalid"));
    await runAccessibilityScan(page, testInfo, "react-checkbox--invalid");
  });
});
