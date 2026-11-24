# Vue USlider

ID: vue.slider

Framework: vue; availability: public

## Authored interpretation

Draggable single-value or two-handle range slider with mouse, touch, click and keyboard input, an invalid state and pass-through.

## Framework surface

USlider (Options API SFC Slider.vue, name "USlider", inheritAttrs false) and createBaseSlider (BaseSlider.ts) plus sliderStyleModule (slider-style.ts, which also exports the SliderClassesParams interface; neither is re-exported from index.ts). Base factory chain: createBaseSlider extends createBaseEditableHolder({componentName: "slider", styleModule}) directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; cx, style registration under the Aura slider key, unstyled, per-instance dt and pt come from the shared base chain. Declared props: min (0), max (100), orientation ("horizontal"), step (null), range (false), disabled, invalid, tabindex (0), ariaLabelledby, ariaLabel plus modelValue and defaultValue; there is no readonly prop. Emits change ({ originalEvent, value }) and slideend ({ originalEvent, value }). Template: root div with ptmi('root') and @click bound to onBarClick; single mode renders a range span and one handle span, range mode renders a range span and two handle spans (indices 0 and 1) bound to the range, handle, startHandler and endHandler pass-through sections; each handle has role="slider", tabindex bound to the tabindex prop and removed when disabled, aria-valuemin, aria-valuenow, aria-valuemax, aria-orientation, aria-label and aria-labelledby from the props, @mousedown, @touchstart.passive and @keydown; no aria-disabled. The handles and the range are placed with inset-inline-start (horizontal) or bottom (vertical); toPercent returns 0 when max is not greater than min. Pointer input is mouse and touch: beginDrag adds document mousemove and mouseup, or touchmove, touchend and touchcancel, listeners that are removed when the drag ends and in beforeUnmount; touch follows the identifier that started the drag. The pointer value is converted with Prime's relative step rule and mirrored when getComputedStyle(el).direction is rtl; a zero-size track is ignored. The style computeds test orientation === "horizontal" and otherwise use bottom and height, while the root class marks vertical only for "vertical", so any other orientation string gets the horizontal class with vertical positioning. updateValue rounds with toFixed(10) and clamps to min and max; in range mode it replaces only the active handle's entry with no ordering guard between handles. Pointer values pass through the step rule; keyboard values do not: ArrowLeft and ArrowDown subtract, ArrowRight and ArrowUp add (step or 1), PageDown and PageUp use ten times that, Home and End use min and max, each with preventDefault. onMouseDown, onTouchStart and onKeyDown return when disabled; onBarClick returns when disabled, for the click that follows a drag, or when the target has role slider, and picks the nearer handle in range mode (ties go to index 0) and then emits slideend; the end of a drag also emits slideend, and keyboard input never emits slideend. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The CSS is the shared @ultimate/uix-styles/slider module (ADR-082, ADR-101). Style module registered as slider.

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
packages/vue/src/slider/Slider.vue: if (max <= min || value < min) return 0;
packages/vue/src/slider/Slider.vue: return this.orientation === "horizontal"
packages/vue/src/slider/Slider.vue: if (!step) return Math.floor(raw);
packages/vue/src/slider/Slider.vue: values[this.handleIndex] = clamped;
packages/vue/src/slider/Slider.vue: const stepAmount = this.step || 1;
packages/vue/src/slider/BaseSlider.ts: extends: createBaseEditableHolder({
packages/vue/src/slider/slider-style.ts: export const sliderStyleModule
packages/vue/src/slider/slider-style.ts: "u-slider-vertical": params.orientation === "vertical"
packages/vue/src/slider/index.ts: createBaseSlider
packages/vue/src/index.ts: export * from "./slider";
packages/vue/package.json: "./slider": {
packages/vue/src/slider/Slider.vue: inheritAttrs: false,
packages/vue/src/slider/Slider.vue: document.addEventListener("touchmove", move, { passive: false });
packages/vue/src/slider/slider-style.ts: @ultimate/uix-styles/slider
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
    "behavior": "Component, declared props and shared style module exist in source with a colocated spec; source inspection is not a passing test."
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
