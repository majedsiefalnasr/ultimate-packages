import { Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UAccordion } from "./accordion";
import { UBlockUI } from "./block-ui";
import { UCard } from "./card";
import { UDivider } from "./divider";
import { UFieldset } from "./fieldset";
import { UInplace } from "./inplace";
import { UPanel } from "./panel";
import { UScrollPanel } from "./scroll-panel";
import { USplitter, USplitterPanel } from "./splitter";
import { UToolbar } from "./toolbar";

/**
 * GAP-064 G3-B (Spec §8 C1, C2, C3 state selectors). Assertions use the
 * generated <style data-u-ng-style> elements and the rendered DOM. Each mount
 * uses a fresh document under a server PLATFORM_ID (fresh per-document style
 * registry, GAP-078), as in G3-A.
 */
const KEY_ATTR = "data-u-ng-style";
/** Spec §5.6: the only unresolved references; every other list is empty. */
const UNRESOLVED: Record<string, string[]> = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter
    ><ng-template uSplitterPanel>A</ng-template
    ><ng-template uSplitterPanel>B</ng-template></u-splitter
  >`,
})
class SplitterHost {}

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter layout="vertical"
    ><ng-template uSplitterPanel>A</ng-template
    ><ng-template uSplitterPanel>B</ng-template></u-splitter
  >`,
})
class SplitterVerticalHost {}

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter
    ><ng-template uSplitterPanel
      ><u-splitter
        ><ng-template uSplitterPanel>A</ng-template
        ><ng-template uSplitterPanel>B</ng-template></u-splitter
      ></ng-template
    ><ng-template uSplitterPanel>C</ng-template></u-splitter
  >`,
})
class NestedSplitterHost {}

type Inputs = Record<string, unknown>;
const PANELS = [
  { value: "0", header: "A" },
  { value: "1", header: "B" },
  { value: "2", header: "C", disabled: true },
];

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  oldKey?: string;
  mounts: Inputs[];
}
const CASES: Case[] = [
  {
    name: "accordion",
    type: UAccordion,
    key: "accordion",
    mounts: [{ panels: PANELS, value: "0" }],
  },
  {
    name: "blockui",
    type: UBlockUI,
    key: "blockui",
    oldKey: "block-ui",
    mounts: [{ blocked: true }, { blocked: true, fullScreen: true }],
  },
  { name: "card", type: UCard, key: "card", mounts: [{ header: "T", subheader: "S" }] },
  { name: "divider", type: UDivider, key: "divider", mounts: [{}, { layout: "vertical" }] },
  {
    name: "fieldset",
    type: UFieldset,
    key: "fieldset",
    mounts: [
      { legend: "L" },
      { legend: "L", toggleable: true },
      { legend: "L", toggleable: true, collapsed: true },
    ],
  },
  {
    name: "inplace",
    type: UInplace,
    key: "inplace",
    mounts: [{}, { disabled: true }, { active: true }],
  },
  {
    name: "panel",
    type: UPanel,
    key: "panel",
    mounts: [
      { header: "P" },
      { header: "P", toggleable: true },
      { header: "P", toggleable: true, collapsed: true },
    ],
  },
  {
    name: "scrollpanel",
    type: UScrollPanel,
    key: "scrollpanel",
    oldKey: "scroll-panel",
    mounts: [{}],
  },
  { name: "splitter horizontal", type: SplitterHost, key: "splitter", mounts: [{}] },
  { name: "splitter vertical", type: SplitterVerticalHost, key: "splitter", mounts: [{}] },
  { name: "toolbar", type: UToolbar, key: "toolbar", mounts: [{}] },
];

/** G3-A / GAP-078 isolation: reset, one configureTestingModule with a new Document, one createComponent. */
function mount(type: Type<unknown>, inputs: Inputs = {}) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3b");
  TestBed.configureTestingModule({
    providers: [
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

interface StateRow {
  name: string;
  key: string;
  type: Type<unknown>;
  inputs?: Inputs;
  act?: (el: HTMLElement) => void;
  all: string;
  selector: string;
  expected: number[];
}
const ACTIVE =
  ".u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header";
const HOVER =
  ".u-accordion-panel:not(.u-accordion-panel-active):not(.u-accordion-panel-disabled) > .u-accordion-header:hover";
const FOCUS =
  ".u-accordion-panel:not(.u-accordion-panel-disabled) .u-accordion-header:focus-visible";
const ACC = { key: "accordion", type: UAccordion, inputs: { panels: PANELS, value: "0" } };
const INPLACE_HOVER = '.u-inplace-display:not([data-p-disabled="true"]):hover';
const INPLACE_DISABLED = '.u-inplace-display[data-p-disabled="true"]';
const mousedownGutter = (el: HTMLElement) =>
  el
    .querySelector(".u-splitter-gutter")!
    .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

const ROWS: StateRow[] = [
  {
    name: "accordion active header",
    ...ACC,
    all: ".u-accordion-header",
    selector: ACTIVE,
    expected: [0],
  },
  {
    name: "accordion hover header",
    ...ACC,
    all: ".u-accordion-header",
    selector: HOVER,
    expected: [1],
  },
  {
    name: "accordion focus ring",
    ...ACC,
    all: ".u-accordion-header",
    selector: FOCUS,
    expected: [0, 1],
  },
  {
    name: "accordion disabled role PX-B1",
    ...ACC,
    all: ".u-accordion-panel",
    selector: ".u-accordion-panel-disabled",
    expected: [2],
  },
  {
    name: "inplace enabled hover",
    key: "inplace",
    type: UInplace,
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [0],
  },
  {
    name: "inplace disabled no hover",
    key: "inplace",
    type: UInplace,
    inputs: { disabled: true },
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [],
  },
  {
    name: "inplace disabled role PX-B2",
    key: "inplace",
    type: UInplace,
    inputs: { disabled: true },
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [0],
  },
  {
    name: "inplace enabled not disabled",
    key: "inplace",
    type: UInplace,
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [],
  },
  {
    name: "panel toggleable header PX-B7",
    key: "panel",
    type: UPanel,
    inputs: { header: "P", toggleable: true },
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [0],
  },
  {
    name: "panel plain header",
    key: "panel",
    type: UPanel,
    inputs: { header: "P" },
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [],
  },
  {
    name: "fieldset toggleable legend",
    key: "fieldset",
    type: UFieldset,
    inputs: { legend: "L", toggleable: true },
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [0],
  },
  {
    name: "fieldset plain legend",
    key: "fieldset",
    type: UFieldset,
    inputs: { legend: "L" },
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [],
  },
  {
    name: "divider horizontal",
    key: "divider",
    type: UDivider,
    all: ".u-divider",
    selector: ".u-divider-horizontal",
    expected: [0],
  },
  {
    name: "divider vertical",
    key: "divider",
    type: UDivider,
    inputs: { layout: "vertical" },
    all: ".u-divider",
    selector: ".u-divider-vertical",
    expected: [0],
  },
  {
    name: "blockui document mask PX-B4",
    key: "blockui",
    type: UBlockUI,
    inputs: { blocked: true, fullScreen: true },
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [0],
  },
  {
    name: "blockui container mask",
    key: "blockui",
    type: UBlockUI,
    inputs: { blocked: true },
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [],
  },
  {
    name: "splitter idle PX-B8",
    key: "splitter",
    type: SplitterHost,
    all: ".u-splitter",
    selector: ".u-splitter-horizontal[data-resizing]",
    expected: [],
  },
  {
    name: "splitter dragging PX-B8",
    key: "splitter",
    type: SplitterHost,
    act: mousedownGutter,
    all: ".u-splitter",
    selector: ".u-splitter-horizontal[data-resizing]",
    expected: [0],
  },
  {
    name: "splitter vertical",
    key: "splitter",
    type: SplitterVerticalHost,
    all: ".u-splitter",
    selector: ".u-splitter-vertical",
    expected: [0],
  },
  {
    name: "nested splitter descendant rule (Review Focus 4)",
    key: "splitter",
    type: NestedSplitterHost,
    all: ".u-splitter",
    selector: ".u-splitter-panel .u-splitter",
    expected: [1],
  },
];

describe("GAP-064 G3-B — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key and never under an old key (C1)", () => {
      const { doc } = mount(c.type, c.mounts[0]);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(doc, c.oldKey)).toBe(0);
        expect(count(doc, `${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts)("resolves every variable except the Spec §5.6 list (C2) %o", (inputs) => {
      const { doc } = mount(c.type, inputs);
      expect(unresolved(doc, c.key)).toEqual(UNRESOLVED[c.key] ?? []);
      expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
    });
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", (row) => {
      const { doc, fixture, el } = mount(row.type, row.inputs);
      if (row.act) {
        row.act(el);
        fixture.detectChanges();
      }
      expect(cssFor(doc, row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
