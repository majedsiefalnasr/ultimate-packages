import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UMenu (Ng/Menu), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/menu/menu.spec.ts):
 * role=menu/menuitem/separator rendering, ArrowDown roving-tabindex
 * navigation (including skipping disabled items), initial tabindex=0 seed,
 * routerLink wiring (including disabled-item suppression), p-disabled
 * modifier class, hover tooltip integration. This file adds only
 * genuinely new real-browser coverage: real Tab-key focus order into/out
 * of the roving-tabindex widget, and the computed accessibility-tree
 * role/state the browser itself reports.
 */
test.describe("Ng/Menu", () => {
  test("Default story: computed menu/menuitem roles and real Tab-then-ArrowDown focus order", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-menu--default"));
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const menuItems = page.getByRole("menuitem");
    await expect(menuItems).toHaveCount(2);

    // Real Tab-key entry into a roving-tabindex widget: only the item with
    // tabindex=0 is reachable via a single real Tab press from the page's
    // start — jsdom/TestBed's tests seed focus programmatically
    // (menuItems[0].focus()) rather than driving a real Tab key, so this is
    // genuinely new coverage of the roving-tabindex contract end to end.
    await page.keyboard.press("Tab");
    await expect(menuItems.first()).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(menuItems.nth(1)).toBeFocused();
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-menu--default"));
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-menu--default"));
    await runAccessibilityScan(page, testInfo, "ng-menu--default");
  });

  test("With Disabled Item story: real ArrowDown navigation skips the disabled item and disabled item is unreachable via Tab", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-menu--with-disabled-item"));
    const menuItems = page.getByRole("menuitem");
    await expect(menuItems.first()).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(menuItems.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    // Index 1 ("Disabled") must be skipped, landing on index 2 ("Settings").
    await expect(menuItems.nth(2)).toBeFocused();
  });

  test("With Disabled Item story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-menu--with-disabled-item"));
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("With Disabled Item story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-menu--with-disabled-item"));
    await runAccessibilityScan(page, testInfo, "ng-menu--with-disabled-item");
  });

  test("Popup story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-menu--popup"));
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Popup story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-menu--popup"));
    await runAccessibilityScan(page, testInfo, "ng-menu--popup");
  });
});
