import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/checkbox/checkbox.ts (UCheckbox class, `input()` signal API)
 * - React: packages/react/src/checkbox/checkbox.tsx (UCheckboxProps interface + destructured props)
 * - Vue: packages/vue/src/checkbox/BaseCheckbox.ts (createBaseCheckbox's `props` object)
 *   and packages/vue/src/checkbox/Checkbox.vue (real `emits` declaration)
 *
 * Events, verified per framework (this is the "empty-events, distinct
 * reasoning" ground-truth case — Angular alone has zero custom events, by
 * explicit documented decision, not by omission):
 * - Angular's UCheckbox has NO `onChange`/`onFocus`/`onBlur` `output()`s at
 *   all — confirmed by the doc comment at packages/ng/src/checkbox/checkbox.ts
 *   (lines 28-32): "...and the `onChange`/`onFocus`/`onBlur` `output()`s —
 *   none of these appear in this task's Interfaces section, which defines a
 *   smaller, spec-mandated signal-input surface (`binary`, `label`, inherited
 *   `disabled`) with 'no `UCheckbox`-specific outputs beyond the CVA
 *   contract.'" State changes flow exclusively through the Angular Forms
 *   `ControlValueAccessor` contract (`writeValue`/`registerOnChange`/
 *   `registerOnTouched`, inherited from `UBaseEditableHolder`), not through
 *   any `output()`.
 * - React's `UCheckboxProps.onChange?: (event: UCheckboxChangeEvent) => void`
 *   is a real, genuinely custom callback prop: its payload
 *   (`UCheckboxChangeEvent`) is an Ultimate-authored shape (`originalEvent`,
 *   `value`, `checked`, `target`), not a raw passthrough of the native DOM
 *   `ChangeEvent` — modeled as an EventFact (unlike Button's plain native
 *   passthrough).
 * - Vue's `Checkbox.vue` declares `emits: ["change", "focus", "blur",
 *   "update:indeterminate"]`. `change` is emitted with the raw native DOM
 *   change event via `this.$emit("change", event)` inside `onChange()`,
 *   after this component's own binary/array-mode value resolution — modeled
 *   as the same "change" EventFact concept as React's `onChange`, since both
 *   fire once per user-driven checked-state change (the wire-level payload
 *   differs, which is exactly what per-framework `EventFact` divergence is
 *   for).
 */
export const CHECKBOX_METADATA: ComponentMetadata = {
  name: "Checkbox",
  category: "Form",
  description:
    "A boolean input control rendered as a native checkbox, with an optional text label.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/checkbox/checkbox.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/checkbox/checkbox.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/checkbox/BaseCheckbox.ts" },
  },
  api: {
    ng: {
      props: [
        {
          name: "binary",
          type: "boolean",
          default: "false",
          required: false,
          description: "Allows to select a boolean value instead of multiple values.",
        },
        { name: "label", type: "string | undefined", required: false, description: "Text label rendered next to the checkbox." },
      ],
      events: [],
    },
    react: {
      props: [
        { name: "checked", type: "unknown", required: true },
        { name: "trueValue", type: "unknown", default: "true", required: false },
        { name: "falseValue", type: "unknown", default: "false", required: false },
        { name: "disabled", type: "boolean", default: "false", required: false },
        { name: "readOnly", type: "boolean", default: "false", required: false },
        { name: "invalid", type: "boolean", default: "false", required: false },
        { name: "name", type: "string | undefined", required: false },
        { name: "value", type: "unknown", required: false },
        { name: "id", type: "string | undefined", required: false },
        { name: "inputId", type: "string | undefined", required: false },
        { name: "tooltip", type: "string | undefined", required: false },
        { name: "tooltipOptions", type: "Record<string, unknown> | undefined", required: false },
        { name: "autoFocus", type: "boolean", default: "false", required: false },
        { name: "className", type: "string | undefined", required: false },
      ],
      events: [
        {
          semanticId: "change",
          frameworkName: "onChange",
          mechanism: "callback-prop",
          payloadDescription:
            "UCheckboxChangeEvent: { originalEvent: React.ChangeEvent<HTMLInputElement>; value: unknown; checked: unknown; target: { type: 'checkbox'; name?: string; id?: string; value: unknown; checked: unknown } }",
        },
      ],
    },
    vue: {
      props: [
        { name: "value", required: false, type: "any", default: "null" },
        { name: "binary", type: "Boolean", default: "false", required: false },
        { name: "indeterminate", type: "Boolean", default: "false", required: false },
        { name: "trueValue", type: "any", default: "true", required: false },
        { name: "falseValue", type: "any", default: "false", required: false },
        { name: "disabled", type: "Boolean", default: "false", required: false },
        { name: "readonly", type: "Boolean", default: "false", required: false },
        { name: "required", type: "Boolean", default: "false", required: false },
        { name: "tabindex", type: "Number", default: "null", required: false },
        { name: "inputId", type: "String", default: "null", required: false },
        { name: "inputClass", type: "[String, Object]", default: "null", required: false },
        { name: "inputStyle", type: "Object", default: "null", required: false },
        { name: "ariaLabelledby", type: "String", default: "null", required: false },
        { name: "ariaLabel", type: "String", default: "null", required: false },
        { name: "invalid", type: "Boolean", default: "false", required: false },
        { name: "name", type: "String", default: "null", required: false },
      ],
      events: [
        {
          semanticId: "change",
          frameworkName: "change",
          mechanism: "emit",
          payloadDescription: "Raw native DOM change Event, emitted after this component's own binary/array-mode value resolution.",
        },
      ],
    },
  },
  style: {
    componentName: "checkbox",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/checkbox/checkbox.ts", "packages/ng/src/checkbox/checkbox-style.ts"],
  },
};
