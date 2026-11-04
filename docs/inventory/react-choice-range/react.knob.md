# React UKnob

ID: react.knob

Framework: react; availability: public

## Authored interpretation

Controlled circular SVG dial adjusted by click, drag and keyboard.

## Framework surface

UKnob is a plain function component, not a forwardRef; index.ts exports only UKnob and UKnobProps (no change-event type). UKnobProps requires value:number and onChange(value: number) which receives a bare number, not an event object, and adds size (100), min (0), max (100), step (1), strokeWidth (14), showValue (true), readOnly, disabled, valueTemplate ("{value}"), valueColor ("#3B82F6"), rangeColor ("#D1D5DB"), textColor ("#374151") and className. There is no name, id or aria-label prop and no ref prop; an internal svgRef is used only for pointer geometry. State is fully controlled. updateModelValue clamps to [min, max] before onChange. Click maps event.nativeEvent.offsetX and offsetY to an angle; mousedown adds document mousemove and mouseup listeners (removed on mouseup, no unmount cleanup) and uses svg getBoundingClientRect. Keyboard (event.code): ArrowRight/ArrowUp add step, ArrowLeft/ArrowDown subtract step, Home sets min, End sets max, PageUp and PageDown change by a fixed 10 regardless of step. The enabled flag (!disabled && !readOnly) gates the handlers. Markup: a root div (cx root only, so disabled and readOnly are not reflected in a class) around an svg with role="slider", width and height equal to size, viewBox 0 0 100 100, tabIndex 0 when enabled else -1, aria-valuemin, aria-valuemax and aria-valuenow; there is no aria-label, aria-labelledby, aria-disabled or aria-readonly. Two paths draw the range and value arcs, and an optional text element shows valueTemplate with {value} replaced. The source header comment states touch handling is excluded; no touch handling exists. knobStyleModule is exported; classes root (plain string), range, value, text; there is no ClassesParams interface. componentName knob matches the Aura components registry key knob. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/knob; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UKnob
@ultimate/react/knob#UKnob
@ultimate/react#UKnobProps
@ultimate/react/knob#UKnobProps

## Owned source and evidence

packages/react/src/knob/index.ts
packages/react/src/knob/knob.tsx
packages/react/src/knob/knob-style.ts

```text
packages/react/src/knob/index.ts: export { UKnob } from
packages/react/src/knob/knob.tsx: export function UKnob({
packages/react/src/knob/knob.tsx: export interface UKnobProps
packages/react/src/knob/knob.tsx: onChange: (value: number) => void;
packages/react/src/knob/knob.tsx: event.nativeEvent.offsetX
packages/react/src/knob/knob.tsx: case "PageUp":
packages/react/src/knob/knob.tsx: valueTemplate.replace("{value}", value.toString())
packages/react/src/knob/knob.tsx: role="slider"
packages/react/src/knob/knob-style.ts: export const knobStyleModule
packages/themes/src/presets/aura/index.ts:     knob,
packages/react/src/index.ts: export * from "./knob";
packages/react/package.json: "./knob": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.knob → [react.knob](react.knob.md) (reconciled family alias)
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
