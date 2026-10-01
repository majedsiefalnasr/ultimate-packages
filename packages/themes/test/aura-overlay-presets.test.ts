import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface OverlayModule {
  /** Ultimate file name under `src/presets/aura/` (without `.ts`). */
  file: string;
  /** Ultimate named export. */
  exportName: string;
  /** Upstream module directory name; also the `auraPreset.components` key. */
  upstream: string;
  /** Upstream default-export top-level keys, in upstream order. */
  keys: string[];
}

// Key lists below were derived from `@primeuix/themes@2.0.3` (aura/<module>/index.mjs).
// None of the six Overlay-family modules has a `colorScheme` split upstream.
// Deep equality against upstream lives in aura-upstream-fidelity.test.ts.
const OVERLAY_MODULES: OverlayModule[] = [
  { file: "popover", exportName: "popover", upstream: "popover", keys: ["root", "content"] },
  {
    file: "drawer",
    exportName: "drawer",
    upstream: "drawer",
    keys: ["root", "header", "title", "content", "footer"],
  },
  {
    file: "context-menu",
    exportName: "contextMenu",
    upstream: "contextmenu",
    keys: ["root", "list", "item", "submenu", "submenuIcon", "separator"],
  },
  {
    file: "confirm-dialog",
    exportName: "confirmDialog",
    upstream: "confirmdialog",
    keys: ["icon", "content"],
  },
  {
    file: "confirm-popup",
    exportName: "confirmPopup",
    upstream: "confirmpopup",
    keys: ["root", "content", "icon", "footer"],
  },
  { file: "overlay-badge", exportName: "overlayBadge", upstream: "overlaybadge", keys: ["root"] },
];

const EXISTING_KEYS = [
  "button",
  "checkbox",
  "dialog",
  "menu",
  "tooltip",
  "radiobutton",
  "toggleswitch",
  "togglebutton",
  "inputtext",
  "textarea",
  "inputnumber",
  "inputotp",
  "password",
  "autocomplete",
  "select",
  "multiselect",
  "cascadeselect",
  "listbox",
  "selectbutton",
  "rating",
  "slider",
  "knob",
  "colorpicker",
  "datepicker",
  "fileupload",
  "iconfield",
  "floatlabel",
  "inputchips",
  "iftalabel",
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: OverlayModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Overlay-family preset modules", () => {
  it("covers the 6 Overlay-family modules", () => {
    expect(OVERLAY_MODULES).toHaveLength(6);
  });

  describe.each(OVERLAY_MODULES)("$file", (mod) => {
    it("exists and is registered under its upstream key", () => {
      expect(ultimateModule(mod)).toBeDefined();
      expect(auraPreset.components[mod.upstream]).toBe(ultimateModule(mod));
    });

    it("has exactly upstream's top-level keys", () => {
      expect(Object.keys(ultimateModule(mod) ?? {})).toEqual(mod.keys);
    });

    it("has no colorScheme split, matching upstream", () => {
      expect((ultimateModule(mod) as { colorScheme?: unknown }).colorScheme).toBeUndefined();
    });

    it("has only well-formed {token.path} references", () => {
      expect(malformedReferences(ultimateModule(mod))).toEqual([]);
    });

    it("resolves every {token.path} reference against base.ts in light and dark", () => {
      expect(unresolvedReferences(ultimateModule(mod))).toEqual([]);
    });
  });

  describe("auraPreset registration", () => {
    it("registers all 35 components (5 proof-set + 24 Form-family + 6 Overlay-family)", () => {
      const expected = [...EXISTING_KEYS, ...OVERLAY_MODULES.map((m) => m.upstream)].sort();
      expect(Object.keys(auraPreset.components).sort()).toEqual(expected);
      expect(expected).toHaveLength(35);
    });
  });

  describe("applyUltimateTheme with the Overlay-family modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("keeps the theme applied with all 35 components", () => {
      expect(Object.keys(Theme.getTheme()?.preset?.components ?? {})).toHaveLength(35);
    });

    it("emits CSS variables for popover", () => {
      const { css } = Theme.getComponent("popover", {}) ?? {};
      expect(css).toContain("--u-popover-gutter:10px");
      expect(css).toContain("--u-popover-arrow-offset:1.25rem");
    });

    it("emits CSS variables for a module without root (confirmdialog)", () => {
      const { css } = Theme.getComponent("confirmdialog", {}) ?? {};
      expect(css).toContain("--u-confirmdialog-icon-size:2rem");
      expect(css).toContain("--u-confirmdialog-content-gap:1rem");
    });

    it("emits CSS variables for overlaybadge", () => {
      const { css } = Theme.getComponent("overlaybadge", {}) ?? {};
      expect(css).toContain("--u-overlaybadge-outline-width:2px");
    });
  });
});
