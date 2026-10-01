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
 * GAP-066 FIX (verified here, in a real browser): `UTooltip.create()`
 * (packages/ng/src/tooltip/tooltip.ts) now sets an inline `display:
 * inline-block` style on the container, which outranks the shared
 * `@ultimate/uix-styles/tooltip` base `.u-tooltip { display: none }` rule
 * (jsdom does not apply that stylesheet, so only a real browser can prove
 * the tooltip is actually displayed). The tooltip is now genuinely visible
 * on real hover, in addition to the correct `role="tooltip"`, text, and
 * computed left/top position styles.
 *
 * This file proves the fixed, visible behavior directly, and confirms
 * `uTooltipDisabled` genuinely never even creates the node on hover
 * (distinct from the enabled case's node-exists-and-is-visible state).
 */
test.describe("Ng/Tooltip", () => {
  test("Default story: real hover creates a visible tooltip node with the right role/text/position styling", async ({
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
    // Now that the container is displayed when align() measures it, it has a
    // real size: a tooltip wider than the near-edge trigger is centred past
    // the viewport's left edge and clamped to 0, and sits above the trigger
    // ("top" position, no vertical clamp), so top may be negative.
    const buttonBox = await button.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(Number.parseFloat(styleLeft)).toBeGreaterThanOrEqual(0);
    expect(Number.parseFloat(styleTop)).toBeLessThan(buttonBox!.y);

    // Verified fix (GAP-066): create() sets an inline `display: inline-block`
    // that outranks the base `.u-tooltip { display: none }` rule, so the
    // tooltip is genuinely visible. Asserting `not.toBe("none")` rather than
    // an exact value keeps this robust across browsers' computed-style
    // reporting.
    await expect(tooltip).toBeVisible();
    const computedDisplay = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(computedDisplay).not.toBe("none");
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
    // Distinct from the enabled stories' node-exists-and-is-visible state:
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
