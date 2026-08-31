import { describe, it, expect } from "vitest";
import { useZIndex, Z_INDEX_KEYS } from "./use-z-index";

describe("useZIndex", () => {
  it("set() assigns an incrementing z-index style to the element for a given key", () => {
    const { set } = useZIndex();
    const el = document.createElement("div");
    set(Z_INDEX_KEYS.modal, el, 1100);
    expect(Number(el.style.zIndex)).toBeGreaterThan(1100);
  });

  it("clear() removes the z-index style", () => {
    const { set, clear } = useZIndex();
    const el = document.createElement("div");
    set(Z_INDEX_KEYS.menu, el, 1000);
    clear(el);
    expect(el.style.zIndex).toBe("");
  });

  it("set() is a no-op when the element is null", () => {
    const { set } = useZIndex();
    expect(() => set(Z_INDEX_KEYS.tooltip, null, 1100)).not.toThrow();
  });
});
