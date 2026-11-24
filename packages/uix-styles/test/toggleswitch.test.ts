import { describe, it, expect } from "vitest";
import { style } from "../src/toggleswitch";

describe("uix-styles/toggleswitch", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("reads the Aura toggleswitch tokens", () => {
    expect(style).toContain("dt('toggleswitch.width')");
    expect(style).toContain("dt('toggleswitch.handle.size')");
    expect(style).toContain("dt('toggleswitch.checked.background')");
    expect(style).toContain("dt('toggleswitch.focus.ring.color')");
    expect(style).toContain("dt('toggleswitch.invalid.border.color')");
    expect(style).toContain("dt('toggleswitch.handle.disabled.background')");
  });

  it("styles the four parts the components emit", () => {
    for (const selector of [
      ".u-toggle-switch {",
      ".u-toggle-switch-input {",
      ".u-toggle-switch-slider {",
      ".u-toggle-switch-handle {",
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("positions the root so the absolutely placed input stays inside it", () => {
    expect(style).toMatch(/\.u-toggle-switch\s*\{\s*position:\s*relative;/);
  });

  it("moves the handle on the inline axis only", () => {
    expect(style).toContain("inset-inline-start: calc(dt('toggleswitch.width')");
    expect(style).not.toMatch(/translate/);
  });

  it("has no hard-coded colours or --u-toggleswitch fallbacks", () => {
    expect(style).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(style).not.toMatch(/--u-toggle/);
    expect(style).not.toMatch(/\.p-toggleswitch/);
  });
});
