# Vue UTextarea

ID: vue.textarea

Framework: vue; availability: public

## Authored interpretation

Native textarea with v-model, invalid/variant/fluid state classes and optional auto-resize.

## Framework surface

UTextarea (Textarea.vue, name "UTextarea") and createBaseTextarea (BaseTextarea.ts) plus textareaStyleModule and TextareaClassesParams (textarea-style.ts). Base factory chain: createBaseX extends createBaseInput (vue-core base-input: size, fluid, variant props, resolvedVariant, resolvedFluid) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue); because createBaseInput takes no arguments, the factory shadows cx() and mounted() locally over its own style module. The inherited size prop is never read by the template. Declared props: autoResize, disabled, invalid, name, placeholder. Emits focus and blur; v-model through writeValue on input; no slots. Template: one textarea with a template ref and aria-invalid from invalid. autoResize: a ResizeObserver is created in mounted only when autoResize is true at mount time and ResizeObserver exists; updated() and onInput also call resize(), which returns when the element has no offsetParent, then shrinks or grows style.height from scrollHeight; beforeUnmount disconnects the observer. styleParams passes invalid, fluid, variantFilled and autoResize but never filled, so TextareaClassesParams.filled and the p-filled class are never applied by the component (the filled state is not rendered). Style module registered as textarea.

## Public exports

@ultimate/vue#UTextarea
@ultimate/vue/textarea#UTextarea
@ultimate/vue#createBaseTextarea
@ultimate/vue/textarea#createBaseTextarea

## Owned source and evidence

packages/vue/src/textarea/BaseTextarea.ts
packages/vue/src/textarea/Textarea.vue
packages/vue/src/textarea/index.ts
packages/vue/src/textarea/textarea-style.ts

```text
packages/vue/src/textarea/Textarea.vue: name: "UTextarea"
packages/vue/src/textarea/Textarea.vue: new ResizeObserver
packages/vue/src/textarea/Textarea.vue: !el.offsetParent
packages/vue/src/textarea/textarea-style.ts: export const textareaStyleModule
packages/vue/src/textarea/textarea-style.ts: "p-filled": Boolean(filled)
packages/vue/src/textarea/BaseTextarea.ts: export function createBaseTextarea
packages/vue/src/index.ts: export * from "./textarea";
packages/vue/package.json: "./textarea": {
```

## Relationships

package.ultimate.vue.textarea → [vue.textarea](vue.textarea.md) (reconciled family alias)
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
