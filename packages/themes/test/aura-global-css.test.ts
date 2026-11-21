import { describe, expect, it } from "vitest";
import { auraPreset } from "../src/presets/aura";

/**
 * F4: Prime's Aura preset carries a top-level `css` (`@primeuix/themes@2.0.3`
 * `aura/css`): one rule that resets `transition` on option rows and menu,
 * table and tree rows. Ultimate ports it with its own class names
 * (`u-` prefix, kebab-case family names such as `u-multi-select-*`).
 */
const PORTED_SELECTORS = [
  "li.u-autocomplete-option",
  "div.u-cascade-select-option-content",
  "li.u-listbox-option",
  "li.u-multi-select-option",
  "li.u-select-option",
  "li.u-table-filter-constraint",
  ".u-table .u-table-tbody > tr",
  "div.u-menu-item-content",
  "div.u-tieredmenu-item-content",
  "div.u-contextmenu-item-content",
  "div.u-menubar-item-content",
  "div.u-megamenu-item-content",
  "div.u-panelmenu-header-content",
  "th.u-table-header-cell",
  "thead.u-table-thead > tr > th",
];

function selectorsOf(css: string): string[] {
  const [selectorList] = css.split("{");
  return selectorList.split(",").map((selector) => selector.replace(/\s+/g, " ").trim());
}

describe("Aura preset top-level css (F4)", () => {
  const css = (auraPreset as { css?: unknown }).css;

  it("is a string", () => {
    expect(typeof css).toBe("string");
  });

  it("names exactly the ported selectors, in upstream order", () => {
    expect(selectorsOf(css as string)).toEqual(PORTED_SELECTORS);
  });

  it("resets transition and declares nothing else", () => {
    const body = (css as string).split("{")[1].replace("}", "").replace(/\s+/g, "");
    expect(body).toBe("transition:none;");
  });

  it("keeps no Prime class prefix", () => {
    expect(css as string).not.toMatch(/\.p-/);
  });
});
