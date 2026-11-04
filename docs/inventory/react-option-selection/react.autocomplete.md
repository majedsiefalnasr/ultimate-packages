# React UAutoComplete

ID: react.autocomplete

Framework: react; availability: public

## Authored interpretation

Controlled text input with consumer-supplied suggestions, debounced completeMethod, a suggestion overlay and keyboard navigation.

## Framework surface

UAutoCompleteProps is the exported props interface. UAutoComplete is generic over T (UAutoCompleteProps<T>) and is controlled for its value: value:T|null and onChange:(T|null)=>void are required; the visible text is local inputValue state, initialised from getOptionLabel(value) and re-synchronised by a useEffect on [value, getOptionLabel], so a parent re-render that passes a new optionLabel function identity re-sets the text to the label of value and discards in-progress typing. Other props: suggestions (default []), optionLabel (string key or function), minLength (1), delay (300), placeholder, disabled, fluid, loading, emptyMessage ('No results found'), showEmptyMessage (true), className, inputId, aria-label, completeMethod(UAutoCompleteCompleteEvent {originalEvent, query}), onSelect(UAutoCompleteSelectEvent {originalEvent, value}), onFocus, onBlur and onClear. The consumer owns the search: after delay ms the component calls completeMethod and shows the overlay; it never filters suggestions itself. Typing an empty string calls onChange(null) then onClear and hides the overlay; typing a non-empty string never calls onChange, so value only changes on selection. A query shorter than minLength hides the overlay. The debounce timer is stored in the searchTimeout ref, cleared only at the start of the next input event and never cleared on selection, blur or unmount, so a pending timer still calls completeMethod and sets overlayVisible after an option was chosen or after blur. Keyboard (event.code on the input): disabled preventDefaults every key; ArrowDown and ArrowUp move focusedIndex with wrap-around only while the overlay is visible; ArrowDown with an empty suggestions list sets focusedIndex to 0, and Enter then calls selectOption(event, suggestions[focusedIndex]) with undefined, which emits onChange(undefined) and onSelect with an undefined value; Enter or NumpadEnter does nothing when the overlay is hidden and, with the overlay visible but no focused item, only preventDefaults; Escape hides the overlay. onMouseEnter sets focusedIndex with no mouse-leave reset. Accessibility: the input has role=combobox, aria-autocomplete=list, aria-expanded, aria-activedescendant (ids built from React.useId, which is used only by this component and select among the five) and an optional aria-label; the list gets id idRef_list but no aria-controls references it, there is no aria-haspopup, and the loader span is aria-hidden. The empty message li has role=option. aria-selected and the selected class use strict equality (option === value), so object suggestions match only by identity. onBlur always calls hide() before onBlur, so the overlay closes whenever the input loses focus; whether a mouse option click still fires after that blur was not executed. The overlay is an absolutely positioned div, no Portal. autoCompleteStyleModule defines classes root (filled, disabled, fluid), input, loader, overlay, list, option (focused, selected) and emptyMessage; AutoCompleteClassesParams (filled, disabled, fluid, focused, selected) is exported from the style file but not from the index barrel, and u-autocomplete-disabled and u-autocomplete-filled have no CSS rule, so they carry no styling. componentName autocomplete matches the Aura registry key autocomplete. Here option click does not check disabled: selectOption never reads the disabled prop, so an already-open overlay still selects after disabled becomes true. It is a plain function component, not a forwardRef: no ref, createPortal, useImperativeHandle, document listener, aria-controls or virtualization (no Scroller) is used. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration; those hooks are external foundation records, not duplicated here. The style module is hand-authored CSS registered through the base hook; no scoped style module imports @ultimate/uix-styles. List items use the array index as React key. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/autocomplete; the root barrel line and manifest subpath are both present, and the manifest advertises dist entry/type paths, which does not prove a built or published package.

## Public exports

@ultimate/react#UAutoComplete
@ultimate/react/autocomplete#UAutoComplete
@ultimate/react#UAutoCompleteProps
@ultimate/react/autocomplete#UAutoCompleteProps
@ultimate/react#UAutoCompleteCompleteEvent
@ultimate/react/autocomplete#UAutoCompleteCompleteEvent
@ultimate/react#UAutoCompleteSelectEvent
@ultimate/react/autocomplete#UAutoCompleteSelectEvent

## Owned source and evidence

packages/react/src/autocomplete/index.ts
packages/react/src/autocomplete/autocomplete.tsx
packages/react/src/autocomplete/autocomplete-style.ts

```text
packages/react/src/autocomplete/index.ts: export { UAutoComplete } from
packages/react/src/autocomplete/autocomplete.tsx: export function UAutoComplete<T = unknown>({
packages/react/src/autocomplete/autocomplete.tsx: searchTimeout.current = setTimeout(() => {
packages/react/src/autocomplete/autocomplete.tsx: selectOption(event, suggestions[focusedIndex]);
packages/react/src/autocomplete/autocomplete.tsx: setFocusedIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1));
packages/react/src/autocomplete/autocomplete.tsx: aria-selected={option === value}
packages/react/src/autocomplete/autocomplete.tsx: onBlur?.(event);
packages/react/src/autocomplete/autocomplete-style.ts: export const autoCompleteStyleModule
packages/themes/src/presets/aura/index.ts:     autocomplete,
packages/react/src/index.ts: export * from "./autocomplete";
packages/react/package.json: "./autocomplete": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.autocomplete → [react.autocomplete](react.autocomplete.md) (reconciled family alias)
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
