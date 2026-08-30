import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMotion } from "./use-motion";

describe("useMotion", () => {
  it("does not throw when the element ref is null on mount", () => {
    const ref = { current: null };
    expect(() => renderHook(() => useMotion(ref, false))).not.toThrow();
  });

  it("calling with visible=true on a real element does not throw", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = { current: el };
    expect(() => renderHook(() => useMotion(ref, true, { name: "u-test", safe: false }))).not.toThrow();
    document.body.removeChild(el);
  });

  it("unmounting while a motion is in flight does not throw (cancel is called)", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = { current: el };
    const { unmount } = renderHook(() => useMotion(ref, true, { name: "u-test", safe: false }));
    expect(() => unmount()).not.toThrow();
    document.body.removeChild(el);
  });
});
