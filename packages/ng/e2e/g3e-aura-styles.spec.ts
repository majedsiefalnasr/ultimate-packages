import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-E (Spec §8): Ultimate regression evidence for the G3-E verification stories —
 * screenshots, accessibility scans and the ADR-052 X-1 selector reach. This is regression
 * evidence only; Prime parity is measured by tooling/prime-reference (not run in CI).
 * Tables are filled per batch (Plan Tasks 5, 8, 11, 14). STORIES lists literal story ids:
 * scripts/provenance/validate-g3e-accessibility.mjs parses them. All evidence runs use --retries=0.
 */
const T = "Ng";
const TRIGGER = "#storybook-root button";

type Kind = "rest" | "click" | "fullscreen";

const STORIES: ReadonlyArray<{
  name: string;
  story: string;
  ready: string;
  kind: Kind;
  batch: string;
  trigger?: string;
}> = [
  // E-1 (Image, ImageCompare)
  {
    name: "Image Default",
    story: "ng-image--default",
    ready: ".u-image",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "Image WithPreview",
    story: "ng-image--with-preview",
    ready: ".u-image",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "ImageCompare Sized",
    story: "ng-imagecompare--sized",
    ready: ".u-image-compare",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "ImageCompare Rtl",
    story: "ng-imagecompare--rtl",
    ready: ".u-image-compare",
    kind: "rest",
    batch: "E-1",
  },
];

const VISUAL: ReadonlyArray<{
  name: string;
  story: string;
  kind: Kind;
  shot: string;
  batch: string;
  trigger?: string;
}> = [
  // E-1 (Image, ImageCompare)
  {
    name: "Image Default rest",
    story: "ng-image--default",
    kind: "rest",
    shot: ".u-image",
    batch: "E-1",
  },
  {
    name: "Image WithPreview open",
    story: "ng-image--with-preview",
    kind: "click",
    shot: "page",
    batch: "E-1",
    trigger: ".u-image-preview-mask",
  },
  {
    name: "ImageCompare Sized rest",
    story: "ng-imagecompare--sized",
    kind: "rest",
    shot: ".u-image-compare",
    batch: "E-1",
  },
  {
    name: "ImageCompare Rtl rest",
    story: "ng-imagecompare--rtl",
    kind: "rest",
    shot: ".u-image-compare",
    batch: "E-1",
  },
];

async function go(page: Page, story: string) {
  // G3E-4: freeze autoplay timers for the circular Carousel story (clock installed before navigation).
  if (story.includes("circular")) await page.clock.install({ time: 0 });
  await page.goto(storyUrl(story));
  if (story.includes("circular")) await page.clock.pauseAt(1000);
  await page.mouse.move(0, 0); // X-6: no pointer residue
}

async function nonZero(l: Locator) {
  await expect(l).toBeVisible();
  const b = await l.boundingBox();
  expect(b !== null && b.width > 0 && b.height > 0, "non-zero box").toBe(true);
}

/** Opens a state through its real trigger and waits for visibility (X-6). */
async function state(page: Page, kind: Kind, ready: string, trigger = TRIGGER) {
  if (kind === "click") {
    await page.locator(trigger).first().click();
    await page.mouse.move(0, 0);
  } else if (kind === "fullscreen") {
    await page.getByRole("button", { name: "Show" }).click();
    await page.mouse.move(0, 0);
    await expect(page.locator(".u-galleria-mask").first()).toBeVisible();
  }
  await nonZero(page.locator(ready).first());
}

for (const { name, story, ready, kind, batch, trigger } of STORIES) {
  test(`${T}/${name} G3-E ${batch} accessibility`, async ({ page }, testInfo) => {
    await go(page, story);
    await state(page, kind, ready, trigger);
    await runAccessibilityScan(page, testInfo, story);
  });
}

for (const v of VISUAL) {
  test(`${T}/${v.name} G3-E ${v.batch} visual`, async ({ page }) => {
    await go(page, v.story);
    const ready = v.shot === "page" ? "#storybook-root" : v.shot;
    await state(page, v.kind, v.kind === "rest" ? "#storybook-root" : ready, v.trigger);
    if (v.shot === "page") await expect(page).toHaveScreenshot();
    else await expect(page.locator(v.shot).first()).toHaveScreenshot();
  });
}

const ATTR = "data-u-ng-style"; // the Angular core's style-element attribute
/** ADR-052 X-1: every emitted selector part must match the rendered DOM in a declared story and state. */
const REACH: ReadonlyArray<{ key: string; runs: ReadonlyArray<readonly [string, Kind, string]> }> =
  [
    {
      key: "image",
      runs: [
        ["ng-image--default", "rest", ".u-image"],
        ["ng-image--with-preview", "click", ".u-image-mask"],
      ],
    },
    {
      key: "imagecompare",
      runs: [
        ["ng-imagecompare--sized", "rest", ".u-image-compare"],
        ["ng-imagecompare--rtl", "rest", ".u-image-compare"],
      ],
    },
  ];
/** ADR-052 X-1 class K: emitted by a cited source under a state no story exercises. */
const K: Record<string, Record<string, string>> = {};
const STATE =
  /::?(before|after|-webkit-[a-z-]+|-moz-[a-z-]+)\b|:(hover|focus-visible|focus|active|dir\([a-z]+\))/g;

for (const r of REACH) {
  test(`${T}/${r.key} selector reach G3-E reach`, async ({ page }) => {
    const hit = new Map<string, string>();
    let parts: string[] = [];
    for (const [story, kind, ready] of r.runs) {
      await go(page, story);
      await state(page, kind, ready);
      if (r.key === "image" && kind === "click") {
        const zoomOut = page.getByRole("button", { name: "Zoom out", exact: true });
        const preview = page.locator(".u-image-original");
        for (let step = 0; step < 6 && (await zoomOut.isEnabled()); step++) {
          const transform = await preview.evaluate((image: HTMLElement) => image.style.transform);
          await zoomOut.click();
          // Wait for Angular to render this zoom step before re-querying the disabled state.
          await expect
            .poll(() => preview.evaluate((image: HTMLElement) => image.style.transform))
            .not.toBe(transform);
        }
        await expect(zoomOut).toBeDisabled();
        await expect(page.locator(".u-image-toolbar > button:disabled")).toBeVisible();
      }
      await expect(page.locator(`style[${ATTR}="${r.key}"]`)).toBeAttached();
      const res = await page.evaluate(
        ([key, attr, re]) => {
          const sheet = (
            document.querySelector(`style[${attr}="${key}"]`) as HTMLStyleElement | null
          )?.sheet;
          if (!sheet) return null;
          const all: string[] = [];
          for (const rule of Array.from(sheet.cssRules) as CSSStyleRule[]) {
            if (!rule.selectorText) continue;
            let depth = 0,
              cur = "";
            for (const ch of rule.selectorText) {
              if (ch === "(") depth++;
              if (ch === ")") depth--;
              if (ch === "," && !depth) {
                all.push(cur.trim());
                cur = "";
              } else cur += ch;
            }
            all.push(cur.trim());
          }
          return all.map((s) => {
            const stripped = s.replace(new RegExp(re, "g"), "");
            return { s, stripped, n: stripped ? document.querySelectorAll(stripped).length : 0 };
          });
        },
        [r.key, ATTR, STATE.source] as const
      );
      expect(res, `structural sheet for ${r.key}`).not.toBeNull();
      for (const x of res!)
        expect(x.stripped, `selector part "${x.s}" strips to empty`).not.toBe("");
      parts = [...new Set([...parts, ...res!.map((x) => x.s)])];
      for (const x of res!) if (x.n > 0 && !hit.has(x.s)) hit.set(x.s, `${story}/${kind}`);
    }
    const unreached = parts.filter((s) => !hit.has(s) && !(K[r.key] ?? {})[s]);
    expect(unreached, "selector parts with no R evidence and no K citation").toEqual([]);
    test.info().annotations.push({
      type: "reach",
      description: `${parts.length} parts; R ${hit.size}`,
    });
  });
}
