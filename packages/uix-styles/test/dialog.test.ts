import { describe, it, expect } from "vitest";
import { style } from "../src/dialog";

describe("uix-styles/dialog", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-dialog", () => {
    expect(style).toContain(".u-dialog");
    expect(style).not.toContain(".p-dialog");
  });
});
