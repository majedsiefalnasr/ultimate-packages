import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "../src/index";

describe("@ultimate/component-metadata package exports", () => {
  it("exports an ALL_COMPONENTS array", () => {
    expect(Array.isArray(ALL_COMPONENTS)).toBe(true);
  });
});
