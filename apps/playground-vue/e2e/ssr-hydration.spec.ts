import { expect, test } from "@playwright/test";

/**
 * Track E SSR/hydration verification for `apps/playground-vue`'s proof page
 * (`apps/playground-vue/src/App.vue`), run against the `vue-ssr-chromium`
 * project's real, built-then-served harness on http://localhost:6013 (see
 * root `playwright.config.ts`'s `vue-ssr-server` webServer entry).
 *
 * Each of the 8 `test.describe` blocks below follows the same pipeline,
 * mirroring `apps/playground-angular/e2e/ssr-hydration.spec.ts`'s and
 * `apps/playground-react/e2e/ssr-hydration.spec.ts`'s structure exactly:
 *   (a) a plain HTTP GET via `page.request.get()` against the harness's own
 *       root URL, asserting the component's expected static text is present
 *       in the raw response body — done BEFORE any `page.goto()` call in
 *       that test, so it genuinely exercises the server-rendered payload,
 *       not anything a client-side script could have since patched in;
 *   (b) `page.goto(HARNESS_URL)`, landing on the same root document;
 *   (c) a hydration-complete wait, polling for `data-hydrated="true"` on
 *       `#app-root` (set only from `App.vue`'s post-mount `onMounted()` —
 *       Vue's own docs confirm this never runs during `renderToString`'s
 *       server pass — see that file for the exact wiring, already committed
 *       and out of this task's scope);
 *   (d) `console`/`pageerror` listeners registered before `page.goto()`,
 *       asserting no unexpected message occurred, checked at the end of
 *       each test;
 *   (e) the component's own post-hydration interaction/assertion, per the
 *       plan's binding interaction table (identical across Tasks 5/6/7).
 *
 * Vue has its own well-known, named hydration-mismatch warning pattern —
 * `@vue/runtime-core`'s hydration codepath logs per-node mismatches via its
 * `warn()` helper (`[Vue warn]: Hydration text/children mismatch...`, on
 * `console.warn`) and a summary via a plain `console.error("Hydration
 * completed but contains mismatches.")` (both confirmed directly against
 * `@vue/runtime-core`'s own source) — this is Vue's actual equivalent to
 * Angular's `NG0500` (unlike React, which has no single named error string).
 * Since this harness's fixture data is entirely static (no
 * `Math.random()`/`Date.now()`), no such warning is expected to occur at
 * all, so `assertNoHydrationErrors` below pattern-matches for both message
 * shapes specifically, in addition to the general "no unexpected console
 * error" catch-all.
 *
 * Checked directly against this harness's actual raw SSR response body
 * (`curl http://localhost:6013/` post-build) before writing any assertion
 * below: unlike Angular's placeholder-comment quirk and React's `<!-- -->`
 * text-splitting quirk, Vue's `renderToString` emits `{{ }}` interpolations
 * as plain, contiguous text nodes with no splitting marker (e.g. literally
 * `Clicks: 0`, `Checked: false`, `Last selected: none`, `Page 1`) — so no
 * equivalent workaround is needed here; the raw-HTML assertions below use
 * plain contiguous substrings exactly as they appear in that captured
 * output.
 *
 * No `<style>` tag presence is asserted anywhere in this file (spec §D.3's
 * explicit non-assertion). No ID-normalization/workaround is applied
 * anywhere below — Vue's `useId()` migration for Menu/Dialog (see commits
 * `496e509`/`d6f6fb2`) is already complete and correct, and none of these 8
 * components' assertions below depend on a specific generated ID value.
 *
 * Three real, pre-existing (not introduced by this task, and out of this
 * task's 2-file scope to fix) rendering/testing gaps in `@ultimate/vue` (or,
 * for finding 3, in how Chromium's accessibility tree treats this element
 * shape), discovered while writing this file and reflected in how three of
 * the assertions below are written rather than worked around silently —
 * findings 1 and 2 are the same root cause already independently documented
 * for Angular (Task 5) and, for Checkbox, React (Task 6) against the exact
 * same shared `uix-styles` modules:
 *
 * 1. Paginator's "Next Page" button (`aria-label="Next Page"`, in
 *    `packages/vue/src/paginator/paginator-style.ts`, composing the same
 *    shared `@ultimate/uix-styles/paginator` CSS module Angular's and
 *    React's Paginator also compose) sets `min-width:
 *    dt('paginator.nav.button.width')`, and that design-token custom
 *    property is unset in this harness's applied theme — identical root
 *    cause to Task 5's own Angular finding for the same shared CSS module.
 *    Playwright's coordinate-based `.click()` therefore cannot reach it (a
 *    genuinely zero-size element is reported "outside the
 *    viewport"/"not visible" regardless of scrolling). The Next-Page test
 *    below dispatches a real native click via `locator.evaluate((el) =>
 *    el.click())` instead — a real DOM click on the real button element, not
 *    a synthetic keyboard/JS-state workaround — which correctly exercises
 *    the same `@page="onPaginatorPage"`-wired handler a pointer click would,
 *    and correctly proves the post-hydration listener is wired (`Page 1` →
 *    `Page 2`).
 * 2. `UCheckbox`'s style module (`packages/vue/src/checkbox/checkbox-style.ts`)
 *    does correctly import/compose the shared, real
 *    `@ultimate/uix-styles/checkbox` module (unlike React's own hand-rolled
 *    gap for this same component), whose `.u-checkbox` rule sets `width`/
 *    `height: dt('checkbox.width'/'checkbox.height')` — but that design-token
 *    custom property is likewise unset in this harness's applied theme
 *    (confirmed directly against the captured raw SSR HTML's inline `style`
 *    attribute and this harness's applied CSS), so `.u-checkbox` and its
 *    absolutely-positioned `.u-checkbox-input` child both measure a genuine
 *    `0x0` layout box in a real browser, and a coordinate-based `.click()`
 *    on the native input times out as "not visible" — the same class of
 *    pre-existing, design-token/CSS-composition gap as finding 1 above and
 *    as Tasks 5/6's own Paginator/Checkbox findings, not introduced by this
 *    task and out of this task's 2-file scope to fix. The Checkbox test
 *    below dispatches a real native click via `locator.evaluate((el) =>
 *    el.click())` instead, exercising the same real `v-model`-wired
 *    `change` handler a pointer click would.
 * 3. Tooltip's directive-created panel (`<div role="tooltip">`, appended to
 *    `document.body` by `showTooltip()` in
 *    `packages/vue/src/tooltip/tooltip.ts`) is genuinely absent from
 *    Chromium's accessibility tree once rendered (confirmed directly via
 *    `page.locator("body").ariaSnapshot()` — the node does not appear at
 *    all, not even as generic/hidden), so `page.getByRole("tooltip")` never
 *    matches it despite the element unquestionably existing in the DOM with
 *    the correct `role` attribute and text (confirmed via
 *    `element.outerHTML` and a plain `[role="tooltip"]` CSS attribute
 *    selector, both of which do find it). The Tooltip test below therefore
 *    asserts DOM/text presence via a `[role="tooltip"]` CSS locator rather
 *    than `page.getByRole()` — matching both Angular's own established
 *    convention for this exact component and the plan's own binding table
 *    wording for this row ("a specific, literal tooltip text string appears
 *    in the DOM").
 */

/**
 * The `vue-ssr-chromium` project's own harness root URL (port 6013, per the
 * `vue-ssr-server` webServer entry in root `playwright.config.ts`). Used as a
 * literal absolute URL for both `page.request.get()` and `page.goto()`
 * below — this config declares no `baseURL` (matching this repo's existing
 * convention: Track A's own specs likewise build absolute URLs rather than
 * relying on a configured base), so `page.request` has no base to resolve a
 * relative path against.
 */
const HARNESS_URL = "http://localhost:6013/";

const VUE_HYDRATION_WARNING_PATTERN =
  /(\[Vue warn\]:\s*Hydration|Hydration completed but contains mismatches)/;

/** Registers console/pageerror listeners and returns the captured list, to be asserted after the test's interactions. */
function captureUnexpectedErrors(page: import("@playwright/test").Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
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
    expect(message, `unexpected Vue hydration-mismatch warning: ${message}`).not.toMatch(
      VUE_HYDRATION_WARNING_PATTERN
    );
  }
  expect(messages, `unexpected console/page errors: ${JSON.stringify(messages)}`).toEqual([]);
}

test.describe("Vue SSR/Hydration — Button", () => {
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

test.describe("Vue SSR/Hydration — Checkbox", () => {
  test("serves SSR content and hydrates the toggle", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('type="checkbox"');
    expect(body).toContain("Checked: false");
    // Initial state is unchecked, so SSR HTML must not carry a `checked`
    // attribute on the native input at all.
    expect(body).not.toMatch(/<input[^>]*type="checkbox"[^>]*\bchecked\b/);

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();
    // See this file's header comment (finding 2): the native input has a
    // genuine 0x0 layout box in this harness (a pre-existing design-token
    // gap shared with Angular's own documented finding for the same
    // uix-styles module), so a coordinate-based `.click()` cannot reach it.
    // `.evaluate((el) => el.click())` dispatches a real native click on the
    // real input element, exercising the same `v-model`-wired `change`
    // handler a pointer click would.
    await checkbox.evaluate((el: HTMLElement) => el.click());
    await expect(checkbox).toBeChecked();
    await expect(page.locator('[data-testid="checkbox-state"]')).toHaveText("Checked: true");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Vue SSR/Hydration — Dialog", () => {
  test("serves SSR content with dialog closed, then opens/closes post-hydration", async ({
    page,
  }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain("Open Dialog");
    // Closed by default (v-if false renders as a plain HTML comment):
    // neither the dialog's header text nor its body content, nor a
    // role="dialog" element, should appear anywhere in the raw SSR payload.
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

test.describe("Vue SSR/Hydration — Menu", () => {
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

    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText(
      "Last selected: none"
    );
    await page.getByRole("menuitem", { name: "Second Item" }).click();
    await expect(page.locator('[data-testid="menu-last-selected"]')).toHaveText(
      "Last selected: Second Item"
    );

    assertNoHydrationErrors(errors);
  });
});

test.describe("Vue SSR/Hydration — Paginator", () => {
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
    // pre-existing paginator design-token/CSS gap shared with Angular's and
    // React's own documented findings), so a coordinate-based `.click()`
    // cannot reach it. `.evaluate((el) => el.click())` dispatches a real
    // native click on the real button element, exercising the same
    // `@page="onPaginatorPage"`-wired handler a pointer click would.
    const nextButton = page.getByRole("button", { name: "Next Page" });
    await expect(nextButton).toHaveCount(1);
    await nextButton.evaluate((el: HTMLElement) => el.click());

    await expect(page.locator('[data-testid="paginator-page"]')).toHaveText("Page 2");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Vue SSR/Hydration — Scroller", () => {
  test("serves all 5 fixture rows in SSR content and remains stable post-hydration", async ({
    page,
  }) => {
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
    // its windowing logic return every item unwindowed (this is exactly why
    // all 5 rows are present in the raw SSR HTML above, rather than a
    // subset — matching Tasks 5/6's own documented precedent for this
    // component). `disabled` does NOT gate the root element's scroll
    // listener or its `overflow: auto` CSS, so a real overflow can
    // genuinely exist if the measured content is taller than the viewport —
    // verified directly below before trusting `scrollTop` as a real,
    // provable scroll rather than a no-op.
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

test.describe("Vue SSR/Hydration — Table", () => {
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
    // @sort round-trip through the proof page's own refs actually
    // re-renders the row order.
    await page.getByRole("columnheader", { name: "Score" }).click();
    await expect(rowFirstCells).toHaveText(["Bravo", "Charlie", "Alpha"]);

    assertNoHydrationErrors(errors);
  });
});

test.describe("Vue SSR/Hydration — Tooltip", () => {
  test("serves SSR host content and hydrates hover-triggered tooltip DOM", async ({ page }) => {
    const errors = captureUnexpectedErrors(page);

    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('data-testid="tooltip-host"');
    expect(body).toContain("Hover for tooltip");
    // Tooltip is a directive (v-tooltip), not a component (see this file's
    // header comment): its DOM manipulation runs only from the directive's
    // `mounted`/`updated` hooks, which never fire during `renderToString`'s
    // server pass — its own rendered container (`role="tooltip"`) is
    // entirely absent from the raw SSR payload.
    expect(body).not.toContain('role="tooltip"');

    await page.goto(HARNESS_URL);
    await page.waitForSelector('[data-hydrated="true"]');

    // Real, pre-existing (not introduced by this task) Chromium
    // accessibility-tree behavior discovered while writing this test,
    // confirmed directly against this harness: the directive's panel
    // element (a `<div role="tooltip">` appended to `document.body`, see
    // `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()`) is genuinely
    // absent from Chromium's accessibility tree entirely once rendered
    // (verified via `page.locator("body").ariaSnapshot()` — it does not
    // appear even as a generic/hidden node), so `page.getByRole("tooltip")`
    // never matches it despite the element unquestionably existing in the
    // DOM with the correct `role` attribute and text. This matches
    // Angular's own established convention for this exact component
    // (`apps/playground-angular/e2e/ssr-hydration.spec.ts`'s Tooltip test),
    // which likewise asserts DOM/text presence rather than accessible-role
    // visibility — and matches the plan's own binding table wording for
    // this row ("a specific, literal tooltip text string appears in the
    // DOM"), which this assertion satisfies directly via a CSS attribute
    // selector rather than a role query.
    await expect(page.locator('[role="tooltip"]')).toHaveCount(0);
    await page.locator('[data-testid="tooltip-host"]').hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toContainText("Proof Tooltip Content");

    assertNoHydrationErrors(errors);
  });
});

test.describe("Vue SSR/Hydration — Determinism", () => {
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
