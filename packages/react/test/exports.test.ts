import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

// `@ultimate/react` has six entry points: the barrel plus one subpath per
// component (see `tsup.config.ts` and `package.json`'s `exports` map).
// Each must produce both a working `.mjs` module and a resolvable
// `.d.mts` declaration file, matching Phase 1's export-resolution
// precedent (`packages/uix-styled/test/exports.test.ts`), extended to
// cover every declared entry point rather than just one.
//
// UButton and UMenu are `React.forwardRef(...)` results (typeof "object",
// not "function"); UCheckbox, UDialog, and UTooltip are plain function
// components. Assert definedness with the shape each component actually
// has rather than a uniform "function" check.

describe("package exports: barrel (.)", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.UButton).toBeTypeOf("object"); // forwardRef
    expect(mod.UCheckbox).toBeTypeOf("function");
    expect(mod.UDialog).toBeTypeOf("function");
    expect(mod.UMenu).toBeTypeOf("object"); // forwardRef
    expect(mod.UTooltip).toBeTypeOf("function");
  });
});

describe("package exports: ./button", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "button", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "button", "index.d.mts"))).toBe(true);
  });

  it("UButton is callable/defined", async () => {
    const mod = await import("../dist/button/index.mjs");
    expect(mod.UButton).toBeTypeOf("object"); // forwardRef
  });
});

describe("package exports: ./checkbox", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "checkbox", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "checkbox", "index.d.mts"))).toBe(true);
  });

  it("UCheckbox is callable/defined", async () => {
    const mod = await import("../dist/checkbox/index.mjs");
    expect(mod.UCheckbox).toBeTypeOf("function");
  });
});

describe("package exports: ./dialog", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "dialog", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "dialog", "index.d.mts"))).toBe(true);
  });

  it("UDialog is callable/defined", async () => {
    const mod = await import("../dist/dialog/index.mjs");
    expect(mod.UDialog).toBeTypeOf("function");
  });
});

describe("package exports: ./menu", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "menu", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "menu", "index.d.mts"))).toBe(true);
  });

  it("UMenu is callable/defined", async () => {
    const mod = await import("../dist/menu/index.mjs");
    expect(mod.UMenu).toBeTypeOf("object"); // forwardRef
  });
});

describe("package exports: ./tooltip", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "tooltip", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "tooltip", "index.d.mts"))).toBe(true);
  });

  it("UTooltip is callable/defined", async () => {
    const mod = await import("../dist/tooltip/index.mjs");
    expect(mod.UTooltip).toBeTypeOf("function");
  });
});
