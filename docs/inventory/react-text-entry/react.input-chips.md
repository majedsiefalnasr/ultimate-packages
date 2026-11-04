# React UInputChips

ID: react.input-chips

Framework: react; availability: public

## Authored interpretation

Chip-based multi-value entry with add/remove handling.

## Framework surface

UInputChips, UInputChipsProps, UInputChipsAddEvent and UInputChipsRemoveEvent{originalEvent,value}. forwardRef<HTMLDivElement>. Props: value:string[] and onChange(value:string[]) required, max, separator, allowDuplicate default true, addOnBlur default false, disabled, readOnly, invalid, placeholder, inputId, name, aria-label, aria-labelledby, onAdd, onRemove, onFocus, onBlur, className. onAdd is emitted only from the add routine (Enter, separator or blur with addOnBlur); the paste path calls onChange directly, so onAdd is not emitted on paste and pasted parts are not trimmed. With allowDuplicate=false a duplicate only clears the input. The max check is Boolean(max && value.length >= max), so max=0 means unlimited; separator splits typed text. The chips list is ul role=listbox with li role=option aria-selected=true; remove buttons use UTimesIcon from @ultimate/react-core. invalid sets aria-invalid on the input and a root class. The input is a native uncontrolled element driven by onInput. inputChipsStyleModule; Aura key inputchips. Exports from @ultimate/react and @ultimate/react/input-chips. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputChips
@ultimate/react/input-chips#UInputChips
@ultimate/react#UInputChipsProps
@ultimate/react/input-chips#UInputChipsProps
@ultimate/react#UInputChipsAddEvent
@ultimate/react/input-chips#UInputChipsAddEvent
@ultimate/react#UInputChipsRemoveEvent
@ultimate/react/input-chips#UInputChipsRemoveEvent

## Owned source and evidence

packages/react/src/input-chips/index.ts
packages/react/src/input-chips/input-chips.tsx
packages/react/src/input-chips/input-chips-style.ts

```text
packages/react/src/input-chips/input-chips.tsx: export interface UInputChipsProps
packages/react/src/input-chips/input-chips-style.ts: export const inputChipsStyleModule
packages/react/src/index.ts: export * from "./input-chips";
packages/react/package.json: "./input-chips": {
```

## Relationships

package.ultimate.react.input-chips → [react.input-chips](react.input-chips.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
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
    "behavior": "Bounded React product spec for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-text/ src/input-textarea/ src/input-mask/ src/input-otp/ src/password/ src/float-label/ src/icon-field/ src/input-chips/ src/mention/",
    "outcome": "not-run",
    "revision": "c49aa4e6906a9d72a1893b3fc006fce55489d0b7",
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
