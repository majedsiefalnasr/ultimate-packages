# Vue URating

ID: vue.rating

Framework: vue; availability: public

## Authored interpretation

Row of star options backed by visually hidden native radio inputs in one radio group, with pointer clearing, an invalid state, icon slots and pass-through.

## Framework surface

URating (Options API SFC Rating.vue, name "URating", inheritAttrs false) and createBaseRating (BaseRating.ts) plus ratingStyleModule, RatingRootClassesParams, RatingOptionClassesParams and RatingIconClassesParams (rating-style.ts; not re-exported from index.ts). Base factory chain: createBaseRating extends createBaseEditableHolder({componentName: "rating", styleModule}) (modelValue, defaultValue, update:modelValue, value-change, dValue, writeValue), so cx, style registration under the Aura rating key, unstyled, dt and pt come from the shared base chain; it does not shadow cx or mounted. Declared props: stars (5), readonly, disabled, invalid, name, onIcon and offIcon (class strings) and ariaLabelledby, plus modelValue and defaultValue. Emits rate ({ originalEvent, value }), focus and blur, carrying the native radio focus and blur events. Template: root div role="group" with aria-labelledby, cx root (p-readonly, p-disabled), data-p and ptmi('root'); one option div per star (cx option with active and focusVisible, data-p-active, data-p-focused, ptm('option') with the context { active, focused }) with a click handler, containing a hidden-accessible span (ptm hiddenOptionInputContainer) with an input type="radio" (value, name, checked when the value equals the star, disabled, readonly, aria-label "1 star" or "N stars", aria-invalid when invalid, ptm hiddenOptionInput) bound to @focus, @blur and @change, followed by the onicon or officon slot (scope value, class and toggleCallback) whose fallback is a span with the onIcon or offIcon class, else an aria-hidden 14 by 14 svg with the PrimeIcons star-fill or star path from rating-icons.ts (RATING_STAR_FILL_PATH and RATING_STAR_PATH); the icons carry p-invalid when invalid. When name is omitted every radio shares a generated group name, uuid('u_id_') + '_name'. Keyboard is the native radio group: there is no keydown handler. A native change only selects; when readonly or disabled blocks it, the radios' checked state is put back. A pointer click on an option selects that star, clears the value when the star is already selected, skips clicks whose target is the radio itself and moves focus to the radio. The focus ring shows only for keyboard focus, through a focusFromPointer flag. onFocus returns when readonly or disabled; onBlur always resets focusedOptionIndex and emits blur, with no readonly or disabled guard. writeValue sets dValue and emits update:modelValue only when the component is controlled (modelValue passed, or neither modelValue nor defaultValue passed); value-change is always emitted. The CSS is the shared @ultimate/uix-styles/rating module. Forms registration is not provided.

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
packages/vue/src/rating/rating-icons.ts

```text
packages/vue/src/rating/Rating.vue: name: "URating"
packages/vue/src/rating/Rating.vue: emits: ["rate", "focus", "blur"]
packages/vue/src/rating/Rating.vue: this.$emit("blur", event);
packages/vue/src/rating/Rating.vue: this.select(event, value === this.current ? null : value);
packages/vue/src/rating/Rating.vue: generatedName: `${uuid("u_id_")}_name`,
packages/vue/src/rating/Rating.vue: v-bind="ptmi('root')"
packages/vue/src/rating/Rating.vue: name="onicon"
packages/vue/src/rating/BaseRating.ts: extends: createBaseEditableHolder({
packages/vue/src/rating/rating-style.ts: @ultimate/uix-styles/rating
packages/vue/src/rating/rating-style.ts: export const ratingStyleModule
packages/vue/src/rating/rating-icons.ts: export const RATING_STAR_PATH
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
