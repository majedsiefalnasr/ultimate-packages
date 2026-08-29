import { describe, it, expect } from "vitest";
import { style } from "../src/badge";

describe("uix-styles/badge", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-badge", () => {
    expect(style).toContain(".u-badge");
    expect(style).not.toContain(".p-badge");
  });
});
