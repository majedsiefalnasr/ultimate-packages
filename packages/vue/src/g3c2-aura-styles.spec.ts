import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UTieredMenu } from "./tiered-menu";
import { UContextMenu } from "./context-menu";
import { UMenubar } from "./menubar";
import { UMegaMenu } from "./mega-menu";
import { UPanelMenu } from "./panel-menu";

/**
 * GAP-064 G3-C2 (Spec §9.5 AC1, AC2, AC7 state selectors) for Vue. Assertions
 * use the generated <style data-u-style> elements and the rendered DOM; the
 * registry is reset before every test, as in G3-A/B/C1. The only allowed
 * unresolved reference is menubar.submenu.color (D-G3-5).
 */
const KEY_ATTR = "data-u-style";

type Render = () => VNode;
const TREE = {
  model: [
    {
      label: "File",
      icon: "pi pi-file",
      items: [
        { label: "New" },
        { separator: true },
        { label: "Open", items: [{ label: "Recent" }] },
      ],
    },
    { label: "Edit", disabled: true, items: [{ label: "Undo" }] },
  ],
};
const MEGA = {
  model: [
    { label: "Products", icon: "pi pi-box", items: [[{ label: "A", items: [{ label: "A1" }] }]] },
    { label: "Services", disabled: true, items: [[{ label: "C", items: [{ label: "C1" }] }]] },
  ],
};
const FLAT = {
  model: [{ label: "Copy" }, { separator: true }, { label: "Delete", disabled: true }],
};
const PANEL = {
  model: [
    {
      label: "Files",
      icon: "pi pi-folder",
      items: [{ label: "Docs", items: [{ label: "Work" }] }],
    },
    { label: "Settings", disabled: true, items: [{ label: "Profile" }] },
  ],
};

interface Case {
  name: string;
  node: Render;
  key: string;
  unresolved: string[];
}
const tiered: Render = () => h(UTieredMenu, TREE);
const tieredPopup: Render = () => h(UTieredMenu, { ...TREE, popup: true });
const contextMenu: Render = () => h(UContextMenu, FLAT, () => h("div", "target"));
const menubar: Render = () => h(UMenubar, TREE);
const megamenu: Render = () => h(UMegaMenu, MEGA);
const panelmenu: Render = () => h(UPanelMenu, PANEL);
const CASES: Case[] = [
  { name: "tieredmenu", node: tiered, key: "tieredmenu", unresolved: [] },
  { name: "tieredmenu popup", node: tieredPopup, key: "tieredmenu", unresolved: [] },
  { name: "contextmenu", node: contextMenu, key: "contextmenu", unresolved: [] },
  { name: "menubar", node: menubar, key: "menubar", unresolved: ["--u-menubar-submenu-color"] },
  { name: "megamenu", node: megamenu, key: "megamenu", unresolved: [] },
  { name: "panelmenu", node: panelmenu, key: "panelmenu", unresolved: [] },
];

async function render(node: Render) {
  const wrapper = mount({ render: node });
  await nextTick();
  await nextTick();
  return wrapper.element as HTMLElement;
}

const styles = () =>
  Array.from(document.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (key: string) => styles().filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (key: string) =>
  styles()
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");

function unresolved(key: string): string[] {
  const refs = new Set(Array.from(cssFor(key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1]));
  const all = styles()
    .map((s) => s.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(all.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((n) => !defined.has(n)).sort();
}

/** User-action pseudo-classes cannot be matched in jsdom; the rest of the selector must match. */
const strip = (selector: string) =>
  selector.replace(/:(hover|focus-visible|active)(?![a-z-])/g, "");
/** Indices (document order, root first) of the elements matching `all` that match the stripped selector. */
function matching(root: HTMLElement, all: string, selector: string): number[] {
  const els = [
    ...(root.matches(all) ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(all)),
  ];
  return els.flatMap((el, i) => (el.matches(strip(selector)) ? [i] : []));
}

const hover = (selector: string) => (root: HTMLElement) =>
  root.querySelector(selector)!.dispatchEvent(new MouseEvent("mouseenter"));
const click = (selector: string) => (root: HTMLElement) =>
  (root.querySelector(selector) as HTMLElement).click();
// The ContextMenu trigger is the component's root div (ContextMenu.vue:2); mirrors the Angular helper.
const contextOpen = (root: HTMLElement) =>
  (root.firstElementChild ?? root).dispatchEvent(
    new MouseEvent("contextmenu", { bubbles: true, cancelable: true })
  );

/** `unstyled`: the row proves state-class emission only; no ported D1/D3/D4 selector is required to contain it. */
interface StateRow {
  name: string;
  key: string;
  node: Render;
  act?: (el: HTMLElement) => void;
  /** Second interaction, run after the first act is flushed. */
  then?: (root: HTMLElement) => void;
  inBody?: boolean;
  unstyled?: true;
  all: string;
  selector: string;
  expected: number[];
}
const ROWS: StateRow[] = [
  {
    name: "tieredmenu disabled role (D3)",
    key: "tieredmenu",
    node: tiered,
    all: ".u-tieredmenu-root-list > .u-tieredmenu-item",
    selector: ".u-tieredmenu-item-disabled",
    expected: [1],
  },
  {
    name: "tieredmenu open item (C-1 item-active)",
    key: "tieredmenu",
    node: tiered,
    act: hover(".u-tieredmenu-item"),
    all: ".u-tieredmenu-root-list > .u-tieredmenu-item",
    selector: ".u-tieredmenu-item-open > .u-tieredmenu-item-content",
    expected: [0],
  },
  {
    name: "tieredmenu closed submenus hidden (D4 role 1, F-3b host form)",
    key: "tieredmenu",
    node: tiered,
    all: ".u-tieredmenu-submenu",
    selector: ".u-tieredmenu-item:not(.u-tieredmenu-item-open) > .u-tieredmenu-submenu",
    expected: [0, 1, 2],
  },
  {
    name: "tieredmenu popup overlay (group 21 / D4 role 2, K)",
    key: "tieredmenu",
    node: tieredPopup,
    all: ".u-tieredmenu",
    selector: ".u-tieredmenu-overlay",
    expected: [],
  },
  {
    name: "contextmenu focused item (C-1 p-focus)",
    key: "contextmenu",
    node: contextMenu,
    act: (el) => {
      contextOpen(el);
    },
    then: hover(".u-contextmenu-item-link"),
    inBody: true,
    all: ".u-contextmenu-item",
    selector: ".u-contextmenu-item.u-contextmenu-item-focused > .u-contextmenu-item-content",
    expected: [0],
  },
  {
    name: "contextmenu disabled role (D3)",
    key: "contextmenu",
    node: contextMenu,
    act: (el) => {
      contextOpen(el);
    },
    inBody: true,
    all: ".u-contextmenu-item",
    selector: ".u-contextmenu-item-disabled",
    expected: [1],
  },
  {
    name: "menubar open first level (D4 role 1 host form)",
    key: "menubar",
    node: menubar,
    act: hover(".u-menubar-root-list > .u-menubar-item"),
    all: ".u-menubar-submenu",
    selector: ".u-menubar .u-menubar-item-open > .u-menubar-submenu",
    expected: [0],
  },
  {
    name: "menubar disabled role (D3)",
    key: "menubar",
    node: menubar,
    all: ".u-menubar-root-list > .u-menubar-item",
    selector: ".u-menubar-item-disabled",
    expected: [1],
  },
  {
    name: "megamenu horizontal maps to root (C-5)",
    key: "megamenu",
    node: megamenu,
    all: ".u-megamenu-root-list",
    selector: ".u-megamenu .u-megamenu-root-list",
    expected: [0],
  },
  {
    name: "megamenu open overlay (group 22)",
    key: "megamenu",
    node: megamenu,
    act: hover(".u-megamenu-root-list > .u-megamenu-item"),
    all: ".u-megamenu-overlay",
    selector: ".u-megamenu-root-list > .u-megamenu-item-open > .u-megamenu-overlay",
    expected: [0],
  },
  {
    name: "megamenu disabled role (D3)",
    key: "megamenu",
    node: megamenu,
    all: ".u-megamenu-root-list > .u-megamenu-item",
    selector: ".u-megamenu-item-disabled",
    expected: [1],
  },
  {
    name: "panelmenu expanded item (C-1 expanded state)",
    key: "panelmenu",
    node: panelmenu,
    act: click(".u-panelmenu-header-link"),
    unstyled: true,
    all: ".u-panelmenu-item",
    selector: ".u-panelmenu-item-expanded",
    expected: [0],
  },
  {
    name: "panelmenu disabled role (D3)",
    key: "panelmenu",
    node: panelmenu,
    all: ".u-panelmenu-item",
    selector: ".u-panelmenu-item-disabled",
    expected: [1],
  },
];

describe("GAP-064 G3-C2 — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  // Open ContextMenu overlays teleport to document.body; unmount so they do not leak into the next row.
  enableAutoUnmount(afterEach);
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (AC1)", async () => {
      await render(c.node);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable except the recorded exception (AC2)", async () => {
      await render(c.node);
      expect(unresolved(c.key)).toEqual(c.unresolved);
      expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
    });
  });

  describe("state selectors match the rendered state (AC7)", () => {
    it.each(ROWS)("$name", async (row) => {
      const el = await render(row.node);
      const root = row.inBody ? document.body : el;
      if (row.act) {
        row.act(el);
        await nextTick();
      }
      if (row.then) {
        row.then(root);
        await nextTick();
      }
      if (!row.unstyled) expect(cssFor(row.key), "selector styled").toContain(row.selector);
      expect(matching(root, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
