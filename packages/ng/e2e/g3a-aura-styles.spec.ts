import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-A (Spec §8 C5/C6, §13.3–§13.4): screenshot and accessibility
 * coverage for every story that exercises changed G3-A CSS. Baselines are
 * recorded in Linux Docker before any CSS change (Plan Task 2). The CDN-based
 * Avatar "Image" story and the empty Toast "Default" story are deliberately
 * excluded; LocalImage and AllSeverities replace them in this contract.
 * Readiness uses toBeAttached() because some "before" roots have no size.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string; count?: number }> = [
  { name: "Avatar Label", story: "ng-avatar--label", ready: ".u-avatar" },
  { name: "Avatar Icon", story: "ng-avatar--icon", ready: ".u-avatar" },
  { name: "Avatar Circle", story: "ng-avatar--circle", ready: ".u-avatar" },
  { name: "Avatar Large", story: "ng-avatar--large", ready: ".u-avatar" },
  { name: "Avatar Xl", story: "ng-avatar--xl", ready: ".u-avatar" },
  { name: "Avatar LocalImage", story: "ng-avatar--local-image", ready: ".u-avatar" },
  { name: "Chip Default", story: "ng-chip--default", ready: ".u-chip" },
  { name: "Chip WithIcon", story: "ng-chip--with-icon", ready: ".u-chip" },
  { name: "Chip Removable", story: "ng-chip--removable", ready: ".u-chip" },
  { name: "Tag Default", story: "ng-tag--default", ready: ".u-tag" },
  { name: "Tag Severity", story: "ng-tag--severity", ready: ".u-tag" },
  { name: "Tag AllSeverities", story: "ng-tag--all-severities", ready: ".u-tag", count: 6 },
  { name: "Skeleton Default", story: "ng-skeleton--default", ready: ".u-skeleton" },
  { name: "Skeleton Circle", story: "ng-skeleton--circle", ready: ".u-skeleton" },
  { name: "OverlayBadge Default", story: "ng-overlaybadge--default", ready: ".u-overlaybadge" },
  { name: "OverlayBadge DotOnly", story: "ng-overlaybadge--dot-only", ready: ".u-overlaybadge" },
  { name: "Knob Default", story: "ng-knob--default", ready: ".u-knob" },
  { name: "Knob NoValueText", story: "ng-knob--no-value-text", ready: ".u-knob" },
  { name: "Knob Readonly", story: "ng-knob--readonly", ready: ".u-knob" },
  {
    name: "ProgressBar Determinate",
    story: "ng-progressbar--determinate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressBar Indeterminate",
    story: "ng-progressbar--indeterminate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressSpinner Default",
    story: "ng-progressspinner--default",
    ready: ".u-progress-spinner",
  },
  { name: "MeterGroup Default", story: "ng-metergroup--default", ready: ".u-meter-group" },
  { name: "MeterGroup Vertical", story: "ng-metergroup--vertical", ready: ".u-meter-group" },
  { name: "Timeline Default", story: "ng-timeline--default", ready: ".u-timeline" },
  { name: "Timeline Horizontal", story: "ng-timeline--horizontal", ready: ".u-timeline" },
  { name: "Terminal Default", story: "ng-terminal--default", ready: ".u-terminal" },
  { name: "Message Default", story: "ng-message--default", ready: ".u-message" },
  { name: "Message Closable", story: "ng-message--closable", ready: ".u-message" },
  {
    name: "Message AllSeverities",
    story: "ng-message--all-severities",
    ready: ".u-message",
    count: 6,
  },
  {
    name: "Toast AllSeverities",
    story: "ng-toast--all-severities",
    ready: ".u-toast-message",
    count: 6,
  },
];

for (const { name, story, ready, count } of STORIES) {
  test(`Ng/${name} G3-A visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Ng/${name} G3-A accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

// GAP-064 G3-A Amendment A2 (Spec §15.6 D-A2-5.2/5.3): measured layout of
// every Toast message: summary stacked above detail; the close button inside
// the content row, after the text column, overlapping neither text box.
test("Ng/Toast AllSeverities G3-A layout", async ({ page }) => {
  await page.goto(storyUrl("ng-toast--all-severities"));
  const messages = page.locator(".u-toast-message");
  await expect(messages).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    const message = messages.nth(i);
    await expect(message.locator(".u-toast-message-content .u-toast-close-button")).toHaveCount(1);
    const box = async (selector: string) => {
      const b = await message.locator(selector).boundingBox();
      expect(b, selector).not.toBeNull();
      return b!;
    };
    const summary = await box(".u-toast-summary");
    const detail = await box(".u-toast-detail");
    const text = await box(".u-toast-message-text");
    const close = await box(".u-toast-close-button");
    const outer = await box(":scope");
    expect(detail.y).toBeGreaterThanOrEqual(summary.y + summary.height - 0.5);
    expect(close.x).toBeGreaterThanOrEqual(text.x + text.width - 0.5);
    expect(close.x).toBeGreaterThanOrEqual(Math.max(summary.x + summary.width, detail.x + detail.width) - 0.5);
    expect(close.x + close.width).toBeLessThanOrEqual(outer.x + outer.width + 0.5);
    expect(close.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  }
});
