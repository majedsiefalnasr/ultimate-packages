import { describe, it, expect } from "vitest";
import { style } from "../src/slider";

describe("uix-styles/slider", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura slider tokens", () => {
    expect(style).toContain("dt('slider.track.background')");
    expect(style).toContain("dt('slider.track.size')");
    expect(style).toContain("dt('slider.range.background')");
    expect(style).toContain("dt('slider.handle.width')");
    expect(style).toContain("dt('slider.handle.content.background')");
    expect(style).toContain("dt('slider.handle.hover.background')");
    expect(style).toContain("dt('slider.handle.focus.ring.color')");
    expect(style).toContain("dt('slider.transition.duration')");
  });

  it("styles the three parts the components emit", () => {
    for (const selector of [".u-slider {", ".u-slider-handle {", ".u-slider-range {"]) {
      expect(style).toContain(selector);
    }
  });

  it("places the handle and range on the inline axis, not with physical left or right", () => {
    expect(style).toContain("inset-inline-start");
    expect(style).not.toMatch(/\n\s*(left|right):/);
    expect(style).not.toMatch(/margin-(left|right):/);
  });

  it("positions the root so the absolutely placed handle and range stay inside it", () => {
    expect(style).toMatch(/\.u-slider\s*\{[^}]*position:\s*relative;/);
    expect(style).toMatch(/\.u-slider-handle\s*\{[^}]*position:\s*absolute;/);
    expect(style).toMatch(/\.u-slider-range\s*\{[^}]*position:\s*absolute;/);
  });

  it("has no hard-coded colours or --u-slider fallbacks", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/--u-slider/);
    expect(style).not.toMatch(/\.p-slider/);
  });
});
