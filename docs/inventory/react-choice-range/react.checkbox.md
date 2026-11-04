# React UCheckbox

ID: react.checkbox

Framework: react; availability: public

## Authored interpretation

Controlled native checkbox with true/false value mapping, an optional tooltip and a change event object.

## Framework surface

UCheckbox is a plain function component, not a forwardRef. UCheckboxProps requires checked:unknown and adds trueValue (default true), falseValue (default false), onChange, disabled, readOnly, invalid, name, value:unknown, id, inputId, inputRef:React.Ref<HTMLInputElement>, tooltip, tooltipOptions:Record<string, unknown>, autoFocus and className. Refs: inputRef (function or object) is merged by setInputRef, which also writes an internalInputRef that is never read; elementRef targets the root div for the tooltip. State is fully controlled: isChecked = checked === trueValue, and handleChange returns without calling onChange when disabled, readOnly or onChange is absent; otherwise it emits UCheckboxChangeEvent {originalEvent, value, checked (the other of trueValue/falseValue), target {type:"checkbox", name, id, value, checked}}. The value prop is only passed into the event, never to the DOM input. The component renders a fragment: a root div (id, cx root with checked, plus className) containing a native input type=checkbox (id=inputId, name, checked, disabled, readOnly, autoFocus, aria-invalid={invalid}) and a box div that holds UCheckIcon from @ultimate/react-core only when checked; there is no label, aria-label or aria-labelledby prop. When tooltip is set, UTooltip from ../tooltip is rendered with target=elementRef and tooltipOptions spread after content. checkboxStyleModule defines classes root (checked), box (checked), input and icon; there is no ClassesParams interface, and no disabled or invalid class. componentName checkbox matches the Aura components registry key checkbox. CHECKBOX_METADATA in packages/component-metadata/src/records/checkbox.ts lists packages/react/src/checkbox/checkbox.tsx as the React source; checkbox.api.mdx is a generated documentation fixture and is excluded. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/checkbox; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UCheckbox
@ultimate/react/checkbox#UCheckbox
@ultimate/react#UCheckboxProps
@ultimate/react/checkbox#UCheckboxProps
@ultimate/react#UCheckboxChangeEvent
@ultimate/react/checkbox#UCheckboxChangeEvent

## Owned source and evidence

packages/react/src/checkbox/index.ts
packages/react/src/checkbox/checkbox.tsx
packages/react/src/checkbox/checkbox-style.ts

```text
packages/react/src/checkbox/index.ts: export { UCheckbox } from
packages/react/src/checkbox/checkbox.tsx: export function UCheckbox({
packages/react/src/checkbox/checkbox.tsx: export interface UCheckboxChangeEvent
packages/react/src/checkbox/checkbox.tsx: const isChecked = checked === trueValue;
packages/react/src/checkbox/checkbox.tsx: {tooltip && <UTooltip target={elementRef}
packages/react/src/checkbox/checkbox.tsx: internalInputRef.current = node;
packages/react/src/checkbox/checkbox-style.ts: export const checkboxStyleModule
packages/react/src/checkbox/checkbox.tsx: aria-invalid={invalid}
packages/component-metadata/src/records/checkbox.ts: export const CHECKBOX_METADATA
packages/themes/src/presets/aura/index.ts:     checkbox,
packages/react/src/index.ts: export * from "./checkbox";
packages/react/package.json: "./checkbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.checkbox → [react.checkbox](react.checkbox.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)
package.ultimate.react.tooltip (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
