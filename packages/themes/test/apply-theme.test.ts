import { describe, it, expect } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import { Theme } from "@ultimate/uix-styled";

describe("applyUltimateTheme", () => {
  it("applies the default Aura preset when called with no options", () => {
    applyUltimateTheme();
    const theme = Theme.getTheme();
    expect(theme?.preset?.components?.button).toBeDefined();
  });

  it("applies a custom darkModeSelector option", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    const theme = Theme.getTheme();
    expect(theme?.options?.darkModeSelector).toBe(".dark");
  });
});
