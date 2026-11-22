import { beforeEach, describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import type { StyleModule } from "../base/base-component";
import { registerComponentStyle, vueCoreStyleSheet } from "./vue-style-sheet";

const probeStyle: StyleModule = { css: ".u-lo-probe {}", classes: {} };

function applyTheme(cssLayer: boolean | object) {
  Theme.setTheme({
    preset: { primitive: {}, components: { "lo-probe": { root: {} } } },
    options: { prefix: "u", darkModeSelector: "system", cssLayer },
  });
}

function headStyleTexts(): string[] {
  return Array.from(document.head.querySelectorAll("style")).map((el) => el.textContent ?? "");
}

describe("CSS layer-order registration (F6, Vue)", () => {
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("puts the layer-order statement first in document.head when cssLayer is on", () => {
    applyTheme({ name: "ultimate", order: "ultimate, app" });

    registerComponentStyle("lo-probe", probeStyle);
    registerComponentStyle("lo-probe", probeStyle);

    const texts = headStyleTexts();
    expect(texts[0]).toBe("@layer ultimate, app");
    expect(texts.filter((text) => text.startsWith("@layer ultimate, app"))).toHaveLength(1);
    expect(texts.length).toBeGreaterThan(1);
    expect([...vueCoreStyleSheet.getStyles().keys()][0]).toBe("u-layer-order");
  });

  it("registers no layer-order statement and no @layer rule when cssLayer is off", () => {
    applyTheme(false);

    registerComponentStyle("lo-probe", probeStyle);

    expect(vueCoreStyleSheet.has("u-layer-order")).toBe(false);
    expect(headStyleTexts().some((text) => text.includes("@layer"))).toBe(false);
  });

  it("follows cssLayer switched on after the component has registered", () => {
    applyTheme(false);
    registerComponentStyle("lo-probe", probeStyle);

    Theme.setOptions({ prefix: "u", darkModeSelector: "system", cssLayer: true });

    expect(headStyleTexts()[0]).toBe("@layer ultimate");
  });
});
