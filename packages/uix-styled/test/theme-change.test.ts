import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  StyleSheet,
  Theme,
  registerComponentCss,
  registerThemeVariables,
  type StyleMeta,
} from "../src/index";

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

function presetOf(color: string, radius: string) {
  return {
    primitive: { blue: { 500: color } },
    semantic: { primary: { color: "{blue.500}" } },
    components: { button: { borderRadius: radius } },
  };
}

describe("StyleSheet.update", () => {
  let sheet: DomStyleSheet;

  beforeEach(() => {
    sheet = new DomStyleSheet();
  });

  afterEach(() => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("replaces the css and markup of a registered style in place", () => {
    sheet.add("block", ".a { color: red; }");
    const element = sheet.get("block")?.element;

    sheet.update("block", ".a { color: blue; }");

    expect(sheet.get("block")?.css).toBe(".a { color: blue; }");
    expect(sheet.get("block")?.markup).toContain(".a { color: blue; }");
    expect(sheet.get("block")?.element).toBe(element);
    expect(element?.textContent).toBe(".a { color: blue; }");
    expect(document.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("registers the style when the key is not registered yet", () => {
    sheet.update("fresh", ".b {}");

    expect(sheet.has("fresh")).toBe(true);
    expect(document.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("empties a registered style when the new css is empty", () => {
    sheet.add("block", ".a { color: red; }");

    sheet.update("block", "");

    expect(sheet.get("block")?.css).toBe("");
    expect(sheet.get("block")?.element?.textContent).toBe("");
  });
});

describe("registerThemeVariables follows theme changes", () => {
  let sheet: DomStyleSheet;

  const domText = () =>
    Array.from(document.head.querySelectorAll("style"))
      .map((el) => el.textContent ?? "")
      .join("\n");

  beforeEach(() => {
    sheet = new DomStyleSheet();
    Theme.setTheme({ preset: presetOf("#3b82f6", "6px"), options });
    registerThemeVariables(sheet, "button");
  });

  afterEach(() => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the variables for the current theme", () => {
    expect(domText()).toContain("#3b82f6");
    expect(domText()).toContain("6px");
  });

  it("updates common and component variables in place after Theme.setTheme", () => {
    const elements = sheet.getAllElements();

    Theme.setTheme({ preset: presetOf("#ef4444", "12px"), options });

    expect(domText()).toContain("#ef4444");
    expect(domText()).toContain("12px");
    expect(domText()).not.toContain("#3b82f6");
    expect(domText()).not.toContain("6px");
    expect(sheet.getAllElements()).toEqual(elements);
    expect(document.head.querySelectorAll("style")).toHaveLength(elements.length);
  });

  it("updates the variables after Theme.setPreset", () => {
    Theme.setPreset(presetOf("#22c55e", "2px"));

    expect(domText()).toContain("#22c55e");
    expect(domText()).toContain("2px");
    expect(domText()).not.toContain("#3b82f6");
  });

  it("updates the variable names after Theme.setOptions changes the prefix", () => {
    expect(domText()).toContain("--u-blue-500:");

    Theme.setOptions({ ...options, prefix: "x" });

    expect(domText()).toContain("--x-blue-500:");
    expect(domText()).not.toContain("--u-blue-500:");
  });

  it("keeps one subscription per sheet however often variables are registered", () => {
    registerThemeVariables(sheet, "button");
    registerThemeVariables(sheet, "button");
    let writes = 0;
    const original = sheet.updateStyleElement.bind(sheet);
    sheet.updateStyleElement = (element, meta) => {
      writes += 1;
      original(element, meta);
    };

    Theme.setPreset(presetOf("#a855f7", "4px"));

    expect(writes).toBe(sheet.getAllElements().length);
  });

  it("leaves styles that are not theme variables untouched", () => {
    sheet.add("button", ".u-button { color: red; }");

    Theme.setPreset(presetOf("#a855f7", "4px"));

    expect(sheet.get("button")?.css).toBe(".u-button { color: red; }");
  });

  it("does not register variables for a component whose variables were never registered", () => {
    Theme.setPreset({ ...presetOf("#a855f7", "4px"), components: { dialog: { gap: "1px" } } });

    expect(sheet.has("dialog-variables")).toBe(false);
  });

  it("defines the variables when the first theme arrives after the component registered", () => {
    const late = new DomStyleSheet();
    (Theme as { _theme: unknown })._theme = undefined;
    registerThemeVariables(late, "button");
    expect(late.has("u-common-variables")).toBe(false);

    Theme.setTheme({ preset: presetOf("#14b8a6", "8px"), options });

    expect(late.get("u-common-variables")?.css).toContain("#14b8a6");
    expect(late.get("button-variables")?.css).toContain("8px");
  });
});

describe("registerComponentCss follows theme changes", () => {
  const rawCss = ".u-button { border-radius: dt('button.border.radius'); }";
  let sheet: DomStyleSheet;

  beforeEach(() => {
    sheet = new DomStyleSheet();
    Theme.setTheme({ preset: presetOf("#3b82f6", "6px"), options });
  });

  afterEach(() => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the resolved css once under the component name", () => {
    registerComponentCss(sheet, "button", rawCss);
    registerComponentCss(sheet, "button", rawCss);

    expect(sheet.get("button")?.css).toContain("var(--u-button-border-radius");
    expect(sheet.getAllElements()).toHaveLength(1);
  });

  it("re-resolves the css against the new prefix after Theme.setOptions", () => {
    registerComponentCss(sheet, "button", rawCss);
    const element = sheet.get("button")?.element;

    Theme.setOptions({ ...options, prefix: "x" });

    expect(sheet.get("button")?.css).toContain("var(--x-button-border-radius");
    expect(sheet.get("button")?.css).not.toContain("--u-button-border-radius");
    expect(sheet.get("button")?.element).toBe(element);
  });
});
