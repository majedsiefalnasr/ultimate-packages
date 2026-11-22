import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Theme } from "@ultimate/uix-styled";
import { reactCoreStyleSheet } from "./react-style-sheet";
import { useComponentStyle } from "./use-component-style";

const GLOBAL_CSS = "li.u-gs-option{transition:none;}";

function Probe() {
  useComponentStyle("gs-probe", { css: ".u-gs-probe {}", classes: {} });
  return <span className="u-gs-probe">x</span>;
}

describe("preset global style registration (F4, React)", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    Theme.setTheme({
      preset: { primitive: {}, css: GLOBAL_CSS, components: { "gs-probe": { root: {} } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  it("injects the preset css once into document.head on first mount", () => {
    render(<Probe />);
    render(<Probe />);

    expect(reactCoreStyleSheet.has("u-global-style")).toBe(true);
    expect(
      Array.from(document.head.querySelectorAll("style")).filter(
        (el) => (el.textContent ?? "") === GLOBAL_CSS
      )
    ).toHaveLength(1);
  });
});
