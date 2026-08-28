import { describe, it, expect } from "vitest";
import { ZIndex } from "../src/zindex";

describe("ZIndex", () => {
  it("set() assigns increasing z-index values for sequential calls with the same key", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");

    ZIndex.set("modal", first, 1000);
    ZIndex.set("modal", second, 1000);

    const firstZ = ZIndex.get(first);
    const secondZ = ZIndex.get(second);

    expect(secondZ).toBeGreaterThan(firstZ);
  });

  it("get() returns 0 for an element with no z-index set", () => {
    const el = document.createElement("div");

    expect(ZIndex.get(el)).toBe(0);
  });

  it("clear() resets the element's z-index style", () => {
    const el = document.createElement("div");

    ZIndex.set("modal", el, 1000);
    expect(ZIndex.get(el)).toBeGreaterThan(0);

    ZIndex.clear(el);

    expect(el.style.zIndex).toBe("");
  });
});
