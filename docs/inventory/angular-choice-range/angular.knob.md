# Angular UKnob

ID: angular.knob

Framework: angular; availability: public

## Authored interpretation

Circular value dial drawn as an inline SVG arc pair, adjustable by click, drag and keyboard, with a change output and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-knob; componentName knob. Signal inputs: size (default 100), min (0), max (100), step (1), strokeWidth (14), showValue (booleanAttribute, default true), readonly (booleanAttribute), valueTemplate (default '{value}'), valueColor, rangeColor and textColor (CSS var() fallback strings). Output onChange: output<number>() emitted from updateModelValue with the clamped value. Template: one SVG with viewBox 0 0 100 100 and role=slider, aria-valuemin, aria-valuemax and aria-valuenow from the protected _value computed, tabindex -1 when readonly or disabled else 0, click/keydown/mousedown handlers, a range path, a value path and an optional text element. There is no aria-label or aria-labelledby and no input to supply one. Keyboard uses event.code: ArrowRight/ArrowUp add step, ArrowLeft/ArrowDown subtract step, Home, End, and PageUp/PageDown add or subtract a fixed 10. Mouse drag registers document mousemove and mouseup listeners removed on mouseup. Host class is cx('root') only; $disabled is not passed to the class resolver, so no p-disabled class is emitted and disabled is not reflected in the root class. writeControlValue writes the value when it is a number, otherwise min, to setModelValue. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/knob. Public API: UKnob (class). Owned source-only declarations: knobStyleModule (classes root, range, value, text, as plain strings; no ClassesParams interface is exported). CSS is hand-ported locally with no uix-styles import and its comment cites GAP-064 G3-A. Root class u-knob u-component. Theme identity knob matches componentName and the Aura components registry key knob. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UKnob
@ultimate/ng/knob#UKnob

## Owned source and evidence

packages/ng/src/knob/index.ts
packages/ng/src/knob/knob.ts
packages/ng/src/knob/knob-style.ts

```text
packages/ng/src/knob/index.ts: export { UKnob }
packages/ng/src/knob/knob.ts: export class UKnob extends UBaseEditableHolder
packages/ng/src/knob/knob.ts: onChange = output<number>();
packages/ng/src/knob/knob.ts: switch (event.code) {
packages/ng/src/knob/knob.ts: role="slider"
packages/ng/src/knob/knob-style.ts: export const knobStyleModule
packages/ng/src/knob/knob-style.ts: root: "u-knob u-component",
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
