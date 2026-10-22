import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * Workstream 1 wave W2 (Menus and navigation) behaviour fixes. Assertions come
 * from the "Expected state" of each gap; the expected key
 * results were taken from the pinned PrimeVue 4.5.5 ContextMenu and MegaMenu.
 * GAP-084 (plain model arrays) is pinned by the jsdom component specs, because
 * every Storybook story passes a reactive model.
 */
const CONTEXT_STORY = "vue-contextmenu--item-states";
const MEGA_STORY = "vue-megamenu--item-states";
const TRIGGER = "#storybook-root div[style*='dashed']";

async function openContextMenu(page: Page): Promise<void> {
  await page.goto(storyUrl(CONTEXT_STORY));
  await page.mouse.move(0, 0); // ADR-052 X-6: no pointer residue
  const box = await page.locator(TRIGGER).boundingBox();
  expect(box, "context-menu trigger box").not.toBeNull();
  await page.mouse.click(Math.round(box!.x + 40), Math.round(box!.y + 30), { button: "right" });
  await page.mouse.move(0, 0);
  await expect(page.locator(".u-contextmenu")).toBeVisible();
}

const focusedItem = (page: Page) => page.locator(".u-contextmenu-item-focused");
const list = (page: Page) => page.locator(".u-contextmenu-root-list");

async function expectFocused(page: Page, label: string): Promise<void> {
  await expect(focusedItem(page)).toHaveCount(1);
  await expect(focusedItem(page)).toHaveText(label);
  const id = await focusedItem(page).getAttribute("id");
  expect(id, "focused item id").toBeTruthy();
  await expect(list(page)).toHaveAttribute("aria-activedescendant", id!);
}

async function resolved(page: Page, variable: string, property: string): Promise<string> {
  return page.evaluate(
    ([v, p]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, `var(${v})`);
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return value;
    },
    [variable, property] as const
  );
}

test.describe("Vue/Menus and navigation W2", () => {
  test("GAP-086 context menu opening moves focus to the menu list", async ({ page }) => {
    await openContextMenu(page);
    await expect(list(page)).toBeFocused();
    await expect(focusedItem(page)).toHaveCount(0);
  });

  test("GAP-086 context menu arrow keys move focus", async ({ page }) => {
    await openContextMenu(page);
    await page.keyboard.press("ArrowDown");
    await expectFocused(page, "Copy");
    await page.keyboard.press("ArrowDown");
    await expectFocused(page, "Paste");
    // The separator and the disabled "Delete" are skipped; focus does not wrap.
    await page.keyboard.press("ArrowDown");
    await expectFocused(page, "Paste");
    await page.keyboard.press("ArrowUp");
    await expectFocused(page, "Copy");
  });

  test("GAP-086 context menu Home and End move focus", async ({ page }) => {
    await openContextMenu(page);
    await page.keyboard.press("End");
    await expectFocused(page, "Paste");
    await page.keyboard.press("Home");
    await expectFocused(page, "Copy");
  });

  test("GAP-086 context menu focused item uses the focused-item styling", async ({ page }) => {
    await openContextMenu(page);
    await page.keyboard.press("ArrowDown");
    await expectFocused(page, "Copy");
    const content = focusedItem(page).locator(".u-contextmenu-item-content");
    const expected = await resolved(
      page,
      "--u-contextmenu-item-focus-background",
      "background-color"
    );
    // Polled: the item content has a background transition.
    await expect
      .poll(() => content.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe(expected);
  });

  for (const key of ["Enter", "Space"]) {
    test(`GAP-086 context menu ${key} activates the focused item and closes the menu`, async ({
      page,
    }) => {
      await openContextMenu(page);
      await page.keyboard.press("ArrowDown");
      await expectFocused(page, "Copy");
      await page.keyboard.press(key);
      await expect(page.locator(".u-contextmenu")).toHaveCount(0);
    });
  }

  for (const key of ["Escape", "Tab"]) {
    test(`GAP-086 context menu ${key} closes the menu from a focused item`, async ({ page }) => {
      await openContextMenu(page);
      await page.keyboard.press("ArrowDown");
      await expectFocused(page, "Copy");
      await page.keyboard.press(key);
      await expect(page.locator(".u-contextmenu")).toHaveCount(0);
    });
  }

  test("GAP-085 disabled megamenu column item is dimmed like root items", async ({ page }) => {
    await page.goto(storyUrl(MEGA_STORY));
    await page.mouse.move(0, 0);
    // Opened by hover through the real trigger, as the G3-C2 openL1 scenario.
    await page.locator(".u-megamenu-root-list > li > .u-megamenu-item-content").first().hover();
    const column = page.locator(".u-megamenu-submenu .u-megamenu-item");
    const disabled = column.filter({ hasText: "Item A2" });
    const enabled = column.filter({ hasText: "Item A1" });
    await expect(disabled).toBeVisible();
    await expect(disabled).toHaveClass(/\bu-megamenu-item-disabled\b/);
    await expect(enabled).not.toHaveClass(/\bu-megamenu-item-disabled\b/);
    const rootDisabled = page
      .locator(".u-megamenu-root-list > li.u-megamenu-item-disabled")
      .first();
    const rootOpacity = await rootDisabled.evaluate((el) => getComputedStyle(el).opacity);
    expect(rootOpacity).not.toBe("1");
    expect(await disabled.evaluate((el) => getComputedStyle(el).opacity)).toBe(rootOpacity);
    expect(await enabled.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});
