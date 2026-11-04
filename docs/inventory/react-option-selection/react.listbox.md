# React UListbox

ID: react.listbox

Framework: react; availability: public

## Authored interpretation

Controlled always-visible option list with single or multiple selection and an optional filter.

## Framework surface

UListboxProps is the exported props interface. UListbox is generic over T and is controlled for its value: value:T|T[]|null and onChange:(T|T[]|null)=>void are required; options, optionLabel, optionValue and optionDisabled work as in select. Other props: multiple (false), filter, filterPlaceholder, disabled, emptyMessage, className, aria-label, onSelectionChange (UListboxChangeEvent {originalEvent, value:T|T[]}), onFocus and onBlur, which are attached to the ul and not the root. There is no inputId, fluid or onClear. It is not overlay-based: the filter header (searchbox) and the list render inline. Selecting an enabled option calls onChange then onSelectionChange. In single mode (multiple false) it emits the option value, so clicking the selected option again re-emits the same value and onChange never emits null; in multiple mode it emits a new array (a non-array value counts as []), which can be empty when the last item is deselected. isSelected uses strict equality in single mode and Array.includes in multiple mode; multiple renders a read-only, tabIndex -1 checkbox per option. Accessibility: the ul is role=listbox with aria-multiselectable={multiple} (rendered as false in single mode), optional aria-label and tabIndex 0 (-1 when disabled); options are role=option with aria-selected and aria-disabled; the empty message li has role=option. There are no option ids and no aria-activedescendant, so the focused option is conveyed only by the focused class. Keyboard on the ul (event.code): ArrowDown and ArrowUp move focus, Home and End set 0 and length-1 (End on an empty list gives -1 and Home ignores disabled options), Enter, NumpadEnter and Space select the focused option. disabled blocks the keyboard handler and sets tabIndex -1, but the filter input stays enabled and option click does not check disabled, so clicks still emit while disabled; only optionDisabled blocks selection. moveFocus has a non-terminating loop edge case: its do/while stops early only when next equals the previous focusedIndex, so when focusedIndex is -1 and every visible option is disabled the loop never exits; from -1 ArrowUp lands on length-2. Read from source, not executed. listboxStyleModule defines classes root (disabled), header, filter, listContainer, list, option (focused, selected, disabled) and emptyMessage, each with a CSS rule; ListboxClassesParams is exported from the style file but not from the index barrel. componentName listbox matches the Aura registry key listbox. It is a plain function component, not a forwardRef: no ref, createPortal, useImperativeHandle, document listener, aria-controls or virtualization (no Scroller) is used. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration; those hooks are external foundation records, not duplicated here. The style module is hand-authored CSS registered through the base hook; no scoped style module imports @ultimate/uix-styles. List items use the array index as React key. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/listbox; the root barrel line and manifest subpath are both present, and the manifest advertises dist entry/type paths, which does not prove a built or published package.

## Public exports

@ultimate/react#UListbox
@ultimate/react/listbox#UListbox
@ultimate/react#UListboxProps
@ultimate/react/listbox#UListboxProps
@ultimate/react#UListboxChangeEvent
@ultimate/react/listbox#UListboxChangeEvent

## Owned source and evidence

packages/react/src/listbox/index.ts
packages/react/src/listbox/listbox.tsx
packages/react/src/listbox/listbox-style.ts

```text
packages/react/src/listbox/index.ts: export { UListbox } from
packages/react/src/listbox/listbox.tsx: export function UListbox<T = unknown>({
packages/react/src/listbox/listbox.tsx: } while (isOptionDisabled(visibleOptions[next]) && next !== current);
packages/react/src/listbox/listbox.tsx: aria-multiselectable={multiple}
packages/react/src/listbox/listbox.tsx: newValue = optionVal;
packages/react/src/listbox/listbox.tsx: case "End":
packages/react/src/listbox/listbox.tsx: const selectOption = (event: React.SyntheticEvent, option: unknown) => {
packages/react/src/listbox/listbox-style.ts: export const listboxStyleModule
packages/themes/src/presets/aura/index.ts:     listbox,
packages/react/src/index.ts: export * from "./listbox";
packages/react/package.json: "./listbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.listbox → [react.listbox](react.listbox.md) (reconciled family alias)
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
