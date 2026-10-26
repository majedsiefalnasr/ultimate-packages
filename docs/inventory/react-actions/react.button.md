# React UButton

ID: react.button

Framework: react; availability: public

## Authored interpretation

Native action button with loading/disabled gating, icons, badge and optional tooltip. Reuses the pilot react.button identity rather than introducing a second product.

## Framework surface

UButton and UButtonProps expose a forwarded HTMLButtonElement ref. UButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">: native events, children and attributes remain available. Adds label:string, icon/loadingIcon:ReactNode, iconPos:left|right|top|bottom, loading/disabled, severity:secondary|success|info|warning|danger|help|contrast, size:small|large, text/raised/rounded/outlined/link/plain, badge/badgeClassName, visible, tooltip and tooltipOptions:Record<string,unknown>. visible=false returns null; loading disables the button. Label plus badge supplies aria-label when label exists, even over an explicit aria-label; type defaults to button but rest attributes follow it. Internal setRef/renderIcon and buttonStyleModule belong here. ButtonClassesParams is an owned source-only class resolver contract for hasIcon/label/loading/severity/raised/rounded/text/outlined/link/plain/size/iconPos; not a barrel export. USpinnerIcon and UTooltip are dependencies, not owned products. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/button. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura registry key button exists; this local structural CSS has no dt() token references. BUTTON_METADATA names this React sourcePath.

## Public exports

@ultimate/react#UButton
@ultimate/react#UButtonProps
@ultimate/react/button#UButton
@ultimate/react/button#UButtonProps

## Owned source and evidence

packages/react/src/button/index.ts
packages/react/src/button/button.tsx
packages/react/src/button/button-style.ts

```text
packages/react/src/button/button.tsx: export interface UButtonProps
packages/react/src/button/button-style.ts: export const buttonStyleModule
packages/react/src/index.ts: export * from "./button";
```

## Relationships

package.ultimate.react.button → [react.button](react.button.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)
package.ultimate.react.tooltip (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
