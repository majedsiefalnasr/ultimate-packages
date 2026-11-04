# React USelect

ID: react.select

Framework: react; availability: public

## Authored interpretation

Controlled single-value dropdown with option accessors, optional filter and clear, and an inline overlay panel.

## Framework surface

USelectProps is the exported props interface. USelect is generic over T and is controlled for its value: value:T|null and onChange:(T|null)=>void are required; options is unknown[] and optionLabel, optionValue and optionDisabled accept a string key or a function through the local resolve helper. Other props: placeholder, disabled, fluid, filter, filterPlaceholder, showClear, emptyMessage ('No results found'), className, inputId, aria-label, onSelect (USelectChangeEvent {originalEvent, value}), onFocus, onBlur and onClear. The selected option is found with strict equality (getOptionValue(option) === value); when none matches, the placeholder is shown and the placeholder class is set. Choosing an enabled option calls onChange(optionValue) then onSelect and hides the overlay; the clear icon (shown when showClear, value != null and not disabled) calls onChange(null) then onClear and never calls onSelect, and it is an aria-hidden span reachable only by mouse. Overlay, focusedIndex and filterValue are local state; hide() resets all three. The trigger is a span role=combobox with aria-haspopup=listbox, aria-expanded, aria-disabled, aria-activedescendant, tabIndex and aria-label={ariaLabel ?? label} (undefined when there is neither); inputId is applied as its id. The list has role=listbox and id idRef_list but nothing sets aria-controls; the empty-message li has role=option; the dropdown arrow div is role=button with aria-hidden. Keyboard on the trigger (event.code): ArrowDown and ArrowUp open, or move focus when open; Home and End set focusedIndex to 0 and length-1 only while open and Home ignores disabled options; Enter, NumpadEnter and Space open, or select the focused option when open; Escape hides when open; Tab hides. With filter, a searchbox input handles ArrowDown, ArrowUp, Enter, NumpadEnter and Escape only. moveFocus has a non-terminating loop edge case: its do/while advances until an enabled option is found and stops early only when next equals the previous focusedIndex, so when focusedIndex is -1 and every visible option is disabled the loop never exits. Also, from focusedIndex -1 ArrowUp lands on length-2 rather than the last item. Both were read from source, not executed. The overlay stays open when disabled becomes true (disabled gates only show, the trigger and dropdown click handlers and the trigger keydown), and option click does not check disabled: only optionDisabled blocks selection. There is no outside-click or blur handler, so the overlay closes only on selection, Escape, Tab or a trigger click. The filter input is not disabled when the select is. The overlay is an absolutely positioned div, no Portal. selectStyleModule defines classes root (disabled, overlayVisible, fluid), label (placeholder), dropdown, clearIcon, overlay, header, filter, listContainer, list, option (focused, selected, disabled) and emptyMessage, each with a CSS rule; SelectClassesParams (including selected and focused, which root and label ignore) is exported from the style file but not from the index barrel. componentName select matches the Aura registry key select. It is a plain function component, not a forwardRef: no ref, createPortal, useImperativeHandle, document listener, aria-controls or virtualization (no Scroller) is used. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration; those hooks are external foundation records, not duplicated here. The style module is hand-authored CSS registered through the base hook; no scoped style module imports @ultimate/uix-styles. List items use the array index as React key. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/select; the root barrel line and manifest subpath are both present, and the manifest advertises dist entry/type paths, which does not prove a built or published package.

## Public exports

@ultimate/react#USelect
@ultimate/react/select#USelect
@ultimate/react#USelectProps
@ultimate/react/select#USelectProps
@ultimate/react#USelectChangeEvent
@ultimate/react/select#USelectChangeEvent

## Owned source and evidence

packages/react/src/select/index.ts
packages/react/src/select/select.tsx
packages/react/src/select/select-style.ts

```text
packages/react/src/select/index.ts: export { USelect } from
packages/react/src/select/select.tsx: export function USelect<T = unknown>({
packages/react/src/select/select.tsx: } while (isOptionDisabled(visibleOptions[next]) && next !== current);
packages/react/src/select/select.tsx: aria-label={ariaLabel ?? label}
packages/react/src/select/select.tsx: const isVisibleClearIcon = showClear && value != null && !disabled;
packages/react/src/select/select.tsx: case "Home":
packages/react/src/select/select.tsx: const selectOption = (event: React.SyntheticEvent, option: unknown) => {
packages/react/src/select/select-style.ts: export const selectStyleModule
packages/themes/src/presets/aura/index.ts:     select,
packages/react/src/index.ts: export * from "./select";
packages/react/package.json: "./select": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.select → [react.select](react.select.md) (reconciled family alias)
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
