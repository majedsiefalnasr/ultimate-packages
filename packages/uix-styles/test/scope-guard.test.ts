import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { style as base } from "../src/base";
import { style as badgeStyle } from "../src/badge";
import { style as buttonStyle } from "../src/button";
import { style as checkboxStyle } from "../src/checkbox";
import { style as dialogStyle } from "../src/dialog";
import { style as menuStyle } from "../src/menu";
import { style as paginatorStyle } from "../src/paginator";
import { style as tooltipStyle } from "../src/tooltip";
import { style as virtualscrollerStyle } from "../src/virtualscroller";

const ALLOWED_SELECTOR_PREFIXES = [
  ".p-disabled",
  ".p-icon",
  ".p-overlay-mask",
  ".p-collapsible",
  ".pi",
  // Generic component marker class applied to every PrimeVue/PrimeNG
  // component (used here only in the `.p-component:disabled` rule) —
  // framework-level, not a named widget module.
  ".p-component",
  // Generic overlay-positioning animation keyframes, shared overlay
  // infrastructure alongside `.p-overlay-mask` — not a specific
  // component like `dialog` or `popover`.
  ".p-anchored-overlay",
];

// Matches any ".p-xxxx" class selector token in the CSS string.
const CLASS_SELECTOR_PATTERN = /\.p-[a-z][a-z0-9-]*/gi;

describe("base module scope guard", () => {
  it("contains only allow-listed .p-* selector prefixes (no per-component selectors leaked in)", () => {
    const found = [...new Set(base.match(CLASS_SELECTOR_PATTERN) ?? [])];
    const unexpected = found.filter(
      (selector) => !ALLOWED_SELECTOR_PREFIXES.some((allowed) => selector.startsWith(allowed))
    );
    expect(unexpected).toEqual([]);
  });
});

describe("component style modules — exactly 8 exist alongside base", () => {
  it("uix-styles/src/ contains only base + the Phase 2 component modules + virtualscroller", () => {
    const actualModules = readdirSync(join(__dirname, "..", "src"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(actualModules).toEqual(
      ["base", "badge", "button", "checkbox", "dialog", "menu", "paginator", "tooltip", "virtualscroller"].sort()
    );
  });

  it("badge style uses only .u-badge* selectors", () => {
    expect(badgeStyle).not.toMatch(/\.p-badge/);
  });

  it("button style uses only .u-button* selectors", () => {
    expect(buttonStyle).not.toMatch(/\.p-button/);
  });
  it("checkbox style uses only .u-checkbox* selectors", () => {
    expect(checkboxStyle).not.toMatch(/\.p-checkbox/);
  });
  it("dialog style uses only .u-dialog* selectors", () => {
    expect(dialogStyle).not.toMatch(/\.p-dialog/);
  });
  it("menu style uses only .u-menu* selectors", () => {
    expect(menuStyle).not.toMatch(/\.p-menu/);
  });
  it("paginator style uses only .u-paginator* selectors", () => {
    expect(paginatorStyle).not.toMatch(/\.p-paginator/);
  });
  it("tooltip style uses only .u-tooltip* selectors", () => {
    expect(tooltipStyle).not.toMatch(/\.p-tooltip/);
  });

  it("virtualscroller style uses only .u-scroller* selectors", () => {
    expect(virtualscrollerStyle).not.toMatch(/\.p-virtualscroller/);
  });
});
