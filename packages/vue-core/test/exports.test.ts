import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Export-resolution suite matching Phase 1's precedent
// (`packages/uix-styled/test/exports.test.ts`) and Phase 3's
// `packages/react-core/test/exports.test.ts`. `@ultimate/vue-core` has a
// single entry point (the barrel), like `@ultimate/react-core`.
//
// Vue components (defineComponent results), the ObjectDirective returned
// by focusTrapDirective, and Z_INDEX_KEYS/StyleSheet instances are all
// typeof "object" at runtime, not "function" — asserted with the shape
// each export actually has (confirmed empirically against the real built
// dist/index.mjs), not a uniform "function" check.

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");

    // base
    expect(mod.createBaseComponent).toBeTypeOf("function");
    expect(mod.createBaseEditableHolder).toBeTypeOf("function");
    expect(mod.createBaseInput).toBeTypeOf("function");

    // directive
    expect(mod.createDirective).toBeTypeOf("function");

    // escape
    expect(mod.createGlobalEscapeKeyMixin).toBeTypeOf("function");
    expect(mod.createDisplayOrderMixin).toBeTypeOf("function");
    expect(mod.useDisplayOrder).toBeTypeOf("function");

    // focus-trap
    expect(mod.focusTrapDirective).toBeTypeOf("object");

    // icons
    expect(mod.SpinnerIcon).toBeTypeOf("object");
    expect(mod.TimesIcon).toBeTypeOf("object");
    expect(mod.WindowMaximizeIcon).toBeTypeOf("object");
    expect(mod.WindowMinimizeIcon).toBeTypeOf("object");
    expect(mod.CheckIcon).toBeTypeOf("object");
    expect(mod.MinusIcon).toBeTypeOf("object");

    // motion
    expect(mod.createMotionTransitionHooks).toBeTypeOf("function");

    // overlay
    expect(mod.Portal).toBeTypeOf("object");

    // scroll-lock
    expect(mod.useScrollLock).toBeTypeOf("function");

    // styling
    expect(mod.vueCoreStyleSheet).toBeTypeOf("object");
    expect(mod.registerComponentStyle).toBeTypeOf("function");

    // zindex
    expect(mod.useZIndex).toBeTypeOf("function");
    expect(mod.Z_INDEX_KEYS).toBeTypeOf("object");
  });
});
