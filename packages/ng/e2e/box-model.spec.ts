import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-098 (ADR-063, Spec §4.3): with overlays, panels and masks open, every
 * element the component rendered that carries a `u-` class — including parts
 * Angular reparents to <body> — computes `box-sizing: border-box`, and so do
 * the unclassed descendants component CSS targets. Storybook's own harness
 * elements carry no `u-` class and are not checked; <html> and <body> never are.
 */
type Open =
  | { kind: "none" | "scroll" }
  | { kind: "click" | "rclick" | "hover"; target: string }
  | { kind: "type"; target: string; text: string };

const CASES: ReadonlyArray<{ story: string; open: Open; ready: string }> = [
  {
    story: "ng-select--default",
    open: { kind: "click", target: ".u-select" },
    ready: ".u-select-overlay",
  },
  {
    story: "ng-multiselect--default",
    open: { kind: "click", target: ".u-multi-select" },
    ready: ".u-multi-select-overlay",
  },
  {
    story: "ng-autocomplete--with-suggestions",
    open: { kind: "type", target: ".u-autocomplete input", text: "a" },
    ready: ".u-autocomplete-overlay",
  },
  {
    story: "ng-cascadeselect--default",
    open: { kind: "click", target: ".u-cascade-select" },
    ready: ".u-cascade-select-overlay",
  },
  {
    story: "ng-password--default",
    open: { kind: "type", target: ".u-password input", text: "a" },
    ready: ".u-password-overlay",
  },
  {
    story: "ng-datepicker--default",
    open: { kind: "click", target: ".u-date-picker input" },
    ready: ".u-date-picker-panel",
  },
  {
    story: "ng-colorpicker--default",
    open: { kind: "click", target: ".u-color-picker-preview" },
    ready: ".u-color-picker-panel",
  },
  { story: "ng-dialog--open", open: { kind: "none" }, ready: ".u-dialog" },
  { story: "ng-drawer--full", open: { kind: "none" }, ready: ".u-drawer" },
  {
    story: "ng-galleria--full-screen",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-galleria-mask",
  },
  {
    story: "ng-image--with-preview",
    open: { kind: "click", target: ".u-image-preview-mask" },
    ready: ".u-image-mask",
  },
  {
    story: "ng-confirmpopup--default",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-confirmpopup",
  },
  {
    story: "ng-contextmenu--global",
    open: { kind: "rclick", target: "body" },
    ready: ".u-contextmenu",
  },
  {
    story: "ng-popover--default",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-popover",
  },
  {
    story: "ng-menu--popup",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-menu",
  },
  {
    story: "ng-tooltip--default",
    open: { kind: "hover", target: "#storybook-root button" },
    ready: ".u-tooltip",
  },
  { story: "ng-knob--default", open: { kind: "none" }, ready: ".u-knob" },
  { story: "ng-avatar--image", open: { kind: "none" }, ready: ".u-avatar" },
  { story: "ng-floatlabel--default", open: { kind: "none" }, ready: ".u-float-label" },
  { story: "ng-iftalabel--default", open: { kind: "none" }, ready: ".u-ifta-label" },
  { story: "ng-imagecompare--default", open: { kind: "none" }, ready: ".u-image-compare" },
];

/** Unclassed descendants targeted by component CSS (Plan Task 6 inventory). */
const UNCLASSED = [
  ".u-image-toolbar > button",
  ".u-organization-chart-node-content > button",
  ".u-knob svg",
  ".u-image-compare > span",
  ".u-image-compare img",
  ".u-confirmpopup-footer button",
  ".u-float-label label",
  ".u-ifta-label label",
  ".u-avatar img",
  ".u-galleria-close-button svg",
  ".u-menu ul",
  ".u-input-chips-input-item input",
];

async function open(page: Page, action: Open): Promise<void> {
  if (action.kind === "none") return;
  if (action.kind === "scroll") {
    // Scroll only once the story has mounted its scroll listener.
    await expect(page.locator("#storybook-root p").first()).toBeVisible();
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        return page.locator(".u-button").count();
      })
      .toBeGreaterThan(0);
    return;
  }
  const target = page.locator(action.target).first();
  if (action.kind === "click") await target.click();
  else if (action.kind === "rclick") await target.click({ button: "right" });
  else if (action.kind === "hover") await target.hover();
  else {
    await target.focus();
    await target.pressSequentially(action.text, { delay: 50 });
  }
}

async function contentBoxElements(page: Page): Promise<string[]> {
  return page.evaluate((unclassed) => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}.${Array.from(el.classList).join(".")}`;
    const owned = Array.from(document.querySelectorAll("[class]")).filter(
      (el) =>
        el !== document.documentElement &&
        el !== document.body &&
        Array.from(el.classList).some((name) => name.startsWith("u-"))
    );
    const targeted = unclassed.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    );
    return [...new Set([...owned, ...targeted])]
      .filter((el) => getComputedStyle(el).boxSizing !== "border-box")
      .map(describe);
  }, UNCLASSED);
}

for (const { story, open: action, ready } of CASES) {
  test(`Ng box model ${story}`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator("#storybook-root")).toBeAttached();
    await open(page, action);
    // Opened overlays must be visible; static stories only need to be rendered.
    if (action.kind === "none") await expect(page.locator(ready).first()).toBeAttached();
    else await expect(page.locator(ready).first()).toBeVisible();
    expect(await contentBoxElements(page)).toEqual([]);
  });
}

test("Ng box model projected content inside a Dialog", async ({ page }) => {
  await page.goto(storyUrl("ng-dialog--open"));
  const dialog = page.locator(".u-dialog").first();
  await expect(dialog).toBeVisible();
  const projected = await dialog.evaluate((root) => {
    const probe = document.createElement("div");
    probe.style.cssText = "width: 100px; padding: 10px; border: 1px solid";
    root.querySelector(".u-dialog-content")?.appendChild(probe);
    const result = { boxSizing: getComputedStyle(probe).boxSizing, width: probe.offsetWidth };
    probe.remove();
    return result;
  });
  expect(projected).toEqual({ boxSizing: "border-box", width: 100 });
});
