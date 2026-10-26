# React UButtonGroup

ID: react.button-group

Framework: react; availability: public

## Authored interpretation

CSS grouping wrapper for adjacent action buttons; children remain independently supplied controls.

## Framework surface

UButtonGroup and UButtonGroupProps forward HTMLSpanElement ref. Props are children?:ReactNode and className?:string only, not arbitrary native span attributes. Renders span role=group. buttonGroupStyleModule owns inline-flex, adjoining border suppression, fixed 6px outer corners and focus stacking. No standalone hook, base factory or compound static members; children are the public composition seam. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/button-group. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. No dedicated button-group key in Aura registry; local CSS composes button classes. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UButtonGroup
@ultimate/react#UButtonGroupProps
@ultimate/react/button-group#UButtonGroup
@ultimate/react/button-group#UButtonGroupProps

## Owned source and evidence

packages/react/src/button-group/index.ts
packages/react/src/button-group/button-group.tsx
packages/react/src/button-group/button-group-style.ts

```text
packages/react/src/button-group/button-group.tsx: export interface UButtonGroupProps
packages/react/src/button-group/button-group-style.ts: export const buttonGroupStyleModule
packages/react/src/index.ts: export * from "./button-group";
```

## Relationships

package.ultimate.react.button-group → [react.button-group](react.button-group.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.button

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Forward-ref component, declared props, local style module and described composition exist in source; not behavioral proof."
  },
  {
    "state": "unavailable",
    "behavior": "Bounded existing product tests aborted before assertions.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/chip/ src/tag/ src/toolbar/",
    "outcome": "unavailable",
    "revision": "c7a8d706e9ebfb22ebf6cc6635a77819cce95576",
    "limitations": "Host ancestor PostCSS configuration requires unavailable postcss-import. No product assertions executed, no browser/build/publish coverage; external configuration and product left unchanged.",
    "output": "Failed to load PostCSS config: Loading PostCSS Plugin failed: Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs; exit 1"
  }
]
```
