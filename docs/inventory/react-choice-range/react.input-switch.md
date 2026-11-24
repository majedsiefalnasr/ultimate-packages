# React UInputSwitch

ID: react.input-switch

Framework: react; availability: public

## Authored interpretation

Controlled on/off switch rendered as a native checkbox input with role=switch, a slider and a handle element, with an imperative handle and pass-through.

## Framework surface

UInputSwitch is a React.forwardRef component (componentName toggleswitch) whose ref exposes UInputSwitchHandle {focus(), getElement(), getInput()}. UInputSwitchProps requires checked:unknown and adds trueValue (default true), falseValue (default false), onChange, onFocus, onBlur, disabled, invalid, name, id, inputId, inputRef, tabIndex, autoFocus, unstyled, pt and ptOptions; it has no readOnly prop. aria-* props go on the input and every other prop goes on the root. State is fully controlled: isChecked = checked === trueValue; handleChange returns when disabled or onChange is absent, else emits UInputSwitchChangeEvent {originalEvent, value (falseValue when checked, otherwise trueValue), stopPropagation, preventDefault, target {name, id, value}}. Markup: a root div with data-p-highlight and data-p-disabled around a native input type=checkbox role=switch (id=inputId, name, checked, disabled, tabIndex, autoFocus, aria-invalid, aria-checked) and a slider span containing a handle span, each part merged with its pass-through section (root, input, slider, handle) through createPassThrough and useMergeProps. There is no root role=checkbox wrapper and no tooltip prop. inputSwitchStyleModule imports the shared @ultimate/uix-styles/toggleswitch module and defines classes root (checked, disabled, invalid), input, slider and handle. The component registers under the Aura components registry key toggleswitch. The component is React-native naming and is separate from the Angular and Vue toggle-switch records. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/input-switch. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputSwitch
@ultimate/react/input-switch#UInputSwitch
@ultimate/react#UInputSwitchProps
@ultimate/react/input-switch#UInputSwitchProps
@ultimate/react#UInputSwitchChangeEvent
@ultimate/react/input-switch#UInputSwitchChangeEvent
@ultimate/react#UInputSwitchHandle
@ultimate/react/input-switch#UInputSwitchHandle

## Owned source and evidence

packages/react/src/input-switch/index.ts
packages/react/src/input-switch/input-switch.tsx
packages/react/src/input-switch/input-switch-style.ts

```text
packages/react/src/input-switch/index.ts: export { UInputSwitch } from
packages/react/src/input-switch/input-switch.tsx: export const UInputSwitch = React.forwardRef<UInputSwitchHandle, UInputSwitchProps>(
packages/react/src/input-switch/input-switch.tsx: export interface UInputSwitchChangeEvent
packages/react/src/input-switch/input-switch.tsx: const isChecked = checked === trueValue;
packages/react/src/input-switch/input-switch.tsx: role: "switch",
packages/react/src/input-switch/input-switch.tsx: "aria-checked": isChecked,
packages/react/src/input-switch/input-switch.tsx: internalInputRef.current = node;
packages/react/src/input-switch/input-switch.tsx: React.useImperativeHandle(ref, () => ({
packages/react/src/input-switch/input-switch.tsx: componentName: "toggleswitch",
packages/react/src/input-switch/input-switch-style.ts: @ultimate/uix-styles/toggleswitch
packages/react/src/input-switch/input-switch-style.ts: export const inputSwitchStyleModule
packages/react/src/index.ts: export * from "./input-switch";
packages/react/package.json: "./input-switch": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.input-switch → [react.input-switch](react.input-switch.md) (reconciled family alias)
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
