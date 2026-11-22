# Vue UInputText

ID: vue.input-text

Framework: vue; availability: public

## Authored interpretation

Single native text input with v-model, value-derived filled state, invalid/variant/size/fluid classes, pass-through, unstyled, per-instance dt and focus/blur emits.

## Framework surface

UInputText (Options API SFC InputText.vue, name "UInputText", inheritAttrs false) and createBaseInputText (BaseInputText.ts) plus inputTextStyleModule and InputTextClassesParams (input-text-style.ts). Base factory chain: createBaseInputText extends createBaseInput({ componentName: 'inputtext', styleModule }) (vue-core base-input forwards the options to createBaseEditableHolder and createBaseComponent: size, fluid, variant props, resolvedVariant, resolvedFluid, modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), so cx, style registration, unstyled, per-instance dt and pt come from the base chain and the factory shadows nothing. Declared props: disabled, invalid, name, placeholder (plus inherited size small|large, fluid, variant, modelValue, defaultValue, unstyled, dt, pt, ptOptions). Emits focus and blur (native event); update:modelValue and value-change come from writeValue on every native input event. Template: one input type="text" bound to dValue with aria-invalid, data-p and v-bind ptmi('root', { context: { filled, disabled } }); no slots. styleParams passes invalid, fluid (resolvedFluid), filled (the editable holder's value-derived filled), variantFilled (resolvedVariant === "filled") and size; the root resolver renders u-inputtext u-component with p-filled, p-invalid, p-variant-filled, u-inputtext-fluid, u-inputtext-sm and u-inputtext-lg. dataP is cn() over invalid, fluid, variant-derived filled and the size token. The CSS is the shared @ultimate/uix-styles/inputtext module (ADR-082), registered under the Aura key inputtext. Ancestor fluid detection needs a Fluid provider that Vue does not ship; the explicit fluid prop works. The forms integration (formField) is not implemented (separate Vue Forms spec). The decisions for this family are in ADR-086.

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
packages/vue/src/input-text/BaseInputText.ts: createBaseInput({ componentName: "inputtext", styleModule: inputTextStyleModule })
packages/vue/src/input-text/input-text-style.ts: "p-filled": Boolean(filled),
packages/vue/src/input-text/input-text-style.ts: import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";
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
