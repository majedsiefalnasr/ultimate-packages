import { describe, it, expect } from "vitest";
import { style as base } from "../src/base";

describe("base styles", () => {
  it("is a non-empty string", () => {
    expect(typeof base).toBe("string");
    expect(base.length).toBeGreaterThan(0);
  });

  it("matches the known snapshot", () => {
    expect(base).toMatchSnapshot();
  });

  it("contains the expected global selectors", () => {
    expect(base).toContain(".p-disabled");
    expect(base).toContain(".p-icon");
    expect(base).toContain(".p-overlay-mask");
  });
});
