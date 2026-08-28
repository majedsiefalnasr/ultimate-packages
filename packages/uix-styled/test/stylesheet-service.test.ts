import { describe, it, expect, beforeEach } from "vitest";
import StyleSheet from "../src/stylesheet/index";

describe("StyleSheet (stylesheet registration service)", () => {
  let sheet: StyleSheet;

  beforeEach(() => {
    sheet = new StyleSheet();
  });

  it("registers a style and stores its CSS and markup", () => {
    sheet.add("test-style", ".foo { color: red; }");

    expect(sheet.has("test-style")).toBe(true);
    const entry = sheet.get("test-style");
    expect(entry?.css).toBe(".foo { color: red; }");
    expect(entry?.markup).toContain("<style");
    expect(entry?.markup).toContain(".foo { color: red; }");
  });

  it("does not duplicate an already-registered style", () => {
    sheet.add("test-style", ".foo { color: red; }");
    sheet.add("test-style", ".foo { color: red; }");

    expect(sheet.getStyles().size).toBe(1);
  });

  it("ignores registration with empty CSS", () => {
    sheet.add("empty-style", "");

    expect(sheet.has("empty-style")).toBe(false);
  });

  it("base createStyleElement is a no-op hook (no DOM element created)", () => {
    // The base StyleSheet class does not insert into the DOM itself -
    // createStyleElement is meant to be overridden by a framework-specific
    // subclass. This confirms that base behavior, not a DOM side effect.
    sheet.add("test-style", ".foo { color: red; }");

    expect(sheet.get("test-style")?.element).toBeUndefined();
    expect(document.head.querySelector("style")).toBeNull();
  });
});
