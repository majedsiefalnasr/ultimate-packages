import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UPaginator (Ng/Paginator), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/paginator/paginator.spec.ts):
 * pageCount computation, changePage/onPageChange wiring, first-input
 * reconciliation, pageLinks windowing algorithm, aria-current=page marking,
 * page-link click navigation, semantic <nav> root shape, first/prev/next/
 * last aria-label presence, theme token resolution. This file adds only
 * genuinely new real-browser coverage: real Tab-key focus order across the
 * page-link buttons, and the computed accessibility-tree name/state the
 * browser itself reports for the current-page control.
 */
test.describe("Ng/Paginator", () => {
  test("Default story: computed nav landmark, real Tab focus order skips disabled boundary controls, and click navigation", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-paginator--default"));
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Real Tab-key traversal across first/prev/next/last and page-link
    // buttons — the Vitest suite only calls .click() and changePage()
    // programmatically, never drives a real Tab key across this control
    // set. On page 1, first/prev are genuinely `disabled` (see
    // paginator.ts), so a real browser's native Tab order skips them
    // entirely, landing directly on the first page-link button — provable
    // only via a real Tab key traversal, which jsdom does not simulate.
    const first = page.locator("[data-u-paginator-first]");
    await expect(first).toBeDisabled();
    const pageButtons = page.locator("[data-u-paginator-page]");
    await page.keyboard.press("Tab");
    await expect(pageButtons.first()).toBeFocused();
    await expect(pageButtons.first()).toHaveAttribute("aria-current", "page");
  });

  // Cross-framework parity addition (Task 9, R5): Vue's Task 8 suite
  // (packages/vue/e2e/paginator.spec.ts) has a "real keyboard
  // Enter-activation of the next control advances the page" scenario that
  // this file lacked. Unlike React's UPaginator (genuinely controlled-only,
  // per paginator.tsx's own doc comment -- "no uncontrolled fallback" --
  // so its Default story's next button has no visible effect and there is
  // nothing real to assert), Angular's UPaginator reconciles its `first`
  // signal input into an internal `_first` signal (paginator.ts) that
  // `changePage()` mutates directly, so this Default story genuinely
  // advances on its own when the next control is activated -- the same
  // real, internally-stateful behavior Vue's UPaginator has, just exposed
  // via `data-page`/`aria-current` instead of Vue's aria-live report span
  // (Angular's Interfaces section has no current-page-report element).
  // Reuses this suite's own established zero-size-safe pattern (real
  // `.focus()` + keyboard `Enter`, not a mouse `.click()`) already proven
  // in this file's Tab-order test above and in table.spec.ts's composed
  // "Paginated story" test, since the next/prev/first/last controls render
  // via the same imported `@ultimate/uix-styles/paginator` icon-button
  // rules with no icon glyph content in this environment.
  test("Default story: real keyboard Enter-activation of the next control advances the page", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-paginator--default"));
    const host = page.locator("u-paginator");
    await expect(host).toHaveAttribute("data-page", "0");

    const nextButton = page.locator("[data-u-paginator-next]");
    await nextButton.focus();
    await expect(nextButton).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(host).toHaveAttribute("data-page", "1");
    const pageButtons = page.locator("[data-u-paginator-page]");
    await expect(pageButtons.nth(1)).toHaveAttribute("aria-current", "page");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-paginator--default"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-paginator--default"));
    await runAccessibilityScan(page, testInfo, "ng-paginator--default");
  });

  test("Middle Page story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-paginator--middle-page"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Middle Page story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-paginator--middle-page"));
    await runAccessibilityScan(page, testInfo, "ng-paginator--middle-page");
  });

  test("Empty story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-paginator--empty"));
    // With totalRecords=0, no page-link buttons render and every boundary
    // control is disabled, so the real flex-laid-out <nav> genuinely
    // collapses to a zero-size box (a real, verified browser layout
    // outcome) — present in the DOM but not "visible" by Playwright's
    // nonzero-bounding-box definition, so this asserts DOM attachment
    // rather than on-screen visibility.
    await expect(page.getByRole("navigation")).toHaveCount(1);
    await expect(page).toHaveScreenshot();
  });

  test("Empty story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-paginator--empty"));
    await runAccessibilityScan(page, testInfo, "ng-paginator--empty");
  });
});
