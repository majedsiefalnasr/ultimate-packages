import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-074 real-browser check: an element in the shared u-hidden-accessible
 * wrapper is visually hidden (1x1, clipped) but still in the accessibility
 * tree. Uses the existing Vue Rating story. No screenshots.
 */
test("Rating's radio inputs are visually hidden yet discoverable by role (accessibility tree)", async ({
  page,
}) => {
  await page.goto(storyUrl("vue-rating--default"));
  const wrapper = page.locator(".u-hidden-accessible").first();
  await expect(wrapper).toBeAttached();
  const box = await wrapper.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(1);
  expect(box!.height).toBeLessThanOrEqual(1);
  expect(await wrapper.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
  // Semantic check, not just DOM attachment: with the hidden-accessible CSS
  // applied, the radios must still be exposed through the browser's
  // accessibility tree. getByRole resolves against computed roles and
  // excludes hidden elements by default, so finding them here shows the
  // visual hiding did not remove them from assistive technology.
  // (aria-hidden, display:none or visibility:hidden would remove them; the
  // 1x1 clip used here must not).
  const radios = page.getByRole("radio");
  expect(await radios.count()).toBeGreaterThan(0);
  await expect(radios.first()).toBeAttached();
});
