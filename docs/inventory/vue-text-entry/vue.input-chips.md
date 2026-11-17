# Vue UInputChips

ID: vue.input-chips

Framework: vue; availability: public

## Authored interpretation

Chip list input that turns typed or pasted text into array entries.

## Framework surface

UInputChips (InputChips.vue, name "UInputChips") and createBaseInputChips (BaseInputChips.ts) plus inputChipsStyleModule (input-chips-style.ts). Base chain: createBaseInputChips extends createBaseComponent directly (not createBaseInput), so there is no dValue, writeValue or value-change; modelValue (Array) and update:modelValue are implemented manually in the SFC. Declared props: modelValue, max, separator (typed String or Object but used as a string), addOnBlur (default null), allowDuplicate (true), placeholder, invalid, disabled, inputId, ariaLabelledby, ariaLabel. inheritAttrs is false and the template has no $attrs binding, so fallthrough attributes are dropped. Emits update:modelValue, add, remove, focus, blur. The add event carries { originalEvent, value } where value is the full new array, and it is emitted from Enter, the separator key, paste and blur-add (when addOnBlur is true), unlike the React inventory; remove carries the removed item. Template: ul role="listbox" with li role="option" chips, an inline remove button with aria-label, and a text input li disabled when disabled or maxed out; no chip sub-component is used. Paste splits on the separator using non-global replace for the escape sequences and does not enforce max (Enter and the separator key do). onContainerBlur sets focusedIndex to -1 whereas other paths use null. styleParams passes filled but the root resolver only reads disabled, invalid and focused. Style module registered as inputchips.

## Public exports

@ultimate/vue#UInputChips
@ultimate/vue/input-chips#UInputChips
@ultimate/vue#createBaseInputChips
@ultimate/vue/input-chips#createBaseInputChips

## Owned source and evidence

packages/vue/src/input-chips/BaseInputChips.ts
packages/vue/src/input-chips/InputChips.vue
packages/vue/src/input-chips/index.ts
packages/vue/src/input-chips/input-chips-style.ts

```text
packages/vue/src/input-chips/InputChips.vue: name: "UInputChips"
packages/vue/src/input-chips/InputChips.vue: inheritAttrs: false
packages/vue/src/input-chips/InputChips.vue: this.$emit("add", { originalEvent: event, value });
packages/vue/src/input-chips/InputChips.vue: this.focusedIndex = -1;
packages/vue/src/input-chips/InputChips.vue: .replace("\\n", "\n")
packages/vue/src/input-chips/input-chips-style.ts: export const inputChipsStyleModule
packages/vue/src/input-chips/BaseInputChips.ts: extends: createBaseComponent({
packages/vue/src/index.ts: export * from "./input-chips";
packages/vue/package.json: "./input-chips": {
```

## Relationships

package.ultimate.vue.input-chips → [vue.input-chips](vue.input-chips.md) (reconciled family alias)
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
