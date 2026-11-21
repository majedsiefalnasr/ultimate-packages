import { describe, expect, it } from "vitest";
import { StyleSheet, Theme, registerThemeVariables } from "../src/index";

const GLOBAL_CSS = "li.u-select-option,div.u-menu-item-content{transition:none;}";

function applyTheme(preset: Record<string, unknown>, cssLayer: boolean | object = false): void {
  Theme.setTheme({
    preset,
    options: { prefix: "u", darkModeSelector: "system", cssLayer },
  });
}

const basePreset = {
  primitive: { blue: { 500: "#3B82F6" } },
  semantic: { primary: { color: "{blue.500}" } },
};

describe("registerThemeVariables — preset global style (F4)", () => {
  it("registers nothing when no theme is applied", () => {
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");

    expect(sheet.getStyles().size).toBe(0);
  });

  it("registers the preset top-level css once under u-global-style, after the common variables", () => {
    applyTheme({ ...basePreset, css: GLOBAL_CSS });
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");
    registerThemeVariables(sheet, "menu");

    expect(sheet.get("u-global-style")?.css).toBe(GLOBAL_CSS);
    const keys = [...sheet.getStyles().keys()];
    expect(keys.indexOf("u-common-variables")).toBeGreaterThanOrEqual(0);
    expect(keys.indexOf("u-global-style")).toBe(keys.indexOf("u-common-variables") + 1);
    expect(keys.filter((key) => key === "u-global-style")).toHaveLength(1);
  });

  it("passes dt to a function-valued preset css", () => {
    applyTheme({
      ...basePreset,
      css: ({ dt }: { dt: (path: string) => string }) => `.u-x{color:${dt("primary.color")};}`,
    });
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");

    expect(sheet.get("u-global-style")?.css).toContain("var(--u-primary-color");
  });

  it("wraps the global style in the css layer when cssLayer is on", () => {
    applyTheme({ ...basePreset, css: GLOBAL_CSS }, true);
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");

    const css = sheet.get("u-global-style")?.css ?? "";
    expect(css).toContain("@layer ultimate");
    expect(css).toContain(GLOBAL_CSS);
  });

  it("registers nothing for the global style when the preset has no css", () => {
    applyTheme(basePreset);
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");

    expect(sheet.has("u-common-variables")).toBe(true);
    expect(sheet.has("u-global-style")).toBe(false);
  });
});
