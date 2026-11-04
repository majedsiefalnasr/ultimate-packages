# Vue UAutoComplete

ID: vue.autocomplete

Framework: vue; availability: public

## Authored interpretation

Text combobox whose suggestion list is supplied by the consumer: typing emits a debounced complete event with the query, and the suggestions prop is rendered in an overlay list from which one option is selected.

## Framework surface

UAutoComplete (Options API SFC AutoComplete.vue, name "UAutoComplete") and createBaseAutoComplete (BaseAutoComplete.ts) plus autoCompleteStyleModule and AutoCompleteClassesParams (autocomplete-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseAutoComplete extends createBaseInput() (vue-core base-input: size, fluid and variant props, resolvedFluid, resolvedVariant) over createBaseEditableHolder (modelValue, defaultValue, update:modelValue, value-change, dValue, filled, writeValue); because createBaseInput takes no arguments the factory shadows cx() and mounted() locally over its own style module, and mounted registers the style under the name autocomplete. Declared props: suggestions (default empty array), optionLabel (string or function), minLength (1), delay (300 ms), placeholder, disabled, loading, emptyMessage ("No results found"), showEmptyMessage (true), inputId, ariaLabel, appendTo ("body"), plus inherited size, fluid, variant, modelValue and defaultValue. There is no optionValue prop: the model value is the whole suggestion option. Emits declared: change, focus, blur, complete, option-select, clear. change is declared and never emitted by this component; focus and blur forward the native input events, complete carries { originalEvent, query }, option-select carries { originalEvent, value }, and clear carries no payload. Model updates flow through the base writeValue (update:modelValue when controlled; value-change always). No slots, no v-model/defineModel declaration (consumers bind modelValue and update:modelValue). Template: root div, a native input type="text" role="combobox" with aria-autocomplete="list", aria-expanded, aria-activedescendant (uid + "_option_" + focusedIndex when focusedIndex is not -1), aria-label from ariaLabel, id from inputId and ref="input" (the ref is declared and never read; no code calls focus), an aria-hidden loader span rendering a literal ellipsis character when loading, and a UPortal (vue-core Portal, a Teleport wrapper, appendTo) rendering ul role="listbox" id uid + "_list" only while overlayVisible. The list items are keyed by index; a trailing li role="option" shows emptyMessage when suggestions is empty and showEmptyMessage is true. There is no aria-controls and no aria-haspopup although the list carries an id; uid is `u_autocomplete_${++instanceCount}` from a module-level counter. State: inputValue is seeded in data() from defaultValue (when not undefined) else modelValue through getOptionLabel, and a dValue watcher rewrites inputValue from getOptionLabel(newValue); getOptionLabel returns an empty string for null or undefined, calls optionLabel when it is a function, reads the optionLabel property of an object when it is a string, and otherwise stringifies. isSelected uses strict equality (dValue === option), so object suggestions are matched by reference. Typing: onInput sets inputValue and clears any pending searchTimeout; an empty query calls writeValue(null, event), emits clear and hides; a query of at least minLength resets focusedIndex to -1 and schedules a setTimeout of delay ms that emits complete and then sets overlayVisible true, so the overlay opens after the delay even when suggestions is empty; a shorter query hides. searchTimeout is not cleared by hide, onBlur or unmount (no unmount hook exists), so a pending timer can still emit complete and open the overlay after blur. onBlur hides the overlay and emits blur; no mousedown handler exists on the list. Keyboard (event.code, onKeyDown on the input): when disabled it calls preventDefault and returns. ArrowDown and ArrowUp return without preventDefault when the overlay is closed; when open they wrap focusedIndex. When suggestions is empty ArrowDown sets focusedIndex to 0 and a following Enter calls onOptionSelect with suggestions[focusedIndex], which is undefined, writing undefined and emitting option-select with an undefined value. Enter and NumpadEnter select the focused suggestion and call preventDefault only when the overlay is open; Escape hides and calls preventDefault only when open. No Home, End or Tab handling. Hover sets focusedIndex. Option-click handlers never read the component disabled prop: onOptionSelect writes the value, sets inputValue, emits option-select and hides without checking disabled; the native input is disabled, so the overlay is normally unreachable. There is no optionDisabled prop and no per-option disabled state. No outside-click handler exists; the overlay is dismissed by blur, Escape, selection, or an empty or shorter-than-minLength query. Styles (autocomplete-style.ts, hand-ported, no @ultimate/uix-styles import, theme tokens through dt('autocomplete.…') and one dt('icon.size')): root classes u-autocomplete u-component with p-filled, u-autocomplete-fluid and p-disabled from styleParams { filled, fluid (resolvedFluid), disabled }; pcInputText, loader, overlay, list, option (focused, selected) and emptyMessage keys. The overlay key and its .u-autocomplete-overlay rule are defined but never used by the template, because the ul list sits directly inside UPortal; p-filled and p-disabled have no CSS rule in this module (only .u-autocomplete.u-autocomplete-fluid is a state rule on the root). The inherited size and variant props are never read, and there is no invalid prop. Theme: Aura registry key autocomplete (packages/themes/src/presets/aura/index.ts), matching the registered style name. No component-metadata record exists for this family. autocomplete.spec.ts and autocomplete.stories.ts are excluded supporting files.

## Public exports

@ultimate/vue#UAutoComplete
@ultimate/vue/autocomplete#UAutoComplete
@ultimate/vue#createBaseAutoComplete
@ultimate/vue/autocomplete#createBaseAutoComplete

## Owned source and evidence

packages/vue/src/autocomplete/BaseAutoComplete.ts
packages/vue/src/autocomplete/AutoComplete.vue
packages/vue/src/autocomplete/index.ts
packages/vue/src/autocomplete/autocomplete-style.ts

```text
packages/vue/src/autocomplete/AutoComplete.vue: name: "UAutoComplete",
packages/vue/src/autocomplete/AutoComplete.vue: emits: ["change", "focus", "blur", "complete", "option-select", "clear"],
packages/vue/src/autocomplete/AutoComplete.vue: this.$emit("complete", { originalEvent: event, query });
packages/vue/src/autocomplete/AutoComplete.vue: this.onOptionSelect(event, this.suggestions[this.focusedIndex]);
packages/vue/src/autocomplete/AutoComplete.vue: <UPortal v-if="overlayVisible" :appendTo="appendTo">
packages/vue/src/autocomplete/AutoComplete.vue: return this.dValue === option;
packages/vue/src/autocomplete/BaseAutoComplete.ts: extends: createBaseInput(),
packages/vue/src/autocomplete/BaseAutoComplete.ts: registerComponentStyle("autocomplete", autoCompleteStyleModule);
packages/vue/src/autocomplete/autocomplete-style.ts: export const autoCompleteStyleModule
packages/vue/src/autocomplete/autocomplete-style.ts: overlay: "u-autocomplete-overlay",
packages/vue/src/autocomplete/index.ts: createBaseAutoComplete
packages/vue/src/index.ts: export * from "./autocomplete";
packages/vue/package.json: "./autocomplete": {
```

## Relationships

package.ultimate.vue.autocomplete → [vue.autocomplete](vue.autocomplete.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
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
    "behavior": "Bounded Vue product spec for the option-selection families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/autocomplete/ src/cascade-select/ src/listbox/ src/multi-select/ src/select/",
    "outcome": "not-run",
    "revision": "ba145d8cfc110bae18e4787a1242d51e38da9cd1",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
