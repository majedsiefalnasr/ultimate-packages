import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * Real-browser coverage for UFluid (Ng/Fluid), Task 6.
 *
 * Vitest/TestBed already covers (packages/ng/src/fluid/fluid.spec.ts):
 * u-fluid host class application, content projection. UFluid is a purely
 * presentational layout wrapper with no interactive semantics of its own
 * (per fluid.stories.ts's own accessibility notes), so this file's only
 * genuinely new real-browser contribution is proving the real layout
 * effect the wrapper exists for: its projected child actually spans the
 * full container width, which requires a real browser layout engine —
 * jsdom performs no layout at all, so getBoundingClientRect()-based width
 * comparisons are meaningless there.
 */
test.describe("Ng/Fluid", () => {
  test("Default story: projected child spans the full container width via real layout", async ({
    page,
  }) => {
    await page.goto(storyUrl("ng-fluid--default"));
    const fluidHost = page.locator(".u-fluid");
    const child = page.getByRole("button", { name: "Full-width child" });
    await expect(child).toBeVisible();

    const hostBox = await fluidHost.boundingBox();
    const childBox = await child.boundingBox();
    expect(hostBox).not.toBeNull();
    expect(childBox).not.toBeNull();
    if (hostBox && childBox) {
      // The child's real rendered width must match its fluid container's
      // real rendered width (within 1px layout-rounding tolerance) — the
      // actual behavior UFluid exists to guarantee, provable only with a
      // real layout engine.
      expect(Math.abs(childBox.width - hostBox.width)).toBeLessThanOrEqual(1);
    }
  });

  test("Default story: visual regression", async ({ page }) => {
    await page.goto(storyUrl("ng-fluid--default"));
    await expect(page.getByRole("button", { name: "Full-width child" })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  test("Default story: accessibility scan", async ({ page }, testInfo) => {
    await page.goto(storyUrl("ng-fluid--default"));
    await runAccessibilityScan(page, testInfo, "ng-fluid--default");
  });
});
