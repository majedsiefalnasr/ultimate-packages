import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * Real-browser layout check for GAP-077: jsdom has no layout, so only a real
 * browser shows that each separator sits between two step headers on the
 * same row. No screenshots are taken.
 */
test.describe("Vue/Stepper horizontal separators (GAP-077)", () => {
  test("each separator lies between consecutive step headers on one row", async ({ page }) => {
    await page.goto(storyUrl("vue-stepper--default"));
    const headers = page.locator(".u-step-list .u-step-header");
    const separators = page.locator(".u-step-list .u-stepper-separator");
    await expect(headers.first()).toBeVisible();
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(1);
    await expect(separators).toHaveCount(headerCount - 1);

    for (let i = 0; i < headerCount - 1; i++) {
      const left = await headers.nth(i).boundingBox();
      const sep = await separators.nth(i).boundingBox();
      const right = await headers.nth(i + 1).boundingBox();
      expect(left && sep && right).toBeTruthy();
      expect(sep!.width).toBeGreaterThan(0);
      expect(sep!.x).toBeGreaterThanOrEqual(left!.x + left!.width);
      expect(sep!.x + sep!.width).toBeLessThanOrEqual(right!.x);
      const sepMid = sep!.y + sep!.height / 2;
      expect(sepMid).toBeGreaterThan(left!.y);
      expect(sepMid).toBeLessThan(left!.y + left!.height);
    }
  });
});
