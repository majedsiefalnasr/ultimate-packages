import { expect, test } from "@playwright/test";
import {
  CATEGORY_SUBJECTS,
  FRAMEWORKS,
  MOTION_VARIANTS,
  PERF_PAGE_PORTS,
  isBuilt,
  pageSubjects,
} from "./stage1-subjects.mjs";
import { measureBrowserCategory } from "./run-stage1.mjs";

/**
 * ADR-057 Stage 1 harness contract (Spec B4-R1, Task 8). Run with
 * `npx playwright test -c playwright.perf.config.ts` after each playground's
 * `build:perf`. Functional checks only: no timing value is asserted.
 *
 * scripts/perf/package.json marks this directory as ESM, so Playwright loads
 * this spec as a module and can import the .mjs runner (it uses import.meta).
 * For the same reason the root config does not import these .mjs modules.
 */

declare global {
  interface Window {
    __perf?: Record<string, (...args: unknown[]) => Promise<void>>;
  }
}

for (const framework of FRAMEWORKS) {
  for (const subject of pageSubjects(framework)) {
    test.describe(`${framework} / ${subject}`, () => {
      test("every subject page exposes __perf and emits marks", async ({ page }) => {
        await page.goto(`http://localhost:${PERF_PAGE_PORTS[framework]}/perf/${subject}`);
        await page.waitForFunction(() => typeof window.__perf?.mount === "function");

        const methods = await page.evaluate(() =>
          ["mount", "unmount", "update", "open", "close", "scroll"].map(
            (name) => typeof window.__perf?.[name]
          )
        );
        expect(methods).toEqual(Array(6).fill("function"));

        await page.evaluate(() => window.__perf!.mount());
        const counts = await page.evaluate(
          (name) =>
            [`${name}:start`, `${name}:end`, name].map(
              (entry) => performance.getEntriesByName(entry).length
            ),
          `u-perf:${subject}:mount`
        );
        expect(counts).toEqual([1, 1, 1]);
        expect(await page.locator("#perf-root > *").count()).toBeGreaterThan(0);
      });
    });
  }
}

test.describe("P7 overlays", () => {
  test("P7 records both motion variants", async ({ browser }) => {
    test.setTimeout(180_000);
    const expected = MOTION_VARIANTS.map(({ variant }) => variant).sort();
    for (const framework of FRAMEWORKS) {
      const results = await measureBrowserCategory(browser, "P7", framework, { W: 0, R: 1, I: 1 });
      for (const subject of CATEGORY_SUBJECTS.P7.filter((name) => isBuilt(framework, name))) {
        const own = results.filter((result) => result.subject === `${framework}:${subject}`);
        const variants = [...new Set(own.map((result) => result.variant))].sort();
        expect(variants, `${framework}:${subject}`).toEqual(expected);
        for (const variant of expected) {
          const metrics = own.filter((r) => r.variant === variant).map((r) => r.metric);
          expect(metrics.sort(), `${framework}:${subject} ${variant}`).toEqual([
            "closeToRemoved",
            "domNodeDeltaAfterClose",
            "openToVisible",
          ]);
        }
      }
    }
  });
});
