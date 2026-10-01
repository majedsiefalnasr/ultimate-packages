import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface PanelModule {
  /** Ultimate file name under `src/presets/aura/` (without `.ts`). */
  file: string;
  /** Ultimate named export. */
  exportName: string;
  /** Upstream module directory name; also the `auraPreset.components` key. */
  upstream: string;
  /** Upstream default-export top-level keys, in upstream order. */
  keys: string[];
  /** Whether upstream has a `colorScheme` split. */
  colorScheme: boolean;
}

// Key lists below were derived from `@primeuix/themes@2.0.3` (aura/<module>/index.mjs).
// colorScheme splits upstream: carousel, chip, galleria, message, progressspinner,
// scrollpanel, skeleton, tag, toast. Deep equality against upstream lives in
// aura-upstream-fidelity.test.ts, which is also the single source of truth for the
// exact registered set.
const PANEL_MODULES: PanelModule[] = [
  {
    file: "accordion",
    exportName: "accordion",
    upstream: "accordion",
    keys: ["root", "panel", "header", "content"],
    colorScheme: false,
  },
  {
    file: "avatar",
    exportName: "avatar",
    upstream: "avatar",
    keys: ["root", "icon", "group", "lg", "xl"],
    colorScheme: false,
  },
  {
    file: "block-ui",
    exportName: "blockUI",
    upstream: "blockui",
    keys: ["root"],
    colorScheme: false,
  },
  {
    file: "card",
    exportName: "card",
    upstream: "card",
    keys: ["root", "body", "caption", "title", "subtitle"],
    colorScheme: false,
  },
  {
    file: "carousel",
    exportName: "carousel",
    upstream: "carousel",
    keys: ["root", "content", "indicatorList", "indicator", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "chip",
    exportName: "chip",
    upstream: "chip",
    keys: ["root", "image", "icon", "removeIcon", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "divider",
    exportName: "divider",
    upstream: "divider",
    keys: ["root", "content", "horizontal", "vertical"],
    colorScheme: false,
  },
  {
    file: "fieldset",
    exportName: "fieldset",
    upstream: "fieldset",
    keys: ["root", "legend", "toggleIcon", "content"],
    colorScheme: false,
  },
  {
    file: "galleria",
    exportName: "galleria",
    upstream: "galleria",
    keys: [
      "root",
      "navButton",
      "navIcon",
      "thumbnailsContent",
      "thumbnailNavButton",
      "thumbnailNavButtonIcon",
      "caption",
      "indicatorList",
      "indicatorButton",
      "insetIndicatorList",
      "insetIndicatorButton",
      "closeButton",
      "closeButtonIcon",
      "colorScheme",
    ],
    colorScheme: true,
  },
  {
    file: "image",
    exportName: "image",
    upstream: "image",
    keys: ["root", "preview", "toolbar", "action"],
    colorScheme: false,
  },
  {
    file: "image-compare",
    exportName: "imageCompare",
    upstream: "imagecompare",
    keys: ["handle"],
    colorScheme: false,
  },
  {
    file: "inplace",
    exportName: "inplace",
    upstream: "inplace",
    keys: ["root", "display"],
    colorScheme: false,
  },
  {
    file: "message",
    exportName: "message",
    upstream: "message",
    keys: [
      "root",
      "content",
      "text",
      "icon",
      "closeButton",
      "closeIcon",
      "outlined",
      "simple",
      "colorScheme",
    ],
    colorScheme: true,
  },
  {
    file: "meter-group",
    exportName: "meterGroup",
    upstream: "metergroup",
    keys: ["root", "meters", "label", "labelMarker", "labelIcon", "labelList"],
    colorScheme: false,
  },
  {
    file: "panel",
    exportName: "panel",
    upstream: "panel",
    keys: ["root", "header", "toggleableHeader", "title", "content", "footer"],
    colorScheme: false,
  },
  {
    file: "progress-bar",
    exportName: "progressBar",
    upstream: "progressbar",
    keys: ["root", "value", "label"],
    colorScheme: false,
  },
  {
    file: "progress-spinner",
    exportName: "progressSpinner",
    upstream: "progressspinner",
    keys: ["colorScheme"],
    colorScheme: true,
  },
  {
    file: "scroll-panel",
    exportName: "scrollPanel",
    upstream: "scrollpanel",
    keys: ["root", "bar", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "skeleton",
    exportName: "skeleton",
    upstream: "skeleton",
    keys: ["root", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "splitter",
    exportName: "splitter",
    upstream: "splitter",
    keys: ["root", "gutter", "handle"],
    colorScheme: false,
  },
  {
    file: "tag",
    exportName: "tag",
    upstream: "tag",
    keys: ["root", "icon", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "terminal",
    exportName: "terminal",
    upstream: "terminal",
    keys: ["root", "prompt", "commandResponse"],
    colorScheme: false,
  },
  {
    file: "timeline",
    exportName: "timeline",
    upstream: "timeline",
    keys: ["event", "horizontal", "vertical", "eventMarker", "eventConnector"],
    colorScheme: false,
  },
  {
    file: "toolbar",
    exportName: "toolbar",
    upstream: "toolbar",
    keys: ["root"],
    colorScheme: false,
  },
  {
    file: "toast",
    exportName: "toast",
    upstream: "toast",
    keys: [
      "root",
      "icon",
      "content",
      "text",
      "summary",
      "detail",
      "closeButton",
      "closeIcon",
      "colorScheme",
    ],
    colorScheme: true,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: PanelModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Panel/Layout/Display/Feedback preset modules", () => {
  it("covers the 25 Panel/Layout/Display/Feedback modules", () => {
    expect(PANEL_MODULES).toHaveLength(25);
  });

  describe.each(PANEL_MODULES)("$file", (mod) => {
    it("exists and is registered under its upstream key", () => {
      expect(ultimateModule(mod)).toBeDefined();
      expect(auraPreset.components[mod.upstream]).toBe(ultimateModule(mod));
    });

    it("has exactly upstream's top-level keys", () => {
      expect(Object.keys(ultimateModule(mod) ?? {})).toEqual(mod.keys);
    });

    it(`${mod.colorScheme ? "has" : "has no"} colorScheme split, matching upstream`, () => {
      const tokens = ultimateModule(mod) as { colorScheme?: { light?: object; dark?: object } };
      if (mod.colorScheme) {
        expect(tokens.colorScheme?.light).toBeDefined();
        expect(tokens.colorScheme?.dark).toBeDefined();
      } else {
        expect(tokens.colorScheme).toBeUndefined();
      }
    });

    it("has only well-formed {token.path} references", () => {
      expect(malformedReferences(ultimateModule(mod))).toEqual([]);
    });

    it("resolves every {token.path} reference against base.ts in light and dark", () => {
      expect(unresolvedReferences(ultimateModule(mod))).toEqual([]);
    });
  });

  describe("applyUltimateTheme with the Panel/Layout/Display/Feedback modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("emits CSS variables for a flat module (card)", () => {
      const { css } = Theme.getComponent("card", {}) ?? {};
      expect(css).toContain("--u-card-border-radius:");
      expect(css).toContain("--u-card-body-padding:");
    });

    it("emits CSS variables for a module without a root section (timeline)", () => {
      const { css } = Theme.getComponent("timeline", {}) ?? {};
      expect(css).toContain("--u-timeline-event-min-height:");
    });

    it("emits mode-split CSS variables for a colorScheme-only module (progressspinner)", () => {
      const { css } = Theme.getComponent("progressspinner", {}) ?? {};
      expect(css).toContain("--u-progressspinner-color-one:");
    });

    it("emits mode-split severity CSS variables for a colorScheme module (message)", () => {
      const { css } = Theme.getComponent("message", {}) ?? {};
      expect(css).toContain("--u-message-info-background:");
      expect(css).toContain("--u-message-error-color:");
    });
  });
});
