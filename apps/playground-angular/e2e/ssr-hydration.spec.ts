import { expect, test } from "@playwright/test";

/**
 * Track E SSR/hydration verification for `apps/playground-angular`'s proof
 * page (`apps/playground-angular/src/app/proof-page.component.ts`), run
 * against the `ng-ssr-chromium` project's real, built-then-served harness
 * on http://localhost:6011 (see root `playwright.config.ts`'s `ng-ssr-server`
 * webServer entry).
 *
 * Each of the 8 `test.describe` blocks below follows the same pipeline:
 *   (a) a plain HTTP GET via `page.request.get()` against the harness's own
 *       root URL, asserting the component's expected static text is present
 *       in the raw response body — done BEFORE any `page.goto()` call in
 *       that test, so it genuinely exercises the server-rendered payload,
 *       not anything a client-side script could have since patched in;
 *   (b) `page.goto(HARNESS_URL)`, landing on the same root document;
 *   (c) a hydration-complete wait, polling for `data-hydrated="true"` on
 *       `<html>` (set only from `main.ts`'s post-bootstrap `.then()`
 *       callback — see that file for the exact wiring, already committed
 *       and out of this task's scope);
 *   (d) `console`/`pageerror` listeners registered before `page.goto()`,
 *       asserting no message matches Angular's `NG0500` (hydration
 *       mismatch) pattern or any other unexpected error, checked at the end
 *       of each test;
 *   (e) the component's own post-hydration interaction/assertion, per the
 *       plan's binding interaction table (identical across Tasks 5/6/7).
 *
 * No `<style>` tag presence is asserted anywhere in this file (spec §D.3's
 * explicit non-assertion). No ID-normalization/workaround for
 * `ComponentIdGenerator`-produced IDs is applied anywhere below — none of
 * these 8 components' assertions depend on a specific generated ID value.
 *
 * Two real, pre-existing (not introduced by this task, and out of this
 * task's 2-file scope to fix) rendering gaps in `@ultimate/ng`, discovered
 * while writing this file and reflected in how two of the assertions below
 * are written rather than worked around silently:
 *
 * 1. Paginator nav buttons (`aria-label="Next Page"` etc.) render with a
 *    real, measured `0x0` bounding box in an actual browser: their CSS rule
 *    (`packages/uix-styles/src/paginator/index.ts`) sets
 *    `min-width: dt('paginator.nav.button.width')`, and that design-token
 *    custom property is unset in this harness's applied theme (confirmed:
 *    `getComputedStyle(document.documentElement).getPropertyValue(
 *    '--p-paginator-nav-button-width')` returns `""`), so `min-width`
 *    resolves to `auto` and the button — which renders no text/icon content
 *    — collapses to zero size. Playwright's coordinate-based `.click()`
 *    therefore cannot reach it (genuinely zero-size elements are reported
 *    "outside the viewport"/"not visible" regardless of scrolling). The
 *    Next-Page test below dispatches a real native click via
 *    `locator.evaluate((el) => el.click())` instead — a real DOM click on
 *    the real button element, not a synthetic keyboard/JS-state workaround
 *    — which correctly exercises the same `(click)="goNext()"` handler a
 *    pointer click would, and correctly proves the post-hydration listener
 *    is wired (`Page 1` → `Page 2`).
 * 2. `UTooltip`'s container class (`.u-tooltip`, in
 *    `packages/uix-styles/src/tooltip/index.ts`) is unconditionally
 *    `display: none`; the directive
 *    (`packages/ng/src/tooltip/tooltip.ts`) never adds any "active"/
 *    "visible" class to override it, so the tooltip element is never
 *    actually CSS-visible in a real browser regardless of hover/focus
 *    state — confirmed directly. This is a pre-existing, already-known gap
 *    in this repo (Track A's own
 *    `packages/vue/e2e/tooltip.spec.ts` independently documents the
 *    identical behavior for Vue's tooltip: "though it is never actually
 *    displayed"), consistent with `UTooltip`'s own unit spec
 *    (`packages/ng/src/tooltip/tooltip.spec.ts`), which likewise only
 *    asserts DOM presence, never CSS visibility. The plan's own binding
 *    table defines this row's post-hydration assertion as "a specific,
 *    literal tooltip text string appears in the DOM" — which is exactly
 *    what the Tooltip test below asserts (DOM/text appearance via a
 *    locator count transition, not `toBeVisible()`), matching both the
 *    binding table's literal wording and this repo's established
 *    tooltip-testing convention.
 */

/**
 * The `ng-ssr-chromium` project's own harness root URL (port 6011, per the
 * `ng-ssr-server` webServer entry in root `playwright.config.ts`). Used as a
 * literal absolute URL for both `page.request.get()` and `page.goto()`
 * below — this config declares no `baseURL` (matching this repo's existing
 * convention: Track A's own specs likewise build absolute URLs rather than
 * relying on a configured base), so `page.request` has no base to resolve a
 * relative path against.
 */
const HARNESS_URL = "http://localhost:6011/";

const NG_HYDRATION_ERROR_PATTERN = /NG0500/;

/** Registers console/pageerror listeners and returns the captured list, to be asserted after the test's interactions. */
function captureUnexpectedErrors(page: import("@playwright/test").Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      messages.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    messages.push(String(err));
  });
  return messages;
}

function assertNoHydrationErrors(messages: string[]): void {
  for (const message of messages) {
    expect(message, `unexpected console/page error: ${message}`).not.toMatch(NG_HYDRATION_ERROR_PATTERN);
  }
  expect(messages, `unexpected console/page errors: ${JSON.stringify(messages)}`).toEqual([]);
}

test.describe("Ng SSR/Hydration — Button", () => {
  test("serves SSR content and hydrates the click counter", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Proof Button");
    expect(body).toContain("Clicks: 0");

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="click-counter"]')).toHaveText("Clicks: 0");
    await page.getByRole("button", { name: "Proof Button" }).click();
    await expect(page.locator('[data-testid="click-counter"]')).toHaveText("Clicks: 1");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Checkbox", () => {
  test("serves SSR content and hydrates the toggle", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('<input type="checkbox"');
    expect(body).toContain("Proof Checkbox");
    expect(body).toContain("Checked: false");
    // Initial state is unchecked, so SSR HTML must not carry a `checked`
    // attribute on the native input at all.
    expect(body).not.toMatch(/<input type="checkbox"[^>]*\bchecked\b/);

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(page.locator('[data-testid="checkbox-state"]')).toHaveText("Checked: true");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Dialog", () => {
  test("serves SSR content with dialog closed, then opens/closes post-hydration", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Open Dialog");
    // Closed by default: neither the dialog's header text nor its body
    // content should appear anywhere in the raw SSR payload.
    expect(body).not.toContain("Proof Dialog Content");
    expect(body).not.toMatch(/role="dialog"[^>]*>(?!<!--)/);

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Open Dialog" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Proof Dialog Content")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Menu", () => {
  test("serves SSR content in inline mode and hydrates item selection", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("First Item");
    expect(body).toContain("Second Item");
    expect(body).toContain("Third Item");
    expect(body).toContain("Last selected: none");

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText("Last selected: none");
    await page.getByRole("menuitem", { name: "Second Item" }).click();
    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText("Last selected: Second Item");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Paginator", () => {
  test("serves SSR content and hydrates page navigation", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Page 1");
    expect(body).toContain('aria-label="Next Page"');

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="paginator-page"]')).toHaveText("Page 1");

    // See this file's header comment (finding 1): the real "Next Page"
    // button has a genuine 0x0 layout box in this harness (an unrelated,
    // pre-existing paginator design-token/CSS gap), so a coordinate-based
    // `.click()` cannot reach it. `.evaluate((el) => el.click())` dispatches
    // a real native click on the real button element, exercising the same
    // `(click)="goNext()"` handler a pointer click would.
    const nextButton = page.getByRole("button", { name: "Next Page" });
    await expect(nextButton).toHaveCount(1);
    await nextButton.evaluate((el: HTMLElement) => el.click());

    await expect(page.locator('[data-testid="paginator-page"]')).toHaveText("Page 2");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Scroller", () => {
  test("serves all 5 fixture rows in SSR content and remains stable post-hydration", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    for (let i = 1; i <= 5; i++) {
      expect(body).toContain(`Row ${i}`);
    }

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    const scroller = page.locator(".u-scroller");
    await expect(scroller).toHaveCount(1);
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(".u-scroller-item", { hasText: `Row ${i}` })).toHaveCount(1);
    }

    // FINDING (this file's own investigation): the proof page's fixture
    // sets `[disabled]="true"` on <u-scroller>, which makes `visibleItems()`
    // return every item unwindowed (this is exactly why all 5 rows are
    // present in the raw SSR HTML above, rather than a subset — matching
    // this repo's own established precedent for this component, see
    // packages/ng/e2e/scroller.spec.ts's documented real-ResizeObserver
    // finding). `disabled` does NOT gate the root element's `(scroll)`
    // listener or its `overflow: auto` CSS, and this harness's real,
    // measured layout gives the root a `clientHeight` of 0 against the
    // content's real 200px `scrollHeight` (confirmed directly) — i.e. real
    // overflow genuinely exists, so setting `scrollTop` is a real, provable
    // scroll rather than a no-op. The assertion below is therefore the
    // primary one from the plan's own binding table (a real scrollTop
    // offset change), not its "disabled" contingency fallback.
    const scrollMetrics = await scroller.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);

    await scroller.evaluate((el) => {
      el.scrollTop = 100;
    });
    const scrollTopAfter = await scroller.evaluate((el) => el.scrollTop);
    expect(scrollTopAfter).toBe(100);
    await expect(scroller).toHaveCount(1);
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(".u-scroller-item", { hasText: `Row ${i}` })).toHaveCount(1);
    }

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Table", () => {
  test("serves SSR content and hydrates column sorting", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Alpha");
    expect(body).toContain("30");
    expect(body).toContain("Bravo");
    expect(body).toContain("10");
    expect(body).toContain("Charlie");
    expect(body).toContain("20");
    expect(body).toContain(">Name<");
    expect(body).toContain(">Score<");

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    const rowFirstCells = page.locator(".u-table-tbody tr td:first-child");
    await expect(rowFirstCells).toHaveText(["Alpha", "Bravo", "Charlie"]);

    // Sorting by Score (30/10/20 — not already ascending, unlike Name,
    // which is already alphabetically ascending and would make a
    // Name-column sort assertion vacuous) proves the click handler and
    // sortFieldChange/sortOrderChange round-trip through the proof page's
    // own signals actually re-render the row order.
    await page.getByRole("columnheader", { name: "Score" }).click();
    await expect(rowFirstCells).toHaveText(["Bravo", "Charlie", "Alpha"]);

    assertNoHydrationErrors(errors);
  });
});

test.describe("Ng SSR/Hydration — Tooltip", () => {
  test("serves SSR host content and hydrates hover-triggered tooltip DOM", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('data-testid="tooltip-host"');
    expect(body).toContain("Hover for tooltip");
    // "Proof Tooltip Content" is also this fixture's `uTooltip` input value,
    // so it legitimately appears once already, as the literal
    // `utooltip="Proof Tooltip Content"` host attribute (SSR faithfully
    // renders every static input binding) — the real SSR-null-behavior
    // assertion is the ABSENCE of the tooltip's own rendered container
    // (`role="tooltip"`, only ever created client-side by `UTooltip.show()`
    // on hover/focus), not the absence of that shared literal substring.
    expect(body).not.toContain('role="tooltip"');

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    // See this file's header comment (finding 2): the tooltip container is
    // unconditionally `display: none` in this harness's applied CSS (a
    // pre-existing, already-known gap — matches Track A's own Vue tooltip
    // e2e finding and this component's own unit spec, both of which assert
    // DOM presence only). The plan's binding table itself defines this
    // row's assertion as DOM/text appearance, which is what is asserted
    // here — not CSS visibility.
    await expect(page.getByText("Proof Tooltip Content")).toHaveCount(0);
    await page.locator('[data-testid="tooltip-host"]').hover();
    await expect(page.getByText("Proof Tooltip Content")).toHaveCount(1);

    assertNoHydrationErrors(errors);
  });
});
