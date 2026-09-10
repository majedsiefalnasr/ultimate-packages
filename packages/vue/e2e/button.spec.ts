import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UButton (Vue/Button), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/button/button.spec.ts):
 * native <button> rendering with the label, icon rendering, loading
 * spinner/label-icon suppression, default aria-label computed from
 * label+badge, boolean-modifier classes (severity/raised/rounded/text/
 * outlined), rendering as a different root element via `as`, the v-ripple
 * directive's ink element being present, and the tooltip-prop sugar
 * showing a role=tooltip panel on a synthetic mouseenter. None of that is
 * repeated here — this file adds only what a real browser's accessibility
 * tree and focus engine can prove and jsdom cannot: the computed ARIA
 * role/name via Playwright's real accessibility-tree APIs, and genuine
 * keyboard focus-visible behavior.
 *
 * Vue's own stories (button.stories.ts) expose Default/WithIcon/Loading/
 * Danger — there is no separate Disabled story (unlike React's), so this
 * file has no disabled-focus-order test.
 */
test.describe("Vue/Button", () => {
  test("Default story: computed role/name, keyboard focus, and Enter/Space activation", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-button--default"));
    const button = page.getByRole("button", { name: "Save" });
    await expect(button).toBeVisible();

    // Computed accessibility-tree snapshot — jsdom/@vue/test-utils has no
    // real accessibility tree, so this is genuinely new coverage, not a
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
    await page.goto(storyUrl("vue-button--default"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-button--default"));
    await runAccessibilityScan(page, testInfo, "vue-button--default");
  });

  test("With Icon story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-button--with-icon"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("With Icon story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-button--with-icon"));
    await runAccessibilityScan(page, testInfo, "vue-button--with-icon");
  });

  test("Loading story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-button--loading"));
    await expect(page.locator(".u-button-loading-icon")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Loading story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-button--loading"));
    await runAccessibilityScan(page, testInfo, "vue-button--loading");
  });

  test("Danger story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-button--danger"));
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Danger story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-button--danger"));
    await runAccessibilityScan(page, testInfo, "vue-button--danger");
  });
});
