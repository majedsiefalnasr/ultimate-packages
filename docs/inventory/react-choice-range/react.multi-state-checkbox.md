# React UMultiStateCheckbox

ID: react.multi-state-checkbox

Framework: react; availability: public

## Authored interpretation

Controlled click-to-cycle control that steps through a list of option values and optionally back to null.

## Framework surface

UMultiStateCheckbox<T, V = T> is a generic plain function component, not a forwardRef. UMultiStateCheckboxProps requires value:V|null, options:T[] and onChange, and adds optionValue and optionLabel (property-name strings), optionIcon:(option:T)=>React.ReactNode, empty (default true), disabled, readOnly, tabIndex (default 0), id, className and aria-label; UMultiStateCheckboxChangeEvent<V> is {originalEvent, value:V|null}. Module-private getOptionValue and getOptionLabel are not exported. State is fully controlled: the selected index is found by strict equality, and toggle (skipped when disabled or readOnly) advances to the next option; after the last option it emits null when empty is true and the first option when empty is false; when no option matches it advances to the first option. Space (event.code or event.key) toggles with preventDefault; click toggles. The component does not emit an onChange on mount. Markup: a root div with role="button", tabIndex (-1 when disabled), onClick, onKeyDown and aria-label (the aria-label prop, else the selected option label, else "none") containing a box div that renders optionIcon(selectedOption) when both exist; there is no native input and no aria-checked or aria-disabled. The style classes.root is a plain string, so the {disabled} parameter passed to cx is ignored and no disabled class is emitted even though the CSS defines .u-multi-state-checkbox-disabled; the classes object also has an icon key that the component never uses. multiStateCheckboxStyleModule is exported; there is no ClassesParams interface. Aura components registry has no key for multi-state-checkbox (componentName multi-state-checkbox), so no theme link is recorded. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/multi-state-checkbox; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UMultiStateCheckbox
@ultimate/react/multi-state-checkbox#UMultiStateCheckbox
@ultimate/react#UMultiStateCheckboxProps
@ultimate/react/multi-state-checkbox#UMultiStateCheckboxProps
@ultimate/react#UMultiStateCheckboxChangeEvent
@ultimate/react/multi-state-checkbox#UMultiStateCheckboxChangeEvent

## Owned source and evidence

packages/react/src/multi-state-checkbox/index.ts
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts

```text
packages/react/src/multi-state-checkbox/index.ts: export { UMultiStateCheckbox } from
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: export function UMultiStateCheckbox<T = unknown, V = T>({
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: return empty ? null : (options[0] ?? null);
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: role="button"
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: ariaLabel ?? (selectedOption ? getOptionLabel(selectedOption, optionLabel) : "none")
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: root: "u-multi-state-checkbox u-component",
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: icon: "u-multi-state-checkbox-icon",
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: export const multiStateCheckboxStyleModule
packages/react/src/index.ts: export * from "./multi-state-checkbox";
packages/react/package.json: "./multi-state-checkbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.multi-state-checkbox → [react.multi-state-checkbox](react.multi-state-checkbox.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/input-switch/ src/select-button/ src/multi-state-checkbox/ src/tri-state-checkbox/ src/rating/ src/slider/ src/knob/",
    "outcome": "not-run",
    "revision": "8d8d52094058993d3ca29823d1c2cd922805570e",
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
