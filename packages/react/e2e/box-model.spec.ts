import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-098 (ADR-063, Spec §4.3): with overlays, panels and masks open, every
 * element the component rendered that carries a `u-` class — including parts
 * React renders through a portal or appends to <body> — computes `box-sizing: border-box`, and so do
 * the unclassed descendants component CSS targets. Storybook's own harness
 * elements carry no `u-` class and are not checked; <html> and <body> never are.
 */
type Open =
  | { kind: "none" | "scroll" }
  | { kind: "click" | "rclick" | "hover"; target: string }
  | { kind: "type"; target: string; text: string };

const CASES: ReadonlyArray<{ story: string; open: Open; ready: string }> = [
  {
    story: "react-select--default",
    open: { kind: "click", target: ".u-select" },
    ready: ".u-select-overlay",
  },
  {
    story: "react-multiselect--default",
    open: { kind: "click", target: ".u-multi-select" },
    ready: ".u-multi-select-overlay",
  },
  {
    story: "react-autocomplete--default",
    open: { kind: "type", target: ".u-autocomplete input", text: "an" },
    ready: ".u-autocomplete-option",
  },
  {
    story: "react-cascadeselect--default",
    open: { kind: "click", target: ".u-cascade-select" },
    ready: ".u-cascade-select-overlay",
  },
  {
    story: "react-password--default",
    open: { kind: "type", target: ".u-password input", text: "a" },
    ready: ".u-password-overlay",
  },
  {
    story: "react-datepicker--default",
    open: { kind: "click", target: ".u-date-picker input" },
    ready: ".u-date-picker-panel",
  },
  {
    story: "react-colorpicker--default",
    open: { kind: "click", target: ".u-color-picker-preview" },
    ready: ".u-color-picker-panel",
  },
  { story: "react-dialog--open", open: { kind: "none" }, ready: ".u-dialog" },
  { story: "react-galleria--default", open: { kind: "none" }, ready: ".u-galleria" },
  {
    story: "react-image--with-preview",
    open: { kind: "click", target: ".u-image-preview-mask" },
    ready: ".u-image-mask",
  },
  {
    story: "react-confirmpopup--default",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-confirmpopup",
  },
  {
    story: "react-contextmenu--global",
    open: { kind: "rclick", target: "body" },
    ready: ".u-contextmenu",
  },
  {
    story: "react-popover--default",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-popover",
  },
  { story: "react-menu--default", open: { kind: "none" }, ready: ".u-menu" },
  {
    story: "react-tooltip--default",
    open: { kind: "hover", target: "#storybook-root button" },
    ready: ".u-tooltip",
  },
  { story: "react-scrolltop--default", open: { kind: "scroll" }, ready: ".u-button" },
  { story: "react-knob--default", open: { kind: "none" }, ready: ".u-knob" },
  { story: "react-avatar--image", open: { kind: "none" }, ready: ".u-avatar" },
  { story: "react-floatlabel--default", open: { kind: "none" }, ready: ".u-float-label" },
  { story: "react-inputchips--with-initial-tags", open: { kind: "none" }, ready: ".u-input-chips" },
  {
    story: "panel-organizationchart--default",
    open: { kind: "none" },
    ready: ".u-organization-chart",
  },
  {
    story: "react-drawer--default",
    open: { kind: "click", target: "#storybook-root button" },
    ready: ".u-drawer",
  },
  { story: "react-megamenu--default", open: { kind: "none" }, ready: ".u-megamenu" },
  { story: "react-menubar--default", open: { kind: "none" }, ready: ".u-menubar" },
  {
    story: "react-panelmenu--default",
    open: { kind: "none" },
    ready: ".u-panelmenu-header-action",
  },
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
  test(`React box model ${story}`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator("#storybook-root")).toBeAttached();
    // Opened overlays must be visible; static stories only need to be rendered.
    // The open action is retried: an event sent before the story has attached
    // its listeners (e.g. a global context menu in WebKit) is otherwise lost.
    if (action.kind === "none") await expect(page.locator(ready).first()).toBeAttached();
    else {
      await expect(async () => {
        await open(page, action);
        await expect(page.locator(ready).first()).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 15000 });
    }
    expect(await contentBoxElements(page)).toEqual([]);
  });
}
