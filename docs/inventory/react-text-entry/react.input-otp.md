# React UInputOtp

ID: react.input-otp

Framework: react; availability: public

## Authored interpretation

Fixed-length one-time-code entry made of per-character inputs.

## Framework surface

UInputOtp, UInputOtpProps and UInputOtpChangeEvent{originalEvent,value}. Props: value default empty string, length default 4, mask, integerOnly, disabled, readOnly, invalid, onChange(event), className; no native spread. forwardRef<HTMLDivElement>: the ref targets the root div, not an input. Renders length native inputs with aria-label "Character N" (Character 1..length); mask switches type to password, integerOnly sets inputMode numeric. Each input has a no-op React onChange (() => {}); state flows through onInput, key and paste handlers (paste splits across slots). Tokens are derived from value. Module helpers findNextInput/findPrevInput are not exported. inputOtpStyleModule: root u-inputotp u-component and an input class function (u-inputotp-input, -invalid). Aura key inputotp. Exports from @ultimate/react and @ultimate/react/input-otp. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputOtp
@ultimate/react/input-otp#UInputOtp
@ultimate/react#UInputOtpProps
@ultimate/react/input-otp#UInputOtpProps
@ultimate/react#UInputOtpChangeEvent
@ultimate/react/input-otp#UInputOtpChangeEvent

## Owned source and evidence

packages/react/src/input-otp/index.ts
packages/react/src/input-otp/input-otp.tsx
packages/react/src/input-otp/input-otp-style.ts

```text
packages/react/src/input-otp/input-otp.tsx: export interface UInputOtpProps
packages/react/src/input-otp/input-otp-style.ts: export const inputOtpStyleModule
packages/react/src/index.ts: export * from "./input-otp";
packages/react/package.json: "./input-otp": {
```

## Relationships

package.ultimate.react.input-otp → [react.input-otp](react.input-otp.md) (reconciled family alias)
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
