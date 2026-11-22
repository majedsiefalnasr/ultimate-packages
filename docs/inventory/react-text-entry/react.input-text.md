# React UInputText

ID: react.input-text

Framework: react; availability: public

## Authored interpretation

Native text input with value-derived filled state, invalid/variant/size/fluid classes, pass-through and unstyled; controlled or uncontrolled.

## Framework surface

UInputText and UInputTextProps expose a forwarded HTMLInputElement ref plus an inputRef prop; both are merged by an internal setRef (forwardRef callback or object, then inputRef). UInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, value|onChange|size> and adds value?:string, onChange?:ChangeEventHandler, invalid, variant:filled|outlined, size:small|large (the visual size, so the native size attribute is reachable only through pt.root), fluid, inputRef, unstyled, pt and ptOptions. The component renders a single native input with type="text" (overridable by the rest props), aria-invalid when invalid, and merges its own props, the rest, the root class and ptm('root') through useMergeProps. p-filled follows the value: for a controlled value it is the value being non-empty, for an uncontrolled input it is state seeded from defaultValue and updated on change. Root classes: u-inputtext u-component, p-filled, p-invalid, p-variant-filled, u-inputtext-fluid, u-inputtext-sm and u-inputtext-lg; variant=outlined has no distinct class, and no disabled class is emitted (the shared CSS styles :disabled). useComponentBase receives componentName inputtext (the Aura registry key), the style module and unstyled, so unstyled drops the Ultimate classes. The style module's CSS is the shared @ultimate/uix-styles/inputtext module (ADR-082). keyfilter, tooltip and validatePattern are not props: useKeyFilter and UTooltip are separate composition (ADR-086, rows 12 to 14 are I). React has no per-instance dt, as PrimeReact. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/input-text. useComponentBase and createPassThrough from @ultimate/react-core own cx class resolution, style registration and ptm; those are external foundation records, not duplicated here. The manifest advertises dist entry/type paths; this does not prove a built or published package.

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
packages/react/src/index.ts: export * from "./input-text";
packages/react/package.json: "./input-text": {
packages/react/src/input-text/input-text-style.ts: "p-filled": params.filled,
packages/react/src/input-text/input-text-style.ts: import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";
packages/react/src/input-text/input-text.tsx: componentName: "inputtext",
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
