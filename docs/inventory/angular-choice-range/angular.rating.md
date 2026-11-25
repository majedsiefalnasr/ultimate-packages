# Angular URating

ID: angular.rating

Framework: angular; availability: public

## Authored interpretation

Star rating control built from per-star native radio inputs in one radio group, with pointer clearing, an invalid state, custom icons, pass-through, focus and rate outputs and a ControlValueAccessor contract.

## Framework surface

Inherits dt, unstyled and pt from UBaseComponent; from UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal) and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi and itself as U_PARENT_INSTANCE, and overrides writeControlValue to pass the value to setModelValue. Standalone, OnPush, ViewEncapsulation.None, hostDirectives [UBind]; ngAfterViewChecked sets the root attributes from ptms(['host','root']). Component selector u-rating; componentName rating. Signal inputs: readonly, required, invalid and autofocus (booleanAttribute), stars (numberAttribute, default 5), name, iconOnClass, iconOnStyle, iconOffClass and iconOffStyle. When name is omitted every radio shares a generated id-based group name, uuid('u_id_') + '_name'. Outputs: onRate: output<URatingRateEvent>() with { originalEvent, value }, and onFocus and onBlur: output<FocusEvent>() that emit the native radio focus and blur events (onFocus only while the rating is editable). Content templates #onicon and #officon (contentChild TemplateRef<URatingIconTemplateContext>, context { $implicit: value, class }) replace the default icons; otherwise iconOnClass or iconOffClass render a span with iconOnStyle or iconOffStyle, else an aria-hidden 14 by 14 svg draws the PrimeIcons star-fill (onIcon) or star (offIcon) path from rating-icons.ts. Template: per star a div (cx('option') with active and focusVisible, data-p-active, data-p-focused, pt section option with the context { active, focused }) with a click handler, a span.u-hidden-accessible (pt hiddenOptionInputContainer) wrapping a native input type=radio (pt hiddenOptionInput; value, name, disabled, readonly, required, checked when the model equals the star, aria-label '1 star' or 'N stars', aria-invalid when invalid, uAutoFocus on the selected star or the first one when autofocus). Keyboard is the native radio group: there is no keydown handler, so the arrow keys and Space are the browser's. A native change only selects and marks the control touched; when readonly or disabled blocks it, the radios' checked state is put back. A pointer click on an option selects that star, clears the value when the star is already selected, skips clicks whose target is the radio itself and moves focus to the radio. The focus ring (p-focus-visible) shows only for keyboard focus, through a focusFromPointer flag. The host carries cx('root') with p-readonly and p-disabled, and data-p. Public API: URating (class), URatingRateEvent and URatingIconTemplateContext (types); root @ultimate/ng re-exports @ultimate/ng/rating. Owned source-only declarations: ratingStyleModule (classes root, option, onIcon and offIcon; the icons carry p-invalid when invalid), the RatingRootClassesParams, RatingOptionClassesParams and RatingIconClassesParams interfaces, and the RATING_STAR_PATH and RATING_STAR_FILL_PATH constants. The CSS imports the shared @ultimate/uix-styles/rating module and adds the Angular-only .u-rating.ng-invalid.ng-dirty .u-rating-icon rule. Theme identity rating matches componentName and the Aura components registry key rating. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#URating
@ultimate/ng#URatingRateEvent
@ultimate/ng/rating#URating
@ultimate/ng/rating#URatingRateEvent
@ultimate/ng#URatingIconTemplateContext
@ultimate/ng/rating#URatingIconTemplateContext

## Owned source and evidence

packages/ng/src/rating/index.ts
packages/ng/src/rating/rating.ts
packages/ng/src/rating/rating-style.ts
packages/ng/src/rating/rating-icons.ts

```text
packages/ng/src/rating/index.ts: export { URating }
packages/ng/src/rating/rating.ts: export class URating extends UBaseEditableHolder
packages/ng/src/rating/rating.ts: onRate = output<URatingRateEvent>();
packages/ng/src/rating/index.ts: export type { URatingIconTemplateContext, URatingRateEvent }
packages/ng/src/rating/rating.ts: hostDirectives: [UBind],
packages/ng/src/rating/rating.ts: private readonly generatedName = `${uuid("u_id_")}_name`;
packages/ng/src/rating/rating.ts: invalid = input(false, { transform: booleanAttribute });
packages/ng/src/rating/rating.ts: contentChild<TemplateRef<URatingIconTemplateContext>>("onicon");
packages/ng/src/rating/rating.ts: this.onFocus.emit(event);
packages/ng/src/rating/rating-style.ts: @ultimate/uix-styles/rating
packages/ng/src/rating/rating-style.ts: export const ratingStyleModule
packages/ng/src/rating/rating-icons.ts: export const RATING_STAR_FILL_PATH
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
