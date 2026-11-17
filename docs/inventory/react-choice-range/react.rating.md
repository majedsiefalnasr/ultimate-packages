# React URating

ID: react.rating

Framework: react; availability: public

## Authored interpretation

Controlled star rating row with click and arrow-key selection.

## Framework surface

URating is a plain function component, not a forwardRef. URatingProps requires value:number|null and onChange and adds stars (default 5), readOnly, disabled, className and aria-labelledby; URatingChangeEvent is {originalEvent, value:number|null}. There is no name, id or cancel prop and no ref prop. State is fully controlled plus one internal focusedIndex state: rate (skipped unless enabled = !disabled && !readOnly) sets next to null when the clicked star equals value, so clicking the active star toggles the rating off, then calls onChange. Keyboard per star: Enter and Space rate that star; ArrowLeft/ArrowUp rate (value ?? 0) - 1, wrapping to stars below 1; ArrowRight/ArrowDown rate (value ?? 0) + 1, wrapping to 1 above stars; arrow keys therefore change the value, not only focus. Markup: a root div with role="group" and aria-labelledby (cx root with disabled: !enabled), then one div per star with role="radio", aria-checked={value === starValue}, aria-label "1 star" or "N stars", tabIndex 0 when enabled else -1 (every star is tabbable), click, key, focus and blur handlers, and an inline svg with className onIcon or offIcon, aria-hidden and a data-testid of star-on-N or star-off-N that ships in production markup. ratingStyleModule is exported with the RatingClassesParams and RatingOptionClassesParams interfaces; classes root, option, onIcon, offIcon. componentName rating matches the Aura components registry key rating. The style file comment mentions @ultimate/uix-styles but nothing is imported. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/rating; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#URating
@ultimate/react/rating#URating
@ultimate/react#URatingProps
@ultimate/react/rating#URatingProps
@ultimate/react#URatingChangeEvent
@ultimate/react/rating#URatingChangeEvent

## Owned source and evidence

packages/react/src/rating/index.ts
packages/react/src/rating/rating.tsx
packages/react/src/rating/rating-style.ts

```text
packages/react/src/rating/index.ts: export { URating } from
packages/react/src/rating/rating.tsx: export function URating({
packages/react/src/rating/rating.tsx: const next = value === newValue ? null : newValue;
packages/react/src/rating/rating.tsx: role="radio"
packages/react/src/rating/rating.tsx: data-testid={`star-on-${starValue}`}
packages/react/src/rating/rating-style.ts: export interface RatingClassesParams
packages/react/src/rating/rating-style.ts: export interface RatingOptionClassesParams
packages/react/src/rating/rating-style.ts: export const ratingStyleModule
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
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
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
