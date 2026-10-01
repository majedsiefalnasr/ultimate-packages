import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface FormModule {
  /** Ultimate file name under `src/presets/aura/` (without `.ts`). */
  file: string;
  /** Ultimate named export. */
  exportName: string;
  /** Upstream module directory name; also the `auraPreset.components` key. */
  upstream: string;
  /** Upstream default-export top-level keys, in upstream order. */
  keys: string[];
  /** Whether upstream has a `colorScheme` split. */
  colorScheme: boolean;
}

// Deep equality against upstream lives in aura-upstream-fidelity.test.ts (committed fixture),
// which is also the single source of truth for the exact registered set.
// Key lists below were derived from `@primeuix/themes@2.0.3` (aura/<module>/index.mjs).
const FORM_MODULES: FormModule[] = [
  {
    file: "radio-button",
    exportName: "radioButton",
    upstream: "radiobutton",
    keys: ["root", "icon"],
    colorScheme: false,
  },
  {
    file: "toggle-switch",
    exportName: "toggleSwitch",
    upstream: "toggleswitch",
    keys: ["root", "handle", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "toggle-button",
    exportName: "toggleButton",
    upstream: "togglebutton",
    keys: ["root", "icon", "content", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "input-text",
    exportName: "inputText",
    upstream: "inputtext",
    keys: ["root"],
    colorScheme: false,
  },
  {
    file: "textarea",
    exportName: "textarea",
    upstream: "textarea",
    keys: ["root"],
    colorScheme: false,
  },
  {
    file: "input-number",
    exportName: "inputNumber",
    upstream: "inputnumber",
    keys: ["root", "button", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "input-otp",
    exportName: "inputOtp",
    upstream: "inputotp",
    keys: ["root", "input"],
    colorScheme: false,
  },
  {
    file: "password",
    exportName: "password",
    upstream: "password",
    keys: ["meter", "icon", "overlay", "content", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "autocomplete",
    exportName: "autocomplete",
    upstream: "autocomplete",
    keys: [
      "root",
      "overlay",
      "list",
      "option",
      "optionGroup",
      "dropdown",
      "chip",
      "emptyMessage",
      "colorScheme",
    ],
    colorScheme: true,
  },
  {
    file: "select",
    exportName: "select",
    upstream: "select",
    keys: [
      "root",
      "dropdown",
      "overlay",
      "list",
      "option",
      "optionGroup",
      "clearIcon",
      "checkmark",
      "emptyMessage",
    ],
    colorScheme: false,
  },
  {
    file: "multi-select",
    exportName: "multiSelect",
    upstream: "multiselect",
    keys: [
      "root",
      "dropdown",
      "overlay",
      "list",
      "option",
      "optionGroup",
      "chip",
      "clearIcon",
      "emptyMessage",
    ],
    colorScheme: false,
  },
  {
    file: "cascade-select",
    exportName: "cascadeSelect",
    upstream: "cascadeselect",
    keys: ["root", "dropdown", "overlay", "list", "option", "clearIcon"],
    colorScheme: false,
  },
  {
    file: "listbox",
    exportName: "listbox",
    upstream: "listbox",
    keys: ["root", "list", "option", "optionGroup", "checkmark", "emptyMessage", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "select-button",
    exportName: "selectButton",
    upstream: "selectbutton",
    keys: ["root", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "rating",
    exportName: "rating",
    upstream: "rating",
    keys: ["root", "icon"],
    colorScheme: false,
  },
  {
    file: "slider",
    exportName: "slider",
    upstream: "slider",
    keys: ["root", "track", "range", "handle", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "knob",
    exportName: "knob",
    upstream: "knob",
    keys: ["root", "value", "range", "text"],
    colorScheme: false,
  },
  {
    file: "color-picker",
    exportName: "colorPicker",
    upstream: "colorpicker",
    keys: ["root", "preview", "panel", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "date-picker",
    exportName: "datePicker",
    upstream: "datepicker",
    keys: [
      "root",
      "panel",
      "header",
      "title",
      "dropdown",
      "inputIcon",
      "selectMonth",
      "selectYear",
      "group",
      "dayView",
      "weekDay",
      "date",
      "monthView",
      "month",
      "yearView",
      "year",
      "buttonbar",
      "timePicker",
      "colorScheme",
    ],
    colorScheme: true,
  },
  {
    file: "file-upload",
    exportName: "fileUpload",
    upstream: "fileupload",
    keys: ["root", "header", "content", "file", "fileList", "progressbar", "basic"],
    colorScheme: false,
  },
  {
    file: "icon-field",
    exportName: "iconField",
    upstream: "iconfield",
    keys: ["icon"],
    colorScheme: false,
  },
  {
    file: "float-label",
    exportName: "floatLabel",
    upstream: "floatlabel",
    keys: ["root", "over", "in", "on"],
    colorScheme: false,
  },
  {
    file: "input-chips",
    exportName: "inputChips",
    upstream: "inputchips",
    keys: ["root", "chip", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "ifta-label",
    exportName: "iftaLabel",
    upstream: "iftalabel",
    keys: ["root", "input"],
    colorScheme: false,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: FormModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Form-family preset modules", () => {
  it("covers the 24 Form-family modules (inputmask has no upstream module)", () => {
    expect(FORM_MODULES).toHaveLength(24);
    expect(FORM_MODULES.map((m) => m.upstream)).not.toContain("inputmask");
  });

  describe.each(FORM_MODULES)("$file", (mod) => {
    it("exists and is registered under its upstream key", () => {
      expect(ultimateModule(mod)).toBeDefined();
      expect(auraPreset.components[mod.upstream]).toBe(ultimateModule(mod));
    });

    it("has exactly upstream's top-level keys", () => {
      expect(Object.keys(ultimateModule(mod) ?? {})).toEqual(mod.keys);
    });

    it(`${mod.colorScheme ? "has" : "has no"} colorScheme split, matching upstream`, () => {
      const tokens = ultimateModule(mod) as { colorScheme?: { light?: object; dark?: object } };
      if (mod.colorScheme) {
        expect(tokens.colorScheme?.light).toBeDefined();
        expect(tokens.colorScheme?.dark).toBeDefined();
      } else {
        expect(tokens.colorScheme).toBeUndefined();
      }
    });

    it("has only well-formed {token.path} references", () => {
      expect(malformedReferences(ultimateModule(mod))).toEqual([]);
    });

    it("resolves every {token.path} reference against base.ts in light and dark", () => {
      expect(unresolvedReferences(ultimateModule(mod))).toEqual([]);
    });
  });

  describe("applyUltimateTheme with the Form-family modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it("emits CSS variables for a flat module (radiobutton)", () => {
      const { css } = Theme.getComponent("radiobutton", {}) ?? {};
      expect(css).toContain("--u-radiobutton-width:1.25rem");
      expect(css).toContain("--u-radiobutton-checked-background:var(--u-primary-color)");
    });

    it("emits mode-split CSS variables for a colorScheme module (toggleswitch)", () => {
      const { css } = Theme.getComponent("toggleswitch", {}) ?? {};
      expect(css).toContain("--u-toggleswitch-width:2.5rem");
      expect(css).toContain("--u-toggleswitch-handle-background:");
    });
  });
});
