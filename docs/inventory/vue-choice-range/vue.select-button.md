# Vue USelectButton

ID: vue.select-button

Framework: vue; availability: public

## Authored interpretation

Group of toggle buttons, one per option, for single or multiple selection.

## Framework surface

USelectButton (Options API SFC SelectButton.vue, name "USelectButton") and createBaseSelectButton (BaseSelectButton.ts) plus selectButtonStyleModule and SelectButtonClassesParams (select-button-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: options (default empty array), optionLabel, optionValue, optionDisabled (each a string key or function, default null), multiple, allowEmpty (true), disabled, ariaLabelledby plus modelValue and defaultValue. Emits change with { originalEvent: new Event("change"), value }, a synthetic Event rather than the user's event. Template: root div role="group" with aria-labelledby, rendering one UToggleButton per option (composed from ../toggle-button/ToggleButton.vue, record vue.toggle-button) with model-value from isSelected, on-label and off-label both set to the option label, disabled when the group or the option is disabled, and update:model-value bound to onOptionSelect; no slots. The root cx call passes the constant { fluid: false }, so u-select-button-fluid is never applied, and the invalid param is never passed, so u-select-button-invalid is never applied. getOptionLabel, getOptionValue and isOptionDisabled accept a function or a string key (string keys read only from non-null objects; labels fall back to String(option) and a null key value gives an empty label). isSelected compares by strict equality; in multiple mode it also requires an array dValue. onOptionSelect returns when the group or option is disabled; in multiple mode it removes a selected value (returning early when allowEmpty is false and one value remains) or appends one; in single mode it writes null when the selected option is chosen again (returning early when allowEmpty is false) and the option value otherwise; it calls writeValue(newValue) without an event. The source comment lists dataKey equality, item slots and roving tabindex as not ported. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles. Style module registered as selectbutton.

## Public exports

@ultimate/vue#USelectButton
@ultimate/vue/select-button#USelectButton
@ultimate/vue#createBaseSelectButton
@ultimate/vue/select-button#createBaseSelectButton

## Owned source and evidence

packages/vue/src/select-button/BaseSelectButton.ts
packages/vue/src/select-button/SelectButton.vue
packages/vue/src/select-button/index.ts
packages/vue/src/select-button/select-button-style.ts

```text
packages/vue/src/select-button/SelectButton.vue: name: "USelectButton"
packages/vue/src/select-button/SelectButton.vue: emits: ["change"]
packages/vue/src/select-button/SelectButton.vue: <UToggleButton
packages/vue/src/select-button/SelectButton.vue: cx('root', { fluid: false })
packages/vue/src/select-button/SelectButton.vue: this.$emit("change", { originalEvent: new Event("change"), value: newValue });
packages/vue/src/select-button/SelectButton.vue: if (!this.allowEmpty && current.length === 1) return;
packages/vue/src/select-button/BaseSelectButton.ts: extends: createBaseEditableHolder(),
packages/vue/src/select-button/select-button-style.ts: export const selectButtonStyleModule
packages/vue/src/select-button/index.ts: createBaseSelectButton
packages/vue/src/index.ts: export * from "./select-button";
packages/vue/package.json: "./select-button": {
```

## Relationships

package.ultimate.vue.select-button → [vue.select-button](vue.select-button.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue.toggle-button → [vue.toggle-button](vue.toggle-button.md) (reconciled family alias)

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
