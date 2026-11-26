import { describe, it, expect } from "vitest";
import { style } from "../src/colorpicker";

describe("uix-styles/colorpicker", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura colorpicker tokens", () => {
    for (const token of [
      "colorpicker.preview.width",
      "colorpicker.preview.height",
      "colorpicker.preview.border.radius",
      "colorpicker.transition.duration",
      "colorpicker.preview.focus.ring.shadow",
      "colorpicker.preview.focus.ring.width",
      "colorpicker.preview.focus.ring.style",
      "colorpicker.preview.focus.ring.color",
      "colorpicker.preview.focus.ring.offset",
      "colorpicker.panel.background",
      "colorpicker.panel.border.color",
      "colorpicker.panel.border.radius",
      "colorpicker.panel.shadow",
      "colorpicker.handle.color",
    ]) {
      expect(style).toContain(`dt('${token}')`);
    }
  });

  it("keeps upstream's focus border reference, which Aura does not define", () => {
    expect(style).toContain("dt('colorpicker.preview.focus.border.color')");
    expect(style).not.toContain("dt('colorpicker.preview.border.color')");
  });

  it("styles every part the components emit", () => {
    for (const selector of [
      ".u-color-picker {",
      ".u-color-picker-dragging {",
      ".u-color-picker-preview {",
      ".u-color-picker-preview:enabled:focus-visible {",
      ".u-color-picker-panel {",
      ".u-color-picker-panel-inline {",
      ".u-color-picker-content {",
      ".u-color-picker-color-selector {",
      ".u-color-picker-color-background {",
      ".u-color-picker-color-handle {",
      ".u-color-picker-hue {",
      ".u-color-picker-hue-handle {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("places the panel absolutely and the inline panel statically", () => {
    expect(style).toMatch(/\.u-color-picker-panel\s*\{[^}]*position:\s*absolute;/);
    expect(style).toMatch(/\.u-color-picker-panel-inline\s*\{[^}]*position:\s*static;/);
  });

  it("places the selector, hue and handles on the logical axes", () => {
    expect(style).toContain("inset-inline-start");
    expect(style).toContain("inset-block-start");
    expect(style).not.toMatch(/margin-(left|right):/);
  });

  it("has no p- selectors or --u-colorpicker fallbacks", () => {
    expect(style).not.toMatch(/\.p-colorpicker/);
    expect(style).not.toMatch(/--u-colorpicker/);
  });
});
