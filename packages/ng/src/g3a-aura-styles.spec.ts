import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UToastService } from "@ultimate/ng-core";
import { UAvatar } from "./avatar";
import { UChip } from "./chip";
import { UTag } from "./tag";
import { USkeleton } from "./skeleton";
import { UOverlayBadge } from "./overlay-badge";
import { UKnob } from "./knob";
import { UProgressBar } from "./progress-bar";
import { UProgressSpinner } from "./progress-spinner";
import { UMeterGroup } from "./meter-group";
import { UTimeline } from "./timeline";
import { UTerminal } from "./terminal";
import { UMessage } from "./message";
import { UToast } from "./toast";

/**
 * GAP-064 G3-A (Spec §8 C1, C2, C3-dynamic). Assertions use the generated
 * <style data-u-ng-style> elements and the actually rendered DOM — not source
 * literals. Each mount uses a fresh document under a server PLATFORM_ID, which
 * gives it a fresh per-document style registry (GAP-078), as in Tranche 1.
 */
const KEY_ATTR = "data-u-ng-style";
const SEVERITIES = ["success", "info", "warn", "error", "secondary", "contrast"] as const;
const TAG_SEVERITIES = ["success", "info", "warn", "danger", "secondary", "contrast"] as const;
const POSITIONS = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top-center",
  "bottom-center",
  "center",
] as const;

type Inputs = Record<string, unknown>;
interface Case {
  type: Type<unknown>;
  key: string;
  oldKey?: string;
  mounts: Inputs[];
}

const METER = [{ label: "Used", value: 40, color: "#34d399" }];
const CASES: Case[] = [
  {
    type: UAvatar,
    key: "avatar",
    mounts: [
      { label: "AB" },
      { label: "AB", size: "large", shape: "circle" },
      { label: "AB", size: "xlarge" },
    ],
  },
  { type: UChip, key: "chip", mounts: [{ label: "Chip" }, { label: "Chip", removable: true }] },
  {
    type: UTag,
    key: "tag",
    mounts: [
      { value: "T" },
      ...TAG_SEVERITIES.map((severity) => ({ value: "T", severity })),
      { value: "T", rounded: true },
    ],
  },
  { type: USkeleton, key: "skeleton", mounts: [{}, { shape: "circle" }, { animation: "none" }] },
  { type: UOverlayBadge, key: "overlaybadge", oldKey: "overlay-badge", mounts: [{ value: "2" }] },
  { type: UKnob, key: "knob", mounts: [{}] },
  {
    type: UProgressBar,
    key: "progressbar",
    oldKey: "progress-bar",
    mounts: [{ value: 40 }, { mode: "indeterminate" }],
  },
  { type: UProgressSpinner, key: "progressspinner", oldKey: "progress-spinner", mounts: [{}] },
  {
    type: UMeterGroup,
    key: "metergroup",
    oldKey: "meter-group",
    mounts: [{ value: METER }, { value: METER, orientation: "vertical" }],
  },
  {
    type: UTimeline,
    key: "timeline",
    mounts: [{ value: ["A", "B"] }, { value: ["A", "B"], layout: "horizontal" }],
  },
  { type: UTerminal, key: "terminal", mounts: [{ welcomeMessage: "Welcome" }] },
  {
    type: UMessage,
    key: "message",
    mounts: SEVERITIES.map((severity) => ({ severity, closable: true })),
  },
  { type: UToast, key: "toast", mounts: POSITIONS.map((position) => ({ position })) },
];

/**
 * Tranche 1 / GAP-078 isolation pattern: exactly ONE configureTestingModule +
 * createComponent per call, on a TestBed that has just been reset, with a new
 * Document injected as DOCUMENT. A new Document is a new per-document style
 * registry (ngCoreStyleSheetFor), so every mount starts with an empty <head>.
 * The explicit resetTestingModule() makes this independent of the builder's
 * own per-test teardown and is the only supported way to re-provide DOCUMENT.
 */
function mount(type: Type<unknown>, inputs: Inputs, toastMessages = false) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3a");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  if (toastMessages) {
    const toast = TestBed.inject(UToastService);
    for (const severity of SEVERITIES) toast.add({ severity, summary: severity, sticky: true });
    fixture.detectChanges();
  }
  return { doc, el: fixture.nativeElement as HTMLElement };
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

const hasClass = (el: HTMLElement, cls: string) =>
  el.classList.contains(cls) || el.querySelector(`.${cls}`) !== null;

describe("GAP-064 G3-A — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$key", (c) => {
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

    it.each(c.mounts)(
      "resolves every referenced variable; exception list empty (C2) %o",
      (inputs) => {
        const { doc } = mount(c.type, inputs);
        expect(unresolved(doc, c.key)).toEqual([]);
        expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  it("toast with messages of all six severities resolves every variable (C2)", () => {
    const { doc } = mount(UToast, {}, true);
    expect(unresolved(doc, "toast")).toEqual([]);
  });

  it("isolates styles per document: two mounts, two registries, nothing in the global document", () => {
    const globalBefore = document.head.querySelectorAll(`style[${KEY_ATTR}="progressbar"]`).length;
    const first = mount(UProgressBar, { value: 40 }).doc;
    const second = mount(UProgressBar, { value: 40 }).doc;
    expect(first).not.toBe(second);
    expect(count(first, "progressbar")).toBe(1);
    expect(count(second, "progressbar")).toBe(1);
    expect(count(second, "progressbar-variables")).toBe(1);
    expect(document.head.querySelectorAll(`style[${KEY_ATTR}="progressbar"]`).length).toBe(
      globalBefore
    );
  });

  describe("dynamic classes are emitted and styled (C3, §13.6 A/F)", () => {
    const rows: Array<{
      type: Type<unknown>;
      key: string;
      inputs: Inputs;
      cls: string;
      toast?: boolean;
    }> = [
      ...POSITIONS.map((position) => ({
        type: UToast,
        key: "toast",
        inputs: { position },
        cls: `u-toast-${position}`,
      })),
      ...SEVERITIES.map((s) => ({
        type: UToast,
        key: "toast",
        inputs: {},
        cls: `u-toast-message-${s}`,
        toast: true,
      })),
      ...SEVERITIES.map((severity) => ({
        type: UMessage,
        key: "message",
        inputs: { severity },
        cls: `u-message-${severity}`,
      })),
      ...TAG_SEVERITIES.map((severity) => ({
        type: UTag,
        key: "tag",
        inputs: { value: "T", severity },
        cls: `u-tag-${severity}`,
      })),
      ...(["vertical", "horizontal"] as const).map((layout) => ({
        type: UTimeline,
        key: "timeline",
        inputs: { value: ["A"], layout },
        cls: `u-timeline-${layout}`,
      })),
    ];
    it.each(rows)("$cls", ({ type, key, inputs, cls, toast }) => {
      const { doc, el } = mount(type, inputs, toast);
      expect(hasClass(el, cls), "class emitted").toBe(true);
      expect(cssFor(doc, key), "selector styled").toContain(`.${cls}`);
    });
  });
});
