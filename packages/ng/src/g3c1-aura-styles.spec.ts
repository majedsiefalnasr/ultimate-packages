import { Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UBreadcrumb } from "./breadcrumb";
import { UDock } from "./dock";
import { USteps } from "./steps";
import { UStep, UStepItem, UStepList, UStepPanel, UStepPanels, UStepper } from "./stepper";
import { UTab, UTabList, UTabPanel, UTabPanels, UTabs } from "./tabs";

/**
 * GAP-064 G3-C1 (Spec §9.1 C1, C2, C3 state selectors). Assertions use the
 * generated <style data-u-ng-style> elements and the rendered DOM. Each mount
 * uses a fresh document under a server PLATFORM_ID (fresh per-document style
 * registry, GAP-078), as in G3-A/G3-B. No C1 key has an unresolved reference.
 */
const KEY_ATTR = "data-u-ng-style";

const STEPPER_IMPORTS = [UStepper, UStepList, UStep, UStepPanels, UStepPanel];
const STEPS_TEMPLATE = `<u-step-list
    ><u-step [value]="1">A</u-step><u-step [value]="2">B</u-step><u-step [value]="3">C</u-step></u-step-list
  ><u-step-panels
    ><u-step-panel [value]="1">a</u-step-panel><u-step-panel [value]="2">b</u-step-panel
    ><u-step-panel [value]="3">c</u-step-panel></u-step-panels
  >`;

@Component({
  standalone: true,
  imports: STEPPER_IMPORTS,
  template: `<u-stepper [value]="1">${STEPS_TEMPLATE}</u-stepper>`,
})
class StepperHost {}

@Component({
  standalone: true,
  imports: STEPPER_IMPORTS,
  template: `<u-stepper [value]="1" [linear]="true">${STEPS_TEMPLATE}</u-stepper>`,
})
class LinearStepperHost {}

@Component({
  standalone: true,
  imports: [...STEPPER_IMPORTS, UStepItem],
  template: `<u-stepper [value]="1"
    ><u-step-item [value]="1"
      ><u-step [value]="1">A</u-step><u-step-panel [value]="1">a</u-step-panel></u-step-item
    ><u-step-item [value]="2"
      ><u-step [value]="2">B</u-step><u-step-panel [value]="2">b</u-step-panel></u-step-item
    ><u-step-item [value]="3"
      ><u-step [value]="3">C</u-step><u-step-panel [value]="3">c</u-step-panel></u-step-item
    ></u-stepper
  >`,
})
class VerticalStepperHost {}

@Component({
  standalone: true,
  imports: [UTabs, UTabList, UTab, UTabPanels, UTabPanel],
  template: `<u-tabs [value]="0"
    ><u-tab-list
      ><u-tab [value]="0">A</u-tab><u-tab [value]="1" disabled>B</u-tab
      ><u-tab [value]="2">C</u-tab></u-tab-list
    ><u-tab-panels
      ><u-tab-panel [value]="0">a</u-tab-panel><u-tab-panel [value]="1">b</u-tab-panel
      ><u-tab-panel [value]="2">c</u-tab-panel></u-tab-panels
    ></u-tabs
  >`,
})
class TabsHost {}

type Inputs = Record<string, unknown>;
const CRUMBS = {
  model: [
    { label: "A", url: "#a" },
    { label: "B", disabled: true },
  ],
};
const DOCK = (position = "bottom") => ({
  model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
  position,
});
const STEPS = (readonly: boolean) => ({
  model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
  activeIndex: 0,
  readonly,
});

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  mounts: Inputs[];
}
const CASES: Case[] = [
  { name: "breadcrumb", type: UBreadcrumb, key: "breadcrumb", mounts: [CRUMBS] },
  {
    name: "dock",
    type: UDock,
    key: "dock",
    mounts: [DOCK("bottom"), DOCK("top"), DOCK("left"), DOCK("right")],
  },
  { name: "steps", type: USteps, key: "steps", mounts: [STEPS(true), STEPS(false)] },
  { name: "stepper horizontal", type: StepperHost, key: "stepper", mounts: [{}] },
  { name: "stepper linear", type: LinearStepperHost, key: "stepper", mounts: [{}] },
  { name: "stepper vertical", type: VerticalStepperHost, key: "stepper", mounts: [{}] },
  { name: "tabs", type: TabsHost, key: "tabs", mounts: [{}] },
];

/** G3-A / GAP-078 isolation: reset, one configureTestingModule with a new Document, one createComponent. */
function mount(type: Type<unknown>, inputs: Inputs = {}) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3c1");
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
const hoverFirstDockLink = (el: HTMLElement) =>
  el.querySelector(".u-dock-item-link")!.dispatchEvent(new MouseEvent("mouseenter"));

const ROWS: StateRow[] = [
  {
    name: "breadcrumb disabled role (C-7)",
    key: "breadcrumb",
    type: UBreadcrumb,
    inputs: CRUMBS,
    all: ".u-breadcrumb-item",
    selector: ".u-breadcrumb-item-disabled",
    expected: [1],
  },
  ...(["top", "bottom", "left", "right"] as const).map((p) => ({
    name: `dock position ${p}`,
    key: "dock",
    type: UDock,
    inputs: DOCK(p),
    all: ".u-dock",
    selector: `.u-dock-${p}`,
    expected: [0],
  })),
  {
    name: "dock disabled role (C-7)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    all: ".u-dock-item",
    selector: ".u-dock-item-disabled",
    expected: [1],
  },
  {
    name: "dock idle: no magnified link (R-C2)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [],
  },
  {
    name: "dock hovered link magnified (R-C2)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    act: hoverFirstDockLink,
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [0],
  },
  {
    name: "steps disabled item (PX-C1 group 4)",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1],
  },
  {
    name: "steps readonly disables every non-active item",
    key: "steps",
    type: USteps,
    inputs: STEPS(true),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1, 2],
  },
  {
    name: "steps focus ring excludes the disabled item's link (PX-C2)",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0, 2],
  },
  {
    name: "steps readonly: focus ring only on the active item's link (PX-C2)",
    key: "steps",
    type: USteps,
    inputs: STEPS(true),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0],
  },
  {
    name: "steps active number",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item-number",
    selector: ".u-steps-item-active .u-steps-item-number",
    expected: [0],
  },
  {
    name: "stepper active number",
    key: "stepper",
    type: StepperHost,
    all: ".u-step-number",
    selector: ".u-step-active .u-step-number",
    expected: [0],
  },
  {
    name: "stepper linear disabled role (C-7)",
    key: "stepper",
    type: LinearStepperHost,
    all: ".u-step",
    selector: ".u-step-disabled",
    expected: [1, 2],
  },
  {
    name: "stepper focus mapping skips disabled steps",
    key: "stepper",
    type: LinearStepperHost,
    all: ".u-step",
    selector: ".u-step:not(.u-step-disabled):focus-visible",
    expected: [0],
  },
  {
    name: "stepper vertical active item",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-item",
    selector: ".u-step-item.u-step-item-active",
    expected: [0],
  },
  {
    name: "stepper vertical panels (group 22)",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-panel",
    selector: ".u-step-item .u-step-panel",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical inactive panels hidden (R-C3)",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-panel",
    selector: ".u-step-panel[hidden]",
    expected: [1, 2],
  },
  {
    name: "tabs active tab",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab-active",
    expected: [0],
  },
  {
    name: "tabs disabled role (C-7)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab-disabled",
    expected: [1],
  },
  {
    name: "tabs hover mapping skips active and disabled tabs",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab:not(.u-tab-active):not(.u-tab-disabled):hover",
    expected: [2],
  },
  {
    name: "tabs viewport mapping (C-3)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tablist-content",
    selector: ".u-tablist-content::-webkit-scrollbar",
    expected: [],
  },
  {
    name: "tabs viewport element renders (C-3)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tablist-content",
    selector: ".u-tablist-content",
    expected: [0],
  },
];

describe("GAP-064 G3-C1 — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (C1)", () => {
      const { doc } = mount(c.type, c.mounts[0]);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it.each(c.mounts)("resolves every variable (C2) %o", (inputs) => {
      const { doc } = mount(c.type, inputs);
      expect(unresolved(doc, c.key)).toEqual([]);
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
