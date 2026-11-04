# Angular USlider

ID: angular.slider

Framework: angular; availability: public

## Authored interpretation

Single or two-handle range slider with horizontal and vertical orientation, mouse drag and keyboard stepping, change and slide-end outputs and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-slider; componentName slider. Signal inputs: min (numberAttribute, default 0), max (numberAttribute, default 100), orientation ('horizontal' | 'vertical', default horizontal), step (number | undefined) and range (booleanAttribute, default false). Outputs: onChange: output<USliderChangeEvent>() emitted from updateValue, and onSlideEnd: output<USliderChangeEvent>() emitted from emitSlideEnd on mouseup and on a bar click. Exported type USliderChangeEvent is { originalEvent: Event; value: number | number[] }. Template: a range span plus one handle span (range false) or two handle spans (range true), each handle with role=slider, tabindex 0, aria-valuemin, aria-valuenow, aria-valuemax and aria-orientation. There is no aria-label or aria-labelledby on the handles and no input to supply one. Drag is mouse only: onMouseDown registers document mousemove and mouseup listeners that are removed only on mouseup, and neither slider.ts nor knob.ts defines ngOnDestroy. Host (click) calls onBarClick, which picks the nearest handle in range mode. Without step, applyStep floors the value; keyboard handling covers ArrowDown/ArrowLeft and ArrowUp/ArrowRight by step (default 1), PageDown/PageUp by (step || 1) * 10, Home and End. Range mode models [start, end] and falls back to [min, max] when modelValue is not an array. writeControlValue writes value ?? (range ? [min, min] : min) to setModelValue. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/slider. Public API: USlider (class), USliderChangeEvent (type). Owned source-only declarations: sliderStyleModule (classes root, range, handle; the root resolver takes an inline params type and no ClassesParams interface is exported). CSS is hand-ported locally with no uix-styles import; root class u-slider with u-slider-horizontal or u-slider-vertical and p-disabled. Theme identity slider matches componentName and the Aura components registry key slider. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#USlider
@ultimate/ng#USliderChangeEvent
@ultimate/ng/slider#USlider
@ultimate/ng/slider#USliderChangeEvent

## Owned source and evidence

packages/ng/src/slider/index.ts
packages/ng/src/slider/slider.ts
packages/ng/src/slider/slider-style.ts

```text
packages/ng/src/slider/index.ts: export { USlider }
packages/ng/src/slider/slider.ts: export class USlider extends UBaseEditableHolder
packages/ng/src/slider/index.ts: export type { USliderChangeEvent }
packages/ng/src/slider/slider.ts: onSlideEnd = output<USliderChangeEvent>();
packages/ng/src/slider/slider.ts: document.addEventListener("mousemove", move);
packages/ng/src/slider/slider.ts: range = input(false, { transform: booleanAttribute });
packages/ng/src/slider/slider-style.ts: export const sliderStyleModule
packages/themes/src/presets/aura/index.ts:     slider,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.slider → [angular.slider](angular.slider.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{checkbox,radio-button,toggle-button,toggle-switch,select-button,rating,slider,knob}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "d2e8101bf77e8e440c7166211ad5eae0e0ac6df8",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
