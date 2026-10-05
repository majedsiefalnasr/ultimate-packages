import { ChangeDetectionStrategy, Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UBadge } from "./badge";
import { UCascadeSelect } from "./cascade-select";
import { UColorPicker } from "./color-picker";
import { UDatePicker } from "./date-picker";
import { UFileUpload } from "./file-upload";
import { UFloatLabel } from "./float-label";
import { UIconField } from "./icon-field";
import { UIftaLabel } from "./ifta-label";
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
 * GAP-064 Tranche 1 (ADR-051; Spec §8 criteria 1, 2, 4). Assertions are made
 * on the generated <style data-u-ng-style> elements, not on source
 * componentName values. Each case mounts into a fresh document under a server
 * PLATFORM_ID, which gives it a fresh per-document registry (GAP-078) — the
 * same isolation base-component.spec.ts uses.
 */
const KEY_ATTR = "data-u-ng-style";

/** `UInputText` is an attribute directive, so it is mounted on a host input. */
@Component({
  standalone: true,
  selector: "u-aura-token-wiring-input-text-host",
  imports: [UInputText],
  template: `<input uInputText />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InputTextHost {}

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  /** Pre-rename key; absent for components whose key does not change. */
  oldKey?: string;
  /** Approved unresolved references (Spec §4.5 E1–E2); empty means none. */
  unresolved: readonly string[];
}

const CASES: readonly Case[] = [
  {
    name: "UCascadeSelect",
    type: UCascadeSelect,
    key: "cascadeselect",
    oldKey: "cascade-select",
    unresolved: [
      "--u-cascadeselect-empty-message-padding",
      "--u-cascadeselect-option-disabled-color",
    ],
  },
  {
    name: "UColorPicker",
    type: UColorPicker,
    key: "colorpicker",
    oldKey: "color-picker",
    unresolved: ["--u-colorpicker-preview-border-color"],
  },
  {
    name: "UDatePicker",
    type: UDatePicker,
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
    type: UFileUpload,
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
      "--u-fileupload-file-info-border-radius",
      "--u-fileupload-file-size-color",
      "--u-message-error-background",
      "--u-message-error-color",
    ],
  },
  {
    name: "UFloatLabel",
    type: UFloatLabel,
    key: "floatlabel",
    oldKey: "float-label",
    unresolved: [],
  },
  { name: "UIconField", type: UIconField, key: "iconfield", oldKey: "icon-field", unresolved: [] },
  { name: "UIftaLabel", type: UIftaLabel, key: "iftalabel", oldKey: "ifta-label", unresolved: [] },
  {
    name: "UInputGroup",
    type: UInputGroup,
    key: "inputgroup",
    oldKey: "input-group",
    unresolved: [],
  },
  {
    name: "UInputNumber",
    type: UInputNumber,
    key: "inputnumber",
    oldKey: "input-number",
    unresolved: [],
  },
  { name: "UInputOtp", type: UInputOtp, key: "inputotp", oldKey: "input-otp", unresolved: [] },
  {
    name: "UInputText",
    type: InputTextHost,
    key: "inputtext",
    oldKey: "input-text",
    unresolved: [],
  },
  {
    name: "UMultiSelect",
    type: UMultiSelect,
    key: "multiselect",
    oldKey: "multi-select",
    unresolved: ["--u-multiselect-option-disabled-color"],
  },
  {
    name: "URadioButton",
    type: URadioButton,
    key: "radiobutton",
    oldKey: "radio-button",
    unresolved: [],
  },
  {
    name: "USelectButton",
    type: USelectButton,
    key: "selectbutton",
    oldKey: "select-button",
    unresolved: [],
  },
  {
    name: "UToggleButton",
    type: UToggleButton,
    key: "togglebutton",
    oldKey: "toggle-button",
    unresolved: [],
  },
  {
    name: "UToggleSwitch",
    type: UToggleSwitch,
    key: "toggleswitch",
    oldKey: "toggle-switch",
    unresolved: [],
  },
  { name: "UBadge", type: UBadge, key: "badge", unresolved: [] },
  { name: "UPaginator", type: UPaginator, key: "paginator", unresolved: [] },
];

function mountInFreshDocument(type: Type<unknown>, times = 1): Document {
  const doc = document.implementation.createHTMLDocument("aura-token-wiring");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  for (let i = 0; i < times; i++) TestBed.createComponent(type).detectChanges();
  return doc;
}

function styleElements(doc: Document): HTMLStyleElement[] {
  return Array.from(doc.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
}

function count(doc: Document, key: string): number {
  return styleElements(doc).filter((el) => el.getAttribute(KEY_ATTR) === key).length;
}

function cssFor(doc: Document, key: string): string {
  return styleElements(doc)
    .filter((el) => el.getAttribute(KEY_ATTR) === key)
    .map((el) => el.textContent ?? "")
    .join("\n");
}

/** var(--u-…) references in `key`'s structural CSS that no registered <style> defines. */
function unresolvedReferences(doc: Document, key: string): string[] {
  const refs = new Set(
    Array.from(cssFor(doc, key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1])
  );
  const allCss = styleElements(doc)
    .map((el) => el.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(allCss.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((name) => !defined.has(name)).sort();
}

describe("GAP-064 Tranche 1 — Angular style keys and variables", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  describe.each(CASES)("$name", (c) => {
    it(`registers its structural CSS and variables under "${c.key}" and nothing under the old key (C1)`, () => {
      const doc = mountInFreshDocument(c.type);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(doc, c.oldKey)).toBe(0);
        expect(count(doc, `${c.oldKey}-variables`)).toBe(0);
      }
    });

    it("resolves every referenced variable except exactly the approved exceptions (C2)", () => {
      const doc = mountInFreshDocument(c.type);
      const actual = unresolvedReferences(doc, c.key);
      const unexpected = actual.filter((name) => !c.unresolved.includes(name));
      const notObserved = c.unresolved.filter((name) => !actual.includes(name));
      expect(unexpected, "unresolved but not in the approved exception list").toEqual([]);
      expect(notObserved, "approved exception not observed as unresolved").toEqual([]);
    });
  });

  it("keeps one element per key when a component is mounted twice (Review Focus 2)", () => {
    const doc = mountInFreshDocument(InputTextHost, 2);
    expect(count(doc, "inputtext")).toBe(1);
    expect(count(doc, "inputtext-variables")).toBe(1);
  });

  it("keeps componentName protected (type-checked, D1 contract boundary)", () => {
    const read = (directive: UInputText): unknown =>
      // @ts-expect-error componentName is protected on every Ultimate component
      directive.componentName;
    expect(typeof read).toBe("function");
  });
});
