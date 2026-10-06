import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UTieredMenu } from "./tiered-menu";
import { UContextMenu } from "./context-menu";
import { UMenubar } from "./menubar";
import { UMegaMenu } from "./mega-menu";
import { UPanelMenu } from "./panel-menu";

/**
 * GAP-064 G3-C2 (Spec §9.5 AC1, AC2, AC7 state selectors). Fresh document per
 * mount under a server PLATFORM_ID, as G3-A/B/C1. The only allowed unresolved
 * reference is menubar.submenu.color (D-G3-5).
 */
const KEY_ATTR = "data-u-ng-style";
type Inputs = Record<string, unknown>;
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
  type: Type<unknown>;
  key: string;
  inputs: Inputs;
  unresolved: string[];
}
const CASES: Case[] = [
  { name: "tieredmenu", type: UTieredMenu, key: "tieredmenu", inputs: TREE, unresolved: [] },
  {
    name: "tieredmenu popup",
    type: UTieredMenu,
    key: "tieredmenu",
    inputs: { ...TREE, popup: true },
    unresolved: [],
  },
  { name: "contextmenu", type: UContextMenu, key: "contextmenu", inputs: FLAT, unresolved: [] },
  {
    name: "menubar",
    type: UMenubar,
    key: "menubar",
    inputs: TREE,
    unresolved: ["--u-menubar-submenu-color"],
  },
  { name: "megamenu", type: UMegaMenu, key: "megamenu", inputs: MEGA, unresolved: [] },
  { name: "panelmenu", type: UPanelMenu, key: "panelmenu", inputs: PANEL, unresolved: [] },
];

/** G3-A / GAP-078 isolation: reset, one configureTestingModule with a new Document, one createComponent. */
function mount(type: Type<unknown>, inputs: Inputs = {}) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3c2");
  TestBed.configureTestingModule({
    providers: [
      // Differs from the copied G3-C1 helper: the menu templates bind [routerLink].
      provideRouter([]),
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return { doc, fixture, el: fixture.nativeElement as HTMLElement };
}

const styles = (doc: Document) =>
  Array.from(doc.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (doc: Document, key: string) =>
  styles(doc).filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (doc: Document, key: string) =>
  styles(doc)
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");

function unresolved(doc: Document, key: string): string[] {
  const refs = new Set(
    Array.from(cssFor(doc, key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1])
  );
  const all = styles(doc)
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
const contextOpen = (root: HTMLElement) =>
  (root.querySelector("u-context-menu") ?? root).dispatchEvent(
    new MouseEvent("contextmenu", { bubbles: true, cancelable: true })
  );

/** `unstyled`: the row proves state-class emission only; no ported D1/D3/D4 selector is required to contain it. */
interface StateRow {
  name: string;
  key: string;
  type: Type<unknown>;
  inputs: Inputs;
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
    type: UTieredMenu,
    inputs: TREE,
    all: ".u-tieredmenu-root-list > .u-tieredmenu-item",
    selector: ".u-tieredmenu-item-disabled",
    expected: [1],
  },
  {
    name: "tieredmenu open item (C-1 item-active)",
    key: "tieredmenu",
    type: UTieredMenu,
    inputs: TREE,
    act: hover(".u-tieredmenu-item"),
    all: ".u-tieredmenu-root-list > .u-tieredmenu-item",
    selector: ".u-tieredmenu-item-open > .u-tieredmenu-item-content",
    expected: [0],
  },
  {
    name: "tieredmenu closed submenus hidden (D4 role 1, F-3b host form)",
    key: "tieredmenu",
    type: UTieredMenu,
    inputs: TREE,
    all: ".u-tieredmenu-submenu",
    selector:
      ".u-tieredmenu-item:not(.u-tieredmenu-item-open) > u-tiered-menu-sub > .u-tieredmenu-submenu",
    expected: [0, 1, 2],
  },
  {
    name: "tieredmenu popup overlay (group 21 / D4 role 2, K)",
    key: "tieredmenu",
    type: UTieredMenu,
    inputs: { ...TREE, popup: true },
    all: ".u-tieredmenu",
    selector: ".u-tieredmenu-overlay",
    expected: [],
  },
  {
    name: "contextmenu focused item (C-1 p-focus)",
    key: "contextmenu",
    type: UContextMenu,
    inputs: FLAT,
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
    type: UContextMenu,
    inputs: FLAT,
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
    type: UMenubar,
    inputs: TREE,
    act: hover(".u-menubar-root-list > .u-menubar-item"),
    all: ".u-menubar-submenu",
    selector: ".u-menubar .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu",
    expected: [0],
  },
  {
    name: "menubar disabled role (D3)",
    key: "menubar",
    type: UMenubar,
    inputs: TREE,
    all: ".u-menubar-root-list > .u-menubar-item",
    selector: ".u-menubar-item-disabled",
    expected: [1],
  },
  {
    name: "megamenu horizontal maps to root (C-5)",
    key: "megamenu",
    type: UMegaMenu,
    inputs: MEGA,
    all: ".u-megamenu-root-list",
    selector: ".u-megamenu .u-megamenu-root-list",
    expected: [0],
  },
  {
    name: "megamenu open overlay (group 22)",
    key: "megamenu",
    type: UMegaMenu,
    inputs: MEGA,
    act: hover(".u-megamenu-root-list > .u-megamenu-item"),
    all: ".u-megamenu-overlay",
    selector: ".u-megamenu-root-list > .u-megamenu-item-open > .u-megamenu-overlay",
    expected: [0],
  },
  {
    name: "megamenu disabled role (D3)",
    key: "megamenu",
    type: UMegaMenu,
    inputs: MEGA,
    all: ".u-megamenu-root-list > .u-megamenu-item",
    selector: ".u-megamenu-item-disabled",
    expected: [1],
  },
  {
    name: "panelmenu expanded item (C-1 expanded state)",
    key: "panelmenu",
    type: UPanelMenu,
    inputs: PANEL,
    act: click(".u-panelmenu-header-link"),
    unstyled: true,
    all: ".u-panelmenu-item",
    selector: ".u-panelmenu-item-expanded",
    expected: [0],
  },
  {
    name: "panelmenu disabled role (D3)",
    key: "panelmenu",
    type: UPanelMenu,
    inputs: PANEL,
    all: ".u-panelmenu-item",
    selector: ".u-panelmenu-item-disabled",
    expected: [1],
  },
];

describe("GAP-064 G3-C2 — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (AC1)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable except the recorded exception (AC2)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(unresolved(doc, c.key)).toEqual(c.unresolved);
      expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
    });
  });

  describe("state selectors match the rendered state (AC7)", () => {
    it.each(ROWS)("$name", (row) => {
      const { doc, fixture, el } = mount(row.type, row.inputs);
      const root = row.inBody ? (doc.body as HTMLElement) : el;
      if (row.act) {
        row.act(el);
        fixture.detectChanges();
      }
      if (row.then) {
        row.then(root);
        fixture.detectChanges();
      }
      if (!row.unstyled) expect(cssFor(doc, row.key), "selector styled").toContain(row.selector);
      expect(matching(root, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
