# React UInputMask

ID: react.input-mask

Framework: react; availability: public

## Authored interpretation

Masked text input with buffer-based slot editing.

## Framework surface

UInputMask, UInputMaskProps and UInputMaskChangeEvent{originalEvent,value,target{name,id,value}}. UInputMaskProps extends the native input attributes (without value, defaultValue, onChange and size) and adds value:string|null, mask (required), slotChar default _, autoClear default true, characterPattern, keepBuffer, unmask default false, onChange(event), onComplete({originalEvent,value}), invalid, variant, size ('small'|'large'), fluid, inputRef, unstyled, pt and ptOptions. Native attributes spread onto the input, and the caller's onFocus, onBlur, onKeyDown, onKeyPress, onInput, onPaste, onCompositionStart and onCompositionEnd are chained with the component's own handlers. Forwarded HTMLInputElement ref. A buffer/mask algorithm is ported from PrimeReact: definitions 9, a and * plus ? for the optional tail. Behaviors: Backspace and Delete (Delete removes the character at a collapsed caret), Escape (restores the value held at focus), Enter (finalizes), a composition guard, a deferred paste reformat, an Android Chrome branch, a caret timeout that is cleaned up on unmount, and an echo check that skips re-applying a value the input already holds, so a controlled parent cannot wipe an incomplete value while the user types. onChange is also invoked from blur and key handling. The component calls createPassThrough with the name inputmask and merges ptm('root') onto the input. inputMaskStyleModule registers the shared @ultimate/uix-styles/inputtext CSS under the inputtext key (ADR-095), because react-core has no additional-keys support; root classes are u-inputmask u-inputtext u-component with p-filled, p-invalid, p-variant-filled, u-inputtext-fluid, u-inputtext-sm and u-inputtext-lg. The source-only InputMaskClassesParams resolver contract is not a barrel export. The Aura registry has no inputmask module. Mobile and IME paths are tested with simulated events only. Exports from @ultimate/react and @ultimate/react/input-mask. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The manifest advertises dist entry/type paths; this does not prove a built or published package.

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
packages/react/src/input-mask/input-mask.tsx: createPassThrough("inputmask"
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
