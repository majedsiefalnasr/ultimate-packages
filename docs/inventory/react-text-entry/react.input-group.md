# React UInputGroup and UInputGroupAddon

ID: react.input-group

Framework: react; availability: public

## Authored interpretation

Layout wrapper joining an input with addons, buttons and icons, plus the addon div.

## Framework surface

UInputGroup, UInputGroupAddon, UInputGroupProps and UInputGroupAddonProps{unstyled, pt, ptOptions, className, children and the remaining div attributes}. Both are forwardRef<HTMLDivElement> and render one root div that merges its own class, the remaining props and ptm('root') through createPassThrough and useMergeProps. Root classes are u-input-group and u-input-group-addon. The shared CSS is the @ultimate/uix-styles/inputgroup module (ADR-082), registered by UInputGroup's style module; the addon style module has empty css. componentNames are inputgroup and inputgroupaddon; the Aura registry has inputgroup but no inputgroupaddon key. PrimeReact ships no InputGroup component, only the p-inputgroup CSS pattern, so these components are an Ultimate addition (ADR-094). Exports from @ultimate/react and @ultimate/react/input-group. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputGroup
@ultimate/react/input-group#UInputGroup
@ultimate/react#UInputGroupAddon
@ultimate/react/input-group#UInputGroupAddon
@ultimate/react#UInputGroupProps
@ultimate/react/input-group#UInputGroupProps
@ultimate/react#UInputGroupAddonProps
@ultimate/react/input-group#UInputGroupAddonProps

## Owned source and evidence

packages/react/src/input-group/index.ts
packages/react/src/input-group/input-group.tsx
packages/react/src/input-group/input-group-style.ts

```text
packages/react/src/input-group/input-group.tsx: export interface UInputGroupProps
packages/react/src/input-group/input-group-style.ts: export const inputGroupStyleModule
packages/react/src/input-group/input-group-style.ts: @ultimate/uix-styles/inputgroup"
packages/react/src/index.ts: export * from "./input-group";
packages/react/package.json: "./input-group": {
```

## Relationships

package.ultimate.react.input-group → [react.input-group](react.input-group.md) (reconciled family alias)
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
