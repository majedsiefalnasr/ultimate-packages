import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Export-resolution suite matching Phase 1's precedent
// (`packages/uix-styled/test/exports.test.ts`). `@ultimate/react-core`
// has a single entry point (the barrel), unlike `@ultimate/react`'s six.

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(
      true,
    );
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");

    // base
    expect(mod.useComponentBase).toBeTypeOf("function");

    // escape
    expect(mod.ESCAPE_PRIORITIES).toBeTypeOf("object");
    expect(mod.useDisplayOrder).toBeTypeOf("function");
    expect(mod.useGlobalEscapeKey).toBeTypeOf("function");

    // focus-trap
    expect(mod.FocusTrap).toBeTypeOf("function");

    // hooks
    expect(mod.useMergeProps).toBeTypeOf("function");
    expect(mod.useMountEffect).toBeTypeOf("function");
    expect(mod.useUnmountEffect).toBeTypeOf("function");
    expect(mod.useUpdateEffect).toBeTypeOf("function");
    expect(mod.usePrevious).toBeTypeOf("function");
    expect(mod.useEventListener).toBeTypeOf("function");
    expect(mod.useResizeListener).toBeTypeOf("function");

    // icons
    expect(mod.USpinnerIcon).toBeTypeOf("function");
    expect(mod.UTimesIcon).toBeTypeOf("function");
    expect(mod.UWindowMaximizeIcon).toBeTypeOf("function");
    expect(mod.UWindowMinimizeIcon).toBeTypeOf("function");
    expect(mod.UCheckIcon).toBeTypeOf("function");

    // motion
    expect(mod.useMotion).toBeTypeOf("function");

    // overlay
    expect(mod.Portal).toBeTypeOf("function");
    expect(mod.useOverlayListener).toBeTypeOf("function");

    // scroll-lock
    expect(mod.useScrollLock).toBeTypeOf("function");

    // styling
    expect(mod.reactCoreStyleSheet).toBeTypeOf("object");
    expect(mod.useComponentStyle).toBeTypeOf("function");

    // zindex
    expect(mod.useZIndex).toBeTypeOf("function");
    expect(mod.Z_INDEX_BUCKETS).toBeTypeOf("object");
  });
});
