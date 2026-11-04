# Vue UKnob

ID: vue.knob

Framework: vue; availability: public

## Authored interpretation

Circular SVG dial that sets a numeric value by click, drag or keyboard.

## Framework surface

UKnob (Options API SFC Knob.vue, name "UKnob") and createBaseKnob (BaseKnob.ts) plus knobStyleModule (knob-style.ts; no params interface is exported; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: size (a Number, 100), readonly, step (1), min (0), max (100), strokeWidth (14), showValue (true), valueTemplate ("{value}"), disabled, valueColor, rangeColor, textColor (default hex colours), ariaLabelledby, ariaLabel plus modelValue and defaultValue. Emits change with the bare clamped number, not an event object. Template: root div containing one svg (viewBox 0 0 100 100, role="slider", width and height from size, tabindex -1 when readonly or disabled else 0, aria-valuemin, aria-valuemax, aria-valuenow, aria-labelledby, aria-label, @click, @mousedown, @keydown), a range path, a value path and an optional text element showing valueToDisplay; no slots, no aria-disabled or aria-readonly. currentValue is dValue when it is a number else min. valueToDisplay replaces the first "{value}" in valueTemplate with currentValue. mapRange divides by (inMax - inMin) without a guard for max equal to min. updateFromAngle maps angles above -PI/3, and angles below the start angle after adding 2*PI, to a value, rounds it to a multiple of step from min, then updateModelValue clamps it and calls writeValue(clamped) without an event; angles in neither range return without change, and step is not guarded against 0. onClick and onMouseDown return when disabled or readonly and map offsets to an angle via atan2 from the centre (size / 2); onClick reads event.offsetX and event.offsetY; onMouseDown adds document mousemove and mouseup listeners removed only on mouseup. onKeyDown switches on event.code: ArrowRight and ArrowUp add step, ArrowLeft and ArrowDown subtract step, Home and End set min and max, PageUp and PageDown add or subtract a fixed 10 (not a multiple of step). The root class is the constant u-knob u-component. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles; a comment in knob-style.ts cites @primeuix/styles 2.0.3 structural CSS and packages/themes/test/utils/g3a-port.mjs. Style module registered as knob.

## Public exports

@ultimate/vue#UKnob
@ultimate/vue/knob#UKnob
@ultimate/vue#createBaseKnob
@ultimate/vue/knob#createBaseKnob

## Owned source and evidence

packages/vue/src/knob/BaseKnob.ts
packages/vue/src/knob/Knob.vue
packages/vue/src/knob/index.ts
packages/vue/src/knob/knob-style.ts

```text
packages/vue/src/knob/Knob.vue: name: "UKnob"
packages/vue/src/knob/Knob.vue: emits: ["change"]
packages/vue/src/knob/Knob.vue: role="slider"
packages/vue/src/knob/Knob.vue: this.$emit("change", clamped);
packages/vue/src/knob/Knob.vue: switch (event.code) {
packages/vue/src/knob/Knob.vue: this.updateModelValue(this.currentValue + 10);
packages/vue/src/knob/Knob.vue: return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
packages/vue/src/knob/BaseKnob.ts: extends: createBaseEditableHolder(),
packages/vue/src/knob/BaseKnob.ts: size: { type: Number, default: 100 },
packages/vue/src/knob/knob-style.ts: export const knobStyleModule
packages/vue/src/knob/index.ts: createBaseKnob
packages/vue/src/index.ts: export * from "./knob";
packages/vue/package.json: "./knob": {
```

## Relationships

package.ultimate.vue.knob → [vue.knob](vue.knob.md) (reconciled family alias)
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
