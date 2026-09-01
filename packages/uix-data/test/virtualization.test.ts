import { describe, expect, it } from "vitest";
import { calculateLast, calculateNumItemsInViewport } from "../src/virtualization/index";

describe("calculateNumItemsInViewport", () => {
  it("computes the ceiling item count for normal input", () => {
    expect(calculateNumItemsInViewport(500, 50)).toBe(10);
  });

  it("computes the ceiling item count when itemSize does not evenly divide contentSize", () => {
    expect(calculateNumItemsInViewport(505, 50)).toBe(11);
  });

  it("falls back to a single item when itemSize is 0 but contentSize is nonzero", () => {
    expect(calculateNumItemsInViewport(500, 0)).toBe(1);
  });

  it("returns 0 when both contentSize and itemSize are 0 (Angular's safer zero-guard; React/Vue's real source would produce NaN here)", () => {
    expect(calculateNumItemsInViewport(0, 0)).toBe(0);
  });
});

describe("calculateLast", () => {
  it("uses a 2x tolerance buffer when first is below numToleratedItems", () => {
    // first=1, numItemsInViewport=10, numToleratedItems=5 -> 1 + 10 + 2*5 = 21
    expect(calculateLast(1, 10, 5)).toBe(21);
  });

  it("uses a 3x tolerance buffer when first is at or above numToleratedItems", () => {
    // first=5, numItemsInViewport=10, numToleratedItems=5 -> 5 + 10 + 3*5 = 30
    expect(calculateLast(5, 10, 5)).toBe(30);
  });

  it("accepts the isColumns parameter without affecting the pure offset math (no array-bounds clamping is performed here)", () => {
    expect(calculateLast(1, 10, 5, true)).toBe(21);
    expect(calculateLast(1, 10, 5, false)).toBe(21);
  });
});
