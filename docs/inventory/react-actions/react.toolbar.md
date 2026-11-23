# React UToolbar

ID: react.toolbar

Framework: react; availability: public

## Authored interpretation

Toolbar layout grouping default children and independently optional start, center and end content.

## Framework surface

UToolbar and UToolbarProps forward HTMLDivElement ref. Props: ariaLabelledBy, start/center/end (UToolbarRegion: a ReactNode, or a function of the toolbar props that returns one), children:ReactNode, className and style:React.CSSProperties, unstyled:boolean, pt and ptOptions, and the other div attributes, which are merged onto the root. role=toolbar and aria-labelledby are applied to root. children render before slot wrappers; start, center and end wrappers are created when the prop !== undefined (including null), unlike Prime, which always renders three (ADR-089). pt reaches root, start, center and end through ptm; the ref is the root element and the deprecated left and right aliases are not offered (ADR-089). These named props are composition members, not independent exported components. toolbarStyleModule owns root/start/center/end classes and dt(toolbar.*) CSS for padding/background/border/color/radius/gap. No additional owned hook or base factory. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/toolbar. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura key toolbar matches componentName and explicit dt() references. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UToolbar
@ultimate/react#UToolbarProps
@ultimate/react/toolbar#UToolbar
@ultimate/react/toolbar#UToolbarProps

## Owned source and evidence

packages/react/src/toolbar/index.ts
packages/react/src/toolbar/toolbar.tsx
packages/react/src/toolbar/toolbar-style.ts

```text
packages/react/src/toolbar/toolbar.tsx: export interface UToolbarProps
packages/react/src/toolbar/toolbar-style.ts: export const toolbarStyleModule
packages/react/src/index.ts: export * from "./toolbar";
packages/react/src/toolbar/toolbar.tsx: export type UToolbarRegion
packages/react/src/toolbar/toolbar.tsx: ptm("start")
```

## Relationships

package.ultimate.react.toolbar → [react.toolbar](react.toolbar.md) (reconciled family alias)
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
