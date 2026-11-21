import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StyleSheet, Theme, registerThemeVariables } from "../src/index";

const options = { prefix: "u", darkModeSelector: "system", cssLayer: false };

function presetOf(radius: string) {
  return {
    primitive: { blue: { 500: "#3b82f6" } },
    semantic: { primary: { color: "{blue.500}" } },
    components: {
      button: { borderRadius: radius },
      inputtext: { borderRadius: radius },
      datepicker: { borderRadius: radius },
    },
  };
}

describe("registerThemeVariables — kebab-case registration names (F7)", () => {
  let sheet: StyleSheet;

  beforeEach(() => {
    sheet = new StyleSheet();
    Theme.setTheme({ preset: presetOf("6px"), options });
  });

  afterEach(() => {
    Theme.setTheme({ preset: presetOf("6px"), options });
  });

  it("defines the flat Aura key's variables for a kebab-case name", () => {
    registerThemeVariables(sheet, "input-text");

    expect(sheet.get("input-text-variables")?.css).toContain("--u-inputtext-border-radius");
  });

  it("normalizes every hyphen of a multi-word name", () => {
    registerThemeVariables(sheet, "date-picker");

    expect(sheet.get("date-picker-variables")?.css).toContain("--u-datepicker-border-radius");
  });

  it("registers a flat name exactly as before", () => {
    registerThemeVariables(sheet, "button");

    expect(sheet.get("button-variables")?.css).toContain("--u-button-border-radius");
  });

  it("keeps the name the block is registered under", () => {
    registerThemeVariables(sheet, "input-text");

    expect(sheet.has("input-text-variables")).toBe(true);
    expect(sheet.has("inputtext-variables")).toBe(false);
  });

  it("registers no block for a name with no Aura key, as before", () => {
    registerThemeVariables(sheet, "button-group");

    expect(sheet.has("button-group-variables")).toBe(false);
  });

  it("rewrites the kebab-case block after a theme change", () => {
    registerThemeVariables(sheet, "input-text");

    Theme.setTheme({ preset: presetOf("12px"), options });

    expect(sheet.get("input-text-variables")?.css).toContain("12px");
    expect(sheet.get("input-text-variables")?.css).not.toContain("6px");
  });
});
