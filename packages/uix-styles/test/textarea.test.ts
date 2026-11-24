import { describe, it, expect } from "vitest";
import { style } from "../src/textarea";

describe("uix-styles/textarea", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura textarea tokens, not the inputtext ones", () => {
    expect(style).toContain("dt('textarea.color')");
    expect(style).toContain("dt('textarea.sm.font.size')");
    expect(style).toContain("dt('textarea.lg.padding.y')");
    expect(style).not.toContain("dt('inputtext.");
  });

  it("carries the filled hover and focus backgrounds and the invalid placeholder", () => {
    expect(style).toContain(".u-textarea.p-variant-filled:enabled:hover");
    expect(style).toContain(".u-textarea.p-variant-filled:enabled:focus");
    expect(style).toContain(".u-textarea.p-invalid::placeholder");
  });

  it("renames only the component selectors and keeps the structural modifier classes", () => {
    expect(style).not.toMatch(/\.p-textarea/);
    expect(style).toContain(".u-textarea-sm");
    expect(style).toContain(".u-textarea-lg");
    expect(style).toContain(".u-textarea-fluid");
    expect(style).toContain(".u-textarea-resizable");
  });

  it("has no hard-coded colours", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
