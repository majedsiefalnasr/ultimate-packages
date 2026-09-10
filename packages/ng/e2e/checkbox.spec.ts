import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UCheckbox (Ng/Checkbox), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/checkbox/checkbox.spec.ts):
 * native input[type=checkbox] rendering, click/Space-key toggling,
 * FormControl (CVA) integration, disabled input/setDisabledState, label
 * class rendering. This file adds only genuinely new real-browser
 * coverage: the computed accessibility-tree checked state and real
 * keyboard focus/focus-visible behavior.
 */
test.describe("Ng/Checkbox", () => {
  test("Default story: computed role/checked state, keyboard focus and Space toggling", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-checkbox--default"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeVisible();

    // Computed accessibility-tree state — the browser's own AX tree
    // reporting "unchecked", not a raw DOM .checked property read (which
    // jsdom/TestBed already covers).
    await expect(checkbox).toMatchAriaSnapshot(`- checkbox`);
    await expect(checkbox).not.toBeChecked();

    await page.keyboard.press("Tab");
    await expect(checkbox).toBeFocused();
    const matchesFocusVisible = await checkbox.evaluate((el) => el.matches(":focus-visible"));
    expect(matchesFocusVisible).toBe(true);

    await page.keyboard.press("Space");
    await expect(checkbox).toBeChecked();
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-checkbox--default"));
    await expect(page.getByRole("checkbox")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-checkbox--default"));
    await runAccessibilityScan(page, testInfo, "ng-checkbox--default");
  });

  test("With Label story: accessible name comes from the visible label text", async ({ page }) => {
    await page.goto(storyUrl("ng-checkbox--with-label"));
    // Computed accessible name via the real accessibility tree — proves the
    // <span class="u-checkbox-label"> Vitest only checks for class/text
    // presence on is actually wired as this checkbox's AX name, not merely
    // adjacent markup.
    const checkbox = page.getByRole("checkbox", { name: "Accept terms" });
    await expect(checkbox).toBeVisible();
  });

  test("With Label story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-checkbox--with-label"));
    await expect(page.getByRole("checkbox")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("With Label story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-checkbox--with-label"));
    await runAccessibilityScan(page, testInfo, "ng-checkbox--with-label");
  });

  test("Disabled story: disabled checkbox is skipped by real Tab order", async ({ page }) => {
    await page.goto(storyUrl("ng-checkbox--disabled"));
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeDisabled();
    await page.keyboard.press("Tab");
    await expect(checkbox).not.toBeFocused();
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-checkbox--disabled"));
    await expect(page.getByRole("checkbox")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-checkbox--disabled"));
    await runAccessibilityScan(page, testInfo, "ng-checkbox--disabled");
  });
});
