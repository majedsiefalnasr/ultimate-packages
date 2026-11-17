# Angular URating

ID: angular.rating

Framework: angular; availability: public

## Authored interpretation

Star rating control built from per-star radio inputs, with keyboard stepping, focus and rate outputs and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-rating; componentName rating. Signal inputs: readonly (booleanAttribute), stars (numberAttribute, default 5) and name (string). The name doc comment says it defaults to a generated id, but the source has no id generation: name only feeds [attr.name] on each radio input. Outputs: onRate: output<URatingRateEvent>() emitted from onOptionSelect, onFocus: output<FocusEvent>() emitted from onInputFocus with a synthetic new FocusEvent('focus'), and onBlur: output<FocusEvent>() emitted from onInputBlur with a synthetic new FocusEvent('blur'). Exported type URatingRateEvent is { originalEvent: Event; value: number | null }. Template: per star a div (cx('option')) with a click handler, a span.u-hidden-accessible wrapping a native input type=radio ([attr.name], [attr.disabled], [attr.readonly], [checked] when modelValue() === star + 1, [attr.aria-label] of '1 star' or 'N stars', focus/blur/change/keydown handlers), and an aria-hidden inline SVG star-fill (onIcon) or star (offIcon). Selecting the already selected value writes null. onStarKeyDown handles Enter and space (select), ArrowLeft/ArrowUp (previous, wrapping) and ArrowRight/ArrowDown (next, wrapping). The host sets no role or aria attributes. writeControlValue passes the value to setModelValue. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/rating. Public API: URating (class), URatingRateEvent (type). Owned source-only declarations: RatingClassesParams (star, value, focused; only focused is read by the option class resolver), ratingStyleModule (classes root, option, onIcon, offIcon). CSS is hand-ported locally with no uix-styles import; root class u-rating with p-disabled, option class u-rating-option with p-focus-visible. Theme identity rating matches componentName and the Aura components registry key rating. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#URating
@ultimate/ng#URatingRateEvent
@ultimate/ng/rating#URating
@ultimate/ng/rating#URatingRateEvent

## Owned source and evidence

packages/ng/src/rating/index.ts
packages/ng/src/rating/rating.ts
packages/ng/src/rating/rating-style.ts

```text
packages/ng/src/rating/index.ts: export { URating }
packages/ng/src/rating/rating.ts: export class URating extends UBaseEditableHolder
packages/ng/src/rating/index.ts: export type { URatingRateEvent }
packages/ng/src/rating/rating.ts: onRate = output<URatingRateEvent>();
packages/ng/src/rating/rating.ts: this.onFocus.emit(new FocusEvent("focus"));
packages/ng/src/rating/rating.ts: /** Name of the underlying radio group (defaults to a generated id). */
packages/ng/src/rating/rating-style.ts: export interface RatingClassesParams
packages/ng/src/rating/rating-style.ts: export const ratingStyleModule
packages/themes/src/presets/aura/index.ts:     rating,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.rating → [angular.rating](angular.rating.md) (reconciled family alias)
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
