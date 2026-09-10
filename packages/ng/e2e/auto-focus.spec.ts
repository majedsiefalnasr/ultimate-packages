import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UAutoFocus (Ng/AutoFocus), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/autofocus/auto-focus.spec.ts):
 * DOM focus moves to the [uAutoFocus]=true element after a real
 * setTimeout(0) flush. This file adds only genuinely new real-browser
 * coverage: the real document.activeElement reported by an actual browser
 * (not jsdom's activeElement emulation) and the real accessibility tree's
 * "focused" state on that element, which no jsdom-based test can compute.
 */
test.describe("Ng/AutoFocus", () => {
  test("Default story: real browser moves DOM focus automatically, and the accessibility tree reports it focused", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-autofocus--default"));
    const input = page.getByPlaceholder("Auto-focused on load");
    await expect(input).toBeVisible();

    // Real document.activeElement in an actual browser — genuinely new
    // relative to jsdom's activeElement emulation.
    await expect(input).toBeFocused();

    // Computed accessibility-tree focused state: the real browser's own AX
    // tree must also report this element as focused, not merely the DOM
    // activeElement pointer — jsdom computes no accessibility tree at all.
    await expect(input).toMatchAriaSnapshot(`- textbox [active]`);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-autofocus--default"));
    await expect(page.getByPlaceholder("Auto-focused on load")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-autofocus--default"));
    await runAccessibilityScan(page, testInfo, "ng-autofocus--default");
  });
});
