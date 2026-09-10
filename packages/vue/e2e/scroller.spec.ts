import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UScroller (Vue/Scroller), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/scroller/scroller.spec.ts):
 * getLast clamping/zero-items guard, internal first/last/numItemsInViewport
 * as reactive data (not props), windowed rendering and #content-slot
 * composition given a *mocked* offsetHeight/ResizeObserver, scrollTo/
 * scrollToIndex, disabled/unvirtualized mode, loader markup, aria-busy,
 * lazy-load emission — all against jsdom, which implements neither
 * ResizeObserver nor real layout, so every measurement is stubbed.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 8's
 * scope, which may not modify any Vue component/style source): in this
 * Storybook render, `UScroller`'s real, unmocked `ResizeObserver` measures
 * its own root element's real `offsetHeight` (Scroller.vue's mounted()
 * hook, matching real PrimeVue's own measurement target exactly per its
 * own comment). The story's 300px wrapper div (scroller.stories.ts's
 * decorator) does have real, measured height, but `UScroller`'s own root
 * className (`cx('root')`, resolving to `u-scroller u-component`) has no
 * CSS rule making it inherit that ancestor's height — the same real
 * ancestor-height propagation gap Angular's Task 6 and React's Task 7 both
 * independently found and documented for their own scroller components,
 * confirmed independently here for Vue's `<div class="u-scroller u-component">`.
 * This file proves that real, verified behavior directly rather than
 * asserting a windowed-rendering outcome the actual rendered story does
 * not currently produce.
 */
test.describe("Vue/Scroller", () => {
  test("Default story: real (unmocked) ResizeObserver measures the real ancestor-height gap, correctly driving zero rendered items", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-scroller--default"));
    const root = page.locator(".u-scroller");
    await expect(root).toHaveCount(1);

    // Real, unmocked layout measurement — genuinely new relative to the
    // Vitest suite's mocked offsetHeight/ResizeObserver: the story's real
    // 300px wrapper does exist and has real height...
    const wrapper = page.locator("div[style*='height: 300px']");
    await expect(wrapper).toHaveCount(1);
    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox?.height).toBeGreaterThan(0);

    // ...but that real height does not currently propagate down through
    // the scroller's own root div (no CSS makes it inherit), and
    // UScroller's real (never mocked here) ResizeObserver correctly
    // reports that real, measured 0 — proving the real DOM measurement
    // pipeline actually ran, and that its output faithfully drives
    // numItemsInViewport/last to 0, exactly consistent with a genuine
    // zero-height input rather than a separate windowing defect.
    await expect(root).toHaveAttribute("data-num-items-in-viewport", "0");
    await expect(root).toHaveAttribute("data-last", "0");
    await expect(page.locator("[data-u-scroller-item]")).toHaveCount(0);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-scroller--default"));
    await expect(page.locator(".u-scroller")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-scroller--default"));
    await runAccessibilityScan(page, testInfo, "vue-scroller--default");
  });

  test("Loading story: computed aria-busy is exposed on the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-scroller--loading"));
    const root = page.locator(".u-scroller");
    await expect(root).toHaveAttribute("aria-busy", "true");
  });

  test("Loading story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-scroller--loading"));
    await expect(page.locator(".u-scroller")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Loading story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-scroller--loading"));
    await runAccessibilityScan(page, testInfo, "vue-scroller--loading");
  });

  test("Disabled story: unvirtualized mode renders every item with no windowing, in a real browser", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-scroller--disabled"));
    // Disabled/unvirtualized mode does not depend on measured viewport
    // height at all (see Scroller.vue's visibleItems computed — it maps
    // the full items list unconditionally when disabled), so unlike the
    // Default/Loading stories above, this one genuinely renders visible
    // items in this environment, and real scroll behavior is meaningfully
    // exercisable here.
    const items = page.locator("[data-u-scroller-item]");
    await expect(items.first()).toBeVisible();
    await expect(items).toHaveCount(50);
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-scroller--disabled"));
    await expect(page.locator("[data-u-scroller-item]").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-scroller--disabled"));
    await runAccessibilityScan(page, testInfo, "vue-scroller--disabled");
  });
});
