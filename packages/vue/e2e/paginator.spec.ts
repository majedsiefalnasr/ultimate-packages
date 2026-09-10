import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UPaginator (Vue/Paginator), Task 8.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/paginator/paginator.spec.ts):
 * pageCount computation exposed via data-page-count, internal d_first/
 * d_rows initialization from props, watcher-sync on prop changes, page-link
 * rendering matching the shared display algorithm, page + update:first +
 * update:rows emission on page-link click, internal d_first advancing even
 * without a v-model consumer (Vue's own internal-state model, unlike
 * React's controlled-only UPaginator), v-model:first round-tripping, and
 * the aria-live=polite current-page report region. This file adds only
 * genuinely new real-browser coverage: real Tab-key focus order across the
 * boundary/page-link buttons, and the computed accessibility-tree name/
 * state the browser itself reports for the current-page control.
 *
 * REAL-BROWSER FINDING (documented here, not fixed — out of Task 8's
 * scope, which may not modify any Vue component/style source): the
 * first/prev/next/last boundary `<button>` elements (Paginator.vue) render
 * with no icon glyph content and no fixed dimensions, so they genuinely
 * measure a zero-size bounding box in this environment — a real mouse
 * click is not Playwright-actionable here (its click actionability check
 * requires a nonzero box), matching the identical real, verified gap
 * React's Task 7 already documented for its own icon-less UPaginator
 * boundary buttons. The controls remain genuinely keyboard-focusable and
 * keyboard-activatable regardless of visual size, so the test below drives
 * a real `.focus()` + keyboard Enter rather than a mouse click.
 */
test.describe("Vue/Paginator", () => {
  test("Default story: computed nav landmark, real Tab focus order skips disabled boundary controls, and aria-current on the active page", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-paginator--default"));
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Real Tab-key traversal across first/prev/next/last and page-link
    // buttons — the Vitest suite only calls .trigger("click") and reads
    // emitted events programmatically, never drives a real Tab key across
    // this control set. On page 1 (first=0), first/prev are genuinely
    // `disabled` (see Paginator.vue's :disabled="isFirstPage" bindings),
    // so a real browser's native Tab order skips them entirely, landing
    // directly on the first page-link button — provable only via a real
    // Tab key traversal, which jsdom does not simulate.
    const first = page.locator("[data-u-paginator-first]");
    await expect(first).toBeDisabled();
    const pageButtons = page.locator("[data-u-paginator-page]");
    await page.keyboard.press("Tab");
    await expect(pageButtons.first()).toBeFocused();
    await expect(pageButtons.first()).toHaveAttribute("aria-current", "page");
  });

  test("Default story: real keyboard Enter-activation of the next control advances the page, exposed via the aria-live current-page report", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-paginator--default"));
    // Unlike React's controlled-only UPaginator (Task 7), Vue's UPaginator
    // advances its own internal d_first/d_rows on click even without a
    // v-model:first consumer (paginator.spec.ts's own "advances d_first
    // internally" test) — the Default story renders correctly interactive
    // with plain args, no external harness required. Real, verified gap
    // (documented above): the next button measures a zero-size bounding
    // box, so a real mouse click is not Playwright-actionable — this test
    // instead focuses it directly and drives a real keyboard Enter, which
    // reaches the same real onClick handler regardless of visual size.
    // Genuinely new coverage: the Vitest suite only reads the internal
    // d_first data property after a synthetic click, never asserts the
    // rendered aria-live text updates in a real browser via a real
    // keyboard activation.
    const report = page.locator("[data-u-paginator-current-report]");
    await expect(report).toHaveText("1 of 10");
    const nextButton = page.locator("[data-u-paginator-next]");
    await nextButton.focus();
    await expect(nextButton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(report).toHaveText("2 of 10");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-paginator--default"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-paginator--default"));
    await runAccessibilityScan(page, testInfo, "vue-paginator--default");
  });

  test("Middle Page story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-paginator--middle-page"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Middle Page story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-paginator--middle-page"));
    await runAccessibilityScan(page, testInfo, "vue-paginator--middle-page");
  });

  test("Empty story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-paginator--empty"));
    // With totalRecords=0, no page-link buttons render and every boundary
    // control is disabled — present in the DOM as a real <nav>, asserting
    // DOM attachment (toHaveCount) since the collapsed content may not
    // report a meaningfully nonzero visible box in every browser engine.
    await expect(page.getByRole("navigation")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Empty story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-paginator--empty"));
    await runAccessibilityScan(page, testInfo, "vue-paginator--empty");
  });
});
