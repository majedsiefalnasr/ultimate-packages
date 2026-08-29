import { describe, it, expect } from "vitest";
import { style } from "../src/tooltip";

describe("uix-styles/tooltip", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-tooltip", () => {
    expect(style).toContain(".u-tooltip");
    expect(style).not.toContain(".p-tooltip");
  });
});
