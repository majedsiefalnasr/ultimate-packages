import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { readFileSync } from "node:fs";
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
    perfHarness: {
      isOverlayVisible(element: Element | null): boolean;
      createPerfApi(subject: string, adapter: Record<string, () => void>): Record<string, unknown>;
    };
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

// Spec B4-R1 Amendment A1: openToVisible ends at the first frame the overlay is
// rendered visible. The fixture is test-only; it is served by no perf page. The
// harness is bundled with esbuild and injected, so the code under test is the
// code the playgrounds import. Chromium 121+ is needed for
// checkVisibility({ opacityProperty, visibilityProperty }); Playwright 1.63
// ships a newer one.
test.describe("P7 first-visible predicate (fixture)", () => {
  const fixtureHtml = readFileSync(
    new URL("./browser/fixtures/overlay-visibility.html", import.meta.url),
    "utf8"
  );
  let harnessSource = "";

  test.beforeAll(async () => {
    const result = await build({
      entryPoints: [new URL("./browser/harness.ts", import.meta.url).pathname],
      bundle: true,
      format: "iife",
      globalName: "perfHarness",
      write: false,
    });
    harnessSource = result.outputFiles[0].text;
  });

  test.beforeEach(async ({ page }) => {
    await page.setContent(fixtureHtml);
    await page.addScriptTag({ content: harnessSource });
  });

  const cases = [
    { id: "plain", visible: true },
    { id: "display-none", visible: false },
    { id: "visibility-hidden", visible: false },
    { id: "opacity-zero", visible: false },
    { id: "ancestor-opacity-zero", visible: false },
    { id: "ancestor-display-none", visible: false },
    { id: "zero-size", visible: false },
  ];
  for (const { id, visible } of cases) {
    test(`isOverlayVisible(#${id}) is ${visible}`, async ({ page }) => {
      const result = await page.evaluate(
        (elementId) => window.perfHarness.isOverlayVisible(document.getElementById(elementId)),
        id
      );
      expect(result).toBe(visible);
    });
  }

  test("isOverlayVisible(null) is false", async ({ page }) => {
    expect(await page.evaluate(() => window.perfHarness.isOverlayVisible(null))).toBe(false);
  });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`openToVisible ends at the first visible frame of a 500 ms opacity transition (${reducedMotion})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      const duration = await page.evaluate(async () => {
        const adapter = {
          mount() {},
          unmount() {},
          update() {},
          close() {},
          open() {
            const overlay = document.createElement("div");
            overlay.className = "u-dialog";
            document.body.appendChild(overlay);
            void getComputedStyle(overlay).opacity; // commit opacity 0.01 before the transition
            overlay.classList.add("entered"); // the 500 ms transition is running at the first check
          },
        };
        const api = window.perfHarness.createPerfApi("dialog", adapter) as {
          open(): Promise<void>;
        };
        await api.open();
        return performance.getEntriesByName("u-perf:dialog:open", "measure")[0].duration;
      });
      expect(duration).toBeLessThan(250);
    });
  }
});
