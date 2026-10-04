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

// GAP-064 Tranche 1. Key lists derived from `@primeuix/themes@2.0.3`
// (aura/<module>/index.mjs). Deep equality against upstream lives in
// aura-upstream-fidelity.test.ts.
const MODULES: PresetModule[] = [
  {
    file: "badge",
    exportName: "badge",
    upstream: "badge",
    keys: ["root", "dot", "sm", "lg", "xl", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "input-group",
    exportName: "inputGroup",
    upstream: "inputgroup",
    keys: ["addon"],
    colorScheme: false,
  },
  {
    file: "paginator",
    exportName: "paginator",
    upstream: "paginator",
    keys: ["root", "navButton", "currentPageReport", "jumpToPageInput"],
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

describe("Aura Badge/InputGroup/Paginator preset modules (GAP-064 Tranche 1)", () => {
  it("covers the 3 Tranche 1 modules", () => {
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

  describe("applyUltimateTheme with the Tranche 1 modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it.each(MODULES)("emits CSS variables for $upstream", ({ upstream }) => {
      const { css } = Theme.getComponent(upstream, {}) ?? {};
      expect(css).toContain(`--u-${upstream}-`);
    });

    it("emits Badge's dark colorScheme block (Review Focus 3)", () => {
      const { css } = Theme.getComponent("badge", {}) ?? {};
      expect(css).toContain("prefers-color-scheme: dark");
      expect(css).toContain("--u-badge-primary-background");
    });
  });
});
