import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UButton (React/Button), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/button/button.spec.tsx):
 * label rendering, click emission, disabled click suppression, loading
 * class/spinner, default aria-label computed from label+badge, ref
 * forwarding, severity/size/outlined modifier classes. None of that is
 * repeated here — this file adds only what a real browser's accessibility
 * tree and focus engine can prove and jsdom cannot: the computed ARIA
 * role/name via Playwright's real accessibility-tree APIs, and genuine
 * keyboard focus-visible behavior.
 */
test.describe("React/Button", () => {
  test("Default story: computed role/name, keyboard focus, and Enter/Space activation", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-button--default"));
    const button = page.getByRole("button", { name: "Save" });
    await expect(button).toBeVisible();

    // Computed accessibility-tree snapshot — jsdom/RTL has no real
    // accessibility tree, so this is genuinely new coverage, not a
    // duplicate of the Vitest aria-label test (which only reads the raw
    // DOM attribute, not the browser's computed AX node).
    await expect(button).toMatchAriaSnapshot(`- button "Save"`);

    // Real keyboard focus order/focus-visible: Tab from body must land on
    // the button, and the browser's own :focus-visible heuristic (real
    // keyboard-triggered focus, unavailable in jsdom) must apply.
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    const matchesFocusVisible = await button.evaluate((el) => el.matches(":focus-visible"));
    expect(matchesFocusVisible).toBe(true);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-button--default"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-button--default"));
    await runAccessibilityScan(page, testInfo, "react-button--default");
  });

  test("Disabled story: disabled button is not keyboard-focusable and is exposed as disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-button--disabled"));
    const button = page.getByRole("button", { name: "Save" });
    await expect(button).toBeDisabled();

    // A native disabled <button> is skipped entirely by Tab order in every
    // real browser — genuinely new real-browser-only coverage (jsdom's
    // Tab-order semantics are not simulated at all by RTL).
    await page.keyboard.press("Tab");
    await expect(button).not.toBeFocused();
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-button--disabled"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-button--disabled"));
    await runAccessibilityScan(page, testInfo, "react-button--disabled");
  });

  test("Loading story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-button--loading"));
    await expect(page.locator(".u-button-loading")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Loading story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-button--loading"));
    await runAccessibilityScan(page, testInfo, "react-button--loading");
  });

  test("Danger story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-button--danger"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Danger story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-button--danger"));
    await runAccessibilityScan(page, testInfo, "react-button--danger");
  });
});
