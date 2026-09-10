import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UMenu (React/Menu), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/menu/menu.spec.tsx):
 * role=menu/menuitem/separator rendering, aria-activedescendant-driven
 * (not roving-tabindex) ArrowDown/ArrowUp/Home/End navigation with real DOM
 * focus staying on the `<ul>`, disabled-item skipping, Enter-invokes-command.
 * All of that is driven via a programmatic `list.focus()` plus synthetic
 * `fireEvent.keyDown` — jsdom never simulates a real Tab key press reaching
 * the list from page start. This file adds only genuinely new real-browser
 * coverage: a real Tab-key entry into the single-stop `tabIndex=0` list
 * (the aria-activedescendant pattern's real entry point, distinct from
 * Angular's per-item roving-tabindex), and the computed accessibility-tree
 * role/state the browser itself reports.
 */
test.describe("React/Menu", () => {
  test("Default story: computed menu/menuitem roles, real Tab entry lands on and focuses the single-stop list, pre-seeding aria-activedescendant to the first item, and real ArrowDown advances it", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-menu--default"));
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // The model has 4 entries (New/Open/separator/Disabled) — 3 real
    // menuitem nodes (separators are role="separator", not "menuitem").
    const menuItems = page.getByRole("menuitem");
    await expect(menuItems).toHaveCount(3);

    // Real Tab-key entry: unlike Angular's roving-tabindex UMenu (where Tab
    // lands directly on a menuitem), React's UMenu exposes a single
    // tabIndex=0 stop on the `<ul role="menu">` itself and tracks virtual
    // focus via aria-activedescendant — so a real Tab press must land on
    // the list, not any menuitem. Real DOM focus reaching the list fires
    // its own onFocus handler (menu.tsx's onListFocus), which immediately
    // seeds aria-activedescendant to the first real menuitem ("New") —
    // genuinely new real-browser coverage: the Vitest suite seeds focus
    // programmatically (list.focus(), which in jsdom/RTL still dispatches
    // a real focus event per menu.spec.tsx's own comment) rather than
    // driving a real Tab key from page start, but never asserts what
    // aria-activedescendant becomes immediately on that focus transition.
    await page.keyboard.press("Tab");
    await expect(menu).toBeFocused();
    await expect(menuItems.first()).not.toBeFocused();
    const firstItemId = await menuItems.first().getAttribute("id");
    await expect(menu).toHaveAttribute("aria-activedescendant", firstItemId ?? "");

    // Real ArrowDown keydown reaching the list's live onKeyDown handler
    // advances aria-activedescendant to the second item ("Open") while
    // real DOM focus stays on the list — proving the real keyboard
    // pipeline (not a synthetic fireEvent.keyDown) drives the same
    // virtual-focus contract.
    await page.keyboard.press("ArrowDown");
    const activeId = await menu.getAttribute("aria-activedescendant");
    expect(activeId).not.toBe(firstItemId);
    const activeText = await page.locator(`#${activeId}`).textContent();
    expect(activeText).toContain("Open");
  });

  test("Default story: real ArrowDown navigation skips the disabled item", async ({ page }) => {
    await page.goto(storyUrl("react-menu--default"));
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(menu).toBeFocused();

    // Real Tab focus already seeds aria-activedescendant to "New" (index
    // 0, see the test above). menu.tsx's getMenuItemEls() scopes its
    // MENUITEM_SELECTOR to `[data-u-disabled="false"]`, so "Disabled" is
    // excluded from the navigable set entirely (not merely skipped-over
    // mid-traversal) -- changeFocusedIndex clamps at the last real index
    // of that 2-item set (New, Open) rather than wrapping, so a second
    // real ArrowDown press stays clamped on "Open" rather than reaching
    // "Disabled" or wrapping back to "New". Proves the disabled item is
    // genuinely unreachable via a real end-to-end keyboard path, not
    // merely via the Vitest suite's synthetic single-keydown assertions.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const activeId = await menu.getAttribute("aria-activedescendant");
    const activeText = await page.locator(`#${activeId}`).textContent();
    expect(activeText).toContain("Open");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-menu--default"));
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-menu--default"));
    await runAccessibilityScan(page, testInfo, "react-menu--default");
  });
});
