# React USlider

ID: react.slider

Framework: react; availability: public

## Authored interpretation

Controlled single-handle or two-handle range slider with mouse and touch drag, keyboard stepping, an invalid state, pass-through and an optional slide-end callback.

## Framework surface

USlider is a React.forwardRef function component; the ref is the root div element. USliderProps extends React.HTMLAttributes<HTMLDivElement> (without onChange and defaultValue), requires value:number|number[] and onChange, and adds min (default 0), max (default 100), step (no default), range (default false), orientation "horizontal"|"vertical" (default horizontal), disabled, invalid, tabIndex (default 0), className, onSlideEnd, unstyled, pt and ptOptions; USliderChangeEvent is {originalEvent: Event|React.SyntheticEvent, value:number|number[]}. aria-label and aria-labelledby are forwarded to the handles; every other attribute goes to the root. State is fully controlled, and the latest props are read through a ref so drag callbacks never use a stale value. Value is read by type, not by the range flag: an array gives the pair (otherwise [min, max]) and a number gives the single value (otherwise min). snapToStep applies Prime's rule relative to the current value (floor when step is falsy); updateValue rounds with toFixed(10), clamps and, in range mode, copies the array and replaces the active handle. onMouseDown and onTouchStart (skipped when disabled) focus the handle and add document mousemove and mouseup, or touchmove, touchend and touchcancel, listeners that are removed when the drag ends and when the component unmounts; touch follows the identifier that started the drag. The pointer is mirrored when the element direction is rtl, a zero-size track is ignored, and max less than or equal to min gives 0 per cent. onSlideEnd reports the latest value at the end of a drag and after a bar click, which ignores the click that follows a drag and clicks on role=slider elements and picks the nearest handle in range mode. Keyboard (event.key): ArrowDown/ArrowLeft subtract step, ArrowUp/ArrowRight add step (step ?? 1), PageDown/PageUp change by ten steps, Home sets min, End sets max. Handles are span elements with role="slider", tabIndex (removed when disabled), aria-valuemin, aria-valuenow (the actual value), aria-valuemax and aria-orientation, placed with inset-inline-start (horizontal) or bottom (vertical); there is no aria-disabled. Pass-through sections are root, range, handle, startHandler and endHandler through createPassThrough and useMergeProps; unstyled drops the Ultimate classes. sliderStyleModule is exported with the SliderClassesParams interface (orientation, disabled, invalid); classes root, range, handle. componentName slider matches the Aura components registry key slider. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/slider; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The CSS is the shared @ultimate/uix-styles/slider module (ADR-082, ADR-101). The manifest advertises dist entry/type paths; this does not prove a built or published package.

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
packages/react/src/slider/slider.tsx: export const USlider = React.forwardRef
packages/react/src/slider/slider.tsx: export interface USliderChangeEvent
packages/react/src/slider/slider.tsx: onSlideEnd?: (event: USliderChangeEvent) => void;
packages/react/src/slider/slider.tsx: document.addEventListener("mousemove", move
packages/react/src/slider/slider.tsx: tabIndex = 0,
packages/react/src/slider/slider.tsx: role: "slider",
packages/react/src/slider/slider-style.ts: export interface SliderClassesParams
packages/react/src/slider/slider-style.ts: export const sliderStyleModule
packages/themes/src/presets/aura/index.ts:     slider,
packages/react/src/index.ts: export * from "./slider";
packages/react/package.json: "./slider": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
packages/react/src/slider/slider.tsx: unstyled?: boolean;
packages/react/src/slider/slider.tsx: document.addEventListener("touchmove"
packages/react/src/slider/slider-style.ts: @ultimate/uix-styles/slider
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
    "behavior": "Component, declared props and shared style module exist in source with a colocated spec; source inspection is not a passing test."
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
