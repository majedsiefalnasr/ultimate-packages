# React UAvatar

ID: react.avatar

Framework: react; availability: public

## Authored interpretation

Identity children, image, label or icon with a failed-image fallback to the label or icon, or to a fallback image URL.

## Framework surface

UAvatar and UAvatarProps forward HTMLDivElement ref. Props: label?:string, icon?:string|ReactNode (a string is a CSS class on the icon span), image?:string, imageAlt (default avatar), imageFallback (default 'default'; any other value is the fallback image URL), size:normal|large|xlarge (default normal), shape:square|circle (default square), ariaLabel, onImageError:(SyntheticEvent<HTMLImageElement,Event>)=>void, children, className, onClick, unstyled, pt and ptOptions; the remaining HTMLDivElement attributes spread onto the root. Content order is children, else the image (unless it failed), else label, else icon. A failed image with the default imageFallback is dropped, and with another imageFallback the source switches to that URL; onImageError is always called, and the failed state resets when image changes (ADR-087). onClick adds the u-avatar-clickable class. pt reaches the root, label, icon and image elements through ptm; unstyled drops the Ultimate classes; ptOptions has no visible effect until the global pt source exists (ADR-080); there is no per-instance dt. ariaLabel becomes the root aria-label. avatarStyleModule and AvatarClassesParams own hasImage/clickable/shape/size class resolution; source-only, not public exports. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/avatar. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The CSS is the shared @ultimate/uix-styles/avatar module (ADR-082, ADR-087). Aura key avatar exists and the CSS reads the avatar dt() tokens. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

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
packages/react/src/avatar/avatar.tsx: imageFallback = "default"
packages/react/src/avatar/avatar-style.ts: @ultimate/uix-styles/avatar
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
