import { describe, it, expect } from "vitest";
import { style } from "../src/chip";

describe("uix-styles/chip", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura chip tokens", () => {
    expect(style).toContain("dt('chip.background')");
    expect(style).toContain("dt('chip.padding.x')");
    expect(style).toContain("dt('chip.image.width')");
    expect(style).toContain("dt('chip.remove.icon.focus.ring.color')");
    expect(style).toContain("dt('chip.transition.duration')");
  });

  it("styles the five parts the components emit", () => {
    for (const selector of [
      ".u-chip {",
      ".u-chip-icon {",
      ".u-chip-image {",
      ".u-chip-label {",
      ".u-chip-remove-icon {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("has no hard-coded colours or --u-chip fallbacks", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/--u-chip/);
    expect(style).not.toMatch(/\.p-chip/);
  });
});
