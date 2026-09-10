import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for v-ripple (Vue/Ripple), Task 8.
 *
 * `rippleDirective` is a directive, not a component-shaped item — same
 * accommodation Task 3's story authoring already established (see
 * `packages/vue/src/ripple/ripple.stories.ts`'s own doc comment) — so this
 * file covers its real directive-application interaction (the ink effect
 * actually triggering on a real pointer interaction) rather than
 * component-shaped role/state assertions.
 *
 * Vitest/@vue/test-utils already covers (packages/vue/src/ripple/ripple.spec.ts):
 * an ink element (`.u-ink`) is created on mount, `.u-ink-active` is added
 * to it on a synthetic `.trigger("mousedown")`, and the ink element is
 * removed on unmount. None of that is repeated here — this file adds only
 * what a real browser's pointer-event pipeline and computed styles can
 * prove and jsdom cannot: the ink element's real accessibility-tree
 * exclusion (role="presentation"/aria-hidden), and the real ink-active
 * class toggling on an actual mouse-driven `mousedown`.
 *
 * REAL IMPLEMENTATION EVIDENCE (read directly from `ripple.ts`, per this
 * task's brief, matching the story's own header-comment fallback-
 * documentation pattern): `rippleDirective`'s `mounted` hook attaches a
 * `mousedown` listener to the host element and an `animationend` listener
 * to a `<span class="u-ink" role="presentation" aria-hidden="true">` ink
 * element it creates and appends — no keyboard listener of any kind is
 * ever registered (confirmed by grep: only `mousedown` on the host and
 * `animationend` on the ink element, nowhere a `keydown`/`keyup`/`click`
 * listener). So a real keyboard Enter/Space activation of the host
 * `<button>` does NOT trigger the ink-active class in this real,
 * unmocked implementation — this is the directive's genuine, verified
 * mousedown-only behavior (not a defect this task introduces or is
 * scoped to fix), distinct from the brief's own speculative "click/
 * keyboard-activate" framing. Both the real mousedown-triggers case and
 * the real keyboard-does-not-trigger case are proven directly below.
 */
test.describe("Vue/Ripple", () => {
  test("Default story: the ink element is excluded from the accessibility tree", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-ripple--default"));
    const ink = page.locator(".u-ink");
    await expect(ink).toHaveCount(1);
    await expect(ink).toHaveAttribute("role", "presentation");
    await expect(ink).toHaveAttribute("aria-hidden", "true");
    // A real accessibility-tree query must never surface the decorative
    // ink element as an accessible node of its own — jsdom has no real
    // accessibility tree to prove this against at all.
    await expect(page.getByRole("presentation")).toHaveCount(0);
  });

  test("Default story: a real mousedown on the host triggers the ink-active class via the browser's own pointer-event pipeline", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-ripple--default"));
    const button = page.getByRole("button", { name: "Click me" });
    await expect(button).toBeVisible();
    const ink = page.locator(".u-ink");
    await expect(ink).not.toHaveClass(/u-ink-active/);

    // Real mouse mousedown (not a synthetic `.trigger("mousedown")`) —
    // genuinely exercises the browser's own pointer-event pipeline,
    // including the real `event.pageX`/`event.pageY` coordinates
    // `onMouseDown()` reads to position the ink element, which jsdom
    // never computes.
    await button.hover();
    await page.mouse.down();
    await expect(ink).toHaveClass(/u-ink-active/);
    await page.mouse.up();
  });

  test("Default story: a real keyboard Enter/Space activation does NOT trigger the ink-active class (real, verified mousedown-only behavior)", async ({
    page,
  }) => {
    await page.goto(storyUrl("vue-ripple--default"));
    const button = page.getByRole("button", { name: "Click me" });
    await button.focus();
    await expect(button).toBeFocused();
    const ink = page.locator(".u-ink");
    await expect(ink).not.toHaveClass(/u-ink-active/);

    // Real keyboard activation of a native <button> — the browser itself
    // fires a real "click" event for both Enter and Space, but
    // rippleDirective registers no keydown/keyup/click listener at all
    // (only mousedown on the host, per the real implementation evidence
    // above), so neither key genuinely triggers the ink effect. Proven via
    // a real keyboard event reaching a real native button, not merely by
    // reading the directive's source.
    await page.keyboard.press("Enter");
    await expect(ink).not.toHaveClass(/u-ink-active/);
    await page.keyboard.press("Space");
    await expect(ink).not.toHaveClass(/u-ink-active/);
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("vue-ripple--default"));
    await expect(page.getByRole("button", { name: "Click me" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("vue-ripple--default"));
    await runAccessibilityScan(page, testInfo, "vue-ripple--default");
  });
});
