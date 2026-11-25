import { describe, it, expect } from "vitest";
import { style } from "../src/rating";

describe("uix-styles/rating", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura rating tokens", () => {
    expect(style).toContain("dt('rating.gap')");
    expect(style).toContain("dt('rating.transition.duration')");
    expect(style).toContain("dt('rating.focus.ring.color')");
    expect(style).toContain("dt('rating.icon.size')");
    expect(style).toContain("dt('rating.icon.color')");
    expect(style).toContain("dt('rating.icon.hover.color')");
    expect(style).toContain("dt('rating.icon.active.color')");
  });

  it("reads only rating tokens the Aura preset defines", () => {
    expect(style).not.toContain("rating.icon.disabled");
    expect(style).not.toContain("rating.invalid");
  });

  it("strokes invalid icons with the shared form-field invalid colour", () => {
    expect(style).toMatch(
      /\.u-rating-icon\.p-invalid\s*\{\s*stroke:\s*dt\('form\.field\.invalid\.border\.color'\);/
    );
  });

  it("styles the parts and states the components emit", () => {
    for (const selector of [
      ".u-rating {",
      ".u-rating-option {",
      ".u-rating-option.p-focus-visible {",
      ".u-rating-icon {",
      ".u-rating-option-active .u-rating-icon {",
      ".u-rating.p-readonly .u-rating-option {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("has no hard-coded colours or Prime selectors", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/\.p-rating/);
  });
});
