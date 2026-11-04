# React URadioButton

ID: react.radio-button

Framework: react; availability: public

## Authored interpretation

Controlled native radio input that reports the negation of its checked prop through a change event.

## Framework surface

URadioButton is a plain function component, not a forwardRef. URadioButtonProps requires checked:boolean and adds value:unknown, onChange, disabled, readOnly, invalid, name, id, inputId, inputRef:React.Ref<HTMLInputElement>, autoFocus and className. Refs: inputRef (function or object) is merged by setInputRef, which also writes an internalInputRef that is never read. State is fully controlled and never flips internally: handleChange returns when disabled, readOnly or onChange is absent; otherwise nextChecked = !checked and the component emits URadioButtonChangeEvent {originalEvent, value, checked: !checked, target {type:"radio", name, id, value, checked}}. The input is type=radio with id=inputId, name, checked, disabled, readOnly, autoFocus and aria-invalid={invalid}; there is no value attribute on the DOM input (value only travels in the event), no group management and no label, aria-label or aria-labelledby prop. Markup is a root div (cx root with checked, plus className) around the input and a box div (cx box with checked) holding an icon div. radioButtonStyleModule defines classes root (checked), box (checked), input and icon; there is no ClassesParams interface and no invalid or disabled class. componentName radio-button differs from the Aura components registry key radiobutton, so registry existence is not proof of token resolution. The style file comments mention @ultimate/uix-styles but nothing is imported. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/radio-button; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#URadioButton
@ultimate/react/radio-button#URadioButton
@ultimate/react#URadioButtonProps
@ultimate/react/radio-button#URadioButtonProps
@ultimate/react#URadioButtonChangeEvent
@ultimate/react/radio-button#URadioButtonChangeEvent

## Owned source and evidence

packages/react/src/radio-button/index.ts
packages/react/src/radio-button/radio-button.tsx
packages/react/src/radio-button/radio-button-style.ts

```text
packages/react/src/radio-button/index.ts: export { URadioButton } from
packages/react/src/radio-button/radio-button.tsx: export function URadioButton({
packages/react/src/radio-button/radio-button.tsx: export interface URadioButtonChangeEvent
packages/react/src/radio-button/radio-button.tsx: const nextChecked = !checked;
packages/react/src/radio-button/radio-button.tsx: internalInputRef.current = node;
packages/react/src/radio-button/radio-button-style.ts: export const radioButtonStyleModule
packages/themes/src/presets/aura/index.ts:     radiobutton:
packages/react/src/index.ts: export * from "./radio-button";
packages/react/package.json: "./radio-button": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.radio-button → [react.radio-button](react.radio-button.md) (reconciled family alias)
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
