import { describe, it, expect } from "vitest";
import { style } from "../src/menu";

describe("uix-styles/menu", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-menu", () => {
    expect(style).toContain(".u-menu");
    expect(style).not.toContain(".p-menu");
  });
});
