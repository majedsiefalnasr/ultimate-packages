import { describe, it, expect } from "vitest";
import { deepMerge, isEmpty, isNotEmpty } from "../src/object";

describe("deepMerge", () => {
  it("recursively merges nested objects", () => {
    const result = deepMerge({ a: { x: 1, y: 2 }, b: 1 }, { a: { y: 3, z: 4 }, c: 2 });

    expect(result).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 1, c: 2 });
  });

  it("returns the first argument unchanged when only one object is given", () => {
    const source = { a: 1 };

    expect(deepMerge(source)).toEqual({ a: 1 });
  });
});

describe("isEmpty / isNotEmpty", () => {
  it("treats {} as empty", () => {
    expect(isEmpty({})).toBe(true);
    expect(isNotEmpty({})).toBe(false);
  });

  it("treats [] as empty", () => {
    expect(isEmpty([])).toBe(true);
    expect(isNotEmpty([])).toBe(false);
  });

  it("treats null as empty", () => {
    expect(isEmpty(null)).toBe(true);
    expect(isNotEmpty(null)).toBe(false);
  });

  it("treats a non-empty string as not empty", () => {
    expect(isEmpty("x")).toBe(false);
    expect(isNotEmpty("x")).toBe(true);
  });
});
