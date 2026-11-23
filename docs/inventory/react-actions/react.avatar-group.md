# React UAvatarGroup

ID: react.avatar-group

Framework: react; availability: public

## Authored interpretation

Accessible group wrapper whose shared CSS overlaps child avatars with logical, size-specific offsets; does not clone children or provide avatar context.

## Framework surface

UAvatarGroup and UAvatarGroupProps forward HTMLSpanElement ref. children, className, unstyled, pt and ptOptions are declared, and the remaining HTMLSpanElement attributes spread onto the root (role is not a prop). span role=group wraps children unchanged, and pt.root reaches it through ptm. avatarGroupStyleModule supplies the root class resolver; flex layout and the overlap come from the shared CSS, with logical margin-inline-start offsets from the avatar.group tokens (ADR-087). It has no compound member, custom public hook or base factory. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/avatar-group. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The CSS is the shared @ultimate/uix-styles/avatar module (ADR-082, ADR-087). No dedicated avatar-group key in Aura registry; the offsets use the avatar namespace tokens. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

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
packages/react/src/avatar-group/avatar-group.tsx: ptm("root")
packages/react/src/avatar-group/avatar-group-style.ts: @ultimate/uix-styles/avatar
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
