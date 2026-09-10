import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UTable (Ng/Table), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/table/table.spec.ts):
 * role=table/row/columnheader rendering, sorting (single/multi) and
 * aria-sort, filtering (contains/startsWith/equals/array-of-alternatives),
 * selection (selectionChange + aria-selected), ArrowDown keyboard row
 * navigation (via .focus() + dispatchEvent, not a real Tab), real
 * UPaginator/UScroller composition, row editing, row grouping, theme token
 * resolution. This file adds only genuinely new real-browser coverage: the
 * computed accessibility-tree table/row/columnheader roles as the browser
 * itself reports them, and real Tab-then-ArrowDown keyboard focus order
 * into and across data rows.
 */
test.describe("Ng/Table", () => {
  test("Default story: computed table/columnheader/row roles and real Tab-then-ArrowDown focus order", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-table--default"));
    // UTable's root <div role="table"> wraps a native <table> element,
    // which itself carries an implicit ARIA role of "table" -- two real,
    // distinct accessibility-tree nodes both matching `getByRole("table")`,
    // so `.first()` (the outer, semantic root) disambiguates deliberately
    // rather than accidentally matching either.
    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();
    const columnHeaders = page.getByRole("columnheader");
    await expect(columnHeaders).toHaveCount(2);

    // `role="row"` matches both the <thead> header row and each <tbody>
    // data row, so this is scoped to <tbody> data rows specifically —
    // matching the established tbody-scoping convention already used by
    // table.spec.ts's own Vitest tests for the same reason (the header row
    // is not part of the tabbable/ArrowDown-navigable row set).
    const rows = page.locator('tbody [role="row"]');
    // Real keyboard entry: the first data row must be reachable via a real
    // Tab press, then ArrowDown must move focus to the next row — the
    // Vitest suite seeds focus programmatically (rows[0].focus()) rather
    // than driving a real Tab key from page start, so this end-to-end
    // focus-order path is genuinely new.
    await page.keyboard.press("Tab");
    await expect(rows.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(1)).toBeFocused();
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-table--default"));
    await expect(page.getByRole("table").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-table--default"));
    await runAccessibilityScan(page, testInfo, "ng-table--default");
  });

  test("Sorted story: computed aria-sort is exposed on the real accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-table--sorted"));
    // The Sorted story sorts by the "name" field (not "id", the first
    // column) -- aria-sort is only set on the actively-sorted column's own
    // header, so it must be located by that column's own text, not by
    // positional .first().
    const header = page.getByRole("columnheader", { name: "Name" });
    await expect(header).toHaveAttribute("aria-sort", "descending");
  });

  test("Sorted story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-table--sorted"));
    await expect(page.getByRole("table").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Sorted story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-table--sorted"));
    await runAccessibilityScan(page, testInfo, "ng-table--sorted");
  });

  test("Paginated story: composed UPaginator's next control is real-keyboard-operable (Enter activation while focused)", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-table--paginated"));
    await expect(page.getByRole("navigation")).toBeVisible();
    // The next/prev/first/last icon buttons render with a zero-size
    // bounding box in this environment (no icon glyph content and no
    // fixed dimensions applied to the empty <button>), so a real mouse
    // click is not Playwright-actionable here (its click actionability
    // check requires a nonzero box) -- but the control remains genuinely
    // keyboard-focusable and keyboard-activatable regardless of its
    // visual size, which is the real, accessibility-relevant behavior
    // worth proving: real keyboard Enter-activation, not a mouse click,
    // advances the composed table's page. Genuinely new coverage: the
    // Vitest suite only calls nextButton.click() synthetically.
    const nextButton = page.locator("[data-u-paginator-next]");
    await nextButton.focus();
    await expect(nextButton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("cell", { name: "Row 10" })).toBeVisible();
  });

  test("Paginated story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-table--paginated"));
    await expect(page.getByRole("table").first()).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Paginated story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-table--paginated"));
    await runAccessibilityScan(page, testInfo, "ng-table--paginated");
  });
});
