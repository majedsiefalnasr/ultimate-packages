import { afterEach, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import type { StyleModule } from "../base/base-component";
import { registerComponentStyle, vueCoreStyleSheet } from "./vue-style-sheet";

/**
 * ADR-051 / GAP-064 D2: registerComponentStyle's optional additionalPresetKeys
 * registers theme VARIABLES for further preset keys and never structural CSS
 * under them. Omitting it keeps the existing behavior.
 */
const alphaStyle: StyleModule = { css: ".u-alpha { color: dt('alpha.color'); }", classes: {} };
const betaStyle: StyleModule = { css: ".u-beta { color: dt('beta.color'); }", classes: {} };

function keys(): string[] {
  return Array.from(document.head.querySelectorAll("style[data-u-style]")).map(
    (el) => el.getAttribute("data-u-style") ?? ""
  );
}

describe("registerComponentStyle — additionalPresetKeys (ADR-051)", () => {
  beforeAll(() => {
    Theme.setTheme({
      preset: {
        components: {
          alpha: { root: { color: "#111111" } },
          beta: { root: { color: "#222222" } },
          gamma: { root: { color: "#333333" } },
        },
      },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("keeps the existing signature and adds one optional readonly-array parameter", () => {
    expectTypeOf(registerComponentStyle).parameters.toEqualTypeOf<
      [componentName: string, styleModule: StyleModule, additionalPresetKeys?: readonly string[]]
    >();
    expectTypeOf(registerComponentStyle).returns.toEqualTypeOf<void>();
  });

  it("without additional keys registers exactly the existing elements, in order", () => {
    registerComponentStyle("alpha", alphaStyle);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "alpha",
    ]);
  });

  it("an empty list behaves exactly like an omitted one", () => {
    registerComponentStyle("alpha", alphaStyle, []);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "alpha",
    ]);
  });

  it("registers additional keys' variables in the given order, before the structural CSS, and no structural CSS under them", () => {
    registerComponentStyle("alpha", alphaStyle, ["gamma", "beta"]);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "gamma-variables",
      "beta-variables",
      "alpha",
    ]);
    expect(
      document.head.querySelector('style[data-u-style="gamma-variables"]')?.textContent
    ).toContain("--u-gamma-color:");
    expect(keys()).not.toContain("beta");
    expect(keys()).not.toContain("gamma");
  });

  it("is idempotent across repeated registrations (Review Focus 2)", () => {
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "beta-variables",
      "alpha",
    ]);
  });

  it("does not block the additional key's own component from registering its structural CSS, in either order (Review Focus 1)", () => {
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    registerComponentStyle("beta", betaStyle);
    expect(keys().filter((k) => k === "beta-variables")).toHaveLength(1);
    expect(document.head.querySelector('style[data-u-style="beta"]')?.textContent).toContain(
      ".u-beta"
    );

    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());

    registerComponentStyle("beta", betaStyle);
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    expect(keys().filter((k) => k === "beta-variables")).toHaveLength(1);
    expect(document.head.querySelector('style[data-u-style="beta"]')?.textContent).toContain(
      ".u-beta"
    );
  });
});
