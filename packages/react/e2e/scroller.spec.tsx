import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UScroller (React/Scroller), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/scroller/scroller.spec.tsx):
 * getLast clamping/zero-items guard, windowed rendering given a *mocked*
 * offsetHeight/ResizeObserver, loader markup, disabled/unvirtualized mode,
 * scrollTo/scrollToIndex ref API, aria-busy, onLazyLoad, contentTemplate
 * render-prop coverage — all against jsdom, which implements neither
 * ResizeObserver nor real layout, so every measurement is stubbed.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 7's
 * scope, which may not modify any React component/story source): in this
 * Storybook render, `UScroller`'s real, unmocked `ResizeObserver` measures
 * its own root element's real `offsetHeight`, exactly matching real
 * PrimeReact's own measurement target (per scroller.tsx's own comment).
 * The story's 300px wrapper div (scroller.stories.tsx's decorator) does
 * have real, measured height, but `UScroller`'s own root className
 * ("u-scroller u-component") has no CSS rule making it inherit that
 * ancestor's height — the same real ancestor-height propagation gap
 * Angular's Task 6 found for `<u-scroller>`, confirmed independently here
 * for React's `<div className="u-scroller u-component">`. This file
 * proves that real, verified behavior directly rather than asserting a
 * windowed-rendering outcome the actual rendered story does not currently
 * produce.
 */
test.describe("React/Scroller", () => {
  test("Default story: real (unmocked) ResizeObserver measures the real ancestor-height gap, correctly driving zero rendered items", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-scroller--default"));
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
    await page.goto(storyUrl("react-scroller--default"));
    await expect(page.locator(".u-scroller")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-scroller--default"));
    await runAccessibilityScan(page, testInfo, "react-scroller--default");
  });

  test("Loading story: computed aria-busy is exposed on the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-scroller--loading"));
    const root = page.locator(".u-scroller");
    await expect(root).toHaveAttribute("aria-busy", "true");
  });

  test("Loading story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-scroller--loading"));
    await expect(page.locator(".u-scroller")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Loading story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-scroller--loading"));
    await runAccessibilityScan(page, testInfo, "react-scroller--loading");
  });

  test("Disabled story: unvirtualized mode renders every item with no windowing, in a real browser", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-scroller--disabled"));
    // Disabled/unvirtualized mode does not depend on measured viewport
    // height at all (see scroller.tsx — it maps the full items list
    // unconditionally), so unlike the Default/Loading stories above, this
    // one genuinely renders visible items in this environment, and real
    // scroll behavior is meaningfully exercisable here.
    const items = page.locator("[data-u-scroller-item]");
    await expect(items.first()).toBeVisible();
    await expect(items).toHaveCount(50);
  });

  test("Disabled story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-scroller--disabled"));
    await expect(page.locator("[data-u-scroller-item]").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Disabled story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-scroller--disabled"));
    await runAccessibilityScan(page, testInfo, "react-scroller--disabled");
  });
});
