import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UBreadcrumb } from "./breadcrumb";
import { UDock } from "./dock";
import { USteps } from "./steps";
import { UStep, UStepItem, UStepList, UStepPanel, UStepPanels, UStepper } from "./stepper";
import { UTab, UTabList, UTabPanel, UTabPanels, UTabs } from "./tabs";

/**
 * GAP-064 G3-C1 (Spec §9.1 C1, C2, C3 state selectors) for Vue. Assertions
 * use the generated <style data-u-style> elements and the rendered DOM; the
 * registry is reset before every test, as in G3-A/G3-B. No C1 key has an
 * unresolved reference.
 */
const KEY_ATTR = "data-u-style";

type Render = () => VNode;
const VALUES = [1, 2, 3];
const breadcrumb: Render = () =>
  h(UBreadcrumb, {
    model: [
      { label: "A", url: "#a" },
      { label: "B", disabled: true },
    ],
  });
const dock =
  (position = "bottom"): Render =>
  () =>
    h(UDock, { model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }], position });
const steps =
  (readonly: boolean): Render =>
  () =>
    h(USteps, {
      model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
      activeStep: 0,
      readonly,
    });
const stepper =
  (linear: boolean): Render =>
  () =>
    h(UStepper, { value: 1, linear }, () => [
      h(UStepList, null, () => VALUES.map((v) => h(UStep, { value: v }, () => `S${v}`))),
      h(UStepPanels, null, () => VALUES.map((v) => h(UStepPanel, { value: v }, () => `P${v}`))),
    ]);
const verticalStepper: Render = () =>
  h(UStepper, { value: 1 }, () =>
    VALUES.map((v) =>
      h(UStepItem, { value: v }, () => [
        h(UStep, { value: v }, () => `S${v}`),
        h(UStepPanel, { value: v }, () => `P${v}`),
      ])
    )
  );
const tabs: Render = () =>
  h(UTabs, { value: 0 }, () => [
    h(UTabList, null, () =>
      [0, 1, 2].map((v) => h(UTab, { value: v, disabled: v === 1 }, () => `T${v}`))
    ),
    h(UTabPanels, null, () => [0, 1, 2].map((v) => h(UTabPanel, { value: v }, () => `P${v}`))),
  ]);

interface Case {
  name: string;
  key: string;
  mounts: Render[];
}
const CASES: Case[] = [
  { name: "breadcrumb", key: "breadcrumb", mounts: [breadcrumb] },
  { name: "dock", key: "dock", mounts: [dock("bottom"), dock("top"), dock("left"), dock("right")] },
  { name: "steps", key: "steps", mounts: [steps(true), steps(false)] },
  { name: "stepper", key: "stepper", mounts: [stepper(false), stepper(true), verticalStepper] },
  { name: "tabs", key: "tabs", mounts: [tabs] },
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

interface StateRow {
  name: string;
  key: string;
  node: Render;
  act?: (el: HTMLElement) => void;
  all: string;
  selector: string;
  expected: number[];
}
const hoverFirstDockLink = (el: HTMLElement) =>
  el.querySelector(".u-dock-item-link")!.dispatchEvent(new MouseEvent("mouseenter"));

const ROWS: StateRow[] = [
  {
    name: "breadcrumb disabled role (C-7)",
    key: "breadcrumb",
    node: breadcrumb,
    all: ".u-breadcrumb-item",
    selector: ".u-breadcrumb-item-disabled",
    expected: [1],
  },
  ...(["top", "bottom", "left", "right"] as const).map((p) => ({
    name: `dock position ${p}`,
    key: "dock",
    node: dock(p),
    all: ".u-dock",
    selector: `.u-dock-${p}`,
    expected: [0],
  })),
  {
    name: "dock disabled role (C-7)",
    key: "dock",
    node: dock(),
    all: ".u-dock-item",
    selector: ".u-dock-item-disabled",
    expected: [1],
  },
  {
    name: "dock idle: no magnified link (R-C2)",
    key: "dock",
    node: dock(),
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [],
  },
  {
    name: "dock hovered link magnified (R-C2)",
    key: "dock",
    node: dock(),
    act: hoverFirstDockLink,
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [0],
  },
  {
    name: "steps disabled item (PX-C1 group 4)",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1],
  },
  {
    name: "steps readonly disables every non-active item",
    key: "steps",
    node: steps(true),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1, 2],
  },
  {
    name: "steps focus ring excludes the disabled item's link (PX-C2)",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0, 2],
  },
  {
    name: "steps readonly: focus ring only on the active item's link (PX-C2)",
    key: "steps",
    node: steps(true),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0],
  },
  {
    name: "steps active number",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item-number",
    selector: ".u-steps-item-active .u-steps-item-number",
    expected: [0],
  },
  {
    name: "stepper active number",
    key: "stepper",
    node: stepper(false),
    all: ".u-step-number",
    selector: ".u-step-active .u-step-number",
    expected: [0],
  },
  {
    name: "stepper linear disabled role (C-7)",
    key: "stepper",
    node: stepper(true),
    all: ".u-step",
    selector: ".u-step-disabled",
    expected: [1, 2],
  },
  {
    name: "stepper focus mapping skips disabled steps",
    key: "stepper",
    node: stepper(true),
    all: ".u-step",
    selector: ".u-step:not(.u-step-disabled):focus-visible",
    expected: [0],
  },
  {
    name: "stepper vertical active item",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-item",
    selector: ".u-step-item.u-step-item-active",
    expected: [0],
  },
  {
    name: "stepper vertical panels (group 22)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel",
    selector: ".u-step-item .u-step-panel",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical content wrapper (group 23, Vue only)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel-content-wrapper",
    selector: ".u-step-item .u-step-panel-content-wrapper",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical content (group 24, Vue only)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel-content",
    selector: ".u-step-item .u-step-panel-content",
    expected: [0, 1, 2],
  },
  {
    name: "tabs active tab",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab-active",
    expected: [0],
  },
  {
    name: "tabs disabled role (C-7)",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab-disabled",
    expected: [1],
  },
  {
    name: "tabs hover mapping skips active and disabled tabs",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab:not(.u-tab-active):not(.u-tab-disabled):hover",
    expected: [2],
  },
  {
    name: "tabs viewport mapping (C-3)",
    key: "tabs",
    node: tabs,
    all: ".u-tablist-content",
    selector: ".u-tablist-content::-webkit-scrollbar",
    expected: [],
  },
  {
    name: "tabs viewport element renders (C-3)",
    key: "tabs",
    node: tabs,
    all: ".u-tablist-content",
    selector: ".u-tablist-content",
    expected: [0],
  },
];

describe("GAP-064 G3-C1 — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    // jsdom has no ResizeObserver; UTabList binds one on mount (as packages/vue/src/tabs/tabs.spec.ts stubs it).
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (C1)", async () => {
      await render(c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it.each(c.mounts.map((node, i) => ({ i, node })))(
      "resolves every variable (C2) mount $i",
      async ({ node }) => {
        await render(node);
        expect(unresolved(c.key)).toEqual([]);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", async (row) => {
      const el = await render(row.node);
      if (row.act) {
        row.act(el);
        await nextTick();
      }
      expect(cssFor(row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
