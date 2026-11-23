import { describe, it, expect } from "vitest";
import { style } from "../src/floatlabel";

describe("uix-styles/floatlabel", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("keys the float state on the classes the sibling fields emit", () => {
    expect(style).toContain("input.p-filled");
    expect(style).toContain(".u-inputtext");
    expect(style).toContain(".p-invalid");
    expect(style).not.toMatch(/\.u-input-text\b/);
    expect(style).not.toMatch(/\.u-filled\b/);
    expect(style).not.toMatch(/\.u-invalid\b/);
  });
});
