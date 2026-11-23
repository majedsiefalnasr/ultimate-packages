import { describe, it, expect } from "vitest";
import { style } from "../src/avatar";

describe("uix-styles/avatar", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-avatar", () => {
    expect(style).toContain(".u-avatar");
    expect(style).toContain(".u-avatar-group");
    expect(style).not.toContain(".p-avatar");
  });

  it("offsets stacked avatars with logical, tokenized, size-specific margins", () => {
    expect(style).toContain("margin-inline-start: dt('avatar.group.offset')");
    expect(style).toContain("margin-inline-start: dt('avatar.lg.group.offset')");
    expect(style).toContain("margin-inline-start: dt('avatar.xl.group.offset')");
    expect(style).not.toMatch(/margin-left/);
  });
});
