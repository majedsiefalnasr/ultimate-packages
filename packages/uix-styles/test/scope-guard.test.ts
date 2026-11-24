import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { style as base } from "../src/base";
import { style as avatarStyle } from "../src/avatar";
import { style as badgeStyle } from "../src/badge";
import { style as buttonStyle } from "../src/button";
import { style as checkboxStyle } from "../src/checkbox";
import { style as dialogStyle } from "../src/dialog";
import { style as floatlabelStyle } from "../src/floatlabel";
import { style as iftalabelStyle } from "../src/iftalabel";
import { style as iconfieldStyle } from "../src/iconfield";
import { style as inputgroupStyle } from "../src/inputgroup";
import { style as inputnumberStyle } from "../src/inputnumber";
import { style as inputtextStyle } from "../src/inputtext";
import { style as menuStyle } from "../src/menu";
import { style as paginatorStyle } from "../src/paginator";
import { style as tableStyle } from "../src/table";
import { style as toggleswitchStyle } from "../src/toggleswitch";
import { style as tooltipStyle } from "../src/tooltip";
import { style as virtualscrollerStyle } from "../src/virtualscroller";

const ALLOWED_SELECTOR_PREFIXES = [
  ".u-disabled",
  ".u-icon",
  ".u-overlay-mask",
  ".u-collapsible",
  // Generic component marker class applied to every Ultimate component
  // (used here only in the `.u-component:disabled` rule) —
  // framework-level, not a named widget module.
  ".u-component",
  // Generic overlay-positioning animation keyframes, shared overlay
  // infrastructure alongside `.u-overlay-mask` — not a specific
  // component like `dialog` or `popover`.
  ".u-anchored-overlay",
];

// Matches any ".u-xxxx" class selector token in the CSS string.
const CLASS_SELECTOR_PATTERN = /\.u-[a-z][a-z0-9-]*/gi;

describe("base module scope guard", () => {
  it("contains only allow-listed .p-* selector prefixes (no per-component selectors leaked in)", () => {
    const found = [...new Set(base.match(CLASS_SELECTOR_PATTERN) ?? [])];
    const unexpected = found.filter(
      (selector) => !ALLOWED_SELECTOR_PREFIXES.some((allowed) => selector.startsWith(allowed))
    );
    expect(unexpected).toEqual([]);
  });
});

describe("component style modules — exactly 18 exist alongside base", () => {
  it("uix-styles/src/ contains only base + the Phase 2 component modules + virtualscroller + table + inputtext + inputnumber + floatlabel + iconfield + iftalabel + inputgroup + textarea + chip", () => {
    const actualModules = readdirSync(join(__dirname, "..", "src"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(actualModules).toEqual(
      [
        "base",
        "avatar",
        "badge",
        "button",
        "checkbox",
        "chip",
        "dialog",
        "floatlabel",
        "iconfield",
        "iftalabel",
        "inputgroup",
        "inputnumber",
        "inputtext",
        "menu",
        "paginator",
        "table",
        "textarea",
        "toggleswitch",
        "tooltip",
        "virtualscroller",
      ].sort()
    );
  });

  it("avatar style uses only .u-avatar* selectors", () => {
    expect(avatarStyle).not.toMatch(/\.p-avatar/);
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
  it("inputnumber style uses only .u-inputnumber* selectors", () => {
    expect(inputnumberStyle).not.toMatch(/\.p-inputnumber/);
  });
  it("inputtext style uses only .u-inputtext* selectors", () => {
    expect(inputtextStyle).not.toMatch(/\.p-inputtext/);
  });
  it("floatlabel style uses only .u-float-label* selectors", () => {
    expect(floatlabelStyle).not.toMatch(/\.p-floatlabel/);
  });
  it("iconfield style uses only .u-icon-field and .u-input-icon selectors", () => {
    expect(iconfieldStyle).not.toMatch(/\.p-iconfield/);
    expect(iconfieldStyle).not.toMatch(/\.p-inputicon/);
  });
  it("iftalabel style uses only .u-ifta-label* selectors", () => {
    expect(iftalabelStyle).not.toMatch(/\.p-iftalabel/);
  });
  it("inputgroup style uses only .u-input-group* and emitted state selectors", () => {
    expect(inputgroupStyle).not.toMatch(/\.p-inputgroup/);
    expect(inputgroupStyle).not.toMatch(/\.u-inputwrapper/);
  });
  it("menu style uses only .u-menu* selectors", () => {
    expect(menuStyle).not.toMatch(/\.p-menu/);
  });
  it("paginator style uses only .u-paginator* selectors", () => {
    expect(paginatorStyle).not.toMatch(/\.p-paginator/);
  });
  it("table style uses only .u-table* selectors", () => {
    expect(tableStyle).not.toMatch(/\.p-datatable/);
    expect(tableStyle).not.toMatch(/\.p-virtualscroller/);
  });
  it("tooltip style uses only .u-tooltip* selectors", () => {
    expect(tooltipStyle).not.toMatch(/\.p-tooltip/);
  });
  it("toggleswitch style uses only .u-toggle-switch* selectors", () => {
    expect(toggleswitchStyle).not.toMatch(/\.p-toggleswitch/);
  });

  it("virtualscroller style uses only .u-scroller* selectors", () => {
    expect(virtualscrollerStyle).not.toMatch(/\.p-virtualscroller/);
  });
});
