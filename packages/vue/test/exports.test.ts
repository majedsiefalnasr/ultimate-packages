import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

// `@ultimate/vue` has seven entry points: the barrel plus one subpath per
// component (button/checkbox/dialog/menu/tooltip) plus the internal-only
// ripple subpath (see `tsup.config.ts` and `package.json`'s `exports`
// map — ripple has a real tsup entry but is not a public exports-map
// subpath, per spec §16's "internal, not a public subpath export"
// decision). Each declared entry point must produce both a working
// `.mjs` module and a resolvable `.d.mts` declaration file, matching
// Phase 1's export-resolution precedent
// (`packages/uix-styled/test/exports.test.ts`) and Phase 3's
// `packages/react/test/exports.test.ts`.
//
// UButton/UCheckbox/UDialog/UMenu are Vue `defineComponent`/SFC-compiled
// results (typeof "object", not "function", unlike React's function
// components); tooltipDirective/rippleDirective are Vue ObjectDirectives
// (also typeof "object"). There is no UTooltip component export — Tooltip
// is a directive (v-tooltip), not a wrapper component, per ADR-034/041.
// All shapes confirmed empirically against the real built dist/ output.

describe("package exports: barrel (.)", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.UButton).toBeTypeOf("object");
    expect(mod.UCheckbox).toBeTypeOf("object");
    expect(mod.UDialog).toBeTypeOf("object");
    expect(mod.UMenu).toBeTypeOf("object");
    expect(mod.tooltipDirective).toBeTypeOf("object");
    expect(mod.rippleDirective).toBeTypeOf("object");
  });
});

describe("package exports: ./button", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "button", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "button", "index.d.mts"))).toBe(true);
  });

  it("UButton is callable/defined", async () => {
    const mod = await import("../dist/button/index.mjs");
    expect(mod.UButton).toBeTypeOf("object");
  });
});

describe("package exports: ./checkbox", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "checkbox", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "checkbox", "index.d.mts"))).toBe(true);
  });

  it("UCheckbox is callable/defined", async () => {
    const mod = await import("../dist/checkbox/index.mjs");
    expect(mod.UCheckbox).toBeTypeOf("object");
  });
});

describe("package exports: ./dialog", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "dialog", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "dialog", "index.d.mts"))).toBe(true);
  });

  it("UDialog is callable/defined", async () => {
    const mod = await import("../dist/dialog/index.mjs");
    expect(mod.UDialog).toBeTypeOf("object");
  });
});

describe("package exports: ./menu", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "menu", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "menu", "index.d.mts"))).toBe(true);
  });

  it("UMenu is callable/defined", async () => {
    const mod = await import("../dist/menu/index.mjs");
    expect(mod.UMenu).toBeTypeOf("object");
  });
});

describe("package exports: ./tooltip", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "tooltip", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "tooltip", "index.d.mts"))).toBe(true);
  });

  it("tooltipDirective is callable/defined", async () => {
    const mod = await import("../dist/tooltip/index.mjs");
    expect(mod.tooltipDirective).toBeTypeOf("object");
  });
});

describe("package exports: ./ripple (internal entry, not a public exports-map subpath)", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "ripple", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "ripple", "index.d.mts"))).toBe(true);
  });

  it("rippleDirective is callable/defined", async () => {
    const mod = await import("../dist/ripple/index.mjs");
    expect(mod.rippleDirective).toBeTypeOf("object");
  });
});
