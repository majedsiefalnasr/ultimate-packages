import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StyleSheet, Theme, createScopedTheme, type StyleMeta } from "../src/index";

class DomStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement {
    const element = document.createElement("style");
    element.textContent = meta.css ?? "";
    document.head.appendChild(element);
    return element;
  }
  override updateStyleElement(element: HTMLStyleElement, meta: StyleMeta<HTMLStyleElement>) {
    element.textContent = meta.css ?? "";
  }
}

const options = { prefix: "u", darkModeSelector: "system", cssLayer: false };

function applyTheme(radius: string): void {
  Theme.setTheme({
    preset: { components: { tag: { borderRadius: radius } } },
    options,
  });
}

describe("createScopedTheme (F15, per-instance dt)", () => {
  let sheet: DomStyleSheet;

  beforeEach(() => {
    applyTheme("4px");
    sheet = new DomStyleSheet();
  });

  afterEach(() => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the dt variables under the instance attribute selector", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");

    scoped.update({ borderRadius: "2rem" });

    expect(scoped.key).toBe("pc1-tag");
    expect(sheet.get("pc1-tag")?.css).toContain("[pc1]{--u-tag-border-radius:2rem;}");
    expect(document.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("reads the preset under the name with its hyphens removed", () => {
    const scoped = createScopedTheme(sheet, "input-text", "pc2");

    scoped.update({ borderRadius: "2rem" });

    expect(sheet.get("pc2-input-text")?.css).toContain("--u-inputtext-border-radius:2rem");
  });

  it("writes the new tokens into the same style element when dt changes", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");
    scoped.update({ borderRadius: "2rem" });
    const element = sheet.get("pc1-tag")?.element;

    scoped.update({ borderRadius: "9px" });

    expect(sheet.get("pc1-tag")?.element).toBe(element);
    expect(element?.textContent).toContain("--u-tag-border-radius:9px");
    expect(document.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("removes the style element and registry entry when dt is cleared", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");
    scoped.update({ borderRadius: "2rem" });

    scoped.update(undefined);

    expect(sheet.has("pc1-tag")).toBe(false);
    expect(document.head.querySelectorAll("style")).toHaveLength(0);
  });

  it("rewrites the scoped css after a theme change", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");
    scoped.update({ borderRadius: "2rem" });

    Theme.setTheme({
      preset: { components: { tag: { borderRadius: "1px" } } },
      options: { ...options, prefix: "x" },
    });

    expect(sheet.get("pc1-tag")?.css).toContain("--x-tag-border-radius:2rem");
  });

  it("stops following theme changes and removes its style after dispose", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");
    scoped.update({ borderRadius: "2rem" });

    scoped.dispose();
    Theme.setTheme({
      preset: { components: { tag: { borderRadius: "1px" } } },
      options: { ...options, prefix: "y" },
    });

    expect(sheet.has("pc1-tag")).toBe(false);
    expect(document.head.querySelectorAll("style")).toHaveLength(0);
  });

  it("does not touch the shared component variable block", () => {
    const scoped = createScopedTheme(sheet, "tag", "pc1");

    scoped.update({ borderRadius: "2rem" });

    expect([...sheet.getStyles().keys()]).toEqual(["pc1-tag"]);
  });
});
