# React UInputMask

ID: react.input-mask

Framework: react; availability: public

## Authored interpretation

Masked text input with buffer-based slot editing.

## Framework surface

UInputMask, UInputMaskProps and UInputMaskChangeEvent{originalEvent,value,target{name,id,value}}. UInputMaskProps is a closed prop list with no native attribute spread: value:string|null, mask (required), slotChar default _, autoClear default true, unmask default false, onChange(event), onComplete({originalEvent,value}), disabled, readOnly, invalid, variant, fluid, name, id, placeholder, className and inputRef. Consumer onFocus/onBlur/onKeyDown and other native attributes are not accepted. Forwarded HTMLInputElement ref. A buffer/mask algorithm is ported from PrimeReact: definitions 9, a and * plus ? for optional tail; the regex slots are unanchored per-character tests (unanchored). Handlers: onFocus, onBlur, onKeyDown (Backspace/Delete/Escape), onKeyPress (React keypress, deprecated), onInput and onPaste; onChange is also invoked from blur and key handling, not only from typing. A single effect depends on [mask, value] with an eslint-disable comment, so updateValue/initMask are not in the dependency list; the last-required-position ref is not reset when mask changes. Mobile (Android/iOS) branches are excluded. inputMaskStyleModule and the source-only InputMaskClassesParams resolver contract (not a barrel export) reuse --u-inputtext-* variables with fallbacks; the Aura registry has no inputmask module. Exports from @ultimate/react and @ultimate/react/input-mask. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputMask
@ultimate/react/input-mask#UInputMask
@ultimate/react#UInputMaskProps
@ultimate/react/input-mask#UInputMaskProps
@ultimate/react#UInputMaskChangeEvent
@ultimate/react/input-mask#UInputMaskChangeEvent

## Owned source and evidence

packages/react/src/input-mask/index.ts
packages/react/src/input-mask/input-mask.tsx
packages/react/src/input-mask/input-mask-style.ts

```text
packages/react/src/input-mask/input-mask.tsx: export interface UInputMaskProps
packages/react/src/input-mask/input-mask-style.ts: export const inputMaskStyleModule
packages/react/src/index.ts: export * from "./input-mask";
packages/react/package.json: "./input-mask": {
```

## Relationships

package.ultimate.react.input-mask → [react.input-mask](react.input-mask.md) (reconciled family alias)
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
