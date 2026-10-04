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
  { name: "Avatar Label", story: "vue-avatar--label", ready: ".u-avatar" },
  { name: "Avatar Icon", story: "vue-avatar--icon", ready: ".u-avatar" },
  { name: "Avatar Circle", story: "vue-avatar--circle", ready: ".u-avatar" },
  { name: "Avatar Large", story: "vue-avatar--large", ready: ".u-avatar" },
  { name: "Avatar Xl", story: "vue-avatar--xl", ready: ".u-avatar" },
  { name: "Avatar LocalImage", story: "vue-avatar--local-image", ready: ".u-avatar" },
  { name: "Chip Default", story: "vue-chip--default", ready: ".u-chip" },
  { name: "Chip WithIcon", story: "vue-chip--with-icon", ready: ".u-chip" },
  { name: "Chip Removable", story: "vue-chip--removable", ready: ".u-chip" },
  { name: "Tag Default", story: "vue-tag--default", ready: ".u-tag" },
  { name: "Tag Severity", story: "vue-tag--severity", ready: ".u-tag" },
  { name: "Tag AllSeverities", story: "vue-tag--all-severities", ready: ".u-tag", count: 6 },
  { name: "Skeleton Default", story: "vue-skeleton--default", ready: ".u-skeleton" },
  { name: "Skeleton Circle", story: "vue-skeleton--circle", ready: ".u-skeleton" },
  { name: "OverlayBadge Default", story: "vue-overlaybadge--default", ready: ".u-overlaybadge" },
  { name: "OverlayBadge DotOnly", story: "vue-overlaybadge--dot-only", ready: ".u-overlaybadge" },
  { name: "Knob Default", story: "vue-knob--default", ready: ".u-knob" },
  { name: "Knob NoValueText", story: "vue-knob--no-value-text", ready: ".u-knob" },
  { name: "Knob Readonly", story: "vue-knob--readonly", ready: ".u-knob" },
  {
    name: "ProgressBar Determinate",
    story: "vue-progressbar--determinate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressBar Indeterminate",
    story: "vue-progressbar--indeterminate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressSpinner Default",
    story: "vue-progressspinner--default",
    ready: ".u-progress-spinner",
  },
  { name: "MeterGroup Default", story: "vue-metergroup--default", ready: ".u-meter-group" },
  { name: "MeterGroup Vertical", story: "vue-metergroup--vertical", ready: ".u-meter-group" },
  { name: "Timeline Default", story: "vue-timeline--default", ready: ".u-timeline" },
  { name: "Timeline Horizontal", story: "vue-timeline--horizontal", ready: ".u-timeline" },
  { name: "Terminal Default", story: "vue-terminal--default", ready: ".u-terminal" },
  { name: "Message Default", story: "vue-message--default", ready: ".u-message" },
  { name: "Message Closable", story: "vue-message--closable", ready: ".u-message" },
  {
    name: "Message AllSeverities",
    story: "vue-message--all-severities",
    ready: ".u-message",
    count: 6,
  },
  {
    name: "InlineMessage Default",
    story: "vue-inlinemessage--default",
    ready: ".u-inline-message",
  },
  {
    name: "InlineMessage Success",
    story: "vue-inlinemessage--success",
    ready: ".u-inline-message",
  },
  {
    name: "InlineMessage AllSeverities",
    story: "vue-inlinemessage--all-severities",
    ready: ".u-inline-message",
    count: 6,
  },
  {
    name: "Toast AllSeverities",
    story: "vue-toast--all-severities",
    ready: ".u-toast-message",
    count: 6,
  },
];

for (const { name, story, ready, count } of STORIES) {
  test(`Vue/${name} G3-A visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Vue/${name} G3-A accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}
