# Vue UKnob

ID: vue.knob

Framework: vue; availability: public

## Authored interpretation

Circular SVG dial that sets a numeric value by click, mouse and touch drag or keyboard, with an invalid state and pass-through.

## Framework surface

UKnob (Options API SFC Knob.vue, name "UKnob", inheritAttrs false) and createBaseKnob plus the UKnobValueTemplate type (BaseKnob.ts), and knobStyleModule with the KnobClassesParams interface (knob-style.ts; not re-exported from index.ts). Base factory chain: createBaseKnob extends createBaseEditableHolder({componentName: "knob", styleModule}) (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), so cx, style registration under the Aura knob key, unstyled, dt and pt come from the shared base chain; it does not shadow cx or mounted. Declared props: size (a Number, 100), readonly, step (1), min (0), max (100), valueColor, rangeColor and textColor (defaults $dt('knob.value.background').variable, $dt('knob.range.background').variable and $dt('knob.text.color').variable from @ultimate/uix-styled, no literal fallback), strokeWidth (14), showValue (true), valueTemplate (String or Function, "{value}"), tabindex (0), disabled, invalid, ariaLabelledby, ariaLabel plus modelValue and defaultValue. Emits change with the bare clamped number, not an event object, for pointer and keyboard changes. Template: root div (cx root with p-disabled and p-invalid, ptmi('root')) containing one svg (viewBox 0 0 100 100, role="slider", width and height from size, tabindex -1 when readonly or disabled else the tabindex prop, aria-valuemin, aria-valuemax, aria-valuenow, aria-labelledby, aria-label, ptm('svg'), @click, @mousedown, a passive @touchstart, @keydown), a range path (ptm range), a value path (ptm value) and an optional text element (ptm text) showing valueToDisplay; no slots, no aria-disabled or aria-readonly. currentValue is dValue when it is a number else min. valueToDisplay calls a function template with currentValue, or replaces every "{value}" in a string template. mapRange divides by (inMax - inMin) without a guard for max equal to min. updateFromAngle maps angles above -PI/3, and angles below the start angle after adding 2*PI, to a value, rounds it to a multiple of step from min, then updateModelValue clamps it, calls writeValue(clamped) and emits change; angles in neither range return without change, and step is not guarded against 0. onClick returns when disabled or readonly and reads event.offsetX and event.offsetY. onMouseDown and onTouchStart begin a drag that adds document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel), reads the pointer against the svg bounding box, follows only the touch that started it, ignores moves while the knob is disabled or readonly, and removes the listeners when the drag ends or in beforeUnmount. onKeyDown switches on event.code: ArrowRight and ArrowUp add step, ArrowLeft and ArrowDown subtract step, Home and End set min and max, PageUp and PageDown add or subtract a fixed 10 (not a multiple of step). writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The CSS is the shared @ultimate/uix-styles/knob module. Forms registration is not provided. Style module registered as knob.

## Public exports

@ultimate/vue#UKnob
@ultimate/vue/knob#UKnob
@ultimate/vue#createBaseKnob
@ultimate/vue/knob#createBaseKnob
@ultimate/vue#UKnobValueTemplate
@ultimate/vue/knob#UKnobValueTemplate

## Owned source and evidence

packages/vue/src/knob/BaseKnob.ts
packages/vue/src/knob/Knob.vue
packages/vue/src/knob/index.ts
packages/vue/src/knob/knob-style.ts

```text
packages/vue/src/knob/Knob.vue: name: "UKnob"
packages/vue/src/knob/Knob.vue: inheritAttrs: false,
packages/vue/src/knob/Knob.vue: emits: ["change"]
packages/vue/src/knob/Knob.vue: role="slider"
packages/vue/src/knob/Knob.vue: this.$emit("change", clamped);
packages/vue/src/knob/Knob.vue: switch (event.code) {
packages/vue/src/knob/Knob.vue: this.updateModelValue(this.currentValue + 10);
packages/vue/src/knob/Knob.vue: return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
packages/vue/src/knob/Knob.vue: v-bind="ptmi('root')"
packages/vue/src/knob/Knob.vue: @touchstart.passive="onTouchStart"
packages/vue/src/knob/Knob.vue: beforeUnmount() {
packages/vue/src/knob/BaseKnob.ts: extends: createBaseEditableHolder({
packages/vue/src/knob/BaseKnob.ts: size: { type: Number, default: 100 },
packages/vue/src/knob/BaseKnob.ts: export type UKnobValueTemplate
packages/vue/src/knob/knob-style.ts: @ultimate/uix-styles/knob
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
