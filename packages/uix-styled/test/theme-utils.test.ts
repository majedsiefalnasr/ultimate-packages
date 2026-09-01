import { describe, it, expect } from "vitest";
import ThemeUtils from "../src/utils/themeUtils";

describe("ThemeUtils rebrand", () => {
  it("getCommonStyleSheet emits a data-u-style-id attribute, not data-primevue-style-id", () => {
    const theme = {
      preset: { primitive: { blue: { 500: "#3B82F6" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    };
    const result = ThemeUtils.getCommonStyleSheet({
      name: "test",
      theme,
      params: undefined,
      props: {},
      set: { layerNames: () => {} },
      defaults: {
        variable: { prefix: "u", selector: ":root,:host", excludedKeyRegex: /^$/ },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      },
    });
    expect(result).not.toContain("data-primevue-style-id");
  });

  it("getLayerOrder's default @layer name is Ultimate-branded, not primeui", () => {
    const result = ThemeUtils.getLayerOrder(
      "test",
      { cssLayer: true },
      { names: [] },
      { variable: { prefix: "u" }, options: { prefix: "u" } }
    );
    expect(result).not.toContain("primeui");
    expect(result).toContain("ultimate");
  });

  it("transformCSS's default @layer name is Ultimate-branded, not primeui, when cssLayer is a plain truthy value", () => {
    const result = ThemeUtils.transformCSS(
      "test",
      "color:red",
      "light",
      "variable",
      { cssLayer: true, darkModeSelector: "system" },
      { layerNames: () => {} },
      { options: { darkModeSelector: "system" } }
    );
    expect(result).not.toContain("primeui");
    expect(result).toContain("@layer ultimate");
  });
});
