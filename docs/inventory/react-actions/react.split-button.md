# React USplitButton

ID: react.split-button

Framework: react; availability: public

## Authored interpretation

Primary command with a secondary popup menu, composing UButton and UMenu rather than owning a new menu implementation.

## Framework surface

USplitButton and USplitButtonProps forward HTMLDivElement ref. Props: model?:UMenuItem[] (default []), label, icon:ReactNode, iconPos:left|right|top|bottom, severity:secondary|success|info|warning|danger|help|contrast, text, outlined, size:small|large, disabled, onClick:(React.SyntheticEvent)=>void, onShow/onHide:()=>void, className. No arbitrary native div props or children contract. Private handleDefaultClick hides UMenu then invokes onClick; handleDropdownClick invokes UMenuHandle.toggle(event). Two UButton children share modifiers; dropdown has aria-haspopup=menu. UMenu owns overlay behavior and UMenuItem/UMenuHandle contracts, not this record. splitButtonStyleModule owns local fixed-radius joined-button CSS. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/split-button. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura registry uses splitbutton while componentName is split-button; local CSS has no dt() calls. Registry existence is not proof of that hyphenated registration resolving tokens. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#USplitButton
@ultimate/react#USplitButtonProps
@ultimate/react/split-button#USplitButton
@ultimate/react/split-button#USplitButtonProps

## Owned source and evidence

packages/react/src/split-button/index.ts
packages/react/src/split-button/split-button.tsx
packages/react/src/split-button/split-button-style.ts

```text
packages/react/src/split-button/split-button.tsx: export interface USplitButtonProps
packages/react/src/split-button/split-button-style.ts: export const splitButtonStyleModule
packages/react/src/index.ts: export * from "./split-button";
```

## Relationships

package.ultimate.react.split-button → [react.split-button](react.split-button.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.button
package.ultimate.react.menu (pending cross-batch)

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
