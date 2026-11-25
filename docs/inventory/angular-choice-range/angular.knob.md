# Angular UKnob

ID: angular.knob

Framework: angular; availability: public

## Authored interpretation

Circular value dial drawn as an inline SVG arc pair, adjustable by click, mouse and touch drag and keyboard, with an invalid state, accessible names, pass-through, a change output and a ControlValueAccessor contract.

## Framework surface

Inherits dt, unstyled and pt from UBaseComponent; from UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal) and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi and itself as U_PARENT_INSTANCE, and overrides writeControlValue to write the value when it is a number, otherwise min. Standalone, OnPush, ViewEncapsulation.None, hostDirectives [UBind]; ngAfterViewChecked sets the root attributes from ptms(['host','root']). Component selector u-knob; componentName knob. Signal inputs: size (default 100), min (0), max (100), step (1), strokeWidth (14), showValue (booleanAttribute, default true), readonly and invalid (booleanAttribute), tabindex (numberAttribute, default 0), ariaLabel, ariaLabelledBy, valueTemplate (UKnobValueTemplate: a string in which every {value} is replaced, or a function of the value; default '{value}'), and valueColor, rangeColor and textColor, whose defaults are $dt('knob.value.background').variable, $dt('knob.range.background').variable and $dt('knob.text.color').variable from @ultimate/uix-styled (var(--u-knob-...) with the configured prefix, no literal fallback). Output onChange: output<number>() emitted from updateModelValue with the clamped value, which also calls the form change and touched callbacks. Template: one SVG (pt section svg) with viewBox 0 0 100 100 and role=slider, CSS width and height from size, aria-valuemin, aria-valuemax and aria-valuenow from the protected _value computed, aria-label and aria-labelledby from the inputs, tabindex -1 when readonly or disabled else the tabindex input, click/keydown/mousedown/touchstart handlers, a range path (pt range), a value path (pt value) and an optional text element (pt text). No name or required attribute is written. Keyboard uses event.code: ArrowRight/ArrowUp add step, ArrowLeft/ArrowDown subtract step, Home, End, and PageUp/PageDown add or subtract a fixed 10. A click maps offsetX and offsetY to an angle. Mouse and touch drags register document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel) that read the pointer against the svg bounding box, follow only the touch that started the drag, ignore moves while the knob is disabled or readonly, and are removed when the drag ends or, through DestroyRef, when the component is destroyed. Host class is cx('root', { disabled: $disabled(), invalid }), so the root carries p-disabled and p-invalid. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/knob. Public API: UKnob (class), UKnobValueTemplate (type). Owned source-only declarations: knobStyleModule (classes root, range, value, text) and the KnobClassesParams interface. The CSS imports the shared @ultimate/uix-styles/knob module. Root class u-knob u-component. Theme identity knob matches componentName and the Aura components registry key knob. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UKnob
@ultimate/ng/knob#UKnob
@ultimate/ng#UKnobValueTemplate
@ultimate/ng/knob#UKnobValueTemplate

## Owned source and evidence

packages/ng/src/knob/index.ts
packages/ng/src/knob/knob.ts
packages/ng/src/knob/knob-style.ts

```text
packages/ng/src/knob/index.ts: export { UKnob, type UKnobValueTemplate }
packages/ng/src/knob/knob.ts: export class UKnob extends UBaseEditableHolder
packages/ng/src/knob/knob.ts: onChange = output<number>();
packages/ng/src/knob/knob.ts: switch (event.code) {
packages/ng/src/knob/knob.ts: role="slider"
packages/ng/src/knob/knob.ts: hostDirectives: [UBind],
packages/ng/src/knob/knob.ts: invalid = input(false, { transform: booleanAttribute });
packages/ng/src/knob/knob.ts: document.addEventListener("touchmove", move, { passive: false });
packages/ng/src/knob/knob.ts: valueColor = input<string>($dt("knob.value.background").variable);
packages/ng/src/knob/knob.ts: : template.replace(/{value}/g, value.toString());
packages/ng/src/knob/knob-style.ts: @ultimate/uix-styles/knob
packages/ng/src/knob/knob-style.ts: export const knobStyleModule
packages/ng/src/knob/knob-style.ts: "u-knob u-component",
packages/themes/src/presets/aura/index.ts:     knob,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.knob → [angular.knob](angular.knob.md) (reconciled family alias)
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
