# React UFloatLabel

ID: react.float-label

Framework: react; availability: public

## Authored interpretation

Wrapper span that hosts a floating label variant around an input.

## Framework surface

UFloatLabel and UFloatLabelProps (extends React.HTMLAttributes<HTMLSpanElement>; variant?:in|on|over (default over), unstyled?, pt?, ptOptions?). forwardRef<HTMLSpanElement>. Renders a span that merges the remaining props, the root class and ptm('root') around children. floatLabelStyleModule root class function yields u-float-label with -over/-on/-in. The CSS is the shared @ultimate/uix-styles/floatlabel module (ADR-082), so it reads the Aura floatlabel tokens and matches Angular and Vue; it keys the float state on the classes the sibling fields emit (u-inputtext, u-textarea, p-filled, p-invalid), so the filled and invalid label states apply to UInputText. React has no per-instance dt (PrimeReact has none). The decisions are in ADR-090. Aura key floatlabel; componentName floatlabel. Exports from @ultimate/react and @ultimate/react/float-label. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The style module imports @ultimate/uix-styles/floatlabel. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UFloatLabel
@ultimate/react/float-label#UFloatLabel
@ultimate/react#UFloatLabelProps
@ultimate/react/float-label#UFloatLabelProps

## Owned source and evidence

packages/react/src/float-label/index.ts
packages/react/src/float-label/float-label.tsx
packages/react/src/float-label/float-label-style.ts

```text
packages/react/src/float-label/float-label.tsx: export interface UFloatLabelProps
packages/react/src/float-label/float-label-style.ts: export const floatLabelStyleModule
packages/react/src/index.ts: export * from "./float-label";
packages/react/package.json: "./float-label": {
```

## Relationships

package.ultimate.react.float-label → [react.float-label](react.float-label.md) (reconciled family alias)
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
