# React UToggleButton

ID: react.toggle-button

Framework: react; availability: public

## Authored interpretation

Controlled on/off toggle rendered as a native checkbox input with a text label.

## Framework surface

UToggleButton is a plain function component, not a forwardRef, and UToggleButtonProps has no inputRef. Props: checked:boolean (required), onChange, onLabel (default "Yes"), offLabel (default "No"), disabled, readOnly, invalid, name, id, inputId, autoFocus, tabIndex and className. The label is onLabel when checked and offLabel otherwise, but only when both labels are non-empty; otherwise a single space is rendered. State is fully controlled: toggle returns when disabled, readOnly or onChange is absent, else emits UToggleButtonChangeEvent {originalEvent: React.SyntheticEvent, value: !checked, target {name, id, value}}. The input is type=checkbox with onChange=toggle and an onKeyDown handler: Space toggles and calls preventDefault, Enter toggles without preventDefault. The root div carries data-p-highlight={checked} and data-p-disabled={disabled}; the input has aria-invalid={invalid}; there is no role=button, aria-pressed, aria-label or icon prop. toggleButtonStyleModule defines classes root (checked, disabled), input, box (checked) and label; the CSS contains a :has(.u-toggle-button-input:disabled) rule; there is no ClassesParams interface and invalid is not reflected in a class. componentName toggle-button differs from the Aura components registry key togglebutton, so registry existence is not proof of token resolution. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/toggle-button; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UToggleButton
@ultimate/react/toggle-button#UToggleButton
@ultimate/react#UToggleButtonProps
@ultimate/react/toggle-button#UToggleButtonProps
@ultimate/react#UToggleButtonChangeEvent
@ultimate/react/toggle-button#UToggleButtonChangeEvent

## Owned source and evidence

packages/react/src/toggle-button/index.ts
packages/react/src/toggle-button/toggle-button.tsx
packages/react/src/toggle-button/toggle-button-style.ts

```text
packages/react/src/toggle-button/index.ts: export { UToggleButton } from
packages/react/src/toggle-button/toggle-button.tsx: export function UToggleButton({
packages/react/src/toggle-button/toggle-button.tsx: export interface UToggleButtonChangeEvent
packages/react/src/toggle-button/toggle-button.tsx: onLabel = "Yes",
packages/react/src/toggle-button/toggle-button.tsx: } else if (event.key === "Enter") {
packages/react/src/toggle-button/toggle-button.tsx: data-p-highlight={checked}
packages/react/src/toggle-button/toggle-button-style.ts: export const toggleButtonStyleModule
packages/react/src/toggle-button/toggle-button-style.ts: .u-toggle-button:has(.u-toggle-button-input:disabled)
packages/themes/src/presets/aura/index.ts:     togglebutton:
packages/react/src/index.ts: export * from "./toggle-button";
packages/react/package.json: "./toggle-button": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.toggle-button → [react.toggle-button](react.toggle-button.md) (reconciled family alias)
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
