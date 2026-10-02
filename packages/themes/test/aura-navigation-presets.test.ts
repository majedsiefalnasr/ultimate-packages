import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface NavigationModule {
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
// Only `tabs` has a `colorScheme` split upstream. Upstream `tabview`/`tabmenu` are
// deliberately not ported here (carried forward). Deep equality against upstream
// lives in aura-upstream-fidelity.test.ts, which is also the single source of truth
// for the exact registered set.
const NAVIGATION_MODULES: NavigationModule[] = [
  {
    file: "breadcrumb",
    exportName: "breadcrumb",
    upstream: "breadcrumb",
    keys: ["root", "item", "separator"],
    colorScheme: false,
  },
  {
    file: "mega-menu",
    exportName: "megaMenu",
    upstream: "megamenu",
    keys: [
      "root",
      "baseItem",
      "item",
      "overlay",
      "submenu",
      "submenuLabel",
      "submenuIcon",
      "separator",
      "mobileButton",
    ],
    colorScheme: false,
  },
  {
    file: "menubar",
    exportName: "menubar",
    upstream: "menubar",
    keys: ["root", "baseItem", "item", "submenu", "separator", "mobileButton"],
    colorScheme: false,
  },
  {
    file: "panel-menu",
    exportName: "panelMenu",
    upstream: "panelmenu",
    keys: ["root", "panel", "item", "submenu", "submenuIcon"],
    colorScheme: false,
  },
  {
    file: "tiered-menu",
    exportName: "tieredMenu",
    upstream: "tieredmenu",
    keys: ["root", "list", "item", "submenu", "submenuIcon", "separator"],
    colorScheme: false,
  },
  {
    file: "tabs",
    exportName: "tabs",
    upstream: "tabs",
    keys: ["root", "tablist", "tab", "tabpanel", "navButton", "activeBar", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "stepper",
    exportName: "stepper",
    upstream: "stepper",
    keys: [
      "root",
      "separator",
      "step",
      "stepHeader",
      "stepTitle",
      "stepNumber",
      "steppanels",
      "steppanel",
    ],
    colorScheme: false,
  },
  {
    file: "steps",
    exportName: "steps",
    upstream: "steps",
    keys: ["root", "separator", "itemLink", "itemLabel", "itemNumber"],
    colorScheme: false,
  },
  {
    file: "dock",
    exportName: "dock",
    upstream: "dock",
    keys: ["root", "item"],
    colorScheme: false,
  },
  {
    file: "speed-dial",
    exportName: "speedDial",
    upstream: "speeddial",
    keys: ["root"],
    colorScheme: false,
  },
  {
    file: "split-button",
    exportName: "splitButton",
    upstream: "splitbutton",
    keys: ["root"],
    colorScheme: false,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: NavigationModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Navigation-family preset modules", () => {
  it("covers the 11 Navigation-family modules (tabview/tabmenu are not ported)", () => {
    expect(NAVIGATION_MODULES).toHaveLength(11);
    const upstream = NAVIGATION_MODULES.map((m) => m.upstream);
    expect(upstream).not.toContain("tabview");
    expect(upstream).not.toContain("tabmenu");
  });

  describe.each(NAVIGATION_MODULES)("$file", (mod) => {
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

  describe("applyUltimateTheme with the Navigation-family modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("emits CSS variables for a flat module (breadcrumb)", () => {
      const { css } = Theme.getComponent("breadcrumb", {}) ?? {};
      expect(css).toContain("--u-breadcrumb-padding:1rem");
      expect(css).toContain("--u-breadcrumb-gap:0.5rem");
    });

    it("emits CSS variables for a single-section module (splitbutton)", () => {
      const { css } = Theme.getComponent("splitbutton", {}) ?? {};
      expect(css).toContain("--u-splitbutton-rounded-border-radius:2rem");
    });

    it("emits mode-split CSS variables for a colorScheme module (tabs)", () => {
      const { css } = Theme.getComponent("tabs", {}) ?? {};
      expect(css).toContain("--u-tabs-tablist-background:");
      expect(css).toContain("--u-tabs-tab-active-color:");
    });
  });
});
