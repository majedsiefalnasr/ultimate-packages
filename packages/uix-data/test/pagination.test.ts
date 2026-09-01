import { describe, expect, it } from "vitest";
import { getPageCount } from "../src/pagination/index";

describe("getPageCount", () => {
  it("computes the ceiling page count for evenly divisible input", () => {
    expect(getPageCount(100, 10)).toBe(10);
  });

  it("computes the ceiling page count for non-evenly-divisible input", () => {
    expect(getPageCount(101, 10)).toBe(11);
  });

  it("returns 0 when totalRecords is 0", () => {
    expect(getPageCount(0, 10)).toBe(0);
  });

  it("returns 0 when rows is 0 (zero-guard, Prime's own inline calculation lacks this)", () => {
    expect(getPageCount(100, 0)).toBe(0);
  });
});
