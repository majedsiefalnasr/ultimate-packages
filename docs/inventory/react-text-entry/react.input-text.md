# React UInputText

ID: react.input-text

Framework: react; availability: public

## Authored interpretation

Controlled native text input with invalid/variant/fluid state classes.

## Framework surface

UInputText and UInputTextProps expose a forwarded HTMLInputElement ref plus an inputRef prop; both are merged by an internal setRef (forwardRef callback or object, then inputRef). UInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, value|onChange|size> and adds value?:string, onChange?:ChangeEventHandler, invalid, variant:filled|outlined, fluid and inputRef. The component renders a single native input with type="text", disabled, aria-invalid when invalid, and className = cx(root with invalid/variantFilled/fluid/disabled) plus className; the rest spread comes last, so rest can override type and other attributes. InputTextClassesParams declares a filled param that the component never passes: the u-inputtext-filled class is never set by the component, and variant=outlined has no distinct class (only variant=filled adds u-inputtext-variant-filled). inputTextStyleModule defines classes u-inputtext/u-component, -disabled, -filled, -invalid, -variant-filled, -fluid and --u-inputtext-* CSS variables. componentName is input-text while the Aura registry key is inputtext, so registry existence is not proof of token resolution. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/input-text. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputText
@ultimate/react/input-text#UInputText
@ultimate/react#UInputTextProps
@ultimate/react/input-text#UInputTextProps

## Owned source and evidence

packages/react/src/input-text/index.ts
packages/react/src/input-text/input-text.tsx
packages/react/src/input-text/input-text-style.ts

```text
packages/react/src/input-text/input-text.tsx: export interface UInputTextProps
packages/react/src/input-text/input-text-style.ts: export const inputTextStyleModule
packages/react/src/input-text/input-text-style.ts: filled?: boolean
packages/react/src/index.ts: export * from "./input-text";
packages/react/package.json: "./input-text": {
```

## Relationships

package.ultimate.react.input-text → [react.input-text](react.input-text.md) (reconciled family alias)
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
