import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.applyUltimateTheme).toBeTypeOf("function");
    expect(mod.auraPreset).toBeTypeOf("object");
    expect(mod.auraPreset).not.toBeNull();
  });
});
