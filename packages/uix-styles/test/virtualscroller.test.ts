import { describe, it, expect } from "vitest";
import { style } from "../src/virtualscroller";

describe("uix-styles virtualscroller", () => {
  it("exports a non-empty CSS string with .u-scroller-loader selectors", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-scroller-loader");
    expect(style).not.toContain(".p-virtualscroller-loader");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('virtualscroller.loader.");
  });
});
