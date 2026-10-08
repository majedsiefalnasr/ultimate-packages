import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 D-0: real-browser layout checks that UPopover and UConfirmPopup
 * open anchored below their trigger (left edges aligned, top at the trigger's
 * bottom) instead of at the page's top-left corner. Layout assertions only —
 * no screenshot and no accessibility scan. Unit tests
 * (src/popover/popover.spec.ts, src/confirm-popup/confirm-popup.spec.ts)
 * cover the render timing and the early-hide case.
 */

async function openFrom(page: Page, storyId: string, overlay: string) {
  await page.goto(storyUrl(storyId));
  const trigger = page.locator("#storybook-root button").first();
  await expect(trigger).toBeVisible();
  await page.mouse.move(0, 0); // ADR-052 X-6: no pointer residue before interacting
  await trigger.click();
  const root = page.locator(overlay);
  await expect(root).toBeVisible();
  return { trigger, root };
}

async function expectAnchoredBelow(page: Page, storyId: string, overlay: string) {
  const { trigger, root } = await openFrom(page, storyId, overlay);
  // Measured after opening: the trigger's own box can change once it has been clicked.
  // The overlay's own `margin-block-start` (the G3-D Aura gutter, PR-1) is subtracted,
  // so the check measures the anchor D-0 positions, not the ported styling.
  await expect
    .poll(async () => {
      const t = await trigger.boundingBox();
      const r = await root.boundingBox();
      if (!t || !r) return null;
      const gutter = await root.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).marginBlockStart)
      );
      return { dx: Math.round(r.x - t.x), dy: Math.round(r.y - gutter - (t.y + t.height)) };
    })
    .toEqual({ dx: 0, dy: 0 });
  await expect(root).toHaveAttribute("style", /z-index:\s*\d+/);
}

test.describe("Ng/Popover anchoring (GAP-064 D-0)", () => {
  test("Default opens below its trigger", async ({ page }) => {
    await expectAnchoredBelow(page, "ng-popover--default", ".u-popover");
  });

  test("NonDismissable opens below its trigger", async ({ page }) => {
    await expectAnchoredBelow(page, "ng-popover--non-dismissable", ".u-popover");
  });
});

test.describe("Ng/ConfirmPopup anchoring (GAP-064 D-0)", () => {
  test("Default opens below confirmation.target", async ({ page }) => {
    await expectAnchoredBelow(page, "ng-confirmpopup--default", ".u-confirmpopup");
  });
});
