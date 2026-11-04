# React UMultiSelect

ID: react.multi-select

Framework: react; availability: public

## Authored interpretation

Controlled array-valued dropdown with checkbox options, select-all, filter, clear and a summarised trigger label.

## Framework surface

UMultiSelectProps is the exported props interface. UMultiSelect is generic over T and is controlled for its value: value:T[] and onChange:(T[])=>void are required (a non-array value is treated as []); options, optionLabel, optionValue and optionDisabled work as in select. Other props: placeholder, disabled, fluid, filter, filterPlaceholder, showClear, showToggleAll (true), maxSelectedLabels (3), selectedItemsLabel ('{0} items selected'), emptyMessage, className, onSelectionChange (UMultiSelectChangeEvent {originalEvent, value:T[]}), onFocus, onBlur and onClear. There is no inputId, no aria-label prop, no onSelect and no aria-activedescendant or option ids. Toggling an option (click, or Enter, NumpadEnter or Space on the focused option) calls onChange(newArray) then onSelectionChange and does not close the overlay. toggleAll (the header 'Select All' checkbox, aria-label hard-coded in English) calls only onChange and never onSelectionChange; it acts on the visible, non-disabled options only. The clear icon calls onChange([]) then onClear and never onSelectionChange; it is an aria-hidden span reachable only by mouse. The trigger label is the placeholder when empty (the span is empty when there is no placeholder), the comma-joined option labels (String(v) for values without an option) up to maxSelectedLabels, and otherwise selectedItemsLabel with {0} replaced by the count. The trigger is a span role=combobox with aria-haspopup=listbox, aria-expanded and aria-disabled; the list is role=listbox with aria-multiselectable=true; the empty-message li has role=option; each option renders a read-only, tabIndex -1 checkbox. The header div is always rendered, even when showToggleAll and filter are both false. Keyboard on the trigger: ArrowDown and ArrowUp open, or move focus when open; Enter, NumpadEnter and Space open, or toggle the focused option when open; Escape hides when open; Tab hides. There is no Home or End handling, and the filter searchbox has no key handling. moveFocus has a non-terminating loop edge case: its do/while stops early only when next equals the previous focusedIndex, so when focusedIndex is -1 and every visible option is disabled the loop never exits; from -1 ArrowUp lands on length-2. Read from source, not executed. The overlay stays open when disabled becomes true and option click does not check disabled (only optionDisabled blocks toggling); there is no outside-click or blur handler, so the overlay closes only on Escape, Tab or a trigger click. The overlay is an absolutely positioned div, no Portal. multiSelectStyleModule defines classes root (disabled, overlayVisible, fluid), label (placeholder), dropdown, clearIcon, overlay, header, filter, listContainer, list, option (focused, selected, disabled) and emptyMessage, each with a CSS rule; MultiSelectClassesParams is exported from the style file but not from the index barrel. componentName multi-select differs from the Aura registry key multiselect (registry value multiSelect). It is a plain function component, not a forwardRef: no ref, createPortal, useImperativeHandle, document listener, aria-controls or virtualization (no Scroller) is used. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration; those hooks are external foundation records, not duplicated here. The style module is hand-authored CSS registered through the base hook; no scoped style module imports @ultimate/uix-styles. List items use the array index as React key. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/multi-select; the root barrel line and manifest subpath are both present, and the manifest advertises dist entry/type paths, which does not prove a built or published package.

## Public exports

@ultimate/react#UMultiSelect
@ultimate/react/multi-select#UMultiSelect
@ultimate/react#UMultiSelectProps
@ultimate/react/multi-select#UMultiSelectProps
@ultimate/react#UMultiSelectChangeEvent
@ultimate/react/multi-select#UMultiSelectChangeEvent

## Owned source and evidence

packages/react/src/multi-select/index.ts
packages/react/src/multi-select/multi-select.tsx
packages/react/src/multi-select/multi-select-style.ts

```text
packages/react/src/multi-select/index.ts: export { UMultiSelect } from
packages/react/src/multi-select/multi-select.tsx: export function UMultiSelect<T = unknown>({
packages/react/src/multi-select/multi-select.tsx: } while (isOptionDisabled(visibleOptions[next]) && next !== current);
packages/react/src/multi-select/multi-select.tsx: const toggleAll = () => {
packages/react/src/multi-select/multi-select.tsx: aria-label="Select All"
packages/react/src/multi-select/multi-select.tsx: aria-multiselectable="true"
packages/react/src/multi-select/multi-select.tsx: selectedItemsLabel.replace("{0}"
packages/react/src/multi-select/multi-select-style.ts: export const multiSelectStyleModule
packages/themes/src/presets/aura/index.ts:     multiselect: multiSelect,
packages/react/src/index.ts: export * from "./multi-select";
packages/react/package.json: "./multi-select": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.multi-select → [react.multi-select](react.multi-select.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
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
    "behavior": "Bounded React product spec for the option-selection families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/autocomplete/ src/select/ src/multi-select/ src/cascade-select/ src/listbox/",
    "outcome": "not-run",
    "revision": "7845cf0f945bc5526061884f531fa9a01ba4757d",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
