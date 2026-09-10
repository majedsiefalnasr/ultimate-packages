import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UTooltip (Ng/Tooltip), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/tooltip/tooltip.spec.ts):
 * no tooltip before hover, role="tooltip"/text on mouseenter (dispatched
 * synthetically), hide on mouseleave, numeric left/top style presence
 * (jsdom's getBoundingClientRect is always zeroed, so it cannot assert
 * real coordinates), position-specific class, disabled suppression.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 6's
 * scope, which may not modify any Angular component/style source):
 * `packages/uix-styles/src/tooltip/index.ts`'s `.u-tooltip` rule is
 * `position: absolute; display: none;` with no companion rule (no
 * `.u-tooltip-visible`/`.u-tooltip-open` modifier, etc.) that ever flips
 * `display` back on — `tooltip.ts`'s `show()` never adds such a class
 * either. So in a real browser, the tooltip element is genuinely created
 * with the correct `role="tooltip"`, text, and computed left/top position
 * styles on real hover, but its computed `display` stays `none` and it is
 * never actually visible on screen — a real CSS gap the jsdom-based Vitest
 * suite cannot detect at all (jsdom does not apply real stylesheet rules
 * from `uix-styles`' registered `<style>` element the way a real browser
 * does). Confirmed via isolated trace inspection (Playwright reports
 * "hover action done" and the DOM node exists with the right attributes,
 * but `getComputedStyle(tooltip).display === "none"`).
 *
 * This file proves that real, verified behavior directly, and confirms
 * `uTooltipDisabled` genuinely never even creates the node on hover
 * (distinct from the enabled case's node-exists-but-hidden state).
 */
test.describe("Ng/Tooltip", () => {
  test("Default story: real hover creates the tooltip node with the right role/text/position styling, though it is not visually displayed", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-tooltip--default"));
    const button = page.getByRole("button", { name: "Save" });
    await expect(button).toBeVisible();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);

    // Real mouse hover (not a synthetic dispatchEvent) — genuinely
    // exercises the browser's own pointer-event pipeline, unlike the
    // Vitest suite's dispatched MouseEvent.
    await button.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveText("Save changes");

    // Real, computed left/top pixel position styles (jsdom's
    // getBoundingClientRect is always zeroed, per tooltip.spec.ts's own
    // comment, so it can only assert these styles are numeric-looking
    // strings, never real computed values) — genuinely new here, proving
    // align()'s real math against the button's real layout box.
    const styleLeft = await tooltip.evaluate((el) => (el as HTMLElement).style.left);
    const styleTop = await tooltip.evaluate((el) => (el as HTMLElement).style.top);
    expect(Number.parseFloat(styleLeft)).toBeGreaterThan(0);
    expect(Number.parseFloat(styleTop)).toBeGreaterThanOrEqual(0);

    // Real, verified gap: uix-styles' `.u-tooltip { display: none; }` rule
    // has no companion "visible" modifier class ever applied by
    // tooltip.ts's show(), so the real computed display stays "none" even
    // though the node exists with correct content/attributes/position —
    // provable only against a real browser's stylesheet cascade, which
    // jsdom does not apply.
    const computedDisplay = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(computedDisplay).toBe("none");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-tooltip--default"));
    const button = page.getByRole("button", { name: "Save" });
    await expect(button).toBeVisible();
    await button.hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-tooltip--default"));
    await page.getByRole("button", { name: "Save" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await runAccessibilityScan(page, testInfo, "ng-tooltip--default");
  });

  test("Right Position story: real hover applies the right-position class and computes a real left offset past the trigger", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-tooltip--right-position"));
    const button = page.getByRole("button", { name: "Save" });
    await button.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveClass(/u-tooltip-right/);

    const buttonBox = await button.boundingBox();
    const styleLeft = await tooltip.evaluate((el) => Number.parseFloat((el as HTMLElement).style.left));
    expect(buttonBox).not.toBeNull();
    if (buttonBox) {
      // Real computed left offset must sit at or past the button's real
      // right edge — proves align()'s real right-position math against
      // the button's genuine layout box, not jsdom's always-zeroed rect.
      expect(styleLeft).toBeGreaterThanOrEqual(buttonBox.x + buttonBox.width - 1);
    }
  });

  test("Right Position story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-tooltip--right-position"));
    await page.getByRole("button", { name: "Save" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Right Position story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-tooltip--right-position"));
    await page.getByRole("button", { name: "Save" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await runAccessibilityScan(page, testInfo, "ng-tooltip--right-position");
  });

  test("Disabled story: real hover never creates a tooltip node at all", async ({ page }) => {
    await page.goto(storyUrl("ng-tooltip--disabled"));
    const button = page.getByRole("button");
    await button.hover();
    // Distinct from the enabled stories' node-exists-but-hidden state:
    // uTooltipDisabled short-circuits show() before create() ever runs,
    // so no tooltip node is created at all, not merely hidden.
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-tooltip--disabled"));
    await expect(page.getByRole("button")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-tooltip--disabled"));
    await runAccessibilityScan(page, testInfo, "ng-tooltip--disabled");
  });
});
