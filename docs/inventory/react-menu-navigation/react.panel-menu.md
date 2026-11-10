# React UPanelMenu

ID: react.panel-menu

Framework: react; availability: public

## Authored interpretation

Recursive expand-in-place accordion navigation.

## Framework surface

UPanelMenu forwards HTMLDivElement; UPanelMenuProps: model defaults [], multiple=false, onItemSelect({originalEvent,item}), className. UPanelMenuList and UPanelMenuListProps are source-only, not barrel exports. Props: items, expandedItems: Set<UMenuItem>, multiple, cx(key,params?), onToggle(item,siblings), onItemSelect. Root replaces an identity-keyed Set<UMenuItem>; single mode removes sibling entries before adding the current item, not all descendants. Recursive lists share expandedItems and callbacks; multiple is threaded through but exclusivity is implemented at root. Groups toggle without leaf callbacks; leaves call command then onItemSelect. ArrowDown/Up wraps visible enabled siblings; Enter/Space toggles groups without moving focus; no Escape handler. Lists have role tree and items treeitem with aria-expanded; nested lists mount only when expanded. Source observation: every list including the root uses u-panelmenu-submenu whose local CSS is display: none; only an expanded parent item selector displays a child list. No rendered visibility success is claimed or repaired. panelMenuStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/panel-menu expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers panelmenu: panelMenu; its preset key differs from componentName "panel-menu"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UPanelMenu
@ultimate/react/panel-menu#UPanelMenu
@ultimate/react#UPanelMenuProps
@ultimate/react/panel-menu#UPanelMenuProps

## Owned source and evidence

packages/react/src/panel-menu/index.ts
packages/react/src/panel-menu/panel-menu-list.tsx
packages/react/src/panel-menu/panel-menu-style.ts
packages/react/src/panel-menu/panel-menu.tsx

```text
packages/react/src/panel-menu/index.ts: export { UPanelMenu } from "./panel-menu";
packages/react/src/panel-menu/panel-menu.tsx: componentName: "panel-menu"
packages/react/src/panel-menu/panel-menu-style.ts: export const panelMenuStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./panel-menu";
packages/react/package.json: "./panel-menu": {
packages/themes/src/presets/aura/index.ts:     panelmenu: panelMenu,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/panel-menu/panel-menu-list.tsx: export interface UPanelMenuListProps {
packages/react/src/panel-menu/panel-menu-list.tsx: export const UPanelMenuList: React.FC<UPanelMenuListProps> = ({
packages/react/src/panel-menu/panel-menu.tsx: export interface UPanelMenuProps {
packages/react/src/panel-menu/panel-menu.tsx: export const UPanelMenu = React.forwardRef<HTMLDivElement, UPanelMenuProps>(function UPanelMenu(
packages/react/src/panel-menu/panel-menu.tsx: const [expandedItems, setExpandedItems] = React.useState<Set<UMenuItem>>(new Set());
packages/react/src/panel-menu/panel-menu-list.tsx: <ul ref={listRef} className={cx("submenu")} role="tree" onKeyDown={onKeyDown}>
packages/react/src/panel-menu/panel-menu-style.ts: .u-panelmenu-submenu { margin: 0; padding-left: 1.25rem; list-style: none; display: none; }
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.panel-menu → [react.panel-menu](react.panel-menu.md) (reconciled family alias)
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
