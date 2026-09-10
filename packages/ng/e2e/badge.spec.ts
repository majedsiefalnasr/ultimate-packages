import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UBadge (Ng/Badge), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/badge/badge.spec.ts):
 * value rendering as text content, u-badge root class application. UBadge
 * is purely decorative with no ARIA role or keyboard semantics of its own
 * (per badge.stories.ts's own accessibility notes), so this file's
 * genuinely new real-browser contribution is the computed accessibility
 * tree confirming the badge is exposed to assistive technology exactly as
 * plain text (no unintended implicit role/name), which jsdom's DOM-only
 * assertions cannot verify.
 */
test.describe("Ng/Badge", () => {
  test("Default story: computed accessibility tree exposes only plain text, no unintended role", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-badge--default"));
    const badge = page.locator(".u-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("5");

    // Computed accessibility-tree snapshot: proves the real browser exposes
    // this element with no interactive role (button/link/etc.) — a
    // guarantee jsdom's DOM-attribute-only assertions cannot make, since
    // jsdom never computes an actual accessibility tree.
    await expect(badge).toMatchAriaSnapshot(`- text: "5"`);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-badge--default"));
    await expect(page.locator(".u-badge")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-badge--default"));
    await runAccessibilityScan(page, testInfo, "ng-badge--default");
  });

  test("Success story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-badge--success"));
    await expect(page.locator(".u-badge")).toHaveText("Active");
    await expect(page).toHaveScreenshot();
  });

  test("Success story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-badge--success"));
    await runAccessibilityScan(page, testInfo, "ng-badge--success");
  });

  test("Large story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-badge--large"));
    await expect(page.locator(".u-badge")).toHaveText("99+");
    await expect(page).toHaveScreenshot();
  });

  test("Large story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-badge--large"));
    await runAccessibilityScan(page, testInfo, "ng-badge--large");
  });
});
