import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";
import { measureIconContrast, roundingRange, type Rgb } from "./non-text-contrast";

/** GAP-124 item B (Spec §6.4, §10). Expected values: Spec §6.4; tolerance: per-condition rounding range (B-AC6, Amendment A2). */
type Scheme = "light" | "dark";
const REQUIRED: Array<[id: string, scheme: Scheme, surface: string, expected: number]> = [
  ["C-L1", "light", "#ffffff", 5.13],
  ["C-L2", "light", "#f1f5f9", 4.74],
  ["C-L3", "light", "#e2e8f0", 4.28],
  ["C-L4", "light", "#cbd5e1", 3.67],
  ["C-L5", "light", "#ecfdf5", 4.92],
  ["C-D1", "dark", "#18181b", 19.79],
  ["C-D2", "dark", "#27272a", 19.02],
  ["C-D3", "dark", "#a1a1aa", 10.32],
  ["C-D4", "dark", "#ffffff", 5.74],
  ["C-D5", "dark", "#34d399", 8.87],
];
const NOT_COVERED: Array<[id: string, surface: string, expected: number]> = [
  ["N-L1", "#94a3b8", 2.37],
  ["N-L2", "#64748b", 1.53],
  ["N-L3", "#10b981", 2.36],
];
const EPSILON = 0.005;
/** Specified icon fill (`text.hover.color`) and `mask.background` alpha per scheme (Spec §6.1). */
const FILL: Record<Scheme, string> = { light: "#1e293b", dark: "#ffffff" };
const ALPHA: Record<Scheme, number> = { light: 0.4, dark: 0.6 };
const rgb = (hex: string): Rgb =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb;
/** B-AC6: soft-asserts that an L1 value lies in its rounding range. */
function expectInRange(id: string, ratio: number, fill: string, surface: string, alpha: number) {
  const [lo, hi] = roundingRange(rgb(fill), rgb(surface), alpha);
  expect
    .soft(ratio, `${id} ≥ rounding range min ${lo.toFixed(3)}`)
    .toBeGreaterThanOrEqual(lo - EPSILON);
  expect
    .soft(ratio, `${id} ≤ rounding range max ${hi.toFixed(3)}`)
    .toBeLessThanOrEqual(hi + EPSILON);
}
const ICON = '.u-data-view > [role="status"] svg';
const EXPECTED_COLOR: Record<Scheme, string> = {
  light: "rgb(30, 41, 59)",
  dark: "rgb(255, 255, 255)",
};

async function open(page: Page, scheme: Scheme) {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.goto(storyUrl("data-dataview--loading"));
  await expect(page.locator(ICON)).toBeVisible();
}
/** Spec §10 setup: a declared uniform surface under the mask; test-time inline styles only. */
async function setSurface(page: Page, surface: string) {
  await page.locator(".u-data-view").evaluate((root, bg) => {
    (root as HTMLElement).style.backgroundColor = bg;
    for (const el of Array.from(root.children))
      if (el.getAttribute("role") !== "status") (el as HTMLElement).style.visibility = "hidden";
  }, surface);
}
const note = (id: string, text: string) =>
  test.info().annotations.push({ type: id, description: text });

test.describe("GAP-124 B layer L1 (device scale 4)", () => {
  test.use({ deviceScaleFactor: 4 });

  for (const scheme of ["light", "dark"] as const) {
    test(`GAP-124 B DataView loading icon ≥ 3:1 on every required ${scheme} surface`, async ({
      page,
    }) => {
      await open(page, scheme);
      const icon = page.locator(ICON);
      expect(await icon.evaluate((el) => getComputedStyle(el).color)).toBe(EXPECTED_COLOR[scheme]);
      for (const [id, , surface, expected] of REQUIRED.filter(([, s]) => s === scheme)) {
        await setSurface(page, surface);
        const m = await measureIconContrast(page, icon);
        note(
          id,
          `${scheme} ${surface}: L1 ${m.ratio.toFixed(2)} (expected ${expected}; core ${m.corePixels}/${m.inkPixels})`
        );
        expect.soft(m.ratio, `${id} (${surface}) ≥ 3`).toBeGreaterThanOrEqual(3);
        expectInRange(id, m.ratio, FILL[scheme], surface, ALPHA[scheme]);
      }
    });
  }

  test("GAP-124 B not-covered light surfaces are reported and match the Spec (N-L1..N-L3)", async ({
    page,
  }) => {
    await open(page, "light");
    for (const [id, surface, expected] of NOT_COVERED) {
      await setSurface(page, surface);
      const m = await measureIconContrast(page, page.locator(ICON));
      note(
        id,
        `light ${surface}: L1 ${m.ratio.toFixed(2)} (expected ${expected}; not covered; core ${m.corePixels}/${m.inkPixels})`
      );
      expectInRange(id, m.ratio, FILL.light, surface, ALPHA.light);
    }
  });

  test("GAP-124 B negative control: the pre-change mask.color icon measures < 3:1 on C-L1", async ({
    page,
  }) => {
    await open(page, "light");
    await setSurface(page, "#ffffff");
    const icon = page.locator(ICON);
    await icon.evaluate((el) => {
      (el as SVGElement).style.color = getComputedStyle(el.closest('[role="status"]')!).color;
    });
    const m = await measureIconContrast(page, icon);
    note("negative", `C-L1 with mask.color: L1 ${m.ratio.toFixed(2)}`);
    expect(m.ratio).toBeLessThan(3);
    expectInRange("negative", m.ratio, "#e2e8f0", "#ffffff", ALPHA.light);
  });

  test("GAP-124 B the color rule survives a custom loadingIcon class on the status region", async ({
    page,
  }) => {
    await open(page, "light");
    await page
      .locator('.u-data-view > [role="status"]')
      .evaluate((el) => el.setAttribute("class", "my-loading"));
    expect(await page.locator(ICON).evaluate((el) => getComputedStyle(el).color)).toBe(
      EXPECTED_COLOR.light
    );
  });
});

for (const dpr of [1, 2]) {
  test.describe(`GAP-124 B layer L2 (device scale ${dpr}, reported only)`, () => {
    test.use({ deviceScaleFactor: dpr });
    for (const [id, scheme, surface] of [
      ["C-L1", "light", "#ffffff"],
      ["C-D1", "dark", "#18181b"],
    ] as const) {
      test(`GAP-124 B rendered anti-aliased contrast, ${id} at ${dpr}x (KL-4)`, async ({
        page,
      }) => {
        await open(page, scheme);
        await setSurface(page, surface);
        const m = await measureIconContrast(page, page.locator(ICON), { validate: false });
        note(
          `${id} L2 ${dpr}x`,
          `median ${m.renderedMedian.toFixed(2)}; core ${m.corePixels}/${m.inkPixels} px`
        );
      });
    }
  });
}
