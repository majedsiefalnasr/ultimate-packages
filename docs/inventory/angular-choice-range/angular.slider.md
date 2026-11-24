# Angular USlider

ID: angular.slider

Framework: angular; availability: public

## Authored interpretation

Single or two-handle range slider with horizontal and vertical orientation, mouse and touch drag, keyboard stepping, an invalid state, change and slide-end outputs, pass-through and a ControlValueAccessor contract.

## Framework surface

Inherits dt, unstyled and pt from UBaseComponent; from UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal) and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR and U_PARENT_INSTANCE through useExisting, declares the UBind host directive (ngAfterViewChecked sets the host and root attributes from ptms) and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-slider; componentName slider. Signal inputs: min (numberAttribute, default 0), max (numberAttribute, default 100), orientation ('horizontal' | 'vertical', default horizontal), step (number | undefined), range (booleanAttribute, default false), invalid (booleanAttribute, default false), tabindex (numberAttribute, default 0), and ariaLabel and ariaLabelledBy (string | undefined). Outputs: onChange: output<USliderChangeEvent>() emitted from updateValue, and onSlideEnd: output<USliderChangeEvent>() emitted from emitSlideEnd at the end of a mouse or touch drag and on a bar click. Exported type USliderChangeEvent is { originalEvent: Event; value: number | number[] }. Template: a range span plus one handle span (range false) or two handle spans (range true), bound to the range, handle, startHandler and endHandler pass-through sections; each handle has role=slider, tabindex bound to the tabindex input and removed when disabled, aria-valuemin, aria-valuenow, aria-valuemax, aria-orientation, and aria-label and aria-labelledby when supplied. The handles and the range are placed with inset-inline-start (horizontal) or bottom (vertical). Pointer input is mouse and touch: beginDrag adds document mousemove and mouseup, or touchmove, touchend and touchcancel, listeners that are removed when the drag ends and by a DestroyRef callback on destroy; touch follows the identifier that started the drag. The pointer is converted with Prime's relative step rule and mirrored when getComputedStyle(element).direction is rtl; a zero-size track is ignored. Host (click) calls onBarClick, which ignores the click that follows a drag and picks the nearest handle in range mode. Keyboard handling covers ArrowDown/ArrowLeft and ArrowUp/ArrowRight by step (default 1), PageDown/PageUp by (step || 1) * 10, Home and End. Range mode models [start, end] without sorting and falls back to [min, max] when modelValue is not an array. writeControlValue writes value ?? (range ? [min, min] : min) to setModelValue. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/slider. Public API: USlider (class), USliderChangeEvent (type). Owned source-only declarations: sliderStyleModule (classes root, range, handle) and the SliderClassesParams interface. The CSS is the shared @ultimate/uix-styles/slider module (ADR-082, ADR-101); root classes are u-slider u-component, u-slider-horizontal or u-slider-vertical, p-disabled and p-invalid. unstyled drops those classes in the spec; whether style registration is skipped is a base-chain matter not asserted here. Theme identity slider matches componentName and the Aura components registry key slider. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

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
packages/ng/src/slider/slider.ts: hostDirectives: [UBind],
packages/ng/src/slider/slider.ts: invalid = input(false, { transform: booleanAttribute });
packages/ng/src/slider/slider.ts: document.addEventListener("touchmove", move, { passive: false });
packages/ng/src/slider/slider-style.ts: @ultimate/uix-styles/slider
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
    "behavior": "Component, shared style module and behavioral spec exist; source inspection is not a passing test."
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
