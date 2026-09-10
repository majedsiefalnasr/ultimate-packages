import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UMenu (Vue/Menu), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/menu/menu.spec.ts):
 * non-popup mode's always-visible inline ul[role=menu] with role=menuitem
 * per model entry and role=separator for separators, aria-disabled on
 * disabled items, aria-activedescendant-driven (not roving-tabindex)
 * ArrowDown/Home/End navigation with disabled-item skipping, mousemove
 * focus tracking, Space-triggers-Enter activation, and popup-mode lifecycle
 * (show/hide, Escape, Tab-dismisses-without-trapping, outside-click,
 * resize/scroll dismissal) — all driven via a programmatic `.trigger("focus")`
 * plus synthetic `.trigger("keydown")`, and (for popup mode) real DOM
 * queries against `document.querySelector` since UPortal teleports outside
 * @vue/test-utils' own wrapper tree. None of that simulates a real Tab key
 * press reaching the list from page start. This file adds only genuinely
 * new real-browser coverage: a real Tab-key entry into the single-stop
 * `tabIndex=0` list (the aria-activedescendant pattern's real entry point),
 * and the computed accessibility-tree role/state the browser itself
 * reports.
 *
 * Vue's own story (menu.stories.ts) exposes only Default (non-popup, inline
 * mode) — there is no separate popup-mode story, so this file has no
 * popup-lifecycle test.
 */
test.describe("Vue/Menu", () => {
  test("Default story: computed menu/menuitem roles, real Tab entry lands on and focuses the single-stop list, pre-seeding aria-activedescendant to the first item, and real ArrowDown advances it", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-menu--default"));
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // The model has 5 entries (New/Open/separator/Disabled/Delete) — 4
    // real menuitem nodes (separators are role="separator", not
    // "menuitem").
    const menuItems = page.getByRole("menuitem");
    await expect(menuItems).toHaveCount(4);

    // Real Tab-key entry: UMenu exposes a single tabIndex=0 stop on the
    // `<ul role="menu">` itself and tracks virtual focus via
    // aria-activedescendant — so a real Tab press must land on the list,
    // not any menuitem. Real DOM focus reaching the list fires its own
    // onFocus handler (Menu.vue's onListFocus), which immediately seeds
    // aria-activedescendant to the first real item ("New") via
    // changeFocusedOptionIndex(0) — genuinely new real-browser coverage:
    // the Vitest suite seeds focus programmatically
    // (`list.trigger("focus")`) rather than driving a real Tab key from
    // page start, but never asserts what aria-activedescendant becomes
    // immediately on that focus transition.
    await page.keyboard.press("Tab");
    await expect(menu).toBeFocused();
    await expect(menuItems.first()).not.toBeFocused();
    const firstItemId = await menuItems.first().getAttribute("id");
    await expect(menu).toHaveAttribute("aria-activedescendant", firstItemId ?? "");

    // Real ArrowDown keydown reaching the list's live onKeyDown handler
    // advances aria-activedescendant to the second item ("Open") while
    // real DOM focus stays on the list — proving the real keyboard
    // pipeline (not a synthetic `.trigger("keydown")`) drives the same
    // virtual-focus contract.
    await page.keyboard.press("ArrowDown");
    const activeId = await menu.getAttribute("aria-activedescendant");
    expect(activeId).not.toBe(firstItemId);
    const activeText = await page.locator(`#${activeId}`).textContent();
    expect(activeText).toContain("Open");
  });

  test("Default story: real ArrowDown navigation skips the disabled item", async ({ page }) => {
    await page.goto(storyUrl("vue-menu--default"));
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(menu).toBeFocused();

    // Real Tab focus already seeds aria-activedescendant to "New" (index
    // 0, see the test above). Menu.vue's getEnabledItems() filters the
    // model to `!item.separator && !item.disabled`, so "Disabled" is
    // excluded from the navigable set entirely (not merely skipped-over
    // mid-traversal) — changeFocusedOptionIndex clamps at the last real
    // index of that 3-item enabled set (New, Open, Delete), so real
    // ArrowDown presses advance New -> Open -> Delete without ever landing
    // on "Disabled". Proves the disabled item is genuinely unreachable via
    // a real end-to-end keyboard path, not merely via the Vitest suite's
    // synthetic single-keydown assertions.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const activeId = await menu.getAttribute("aria-activedescendant");
    const activeText = await page.locator(`#${activeId}`).textContent();
    expect(activeText).toContain("Delete");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-menu--default"));
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-menu--default"));
    await runAccessibilityScan(page, testInfo, "vue-menu--default");
  });
});
