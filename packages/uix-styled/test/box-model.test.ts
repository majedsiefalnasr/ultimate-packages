import { describe, expect, it, vi } from "vitest";
import {
  BOX_MODEL_KEY_PREFIX,
  StyleSheet,
  boxModelCss,
  registerBoxModel,
  scopeRootsOf,
} from "../src/index";

const squash = (css: string) => css.replace(/\s+/g, " ").trim();

describe("boxModelCss (GAP-098)", () => {
  it("scopes border-box to each root and its subtree, with zero specificity", () => {
    expect(squash(boxModelCss(["u-drawer", "u-drawer-mask"]))).toBe(
      squash(`
        :where(.u-drawer, .u-drawer *, .u-drawer-mask, .u-drawer-mask *),
        :where(.u-drawer, .u-drawer *, .u-drawer-mask, .u-drawer-mask *)::before,
        :where(.u-drawer, .u-drawer *, .u-drawer-mask, .u-drawer-mask *)::after {
          box-sizing: border-box;
        }
      `)
    );
  });

  it("never emits a page-wide or attribute-prefix selector", () => {
    const css = boxModelCss(["u-card"]);
    expect(css).not.toMatch(/(^|[\s,(])\*\s*[,{]/);
    expect(css).not.toContain("[class");
  });

  it("rejects empty or non-Ultimate roots", () => {
    expect(() => boxModelCss([])).toThrow();
    expect(() => boxModelCss(["drawer"])).toThrow();
    expect(() => boxModelCss(["u-a b"])).toThrow();
  });
});

describe("scopeRootsOf (GAP-098)", () => {
  it("takes the first u- class of root, overlay, panel, mask and *Root/*Overlay/*Mask keys", () => {
    const classes = {
      root: (params: { position?: string } = {}) => [
        "u-select u-component",
        { "u-select-open": Boolean(params.position) },
      ],
      overlay: "u-select-overlay u-component",
      panel: "u-select-panel",
      mask: () => ["u-select-mask"],
      tabsRoot: "u-tabs u-component",
      contentOverlay: "u-content-overlay",
      previewMask: "u-preview-mask",
      header: "u-select-header",
      tabPanel: "u-tabpanel",
    };
    expect(scopeRootsOf(classes)).toEqual([
      "u-select",
      "u-select-overlay",
      "u-select-panel",
      "u-select-mask",
      "u-tabs",
      "u-content-overlay",
      "u-preview-mask",
    ]);
  });

  it("takes the list key, which Vue AutoComplete teleports to <body> (Spec Amendment A2)", () => {
    expect(
      scopeRootsOf({
        root: "u-autocomplete",
        list: "u-autocomplete-list",
        option: "u-autocomplete-option",
      })
    ).toEqual(["u-autocomplete", "u-autocomplete-list"]);
  });

  it("de-duplicates and skips keys whose value has no u- class", () => {
    expect(scopeRootsOf({ root: "u-card", panel: "u-card", mask: "p-only" })).toEqual(["u-card"]);
    expect(scopeRootsOf({})).toEqual([]);
  });
});

describe("registerBoxModel (GAP-098)", () => {
  it("adds the component's rule once under its own key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerBoxModel(sheet, "drawer", ["u-drawer", "u-drawer-mask"]);
    registerBoxModel(sheet, "drawer", ["u-drawer", "u-drawer-mask"]);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(
      `${BOX_MODEL_KEY_PREFIX}drawer`,
      boxModelCss(["u-drawer", "u-drawer-mask"])
    );
    expect(BOX_MODEL_KEY_PREFIX).toBe("u-box-model:");
  });

  it("is a no-op for an empty component name or an empty root list (Amendment A1)", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerBoxModel(sheet, "", ["u-x"]);
    registerBoxModel(sheet, "x", []);
    expect(add).not.toHaveBeenCalled();
  });
});
