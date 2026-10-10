/**
 * GAP-064 G3-E canonical cases (Spec §6; PARITY_PLAYBOOK.md §5). Each case renders
 * `#/g3e/<prime>` in both reference apps (each with its own framework's content) and
 * the mapped Ultimate story. Components are added per batch (Plan Tasks 5, 8, 11, 14).
 */
import type { Framework, Open, Pair, RecordedCase, State } from "./cases";

export type Batch = "smoke" | "E-1" | "E-2" | "E-3" | "E-4";

/** Actions run on both sides before probing; strings are part names, `advance` is ms. */
export type Action =
  | { click: string }
  | { press: string }
  | { hover: string }
  | { range: [string, number] }
  | { fill: [string, string] }
  | { advance: number }
  | { drag: [string, number, number] }; // part, from index, to index (Angular CDK drag on both sides)

/** Observable facts compared Prime ↔ Ultimate. */
export type Fact =
  | { shown: string }
  | { texts: string }
  | { attr: [string, string] }
  | { focused: true }
  | { direction: string };

export interface G3ECase {
  id: string;
  batch: Batch;
  section: string;
  axis: string;
  /** Reference route; the same id in both reference apps (each renders its own framework's content). */
  prime: string;
  story: Partial<Record<Framework, string>>;
  open: Record<Framework, Open>;
  state?: State;
  clock?: boolean;
  actions?: Action[];
  capture: "container" | "viewport";
  parts: string[];
  facts?: Fact[];
  kind: "visual" | "behavior";
}

export interface G3EComponent {
  key: string;
  tier: "A" | "B";
  batch: Batch;
  parts: Record<string, Pair | Record<Framework, Pair>>;
  cases: G3ECase[];
  recorded: RecordedCase[];
}

const none = { ng: "none", vue: "none" } as const;

export const G3E: G3EComponent[] = [
  {
    key: "smoke",
    tier: "B",
    batch: "smoke",
    parts: { root: [".p-tag", ".u-tag"], label: [".p-tag-label", ".u-tag-label"] },
    cases: [
      {
        id: "smoke/tag",
        batch: "smoke",
        section: "Basic",
        axis: "runner smoke test",
        prime: "tag/default",
        story: { ng: "ng-tag--default", vue: "vue-tag--default" },
        open: none,
        capture: "container",
        parts: ["root", "label"],
        facts: [{ texts: "label" }, { direction: "root" }],
        kind: "visual",
      },
      {
        // G3E-4 / Review Focus 2: the clock path (paused clock, settled by advancing time).
        id: "smoke/tag-clock",
        batch: "smoke",
        section: "Basic",
        axis: "runner smoke test with the clock",
        prime: "tag/default",
        story: { ng: "ng-tag--default", vue: "vue-tag--default" },
        open: none,
        clock: true,
        actions: [{ advance: 500 }],
        capture: "container",
        parts: ["root", "label"],
        kind: "visual",
      },
    ],
    recorded: [],
  },
];

const both = (id: string) => ({ ng: `ng-${id}`, vue: `vue-${id}` });

// E-1 (Image, ImageCompare) — Spec §6.1, §6.2.
G3E.push(
  {
    key: "image",
    tier: "B",
    batch: "E-1",
    parts: {
      root: [".p-image", ".u-image"],
      img: [".p-image > img", ".u-image > img"],
      previewMask: [".p-image-preview-mask", ".u-image-preview-mask"],
      mask: [".p-image-mask", ".u-image-mask"],
      toolbar: [".p-image-toolbar", ".u-image-toolbar"],
      original: [".p-image-original", ".u-image-original"],
      zoomIn: [".p-image-zoom-in-button", ".u-image-zoom-in-button"],
      zoomOut: [".p-image-zoom-out-button", ".u-image-zoom-out-button"],
      close: [".p-image-close-button", ".u-image-close-button"],
    },
    cases: [
      {
        id: "image/default",
        batch: "E-1",
        section: "Basic",
        axis: "default",
        prime: "image/default",
        story: both("image--default"),
        open: none,
        capture: "container",
        parts: ["root", "img"],
        kind: "visual",
      },
      {
        id: "image/preview-hover",
        batch: "E-1",
        section: "Preview",
        axis: "hover",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        actions: [{ hover: "root" }],
        capture: "container",
        parts: ["root", "previewMask"],
        kind: "visual",
      },
      {
        id: "image/preview-open",
        batch: "E-1",
        section: "Preview",
        axis: "open",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        clock: true,
        actions: [{ click: "previewMask" }, { advance: 1000 }],
        capture: "viewport",
        parts: ["mask", "toolbar", "original", "close"],
        kind: "visual",
      },
      {
        id: "image/preview-zoom",
        batch: "E-1",
        section: "Preview",
        axis: "zoom in",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        clock: true,
        actions: [
          { click: "previewMask" },
          { advance: 1000 },
          { click: "zoomIn" },
          { advance: 1000 },
        ],
        capture: "viewport",
        parts: ["mask", "original", "zoomOut"],
        facts: [{ attr: ["zoomOut", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "image/preview-close",
        batch: "E-1",
        section: "Preview",
        axis: "Escape",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        clock: true,
        actions: [
          { click: "previewMask" },
          { advance: 1000 },
          { press: "Escape" },
          { advance: 1000 },
        ],
        capture: "viewport",
        parts: ["root"],
        facts: [{ shown: "mask" }, { focused: true }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "image/template",
        section: "Template",
        kind: "D",
        reason: "No Ultimate indicator/image template slots.",
      },
      {
        id: "image/preview-image-source",
        section: "PreviewImageSource (PrimeNG)",
        kind: "D",
        reason: "No Ultimate previewImageSrc input.",
      },
    ],
  },
  {
    key: "imagecompare",
    tier: "B",
    batch: "E-1",
    parts: {
      root: [".p-imagecompare", ".u-image-compare"],
      left: [".p-imagecompare > img:first-of-type", ".u-image-compare > img"],
      right: [".p-imagecompare img + img", ".u-image-compare > span > img"],
      slider: [".p-imagecompare-slider", ".u-image-compare-slider"],
    },
    cases: [
      {
        id: "imagecompare/default",
        batch: "E-1",
        section: "Basic",
        axis: "default 50 %",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        capture: "container",
        parts: ["root", "left", "right", "slider"],
        kind: "visual",
      },
      {
        id: "imagecompare/slide",
        batch: "E-1",
        section: "Basic",
        axis: "slider 25 %",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        actions: [{ range: ["slider", 25] }],
        capture: "container",
        parts: ["root", "right"],
        kind: "behavior",
      },
      {
        id: "imagecompare/focus",
        batch: "E-1",
        section: "Basic",
        axis: "focus-visible",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        state: "tab",
        capture: "container",
        parts: ["root", "slider"],
        kind: "visual",
      },
      {
        id: "imagecompare/rtl",
        batch: "E-1",
        section: "(upstream :dir(rtl))",
        axis: "RTL",
        prime: "imagecompare/rtl",
        story: both("imagecompare--rtl"),
        open: none,
        capture: "container",
        parts: ["root", "right"],
        facts: [{ direction: "root" }],
        kind: "visual",
      },
      {
        id: "imagecompare/root-style",
        batch: "E-1",
        section: "Basic",
        axis: "consumer style on root (GAP-102)",
        prime: "imagecompare/root-style",
        story: both("imagecompare--default"),
        open: none,
        capture: "container",
        parts: ["root"],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "imagecompare/responsive",
        section: "Responsive",
        kind: "D",
        reason: "Demo-only Tailwind sizing classes.",
      },
    ],
  }
);

G3E.push(
  {
    key: "carousel",
    tier: "A",
    batch: "E-2",
    parts: {
      root: [".p-carousel", ".u-carousel"],
      viewport: [".p-carousel-viewport", ".u-carousel-viewport"],
      item: [".p-carousel-item", ".u-carousel-item"],
      prev: {
        ng: [".p-carousel-prev-button .p-button", ".u-carousel-prev-button"],
        vue: [".p-carousel-prev-button", ".u-carousel-prev-button"],
      },
      next: {
        ng: [".p-carousel-next-button .p-button", ".u-carousel-next-button"],
        vue: [".p-carousel-next-button", ".u-carousel-next-button"],
      },
      indicators: [".p-carousel-indicator-button", ".u-carousel-indicator-button"],
      activeIndicator: [
        ".p-carousel-indicator-active .p-carousel-indicator-button",
        ".u-carousel-indicator-active .u-carousel-indicator-button",
      ],
    },
    cases: [
      {
        id: "carousel/default",
        batch: "E-2",
        section: "Basic",
        axis: "default",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        capture: "container",
        parts: ["root", "item", "prev", "activeIndicator"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "visual",
      },
      {
        id: "carousel/next",
        batch: "E-2",
        section: "Basic",
        axis: "next",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ click: "next" }],
        capture: "container",
        parts: ["root", "item", "prev", "activeIndicator"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "carousel/indicator",
        batch: "E-2",
        section: "Basic",
        axis: "indicator click",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ click: "indicators" }, { press: "ArrowRight" }, { press: "Enter" }],
        capture: "container",
        parts: ["root", "activeIndicator"],
        kind: "behavior",
      },
      {
        id: "carousel/nav-focus",
        batch: "E-2",
        section: "Basic",
        axis: "focus-visible next",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ press: "Tab" }, { press: "Tab" }],
        capture: "container",
        parts: ["root", "next"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "carousel/circular",
        batch: "E-2",
        section: "Circular",
        axis: "circular, 1 visible",
        prime: "carousel/circular",
        story: both("carousel--circular-with-autoplay"),
        open: none,
        clock: true,
        capture: "container",
        parts: ["root", "item", "prev"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "visual",
      },
      {
        id: "carousel/vertical",
        batch: "E-2",
        section: "Vertical",
        axis: "vertical",
        prime: "carousel/vertical",
        story: both("carousel--vertical"),
        open: none,
        capture: "container",
        parts: ["root", "viewport", "prev"],
        kind: "visual",
      },
      {
        id: "carousel/rtl",
        batch: "E-2",
        section: "(upstream :dir(rtl))",
        axis: "RTL",
        prime: "carousel/rtl",
        story: both("carousel--rtl"),
        open: none,
        capture: "container",
        parts: ["root", "prev", "next"],
        facts: [{ direction: "root" }],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "carousel/responsive",
        section: "Responsive",
        kind: "D",
        reason: "No responsiveOptions.",
      },
      {
        id: "carousel/header-footer",
        section: "(facets)",
        kind: "D",
        reason: "No header/footer template.",
      },
    ],
  },
  {
    key: "galleria",
    tier: "A",
    batch: "E-2",
    parts: {
      root: [".p-galleria", ".u-galleria"],
      item: [".p-galleria-item", ".u-galleria-item-container"],
      prev: [".p-galleria-prev-button", ".u-galleria-prev-button"],
      next: [".p-galleria-next-button", ".u-galleria-next-button"],
      thumbnails: [".p-galleria-thumbnail-items", ".u-galleria-thumbnail-list"],
      thumbnail: [".p-galleria-thumbnail-item", ".u-galleria-thumbnail-item"],
      current: [".p-galleria-thumbnail-item-current", ".u-galleria-thumbnail-item-active"],
      mask: [".p-galleria-mask", ".u-galleria-mask"],
      close: [".p-galleria-close-button", ".u-galleria-close-button"],
      show: ["#root button", "#storybook-root button"],
    },
    cases: [
      {
        id: "galleria/item-thumbnails",
        batch: "E-2",
        section: "Navigator: item + thumbnails",
        axis: "default",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        capture: "container",
        parts: ["root", "item", "next", "current"],
        kind: "visual",
      },
      {
        id: "galleria/no-thumbnails",
        batch: "E-2",
        section: "Navigator: without thumbnails",
        axis: "showThumbnails false",
        prime: "galleria/no-thumbnails",
        story: both("galleria--without-thumbnails"),
        open: none,
        capture: "container",
        parts: ["root", "item", "next"],
        kind: "visual",
      },
      {
        id: "galleria/next",
        batch: "E-2",
        section: "Navigator",
        axis: "next",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ click: "next" }],
        capture: "container",
        parts: ["root", "current"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "galleria/thumbnail-select",
        batch: "E-2",
        section: "Basic",
        axis: "thumbnail click",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ click: "thumbnail" }],
        capture: "container",
        parts: ["root", "current"],
        kind: "behavior",
      },
      {
        id: "galleria/nav-focus",
        batch: "E-2",
        section: "Navigator",
        axis: "focus-visible next",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ press: "Tab" }, { press: "Tab" }],
        capture: "container",
        parts: ["root", "next"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "galleria/fullscreen",
        batch: "E-2",
        section: "FullScreen: with thumbnails",
        axis: "open",
        prime: "galleria/fullscreen",
        story: both("galleria--full-screen"),
        open: none,
        clock: true,
        actions: [{ click: "show" }, { advance: 500 }],
        capture: "viewport",
        parts: ["mask", "item", "close"],
        kind: "visual",
      },
      {
        id: "galleria/fullscreen-close",
        batch: "E-2",
        section: "FullScreen",
        axis: "Escape",
        prime: "galleria/fullscreen",
        story: both("galleria--full-screen"),
        open: none,
        clock: true,
        actions: [{ click: "show" }, { advance: 500 }, { press: "Escape" }, { advance: 500 }],
        capture: "viewport",
        parts: ["show"],
        facts: [{ shown: "mask" }, { focused: true }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "galleria/indicators",
        section: "Indicator (all)",
        kind: "D",
        reason: "No showIndicators.",
      },
      {
        id: "galleria/thumbnail-position",
        section: "Thumbnail",
        kind: "D",
        reason: "No thumbnailsPosition.",
      },
      {
        id: "galleria/responsive",
        section: "Responsive",
        kind: "D",
        reason: "No responsiveOptions.",
      },
      { id: "galleria/caption", section: "Caption", kind: "D", reason: "No caption template." },
      {
        id: "galleria/hover-navigators",
        section: "Navigator: hover",
        kind: "D",
        reason: "No showItemNavigatorsOnHover.",
      },
      {
        id: "galleria/custom-fullscreen",
        section: "FullScreen: custom content",
        kind: "D",
        reason: "No custom full-screen content.",
      },
      {
        id: "galleria/advanced",
        section: "Advanced",
        kind: "D",
        reason: "Composite demo of unsupported features.",
      },
    ],
  }
);

G3E.push(
  {
    key: "orderlist",
    tier: "B",
    batch: "E-3",
    parts: {
      root: [".p-orderlist", ".u-order-list"],
      controls: [".p-orderlist-controls", ".u-order-list-controls"],
      firstControl: [".p-orderlist-controls button", ".u-order-list-controls button"],
      list: {
        ng: [".p-listbox", ".u-listbox"],
        vue: [".p-listbox", ".u-order-list-list .u-listbox"],
      },
      option: [".p-listbox-option", ".u-listbox-option"],
      filter: [".p-listbox-filter, .p-orderlist input[type=text]", "input[role=searchbox]"],
      // Step 3 harness fix: in drag mode Ultimate Angular renders CDK `li` items, not Listbox options.
      dragItem: [".p-listbox-option", ".u-order-list-item"],
    },
    cases: [
      {
        id: "orderlist/default",
        batch: "E-3",
        section: "Basic",
        axis: "default",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--default", vue: "data-orderlist--default" },
        open: none,
        capture: "container",
        parts: ["root", "controls", "firstControl", "option"],
        kind: "visual",
      },
      {
        id: "orderlist/selected",
        batch: "E-3",
        section: "Basic",
        axis: "one selected",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--controlled", vue: "data-orderlist--controlled" },
        open: none,
        actions: [{ click: "option" }],
        capture: "container",
        parts: ["root", "option", "firstControl"],
        facts: [{ attr: ["option", "aria-selected"] }],
        kind: "visual",
      },
      {
        id: "orderlist/move",
        batch: "E-3",
        section: "Basic",
        axis: "select second, move up",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--controlled", vue: "data-orderlist--controlled" },
        open: none,
        actions: [{ click: "option" }, { press: "ArrowDown" }, { press: "Enter" }],
        capture: "container",
        parts: ["root"],
        facts: [{ texts: "option" }, { attr: ["option", "aria-selected"] }],
        kind: "behavior",
      },
      {
        id: "orderlist/focus",
        batch: "E-3",
        section: "Basic",
        axis: "keyboard focus on an option",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--default", vue: "data-orderlist--default" },
        open: none,
        // Step 3: one Tab focuses the (source) listbox on every side; options take virtual focus.
        actions: [{ press: "Tab" }],
        capture: "container",
        parts: ["root", "option"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "orderlist/filter",
        batch: "E-3",
        section: "Filter (PrimeNG)",
        axis: "filter input",
        prime: "orderlist/filter",
        story: { ng: "data-orderlist--filter" },
        open: none,
        actions: [{ fill: ["filter", "an"] }],
        capture: "container",
        parts: ["root", "filter", "option"],
        facts: [{ texts: "option" }],
        kind: "visual",
      },
      {
        id: "orderlist/dragdrop",
        batch: "E-3",
        section: "DragDrop (PrimeNG)",
        axis: "drag reorder",
        prime: "orderlist/dragdrop",
        story: { ng: "data-orderlist--with-drag-drop" },
        open: none,
        // Plan Task 11 Step 1 text: "uses an extra action" (drag); index pair is a harness fill-in (E-3 record).
        actions: [{ drag: ["dragItem", 0, 2] }],
        capture: "container",
        parts: ["root", "dragItem"],
        facts: [{ texts: "dragItem" }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "orderlist/controls-position",
        section: "controlsPosition (PrimeNG)",
        kind: "D",
        reason:
          "No Ultimate controlsPosition input; the PrimeNG-local rule is recorded, not ported (OI-E1: feature absent).",
      },
      {
        id: "orderlist/template",
        section: "Template",
        kind: "D",
        reason: "No Ultimate item template.",
      },
    ],
  },
  {
    key: "picklist",
    tier: "B",
    batch: "E-3",
    parts: {
      root: [".p-picklist", ".u-pick-list"],
      source: [".p-picklist-source-list-container", ".u-pick-list-source .u-pick-list-list"],
      transfer: [".p-picklist-transfer-controls", ".u-pick-list > .u-pick-list-controls"],
      target: [".p-picklist-target-list-container", ".u-pick-list-target .u-pick-list-list"],
      option: [
        ".p-picklist-source-list-container .p-listbox-option",
        ".u-pick-list-source .u-listbox-option",
      ],
      targetOption: [
        ".p-picklist-target-list-container .p-listbox-option",
        ".u-pick-list-target .u-listbox-option",
      ],
      transferButton: [
        ".p-picklist-transfer-controls button",
        ".u-pick-list > .u-pick-list-controls button",
      ],
      filter: [
        ".p-picklist-source-list-container input[type=text]",
        ".u-pick-list-source input[role=searchbox]",
      ],
    },
    cases: [
      {
        id: "picklist/default",
        batch: "E-3",
        section: "Basic",
        axis: "default",
        prime: "picklist/basic",
        story: { ng: "data-picklist--default", vue: "data-picklist--default" },
        open: none,
        capture: "container",
        parts: ["root", "source", "transfer", "target"],
        kind: "visual",
      },
      {
        id: "picklist/selected",
        batch: "E-3",
        section: "Basic",
        axis: "one source item selected",
        prime: "picklist/basic",
        story: { ng: "data-picklist--controlled", vue: "data-picklist--controlled" },
        open: none,
        actions: [{ click: "option" }],
        capture: "container",
        parts: ["root", "option", "transferButton"],
        facts: [{ attr: ["option", "aria-selected"] }],
        kind: "visual",
      },
      {
        id: "picklist/transfer",
        batch: "E-3",
        section: "Basic",
        axis: "move to target",
        prime: "picklist/basic",
        story: { ng: "data-picklist--controlled", vue: "data-picklist--controlled" },
        open: none,
        actions: [{ click: "option" }, { click: "transferButton" }],
        capture: "container",
        parts: ["root"],
        facts: [{ texts: "option" }, { texts: "targetOption" }],
        kind: "behavior",
      },
      {
        id: "picklist/focus",
        batch: "E-3",
        section: "Basic",
        axis: "keyboard focus on an option",
        prime: "picklist/basic",
        story: { ng: "data-picklist--default", vue: "data-picklist--default" },
        open: none,
        // Step 3: one Tab focuses the (source) listbox on every side; options take virtual focus.
        actions: [{ press: "Tab" }],
        capture: "container",
        parts: ["root", "option"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "picklist/filter",
        batch: "E-3",
        section: "Filter (PrimeNG)",
        axis: "source filter",
        prime: "picklist/filter",
        story: { ng: "data-picklist--filter" },
        open: none,
        actions: [{ fill: ["filter", "an"] }],
        capture: "container",
        parts: ["root", "filter", "option"],
        facts: [{ texts: "option" }],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "picklist/template",
        section: "Template(s)",
        kind: "D",
        reason: "No Ultimate item templates.",
      },
      {
        id: "picklist/responsive",
        section: "breakpoint",
        kind: "D",
        reason: "Needs a viewport change; not canonical at 1280 × 720.",
      },
    ],
  }
);
