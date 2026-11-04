# React USelectButton

ID: react.select-button

Framework: react; availability: public

## Authored interpretation

Controlled single or multiple option group built from UToggleButton items with roving keyboard focus.

## Framework surface

USelectButton<T> is a generic plain function component, not a forwardRef. USelectButtonProps<T> requires value:T, onChange and options:unknown[] and adds optionLabel, optionValue and optionDisabled (each a property-name string or accessor function), multiple (default false), allowEmpty (default true), disabled, className and aria-labelledby; USelectButtonChangeEvent<T> is {originalEvent, value:T}. There are no name, id, invalid, readOnly or fluid props and no ref prop. The module-private resolve helper reads an accessor, a property of an object option, or a fallback. Single mode emits null when the selected option is clicked and allowEmpty is true, and ignores the click when allowEmpty is false; multiple mode filters or appends option values and ignores removing the last value when allowEmpty is false. Selection uses strict equality. Each option renders UToggleButton imported from ../toggle-button/toggle-button with onLabel = offLabel = the option label, checked from isSelected, and disabled from disabled or optionDisabled; the key is label_index. Keyboard: the root div handles ArrowRight/ArrowDown (+1) and ArrowLeft/ArrowUp (-1) by event.code, skips disabled options, wraps, and moves focus to the matching input; it does nothing when the input count differs from options.length. A roving tab stop gives tabIndex 0 to one enabled option. The root div has role="group" and aria-labelledby and its class comes from cx("root", { fluid: false }); invalid is never passed, so the u-select-button-invalid and u-select-button-fluid classes defined by SelectButtonClassesParams and the CSS are never emitted by the component. selectButtonStyleModule is exported alongside the SelectButtonClassesParams interface. componentName select-button differs from the Aura components registry key selectbutton, so registry existence is not proof of token resolution. The style file comment mentions @ultimate/uix-styles but nothing is imported. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/select-button; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#USelectButton
@ultimate/react/select-button#USelectButton
@ultimate/react#USelectButtonProps
@ultimate/react/select-button#USelectButtonProps
@ultimate/react#USelectButtonChangeEvent
@ultimate/react/select-button#USelectButtonChangeEvent

## Owned source and evidence

packages/react/src/select-button/index.ts
packages/react/src/select-button/select-button.tsx
packages/react/src/select-button/select-button-style.ts

```text
packages/react/src/select-button/index.ts: export { USelectButton } from
packages/react/src/select-button/select-button.tsx: export function USelectButton<T = unknown>({
packages/react/src/select-button/select-button.tsx: import { UToggleButton } from "../toggle-button/toggle-button";
packages/react/src/select-button/select-button.tsx: cx("root", { fluid: false })
packages/react/src/select-button/select-button.tsx: const tabStopIndex =
packages/react/src/select-button/select-button.tsx: optionDisabled,
packages/react/src/select-button/select-button-style.ts: export interface SelectButtonClassesParams
packages/react/src/select-button/select-button-style.ts: export const selectButtonStyleModule
packages/themes/src/presets/aura/index.ts:     selectbutton:
packages/react/src/index.ts: export * from "./select-button";
packages/react/package.json: "./select-button": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.select-button → [react.select-button](react.select-button.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react.toggle-button → [react.toggle-button](react.toggle-button.md) (reconciled family alias)

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
