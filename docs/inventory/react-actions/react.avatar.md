# React UAvatar

ID: react.avatar

Framework: react; availability: public

## Authored interpretation

Identity image, label or icon with local image-error fallback state.

## Framework surface

UAvatar and UAvatarProps forward HTMLDivElement ref. Props: label?:string, icon?:ReactNode, image?:string, size:normal|large|xlarge (default normal), shape:square|circle (default square), ariaLabel, onImageError:(SyntheticEvent<HTMLImageElement,Event>)=>void and className. No native attribute spread or children contract. imageFailed state hides failed image and prefers label then icon; changing image does not reset that state. ariaLabel becomes root aria-label and image alt. avatarStyleModule and AvatarClassesParams own hasImage/imageFailed/shape/size class resolution, local dimensions and circle styling; source-only, not public exports. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/avatar. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura key avatar exists; local CSS uses fixed dimensions, not avatar dt() tokens. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UAvatar
@ultimate/react#UAvatarProps
@ultimate/react/avatar#UAvatar
@ultimate/react/avatar#UAvatarProps

## Owned source and evidence

packages/react/src/avatar/index.ts
packages/react/src/avatar/avatar.tsx
packages/react/src/avatar/avatar-style.ts

```text
packages/react/src/avatar/avatar.tsx: export interface UAvatarProps
packages/react/src/avatar/avatar-style.ts: export const avatarStyleModule
packages/react/src/index.ts: export * from "./avatar";
```

## Relationships

package.ultimate.react.avatar → [react.avatar](react.avatar.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
