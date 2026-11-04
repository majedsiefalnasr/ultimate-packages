# Vue UListbox

ID: vue.listbox

Framework: vue; availability: public

## Authored interpretation

Always-visible option list with an optional filter input, supporting single selection or, with multiple, an array of selected values with a checkbox per option.

## Framework surface

UListbox (Options API SFC Listbox.vue, name "UListbox") and createBaseListbox (BaseListbox.ts) plus listboxStyleModule and ListboxClassesParams (listbox-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseListbox extends createBaseEditableHolder() directly (modelValue, defaultValue, update:modelValue, value-change, dValue, filled, writeValue), not createBaseInput, so there are no size, fluid or variant props and no fluid handling; the factory shadows cx() and mounted() and registers the style under the name listbox, which is also the Aura registry key. Declared props: options, optionLabel, optionValue, optionDisabled, multiple (false), filter (false), filterPlaceholder, disabled, ariaLabel, emptyMessage ("No results found"), plus modelValue and defaultValue. No inputId, showClear or appendTo prop. Emits declared: change, focus, blur; all three are emitted. change carries { originalEvent, value } from onOptionSelect; focus and blur forward the list's native events. No slots; no v-model/defineModel declaration. Template: root div (cx('root', { disabled })); an optional header div with a native input type="text" role="searchbox" autocomplete="off" and filterPlaceholder, whose filter input is not disabled when disabled is set and has no keydown handler and no aria-label; a list container with ul role="listbox" bound to aria-multiselectable (the multiple prop), aria-label (ariaLabel), tabindex 0 (-1 when disabled) and the keydown, focus and blur handlers; li role="option" keyed by index with aria-selected, aria-disabled and, when multiple, a readonly tabindex=-1 checkbox; an emptyMessage li role="option" when no option is visible. No uid, so options have no ids and the list has no aria-activedescendant (no aria-controls either). There is no Portal and no overlay: the list is rendered inline. Behaviour: visibleOptions filters by case-insensitive trimmed substring of getOptionLabel (which assumes a string result when optionLabel is a function); isSelected is strict equality of dValue and the option value, or Array includes when multiple. onOptionSelect returns for an option-level disabled option; in multiple mode it toggles the value in a copy of the array (a non-array dValue counts as empty), in single mode it writes the option value, so selecting the selected option again rewrites the same value and the component never emits null (no deselect, no clear). Writes pass the native event; change is emitted after writeValue. Keyboard (event.code on the list): when disabled onKeyDown returns without preventDefault. ArrowDown and ArrowUp call moveFocus; Home and End set focusedIndex to 0 or length-1 without skipping disabled options (and with an empty visibleOptions Home sets 0); Enter, NumpadEnter and Space select visibleOptions[focusedIndex] when it exists and always call preventDefault. moveFocus is a do/while that advances while the next option is disabled and next differs from focusedIndex, which is non-terminating when focusedIndex is -1 and every visible option is disabled (and is the only exit otherwise). No Escape or Tab handling; hover sets focusedIndex for enabled options only. Option-click handlers never read the component disabled prop: onOptionSelect checks only the option-level disabled state, so options remain clickable when the disabled prop is true; disabled adds the p-disabled root class, tabindex -1 and the keydown early return. Styles (listbox-style.ts, hand-ported, no @ultimate/uix-styles import, tokens through dt('listbox.…')): root classes u-listbox u-component with p-disabled (the only root state; there is no filled, fluid or open state); keys header, pcFilter, listContainer, list, option (focused, selected, disabled) and emptyMessage are all used by the template. The overlay-less list sets position: relative on one rule and no z-index. Theme: Aura registry key listbox. No component-metadata record exists. listbox.spec.ts and listbox.stories.ts are excluded supporting files.

## Public exports

@ultimate/vue#UListbox
@ultimate/vue/listbox#UListbox
@ultimate/vue#createBaseListbox
@ultimate/vue/listbox#createBaseListbox

## Owned source and evidence

packages/vue/src/listbox/BaseListbox.ts
packages/vue/src/listbox/Listbox.vue
packages/vue/src/listbox/index.ts
packages/vue/src/listbox/listbox-style.ts

```text
packages/vue/src/listbox/Listbox.vue: name: "UListbox",
packages/vue/src/listbox/Listbox.vue: emits: ["change", "focus", "blur"],
packages/vue/src/listbox/Listbox.vue: :aria-multiselectable="multiple"
packages/vue/src/listbox/Listbox.vue: this.$emit("change", { originalEvent: event, value: newValue });
packages/vue/src/listbox/Listbox.vue: } while (this.isOptionDisabled(options[next]) && next !== this.focusedIndex);
packages/vue/src/listbox/BaseListbox.ts: extends: createBaseEditableHolder(),
packages/vue/src/listbox/BaseListbox.ts: registerComponentStyle("listbox", listboxStyleModule);
packages/vue/src/listbox/listbox-style.ts: export const listboxStyleModule
packages/vue/src/listbox/index.ts: createBaseListbox
packages/vue/src/index.ts: export * from "./listbox";
packages/vue/package.json: "./listbox": {
```

## Relationships

package.ultimate.vue.listbox → [vue.listbox](vue.listbox.md) (reconciled family alias)
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
