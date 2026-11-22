import { describe, expect, it } from "vitest";
import { StyleSheet, Theme, createScopedTheme } from "../src/index";

describe("createScopedTheme without an applied theme", () => {
  it("still scopes the dt variables, using the default prefix", () => {
    expect(Theme.getTheme()).toBeUndefined();
    const sheet = new StyleSheet();
    const scoped = createScopedTheme(sheet, "tag", "pc1");

    expect(() => scoped.update({ borderRadius: "2rem" })).not.toThrow();

    expect(sheet.get("pc1-tag")?.css).toContain("[pc1]{--u-tag-border-radius:2rem;}");
  });
});
