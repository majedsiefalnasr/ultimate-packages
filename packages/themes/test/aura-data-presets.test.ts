import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface PresetModule {
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
// Deep equality against upstream lives in aura-upstream-fidelity.test.ts, which is also
// the single source of truth for the exact registered set.
const MODULES: PresetModule[] = [
  {
    file: "order-list",
    exportName: "orderList",
    upstream: "orderlist",
    keys: ["root", "controls"],
    colorScheme: false,
  },
  {
    file: "pick-list",
    exportName: "pickList",
    upstream: "picklist",
    keys: ["root", "controls"],
    colorScheme: false,
  },
  {
    file: "data-view",
    exportName: "dataView",
    upstream: "dataview",
    keys: ["root", "header", "content", "footer", "paginatorTop", "paginatorBottom"],
    colorScheme: false,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: PresetModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Data preset modules", () => {
  it("covers the 3 Data modules", () => {
    expect(MODULES).toHaveLength(3);
  });

  describe.each(MODULES)("$file", (mod) => {
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

  describe("applyUltimateTheme with the Data modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("emits CSS variables for orderlist", () => {
      const { css } = Theme.getComponent("orderlist", {}) ?? {};
      expect(css).toContain("--u-orderlist-");
    });

    it("emits CSS variables for picklist", () => {
      const { css } = Theme.getComponent("picklist", {}) ?? {};
      expect(css).toContain("--u-picklist-");
    });

    it("emits CSS variables for dataview", () => {
      const { css } = Theme.getComponent("dataview", {}) ?? {};
      expect(css).toContain("--u-dataview-");
    });
  });
});
