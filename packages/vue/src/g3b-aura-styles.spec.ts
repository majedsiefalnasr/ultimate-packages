import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UAccordion } from "./accordion";
import { UAccordionPanel } from "./accordion-panel";
import { UAccordionHeader } from "./accordion-header";
import { UAccordionContent } from "./accordion-content";
import { UBlockUI } from "./block-ui";
import { UCard } from "./card";
import { UDivider } from "./divider";
import { UFieldset } from "./fieldset";
import { UInplace } from "./inplace";
import { UPanel } from "./panel";
import { UScrollPanel } from "./scroll-panel";
import { USplitter } from "./splitter";
import { UToolbar } from "./toolbar";

/**
 * GAP-064 G3-B (Spec §8 C1, C2, C3 state selectors) for Vue. Assertions use
 * the generated <style data-u-style> elements and the rendered DOM; the
 * registry is reset before every test, as in G3-A.
 */
const KEY_ATTR = "data-u-style";
/** Spec §5.6: the only unresolved references; every other list is empty. */
const UNRESOLVED: Record<string, string[]> = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

type Render = () => VNode;
const PANELS: Array<[string, string, boolean]> = [
  ["0", "A", false],
  ["1", "B", false],
  ["2", "C", true],
];
const accordion: Render = () =>
  h(UAccordion, { value: "0" }, () =>
    PANELS.map(([value, title, disabled]) =>
      h(UAccordionPanel, { value, disabled }, () => [
        h(UAccordionHeader, null, () => title),
        h(UAccordionContent, null, () => `${title} content`),
      ])
    )
  );
const inplace =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UInplace, props, { display: () => "Display", content: () => "Content" });
const panel =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UPanel, props, { default: () => "Content", footer: () => "Footer" });
const fieldset =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UFieldset, props, () => "Content");
const splitter =
  (props: Record<string, unknown>): Render =>
  () =>
    h(USplitter, { panels: [{}, {}], ...props });
const nestedSplitter: Render = () =>
  h(
    USplitter,
    { panels: [{}, {}] },
    {
      default: ({ index }: { index: number }) =>
        index === 0 ? h(USplitter, { panels: [{}, {}] }) : "C",
    }
  );

interface Case {
  name: string;
  key: string;
  oldKey?: string;
  mounts: Render[];
}
const CASES: Case[] = [
  { name: "accordion", key: "accordion", mounts: [accordion] },
  {
    name: "blockui",
    key: "blockui",
    oldKey: "block-ui",
    mounts: [
      () => h(UBlockUI, { blocked: true }, () => "C"),
      () => h(UBlockUI, { blocked: true, fullScreen: true }, () => "C"),
    ],
  },
  {
    name: "card",
    key: "card",
    mounts: [
      () =>
        h(UCard, null, {
          title: () => "T",
          subtitle: () => "S",
          content: () => "C",
          footer: () => "F",
        }),
    ],
  },
  {
    name: "divider",
    key: "divider",
    mounts: [
      () => h(UDivider, null, () => "L"),
      () => h(UDivider, { layout: "vertical" }, () => "L"),
    ],
  },
  {
    name: "fieldset",
    key: "fieldset",
    mounts: [
      fieldset({ legend: "L" }),
      fieldset({ legend: "L", toggleable: true }),
      fieldset({ legend: "L", toggleable: true, collapsed: true }),
    ],
  },
  {
    name: "inplace",
    key: "inplace",
    mounts: [inplace({}), inplace({ disabled: true }), inplace({ active: true })],
  },
  {
    name: "panel",
    key: "panel",
    mounts: [
      panel({ header: "P" }),
      panel({ header: "P", toggleable: true }),
      panel({ header: "P", toggleable: true, collapsed: true }),
    ],
  },
  {
    name: "scrollpanel",
    key: "scrollpanel",
    oldKey: "scroll-panel",
    mounts: [() => h(UScrollPanel, null, () => "C")],
  },
  { name: "splitter", key: "splitter", mounts: [splitter({}), splitter({ layout: "vertical" })] },
  {
    name: "toolbar",
    key: "toolbar",
    mounts: [() => h(UToolbar, null, { start: () => "S", end: () => "E" })],
  },
];

async function render(node: Render) {
  const wrapper = mount({ render: node });
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

interface StateRow {
  name: string;
  key: string;
  node: Render;
  all: string;
  selector: string;
  expected: number[];
}
const ACTIVE =
  '.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader';
const HOVER =
  '.u-accordionpanel:not([data-p-active="true"]):not([data-p-disabled="true"]) > .u-accordionheader:hover';
const FOCUS = '.u-accordionpanel:not([data-p-disabled="true"]) .u-accordionheader:focus-visible';
const INPLACE_HOVER = '.u-inplace-display:not([data-p-disabled="true"]):hover';
const INPLACE_DISABLED = '.u-inplace-display[data-p-disabled="true"]';

const ROWS: StateRow[] = [
  {
    name: "accordion active header",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: ACTIVE,
    expected: [0],
  },
  {
    name: "accordion hover header",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: HOVER,
    expected: [1],
  },
  {
    name: "accordion focus ring",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: FOCUS,
    expected: [0, 1],
  },
  {
    name: "accordion disabled role PX-B1",
    key: "accordion",
    node: accordion,
    all: ".u-accordionpanel",
    selector: '.u-accordionpanel[data-p-disabled="true"]',
    expected: [2],
  },
  {
    name: "inplace enabled hover",
    key: "inplace",
    node: inplace({}),
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [0],
  },
  {
    name: "inplace disabled no hover",
    key: "inplace",
    node: inplace({ disabled: true }),
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [],
  },
  {
    name: "inplace disabled role PX-B2",
    key: "inplace",
    node: inplace({ disabled: true }),
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [0],
  },
  {
    name: "inplace enabled not disabled",
    key: "inplace",
    node: inplace({}),
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [],
  },
  {
    name: "panel toggleable header PX-B7",
    key: "panel",
    node: panel({ header: "P", toggleable: true }),
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [0],
  },
  {
    name: "panel plain header",
    key: "panel",
    node: panel({ header: "P" }),
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [],
  },
  {
    name: "fieldset toggleable legend",
    key: "fieldset",
    node: fieldset({ legend: "L", toggleable: true }),
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [0],
  },
  {
    name: "fieldset plain legend",
    key: "fieldset",
    node: fieldset({ legend: "L" }),
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [],
  },
  {
    name: "divider horizontal",
    key: "divider",
    node: () => h(UDivider, null, () => "L"),
    all: ".u-divider",
    selector: ".u-divider-horizontal",
    expected: [0],
  },
  {
    name: "divider vertical",
    key: "divider",
    node: () => h(UDivider, { layout: "vertical" }, () => "L"),
    all: ".u-divider",
    selector: ".u-divider-vertical",
    expected: [0],
  },
  {
    name: "blockui document mask PX-B4",
    key: "blockui",
    node: () => h(UBlockUI, { blocked: true, fullScreen: true }, () => "C"),
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [0],
  },
  {
    name: "blockui container mask",
    key: "blockui",
    node: () => h(UBlockUI, { blocked: true }, () => "C"),
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [],
  },
  {
    name: "splitter horizontal",
    key: "splitter",
    node: splitter({}),
    all: ".u-splitter",
    selector: ".u-splitter-horizontal",
    expected: [0],
  },
  {
    name: "splitter vertical",
    key: "splitter",
    node: splitter({ layout: "vertical" }),
    all: ".u-splitter",
    selector: ".u-splitter-vertical",
    expected: [0],
  },
  {
    name: "nested splitter descendant rule (Review Focus 4)",
    key: "splitter",
    node: nestedSplitter,
    all: ".u-splitter",
    selector: ".u-splitter-panel .u-splitter",
    expected: [1],
  },
];

describe("GAP-064 G3-B — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key and never under an old key (C1)", async () => {
      await render(c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts.map((node, i) => ({ i, node })))(
      "resolves every variable except the Spec §5.6 list (C2) mount $i",
      async ({ node }) => {
        await render(node);
        expect(unresolved(c.key)).toEqual(UNRESOLVED[c.key] ?? []);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", async (row) => {
      const el = await render(row.node);
      expect(cssFor(row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });

  it("an enabled AccordionPanel's data-p-disabled is 'false' or absent, never 'true' (Spec §13.7, Review Focus 1)", async () => {
    const el = await render(accordion);
    const value = el.querySelectorAll(".u-accordionpanel")[1].getAttribute("data-p-disabled");
    expect(["false", null]).toContain(value);
  });
});
