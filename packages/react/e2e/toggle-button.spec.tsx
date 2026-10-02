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
