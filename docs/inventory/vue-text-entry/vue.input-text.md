# Vue UInputText

ID: vue.input-text

Framework: vue; availability: public

## Authored interpretation

Single native text input with v-model, invalid/variant/fluid state classes and focus/blur emits.

## Framework surface

UInputText (Options API SFC InputText.vue, name "UInputText") and createBaseInputText (BaseInputText.ts) plus inputTextStyleModule and InputTextClassesParams (input-text-style.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. The inherited size prop is never read by the template. Declared props: disabled, invalid, name, placeholder (plus inherited size, fluid, variant, modelValue, defaultValue). Emits focus and blur (native event); update:modelValue and value-change come from writeValue on every native input event. Template: one input type="text" bound to dValue with aria-invalid set from invalid; no slots. styleParams passes invalid, fluid (resolvedFluid) and filled (resolvedVariant === "filled"); the root resolver renders u-input-text with p-invalid, u-input-text-fluid and p-variant-filled, so state classes mix u- and p- prefixes. Style module registered as inputtext.

## Public exports

@ultimate/vue#UInputText
@ultimate/vue/input-text#UInputText
@ultimate/vue#createBaseInputText
@ultimate/vue/input-text#createBaseInputText

## Owned source and evidence

packages/vue/src/input-text/BaseInputText.ts
packages/vue/src/input-text/InputText.vue
packages/vue/src/input-text/index.ts
packages/vue/src/input-text/input-text-style.ts

```text
packages/vue/src/input-text/InputText.vue: name: "UInputText"
packages/vue/src/input-text/InputText.vue: filled: this.resolvedVariant === "filled"
packages/vue/src/input-text/input-text-style.ts: export const inputTextStyleModule
packages/vue/src/input-text/input-text-style.ts: "p-variant-filled"
packages/vue/src/input-text/BaseInputText.ts: export function createBaseInputText
packages/vue/src/index.ts: export * from "./input-text";
packages/vue/package.json: "./input-text": {
```

## Relationships

package.ultimate.vue.input-text → [vue.input-text](vue.input-text.md) (reconciled family alias)
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
    "behavior": "Bounded Vue product spec for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-text/ src/textarea/ src/input-mask/ src/input-otp/ src/password/ src/input-chips/ src/float-label/ src/ifta-label/ src/icon-field/ src/input-group/",
    "outcome": "not-run",
    "revision": "849ec35cc57b459cf1a6fb24f83b24d4beff559a",
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
