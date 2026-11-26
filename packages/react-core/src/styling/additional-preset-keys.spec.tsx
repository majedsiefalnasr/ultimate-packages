import { afterEach, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { Theme } from "@ultimate/uix-styled";
import {
  useComponentBase,
  type ComponentBaseOptions,
  type StyleModule,
} from "../base/component-base";
import { reactCoreStyleSheet } from "./react-style-sheet";
import { useComponentStyle } from "./use-component-style";

/**
 * ADR-051 / ADR-067 (b): useComponentStyle's and useComponentBase's optional
 * additionalPresetKeys register theme VARIABLES for further preset keys and
 * never structural CSS under them, as vue-core's registerComponentStyle does.
 * Omitting them keeps the existing behavior.
 */
const alphaStyle: StyleModule = {
  css: ".u-alpha { color: dt('alpha.color'); }",
  classes: { root: "u-alpha" },
};
const betaStyle: StyleModule = { css: ".u-beta { color: dt('beta.color'); }", classes: {} };

function keys(): string[] {
  return [...reactCoreStyleSheet.getStyles().keys()];
}

function cssOf(key: string): string | undefined {
  return reactCoreStyleSheet.getStyles().get(key)?.css;
}

const ALPHA_ONLY = [
  "u-hidden-accessible",
  "u-common-variables",
  "alpha-variables",
  "u-base",
  "u-box-model:alpha",
  "alpha",
];

describe("useComponentStyle — additionalPresetKeys (ADR-051, ADR-067)", () => {
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
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("keeps the existing signature and adds one optional readonly-array parameter", () => {
    expectTypeOf(useComponentStyle).parameters.toEqualTypeOf<
      [
        componentName: string,
        styleModule: StyleModule,
        unstyled?: boolean,
        additionalPresetKeys?: readonly string[],
      ]
    >();
    expectTypeOf<ComponentBaseOptions["additionalPresetKeys"]>().toEqualTypeOf<
      readonly string[] | undefined
    >();
  });

  it("without additional keys registers exactly the existing elements, in order", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle));
    expect(keys()).toEqual(ALPHA_ONLY);
  });

  it("an empty list behaves exactly like an omitted one", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle, false, []));
    expect(keys()).toEqual(ALPHA_ONLY);
  });

  it("registers additional keys' variables in the given order, before the structural CSS, and no structural CSS under them", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle, false, ["gamma", "beta"]));
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "gamma-variables",
      "beta-variables",
      "u-base",
      "u-box-model:alpha",
      "alpha",
    ]);
    expect(cssOf("gamma-variables")).toContain("--u-gamma-color:");
    expect(keys()).not.toContain("beta");
    expect(keys()).not.toContain("gamma");
  });

  it("registers nothing for the additional keys of an unstyled instance", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle, true, ["beta"]));
    expect(keys()).toEqual(["u-hidden-accessible"]);
  });

  it("is idempotent across repeated mounts", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle, false, ["beta"]));
    renderHook(() => useComponentStyle("alpha", alphaStyle, false, ["beta"]));
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "beta-variables",
      "u-base",
      "u-box-model:alpha",
      "alpha",
    ]);
  });

  it("does not block the additional key's own component from registering its structural CSS", () => {
    renderHook(() => useComponentStyle("alpha", alphaStyle, false, ["beta"]));
    renderHook(() => useComponentStyle("beta", betaStyle));
    expect(keys().filter((key) => key === "beta-variables")).toHaveLength(1);
    expect(cssOf("beta")).toContain(".u-beta");
  });

  it("useComponentBase forwards additionalPresetKeys to the registration", () => {
    renderHook(() =>
      useComponentBase({
        componentName: "alpha",
        styleModule: alphaStyle,
        additionalPresetKeys: ["beta"],
      })
    );
    expect(keys()).toContain("beta-variables");
    expect(keys()).not.toContain("beta");
  });
});
