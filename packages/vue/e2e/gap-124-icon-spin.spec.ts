import { expect, test, type Locator } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/** GAP-124 item A (Spec §5, A-AC1/A-AC2): loading icons rotate, and stop under reduced motion. */
const CASES: Array<[story: string, icon: string, status: boolean]> = [
  ["vue-button--loading", ".u-button svg.u-icon-spin", false],
  ["data-dataview--loading", '.u-data-view > [role="status"] svg.u-icon-spin', true],
];

const animation = (icon: Locator) =>
  icon.evaluate((el) => {
    const c = getComputedStyle(el);
    return [
      c.animationName,
      c.animationDuration,
      c.animationTimingFunction,
      c.animationIterationCount,
    ];
  });

/** Bounding box at the 0° frame: pause running animations first, so rotation does not inflate the box. */
const restBox = (icon: Locator) =>
  icon.evaluate((el) => {
    for (const a of el.getAnimations()) {
      a.pause();
      a.currentTime = 0;
    }
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

for (const [story, selector, status] of CASES) {
  test.describe(`GAP-124 A ${story}`, () => {
    test("rotates continuously with normal motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(storyUrl(story));
      const icon = page.locator(selector).first();
      await expect(icon).toBeVisible();
      expect(await animation(icon)).toEqual(["u-icon-spin", "2s", "linear", "infinite"]);
      const first = await icon.evaluate((el) => getComputedStyle(el).transform);
      await expect
        .poll(() => icon.evaluate((el) => getComputedStyle(el).transform), { timeout: 2000 })
        .not.toBe(first);
    });

    test("is static, visible and unchanged in size under reduced motion (set after load)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(storyUrl(story));
      const icon = page.locator(selector).first();
      await expect(icon).toBeVisible();
      const normal = await restBox(icon);
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect((await animation(icon))[0]).toBe("none");
      await expect(icon).toBeVisible();
      const reduced = await icon.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height, opacity: getComputedStyle(el).opacity };
      });
      expect(reduced.width).toBeGreaterThan(0);
      expect(Math.abs(reduced.width - normal.width)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(reduced.height - normal.height)).toBeLessThanOrEqual(0.5);
      expect(reduced.opacity).toBe("1");
      if (status) await expect(page.getByRole("status")).toHaveText("Loading");
    });
  });
}
