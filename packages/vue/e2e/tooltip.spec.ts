import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for v-tooltip (Vue/Tooltip), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/tooltip/tooltip.spec.ts):
 * no tooltip before hover, a role="tooltip" panel with the bound content
 * appearing on a synthetic mouseenter, textContent-only (never innerHTML)
 * rendering by default with an explicit escape:false opt-in, aria-
 * describedby wiring on show (additive to any pre-existing value) and
 * owned-id-only removal on hide. jsdom's `getBoundingClientRect`/computed
 * `display` is always zeroed/inert, so none of that Vitest coverage can
 * assert real computed layout/visibility.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 8's
 * scope, which may not modify any Vue component/style source):
 * `@ultimate/uix-styles/tooltip`'s base `.u-tooltip` rule hardcodes
 * `display: none` with no companion rule anywhere in `tooltip-style.ts`,
 * `tooltip.ts`, or the shared stylesheet ever adding a class/inline style
 * that overrides it back to visible (confirmed by grep: `showTooltip()` in
 * `packages/vue/src/tooltip/tooltip.ts` only ever sets `class: ["u-tooltip",
 * binding.class]` and inline `position`/`width` — never toggles a
 * `u-tooltip-active`-style modifier or an inline `display` override). So in
 * a real browser, the tooltip panel is genuinely created with the correct
 * `role="tooltip"` and text content on real hover, IS correctly positioned
 * via real `getBoundingClientRect()`-derived inline `left`/`top` styles
 * (a real, working computation — unlike React's Tooltip, whose real,
 * verified finding in Task 7 is a permanently-hardcoded off-screen
 * position; Vue's positioning math is genuinely correct) — but the panel
 * is never actually visible at all, staying `display: none` throughout,
 * a real CSS/component gap the jsdom-based Vitest suite cannot detect at
 * all (jsdom never applies real stylesheet layout, so it also never
 * observes computed `display`). Confirmed via isolated trace inspection:
 * Playwright reports the real hover completing and the DOM node existing
 * with the right attributes and correctly-computed position, but
 * `getComputedStyle(tooltip).display === "none"` and its bounding box is
 * `{width: 0, height: 0}`.
 *
 * This file proves that real, verified behavior directly, and confirms
 * `disabled` genuinely never even creates the node on hover (distinct from
 * the enabled case's node-exists-but-invisible state).
 *
 * Vue's own stories (tooltip.stories.ts) expose only Default/Disabled —
 * there is no separate position-variant story, so this file has no
 * left-position test.
 */
test.describe("Vue/Tooltip", () => {
  test("Default story: real hover creates the tooltip node with the right role/text/aria-describedby wiring and a correctly-computed position, though it is never actually displayed", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-tooltip--default"));
    const button = page.getByRole("button", { name: "Hover me" });
    await expect(button).toBeVisible();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);

    // Real mouse hover (not a synthetic `.trigger("mouseenter")`) —
    // genuinely exercises the browser's own pointer-event pipeline, unlike
    // the Vitest suite's dispatched event.
    const buttonBox = await button.boundingBox();
    expect(buttonBox).not.toBeNull();
    await button.hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveText("Save changes");
    await expect(button).toHaveAttribute("aria-describedby", await tooltip.getAttribute("id") ?? "");

    // Real, verified finding: unlike React's Tooltip (a hardcoded
    // off-screen position), Vue's tooltip.ts genuinely computes a correct
    // on-screen position from the target's real getBoundingClientRect() —
    // provable only against a real browser's layout engine, which jsdom
    // does not run at all.
    const left = await tooltip.evaluate((el) => parseFloat((el as HTMLElement).style.left));
    const top = await tooltip.evaluate((el) => parseFloat((el as HTMLElement).style.top));
    expect(left).toBeCloseTo(buttonBox!.x, 0);
    expect(top).toBeGreaterThan(buttonBox!.y);

    // Real, verified gap: despite the correct position, the base
    // `.u-tooltip { display: none }` rule is never overridden anywhere in
    // this codebase, so the panel stays genuinely invisible in a real
    // browser.
    await expect(tooltip).toBeHidden();
    const display = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("none");
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-tooltip--default"));
    await page.getByRole("button", { name: "Hover me" }).hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await runAccessibilityScan(page, testInfo, "vue-tooltip--default");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-tooltip--default"));
    const button = page.getByRole("button", { name: "Hover me" });
    await expect(button).toBeVisible();
    await button.hover();
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: real hover never creates a tooltip node at all", async ({ page }) => {
    await page.goto(storyUrl("vue-tooltip--disabled"));
    const button = page.getByRole("button", { name: "Hover me (disabled)" });
    await button.hover();
    // Distinct from the enabled story's node-exists-but-invisible state:
    // `showTooltip()` short-circuits at `if (binding.disabled || ...)
    // return;` before the panel is ever created, so the Portal-equivalent
    // `document.body.appendChild` never runs at all.
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-tooltip--disabled"));
    await expect(page.getByRole("button", { name: "Hover me (disabled)" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-tooltip--disabled"));
    await runAccessibilityScan(page, testInfo, "vue-tooltip--disabled");
  });
});
