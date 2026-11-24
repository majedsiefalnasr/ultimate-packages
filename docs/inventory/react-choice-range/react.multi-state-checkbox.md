# React UMultiStateCheckbox

ID: react.multi-state-checkbox

Framework: react; availability: public

## Authored interpretation

Controlled click-to-cycle control that steps through a list of option values and optionally back to null, exposed as a checkbox with a live announcement.

## Framework surface

UMultiStateCheckbox<T, V = T> is a generic forwardRef component whose ref is a UMultiStateCheckboxHandle {focus, getElement}. UMultiStateCheckboxProps extends the div HTML attributes (minus onChange, onFocus, onBlur and children) and requires value:V|null and options:T[]; it adds onChange (optional), onFocus, onBlur, optionValue and optionLabel (property-name strings), optionIcon:(option:T)=>React.ReactNode, empty (default true), disabled, readOnly, invalid, variant (filled or outlined), name, autoFocus, nullLabel (default Not Selected), unstyled, pt and ptOptions. UMultiStateCheckboxChangeEvent<V> is {originalEvent, value:V|null, stopPropagation, preventDefault, target:{name, id, value}}. State is fully controlled: the selected index is found by strict equality, and toggle (skipped when disabled or readOnly, for both click and Space) advances to the next option; after the last option it emits null when empty is true and the first option when empty is false; when no option matches it advances to the first option. The component does not emit an onChange on mount (ADR-099). Markup: a root div carrying the rest props, data-p-disabled and the pt root section, containing a focusable box div with role="checkbox", aria-checked (true when an option is selected, otherwise false), aria-label (the aria-label prop, else the selected option label, else nullLabel), aria-invalid, aria-disabled, aria-readonly, tabIndex (-1 when disabled), onClick and onKeyDown, plus a polite live-region span with the same text; aria-* props go on the box. The box renders optionIcon(selectedOption) inside an icon span when both exist. There is no native input, so there is no inputId. The style classes.root resolves the disabled, invalid and p-variant-filled modifiers. The component registers under multistatecheckbox for pass-through (sections root, box, icon and srOnlyAria). Aura components registry has no key for multi-state-checkbox, so no theme link is recorded. multiStateCheckboxStyleModule is exported. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/multi-state-checkbox; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UMultiStateCheckbox
@ultimate/react/multi-state-checkbox#UMultiStateCheckbox
@ultimate/react#UMultiStateCheckboxProps
@ultimate/react/multi-state-checkbox#UMultiStateCheckboxProps
@ultimate/react#UMultiStateCheckboxChangeEvent
@ultimate/react/multi-state-checkbox#UMultiStateCheckboxChangeEvent
@ultimate/react#UMultiStateCheckboxHandle
@ultimate/react/multi-state-checkbox#UMultiStateCheckboxHandle

## Owned source and evidence

packages/react/src/multi-state-checkbox/index.ts
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts

```text
packages/react/src/multi-state-checkbox/index.ts: export { UMultiStateCheckbox } from
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: React.forwardRef(UMultiStateCheckboxInner)
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: return empty ? null : (options[0] ?? null);
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: role: "checkbox",
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: const selectedLabel = selectedOption ? getOptionLabel(selectedOption, optionLabel) : nullLabel;
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: "u-multi-state-checkbox u-component",
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: icon: "u-multi-state-checkbox-icon",
packages/react/src/multi-state-checkbox/multi-state-checkbox-style.ts: export const multiStateCheckboxStyleModule
packages/react/src/index.ts: export * from "./multi-state-checkbox";
packages/react/package.json: "./multi-state-checkbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: { className: "u-hidden-accessible", "aria-live": "polite" },
packages/react/src/multi-state-checkbox/multi-state-checkbox.tsx: if (disabled || readOnly) return;
packages/react/src/multi-state-checkbox/index.ts: UMultiStateCheckboxHandle
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
