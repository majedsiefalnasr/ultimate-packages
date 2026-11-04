# Vue URating

ID: vue.rating

Framework: vue; availability: public

## Authored interpretation

Row of star options backed by visually hidden radio inputs, with keyboard stepping.

## Framework surface

URating (Options API SFC Rating.vue, name "URating") and createBaseRating (BaseRating.ts) plus ratingStyleModule, RatingClassesParams and RatingOptionClassesParams (rating-style.ts; not re-exported from index.ts). Base factory chain: createBaseX extends createBaseEditableHolder directly (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), not createBaseInput, so there is no pcFluid injection or inherited variant prop; because the holder is created with its empty default style module, the factory shadows cx() and mounted() locally over its own style module. Declared props: stars (5), readonly, disabled, name, ariaLabelledby plus modelValue and defaultValue. Emits rate ({ originalEvent, value }), focus and blur; focus and blur carry new synthetic FocusEvent objects, not the native event. Template: root div role="group" with aria-labelledby; one option div (tabindex "-1") per star containing a hidden-accessible span with an input type="radio" (value, name, disabled, readonly, checked when dValue === star, aria-label "1 star" or "N stars") bound to @focus, @blur, @change and @keydown, followed by an aria-hidden SVG star, the on icon when dValue is neither null nor undefined and star <= dValue, otherwise the off icon; no slots and no cancel icon. onOptionSelect returns when readonly or disabled; it writes null when the chosen star equals dValue and the star otherwise, sets focusedIndex to -1 for null and the star otherwise, and emits rate. onInputFocus returns when readonly or disabled; onInputBlur always resets focusedIndex and emits blur, with no readonly or disabled guard. onStarKeyDown returns when readonly or disabled; Enter and Space select the star; ArrowLeft and ArrowUp step to dValue - 1 (to stars when dValue is falsy or the result is below 1); ArrowRight and ArrowDown step to dValue + 1 (to 1 when dValue is falsy or the result exceeds stars). The source comment says the keyboard stepping was added to match the React realization. styleParams: the root receives { disabled } and each option receives { focused }, rendering u-rating (with u-rating-disabled) and u-rating-option (with u-rating-option-focused). writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The css is hand-ported rather than imported from uix-styles. Style module registered as rating.

## Public exports

@ultimate/vue#URating
@ultimate/vue/rating#URating
@ultimate/vue#createBaseRating
@ultimate/vue/rating#createBaseRating

## Owned source and evidence

packages/vue/src/rating/BaseRating.ts
packages/vue/src/rating/Rating.vue
packages/vue/src/rating/index.ts
packages/vue/src/rating/rating-style.ts

```text
packages/vue/src/rating/Rating.vue: name: "URating"
packages/vue/src/rating/Rating.vue: emits: ["rate", "focus", "blur"]
packages/vue/src/rating/Rating.vue: this.$emit("blur", new FocusEvent("blur"));
packages/vue/src/rating/Rating.vue: const newValue = this.dValue === value ? null : value;
packages/vue/src/rating/Rating.vue: const prev = this.dValue ? this.dValue - 1 : this.stars;
packages/vue/src/rating/BaseRating.ts: extends: createBaseEditableHolder(),
packages/vue/src/rating/rating-style.ts: export const ratingStyleModule
packages/vue/src/rating/rating-style.ts: export interface RatingOptionClassesParams
packages/vue/src/rating/index.ts: createBaseRating
packages/vue/src/index.ts: export * from "./rating";
packages/vue/package.json: "./rating": {
```

## Relationships

package.ultimate.vue.rating → [vue.rating](vue.rating.md) (reconciled family alias)
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
