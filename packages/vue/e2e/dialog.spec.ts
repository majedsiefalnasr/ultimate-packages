import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UDialog (Vue/Dialog), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/dialog/dialog.spec.ts):
 * renders nothing when visible=false, role="dialog"/aria-modal/
 * aria-labelledby wiring when visible, update:visible(false) emission on
 * close-button click, no draggable/maximizable affordances, Escape
 * handling (including multi-dialog priority stacking and mount-false-then-
 * toggle-true), scroll locking (including multi-dialog refcounting), and
 * focus capture/restore on close — all driven through jsdom (with the
 * default `<transition>` stub disabled for that file only, so the real
 * onEnter/onLeave hooks actually run), which performs no real layout and
 * does not simulate real Tab-key traversal. This file adds only genuinely
 * new real-browser coverage: real viewport-relative centering (Portal
 * renders into actual document.body with real CSS layout, which jsdom
 * cannot lay out), and `focusTrapDirective`'s real sentinel-span +
 * MutationObserver Tab-wrapping mechanism
 * (`packages/vue-core/src/focus-trap/focus-trap.ts` — hidden-focusable-
 * span-before/after-content, distinct from React's static sentinel design
 * only in that Vue's also re-focuses on DOM mutation, not merely on Tab),
 * exercised via a real keyboard Tab press rather than jsdom's unsimulated
 * tab order.
 */
test.describe("Vue/Dialog", () => {
  test("Default story: closed dialog renders no role=dialog element", async ({ page }) => {
    await page.goto(storyUrl("vue-dialog--default"));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-dialog--default"));
    // Content-visibility wait before every screenshot (Task 7's fix,
    // carried forward from the start here): waits for the story's own
    // "Show dialog" trigger button before screenshotting, closing the same
    // race against Storybook's own loader-overlay teardown every other
    // visual-regression test in this suite also guards against.
    await expect(page.getByRole("button", { name: "Show dialog" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-dialog--default"));
    await runAccessibilityScan(page, testInfo, "vue-dialog--default");
  });

  test("Open story: real viewport-relative centering and computed dialog role/name", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-dialog--open"));
    const dialog = page.getByRole("dialog", { name: "Confirm" });
    await expect(dialog).toBeVisible();

    // Real viewport-relative overlay positioning: Portal renders the
    // dialog into document.body with actual CSS layout, so its real
    // bounding box can be compared against the real viewport's bounding
    // box — jsdom performs no layout at all, so this is genuinely new
    // coverage impossible in the Vitest/@vue/test-utils suite.
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    if (box && viewport) {
      const dialogCenterX = box.x + box.width / 2;
      const viewportCenterX = viewport.width / 2;
      // Horizontally centered within a reasonable tolerance — proves the
      // dialog is genuinely centered in the real viewport, not merely
      // present somewhere in the DOM.
      expect(Math.abs(dialogCenterX - viewportCenterX)).toBeLessThan(viewport.width * 0.1);
    }
  });

  test("Open story: focusTrapDirective auto-focuses the close button on open, and a real Tab press wraps back to it via the sentinel spans", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-dialog--open"));
    const dialog = page.getByRole("dialog", { name: "Confirm" });
    await expect(dialog).toBeVisible();

    // focusTrapDirective's real mounted() hook (packages/vue-core/src/
    // focus-trap/focus-trap.ts's autoElementFocus) auto-focuses the first
    // focusable descendant since no [autofocus] element is present here —
    // the Open story's only focusable descendant is the header's close
    // button (closable defaults true). This is genuinely new real-browser
    // coverage: jsdom/@vue/test-utils's dialog.spec never asserts what
    // receives focus on open, only that focus RETURNS to the trigger on
    // close. A short wait accounts for focusTrapDirective's real
    // mounted-hook timing running after the enter-transition's own
    // onAfterEnter autofocus search (Dialog.vue's own fallback chain),
    // both of which target the same close button here.
    const closeButton = page.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeFocused();

    // focusTrapDirective wraps focus using two hidden-but-focusable
    // sentinel <span> elements rendered immediately before/after the
    // trapped content (role="presentation", aria-hidden, tabIndex=0) —
    // real, distinct mechanism from a keydown-handler-based trap, and one
    // jsdom's unsimulated Tab order cannot exercise at all. With only one
    // real focusable descendant (the close button), a real Tab press must
    // land on the trailing sentinel, whose real focus handler immediately
    // redirects focus back to the first focusable descendant — proving
    // the wrap-around actually completes end to end, not merely that the
    // sentinel elements exist in the DOM.
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();
  });

  test("Open story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-dialog--open"));
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Open story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-dialog--open"));
    await runAccessibilityScan(page, testInfo, "vue-dialog--open");
  });

  test("Non Closable story: computed accessible name, no close button, and visual regression", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-dialog--non-closable"));
    const dialog = page.getByRole("dialog", { name: "Non-closable" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toHaveCount(0);
    await expect(page).toHaveScreenshot();
  });

  test("Non Closable story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-dialog--non-closable"));
    await runAccessibilityScan(page, testInfo, "vue-dialog--non-closable");
  });
});
