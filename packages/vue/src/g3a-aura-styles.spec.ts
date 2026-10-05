import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, type Component } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { toastEventBus, vueCoreStyleSheet } from "@ultimate/vue-core";
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
import { UInlineMessage } from "./inline-message";
import { UToast } from "./toast";

/**
 * GAP-064 G3-A (Spec §8 C1, C2, C3-dynamic) for Vue. Assertions use the
 * generated <style data-u-style> elements and the rendered DOM; the registry is
 * reset before every test, as in Tranche 1.
 */
const KEY_ATTR = "data-u-style";
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

type Props = Record<string, unknown>;
interface Case {
  component: Component;
  key: string;
  oldKey?: string;
  mounts: Props[];
}

const METER = [{ label: "Used", value: 40, color: "#34d399" }];
const CASES: Case[] = [
  {
    component: UAvatar,
    key: "avatar",
    mounts: [
      { label: "AB" },
      { label: "AB", size: "large", shape: "circle" },
      { label: "AB", size: "xlarge" },
    ],
  },
  {
    component: UChip,
    key: "chip",
    mounts: [{ label: "Chip" }, { label: "Chip", removable: true }],
  },
  {
    component: UTag,
    key: "tag",
    mounts: [
      { value: "T" },
      ...TAG_SEVERITIES.map((severity) => ({ value: "T", severity })),
      { value: "T", rounded: true },
    ],
  },
  {
    component: USkeleton,
    key: "skeleton",
    mounts: [{}, { shape: "circle" }, { animation: "none" }],
  },
  {
    component: UOverlayBadge,
    key: "overlaybadge",
    oldKey: "overlay-badge",
    mounts: [{ value: "2" }],
  },
  { component: UKnob, key: "knob", mounts: [{}] },
  {
    component: UProgressBar,
    key: "progressbar",
    oldKey: "progress-bar",
    mounts: [{ value: 40 }, { mode: "indeterminate" }],
  },
  { component: UProgressSpinner, key: "progressspinner", oldKey: "progress-spinner", mounts: [{}] },
  {
    component: UMeterGroup,
    key: "metergroup",
    oldKey: "meter-group",
    mounts: [{ value: METER }, { value: METER, orientation: "vertical" }],
  },
  {
    component: UTimeline,
    key: "timeline",
    mounts: [{ value: ["A", "B"] }, { value: ["A", "B"], layout: "horizontal" }],
  },
  { component: UTerminal, key: "terminal", mounts: [{ welcomeMessage: "Welcome" }] },
  {
    component: UMessage,
    key: "message",
    mounts: SEVERITIES.map((severity) => ({ severity, closable: true })),
  },
  {
    component: UInlineMessage,
    key: "inlinemessage",
    oldKey: "inline-message",
    mounts: SEVERITIES.map((severity) => ({ severity })),
  },
  { component: UToast, key: "toast", mounts: POSITIONS.map((position) => ({ position })) },
];

async function render(component: Component, props: Props, toastMessages = false) {
  const wrapper = mount(component, { props });
  if (toastMessages) {
    for (const severity of SEVERITIES)
      toastEventBus.emit("add", { severity, summary: severity, sticky: true });
    await nextTick();
  }
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

const hasClass = (el: HTMLElement, cls: string) =>
  el.classList?.contains(cls) || el.querySelector?.(`.${cls}`) != null;

describe("GAP-064 G3-A — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
    toastEventBus.emit("remove-all");
  });

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key and never under an old key (C1)", async () => {
      await render(c.component, c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts)(
      "resolves every referenced variable; exception list empty (C2) %o",
      async (props) => {
        await render(c.component, props);
        expect(unresolved(c.key)).toEqual([]);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  it("toast with messages of all six severities resolves every variable (C2)", async () => {
    await render(UToast, {}, true);
    expect(unresolved("toast")).toEqual([]);
  });

  describe("dynamic classes are emitted and styled (C3, §13.6 A/F)", () => {
    const rows: Array<{
      component: Component;
      key: string;
      props: Props;
      cls: string;
      toast?: boolean;
    }> = [
      ...POSITIONS.map((position) => ({
        component: UToast,
        key: "toast",
        props: { position },
        cls: `u-toast-${position}`,
      })),
      ...SEVERITIES.map((s) => ({
        component: UToast,
        key: "toast",
        props: {},
        cls: `u-toast-message-${s}`,
        toast: true,
      })),
      ...SEVERITIES.map((severity) => ({
        component: UMessage,
        key: "message",
        props: { severity },
        cls: `u-message-${severity}`,
      })),
      ...TAG_SEVERITIES.map((severity) => ({
        component: UTag,
        key: "tag",
        props: { value: "T", severity },
        cls: `u-tag-${severity}`,
      })),
      ...SEVERITIES.map((severity) => ({
        component: UInlineMessage,
        key: "inlinemessage",
        props: { severity },
        cls: `u-inline-message-${severity}`,
      })),
      ...(["vertical", "horizontal"] as const).map((layout) => ({
        component: UTimeline,
        key: "timeline",
        props: { value: ["A"], layout },
        cls: `u-timeline-${layout}`,
      })),
    ];
    it.each(rows)("$cls", async ({ component, key, props, cls, toast }) => {
      const el = await render(component, props, toast);
      expect(hasClass(el, cls), "class emitted").toBe(true);
      expect(cssFor(key), "selector styled").toContain(`.${cls}`);
    });
  });
});
