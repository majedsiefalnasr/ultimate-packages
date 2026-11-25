# React UKnob

ID: react.knob

Framework: react; availability: public

## Authored interpretation

Controlled circular SVG dial adjusted by click, mouse and touch drag and keyboard, with an invalid state, accessible names and pass-through.

## Framework surface

UKnob is a forwardRef component whose ref is the root div element (no handle object); index.ts exports UKnob, UKnobProps and UKnobValueTemplate (no change-event type). UKnobProps extends the div HTML attributes without onChange and defaultValue, requires value:number and onChange(value: number), which receives a bare number, not an event object, and adds size (100), min (0), max (100), step (1), strokeWidth (14), showValue (true), readOnly, disabled, invalid, tabIndex (0), valueTemplate (UKnobValueTemplate: a string in which every {value} is replaced, or a function of the value; default "{value}"), valueColor, rangeColor and textColor (defaulting to $dt('knob.value.background').variable, $dt('knob.range.background').variable and $dt('knob.text.color').variable from @ultimate/uix-styled, no literal fallback), className, unstyled, pt and ptOptions. aria-label and aria-labelledby go to the svg; every other prop, including id and style, is merged onto the root div with the pt root section. There is no name prop. State is fully controlled; the latest props are read through a propsRef so a drag never works from a stale value. updateModelValue clamps to [min, max] before onChange. Click maps event.nativeEvent.offsetX and offsetY to an angle. mousedown and touchstart begin a drag that adds document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel), reads the pointer against the svg getBoundingClientRect, follows only the touch that started it, ignores moves while the knob is disabled or read-only, and removes the listeners when the drag ends or the component unmounts. Keyboard (event.code): ArrowRight/ArrowUp add step, ArrowLeft/ArrowDown subtract step, Home sets min, End sets max, PageUp and PageDown change by a fixed 10 regardless of step. The enabled flag (!disabled && !readOnly) gates every handler, the keyboard included. Markup: a root div (cx root with p-disabled and p-invalid) around an svg (pt svg) with role="slider", width and height equal to size, viewBox 0 0 100 100, tabIndex from the prop when enabled else -1, aria-valuemin, aria-valuemax and aria-valuenow; two paths (pt range and value) draw the range and value arcs, and an optional text element shows the value template, merged with PrimeReact's label section and then the text section. knobStyleModule is a StyleModule with the KnobClassesParams interface; classes root, range, value, text, and its CSS is the shared @ultimate/uix-styles/knob module on the Aura knob tokens. componentName knob matches the Aura components registry key knob. createPassThrough('knob') and useMergeProps from @ultimate/react-core build the pass-through; useComponentBase resolves cx and registers the style. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/knob; the root barrel line and manifest subpath are both present. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UKnob
@ultimate/react/knob#UKnob
@ultimate/react#UKnobProps
@ultimate/react/knob#UKnobProps
@ultimate/react#UKnobValueTemplate
@ultimate/react/knob#UKnobValueTemplate

## Owned source and evidence

packages/react/src/knob/index.ts
packages/react/src/knob/knob.tsx
packages/react/src/knob/knob-style.ts

```text
packages/react/src/knob/index.ts: export { UKnob } from
packages/react/src/knob/knob.tsx: export const UKnob = React.forwardRef<HTMLDivElement, UKnobProps>
packages/react/src/knob/knob.tsx: export interface UKnobProps extends Omit<
packages/react/src/knob/knob.tsx: onChange: (value: number) => void;
packages/react/src/knob/knob.tsx: event.nativeEvent.offsetX
packages/react/src/knob/knob.tsx: case "PageUp":
packages/react/src/knob/knob.tsx: valueTemplate.replace(/{value}/g, value.toString())
packages/react/src/knob/knob.tsx: role: "slider",
packages/react/src/knob/knob.tsx: document.addEventListener("touchmove", move, { passive: false });
packages/react/src/knob/knob.tsx: createPassThrough("knob"
packages/react/src/knob/knob.tsx: ptm("label"),
packages/react/src/knob/knob-style.ts: @ultimate/uix-styles/knob
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
