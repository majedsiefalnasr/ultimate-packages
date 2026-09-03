import { describe, it, expect } from "vitest";
import { style } from "../src/table";

describe("uix-styles table", () => {
  it("exports a non-empty CSS string with .u-table root selector", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-table");
    expect(style).not.toContain(".p-datatable");
    expect(style).not.toContain(".p-virtualscroller");
    expect(style).not.toContain(".p-row-odd");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('datatable.");
  });
});
