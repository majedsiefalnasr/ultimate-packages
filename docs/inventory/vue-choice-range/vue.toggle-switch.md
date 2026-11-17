# Vue UToggleSwitch

ID: vue.toggle-switch

Framework: vue; availability: public

## Authored interpretation

Checkbox-based switch with a decorative slider and handle, toggling between configurable true and false values.

## Framework surface

UToggleSwitch (Options API SFC ToggleSwitch.vue, name "UToggleSwitch") and createBaseToggleSwitch (BaseToggleSwitch.ts) plus toggleSwitchStyleModule and ToggleSwitchClassesParams (toggle-switch-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: trueValue (true), falseValue (false), readonly, tabindex, inputId, inputClass, inputStyle, ariaLabelledby, ariaLabel, disabled, invalid plus modelValue and defaultValue; it declares no name, value or fluid prop. Emits change (native event), focus and blur (native events). Template: root div with one native input type="checkbox" role="switch" (id, checked, tabindex, disabled, readonly, aria-checked, aria-labelledby, aria-label, aria-invalid set from invalid) with @focus, @blur and @change bound, and a slider div containing a handle div; no slots. checked is dValue === trueValue. onChange returns before writing when disabled or readonly; it writes falseValue when checked and trueValue otherwise, then emits change. styleParams passes checked, disabled and invalid; the root renders u-toggle-switch with u-toggle-switch-checked, p-disabled and p-invalid. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles. Style module registered as toggleswitch.

## Public exports

@ultimate/vue#UToggleSwitch
@ultimate/vue/toggle-switch#UToggleSwitch
@ultimate/vue#createBaseToggleSwitch
@ultimate/vue/toggle-switch#createBaseToggleSwitch

## Owned source and evidence

packages/vue/src/toggle-switch/BaseToggleSwitch.ts
packages/vue/src/toggle-switch/ToggleSwitch.vue
packages/vue/src/toggle-switch/index.ts
packages/vue/src/toggle-switch/toggle-switch-style.ts

```text
packages/vue/src/toggle-switch/ToggleSwitch.vue: name: "UToggleSwitch"
packages/vue/src/toggle-switch/ToggleSwitch.vue: emits: ["change", "focus", "blur"]
packages/vue/src/toggle-switch/ToggleSwitch.vue: role="switch"
packages/vue/src/toggle-switch/ToggleSwitch.vue: return this.dValue === this.trueValue;
packages/vue/src/toggle-switch/BaseToggleSwitch.ts: extends: createBaseEditableHolder(),
packages/vue/src/toggle-switch/toggle-switch-style.ts: export const toggleSwitchStyleModule
packages/vue/src/toggle-switch/index.ts: createBaseToggleSwitch
packages/vue/src/index.ts: export * from "./toggle-switch";
packages/vue/package.json: "./toggle-switch": {
```

## Relationships

package.ultimate.vue.toggle-switch → [vue.toggle-switch](vue.toggle-switch.md) (reconciled family alias)
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
