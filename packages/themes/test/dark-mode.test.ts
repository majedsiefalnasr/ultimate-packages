import { describe, it, expect } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import { Theme } from "@ultimate/uix-styled";

describe("dark mode", () => {
  it("defaults to 'system' (prefers-color-scheme media query)", () => {
    applyUltimateTheme();
    expect(Theme.getOptions().darkModeSelector).toBe("system");
  });

  it("supports an explicit class-based dark mode selector", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    expect(Theme.getOptions().darkModeSelector).toBe(".dark");
  });

  it("the assembled preset has distinct light and dark values for the same semantic token", () => {
    applyUltimateTheme();
    const preset = Theme.getPreset() as any;
    const lightPrimary = preset.semantic?.colorScheme?.light?.primary;
    const darkPrimary = preset.semantic?.colorScheme?.dark?.primary;
    expect(lightPrimary).toBeDefined();
    expect(darkPrimary).toBeDefined();
    expect(lightPrimary).not.toEqual(darkPrimary);
    expect(lightPrimary.color).not.toBe(darkPrimary.color);
  });
});
