# React USlider

ID: react.slider

Framework: react; availability: public

## Authored interpretation

Controlled single-handle or two-handle range slider with mouse and keyboard interaction and an optional slide-end callback.

## Framework surface

USlider is a plain function component, not a forwardRef. USliderProps requires value:number|number[] and onChange and adds min (default 0), max (default 100), step (no default), range (default false), orientation "horizontal"|"vertical" (default horizontal), disabled, className and onSlideEnd; USliderChangeEvent is {originalEvent: Event|React.SyntheticEvent, value:number|number[]}. There is no name, id or aria-label prop and no ref prop. State is fully controlled; internal refs hold the active handle index, the bar rect and a dragging flag. Value is read by type, not by the range flag: an array gives the pair (otherwise [min, max]) and a number gives the single value (otherwise min). applyStep floors the raw value when step is falsy, else rounds to the step with decimal correction; updateValue clamps and, in range mode, copies the array and replaces the active handle. onMouseDown (skipped when disabled) focuses the target, calls preventDefault and adds document mousemove and mouseup listeners that are removed only on mouseup, with no unmount cleanup. Those listeners are closures from the render in which mousedown ran, so they capture that render's value (stale after later renders) and onSlideEnd after a drag reports that captured value. onSlideEnd is also emitted after a bar click, which ignores clicks on role=slider elements and picks the nearest handle in range mode. Keyboard (event.key): ArrowDown/ArrowLeft subtract step, ArrowUp/ArrowRight add step (step ?? 1), PageDown/PageUp change by ten steps, Home sets min, End sets max. Handles are span elements with role="slider", tabIndex={0}, aria-valuemin, aria-valuenow, aria-valuemax and aria-orientation; there is no aria-label or aria-labelledby and no aria-disabled, and disabled does not change tabIndex. No touch event handlers exist, and when max equals min and the value equals min, toPercent evaluates 0 / 0 (NaN). sliderStyleModule is exported with the SliderClassesParams interface (orientation, disabled); classes root, range, handle. componentName slider matches the Aura components registry key slider. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/slider; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#USlider
@ultimate/react/slider#USlider
@ultimate/react#USliderProps
@ultimate/react/slider#USliderProps
@ultimate/react#USliderChangeEvent
@ultimate/react/slider#USliderChangeEvent

## Owned source and evidence

packages/react/src/slider/index.ts
packages/react/src/slider/slider.tsx
packages/react/src/slider/slider-style.ts

```text
packages/react/src/slider/index.ts: export { USlider } from
packages/react/src/slider/slider.tsx: export function USlider({
packages/react/src/slider/slider.tsx: export interface USliderChangeEvent
packages/react/src/slider/slider.tsx: onSlideEnd?: (event: USliderChangeEvent) => void;
packages/react/src/slider/slider.tsx: document.addEventListener("mousemove", move);
packages/react/src/slider/slider.tsx: tabIndex={0}
packages/react/src/slider/slider.tsx: role="slider"
packages/react/src/slider/slider-style.ts: export interface SliderClassesParams
packages/react/src/slider/slider-style.ts: export const sliderStyleModule
packages/themes/src/presets/aura/index.ts:     slider,
packages/react/src/index.ts: export * from "./slider";
packages/react/package.json: "./slider": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.slider → [react.slider](react.slider.md) (reconciled family alias)
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
