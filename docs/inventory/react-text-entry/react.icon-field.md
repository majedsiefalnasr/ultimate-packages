# React UIconField and UInputIcon

ID: react.icon-field

Framework: react; availability: public

## Authored interpretation

Layout wrapper placing an icon beside an input, plus the UInputIcon span.

## Framework surface

UIconField, UInputIcon, UIconFieldProps{iconPosition:left|right (default left in code), className, children} and UInputIconProps{className, children}. UIconField is forwardRef<HTMLDivElement>; UInputIcon is forwardRef<HTMLSpanElement> and always sets aria-hidden="true". iconPosition only toggles the root class u-icon-field-left or u-icon-field-right; the CSS has no rules for those two classes and positions icons through :first-child/:last-child. The doc comment names right as a default while the code defaults to left. CSS selectors for .u-input-text inside the field do not match the u-inputtext class rendered by UInputText. iconFieldStyleModule and inputIconStyleModule (root u-input-icon, empty CSS) are separate registrations; the Aura registry has iconfield but no inputicon key. Exports from @ultimate/react and @ultimate/react/icon-field. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UIconField
@ultimate/react/icon-field#UIconField
@ultimate/react#UInputIcon
@ultimate/react/icon-field#UInputIcon
@ultimate/react#UIconFieldProps
@ultimate/react/icon-field#UIconFieldProps
@ultimate/react#UInputIconProps
@ultimate/react/icon-field#UInputIconProps

## Owned source and evidence

packages/react/src/icon-field/index.ts
packages/react/src/icon-field/icon-field.tsx
packages/react/src/icon-field/icon-field-style.ts

```text
packages/react/src/icon-field/icon-field.tsx: export interface UIconFieldProps
packages/react/src/icon-field/icon-field-style.ts: export const iconFieldStyleModule
packages/react/src/icon-field/icon-field-style.ts: export const inputIconStyleModule
packages/react/src/index.ts: export * from "./icon-field";
packages/react/package.json: "./icon-field": {
```

## Relationships

package.ultimate.react.icon-field → [react.icon-field](react.icon-field.md) (reconciled family alias)
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
    "behavior": "Bounded React product spec for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-text/ src/input-textarea/ src/input-mask/ src/input-otp/ src/password/ src/float-label/ src/icon-field/ src/input-chips/ src/mention/",
    "outcome": "not-run",
    "revision": "c49aa4e6906a9d72a1893b3fc006fce55489d0b7",
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
