# Vue USelect

ID: vue.select

Framework: vue; availability: public

## Authored interpretation

Single-value dropdown: a combobox trigger shows the selected option's label or the placeholder and opens an overlay list with an optional filter input; selecting an option writes its value and closes the overlay.

## Framework surface

USelect (Options API SFC Select.vue, name "USelect") and createBaseSelect (BaseSelect.ts) plus selectStyleModule and SelectClassesParams (select-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseSelect extends createBaseInput() over createBaseEditableHolder; the factory shadows cx() and mounted() and registers the style under the name select, which is also the Aura registry key. Declared props: options, optionLabel, optionValue, optionDisabled (string or function), placeholder, disabled, filter, filterPlaceholder, ariaFilterLabel, showClear, inputId, ariaLabel, emptyMessage ("No results found"), appendTo ("body"), plus inherited size, fluid, variant, modelValue and defaultValue. Emits declared: change, focus, blur, select, clear. change is declared and never emitted; focus forwards the trigger's native event, blur is emitted from onBlur, select carries { originalEvent, value } and clear carries no payload. No slots; no v-model/defineModel declaration. selectedOption is options.find with getOptionValue strictly equal to dValue; label is that option's label else the placeholder (default null), so the single-space fallback for label === undefined is not reached with the declared default. Template: trigger span role="combobox" with id from inputId (the id sits on the span, not an input), aria-label (ariaLabel or the label), aria-haspopup="listbox", aria-expanded, aria-disabled, aria-activedescendant (uid + "_option_" + focusedIndex when not -1) and tabindex 0 or -1; a clear icon span (aria-hidden, click only, shown when showClear, filled and not disabled; it stops propagation, writes null with the event and emits clear); a dropdown div role="button" aria-hidden; UPortal (appendTo) with the overlay div, an optional header with a searchbox input (ref="filterInput" declared and never read, aria-label ariaFilterLabel, filterPlaceholder, keydown handler) and ul role="listbox" id uid + "_list" with li role="option" ids uid + "_option_" + index keyed by index, aria-selected, aria-disabled and an emptyMessage li. There is no aria-controls; nothing calls focus; uid is `u_select_${++instanceCount}`. Behaviour: visibleOptions filters by case-insensitive trimmed substring of getOptionLabel (assumes a string result); show() sets focusedIndex to the selected visible option's index (or -1) and hide() resets focusedIndex and filterValue. onOptionSelect returns for an option-level disabled option, otherwise writes the option value with the event, emits select and hides. Keyboard (event.code): the trigger handler returns without preventDefault when disabled; ArrowDown and ArrowUp open when closed or call moveFocus; Home and End set focusedIndex to 0 or length-1 when open without skipping disabled options; Enter, NumpadEnter and Space open when closed or select the focused option; Escape hides when open; Tab hides without preventDefault. The filter input's onFilterKeyDown handles ArrowDown, ArrowUp, Enter and Escape without a disabled guard. moveFocus is a do/while that advances while the next option is disabled and next differs from focusedIndex, non-terminating when focusedIndex is -1 and every visible option is disabled. Blur emits blur without hiding, there is no outside-click handler, and with no watcher on disabled the overlay stays open when disabled becomes true. Option-click handlers never read the component disabled prop: onOptionSelect checks only the option-level disabled state (isOptionDisabled), not the disabled prop; the disabled prop guards the trigger click, show() and the key handler. Styles (select-style.ts, hand-ported, no @ultimate/uix-styles import, tokens through dt('select.…')): root classes u-select u-component p-inputwrapper with p-disabled, p-select-open, p-inputwrapper-filled and u-select-fluid (from resolvedFluid); keys label (placeholder), clearIcon, dropdown, overlay, header, pcFilter, listContainer, list, option (focused, selected, disabled) and emptyMessage are all used. The inherited size and variant props are never read and there is no invalid prop. The overlay CSS is position: absolute; top: 0; left: 0 with no positioning code or z-index. Theme: Aura registry key select. No component-metadata record exists. select.spec.ts and select.stories.ts are excluded supporting files.

## Public exports

@ultimate/vue#USelect
@ultimate/vue/select#USelect
@ultimate/vue#createBaseSelect
@ultimate/vue/select#createBaseSelect

## Owned source and evidence

packages/vue/src/select/BaseSelect.ts
packages/vue/src/select/Select.vue
packages/vue/src/select/index.ts
packages/vue/src/select/select-style.ts

```text
packages/vue/src/select/Select.vue: name: "USelect",
packages/vue/src/select/Select.vue: emits: ["change", "focus", "blur", "select", "clear"],
packages/vue/src/select/Select.vue: this.$emit("select", { originalEvent: event, value });
packages/vue/src/select/Select.vue: :aria-label="ariaLabel || label"
packages/vue/src/select/Select.vue: } while (this.isOptionDisabled(options[next]) && next !== this.focusedIndex);
packages/vue/src/select/Select.vue: onFilterKeyDown(event) {
packages/vue/src/select/BaseSelect.ts: extends: createBaseInput(),
packages/vue/src/select/BaseSelect.ts: registerComponentStyle("select", selectStyleModule);
packages/vue/src/select/select-style.ts: export const selectStyleModule
packages/vue/src/select/index.ts: createBaseSelect
packages/vue/src/index.ts: export * from "./select";
packages/vue/package.json: "./select": {
```

## Relationships

package.ultimate.vue.select → [vue.select](vue.select.md) (reconciled family alias)
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
