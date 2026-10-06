import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-C2 (Spec §9.2–§9.5): screenshots at rest and in open states,
 * layout/computed-style checks (F-3a, F-3b, X-3b) and accessibility scans for
 * the menu stories. Baselines are recorded in Linux Docker before any CSS
 * change (Plan Task 2). Tests that fail before the port because a state is
 * unreachable or invisible (F-3a, F-3b) are before-state evidence; only
 * after-port results are acceptance criteria. All evidence runs use --retries=0.
 */
const FW = "vue";
const HOST: Record<string, string> = {};

const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "TieredMenu Default", story: "vue-tieredmenu--default", ready: ".u-tieredmenu" },
  { name: "TieredMenu ItemStates", story: "vue-tieredmenu--item-states", ready: ".u-tieredmenu" },
  { name: "Menubar Default", story: "vue-menubar--default", ready: ".u-menubar" },
  { name: "Menubar ItemStates", story: "vue-menubar--item-states", ready: ".u-menubar" },
  { name: "MegaMenu Default", story: "vue-megamenu--default", ready: ".u-megamenu" },
  { name: "MegaMenu ItemStates", story: "vue-megamenu--item-states", ready: ".u-megamenu" },
  { name: "PanelMenu Default", story: "vue-panelmenu--default", ready: ".u-panelmenu" },
  { name: "PanelMenu Multiple", story: "vue-panelmenu--multiple", ready: ".u-panelmenu" },
  { name: "PanelMenu ItemStates", story: "vue-panelmenu--item-states", ready: ".u-panelmenu" },
];

async function go(page: Page, story: string) {
  await page.goto(storyUrl(story));
  await page.mouse.move(0, 0); // X-6: no pointer residue
}

const submenuOf = (key: string, open: string) =>
  [
    `${open} > .u-${key}-submenu`,
    HOST[key] ? `${open} > ${HOST[key]} > .u-${key}-submenu` : "",
    `${open} > .u-${key}-overlay`,
  ]
    .filter(Boolean)
    .join(", ");

/** Opens a state through its real trigger and waits for the state class and visibility (X-6). */
export async function scenario(
  page: Page,
  key: string,
  name: "rest" | "openL1" | "openL2" | "contextOpen" | "contextHover" | "expanded"
) {
  if (name === "rest") return;
  if (name === "openL1" || name === "openL2") {
    const root = page
      .locator(
        `.u-${key}-root-list > .u-${key}-item:not(.u-${key}-item-disabled):has(.u-${key}-submenu, .u-${key}-overlay) > .u-${key}-item-content`
      )
      .first();
    await root.hover();
    await expect(page.locator(submenuOf(key, `.u-${key}-item-open`)).first()).toBeVisible();
    if (name === "openL2") {
      const nested = page
        .locator(
          `.u-${key}-item-open .u-${key}-submenu .u-${key}-item:not(.u-${key}-item-disabled):has(.u-${key}-submenu) > .u-${key}-item-content`
        )
        .first();
      await nested.hover();
      await expect(page.locator(`.u-${key}-item-open`)).toHaveCount(2);
      await expect(
        page.locator(submenuOf(key, `.u-${key}-item-open .u-${key}-item-open`)).first()
      ).toBeVisible();
    }
    return;
  }
  if (name === "contextOpen" || name === "contextHover") {
    const host = await page.locator("#storybook-root div[style*='dashed']").boundingBox();
    expect(host, "context-menu trigger box").not.toBeNull();
    await page.mouse.click(Math.round(host!.x + 40), Math.round(host!.y + 30), { button: "right" });
    await expect(page.locator(".u-contextmenu")).toBeVisible();
    if (name === "contextHover") {
      await page
        .locator(
          ".u-contextmenu-item:not(.u-contextmenu-item-disabled) > .u-contextmenu-item-content"
        )
        .first()
        .hover();
      await expect(page.locator(".u-contextmenu-item-focused")).toHaveCount(1);
    }
    return;
  }
  // expanded: PanelMenu, expand every enabled collapsed header that has children, level by level.
  const expanded = page.locator(".u-panelmenu-item-expanded");
  await expect(page.locator(".u-panelmenu-header-link").first()).toBeVisible(); // story mounted
  for (let round = 0; round < 4; round++) {
    const closed = page.locator(
      ".u-panelmenu-item:not(.u-panelmenu-item-expanded):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-submenu-icon) .u-panelmenu-header-link"
    );
    const n = await closed.count();
    if (n === 0) break;
    const before = await expanded.count();
    await closed.first().click();
    await expect(expanded).toHaveCount(before + 1); // wait for the expansion before re-reading
  }
  await expect(expanded.first()).toBeVisible();
}

for (const { name, story, ready } of STORIES) {
  test(`Vue/${name} G3-C2 visual`, async ({ page }) => {
    await go(page, story);
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Vue/${name} G3-C2 accessibility`, async ({ page }, testInfo) => {
    await go(page, story);
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

const OPEN: ReadonlyArray<{
  name: string;
  story: string;
  key: string;
  state: Parameters<typeof scenario>[2];
}> = [
  {
    name: "TieredMenu ItemStates open L1",
    story: "vue-tieredmenu--item-states",
    key: "tieredmenu",
    state: "openL1",
  },
  {
    name: "TieredMenu ItemStates open L2",
    story: "vue-tieredmenu--item-states",
    key: "tieredmenu",
    state: "openL2",
  },
  {
    name: "Menubar ItemStates open L1",
    story: "vue-menubar--item-states",
    key: "menubar",
    state: "openL1",
  },
  {
    name: "Menubar ItemStates open L2",
    story: "vue-menubar--item-states",
    key: "menubar",
    state: "openL2",
  },
  {
    name: "MegaMenu ItemStates open",
    story: "vue-megamenu--item-states",
    key: "megamenu",
    state: "openL1",
  },
  {
    name: "ContextMenu ItemStates open",
    story: "vue-contextmenu--item-states",
    key: "contextmenu",
    state: "contextOpen",
  },
  {
    name: "PanelMenu ItemStates expanded",
    story: "vue-panelmenu--item-states",
    key: "panelmenu",
    state: "expanded",
  },
];
for (const o of OPEN) {
  test(`Vue/${o.name} G3-C2 open`, async ({ page }) => {
    await go(page, o.story);
    await scenario(page, o.key, o.state);
    await expect(page).toHaveScreenshot();
  });
}

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
const css = (l: Locator, p: string) =>
  l.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), p);
async function box(l: Locator) {
  const b = await l.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

test("Vue/TieredMenu visibility and nested placement G3-C2 layout", async ({ page }) => {
  await go(page, "vue-tieredmenu--item-states");
  const firstSub = page
    .locator(".u-tieredmenu-root-list > .u-tieredmenu-item")
    .first()
    .locator(".u-tieredmenu-submenu")
    .first();
  expect(await css(firstSub, "display")).toBe("none");
  await scenario(page, "tieredmenu", "openL2");
  const open = page.locator(submenuOf("tieredmenu", ".u-tieredmenu-item-open")).first();
  expect(await css(open, "display")).toBe("flex");
  expect(await css(open, "flex-direction")).toBe("column");
  const parent = page.locator(".u-tieredmenu-item-open .u-tieredmenu-item-open").first();
  const nested = page
    .locator(submenuOf("tieredmenu", ".u-tieredmenu-item-open .u-tieredmenu-item-open"))
    .first();
  const p = await box(parent);
  const n = await box(nested);
  expect(Math.abs(n.x - (p.x + p.width))).toBeLessThanOrEqual(1); // inset-inline-start: 100% (LTR)
  const content = page.locator(".u-tieredmenu-item-open > .u-tieredmenu-item-content").first();
  await expect
    .poll(() => css(content, "background-color"))
    .toBe(await resolved(page, "--u-tieredmenu-item-active-background", "background-color"));
});

test("Vue/Menubar open submenus (F-3b) G3-C2 layout", async ({ page }) => {
  await go(page, "vue-menubar--item-states");
  await scenario(page, "menubar", "openL2");
  const first = page
    .locator(submenuOf("menubar", ".u-menubar-root-list > .u-menubar-item-open"))
    .first();
  expect(await css(first, "display")).toBe("flex");
  const fb = await box(first);
  expect(fb.width).toBeGreaterThan(0);
  expect(fb.height).toBeGreaterThan(0);
  const parent = page.locator(".u-menubar-item-open .u-menubar-item-open").first();
  const nested = page
    .locator(submenuOf("menubar", ".u-menubar-item-open .u-menubar-item-open"))
    .first();
  expect(await css(nested, "display")).toBe("flex");
  const p = await box(parent);
  const n = await box(nested);
  expect(Math.abs(n.x - (p.x + p.width))).toBeLessThanOrEqual(1); // group 25 left: 100%
  expect(Math.abs(n.y - p.y)).toBeLessThanOrEqual(1); // group 25 top: 0
});

test("Vue/MegaMenu overlay visibility G3-C2 layout", async ({ page }) => {
  await go(page, "vue-megamenu--item-states");
  expect(await css(page.locator(".u-megamenu-overlay").first(), "display")).toBe("none");
  await scenario(page, "megamenu", "openL1");
  expect(
    await css(page.locator(".u-megamenu-item-open > .u-megamenu-overlay").first(), "display")
  ).toBe("block");
});

test("Vue/ContextMenu focus and separator G3-C2 layout", async ({ page }) => {
  await go(page, "vue-contextmenu--item-states");
  await scenario(page, "contextmenu", "contextHover");
  const content = page.locator(".u-contextmenu-item-focused > .u-contextmenu-item-content");
  await expect
    .poll(() => css(content, "background-color"))
    .toBe(await resolved(page, "--u-contextmenu-item-focus-background", "background-color"));
  const sep = page.locator(".u-contextmenu-separator").first();
  expect(await css(sep, "border-top-color")).toBe(
    await resolved(page, "--u-contextmenu-separator-border-color", "border-top-color")
  );
});

test("Vue/PanelMenu render, expand and collapse (F-3a, Spec §18 A1) G3-C2 layout", async ({
  page,
}) => {
  await go(page, "vue-panelmenu--item-states");
  const root = await box(page.locator(".u-panelmenu"));
  expect(root.height).toBeGreaterThan(0); // F-3a: the root list renders
  const itemLabelled = (label: string) =>
    page
      .locator(".u-panelmenu-item", {
        has: page.locator(":scope > .u-panelmenu-header-content .u-panelmenu-header-label", {
          hasText: new RegExp(`^${label}$`),
        }),
      })
      .first();
  const childList = (item: Locator) => item.locator(":scope > .u-panelmenu-submenu");
  const header = (item: Locator) =>
    item.locator(":scope > .u-panelmenu-header-content .u-panelmenu-header-link");
  const files = itemLabelled("Files");
  await expect(childList(files)).toHaveCount(0); // collapsed: not rendered (no CSS hide is asserted)
  await header(files).click();
  await expect(childList(files)).toBeVisible(); // expanded: rendered and visible
  expect(await css(childList(files), "display")).toBe("grid"); // group 28 (top-level content container)
  const docs = itemLabelled("Documents");
  await header(docs).click();
  await expect(childList(docs)).toBeVisible();
  expect(await css(childList(docs), "padding-left")).toBe(
    await resolved(page, "--u-panelmenu-submenu-indent", "padding-left")
  );
  await header(files).click();
  await expect(childList(files)).toHaveCount(0); // collapsing removes the nested list from the DOM
});

const X3B: ReadonlyArray<{
  key: string;
  story: string;
  disabledParent?: string;
  disabledLeaf?: string;
}> = [
  {
    key: "tieredmenu",
    story: "vue-tieredmenu--item-states",
    disabledParent: "Edit",
    disabledLeaf: "Archived",
  },
  {
    key: "menubar",
    story: "vue-menubar--item-states",
    disabledParent: "Edit",
    disabledLeaf: "Archived",
  },
  {
    key: "megamenu",
    story: "vue-megamenu--item-states",
    disabledParent: "Services",
    disabledLeaf: "Contact",
  },
  { key: "panelmenu", story: "vue-panelmenu--item-states", disabledParent: "Settings" },
];
for (const x of X3B) {
  test(`Vue/${x.key} disabled appearance and guards G3-C2 x3b`, async ({ page }) => {
    await go(page, x.story);
    const item = page
      .locator(`.u-${x.key}-item-disabled`)
      .filter({ hasText: x.disabledParent! })
      .first();
    expect(await css(item, "opacity")).toBe(
      await resolved(page, "--u-disabled-opacity", "opacity")
    );
    expect(await css(item, "pointer-events")).toBe("none");
    const link = item.locator(`.u-${x.key}-item-link, .u-${x.key}-header-link`).first();
    const openClass = x.key === "panelmenu" ? "u-panelmenu-item-expanded" : `u-${x.key}-item-open`;
    // (a) CSS layer: a real pointer click at the link centre.
    const b = await box(link);
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await expect(item).not.toHaveClass(new RegExp(openClass));
    // (b) JS guard, separately: a click event dispatched straight to the link, then Enter on the focused link.
    await link.dispatchEvent("click");
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(item).not.toHaveClass(new RegExp(openClass));
    if (x.disabledLeaf) {
      const leaf = page
        .locator(`.u-${x.key}-item-disabled`)
        .filter({ hasText: x.disabledLeaf })
        .locator(`.u-${x.key}-item-link`)
        .first();
      await leaf.dispatchEvent("click");
      expect(page.url()).not.toMatch(/#(archived|contact)/);
    }
  });
}

test("Vue/ContextMenu disabled item guard G3-C2 x3b", async ({ page }) => {
  await go(page, "vue-contextmenu--item-states");
  await scenario(page, "contextmenu", "contextOpen");
  const item = page.locator(".u-contextmenu-item-disabled").first();
  expect(await css(item, "opacity")).toBe(await resolved(page, "--u-disabled-opacity", "opacity"));
  await item.locator(".u-contextmenu-item-link").dispatchEvent("click");
  await expect(page.locator(".u-contextmenu")).toBeVisible(); // a disabled item never selects/hides
});

const ATTR = FW === "ng" ? "data-u-ng-style" : "data-u-style";
const REACH: ReadonlyArray<{
  key: string;
  runs: ReadonlyArray<[string, Parameters<typeof scenario>[2]]>;
}> = [
  {
    key: "tieredmenu",
    runs: [
      ["tieredmenu--item-states", "rest"],
      ["tieredmenu--item-states", "openL2"],
    ],
  },
  { key: "contextmenu", runs: [["contextmenu--item-states", "contextHover"]] },
  {
    key: "menubar",
    runs: [
      ["menubar--item-states", "rest"],
      ["menubar--item-states", "openL2"],
    ],
  },
  {
    key: "megamenu",
    runs: [
      ["megamenu--item-states", "rest"],
      ["megamenu--item-states", "openL1"],
    ],
  },
  {
    key: "panelmenu",
    runs: [
      ["panelmenu--item-states", "rest"],
      ["panelmenu--item-states", "expanded"],
    ],
  },
];
/** ADR-052 X-1 class K: emitted by a cited source under a state no story exercises. */
const K: Record<string, Record<string, string>> = {
  tieredmenu: {
    ".u-tieredmenu-overlay":
      "tiered-menu-style.ts classes.root: u-tieredmenu-overlay when popup is shown (D-C2-4; computed-style evidence only)",
  },
};
const STATE =
  /::?(before|after|-webkit-[a-z-]+)\b|:(hover|focus-visible|focus|active|dir\([a-z]+\))/g;

for (const r of REACH) {
  test(`${FW === "ng" ? "Ng" : "Vue"}/${r.key} selector reach G3-C2 reach`, async ({ page }) => {
    const hit = new Map<string, string>();
    let parts: string[] = [];
    for (const [story, state] of r.runs) {
      await go(page, `${FW}-${story}`);
      await scenario(page, r.key, state);
      // the "rest" scenario returns immediately, so wait for the story mount and its structural sheet
      await expect(page.locator(`style[${ATTR}="${r.key}"]`)).toBeAttached();
      await expect(page.locator(`.u-${r.key}`).first()).toBeAttached();
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
          return all.map((s) => ({
            s,
            n: document.querySelectorAll(s.replace(new RegExp(re, "g"), "") || "*").length,
          }));
        },
        [r.key, ATTR, STATE.source] as const
      );
      expect(res, `structural sheet for ${r.key}`).not.toBeNull();
      parts = [...new Set([...parts, ...res!.map((x) => x.s)])];
      for (const x of res!) if (x.n > 0 && !hit.has(x.s)) hit.set(x.s, `${story}/${state}`);
    }
    const unreached = parts.filter((s) => !hit.has(s) && !(K[r.key] ?? {})[s]);
    expect(unreached, "selector parts with no R evidence and no K citation").toEqual([]);
    test.info().annotations.push({
      type: "reach",
      description: `${parts.length} parts; R ${hit.size}; K ${parts.filter((s) => (K[r.key] ?? {})[s]).length}`,
    });
  });
}
