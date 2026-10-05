import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-B (Spec §8 C5–C7, §9, §13.5–§13.6): screenshot, layout and
 * accessibility coverage for every story that exercises changed G3-B CSS.
 * Baselines are recorded in Linux Docker before any CSS change (Plan Task 2).
 * The layout tests are RED until the port; their "before" results are
 * evidence (Spec §4.3) and only the "after" results are acceptance criteria.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "Accordion Default", story: "ng-accordion--default", ready: ".u-accordion" },
  { name: "Accordion Multiple", story: "ng-accordion--multiple", ready: ".u-accordion" },
  {
    name: "Accordion ActiveAndDisabled",
    story: "ng-accordion--active-and-disabled",
    ready: ".u-accordion",
  },
  { name: "BlockUI Default", story: "ng-blockui--default", ready: ".u-blockui-container" },
  { name: "BlockUI Unblocked", story: "ng-blockui--unblocked", ready: ".u-blockui-container" },
  { name: "BlockUI FullScreen", story: "ng-blockui--full-screen", ready: ".u-blockui-container" },
  { name: "Card Default", story: "ng-card--default", ready: ".u-card" },
  { name: "Card WithHeaderAndFooter", story: "ng-card--with-header-and-footer", ready: ".u-card" },
  { name: "Divider Horizontal", story: "ng-divider--horizontal", ready: ".u-divider" },
  { name: "Divider Vertical", story: "ng-divider--vertical", ready: ".u-divider" },
  { name: "Divider WithContent", story: "ng-divider--with-content", ready: ".u-divider" },
  {
    name: "Divider WithContentVertical",
    story: "ng-divider--with-content-vertical",
    ready: ".u-divider",
  },
  { name: "Fieldset Default", story: "ng-fieldset--default", ready: ".u-fieldset" },
  { name: "Fieldset Toggleable", story: "ng-fieldset--toggleable", ready: ".u-fieldset" },
  { name: "Fieldset Collapsed", story: "ng-fieldset--collapsed", ready: ".u-fieldset" },
  { name: "Inplace Default", story: "ng-inplace--default", ready: ".u-inplace" },
  { name: "Inplace Disabled", story: "ng-inplace--disabled", ready: ".u-inplace" },
  { name: "Inplace Active", story: "ng-inplace--active", ready: ".u-inplace" },
  { name: "Panel Default", story: "ng-panel--default", ready: ".u-panel" },
  { name: "Panel Toggleable", story: "ng-panel--toggleable", ready: ".u-panel" },
  { name: "Panel Collapsed", story: "ng-panel--collapsed", ready: ".u-panel" },
  { name: "ScrollPanel Default", story: "ng-scrollpanel--default", ready: ".u-scroll-panel" },
  { name: "Splitter Default", story: "ng-splitter--default", ready: ".u-splitter" },
  { name: "Splitter Vertical", story: "ng-splitter--vertical", ready: ".u-splitter" },
  { name: "Toolbar Default", story: "ng-toolbar--default", ready: ".u-toolbar" },
];

for (const { name, story, ready } of STORIES) {
  test(`Ng/${name} G3-B visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Ng/${name} G3-B accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

// Spec §13.5: the bars are invisible at rest, so ScrollPanel also gets a hover screenshot.
test("Ng/ScrollPanel Default (hover) G3-B visual", async ({ page }) => {
  await page.goto(storyUrl("ng-scrollpanel--default"));
  const content = page.locator(".u-scroll-panel-content");
  await expect(content).toBeAttached();
  await content.hover();
  await expect(page.locator(".u-scroll-panel-bar-y")).toHaveCSS("opacity", "1");
  await expect(page).toHaveScreenshot();
});

/** The computed value of `property` when set to `var(<variable>)` on a probe element. */
async function resolved(page: Page, variable: string, property: string): Promise<string> {
  return page.evaluate(
    ([v, p]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, `var(${v})`);
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return value;
    },
    [variable, property] as const
  );
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

/** The element's box inside its border: where an absolutely positioned inset-0 / 100% child is laid out (Spec §14). */
async function insideBorderBox(locator: Locator): Promise<Box> {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const [top, right, bottom, left] = [
      cs.borderTopWidth,
      cs.borderRightWidth,
      cs.borderBottomWidth,
      cs.borderLeftWidth,
    ].map(parseFloat);
    return {
      x: r.x + left,
      y: r.y + top,
      width: r.width - left - right,
      height: r.height - top - bottom,
    };
  });
}

type Box = { x: number; y: number; width: number; height: number };
function expectInside(inner: Box, outer: Box) {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 0.5);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 0.5);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 0.5);
}

// Spec §8 C6 — computed style and layout that screenshots do not prove.
test("Ng/Accordion G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-accordion--active-and-disabled"));
  const panels = page.locator(".u-accordion-panel");
  await expect(panels).toHaveCount(3);
  const header = (i: number) => panels.nth(i).locator(".u-accordion-header");
  await expect(header(0)).toHaveCSS(
    "color",
    await resolved(page, "--u-accordion-header-active-color", "color")
  );
  await expect(panels.nth(2)).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
  await expect(header(2)).toHaveCSS("pointer-events", "none");
  await expect(header(1)).toHaveCSS(
    "color",
    await resolved(page, "--u-accordion-header-color", "color")
  );
  await header(1).hover();
  await expect(header(1)).toHaveCSS(
    "color",
    await resolved(page, "--u-accordion-header-hover-color", "color")
  );
});

test("Ng/BlockUI G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-blockui--default"));
  const container = page.locator(".u-blockui-container");
  const mask = container.locator(".u-blockui-mask");
  await expect(mask).toHaveCount(1);
  const c = await insideBorderBox(container);
  const m = await box(mask);
  for (const k of ["x", "y", "width", "height"] as const)
    expect(Math.abs(m[k] - c[k]), k).toBeLessThanOrEqual(0.5);
  await expect(mask).toHaveCSS(
    "background-color",
    await resolved(page, "--u-mask-background", "background-color")
  );

  await page.goto(storyUrl("ng-blockui--full-screen"));
  const full = page.locator(".u-blockui-mask.u-blockui-mask-document");
  await expect(full).toHaveCSS("position", "fixed");
  const viewport = page.viewportSize()!;
  const f = await box(full);
  expect(Math.abs(f.x)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.y)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.width - viewport.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.height - viewport.height)).toBeLessThanOrEqual(0.5);

  // Review Focus 5: unblocked renders no mask.
  await page.goto(storyUrl("ng-blockui--unblocked"));
  await expect(page.locator(".u-blockui-container")).toBeAttached();
  await expect(page.locator(".u-blockui-mask")).toHaveCount(0);
});

test("Ng/ScrollPanel G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-scrollpanel--default"));
  const root = page.locator(".u-scroll-panel");
  const content = root.locator(".u-scroll-panel-content");
  const barX = root.locator(".u-scroll-panel-bar-x");
  const barY = root.locator(".u-scroll-panel-bar-y");
  await content.hover();
  await expect(barX).toHaveCSS("opacity", "1");
  await expect(barY).toHaveCSS("opacity", "1");
  const r = await box(root);
  expectInside(await box(barX), r);
  expectInside(await box(barY), r);

  // Review Focus 3: content that fits horizontally hides the X bar.
  await content.evaluate((el) => {
    (el.firstElementChild as HTMLElement).style.width = "50px";
  });
  await content.dispatchEvent("mouseenter");
  await expect(barX).toHaveClass(/\bu-scroll-panel-bar-hidden\b/);
  await expect(barX).toHaveCSS("visibility", "hidden");
});

test("Ng/Divider G3-B layout", async ({ page }) => {
  for (const [story, axis] of [
    ["ng-divider--with-content", "x"],
    ["ng-divider--with-content-vertical", "y"],
  ] as const) {
    await page.goto(storyUrl(story));
    const root = page.locator(".u-divider");
    const r = await box(root);
    const c = await box(root.locator(".u-divider-content"));
    const centre = (b: Box) => (axis === "x" ? b.x + b.width / 2 : b.y + b.height / 2);
    expect(Math.abs(centre(c) - centre(r)), story).toBeLessThanOrEqual(1);
  }
});

test("Ng/Inplace G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-inplace--default"));
  const display = page.locator(".u-inplace-display");
  await display.hover();
  await expect(display).toHaveCSS(
    "background-color",
    await resolved(page, "--u-inplace-display-hover-background", "background-color")
  );

  await page.goto(storyUrl("ng-inplace--disabled"));
  const disabled = page.locator(".u-inplace-display");
  const rest = await disabled.evaluate((el) => getComputedStyle(el).backgroundColor);
  await disabled.hover({ force: true });
  // Negative assertion: give any hover transition time to run before reading once.
  await page.waitForTimeout(500);
  expect(await disabled.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rest);
  await expect(disabled).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
});

test("Ng/Splitter G3-B layout", async ({ page }) => {
  for (const [story, cursor] of [
    ["ng-splitter--default", "col-resize"],
    ["ng-splitter--vertical", "row-resize"],
  ] as const) {
    await page.goto(storyUrl(story));
    const root = page.locator(".u-splitter");
    const gutter = root.locator(".u-splitter-gutter");
    await expect(gutter).toHaveCSS("touch-action", "none");
    const g = await box(gutter);
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
    await page.mouse.down();
    await expect(root).toHaveAttribute("data-resizing", "true");
    await expect(root, story).toHaveCSS("cursor", cursor);
    await page.mouse.up();
  }
});

test("Ng/Fieldset G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-fieldset--toggleable"));
  const legend = page.locator(".u-fieldset-legend");
  const button = legend.locator(".u-fieldset-toggle-button");
  const { font, color } = await legend.evaluate((el) => ({
    font: getComputedStyle(el).fontFamily,
    color: getComputedStyle(el).color,
  }));
  await expect(button).toHaveCSS("font-family", font);
  await expect(button).toHaveCSS("color", color);
});
