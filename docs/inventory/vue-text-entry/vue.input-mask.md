# Vue UInputMask

ID: vue.input-mask

Framework: vue; availability: public

## Authored interpretation

Masked text input with token mask, slot character, auto-clear and unmask options.

## Framework surface

UInputMask (InputMask.vue, name "UInputMask") and createBaseInputMask (BaseInputMask.ts) plus inputMaskStyleModule (input-mask-style.ts). Base factory chain: createBaseInputMask extends createBaseInput({ componentName: "inputmask", styleModule }) (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); cx, style registration, unstyled, pt and dt come from the base chain, and no local cx or mounted shadows it. Declared props: slotChar ("_"), id, mask, placeholder, autoClear (true), unmask (false), readonly, disabled, invalid, name. inheritAttrs is false. Emits focus, blur, keydown, keypress, complete ({ originalEvent, value }) and paste; v-model through writeValue (unmask writes raw characters instead of the formatted buffer). The template renders a nested UInputText with id, value (currentVal), cx('root'), readonly, disabled, invalid, size, name, variant, placeholder, fluid (resolvedFluid), unstyled and pt (merging ptm('pcInputText').root with ptmi('root')), so the root element is the native input carrying the InputText classes plus u-inputmask. The mask logic is a port of PrimeVue 4.5.5: tokens 9 digit, a letter, * alphanumeric, ? marks the remainder optional, anything else is a literal; Backspace and Delete shift the remaining characters across separators; Escape restores the value held at focus; Enter blurs; keys are read from event.key; keypress ignores ctrl, alt and meta chords and non-character keys; onInput returns while a composition is open and compositionend finalizes it; paste only emits paste and the browser's input event reformats; an Android Chrome branch exists; mask and slotChar watchers re-initialize; timers are cleared before unmount. Without a mask the component is a plain input. An uncontrolled instance also stores its own value. formField.onBlur (Vue Forms) is not carried. inputMaskStyleModule has empty css and the root class u-inputmask, because the nested UInputText registers the shared InputText CSS. Mobile and IME paths are tested with simulated events only. The Aura preset registry has no inputmask key.

## Public exports

@ultimate/vue#UInputMask
@ultimate/vue/input-mask#UInputMask
@ultimate/vue#createBaseInputMask
@ultimate/vue/input-mask#createBaseInputMask

## Owned source and evidence

packages/vue/src/input-mask/BaseInputMask.ts
packages/vue/src/input-mask/InputMask.vue
packages/vue/src/input-mask/index.ts
packages/vue/src/input-mask/input-mask-style.ts

```text
packages/vue/src/input-mask/InputMask.vue: name: "UInputMask"
packages/vue/src/input-mask/InputMask.vue: <UInputText
packages/vue/src/input-mask/InputMask.vue: emits: ["focus", "blur", "keydown", "keypress", "complete", "paste"]
packages/vue/src/input-mask/InputMask.vue: :class="cx('root')"
packages/vue/src/input-mask/input-mask-style.ts: export const inputMaskStyleModule
packages/vue/src/input-mask/BaseInputMask.ts: export function createBaseInputMask
packages/vue/src/input-mask/BaseInputMask.ts: componentName: "inputmask"
packages/vue/src/index.ts: export * from "./input-mask";
packages/vue/package.json: "./input-mask": {
```

## Relationships

package.ultimate.vue.input-mask → [vue.input-mask](vue.input-mask.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)

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
