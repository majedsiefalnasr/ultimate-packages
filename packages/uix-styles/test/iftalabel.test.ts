import { describe, it, expect } from "vitest";
import { style } from "../src/iftalabel";

describe("uix-styles/iftalabel", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("keys the label state on the classes the sibling fields emit", () => {
    expect(style).toContain(".u-inputtext");
    expect(style).toContain(".p-invalid");
    expect(style).toContain(".p-inputwrapper-focus");
    expect(style).toContain(".u-input-icon");
    expect(style).not.toMatch(/\.u-input-text\b/);
    expect(style).not.toMatch(/\.u-invalid\b/);
    expect(style).not.toMatch(/\.u-inputwrapper-focus\b/);
  });

  it("carries the multiselect chip and treeselect padding selectors", () => {
    expect(style).toContain(".u-multi-select-label:has(.u-chip)");
    expect(style).toContain(".u-treeselect-label");
  });
});
