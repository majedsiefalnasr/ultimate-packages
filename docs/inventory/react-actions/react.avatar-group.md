# React UAvatarGroup

ID: react.avatar-group

Framework: react; availability: public

## Authored interpretation

Accessible group wrapper whose CSS overlaps child avatars; does not clone children or provide avatar context.

## Framework surface

UAvatarGroup and UAvatarGroupProps forward HTMLSpanElement ref. children?:ReactNode and className?:string are the complete declared props; no native attribute spread. span role=group wraps children unchanged. avatarGroupStyleModule owns flex layout, negative margin overlap and --u-avatar-group-border-color with #fff fallback. It has no compound member, custom public hook or base factory. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/avatar-group. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. No dedicated avatar-group key in Aura registry; avatar overlap uses local CSS. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UAvatarGroup
@ultimate/react#UAvatarGroupProps
@ultimate/react/avatar-group#UAvatarGroup
@ultimate/react/avatar-group#UAvatarGroupProps

## Owned source and evidence

packages/react/src/avatar-group/index.ts
packages/react/src/avatar-group/avatar-group.tsx
packages/react/src/avatar-group/avatar-group-style.ts

```text
packages/react/src/avatar-group/avatar-group.tsx: export interface UAvatarGroupProps
packages/react/src/avatar-group/avatar-group-style.ts: export const avatarGroupStyleModule
packages/react/src/index.ts: export * from "./avatar-group";
```

## Relationships

package.ultimate.react.avatar-group → [react.avatar-group](react.avatar-group.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.avatar

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
