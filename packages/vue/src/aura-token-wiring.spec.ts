import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UBadge } from "./badge";
import { UCascadeSelect } from "./cascade-select";
import { UColorPicker } from "./color-picker";
import { UDatePicker } from "./date-picker";
import { UFileUpload } from "./file-upload";
import { UFloatLabel } from "./float-label";
import { UIconField } from "./icon-field";
import { UIftaLabel } from "./ifta-label";
import { UInputChips } from "./input-chips";
import { UInputGroup } from "./input-group";
import { UInputNumber } from "./input-number";
import { UInputOtp } from "./input-otp";
import { UInputText } from "./input-text";
import { UMultiSelect } from "./multi-select";
import { UPaginator } from "./paginator";
import { URadioButton } from "./radio-button";
import { USelectButton } from "./select-button";
import { UToggleButton } from "./toggle-button";
import { UToggleSwitch } from "./toggle-switch";

/**
 * GAP-064 Tranche 1 (ADR-051; Spec §8 criteria 1–3). Assertions are made on
 * the generated <style data-u-style> elements, not on source componentName
 * values.
 */
const KEY_ATTR = "data-u-style";

interface Case {
  name: string;
  component: Component;
  key: string;
  /** Pre-rename key; absent for components whose key does not change. */
  oldKey?: string;
  /** Approved unresolved references (Spec §4.5 E1–E3); empty means none. */
  unresolved: readonly string[];
}

const CASES: readonly Case[] = [
  {
    name: "UCascadeSelect",
    component: UCascadeSelect,
    key: "cascadeselect",
    oldKey: "cascade-select",
    unresolved: [
      "--u-cascadeselect-empty-message-padding",
      "--u-cascadeselect-option-disabled-color",
    ],
  },
  {
    name: "UColorPicker",
    component: UColorPicker,
    key: "colorpicker",
    oldKey: "color-picker",
    unresolved: ["--u-colorpicker-preview-border-color"],
  },
  {
    name: "UDatePicker",
    component: UDatePicker,
    key: "datepicker",
    oldKey: "date-picker",
    unresolved: [
      "--u-datepicker-day-border-radius",
      "--u-datepicker-day-cell-padding",
      "--u-datepicker-day-color",
      "--u-datepicker-day-height",
      "--u-datepicker-day-selected-background",
      "--u-datepicker-day-selected-color",
      "--u-datepicker-day-selected-focus-shadow",
      "--u-datepicker-day-width",
      "--u-datepicker-select-month-font-weight",
    ],
  },
  {
    name: "UFileUpload",
    component: UFileUpload,
    key: "fileupload",
    oldKey: "file-upload",
    unresolved: [
      "--u-button-border-radius",
      "--u-button-secondary-background",
      "--u-fileupload-content-border-color",
      "--u-fileupload-content-border-radius",
      "--u-fileupload-content-color",
      "--u-fileupload-content-highlight-background",
      "--u-fileupload-file-actions-color",
      "--u-fileupload-file-size-color",
      "--u-message-error-background",
      "--u-message-error-color",
    ],
  },
  {
    name: "UFloatLabel",
    component: UFloatLabel,
    key: "floatlabel",
    oldKey: "float-label",
    unresolved: [],
  },
  {
    name: "UIconField",
    component: UIconField,
    key: "iconfield",
    oldKey: "icon-field",
    unresolved: [],
  },
  {
    name: "UIftaLabel",
    component: UIftaLabel,
    key: "iftalabel",
    oldKey: "ifta-label",
    unresolved: [],
  },
  {
    name: "UInputChips",
    component: UInputChips,
    key: "inputchips",
    oldKey: "input-chips",
    unresolved: ["--u-inputchips-chip-focus-color"],
  },
  {
    name: "UInputGroup",
    component: UInputGroup,
    key: "inputgroup",
    oldKey: "input-group",
    unresolved: [],
  },
  {
    name: "UInputNumber",
    component: UInputNumber,
    key: "inputnumber",
    oldKey: "input-number",
    unresolved: [],
  },
  { name: "UInputOtp", component: UInputOtp, key: "inputotp", oldKey: "input-otp", unresolved: [] },
  {
    name: "UInputText",
    component: UInputText,
    key: "inputtext",
    oldKey: "input-text",
    unresolved: [],
  },
  {
    name: "UMultiSelect",
    component: UMultiSelect,
    key: "multiselect",
    oldKey: "multi-select",
    unresolved: ["--u-multiselect-option-disabled-color"],
  },
  {
    name: "URadioButton",
    component: URadioButton,
    key: "radiobutton",
    oldKey: "radio-button",
    unresolved: [],
  },
  {
    name: "USelectButton",
    component: USelectButton,
    key: "selectbutton",
    oldKey: "select-button",
    unresolved: [],
  },
  {
    name: "UToggleButton",
    component: UToggleButton,
    key: "togglebutton",
    oldKey: "toggle-button",
    unresolved: [],
  },
  {
    name: "UToggleSwitch",
    component: UToggleSwitch,
    key: "toggleswitch",
    oldKey: "toggle-switch",
    unresolved: [],
  },
  { name: "UBadge", component: UBadge, key: "badge", unresolved: [] },
  { name: "UPaginator", component: UPaginator, key: "paginator", unresolved: [] },
];

function styleElements(): HTMLStyleElement[] {
  return Array.from(document.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
}

function count(key: string): number {
  return styleElements().filter((el) => el.getAttribute(KEY_ATTR) === key).length;
}

function cssFor(key: string): string {
  return styleElements()
    .filter((el) => el.getAttribute(KEY_ATTR) === key)
    .map((el) => el.textContent ?? "")
    .join("\n");
}

/** var(--u-…) references in `key`'s structural CSS that no registered <style> defines. */
function unresolvedReferences(key: string): string[] {
  const refs = new Set(Array.from(cssFor(key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1]));
  const allCss = styleElements()
    .map((el) => el.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(allCss.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((name) => !defined.has(name)).sort();
}

function resetRegistry(): void {
  vueCoreStyleSheet.clear();
  styleElements().forEach((el) => el.remove());
}

describe("GAP-064 Tranche 1 — Vue style keys and variables", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  beforeEach(() => {
    resetRegistry();
  });

  describe.each(CASES)("$name", (c) => {
    it(`registers its structural CSS and variables under "${c.key}" and nothing under the old key (C1)`, () => {
      mount(c.component);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it("resolves every referenced variable except exactly the approved exceptions (C2)", () => {
      mount(c.component);
      const actual = unresolvedReferences(c.key);
      const unexpected = actual.filter((name) => !c.unresolved.includes(name));
      const notObserved = c.unresolved.filter((name) => !actual.includes(name));
      expect(unexpected, "unresolved but not in the approved exception list").toEqual([]);
      expect(notObserved, "approved exception not observed as unresolved").toEqual([]);
    });
  });

  it("keeps one element per key when a component is mounted twice (Review Focus 2)", () => {
    mount(UInputText);
    mount(UInputText);
    expect(count("inputtext")).toBe(1);
    expect(count("inputtext-variables")).toBe(1);
  });

  describe("InputNumber additional preset key (C3)", () => {
    it("alone registers inputnumber, inputnumber-variables and inputtext-variables, and no inputtext structural CSS", () => {
      mount(UInputNumber);
      expect(count("inputnumber")).toBe(1);
      expect(count("inputnumber-variables")).toBe(1);
      expect(count("inputtext-variables")).toBe(1);
      expect(count("inputtext")).toBe(0);
    });

    it("InputNumber then InputText: InputText's own structural CSS under inputtext, one inputtext-variables (Review Focus 1)", () => {
      mount(UInputNumber);
      mount(UInputText);
      expect(count("inputtext")).toBe(1);
      expect(cssFor("inputtext")).toContain(".u-input-text");
      expect(count("inputtext-variables")).toBe(1);
    });

    it("InputText then InputNumber: the same set (Review Focus 1)", () => {
      mount(UInputText);
      mount(UInputNumber);
      expect(count("inputtext")).toBe(1);
      expect(cssFor("inputtext")).toContain(".u-input-text");
      expect(count("inputtext-variables")).toBe(1);
      expect(count("inputnumber")).toBe(1);
    });
  });
});
