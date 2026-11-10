# React UMegaMenu

ID: react.mega-menu

Framework: react; availability: public

## Authored interpretation

Horizontal command bar with multi-column grouped overlays.

## Framework surface

UMegaMenu forwards an HTMLElement ref to nav. UMegaMenuProps: model defaults [], ariaLabel, onItemSelect({originalEvent,item}), className. Public UMegaMenuItem extends Omit<UMenuItem,"items"> with items?: UMegaMenuGroup[][]; public UMegaMenuGroup extends the same omission with flat items?: UMenuItem[]. UMegaMenuColumnGroup and UMegaMenuColumnGroupProps are source-only, not barrel exports. Their props are group, cx(key,params?) and onItemSelect. Root openItem tracks object identity; hover opens, click toggles groups, leaf command then callback selects, and column selection closes. Root ArrowRight/Left wraps enabled items; Enter/Space opens then an effect focuses the first column leaf; Escape closes/refocuses from bubbling descendants. Column ArrowDown/Up wraps enabled leaves, leaving Escape to root. Rendering uses menubar/menu/menuitem roles, aria-haspopup/expanded/disabled and in-tree CSS overlays, not Portal. Every enabled root/leaf anchor has tabIndex=0, not a single roving tab stop. Local CSS supplies absolute overlay placement and flex columns. megaMenuStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/mega-menu expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers megamenu: megaMenu; its preset key differs from componentName "mega-menu"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UMegaMenu
@ultimate/react/mega-menu#UMegaMenu
@ultimate/react#UMegaMenuProps
@ultimate/react/mega-menu#UMegaMenuProps
@ultimate/react#UMegaMenuItem
@ultimate/react/mega-menu#UMegaMenuItem
@ultimate/react#UMegaMenuGroup
@ultimate/react/mega-menu#UMegaMenuGroup

## Owned source and evidence

packages/react/src/mega-menu/index.ts
packages/react/src/mega-menu/mega-menu-column.tsx
packages/react/src/mega-menu/mega-menu-item.ts
packages/react/src/mega-menu/mega-menu-style.ts
packages/react/src/mega-menu/mega-menu.tsx

```text
packages/react/src/mega-menu/index.ts: export { UMegaMenu } from "./mega-menu";
packages/react/src/mega-menu/mega-menu.tsx: componentName: "mega-menu"
packages/react/src/mega-menu/mega-menu-style.ts: export const megaMenuStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./mega-menu";
packages/react/package.json: "./mega-menu": {
packages/themes/src/presets/aura/index.ts:     megamenu: megaMenu,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/mega-menu/mega-menu-column.tsx: export interface UMegaMenuColumnGroupProps {
packages/react/src/mega-menu/mega-menu-column.tsx: export const UMegaMenuColumnGroup: React.FC<UMegaMenuColumnGroupProps> = ({
packages/react/src/mega-menu/mega-menu-item.ts: export interface UMegaMenuGroup extends Omit<UMenuItem, "items"> {
packages/react/src/mega-menu/mega-menu-item.ts: export interface UMegaMenuItem extends Omit<UMenuItem, "items"> {
packages/react/src/mega-menu/mega-menu.tsx: export interface UMegaMenuProps {
packages/react/src/mega-menu/mega-menu.tsx: export const UMegaMenu = React.forwardRef<HTMLElement, UMegaMenuProps>(function UMegaMenu(
packages/react/src/mega-menu/mega-menu.tsx: const [openItem, setOpenItem] = React.useState<UMegaMenuItem | null>(null);
packages/react/src/mega-menu/mega-menu-column.tsx: case "ArrowDown":
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.mega-menu → [react.mega-menu](react.mega-menu.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.menu

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "unavailable",
    "behavior": "Bounded existing React product specifications were attempted, but the runner aborted before assertions.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/menu/ src/context-menu/ src/breadcrumb/ src/mega-menu/ src/menubar/ src/panel-menu/ src/tiered-menu/ src/dock/ src/speed-dial/ --maxWorkers=1 --no-file-parallelism",
    "outcome": "unavailable",
    "revision": "af79b2ec8b18681f0163d9ede0beba387c462258",
    "output": "Vitest 2.1.9 exited 1: Failed to load PostCSS config; Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs",
    "limitations": "Node v24.22.2 and pnpm 9.6.0; ancestor host PostCSS configuration prevents execution. No product assertions passed; no host or product repair attempted."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
