# Vue UInputMask

ID: vue.input-mask

Framework: vue; availability: public

## Authored interpretation

Masked text input with token mask, slot character, auto-clear and unmask options.

## Framework surface

UInputMask (InputMask.vue, name "UInputMask") and createBaseInputMask (BaseInputMask.ts) plus inputMaskStyleModule (input-mask-style.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. The inherited size prop is never read by the template. Declared props: slotChar ("_"), mask, placeholder, autoClear (true), unmask (false), readonly, disabled, invalid, name. Emits focus, blur, keydown, complete ({ originalEvent, value }, only when the mask is completed and not blank) and paste; v-model through writeValue (unmask writes raw characters instead of the formatted buffer). Mask tokens: 9 digit, a letter, * alphanumeric, ? marks the remainder optional, anything else is a literal. The template is a plain input type="text" whose class is cx('root') with no params, so it renders only u-input-mask (display: inline-block); although the style header describes rendering UInputText, the template does not apply the u-input-text class, so no input-text token CSS reaches it. The mask watcher calls initMask only and does not re-sync the buffer from the model value. initMask assigns this.partialPosition, which is not declared in data(). onPaste returns early without emitting paste when readonly, disabled or no mask is set; otherwise it calls preventDefault and emits paste. Style module registered as input-mask. The Aura preset registry has no inputmask key.

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
packages/vue/src/input-mask/InputMask.vue: this.partialPosition = partialPosition;
packages/vue/src/input-mask/InputMask.vue: if (this.readonly || this.disabled || !this.mask) return;
packages/vue/src/input-mask/InputMask.vue: :class="cx('root')"
packages/vue/src/input-mask/input-mask-style.ts: export const inputMaskStyleModule
packages/vue/src/input-mask/BaseInputMask.ts: export function createBaseInputMask
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
