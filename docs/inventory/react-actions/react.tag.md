# React UTag

ID: react.tag

Framework: react; availability: public

## Authored interpretation

Non-form status/category label with severity classes, optional icon and children/value content.

## Framework surface

UTag and UTagProps forward HTMLSpanElement ref. Props: severity:success|secondary|info|warn|danger|contrast, value?:string, icon?:ReactNode, rounded?:boolean (default false), children?:ReactNode, className. Not arbitrary span attributes or a form control. children ?? value supplies label content; icon renders separately. tagStyleModule owns local severity/rounded class resolution and --u-tag-* color fallback variables; no custom public hook, factory or compound component members. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/tag. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura key tag exists; local CSS uses --u-tag-bg/severity-bg fallbacks, not automatically equivalent to the token contract. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UTag
@ultimate/react#UTagProps
@ultimate/react/tag#UTag
@ultimate/react/tag#UTagProps

## Owned source and evidence

packages/react/src/tag/index.ts
packages/react/src/tag/tag.tsx
packages/react/src/tag/tag-style.ts

```text
packages/react/src/tag/tag.tsx: export interface UTagProps
packages/react/src/tag/tag-style.ts: export const tagStyleModule
packages/react/src/index.ts: export * from "./tag";
```

## Relationships

package.ultimate.react.tag → [react.tag](react.tag.md) (reconciled family alias)
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
