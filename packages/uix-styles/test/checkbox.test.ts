import { describe, it, expect } from "vitest";
import { style } from "../src/checkbox";

describe("uix-styles/checkbox", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-checkbox", () => {
    expect(style).toContain(".u-checkbox");
    expect(style).not.toContain(".p-checkbox");
  });
});
