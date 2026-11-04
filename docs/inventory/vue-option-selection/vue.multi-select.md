# Vue UMultiSelect

ID: vue.multi-select

Framework: vue; availability: public

## Authored interpretation

Multiple-value selector: a trigger shows the selected labels and opens an overlay with an optional select-all checkbox, optional filter input and a checkbox per option; the model is an array of option values.

## Framework surface

UMultiSelect (Options API SFC MultiSelect.vue, name "UMultiSelect") and createBaseMultiSelect (BaseMultiSelect.ts) plus multiSelectStyleModule and MultiSelectClassesParams (multi-select-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseMultiSelect extends createBaseInput() over createBaseEditableHolder; the factory shadows cx() and mounted() and registers the style under the name multiselect, which is also the Aura registry key (the family is named multi-select, the DOM classes u-multi-select). Declared props: options, optionLabel, optionValue, optionDisabled, placeholder, disabled, filter, filterPlaceholder, showClear, showToggleAll (true), maxSelectedLabels (3), selectedItemsLabel ("{0} items selected"), emptyMessage, appendTo ("body"), plus inherited size, fluid, variant, modelValue and defaultValue. There is no inputId, ariaLabel or ariaFilterLabel prop (no inputId is bound anywhere). Emits declared: change, focus, blur, select-all-change, clear; all are emitted. change carries { originalEvent, value } from onOptionSelect only; select-all-change carries { value } from toggleAll and clear carries no payload, and neither also emits change. toggleAll calls writeValue(newValue) without an event; clear writes an empty array with the event. No slots; no v-model/defineModel declaration. selectedValues treats a non-array dValue as an empty array. Label: placeholder when nothing is selected; selectedItemsLabel with its first "{0}" replaced by the count when the count exceeds maxSelectedLabels; otherwise the selected option labels joined with ", " (String(value) when no option matches the value). The clear icon shows when showClear, something is selected and not disabled. Template: trigger span role="combobox" with aria-haspopup="listbox", aria-expanded, aria-disabled and tabindex 0 or -1 (no aria-label; there is no aria-activedescendant); a dropdown div role="button" aria-hidden; UPortal (appendTo) with an overlay whose header div is always rendered and holds, when showToggleAll, a checkbox with the fixed aria-label "Select All" (bound to allSelected, change calls toggleAll) and, when filter, a searchbox input with filterPlaceholder, no aria-label and no keydown handler; the list is ul role="listbox" with aria-multiselectable="true" and no id, and li role="option" keyed by index with aria-selected, aria-disabled and a readonly tabindex=-1 checkbox. There is no uid, so options and the list have no ids (no aria-controls). The filterInput ref is declared and never read; no code calls focus. Behaviour: visibleOptions filters by case-insensitive trimmed substring of getOptionLabel (assumes a string result); toggleAll acts only on visible, enabled options (allSelected requires at least one such option and all selected) and selecting all appends missing values while clearing removes only those values; isSelected uses Array includes. onOptionSelect returns for option-level disabled options, otherwise toggles the value and leaves the overlay open (it never calls hide). Keyboard (event.code on the trigger): ArrowDown and ArrowUp open when closed (show does not set focusedIndex) or call moveFocus when open; Enter, NumpadEnter and Space open when closed or select the focused option, with preventDefault; Escape hides when open; Tab hides. No Home or End. moveFocus is a do/while that advances while the next option is disabled and next differs from focusedIndex, non-terminating when focusedIndex is -1 and every visible option is disabled. Blur emits blur without hiding, no outside-click handler exists, and with no watcher on disabled the overlay stays open when disabled becomes true (the trigger's keydown then returns early). Option-click handlers never read the component disabled prop: onOptionSelect, toggleAll and clear do not check disabled; the disabled prop guards the trigger click, show(), the key handler and the clear icon's visibility, and the checkbox inside each li carries only the option-level disabled attribute. Styles (multi-select-style.ts, hand-ported, no @ultimate/uix-styles import, tokens through dt('multiselect.…')): root classes u-multi-select u-component p-inputwrapper with p-disabled, p-multiselect-open, p-inputwrapper-filled and u-multi-select-fluid (from resolvedFluid); keys label (placeholder), clearIcon, dropdown, overlay, header, pcFilter, listContainer, list, option (focused, selected, disabled) and emptyMessage are all used. The inherited size and variant props are never read and there is no invalid prop. Theme: Aura registry key multiselect (value multiSelect), which differs from the family name multi-select. No component-metadata record exists. multi-select.spec.ts and multi-select.stories.ts are excluded supporting files.

## Public exports

@ultimate/vue#UMultiSelect
@ultimate/vue/multi-select#UMultiSelect
@ultimate/vue#createBaseMultiSelect
@ultimate/vue/multi-select#createBaseMultiSelect

## Owned source and evidence

packages/vue/src/multi-select/BaseMultiSelect.ts
packages/vue/src/multi-select/MultiSelect.vue
packages/vue/src/multi-select/index.ts
packages/vue/src/multi-select/multi-select-style.ts

```text
packages/vue/src/multi-select/MultiSelect.vue: name: "UMultiSelect",
packages/vue/src/multi-select/MultiSelect.vue: emits: ["change", "focus", "blur", "select-all-change", "clear"],
packages/vue/src/multi-select/MultiSelect.vue: this.$emit("select-all-change", { value: newValue });
packages/vue/src/multi-select/MultiSelect.vue: aria-label="Select All"
packages/vue/src/multi-select/MultiSelect.vue: return this.selectedItemsLabel.replace("{0}", String(selected.length));
packages/vue/src/multi-select/MultiSelect.vue: } while (this.isOptionDisabled(options[next]) && next !== this.focusedIndex);
packages/vue/src/multi-select/BaseMultiSelect.ts: extends: createBaseInput(),
packages/vue/src/multi-select/BaseMultiSelect.ts: registerComponentStyle("multiselect", multiSelectStyleModule);
packages/vue/src/multi-select/multi-select-style.ts: export const multiSelectStyleModule
packages/vue/src/multi-select/index.ts: createBaseMultiSelect
packages/vue/src/index.ts: export * from "./multi-select";
packages/vue/package.json: "./multi-select": {
```

## Relationships

package.ultimate.vue.multi-select → [vue.multi-select](vue.multi-select.md) (reconciled family alias)
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
