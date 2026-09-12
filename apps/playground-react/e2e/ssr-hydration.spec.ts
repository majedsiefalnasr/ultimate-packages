import { expect, test } from "@playwright/test";

/**
 * Track E SSR/hydration verification for `apps/playground-react`'s proof
 * page (`apps/playground-react/src/App.tsx`), run against the
 * `react-ssr-chromium` project's real, built-then-served harness on
 * http://localhost:6012 (see root `playwright.config.ts`'s `react-ssr-server`
 * webServer entry).
 *
 * Each of the 8 `test.describe` blocks below follows the same pipeline,
 * mirroring `apps/playground-angular/e2e/ssr-hydration.spec.ts`'s structure
 * exactly:
 *   (a) a plain HTTP GET via `page.request.get()` against the harness's own
 *       root URL, asserting the component's expected static text is present
 *       in the raw response body — done BEFORE any `page.goto()` call in
 *       that test, so it genuinely exercises the server-rendered payload,
 *       not anything a client-side script could have since patched in;
 *   (b) `page.goto(HARNESS_URL)`, landing on the same root document;
 *   (c) a hydration-complete wait, polling for `data-hydrated="true"` on
 *       `#app-root` (set only from `App.tsx`'s post-mount `useEffect` with
 *       an empty dependency array — never runs during
 *       `renderToPipeableStream`'s server pass — see that file for the
 *       exact wiring, already committed and out of this task's scope);
 *   (d) `console`/`pageerror` listeners registered before `page.goto()`,
 *       asserting no unexpected message occurred, checked at the end of
 *       each test;
 *   (e) the component's own post-hydration interaction/assertion, per the
 *       plan's binding interaction table (identical across Tasks 5/6/7).
 *
 * Unlike Angular, React has no single well-known hydration-mismatch error
 * code (Angular's `NG0500`) to pattern-match for — React instead logs a
 * generic hydration-mismatch warning to the console when server/client
 * output diverges. Since this harness's fixture data is entirely static (no
 * `Math.random()`/`Date.now()`), no such warning is expected to occur at
 * all, so the general "no unexpected console error/pageerror" check below
 * (matching Task 5's own catch-all for anything other than `NG0500`) already
 * covers this case without a dedicated pattern.
 *
 * No `<style>` tag presence is asserted anywhere in this file (spec §D.3's
 * explicit non-assertion). No ID-normalization/workaround is applied
 * anywhere below — React's `useId()` migration (see `menu.tsx`/`dialog.tsx`/
 * `tooltip.tsx`) is already complete and correct, and none of these 8
 * components' assertions below depend on a specific generated ID value.
 *
 * One real, pre-existing (not introduced by this task, and out of this
 * task's 2-file scope to fix) rendering gap in `@ultimate/react`, discovered
 * while writing this file and reflected in how one assertion below is
 * written rather than worked around silently:
 *
 * 1. Paginator's "Next Page" button (`aria-label="Next Page"`, in
 *    `packages/react/src/paginator/paginator.tsx`) renders with a real,
 *    measured `0x0` bounding box in an actual browser: its CSS rule
 *    (`packages/uix-styles/src/paginator/index.ts`, the same shared style
 *    module Angular's Paginator also composes) sets
 *    `min-width: dt('paginator.nav.button.width')`, and that design-token
 *    custom property is unset in this harness's applied theme — identical
 *    root cause to the one Task 5's own Angular spec already documented for
 *    the same shared CSS module. Playwright's coordinate-based `.click()`
 *    therefore cannot reach it (a genuinely zero-size element is reported
 *    "outside the viewport"/"not visible" regardless of scrolling). The
 *    Next-Page test below dispatches a real native click via
 *    `locator.evaluate((el) => el.click())` instead — a real DOM click on
 *    the real button element, not a synthetic keyboard/JS-state workaround
 *    — which correctly exercises the same `onClick={() => changePage(...)}`
 *    handler a pointer click would, and correctly proves the post-hydration
 *    listener is wired (`Page 1` → `Page 2`).
 * 2. `UCheckbox`'s style module
 *    (`packages/react/src/checkbox/checkbox-style.ts`) is hand-rolled and
 *    never imports/composes the shared, real `@ultimate/uix-styles/checkbox`
 *    module that sets `.u-checkbox`/`.u-checkbox-box`'s
 *    `width`/`height: dt('checkbox.width'/'checkbox.height')` — unlike
 *    Scroller/Table/Paginator's own style modules, which do import their
 *    `uix-styles` counterparts (grepped and confirmed directly). Without
 *    those rules, `.u-checkbox` and its absolutely-positioned
 *    `.u-checkbox-input` child both measure a genuine `0x0` layout box in a
 *    real browser, so a coordinate-based `.click()` on the native input
 *    times out as "not visible" — the same class of pre-existing,
 *    design-token/CSS-composition gap as finding 1 above and as Task 5's
 *    own Angular Paginator/Tooltip findings, not introduced by this task and
 *    out of this task's 2-file scope to fix. The Checkbox test below
 *    dispatches a real native click via `locator.evaluate((el) =>
 *    el.click())` instead, exercising the same real `onChange` handler a
 *    pointer click would.
 */

/**
 * The `react-ssr-chromium` project's own harness root URL (port 6012, per
 * the `react-ssr-server` webServer entry in root `playwright.config.ts`).
 * Used as a literal absolute URL for both `page.request.get()` and
 * `page.goto()` below — this config declares no `baseURL` (matching this
 * repo's existing convention: Track A's own specs likewise build absolute
 * URLs rather than relying on a configured base), so `page.request` has no
 * base to resolve a relative path against.
 */
const HARNESS_URL = "http://localhost:6012/";

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
  expect(messages, `unexpected console/page errors: ${JSON.stringify(messages)}`).toEqual([]);
}

test.describe("React SSR/Hydration — Button", () => {
  test("serves SSR content and hydrates the click counter", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Proof Button");
    // React SSR splits a text node adjacent to an interpolated expression
    // with a `<!-- -->` comment marker (real `renderToPipeableStream`
    // output, not a bug — verified directly against this harness's raw
    // response body), so the literal contiguous substring "Clicks: 0" never
    // appears; assert the static/dynamic halves either side of the marker.
    expect(body).toContain("Clicks: <!-- -->0");

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="click-counter"]')).toHaveText("Clicks: 0");
    await page.getByRole("button", { name: "Proof Button" }).click();
    await expect(page.locator('[data-testid="click-counter"]')).toHaveText("Clicks: 1");

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Checkbox", () => {
  test("serves SSR content and hydrates the toggle", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('type="checkbox"');
    // See the Button test's comment above re: React SSR's `<!-- -->` text
    // marker between a static string and an adjacent interpolated
    // expression.
    expect(body).toContain("Checked: <!-- -->false");
    // Initial state is unchecked, so SSR HTML must not carry a `checked`
    // attribute on the native input at all.
    expect(body).not.toMatch(/<input[^>]*type="checkbox"[^>]*\bchecked\b/);

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();
    // See this file's header comment (finding 2): the native input has a
    // genuine 0x0 layout box in this harness (a pre-existing, hand-rolled
    // style-module gap), so a coordinate-based `.click()` cannot reach it.
    // `.evaluate((el) => el.click())` dispatches a real native click on the
    // real input element, exercising the same `onChange` handler a pointer
    // click would.
    await checkbox.evaluate((el: HTMLElement) => el.click());
    await expect(checkbox).toBeChecked();
    await expect(page.locator('[data-testid="checkbox-state"]')).toHaveText("Checked: true");

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Dialog", () => {
  test("serves SSR content with dialog closed, then opens/closes post-hydration", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Open Dialog");
    // Closed by default (Portal's server-null behavior, see this file's
    // header comment): neither the dialog's header text nor its body
    // content should appear anywhere in the raw SSR payload.
    expect(body).not.toContain("Proof Dialog Content");
    expect(body).not.toContain('role="dialog"');

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

test.describe("React SSR/Hydration — Menu", () => {
  test("serves SSR content in inline mode and hydrates item selection", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("First Item");
    expect(body).toContain("Second Item");
    expect(body).toContain("Third Item");
    // See the Button test's comment above re: React SSR's `<!-- -->` text
    // marker between a static string and an adjacent interpolated
    // expression.
    expect(body).toContain("Last selected: <!-- -->none");

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText("Last selected: none");
    await page.getByRole("menuitem", { name: "Second Item" }).click();
    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText("Last selected: Second Item");

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Paginator", () => {
  test("serves SSR content and hydrates page navigation", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    // See the Button test's comment re: React SSR's `<!-- -->` text marker
    // between a static string and an adjacent interpolated expression.
    expect(body).toContain("Page <!-- -->1");
    expect(body).toContain('aria-label="Next Page"');

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.locator('[data-testid="paginator-page"]')).toHaveText("Page 1");

    // See this file's header comment (finding 1): the real "Next Page"
    // button has a genuine 0x0 layout box in this harness (an unrelated,
    // pre-existing paginator design-token/CSS gap shared with Angular's own
    // documented finding), so a coordinate-based `.click()` cannot reach it.
    // `.evaluate((el) => el.click())` dispatches a real native click on the
    // real button element, exercising the same
    // `onClick={() => changePage(...)}` handler a pointer click would.
    const nextButton = page.getByRole("button", { name: "Next Page" });
    await expect(nextButton).toHaveCount(1);
    await nextButton.evaluate((el: HTMLElement) => el.click());

    await expect(page.locator('[data-testid="paginator-page"]')).toHaveText("Page 2");

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Scroller", () => {
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

    // The proof page's fixture sets `disabled` on <UScroller>, which makes
    // `visibleItems` return every item unwindowed (this is exactly why all 5
    // rows are present in the raw SSR HTML above, rather than a subset).
    // `disabled` does NOT gate the root element's `onScroll` listener or its
    // `overflow: auto` CSS, so a real overflow can genuinely exist if the
    // measured content is taller than the viewport — verified directly
    // below before trusting `scrollTop` as a real, provable scroll rather
    // than a no-op.
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

test.describe("React SSR/Hydration — Table", () => {
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
    // onSort round-trip through the proof page's own state actually
    // re-renders the row order.
    await page.getByRole("columnheader", { name: "Score" }).click();
    await expect(rowFirstCells).toHaveText(["Bravo", "Charlie", "Alpha"]);

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Tooltip", () => {
  test("serves SSR host content and hydrates hover-triggered tooltip DOM", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('data-testid="tooltip-host"');
    expect(body).toContain("Hover for tooltip");
    // Tooltip's own rendered container (`role="tooltip"`) is only ever
    // created client-side by Portal once `visible` flips true on hover
    // (see this file's header comment / portal.tsx) — absent from the raw
    // SSR payload entirely.
    expect(body).not.toContain('role="tooltip"');

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await page.locator('[data-testid="tooltip-host"]').hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toContainText("Proof Tooltip Content");

    assertNoHydrationErrors(errors);
  });
});

test.describe("React SSR/Hydration — Determinism", () => {
  test("serves byte-identical SSR output across two separate requests", async ({ page }) => {
    const responseA = await page.request.get(HARNESS_URL);
    const bodyA = await responseA.text();

    const responseB = await page.request.get(HARNESS_URL);
    const bodyB = await responseB.text();

    // Per spec §D.3: this harness's fixture data is fully static, so two
    // independent SSR renders of the same route must be byte-identical. No
    // exclusion/normalization logic — a difference here is a real
    // determinism violation to fix at the fixture-data source, not to
    // launder past this check.
    expect(bodyA).toBe(bodyB);
  });
});
