import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-D (Spec §9.2–§9.5): screenshots at rest and in open states,
 * layout/computed-style checks (F-D1..F-D3, X-3b) and accessibility scans.
 * Baselines are recorded in Linux Docker before any CSS change (Plan Task 3).
 * Tests that fail before the port (F-D1..F-D3) are before-state evidence; only
 * after-port results are acceptance criteria. All evidence runs use --retries=0.
 */
const FW = "vue";
const T = "Vue";
const TRIGGER = "#storybook-root button";
const SB_MAIN = ".u-splitbutton-button.u-button";
const SB_DROPDOWN = ".u-splitbutton-dropdown.u-button";
const WRAPPER = ""; // no wrapper in Vue (D-D7 is Angular only)
const DRAWER: Record<"left" | "right" | "top" | "bottom" | "full" | "rtl", string> = {
  left: "vue-drawer--default",
  right: "vue-drawer--right-position",
  top: "vue-drawer--top",
  bottom: "vue-drawer--bottom",
  full: "vue-drawer--full",
  rtl: "vue-drawer--rtl",
};
const DRAWER_OPEN: Kind = "click"; // the Vue drawer stories open by click
/** Before the port the SpeedDial trigger is covered by its list (F-D1); Task 3 records before-state with a dispatched click. */
const DISPATCH = process.env.G3D_DISPATCH === "1";

type Kind = "rest" | "none" | "click" | "speeddial";

const STORIES: ReadonlyArray<{ name: string; story: string; ready: string; kind: Kind }> = [
  {
    name: "ConfirmDialog Default",
    story: "vue-confirmdialog--default",
    ready: ".u-dialog",
    kind: "click",
  },
  {
    name: "ConfirmDialog WithIcon",
    story: "vue-confirmdialog--with-icon",
    ready: ".u-dialog",
    kind: "click",
  },
  {
    name: "ConfirmPopup Default",
    story: "vue-confirmpopup--default",
    ready: ".u-confirmpopup",
    kind: "click",
  },
  {
    name: "ConfirmPopup WithIcon",
    story: "vue-confirmpopup--with-icon",
    ready: ".u-confirmpopup",
    kind: "click",
  },
  { name: "Drawer Left", story: "vue-drawer--default", ready: ".u-drawer", kind: DRAWER_OPEN },
  {
    name: "Drawer Right",
    story: "vue-drawer--right-position",
    ready: ".u-drawer",
    kind: DRAWER_OPEN,
  },
  { name: "Drawer Top", story: "vue-drawer--top", ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Bottom", story: "vue-drawer--bottom", ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Full", story: "vue-drawer--full", ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Rtl", story: "vue-drawer--rtl", ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Popover Default", story: "vue-popover--default", ready: ".u-popover", kind: "click" },
  {
    name: "Popover NonDismissable",
    story: "vue-popover--non-dismissable",
    ready: ".u-popover",
    kind: "click",
  },
  {
    name: "SplitButton Default",
    story: "vue-splitbutton--default",
    ready: ".u-splitbutton",
    kind: "rest",
  },
  {
    name: "SplitButton Disabled",
    story: "vue-splitbutton--disabled",
    ready: ".u-splitbutton",
    kind: "rest",
  },
  {
    name: "SpeedDial Default",
    story: "vue-speeddial--default",
    ready: ".u-speeddial",
    kind: "speeddial",
  },
  {
    name: "SpeedDial Directions",
    story: "vue-speeddial--directions",
    ready: ".u-speeddial",
    kind: "speeddial",
  },
  {
    name: "SpeedDial Mask",
    story: "vue-speeddial--mask",
    ready: ".u-speeddial-mask",
    kind: "speeddial",
  },
];

async function go(page: Page, story: string) {
  await page.goto(storyUrl(story));
  await page.mouse.move(0, 0); // X-6: no pointer residue
}

async function nonZero(l: Locator) {
  await expect(l).toBeVisible();
  const b = await l.boundingBox();
  expect(b !== null && b.width > 0 && b.height > 0, "non-zero box").toBe(true);
}

/** Opens a state through its real trigger and waits for visibility and settled values (X-6). */
export async function state(page: Page, kind: Kind, ready: string) {
  if (kind === "click") {
    await page.locator(TRIGGER).first().click();
    await page.mouse.move(0, 0);
  } else if (kind === "speeddial") {
    const triggers = page.locator(".u-speeddial-button:not(:disabled)");
    await expect(triggers.first()).toBeAttached();
    for (let i = 0; i < (await triggers.count()); i++) {
      const t = triggers.nth(i);
      if (DISPATCH) await t.dispatchEvent("click");
      else await t.click();
      await expect(t).toHaveClass(/u-speeddial-open/);
    }
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        page
          .locator(
            ".u-speeddial-button.u-speeddial-open + .u-speeddial-list .u-speeddial-item:not(.u-speeddial-item-hidden)"
          )
          .first()
          .evaluate((el) => getComputedStyle(el).opacity)
      )
      .toBe("1");
  }
  await nonZero(page.locator(ready).first());
}

for (const { name, story, ready, kind } of STORIES) {
  test(`${T}/${name} G3-D accessibility`, async ({ page }, testInfo) => {
    await go(page, story);
    await state(page, kind, ready);
    await runAccessibilityScan(page, testInfo, story);
  });
}

/** Spec §9.2 screenshot matrix. `shot` scopes the capture (OI-D4); "page" captures the viewport. */
const VISUAL: ReadonlyArray<{ name: string; story: string; kind: Kind; shot: string }> = [
  {
    name: "SplitButton Default rest",
    story: `${FW}-splitbutton--default`,
    kind: "rest",
    shot: "page",
  },
  {
    name: "SplitButton Disabled rest",
    story: `${FW}-splitbutton--disabled`,
    kind: "rest",
    shot: "page",
  },
  { name: "SpeedDial Default rest", story: `${FW}-speeddial--default`, kind: "rest", shot: "page" },
  {
    name: "SpeedDial Directions rest",
    story: `${FW}-speeddial--directions`,
    kind: "rest",
    shot: "page",
  },
  { name: "Popover Default open", story: `${FW}-popover--default`, kind: "click", shot: "page" },
  {
    name: "ConfirmPopup Default open",
    story: `${FW}-confirmpopup--default`,
    kind: "click",
    shot: "page",
  },
  {
    name: "ConfirmPopup WithIcon open",
    story: `${FW}-confirmpopup--with-icon`,
    kind: "click",
    shot: "page",
  },
  {
    name: "ConfirmDialog Default open",
    story: `${FW}-confirmdialog--default`,
    kind: "click",
    shot: ".u-dialog",
  },
  {
    name: "ConfirmDialog WithIcon open",
    story: `${FW}-confirmdialog--with-icon`,
    kind: "click",
    shot: ".u-dialog",
  },
  { name: "Drawer Left open", story: DRAWER.left, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Right open", story: DRAWER.right, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Top open", story: DRAWER.top, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Bottom open", story: DRAWER.bottom, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Full open", story: DRAWER.full, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Rtl open", story: DRAWER.rtl, kind: DRAWER_OPEN, shot: ".u-drawer" },
  {
    name: "SpeedDial Default open",
    story: `${FW}-speeddial--default`,
    kind: "speeddial",
    shot: "page",
  },
  {
    name: "SpeedDial Directions open",
    story: `${FW}-speeddial--directions`,
    kind: "speeddial",
    shot: "page",
  },
  { name: "SpeedDial Mask open", story: `${FW}-speeddial--mask`, kind: "speeddial", shot: "page" },
];
for (const v of VISUAL) {
  const tag = v.kind === "rest" ? "visual" : "open";
  test(`${T}/${v.name} G3-D ${tag}`, async ({ page }) => {
    await go(page, v.story);
    const ready = v.shot === "page" ? "#storybook-root" : v.shot;
    await state(page, v.kind, v.kind === "rest" ? "#storybook-root" : ready);
    if (v.shot === "page") await expect(page).toHaveScreenshot();
    else await expect(page.locator(v.shot).first()).toHaveScreenshot();
  });
}

/**
 * The computed value of `property` when set to `value` (a `--variable` or a length) on a probe element.
 * A `--variable` must be defined on the root, so an unregistered token cannot pass by both sides
 * falling back to the property's initial value.
 */
async function resolved(page: Page, value: string, property: string): Promise<string> {
  if (value.startsWith("--")) {
    // Polled: the theme variables are injected when the component mounts, after navigation.
    await expect
      .poll(
        () =>
          page.evaluate(
            (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(),
            value
          ),
        { message: `${value} is defined` }
      )
      .not.toBe("");
  }
  return page.evaluate(
    ([v, p]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, v.startsWith("--") ? `var(${v})` : v);
      document.body.appendChild(probe);
      const out = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return out;
    },
    [value, property] as const
  );
}
const css = (l: Locator, p: string) =>
  l.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), p);
async function box(l: Locator) {
  const b = await l.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

for (const o of [
  { name: "Popover", story: `${FW}-popover--default`, root: ".u-popover", key: "popover" },
  {
    name: "ConfirmPopup",
    story: `${FW}-confirmpopup--with-icon`,
    root: ".u-confirmpopup",
    key: "confirmpopup",
  },
] as const)
  test(`${T}/${o.name} container tokens and anchoring G3-D layout`, async ({ page }) => {
    await go(page, o.story);
    const trigger = page.locator(TRIGGER).first();
    await state(page, "click", o.root);
    const root = page.locator(o.root);
    const k = `--u-${o.key}`;
    expect(await css(root, "background-color")).toBe(
      await resolved(page, `${k}-background`, "background-color")
    );
    expect(await css(root, "border-top-color")).toBe(
      await resolved(page, `${k}-border-color`, "border-top-color")
    );
    expect(await css(root, "border-top-left-radius")).toBe(
      await resolved(page, `${k}-border-radius`, "border-top-left-radius")
    );
    expect(await css(root, "box-shadow")).toBe(await resolved(page, `${k}-shadow`, "box-shadow"));
    const gutter = await resolved(page, `${k}-gutter`, "margin-top");
    expect(await css(root, "margin-top")).toBe(gutter);
    const t = await box(trigger);
    const r = await box(root);
    expect(Math.abs(r.x - t.x), "left edges aligned (D-0)").toBeLessThanOrEqual(1);
    expect(
      Math.abs(r.y - (t.y + t.height + Number.parseFloat(gutter))),
      "below the trigger by the gutter"
    ).toBeLessThanOrEqual(1);
    if (o.key === "confirmpopup") {
      const icon = page.locator(".u-confirmpopup-icon");
      expect(await css(icon, "font-size")).toBe(
        await resolved(page, `${k}-icon-size`, "font-size")
      );
      expect(await css(icon, "color")).toBe(await resolved(page, `${k}-icon-color`, "color"));
    }
  });

test(`${T}/ConfirmDialog content layout (F-D2) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-confirmdialog--with-icon`);
  await state(page, "click", ".u-dialog");
  const content = page.locator(".u-dialog-content:has(> .u-confirmdialog-message)");
  await expect(content).toHaveCount(1);
  expect(await css(content, "display")).toBe("flex");
  expect(await css(content, "align-items")).toBe("center");
  expect(await css(content, "column-gap")).toBe(
    await resolved(page, "--u-confirmdialog-content-gap", "column-gap")
  );
  const icon = page.locator(".u-confirmdialog-icon");
  expect(await css(icon, "font-size")).toBe(
    await resolved(page, "--u-confirmdialog-icon-size", "font-size")
  );
  expect(await css(icon, "color")).toBe(
    await resolved(page, "--u-confirmdialog-icon-color", "color")
  );
});

for (const [pos, prop, value] of [
  ["left", "width", "20rem"],
  ["right", "width", "20rem"],
  ["top", "height", "10rem"],
  ["bottom", "height", "10rem"],
] as const)
  test(`${T}/Drawer ${pos} size, tokens and placement G3-D layout`, async ({ page }) => {
    await go(page, DRAWER[pos]);
    await state(page, DRAWER_OPEN, ".u-drawer");
    const drawer = page.locator(".u-drawer");
    expect(await css(drawer, prop)).toBe(await resolved(page, value, prop));
    expect(await css(drawer, "background-color")).toBe(
      await resolved(page, "--u-drawer-background", "background-color")
    );
    expect(await css(drawer, "border-top-color")).toBe(
      await resolved(page, "--u-drawer-border-color", "border-top-color")
    );
    expect(await css(page.locator(".u-drawer-header"), "padding-top")).toBe(
      await resolved(page, "--u-drawer-header-padding", "padding-top")
    );
    const vp = page.viewportSize()!;
    const b = await box(drawer);
    if (pos === "right") expect(Math.abs(b.x + b.width - vp.width)).toBeLessThanOrEqual(1);
    if (pos === "bottom") expect(Math.abs(b.y + b.height - vp.height)).toBeLessThanOrEqual(1);
    if (WRAPPER) {
      // F-D3 / G-D3 (Angular): the focus-trap wrapper fills the drawer. The wrapper rule
      // (`flex: 1 1 auto` in the drawer's flex column, D-D7) governs the drawer's inner box, so the
      // reference is `clientHeight`; the border box also holds the drawer's ported borders.
      const w = await box(page.locator(WRAPPER));
      const inner = await drawer.evaluate((el) => el.clientHeight);
      expect(w.height, "wrapper fills the drawer").toBeGreaterThanOrEqual(inner - 1);
    }
  });

test(`${T}/Drawer full and RTL G3-D layout`, async ({ page }) => {
  await go(page, DRAWER.full);
  await state(page, DRAWER_OPEN, ".u-drawer");
  const vp = page.viewportSize()!;
  const b = await box(page.locator(".u-drawer"));
  expect(Math.abs(b.width - vp.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(b.height - vp.height)).toBeLessThanOrEqual(1);
  await go(page, DRAWER.rtl);
  await state(page, DRAWER_OPEN, ".u-drawer");
  expect(await page.evaluate(() => document.documentElement.dir)).toBe("rtl");
  expect(await css(page.locator(".u-drawer-mask"), "flex-direction")).toBe("row-reverse"); // group 23
});

test(`${T}/SplitButton seams, radius and focus G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-splitbutton--default`);
  await nonZero(page.locator(".u-splitbutton"));
  const main = page.locator(SB_MAIN);
  const dropdown = page.locator(SB_DROPDOWN);
  expect(await css(page.locator(".u-splitbutton"), "border-top-left-radius")).toBe(
    await resolved(page, "--u-splitbutton-border-radius", "border-top-left-radius")
  );
  expect(await css(main, "border-top-right-radius")).toBe("0px");
  expect(await css(main, "border-bottom-right-radius")).toBe("0px");
  expect(await css(main, "border-right-width")).toBe("0px");
  expect(await css(dropdown, "border-top-left-radius")).toBe("0px");
  expect(await css(dropdown, "border-bottom-left-radius")).toBe("0px");
  await page.keyboard.press("Tab");
  await expect(main).toBeFocused();
  expect(await css(main, "z-index")).toBe("1"); // group 3
});

const items = (root: Locator) => root.locator(".u-speeddial-item:not(.u-speeddial-item-hidden)");

test(`${T}/SpeedDial closed, opened and closed by a real click (F-D1, G-D2) G3-D layout`, async ({
  page,
}) => {
  await go(page, `${FW}-speeddial--default`);
  const root = page.locator(".u-speeddial").first();
  await expect(root).toBeAttached();
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("0");
  expect(await css(root.locator(".u-speeddial-list"), "pointer-events")).toBe("none");
  await root.locator(".u-speeddial-button").click(); // real pointer (G-D2)
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("1");
  expect(await css(root.locator(".u-speeddial-list"), "pointer-events")).toBe("auto");
  await root.locator(".u-speeddial-button").click();
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("0");
});

test(`${T}/SpeedDial directions and gap (R-3) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-speeddial--directions`);
  for (const dir of ["up", "down", "left", "right"] as const) {
    const root = page
      .locator(`.u-speeddial-direction-${dir}`)
      .filter({ has: page.locator(".u-speeddial-button:not(:disabled)") })
      .first();
    await root.locator(".u-speeddial-button").click();
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        items(root)
          .first()
          .evaluate((el) => getComputedStyle(el).opacity)
      )
      .toBe("1");
    const t = await box(root.locator(".u-speeddial-button"));
    const l = await box(root.locator(".u-speeddial-list"));
    if (dir === "up") expect(l.y + l.height).toBeLessThanOrEqual(t.y + 1);
    if (dir === "down") expect(l.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
    if (dir === "left") expect(l.x + l.width).toBeLessThanOrEqual(t.x + 1);
    if (dir === "right") expect(l.x).toBeGreaterThanOrEqual(t.x + t.width - 1);
    const axis = dir === "up" || dir === "down" ? "row-gap" : "column-gap";
    expect(await css(root, axis)).toBe(await resolved(page, "--u-speeddial-gap", axis));
  }
});

test(`${T}/SpeedDial mask (B-2 + group 7) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-speeddial--mask`);
  await state(page, "speeddial", ".u-speeddial-mask");
  const mask = page.locator(".u-speeddial-mask");
  expect(await css(mask, "background-color")).toBe(
    await resolved(page, "--u-mask-background", "background-color")
  );
  expect(await css(mask, "position")).toBe("absolute");
});

test(`${T}/SpeedDial disabled appearance and guards G3-D x3b`, async ({ page }) => {
  await go(page, `${FW}-speeddial--directions`);
  const opacity = await resolved(page, "--u-disabled-opacity", "opacity");
  // Disabled trigger: appearance, then interaction separately.
  const dTrigger = page.locator(".u-speeddial-button:disabled");
  await expect(dTrigger).toHaveCount(1);
  expect(await css(dTrigger, "opacity")).toBe(opacity);
  expect(await css(dTrigger, "pointer-events")).toBe("none");
  await dTrigger.click({ force: true });
  await expect(dTrigger).toHaveAttribute("aria-expanded", "false");
  // Disabled action in an open dial.
  const up = page
    .locator(".u-speeddial-direction-up")
    .filter({ has: page.locator(".u-speeddial-button:not(:disabled)") })
    .first();
  await up.locator(".u-speeddial-button").click();
  await page.mouse.move(0, 0);
  const dAction = up.locator(".u-speeddial-action:disabled");
  await expect(dAction).toHaveCount(1);
  // X-6: the open transition has settled before the action is measured or clicked.
  await expect
    .poll(() =>
      dAction.evaluate((el) => getComputedStyle(el.closest(".u-speeddial-item")!).opacity)
    )
    .toBe("1");
  await expect.poll(() => dAction.evaluate((el) => getComputedStyle(el).opacity)).toBe(opacity);
  expect(await css(dAction, "pointer-events")).toBe("none");
  await dAction.click({ force: true });
  expect(await page.evaluate(() => document.body.dataset.g3dCommand ?? null)).toBeNull();
  await expect(dAction).toBeDisabled(); // not keyboard-activatable
  // Sanity: an enabled action does run its command.
  await up.locator('.u-speeddial-action[aria-label="Edit"]').click();
  expect(await page.evaluate(() => document.body.dataset.g3dCommand ?? null)).toBe("Edit");
});

const ATTR = FW === "ng" ? "data-u-ng-style" : "data-u-style";
/** ADR-052 X-1: every emitted selector part must match the rendered DOM in a declared story and state. */
const REACH: ReadonlyArray<{ key: string; runs: ReadonlyArray<readonly [string, Kind, string]> }> =
  [
    { key: "confirmdialog", runs: [[`${FW}-confirmdialog--with-icon`, "click", ".u-dialog"]] },
    { key: "confirmpopup", runs: [[`${FW}-confirmpopup--with-icon`, "click", ".u-confirmpopup"]] },
    {
      key: "drawer",
      runs: [
        ...(["left", "right", "top", "bottom", "full", "rtl"] as const).map(
          (p) => [DRAWER[p], DRAWER_OPEN, ".u-drawer"] as const
        ),
        // Vue renders `.u-drawer-footer` only with a footer slot (reach-only story, no screenshot).
        ["vue-drawer--with-footer", DRAWER_OPEN, ".u-drawer"] as const,
      ],
    },
    { key: "popover", runs: [[`${FW}-popover--default`, "click", ".u-popover"]] },
    {
      key: "splitbutton",
      runs: [
        [`${FW}-splitbutton--default`, "rest", ".u-splitbutton"],
        [`${FW}-splitbutton--disabled`, "rest", ".u-splitbutton"],
      ],
    },
    {
      key: "speeddial",
      runs: [
        [`${FW}-speeddial--directions`, "speeddial", ".u-speeddial"],
        [`${FW}-speeddial--mask`, "speeddial", ".u-speeddial-mask"],
      ],
    },
  ];
/** ADR-052 X-1 class K: emitted by a cited source under a state no story exercises (none expected). */
const K: Record<string, Record<string, string>> = {};
const STATE =
  /::?(before|after|-webkit-[a-z-]+)\b|:(hover|focus-visible|focus|active|dir\([a-z]+\))/g;

for (const r of REACH) {
  test(`${T}/${r.key} selector reach G3-D reach`, async ({ page }) => {
    const hit = new Map<string, string>();
    let parts: string[] = [];
    for (const [story, kind, ready] of r.runs) {
      await go(page, story);
      await state(page, kind, ready);
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
