# Vue URadioButton

ID: vue.radio-button

Framework: vue; availability: public

## Authored interpretation

Native radio input with a decorative circle, holding either its own value or, in binary mode, a boolean.

## Framework surface

URadioButton (Options API SFC RadioButton.vue, name "URadioButton") and createBaseRadioButton (BaseRadioButton.ts) plus radioButtonStyleModule and RadioButtonClassesParams (radio-button-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. Declared props: value, binary, readonly, tabindex, inputId, inputClass, inputStyle, ariaLabelledby, ariaLabel, disabled, required, invalid, name (plus inherited size, fluid, variant, modelValue, defaultValue). The template never reads the inherited size, fluid or variant props. Emits change (native event), focus and blur (native events). Template: root div with one native input type="radio" (id, value, name, checked, tabindex, disabled, readonly, required, aria-labelledby, aria-label, aria-invalid set from invalid) with @change, @focus and @blur bound, and a decorative box div containing an icon div; no slots. checked is dValue != null and (binary ? !!dValue : dValue === value). onChange returns before writing when disabled or readonly; it writes !checked in binary mode and value otherwise, then emits change. styleParams passes checked, disabled and invalid; the root renders u-radio-button with u-radio-button-checked, p-disabled and p-invalid. A radio group is not ported (source comment). writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported in radio-button-style.ts rather than imported from uix-styles. Style module registered as radiobutton.

## Public exports

@ultimate/vue#URadioButton
@ultimate/vue/radio-button#URadioButton
@ultimate/vue#createBaseRadioButton
@ultimate/vue/radio-button#createBaseRadioButton

## Owned source and evidence

packages/vue/src/radio-button/BaseRadioButton.ts
packages/vue/src/radio-button/RadioButton.vue
packages/vue/src/radio-button/index.ts
packages/vue/src/radio-button/radio-button-style.ts

```text
packages/vue/src/radio-button/RadioButton.vue: name: "URadioButton"
packages/vue/src/radio-button/RadioButton.vue: emits: ["change", "focus", "blur"]
packages/vue/src/radio-button/RadioButton.vue: this.dValue != null && (this.binary ? !!this.dValue : this.dValue === this.value)
packages/vue/src/radio-button/RadioButton.vue: const newValue = this.binary ? !this.checked : this.value;
packages/vue/src/radio-button/BaseRadioButton.ts: extends: createBaseInput(),
packages/vue/src/radio-button/radio-button-style.ts: export const radioButtonStyleModule
packages/vue/src/radio-button/radio-button-style.ts: "u-radio-button-checked"
packages/vue/src/radio-button/index.ts: createBaseRadioButton
packages/vue/src/index.ts: export * from "./radio-button";
packages/vue/package.json: "./radio-button": {
```

## Relationships

package.ultimate.vue.radio-button → [vue.radio-button](vue.radio-button.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
