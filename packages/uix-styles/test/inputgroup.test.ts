import { describe, it, expect } from "vitest";
import { style } from "../src/inputgroup";

describe("uix-styles/inputgroup", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });

  it("keys the joined field rules on the classes the sibling fields emit", () => {
    expect(style).toContain(".u-inputtext");
    expect(style).toContain(".p-inputwrapper");
    expect(style).toContain(".p-inputwrapper-focus");
    expect(style).toContain(".u-icon-field + .u-icon-field .u-inputtext");
    expect(style).not.toMatch(/\.u-input-text\b/);
    expect(style).not.toMatch(/\.u-inputwrapper\b/);
    expect(style).not.toMatch(/\.u-inputwrapper-focus\b/);
  });

  it("uses only .u-input-group* and emitted state selectors", () => {
    expect(style).toContain(".u-input-group,");
    expect(style).toContain(".u-input-group-addon");
    expect(style).not.toMatch(/\.p-inputgroup/);
    expect(style).not.toMatch(/\.p-iftalabel/);
    expect(style).not.toMatch(/\.p-iconfield/);
    expect(style).not.toMatch(/\.p-floatlabel/);
  });
});
