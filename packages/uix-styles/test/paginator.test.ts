import { describe, it, expect } from "vitest";
import { style } from "../src/paginator";

describe("uix-styles paginator", () => {
  it("exports a non-empty CSS string with .u-paginator root selector", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-paginator");
    expect(style).not.toContain(".p-paginator");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('paginator.");
  });
});
