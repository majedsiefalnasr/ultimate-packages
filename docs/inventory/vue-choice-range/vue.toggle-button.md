# Vue UToggleButton

ID: vue.toggle-button

Framework: vue; availability: public

## Authored interpretation

Native button that toggles a boolean value and shows an on or off label and optional icon.

## Framework surface

UToggleButton (Options API SFC ToggleButton.vue, name "UToggleButton") and createBaseToggleButton (BaseToggleButton.ts) plus toggleButtonStyleModule and ToggleButtonClassesParams (toggle-button-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: onIcon, offIcon, onLabel ("Yes"), offLabel ("No"), readonly, tabindex, ariaLabelledby, ariaLabel, disabled, invalid, fluid (a plain own boolean prop) plus modelValue and defaultValue. Emits change (native click event) and blur (native event); no focus listener or emit. Template: one native button type="button" with the ripple directive (rippleDirective from ../ripple), tabindex, disabled, aria-pressed set from active, aria-label, aria-labelledby, aria-invalid set from invalid, @click bound to onChange and @blur; inside, a content span holding an icon span (rendered when onIcon or offIcon is set, class onIcon when active else offIcon) and a label span; no slots. active is dValue === true, so a truthy non-boolean model value renders as inactive. label is onLabel when active else offLabel, but a single space when isNotEmpty (from @ultimate/uix-utils/object) is false for either label. onChange returns before writing when disabled or readonly, otherwise writeValue(!active, event) then emits change. No readonly attribute is rendered. styleParams passes checked (active), disabled, invalid and fluid; the root renders u-toggle-button with u-toggle-button-checked, p-disabled, p-invalid and u-toggle-button-fluid. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles. A toggle-button group context is not ported (source comment). Style module registered as togglebutton.

## Public exports

@ultimate/vue#UToggleButton
@ultimate/vue/toggle-button#UToggleButton
@ultimate/vue#createBaseToggleButton
@ultimate/vue/toggle-button#createBaseToggleButton

## Owned source and evidence

packages/vue/src/toggle-button/BaseToggleButton.ts
packages/vue/src/toggle-button/ToggleButton.vue
packages/vue/src/toggle-button/index.ts
packages/vue/src/toggle-button/toggle-button-style.ts

```text
packages/vue/src/toggle-button/ToggleButton.vue: name: "UToggleButton"
packages/vue/src/toggle-button/ToggleButton.vue: emits: ["change", "blur"]
packages/vue/src/toggle-button/ToggleButton.vue: return this.dValue === true;
packages/vue/src/toggle-button/ToggleButton.vue: import { isNotEmpty } from "@ultimate/uix-utils/object";
packages/vue/src/toggle-button/ToggleButton.vue: this.writeValue(!this.active, event);
packages/vue/src/toggle-button/ToggleButton.vue: directives: { ripple: rippleDirective },
packages/vue/src/toggle-button/BaseToggleButton.ts: extends: createBaseEditableHolder(),
packages/vue/src/toggle-button/toggle-button-style.ts: export const toggleButtonStyleModule
packages/vue/src/toggle-button/index.ts: createBaseToggleButton
packages/vue/src/index.ts: export * from "./toggle-button";
packages/vue/package.json: "./toggle-button": {
```

## Relationships

package.ultimate.vue.toggle-button → [vue.toggle-button](vue.toggle-button.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue.ripple (pending cross-batch)
package.ultimate.uix-utils.object (pending cross-batch)

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
