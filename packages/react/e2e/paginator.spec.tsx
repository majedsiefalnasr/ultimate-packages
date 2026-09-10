import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UPaginator (React/Paginator), Task 7.
 *
 * Vitest/RTL already covers (packages/react/src/paginator/paginator.spec.tsx):
 * pageCount computation (including the rows=0 zero-guard), page-link
 * rendering matching the shared display algorithm, onPageChange wiring on
 * page-link click, controlled-only semantics (no internal state), first/
 * prev disabled on page 1 and next/last disabled on the last page, subpath
 * export. This file adds only genuinely new real-browser coverage: real
 * Tab-key focus order across the boundary/page-link buttons, and the
 * computed accessibility-tree name/state the browser itself reports for
 * the current-page control.
 */
test.describe("React/Paginator", () => {
  test("Default story: computed nav landmark, real Tab focus order skips disabled boundary controls, and aria-current on the active page", async ({
    page,
  }) => {
    await page.goto(storyUrl("react-paginator--default"));
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Real Tab-key traversal across first/prev/next/last and page-link
    // buttons — the Vitest suite only calls .click() and onPageChange()
    // programmatically, never drives a real Tab key across this control
    // set. On page 1 (first=0), first/prev are genuinely `disabled` (see
    // paginator.tsx), so a real browser's native Tab order skips them
    // entirely, landing directly on the first page-link button — provable
    // only via a real Tab key traversal, which jsdom does not simulate.
    const first = page.locator("[data-u-paginator-first]");
    await expect(first).toBeDisabled();
    const pageButtons = page.locator("[data-u-paginator-page]");
    await page.keyboard.press("Tab");
    await expect(pageButtons.first()).toBeFocused();
    await expect(pageButtons.first()).toHaveAttribute("aria-current", "page");
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-paginator--default"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-paginator--default"));
    await runAccessibilityScan(page, testInfo, "react-paginator--default");
  });

  test("Middle Page story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-paginator--middle-page"));
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Middle Page story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("react-paginator--middle-page"));
    await runAccessibilityScan(page, testInfo, "react-paginator--middle-page");
  });

  test("Empty story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("react-paginator--empty"));
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
    await page.goto(storyUrl("react-paginator--empty"));
    await runAccessibilityScan(page, testInfo, "react-paginator--empty");
  });
});
