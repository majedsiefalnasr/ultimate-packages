import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(
      true,
    );
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.definePreset).toBeTypeOf("function");
    expect(mod.updatePreset).toBeTypeOf("function");
    expect(mod.updatePrimaryPalette).toBeTypeOf("function");
    expect(mod.updateSurfacePalette).toBeTypeOf("function");
    expect(mod.usePreset).toBeTypeOf("function");
    expect(mod.useTheme).toBeTypeOf("function");
    expect(mod.dt).toBeTypeOf("function");
    expect(mod.dtwt).toBeTypeOf("function");
    expect(mod.t).toBeUndefined(); // upstream exports `$t`, not `t`
    expect(mod.$t).toBeTypeOf("function");
    expect(mod.$dt).toBeTypeOf("function");
    expect(mod.toVariables).toBeTypeOf("function");
    expect(mod.mix).toBeTypeOf("function");
    expect(mod.shade).toBeTypeOf("function");
    expect(mod.tint).toBeTypeOf("function");
    expect(mod.palette).toBeTypeOf("function");
    expect(mod.StyleSheet).toBeTypeOf("function");
    expect(mod.Theme).toBeTypeOf("object");
    expect(mod.ThemeService).toBeTypeOf("object");
    expect(mod.ThemeUtils).toBeTypeOf("object");
  });
});
