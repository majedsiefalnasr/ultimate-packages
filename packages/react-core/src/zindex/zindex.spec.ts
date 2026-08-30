import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useZIndex, Z_INDEX_BUCKETS } from "./use-z-index";

describe("useZIndex", () => {
  it("set() assigns a numeric z-index style to the element for the given bucket key", () => {
    const { result } = renderHook(() => useZIndex());
    const el = document.createElement("div");
    result.current.set("modal", el);
    expect(Number(el.style.zIndex)).toBeGreaterThan(Z_INDEX_BUCKETS.modal);
  });

  it("clear() resets the element's z-index style", () => {
    const { result } = renderHook(() => useZIndex());
    const el = document.createElement("div");
    result.current.set("tooltip", el);
    result.current.clear(el);
    expect(el.style.zIndex).toBe("");
  });

  it("Z_INDEX_BUCKETS exposes the verified default bucket values", () => {
    expect(Z_INDEX_BUCKETS).toEqual({
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100,
      toast: 1200,
    });
  });
});
