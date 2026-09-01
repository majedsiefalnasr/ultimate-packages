import { describe, it, expect } from "vitest";
import { dt } from "../src/helpers/dt";

describe("dt (design token resolution)", () => {
  it("resolves a dotted token path to a CSS var() reference using the Ultimate prefix", () => {
    const result = dt("primary.color");
    expect(result).toContain("var(");
    expect(result).toContain("--u-primary-color");
  });

  it("is deterministic for the same input", () => {
    expect(dt("primary.color")).toBe(dt("primary.color"));
  });
});
