import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-C1 (Spec §9.2–§9.3, §10): screenshot, layout and accessibility
 * coverage for every story that exercises changed G3-C1 CSS. Baselines are
 * recorded in Linux Docker before any CSS change (Plan Task 2). Layout tests
 * that fail before the port are before-state evidence; only the after-port
 * results are acceptance criteria.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "Breadcrumb Default", story: "vue-breadcrumb--default", ready: ".u-breadcrumb" },
  { name: "Breadcrumb WithoutHome", story: "vue-breadcrumb--without-home", ready: ".u-breadcrumb" },
  {
    name: "Breadcrumb WithDisabledItem",
    story: "vue-breadcrumb--with-disabled-item",
    ready: ".u-breadcrumb",
  },
  { name: "Dock Default", story: "vue-dock--default", ready: ".u-dock" },
  { name: "Dock LeftPosition", story: "vue-dock--left-position", ready: ".u-dock" },
  { name: "Dock TopPosition", story: "vue-dock--top-position", ready: ".u-dock" },
  { name: "Dock RightPosition", story: "vue-dock--right-position", ready: ".u-dock" },
  { name: "Dock WithDisabledItem", story: "vue-dock--with-disabled-item", ready: ".u-dock" },
  { name: "Steps Default", story: "vue-steps--default", ready: ".u-steps" },
  { name: "Steps NotReadonly", story: "vue-steps--not-readonly", ready: ".u-steps" },
  { name: "Steps WithDisabledItem", story: "vue-steps--with-disabled-item", ready: ".u-steps" },
  { name: "Stepper Default", story: "vue-stepper--default", ready: ".u-stepper" },
  { name: "Stepper Linear", story: "vue-stepper--linear", ready: ".u-stepper" },
  { name: "Stepper Vertical", story: "vue-stepper--vertical", ready: ".u-stepper" },
  { name: "Tabs Default", story: "vue-tabs--default", ready: ".u-tabs" },
  { name: "Tabs WithDisabledTab", story: "vue-tabs--with-disabled-tab", ready: ".u-tabs" },
  { name: "Tabs WithNavigators", story: "vue-tabs--with-navigators", ready: ".u-tabs" },
];

for (const { name, story, ready } of STORIES) {
  test(`Vue/${name} G3-C1 visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Vue/${name} G3-C1 accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

const SCALED = "matrix(1.5, 0, 0, 1.5, 0, 0)";

// Spec §9.2 (SR-C1-3): the magnification is hover-only, so Dock Default also gets a hover screenshot.
test("Vue/Dock Default (hover) G3-C1 visual", async ({ page }) => {
  await page.goto(storyUrl("vue-dock--default"));
  const link = page.locator(".u-dock-item-link").first();
  await expect(link).toBeAttached();
  await link.hover();
  await expect(link).toHaveCSS("transform", SCALED);
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
const disabledOpacity = (page: Page) => resolved(page, "--u-disabled-opacity", "opacity");
const color = (page: Page, variable: string) => resolved(page, variable, "color");

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

// Spec §9.3 — computed style and layout that screenshots do not prove. Every
// colour assertion compares two token values that differ in Aura (rest vs
// hover/active), so it can fail (G3-B Amendment A2 lesson).
test("Vue/Breadcrumb G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-breadcrumb--with-disabled-item"));
  const disabled = page.locator(".u-breadcrumb-item-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.locator(".u-breadcrumb-item-link")).toHaveCSS("pointer-events", "none");
  const link = page
    .locator(
      ".u-breadcrumb-item:not(.u-breadcrumb-home-item):not(.u-breadcrumb-item-disabled) .u-breadcrumb-item-link"
    )
    .first();
  const label = link.locator(".u-breadcrumb-item-label");
  await expect(label).toHaveCSS("color", await color(page, "--u-breadcrumb-item-color"));
  await link.hover();
  await expect(label).toHaveCSS("color", await color(page, "--u-breadcrumb-item-hover-color"));
});

test("Vue/Dock G3-C1 layout", async ({ page }) => {
  const viewport = page.viewportSize()!;
  for (const [story, edge] of [
    ["vue-dock--default", "bottom"],
    ["vue-dock--top-position", "top"],
    ["vue-dock--left-position", "left"],
    ["vue-dock--right-position", "right"],
  ] as const) {
    await page.goto(storyUrl(story));
    const b = await box(page.locator(".u-dock"));
    const gap = {
      top: b.y,
      bottom: viewport.height - (b.y + b.height),
      left: b.x,
      right: viewport.width - (b.x + b.width),
    }[edge];
    expect(Math.abs(gap), story).toBeLessThanOrEqual(0.5);
  }

  await page.goto(storyUrl("vue-dock--with-disabled-item"));
  const disabled = page.locator(".u-dock-item-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.locator(".u-dock-item-link")).toHaveCSS("pointer-events", "none");
  // R-C1/R-C2: an enabled link still magnifies on hover.
  const link = page.locator(".u-dock-item:not(.u-dock-item-disabled) .u-dock-item-link").first();
  await link.hover();
  await expect(link).toHaveCSS("transform", SCALED);
});

test("Vue/Steps G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-steps--with-disabled-item"));
  const items = page.locator(".u-steps-item");
  await expect(items).toHaveCount(3);
  const number = (i: number) => items.nth(i).locator(".u-steps-item-number");
  await expect(number(0)).toHaveCSS(
    "color",
    await color(page, "--u-steps-item-number-active-color")
  );
  await expect(number(2)).toHaveCSS("color", await color(page, "--u-steps-item-number-color"));
  // PX-C1 (SR-C1-1): a disabled Steps item is not dimmed, as upstream.
  await expect(items.nth(1)).toHaveClass(/\bu-steps-item-disabled\b/);
  await expect(items.nth(1)).toHaveCSS("opacity", "1");

  // PX-C2 (Spec §6.5): an enabled link reached by keyboard shows the token focus
  // ring; the disabled item's link, focused after keyboard use, does not.
  const link = (i: number) => items.nth(i).locator(".u-steps-item-link");
  await page.keyboard.press("Tab");
  await expect(link(0)).toBeFocused();
  expect(await link(0).evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect(link(0)).toHaveCSS("outline-style", "solid");
  await expect(link(0)).toHaveCSS(
    "outline-color",
    await color(page, "--u-steps-item-link-focus-ring-color")
  );
  await link(1).focus();
  await expect(link(1)).toBeFocused();
  expect(await link(1).evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect(link(1)).toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
  await expect(link(1)).toHaveCSS("box-shadow", "none");

  // PX-C1 interaction parity (Spec §17): the disabled item now receives pointer events
  // (upstream `pointer-events: auto`), but a real click changes neither the active step nor the URL.
  await expect(link(1)).toHaveCSS("pointer-events", "auto");
  const url = page.url();
  await link(1).click({ force: true });
  await expect(items.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(items.nth(1)).not.toHaveAttribute("aria-current", "step");
  expect(page.url()).toBe(url);
});

test("Vue/Stepper G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-stepper--default"));
  const steps = page.locator(".u-step");
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0).locator(".u-step-number")).toHaveCSS(
    "color",
    await color(page, "--u-stepper-step-number-active-color")
  );
  await expect(steps.nth(1).locator(".u-step-number")).toHaveCSS(
    "color",
    await color(page, "--u-stepper-step-number-color")
  );

  await page.goto(storyUrl("vue-stepper--linear"));
  const disabled = page.locator(".u-step.u-step-disabled");
  await expect(disabled).toHaveCount(2);
  await expect(disabled.first()).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.first().locator(".u-step-header")).toHaveCSS("pointer-events", "none");

  // Review Focus 2: only the active panel shows in the vertical layout.
  await page.goto(storyUrl("vue-stepper--vertical"));
  await expect(page.locator(".u-step-item")).toHaveCount(3);
  await expect(page.locator(".u-step-panel:visible")).toHaveCount(1);
  await expect(page.locator(".u-step-item-active .u-step-panel")).toBeVisible();

  // GAP-063 intent, retargeted (Spec §17): the vertical step header stays left-aligned in its
  // step without the old `align-items: flex-start` override.
  const step = page.locator(".u-step-item .u-step").first();
  const stepBox = await box(step);
  const headerBox = await box(step.locator(".u-step-header"));
  const padLeft = await step.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
  expect(Math.abs(headerBox.x - (stepBox.x + padLeft))).toBeLessThanOrEqual(0.5);
});

test("Vue/Tabs G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-tabs--default"));
  const tabs = page.locator(".u-tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveCSS("color", await color(page, "--u-tabs-tab-active-color"));
  await expect(tabs.nth(1)).toHaveCSS("color", await color(page, "--u-tabs-tab-color"));
  await tabs.nth(1).hover();
  await expect(tabs.nth(1)).toHaveCSS("color", await color(page, "--u-tabs-tab-hover-color"));
  await expect(page.locator(".u-tablist-active-bar")).toHaveCSS(
    "height",
    await resolved(page, "--u-tabs-active-bar-height", "height")
  );

  await page.goto(storyUrl("vue-tabs--with-disabled-tab"));
  const disabled = page.locator(".u-tab.u-tab-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled).toHaveCSS("pointer-events", "none");

  // Review Focus 3 (C-3): the navigators sit absolutely at the tablist's inline edges.
  await page.goto(storyUrl("vue-tabs--with-navigators"));
  const list = await box(page.locator(".u-tablist"));
  const next = page.locator(".u-tablist-next-button");
  await expect(next).toBeVisible();
  await expect(next).toHaveCSS("position", "absolute");
  const n = await box(next);
  expect(Math.abs(n.x + n.width - (list.x + list.width))).toBeLessThanOrEqual(0.5);
  expect(Math.abs(n.y - list.y)).toBeLessThanOrEqual(0.5);
  await page
    .locator(".u-tablist-content")
    .evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  const prev = page.locator(".u-tablist-prev-button");
  await expect(prev).toBeVisible();
  await expect(prev).toHaveCSS("position", "absolute");
  expect(Math.abs((await box(prev)).x - list.x)).toBeLessThanOrEqual(0.5);
});

test("Vue/Stepper separator G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-stepper--default"));
  const separators = page.locator(".u-step-list .u-stepper-separator");
  await expect(separators).toHaveCount(2);
  await expect(separators.first()).toHaveCSS(
    "background-color",
    await resolved(page, "--u-stepper-separator-background", "background-color")
  );
});
