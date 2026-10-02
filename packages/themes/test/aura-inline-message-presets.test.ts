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
    file: "inline-message",
    exportName: "inlineMessage",
    upstream: "inlinemessage",
    keys: ["root", "text", "icon", "colorScheme"],
    colorScheme: true,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: PresetModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura InlineMessage preset module", () => {
  it("covers the 1 InlineMessage module", () => {
    expect(MODULES).toHaveLength(1);
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

  describe("applyUltimateTheme with the InlineMessage module", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("emits CSS variables for inlinemessage", () => {
      const { css } = Theme.getComponent("inlinemessage", {}) ?? {};
      expect(css).toContain("--u-inlinemessage-");
    });
  });
});
