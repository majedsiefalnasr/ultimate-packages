/**
 * Canonical case matrices for the Prime-parity pilot (PARITY_PLAYBOOK.md §5).
 * Each Prime reference app renders `#/<component>/<case>` with the same content
 * as the mapped Ultimate story. Only the three pilot components are defined.
 */
export type Framework = "ng" | "vue";

/** How a case is opened. `button` clicks "Show drawer" (the Vue stories' trigger). */
export type Open = "none" | "button";

/** State applied before capture. `tab` presses Tab once from the page. */
export type State = "rest" | "tab";

export interface VisualCase {
  id: string;
  /** Prime showcase section the case comes from. */
  section: string;
  axis: string;
  /** Prime reference route when it differs from `id` (a state of another case). */
  prime?: string;
  story: Record<Framework, string>;
  open: Record<Framework, Open>;
  state?: State;
  /** `container` = the story root; `viewport` = the whole page (overlays). */
  capture: "container" | "viewport";
  /** Parts probed for this case (keys of the component's part map). */
  parts: string[];
  /** Sets `dir="rtl"` on <html>; the stories do the same. */
  rtl?: boolean;
}

/** A case recorded without a comparison: D (not applicable) or a coverage gap. */
export interface RecordedCase {
  id: string;
  section: string;
  kind: "D" | "coverage-gap";
  reason: string;
  /** D cases are still rendered on the Prime side, for the record. */
  primeOnly?: boolean;
}

export interface ComponentCases {
  key: string;
  tier: "A" | "B" | "C";
  /**
   * Part name → [Prime selector, Ultimate selector], or one pair per framework where
   * the DOM differs (Playbook §6.1). The first match is probed.
   */
  parts: Record<string, Pair | Record<Framework, Pair>>;
  visual: VisualCase[];
  recorded: RecordedCase[];
}

export type Pair = [prime: string, ultimate: string];

/** The selector for a part on one side of one framework. */
export function selector(
  c: ComponentCases,
  part: string,
  fw: Framework,
  side: "prime" | "ultimate"
): string {
  const entry = c.parts[part];
  const pair = Array.isArray(entry) ? entry : entry[fw];
  return pair[side === "prime" ? 0 : 1];
}

const both = (ng: string, vue: string) => ({ ng, vue });
const noOpen = { ng: "none", vue: "none" } as const;

export const TAG: ComponentCases = {
  key: "tag",
  tier: "C",
  parts: { root: [".p-tag", ".u-tag"], label: [".p-tag-label", ".u-tag-label"] },
  visual: [
    {
      id: "tag/default",
      section: "Basic",
      axis: "default",
      story: both("ng-tag--default", "vue-tag--default"),
      open: noOpen,
      capture: "container",
      parts: ["root", "label"],
    },
    {
      id: "tag/severities",
      section: "Severity",
      axis: "severity (strip)",
      story: both("ng-tag--all-severities", "vue-tag--all-severities"),
      open: noOpen,
      capture: "container",
      parts: ["root", "label"],
    },
  ],
  recorded: [
    {
      id: "tag/pill",
      section: "Pill",
      kind: "coverage-gap",
      reason: "Ultimate supports `rounded`, but no story renders it.",
    },
    {
      id: "tag/icon",
      section: "Icon",
      kind: "coverage-gap",
      reason: "Ultimate supports `icon`, but no story renders it.",
    },
  ],
};

export const MESSAGE: ComponentCases = {
  key: "message",
  tier: "B",
  parts: {
    root: [".p-message", ".u-message"],
    content: [".p-message-content", ".u-message-content"],
    text: [".p-message-text", ".u-message-text"],
    close: [".p-message-close-button", ".u-message-close-button"],
  },
  visual: [
    {
      id: "message/default",
      section: "Basic",
      axis: "default",
      story: both("ng-message--default", "vue-message--default"),
      open: noOpen,
      capture: "container",
      parts: ["root", "content", "text"],
    },
    {
      id: "message/severities",
      section: "Severity",
      axis: "severity (strip)",
      story: both("ng-message--all-severities", "vue-message--all-severities"),
      open: noOpen,
      capture: "container",
      parts: ["root", "content", "text"],
    },
    {
      id: "message/closable",
      section: "Closable",
      axis: "closable",
      story: both("ng-message--closable", "vue-message--closable"),
      open: noOpen,
      capture: "container",
      parts: ["root", "content", "text", "close"],
    },
    {
      id: "message/closable-focus",
      section: "Closable",
      axis: "focus-visible on the close button",
      prime: "message/closable",
      story: both("ng-message--closable", "vue-message--closable"),
      open: noOpen,
      state: "tab",
      capture: "container",
      parts: ["root", "close"],
    },
  ],
  recorded: [
    {
      id: "message/outlined",
      section: "Outlined",
      kind: "D",
      reason:
        "Ultimate Message has no `variant` input/prop; G3-A omitted the outlined groups (D-G3-3).",
      primeOnly: true,
    },
    {
      id: "message/simple",
      section: "Simple",
      kind: "D",
      reason:
        "Ultimate Message has no `variant` input/prop; G3-A omitted the simple groups (D-G3-3).",
      primeOnly: true,
    },
    {
      id: "message/sizes",
      section: "Sizes",
      kind: "D",
      reason: "Ultimate Message has no `size` input/prop; G3-A omitted the size groups (D-G3-3).",
      primeOnly: true,
    },
    {
      id: "message/icon",
      section: "Icon",
      kind: "coverage-gap",
      reason: "Ultimate supports `icon`, but no story renders it.",
    },
  ],
};

const drawer = (id: string, axis: string, ng: string, vue: string, rtl = false): VisualCase => ({
  id,
  section: id === "drawer/full" ? "FullScreen" : id === "drawer/left" ? "Basic" : "Position",
  axis,
  story: both(ng, vue),
  open: { ng: "none", vue: "button" },
  capture: "viewport",
  parts: ["root", "header", "close", "content"],
  rtl,
});

export const DRAWER: ComponentCases = {
  key: "drawer",
  tier: "A",
  parts: {
    root: [".p-drawer", ".u-drawer"],
    header: [".p-drawer-header", ".u-drawer-header"],
    // Angular: both libraries put the class on a button component host; probe the inner button.
    close: {
      ng: [".p-drawer-close-button > .p-button", ".u-drawer-close-button > .u-button"],
      vue: [".p-drawer-close-button", ".u-drawer-close-button"],
    },
    content: [".p-drawer-content", ".u-drawer-content"],
    mask: [".p-drawer-mask", ".u-drawer-mask"],
  },
  visual: [
    drawer("drawer/left", "default (left), open", "ng-drawer--open", "vue-drawer--default"),
    drawer(
      "drawer/right",
      "position right",
      "ng-drawer--right-position",
      "vue-drawer--right-position"
    ),
    drawer("drawer/top", "position top", "ng-drawer--top", "vue-drawer--top"),
    drawer("drawer/bottom", "position bottom", "ng-drawer--bottom", "vue-drawer--bottom"),
    drawer(
      "drawer/full",
      "full (sizing; GAP-097/GAP-098 positive control)",
      "ng-drawer--full",
      "vue-drawer--full"
    ),
    drawer("drawer/rtl", "left under dir=rtl", "ng-drawer--rtl", "vue-drawer--rtl", true),
  ],
  recorded: [
    {
      id: "drawer/template",
      section: "Template",
      kind: "coverage-gap",
      reason:
        "No Angular footer/header-template story; the Vue `WithFooter` story is reach-only (G3-D).",
    },
  ],
};

/** Drawer behavior (§7): run on the Prime reference and on Ultimate through the part map. */
export const DRAWER_BEHAVIOR = {
  closed: { story: both("ng-drawer--default", "vue-drawer--default"), prime: "drawer/closed" },
  open: {
    story: both("ng-drawer--open", "vue-drawer--default"),
    prime: "drawer/left",
    open: { ng: "none", vue: "button" } as Record<Framework, Open>,
  },
};

export const PILOT: ComponentCases[] = [DRAWER, MESSAGE, TAG];
