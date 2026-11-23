import { describe, it, expect } from "vitest";
import { style } from "../src/iconfield";

describe("uix-styles/iconfield", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura iconfield token and the form field tokens", () => {
    expect(style).toContain("dt('iconfield.icon.color')");
    expect(style).toContain("dt('form.field.padding.x')");
    expect(style).toContain("dt('icon.size')");
  });

  it("pads the field the siblings render and keys the size rules on the classes they emit", () => {
    expect(style).toContain(".u-icon-field .u-inputtext:not(:first-child)");
    expect(style).toContain(".p-inputwrapper:not(:first-child) .u-inputtext");
    expect(style).toContain(":has(.u-inputtext-sm, .u-inputfield-sm)");
    expect(style).toContain(":has(.u-inputtext-lg, .u-inputfield-lg)");
    expect(style).not.toMatch(/\.u-input-text\b/);
    expect(style).not.toMatch(/\.u-inputwrapper\b/);
  });

  it("has no hard-coded colours or lengths outside the tokens", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/\d(rem|px)\b/);
  });
});
