# React UPassword

ID: react.password

Framework: react; availability: public

## Authored interpretation

Password input with optional strength feedback overlay and visibility toggle.

## Framework surface

UPassword and UPasswordProps; forwarded HTMLInputElement ref plus inputRef. UPasswordProps extends Omit<InputHTMLAttributes<HTMLInputElement>, value|onChange|type|size> and adds value, onChange, feedback default true, toggleMask default false, promptLabel/weakLabel/mediumLabel/strongLabel, mediumRegex, strongRegex, fluid, className, inputRef, onFocus, onBlur. There are no invalid or variant props. className lands on the root div, not the input; the rest spread follows the explicit handlers on the input and can override them. The strength overlay is an inline absolutely-positioned div (no portal) and uses useDisplayOrder and useGlobalEscapeKey with ESCAPE_PRIORITIES.DIALOG from @ultimate/react-core while the overlay is visible and feedback is on. An onKeyUp handler computes strength 0..3 from the regexes. The toggleMask icons are inline SVG role=button with aria-label Show Password/Hide Password and only onClick, with no tabIndex or key handler, so they are not keyboard reachable. passwordStyleModule defines maskIcon, unmaskIcon and clearIcon classes: clearIcon is defined but never used by the component. PasswordClassesParams carries filled, disabled, fluid and strength; unlike input-text and input-textarea, the component does pass filled (value.length > 0) to the root class. Aura key password. Exports from @ultimate/react and @ultimate/react/password. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UPassword
@ultimate/react/password#UPassword
@ultimate/react#UPasswordProps
@ultimate/react/password#UPasswordProps

## Owned source and evidence

packages/react/src/password/index.ts
packages/react/src/password/password.tsx
packages/react/src/password/password-style.ts

```text
packages/react/src/password/password.tsx: export interface UPasswordProps
packages/react/src/password/password-style.ts: export const passwordStyleModule
packages/react/src/index.ts: export * from "./password";
packages/react/package.json: "./password": {
```

## Relationships

package.ultimate.react.password → [react.password](react.password.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)

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
