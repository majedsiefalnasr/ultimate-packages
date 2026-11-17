# Vue UCheckbox

ID: vue.checkbox

Framework: vue; availability: public

## Authored interpretation

Native checkbox input with a decorative check or minus box, supporting binary mode, array-membership mode and an indeterminate state.

## Framework surface

UCheckbox (Options API SFC Checkbox.vue, name "UCheckbox") and createBaseCheckbox (BaseCheckbox.ts) plus checkboxStyleModule and CheckboxClassesParams (checkbox-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. Declared props: value, binary, indeterminate, trueValue, falseValue, disabled, readonly, required, tabindex, inputId, inputClass, inputStyle, ariaLabelledby, ariaLabel, invalid, name (plus inherited size, fluid, variant, modelValue, defaultValue). Emits declared: change, focus, blur, update:indeterminate. Template: root div with one native input type="checkbox" (id, value, name, checked, tabindex, disabled, readonly, required, aria-labelledby, aria-label, aria-invalid set from invalid) and a decorative box div rendering UCheckIcon when checked or UMinusIcon when dIndeterminate; no slots. Only @change is bound on the input: onFocus and onBlur methods exist, but no template listener calls them, so focus and blur are declared in emits and never emitted. checked is false whenever dIndeterminate is true; otherwise binary mode compares dValue with trueValue and non-binary mode requires an array dValue that includes value. onChange returns before writing when disabled or readonly; binary mode writes trueValue when indeterminate or unchecked and falseValue when checked; array mode filters value out when checked or indeterminate and appends it otherwise; when dIndeterminate it then clears it and emits update:indeterminate false; then writeValue(newValue, event) and change with the native event. updateIndeterminate copies dIndeterminate to the native input.indeterminate in mounted, updated and the indeterminate watcher. styleParams passes checked, disabled, invalid, variant (resolvedVariant) and size, so the inherited size prop is read: the root renders u-checkbox with u-checkbox-checked, p-disabled, p-invalid, p-variant-filled (variant filled), u-checkbox-sm (size small) and u-checkbox-lg (size large). The css includes the style string imported from @ultimate/uix-styles/checkbox. A checkbox group is not ported (source comment). writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. Style module registered as checkbox. checkbox.api.mdx is generated documentation and is excluded.

## Public exports

@ultimate/vue#UCheckbox
@ultimate/vue/checkbox#UCheckbox
@ultimate/vue#createBaseCheckbox
@ultimate/vue/checkbox#createBaseCheckbox

## Owned source and evidence

packages/vue/src/checkbox/BaseCheckbox.ts
packages/vue/src/checkbox/Checkbox.vue
packages/vue/src/checkbox/index.ts
packages/vue/src/checkbox/checkbox-style.ts

```text
packages/vue/src/checkbox/Checkbox.vue: name: "UCheckbox"
packages/vue/src/checkbox/Checkbox.vue: emits: ["change", "focus", "blur", "update:indeterminate"]
packages/vue/src/checkbox/Checkbox.vue: @change="onChange"
packages/vue/src/checkbox/Checkbox.vue: this.$emit("update:indeterminate", false);
packages/vue/src/checkbox/BaseCheckbox.ts: extends: createBaseInput(),
packages/vue/src/checkbox/checkbox-style.ts: import { style as checkboxCss } from "@ultimate/uix-styles/checkbox";
packages/vue/src/checkbox/checkbox-style.ts: export const checkboxStyleModule
packages/vue/src/checkbox/checkbox-style.ts: "u-checkbox-sm"
packages/vue/src/checkbox/index.ts: createBaseCheckbox
packages/vue/src/index.ts: export * from "./checkbox";
packages/vue/package.json: "./checkbox": {
```

## Relationships

package.ultimate.vue.checkbox → [vue.checkbox](vue.checkbox.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-styles.checkbox (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Vue product spec for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/toggle-switch/ src/select-button/ src/rating/ src/slider/ src/knob/",
    "outcome": "not-run",
    "revision": "638b5a660b62be5b39a9402db09bccc2a9e9d2e4",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
