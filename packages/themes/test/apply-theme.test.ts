import { describe, it, expect } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import { StyleSheet, Theme, registerThemeVariables } from "@ultimate/uix-styled";
import { auraPreset } from "../src/presets/aura";

describe("applyUltimateTheme", () => {
  it("applies the default Aura preset when called with no options", () => {
    applyUltimateTheme();
    const theme = Theme.getTheme();
    expect(theme?.preset?.components?.button).toBeDefined();
  });

  it("hands the engine the full registered Aura component set", () => {
    applyUltimateTheme();
    const theme = Theme.getTheme();
    expect(Object.keys(theme?.preset?.components ?? {}).sort()).toEqual(
      Object.keys(auraPreset.components).sort()
    );
  });

  it("applies a custom darkModeSelector option", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    const theme = Theme.getTheme();
    expect(theme?.options?.darkModeSelector).toBe(".dark");
  });

  it("registers the Aura global css as u-global-style through the shared registrar (F4)", () => {
    applyUltimateTheme();
    const sheet = new StyleSheet();

    registerThemeVariables(sheet, "select");

    expect(sheet.get("u-global-style")?.css).toContain("li.u-select-option");
    expect(sheet.get("u-global-style")?.css).toContain("transition: none");
  });
});
