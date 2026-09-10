import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UTooltip (React/Tooltip), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/tooltip/tooltip.spec.tsx):
 * no tooltip before hover, role="tooltip"/text/aria-describedby wiring on
 * mouseenter (dispatched synthetically), hide + aria-describedby cleanup on
 * mouseleave (preserving a pre-existing unrelated value), disabled
 * suppression. jsdom's `getBoundingClientRect`/computed layout is always
 * zeroed, so none of that Vitest coverage can assert a real screen
 * position.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 7's
 * scope, which may not modify any React component/style source):
 * `packages/react/src/tooltip/tooltip-style.ts`'s `.u-tooltip` rule
 * hardcodes `top: -9999px; left: -9999px` with no companion rule or inline
 * style ever overriding those values — `tooltip.tsx` computes no dynamic
 * position at all (confirmed by grep: no `top`/`left`/measurement logic
 * anywhere in the component), unlike Angular's `UTooltip`, which at least
 * computes real (if never-displayed) left/top values via `align()`. So in
 * a real browser, the tooltip element is genuinely created with the
 * correct `role="tooltip"` and text content on real hover, and IS visually
 * rendered (`display` stays whatever `.u-tooltip u-component` resolves to,
 * unlike Angular's separate `display:none` gap) — but it always renders
 * permanently off-screen at (-9999, -9999) regardless of the `position`
 * prop, a real CSS/component gap the jsdom-based Vitest suite cannot
 * detect at all (jsdom never applies real stylesheet layout). Confirmed
 * via isolated trace inspection: Playwright reports "hover action done"
 * and the DOM node exists with the right attributes, but
 * `getBoundingClientRect(tooltip).x === -9999`.
 *
 * This file proves that real, verified behavior directly, and confirms
 * `disabled` genuinely never even creates the node on hover (distinct
 * from the enabled case's node-exists-but-off-screen state).
 */
test.describe("React/Tooltip", () => {
  test("Default story: real hover creates the tooltip node with the right role/text/aria-describedby wiring, though it renders permanently off-screen", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-tooltip--default"));
    const button = page.getByRole("button", { name: "Hover me" });
    await expect(button).toBeVisible();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);

    // Real mouse hover (not a synthetic fireEvent.mouseEnter) — genuinely
    // exercises the browser's own pointer-event pipeline, unlike the
    // Vitest suite's dispatched event.
    await button.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveText("Save changes");
    await expect(button).toHaveAttribute("aria-describedby", await tooltip.getAttribute("id") ?? "");

    // Real, verified gap: no positioning logic anywhere in tooltip.tsx
    // ever overrides the hardcoded `top: -9999px; left: -9999px` CSS rule
    // — provable only against a real browser's layout engine, which jsdom
    // does not run at all.
    const box = await tooltip.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeLessThan(0);
      expect(box.y).toBeLessThan(0);
    }
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-tooltip--default"));
    const button = page.getByRole("button", { name: "Hover me" });
    await expect(button).toBeVisible();
    await button.hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-tooltip--default"));
    await page.getByRole("button", { name: "Hover me" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await runAccessibilityScan(page, testInfo, "react-tooltip--default");
  });

  test("Left Position story: real hover creates the tooltip node with the position-specific class, still rendered off-screen", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-tooltip--left-position"));
    const button = page.getByRole("button", { name: "Hover me" });
    await button.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveClass(/u-tooltip-left/);
  });

  test("Left Position story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-tooltip--left-position"));
    await page.getByRole("button", { name: "Hover me" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Left Position story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-tooltip--left-position"));
    await page.getByRole("button", { name: "Hover me" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await runAccessibilityScan(page, testInfo, "react-tooltip--left-position");
  });

  test("Disabled story: real hover never creates a tooltip node at all", async ({ page }) => {
    await page.goto(storyUrl("react-tooltip--disabled"));
    const button = page.getByRole("button", { name: "Hover me" });
    await button.hover();
    // Distinct from the enabled stories' node-exists-but-off-screen state:
    // UTooltip's show() short-circuits before setVisible(true) ever runs
    // when disabled, so the Portal never renders a node at all.
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-tooltip--disabled"));
    await expect(page.getByRole("button", { name: "Hover me" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-tooltip--disabled"));
    await runAccessibilityScan(page, testInfo, "react-tooltip--disabled");
  });
});
