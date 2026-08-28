import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("createMotion and shouldSkipMotion are exported", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.createMotion).toBeTypeOf("function");
    expect(mod.shouldSkipMotion).toBeTypeOf("function");
  });
});
