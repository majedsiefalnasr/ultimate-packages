# Vue USlider

ID: vue.slider

Framework: vue; availability: public

## Authored interpretation

Draggable single-value or two-handle range slider with mouse, click and keyboard input.

## Framework surface

USlider (Options API SFC Slider.vue, name "USlider") and createBaseSlider (BaseSlider.ts) plus sliderStyleModule (slider-style.ts; its root params are an inline type, so no params interface is exported; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: min (0), max (100), orientation ("horizontal"), step (null), range (false), disabled, ariaLabelledby, ariaLabel plus modelValue and defaultValue. The ariaLabelledby and ariaLabel props are declared but never bound in the template, and there is no readonly prop. Emits change ({ originalEvent, value }) and slideend ({ originalEvent, value }). Template: root div with @click bound to onBarClick; single mode renders a range span and one handle span, range mode renders a range span and two handle spans (indices 0 and 1); each handle has role="slider", tabindex="0" (also when disabled), aria-valuemin, aria-valuenow, aria-valuemax, aria-orientation and @mousedown and @keydown; no aria-disabled; mouse events only, with document mousemove and mouseup listeners added on mousedown and removed only on mouseup. singleValue is dValue when it is a number else min; rangeValue is dValue when it is an array else [min, max]. toPercent returns 0 below min, 100 above max, otherwise ((value - min) * 100) / (max - min), which is 0/0 (NaN) when min, max and value are all equal. The style computeds test orientation === "horizontal" (left and width) and otherwise use bottom and height, while the root class marks vertical only for "vertical", so any other orientation string gets the horizontal class with vertical positioning. applyStep floors the raw value when step is falsy and otherwise rounds to the nearest multiple of step, fixed to the step's decimal places when step is non-integer. updateValue clamps to min and max; in range mode it replaces only the active handle's entry with no ordering guard between handles. Pointer values pass through applyStep; keyboard values do not: ArrowLeft and ArrowDown subtract, ArrowRight and ArrowUp add (step or 1), PageDown and PageUp use ten times that, Home and End use min and max, each with preventDefault. onMouseDown and onKeyDown return when disabled; onBarClick returns when disabled, while dragging, or when the target has role slider, and picks the nearer handle in range mode (ties go to index 0) and then emits slideend; keyboard input never emits slideend. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles. Style module registered as slider.

## Public exports

@ultimate/vue#USlider
@ultimate/vue/slider#USlider
@ultimate/vue#createBaseSlider
@ultimate/vue/slider#createBaseSlider

## Owned source and evidence

packages/vue/src/slider/BaseSlider.ts
packages/vue/src/slider/Slider.vue
packages/vue/src/slider/index.ts
packages/vue/src/slider/slider-style.ts

```text
packages/vue/src/slider/Slider.vue: name: "USlider"
packages/vue/src/slider/Slider.vue: emits: ["change", "slideend"]
packages/vue/src/slider/Slider.vue: role="slider"
packages/vue/src/slider/Slider.vue: return ((value - this.min) * 100) / (this.max - this.min);
packages/vue/src/slider/Slider.vue: return this.orientation === "horizontal"
packages/vue/src/slider/Slider.vue: if (!this.step) return Math.floor(raw);
packages/vue/src/slider/Slider.vue: values[this.handleIndex] = clamped;
packages/vue/src/slider/Slider.vue: const stepAmount = this.step || 1;
packages/vue/src/slider/BaseSlider.ts: extends: createBaseEditableHolder(),
packages/vue/src/slider/slider-style.ts: export const sliderStyleModule
packages/vue/src/slider/slider-style.ts: "u-slider-vertical": params.orientation === "vertical"
packages/vue/src/slider/index.ts: createBaseSlider
packages/vue/src/index.ts: export * from "./slider";
packages/vue/package.json: "./slider": {
```

## Relationships

package.ultimate.vue.slider → [vue.slider](vue.slider.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
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
    "behavior": "Bounded Vue product spec for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/toggle-switch/ src/select-button/ src/rating/ src/slider/ src/knob/",
    "outcome": "not-run",
    "revision": "638b5a660b62be5b39a9402db09bccc2a9e9d2e4",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
