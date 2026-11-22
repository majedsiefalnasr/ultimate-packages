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
    expect(base).toContain(".u-disabled");
    expect(base).toContain(".u-icon");
    expect(base).toContain(".u-overlay-mask");
  });

  it("uses u-* selectors and keyframes only (A6, ADR-081)", () => {
    expect(base).not.toMatch(/\.p-|p-animate|\.pi\b|--px-/);
  });

  it("has no page-wide box-sizing rule (ADR-063)", () => {
    expect(base).not.toMatch(/box-sizing/);
  });
});
