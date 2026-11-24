# React UTriStateCheckbox

ID: react.tri-state-checkbox

Framework: react; availability: public

## Authored interpretation

Controlled true/false/null checkbox that cycles states on click, label activation, Space, Enter or NumpadEnter.

## Framework surface

UTriStateCheckbox is a forwardRef component whose ref is a UTriStateCheckboxHandle {focus, getElement}. UTriStateCheckboxProps extends the div HTML attributes (minus onChange, onFocus, onBlur and children) and requires value:boolean|null; it adds onChange, onFocus, onBlur, disabled, readOnly, invalid, variant (filled or outlined), name, inputId, autoFocus, checkIcon, uncheckIcon, trueLabel, falseLabel, nullLabel, unstyled, pt and ptOptions; tabIndex defaults to 0. State is fully controlled and has no internal state: any value other than true or false is treated as null, and cycle (skipped when disabled or readOnly) emits UTriStateCheckboxChangeEvent {originalEvent, value, stopPropagation, preventDefault, target:{name, id, value}} following null -> true -> false -> null. Box click, label activation of the hidden input, and Enter, NumpadEnter and Space (read from event.code, with preventDefault) all cycle. Markup inside the root div (cx root with disabled, invalid and variantFilled, plus data-p-disabled while disabled): a hidden native input type=checkbox (id=inputId, name, checked={value === true}, readOnly, disabled, aria-hidden, tabIndex=-1, onChange cycles, onFocus moves focus to the box, pointer-events none in CSS); a span with className u-hidden-accessible and aria-live="polite" whose text is trueLabel, falseLabel or nullLabel (defaults True, False and Not Selected); and a box div with role="checkbox", aria-checked "true"/"false"/"mixed", aria-invalid, tabIndex, the click, key, focus and blur handlers and every forwarded aria-* prop, showing checkIcon or UCheckIcon for true and uncheckIcon or UTimesIcon for false. Remaining props go on the root. The pass-through name is tristatecheckbox with sections root, box, input, srOnlyAria, checkIcon and uncheckIcon. triStateCheckboxStyleModule defines classes root (disabled, invalid, variantFilled), box, input and icon; the icon key is now used on the default icons. tooltip is not a prop (composition, ADR-096). Aura components registry has no key for tristatecheckbox, so no theme link is recorded. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/tri-state-checkbox; the root barrel line and manifest subpath are both present. useComponentBase, createPassThrough and useMergeProps from @ultimate/react-core are external foundation records, not duplicated here. Local style CSS is hand-authored and registered, and reads the checkbox.filled.background token for the filled variant; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UTriStateCheckbox
@ultimate/react/tri-state-checkbox#UTriStateCheckbox
@ultimate/react#UTriStateCheckboxProps
@ultimate/react/tri-state-checkbox#UTriStateCheckboxProps
@ultimate/react#UTriStateCheckboxChangeEvent
@ultimate/react/tri-state-checkbox#UTriStateCheckboxChangeEvent
@ultimate/react#UTriStateCheckboxHandle
@ultimate/react/tri-state-checkbox#UTriStateCheckboxHandle

## Owned source and evidence

packages/react/src/tri-state-checkbox/index.ts
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts

```text
packages/react/src/tri-state-checkbox/index.ts: export { UTriStateCheckbox } from
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: React.forwardRef<UTriStateCheckboxHandle, UTriStateCheckboxProps>(
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: const next: boolean | null = value === null ? true : value === true ? false : null;
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: { className: "u-hidden-accessible", "aria-live": "polite" }
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: role: "checkbox"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: "mixed"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: <UTimesIcon className=
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts: export const triStateCheckboxStyleModule
packages/react/src/index.ts: export * from "./tri-state-checkbox";
packages/react/package.json: "./tri-state-checkbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: onChange: cycle,
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts: pointer-events: none;
packages/react/src/tri-state-checkbox/index.ts: UTriStateCheckboxHandle
```

## Relationships

package.ultimate.react.tri-state-checkbox → [react.tri-state-checkbox](react.tri-state-checkbox.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)

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
