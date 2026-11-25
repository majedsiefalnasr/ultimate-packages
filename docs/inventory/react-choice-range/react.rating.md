# React URating

ID: react.rating

Framework: react; availability: public

## Authored interpretation

Controlled star rating row with pointer and keyboard selection, pointer clearing, an optional cancel item, an invalid state, custom icons and pass-through.

## Framework surface

URating is a forwardRef component whose handle URatingHandle exposes getElement(). URatingProps extends the div HTML attributes without onChange and children and adds value (number|null, default null), onChange, stars (default 5), readOnly, disabled, invalid, cancel (default false), name, onIcon, offIcon and cancelIcon (URatingIcon: a class string rendered on a span, an element cloned with the icon props, or a function of the icon props), onIconProps, offIconProps, cancelIconProps, unstyled, pt and ptOptions. URatingChangeEvent is {originalEvent, value:number|null, stopPropagation, preventDefault, target:{name, id, value}}. Every other prop, including onFocus and onBlur, is merged onto the root div with role="group" and the pt root section. State is controlled plus internal focusedOptionIndex and isFocusVisibleItem state and a pointerDown ref. Changes are emitted only when enabled = !disabled && !readOnly. Per star a div with role="radio", aria-checked={value === starValue}, aria-label "1 star" or "N stars", aria-invalid when invalid, tabIndex 0 when enabled and none when disabled or read-only, data-p-focused, cx item (u-rating-option with u-rating-option-active and p-focus-visible) and the pt item section with the context { active }. Its icon is the custom onIcon or offIcon, or an aria-hidden 14 by 14 svg with the PrimeIcons star-fill or star path from rating-icons.ts (RATING_STAR_PATH and RATING_STAR_FILL_PATH; the cancel item uses RATING_BAN_PATH), merged with the onIcon or offIcon pt section and icon props; the icons carry p-invalid when invalid. Keyboard per star: Enter and Space select that star; ArrowLeft and ArrowUp step to (value ?? 0) - 1, wrapping to stars below 1; ArrowRight and ArrowDown step to (value ?? 0) + 1, wrapping to 1 above stars. The keyboard never clears. A pointer click on the selected star emits null; any other click selects. The focus ring shows only for keyboard focus, through the pointerDown ref set on mouse down. With cancel, a cancel item (role="button", aria-label "Clear", cx cancelItem, pt cancelItem) renders before the stars with the cancelIcon or the PrimeIcons ban svg, and emits null on click, Enter or Space. ratingStyleModule is a StyleModule with classes root, item, onIcon, offIcon, cancelItem and cancelIcon, and its CSS is the shared @ultimate/uix-styles/rating module on the Aura rating tokens. componentName rating matches the Aura components registry key rating. createPassThrough('rating') and useMergeProps from @ultimate/react-core build the pass-through; useComponentBase resolves cx and registers the style. Public runtime and types (URating, URatingProps, URatingChangeEvent, URatingHandle, URatingIcon, URatingIconProps) are named exports from both @ultimate/react and @ultimate/react/rating; the root barrel line and manifest subpath are both present. The tooltip props are not provided (composition through UTooltip). The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#URating
@ultimate/react/rating#URating
@ultimate/react#URatingProps
@ultimate/react/rating#URatingProps
@ultimate/react#URatingChangeEvent
@ultimate/react/rating#URatingChangeEvent
@ultimate/react#URatingHandle
@ultimate/react/rating#URatingHandle
@ultimate/react#URatingIcon
@ultimate/react/rating#URatingIcon
@ultimate/react#URatingIconProps
@ultimate/react/rating#URatingIconProps

## Owned source and evidence

packages/react/src/rating/index.ts
packages/react/src/rating/rating.tsx
packages/react/src/rating/rating-style.ts
packages/react/src/rating/rating-icons.ts

```text
packages/react/src/rating/index.ts: export { URating } from
packages/react/src/rating/rating.tsx: export const URating = React.forwardRef<URatingHandle, URatingProps>
packages/react/src/rating/rating.tsx: if (enabled && starValue === value) {
packages/react/src/rating/rating.tsx: role: "radio",
packages/react/src/rating/rating.tsx: cancel = false,
packages/react/src/rating/rating.tsx: React.useImperativeHandle(ref, () => ({ getElement: () => rootRef.current }));
packages/react/src/rating/rating.tsx: createPassThrough("rating"
packages/react/src/rating/rating-style.ts: @ultimate/uix-styles/rating
packages/react/src/rating/rating-style.ts: export const ratingStyleModule
packages/react/src/rating/rating-icons.ts: export const RATING_BAN_PATH
packages/themes/src/presets/aura/index.ts:     rating,
packages/react/src/index.ts: export * from "./rating";
packages/react/package.json: "./rating": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.rating → [react.rating](react.rating.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
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
    "behavior": "Bounded React product spec for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/input-switch/ src/select-button/ src/multi-state-checkbox/ src/tri-state-checkbox/ src/rating/ src/slider/ src/knob/",
    "outcome": "not-run",
    "revision": "8d8d52094058993d3ca29823d1c2cd922805570e",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
