import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for v-tooltip (Vue/Tooltip), Task 8 (original),
 * updated for the GAP-039 visibility fix.
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
 * GAP-039 FIX (verified here, in a real browser): `showTooltip()`
 * (packages/vue/src/tooltip/tooltip.ts) now sets an inline `display:
 * inline-block` style on the panel when it is created, mirroring real
 * PrimeVue's own Tooltip.js `create()` mechanism (an inline style outranks
 * the shared `@ultimate/uix-styles/tooltip` base `.u-tooltip { display:
 * none }` CSS rule by specificity). The panel is now genuinely visible on
 * real hover, in addition to already having the correct `role="tooltip"`,
 * text content, aria-describedby wiring, and a correctly-computed on-
 * screen position from the target's real getBoundingClientRect() (unlike
 * React's Tooltip, whose real, verified finding in Task 7 is a
 * permanently-hardcoded off-screen position — Vue's positioning math was
 * always correct; only visibility was broken).
 *
 * This file proves the fixed, visible behavior directly, and confirms
 * `disabled` genuinely never even creates the node on hover (distinct from
 * the enabled case's node-exists-and-is-visible state).
 *
 * Vue's own stories (tooltip.stories.ts) expose only Default/Disabled —
 * there is no separate position-variant story, so this file has no
 * left-position test.
 */
test.describe("Vue/Tooltip", () => {
  test("Default story: real hover creates a visible tooltip node with the right role/text/aria-describedby wiring and a correctly-computed position", async ({
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

    // Verified fix (GAP-039): showTooltip() now sets an inline
    // `display: inline-block` style on the panel, mirroring real
    // PrimeVue's own create() mechanism, so the panel is genuinely
    // visible in a real browser despite the base `.u-tooltip { display:
    // none }` CSS rule (an inline style outranks a class-based rule by
    // specificity). Asserting `not.toBe("none")` rather than an exact
    // value keeps this robust across Chromium/Firefox/WebKit computed-
    // style reporting differences.
    await expect(tooltip).toBeVisible();
    const display = await tooltip.evaluate((el) => getComputedStyle(el).display);
    expect(display).not.toBe("none");
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
    // Distinct from the enabled story's node-exists-and-is-visible state:
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
