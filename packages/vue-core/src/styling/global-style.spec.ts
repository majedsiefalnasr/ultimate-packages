import { beforeEach, describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import type { StyleModule } from "../base/base-component";
import { registerComponentStyle, vueCoreStyleSheet } from "./vue-style-sheet";

const GLOBAL_CSS = "li.u-gs-option{transition:none;}";
const probeStyle: StyleModule = { css: ".u-gs-probe {}", classes: {} };

describe("preset global style registration (F4, Vue)", () => {
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    Theme.setTheme({
      preset: { primitive: {}, css: GLOBAL_CSS, components: { "gs-probe": { root: {} } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  it("injects the preset css once into document.head on first registration", () => {
    registerComponentStyle("gs-probe", probeStyle);
    registerComponentStyle("gs-probe", probeStyle);

    expect(vueCoreStyleSheet.has("u-global-style")).toBe(true);
    expect(
      Array.from(document.head.querySelectorAll("style")).filter(
        (el) => (el.textContent ?? "") === GLOBAL_CSS
      )
    ).toHaveLength(1);
  });
});
