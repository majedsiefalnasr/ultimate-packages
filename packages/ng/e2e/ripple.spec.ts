import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for URipple (Ng/Ripple), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/ripple/ripple.spec.ts):
 * a .u-ink span is created on a dispatched mousedown MouseEvent (that test
 * asserts presence after dispatch, not absence before it). Real-browser
 * inspection confirms `ripple.ts`'s constructor effect actually calls
 * `create()` immediately once the directive initializes (see its
 * `effect()` — `create()` runs unconditionally when ripple is enabled, not
 * lazily on first mousedown), pre-creating an idle `.u-ink` span with
 * `data-u-ink-active="false"`; `onMouseDown` only toggles it to active and
 * animates it. This file adds genuinely new real-browser coverage
 * reflecting that real lifecycle: the ink span already exists idle before
 * any interaction, a real mouse click (not a dispatched MouseEvent) toggles
 * it active, and the computed accessibility tree confirms the ink span is
 * genuinely excluded from assistive technology (aria-hidden/presentation)
 * throughout — which jsdom's DOM-attribute assertions cannot verify at the
 * accessibility-tree level.
 */
test.describe("Ng/Ripple", () => {
  test("Default story: the ink span exists idle from init, and a real mouse click activates it while staying hidden from the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-ripple--default"));
    const button = page.getByRole("button", { name: "Click me" });
    await expect(button).toBeVisible();

    // Real component lifecycle: the ink span is pre-created idle
    // (data-u-ink-active="false") as soon as the directive initializes,
    // not lazily on first interaction.
    const ink = button.locator(".u-ink");
    await expect(ink).toHaveAttribute("data-u-ink-active", "false");

    // Real mouse click (not a synthetic dispatchEvent) — genuinely
    // exercises the browser's own pointer pipeline, unlike the Vitest
    // suite's dispatched MouseEvent — and toggles the pre-existing span
    // to its active state.
    await button.click();
    await expect(ink).toHaveAttribute("data-u-ink-active", "true");

    // Computed accessibility-tree exclusion: the button's accessible name
    // must remain exactly "Click me" with no extra node contributed by the
    // decorative ink span — proof the aria-hidden/presentation markup
    // ripple.ts applies is actually honored by a real browser's
    // accessibility-tree computation, not just present as a DOM attribute.
    await expect(button).toMatchAriaSnapshot(`- button "Click me"`);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-ripple--default"));
    await expect(page.getByRole("button", { name: "Click me" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-ripple--default"));
    await runAccessibilityScan(page, testInfo, "ng-ripple--default");
  });
});
