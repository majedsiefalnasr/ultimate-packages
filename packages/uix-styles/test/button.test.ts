import { describe, it, expect } from "vitest";
import { style } from "../src/button";

describe("uix-styles/button", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-button", () => {
    expect(style).toContain(".u-button");
    expect(style).not.toContain(".p-button");
  });
});
