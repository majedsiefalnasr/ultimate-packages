# React UCascadeSelect

ID: react.cascade-select

Framework: react; availability: public

## Authored interpretation

Controlled single-value dropdown over a nested option tree, drilling into groups to select a leaf.

## Framework surface

UCascadeSelectProps is the exported props interface. UCascadeSelect is generic over T and is controlled for its value: value:T|null and onChange:(T|null)=>void are required; options is unknown[], and optionLabel, optionValue and optionDisabled accept a string key or function. optionGroupChildren (default 'items') names the property holding child options. Other props: placeholder, disabled, emptyMessage, className, onSelect (UCascadeSelectChangeEvent {originalEvent, value}), onFocus and onBlur. There is no fluid, filter, showClear, onClear, inputId or aria-label prop. buildTree turns options into ProcessedOption nodes {option, key, parentKey, children} with index-path keys; a node with a non-empty children array is a group and every other node, including one with an empty array, is a leaf. findPathToValue matches only leaf nodes (getOptionValue(leaf) === value), so a value equal to a group never resolves a label; the label falls back to the placeholder. Clicking an enabled leaf calls onChange(optionValue) then onSelect and hides the overlay (clearing activeOptionPath); clicking a group drills in and emits nothing. optionDisabled blocks both selection and drilling. show() pre-expands the ancestors of the selected leaf. The drill state is the activeOptionPath key array. Toggling an open group removes it and its descendant keys; opening a group runs path.filter(key => key !== node.parentKey) before appending node.key, which removes the group's own parent key, so for a nested group the parent drops out of activeOptionPath and its sublist (containing the newly opened group) is no longer rendered, while top-level sibling groups are not collapsed. Read from source, not executed. Accessibility: the trigger is a span role=combobox with aria-haspopup=tree, aria-expanded and aria-disabled; the overlay list is role=tree (sublists too) with li role=treeitem, aria-selected (set on every item, true only for a selected leaf) and aria-expanded (groups only); the empty message is a treeitem rendered only when the top-level options array is empty, since sublists render only for non-empty groups. Keyboard on the trigger: Enter, NumpadEnter, Space and ArrowDown open (only when closed); Escape hides when open. There is no keyboard navigation inside the tree (no ArrowUp, ArrowRight or ArrowLeft handling and no option focus), no Tab handling, and the focused class is never passed, so u-cascade-select-option-content-focused (which has a CSS rule) is never emitted. The overlay stays open when disabled becomes true, option click does not check disabled (only optionDisabled blocks), and there is no outside-click or blur handler, so it closes only on leaf selection, Escape or a trigger click. Sublists are absolutely positioned relative to their parent li (inline style position:relative), no Portal. cascadeSelectStyleModule defines classes root (disabled, overlayVisible), label (placeholder), dropdown, overlay, list, sublist, option, optionContent (focused, selected, disabled), groupIcon and emptyMessage, each with a CSS rule; CascadeSelectClassesParams is exported from the style file but not from the index barrel. componentName cascade-select differs from the Aura registry key cascadeselect (registry value cascadeSelect). It is a plain function component, not a forwardRef: no ref, createPortal, useImperativeHandle, document listener, aria-controls or virtualization (no Scroller) is used. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration; those hooks are external foundation records, not duplicated here. The style module is hand-authored CSS registered through the base hook; no scoped style module imports @ultimate/uix-styles. List items use the array index as React key. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/cascade-select; the root barrel line and manifest subpath are both present, and the manifest advertises dist entry/type paths, which does not prove a built or published package.

## Public exports

@ultimate/react#UCascadeSelect
@ultimate/react/cascade-select#UCascadeSelect
@ultimate/react#UCascadeSelectProps
@ultimate/react/cascade-select#UCascadeSelectProps
@ultimate/react#UCascadeSelectChangeEvent
@ultimate/react/cascade-select#UCascadeSelectChangeEvent

## Owned source and evidence

packages/react/src/cascade-select/index.ts
packages/react/src/cascade-select/cascade-select.tsx
packages/react/src/cascade-select/cascade-select-style.ts

```text
packages/react/src/cascade-select/index.ts: export { UCascadeSelect } from
packages/react/src/cascade-select/cascade-select.tsx: export function UCascadeSelect<T = unknown>({
packages/react/src/cascade-select/cascade-select.tsx: [...path.filter((key) => key !== node.parentKey), node.key]
packages/react/src/cascade-select/cascade-select.tsx: if (node.children.length === 0) {
packages/react/src/cascade-select/cascade-select.tsx: role="tree"
packages/react/src/cascade-select/cascade-select.tsx: case "ArrowDown":
packages/react/src/cascade-select/cascade-select.tsx: const [activeOptionPath, setActiveOptionPath]
packages/react/src/cascade-select/cascade-select-style.ts: export const cascadeSelectStyleModule
packages/themes/src/presets/aura/index.ts:     cascadeselect: cascadeSelect,
packages/react/src/index.ts: export * from "./cascade-select";
packages/react/package.json: "./cascade-select": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.cascade-select → [react.cascade-select](react.cascade-select.md) (reconciled family alias)
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
