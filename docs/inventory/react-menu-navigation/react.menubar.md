# React UMenubar

ID: react.menubar

Framework: react; availability: public

## Authored interpretation

Horizontal command bar with recursive positioned submenus.

## Framework surface

UMenubar forwards an HTMLElement ref to nav; UMenubarProps: model defaults [], ariaLabel, onItemSelect({originalEvent,item}), className. UMenuItem is a type-only dependency, not UMenu composition. UMenubarSub and UMenubarSubProps are source-only, not barrel exports. Props: items, root, cx(key,params?), onItemSelect. Each recursive level stores openItem and focusFirstOnOpen; pointer hover opens groups, click toggles groups or calls command then onItemSelect for leaves. Root ArrowRight/Left and submenu ArrowDown/Up wrap enabled siblings; Enter/Space opens groups and an effect focuses the first child; Escape closes the innermost open level and refocuses its trigger. A direct-child ITEM_LINK_SELECTOR limits event ownership; list-level handlers receive bubbling descendants. Separators precede visible filtering. Nested lists always mount and CSS display/open selectors control visibility; enabled anchors each have tabIndex=0. Roles menubar/menu/menuitem and aria-haspopup/expanded/disabled are present; no Portal, outside-click dismissal or global Escape hook. menubarStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/menubar expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers menubar; its preset key matches componentName "menubar"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UMenubar
@ultimate/react/menubar#UMenubar
@ultimate/react#UMenubarProps
@ultimate/react/menubar#UMenubarProps

## Owned source and evidence

packages/react/src/menubar/index.ts
packages/react/src/menubar/menubar-style.ts
packages/react/src/menubar/menubar-sub.tsx
packages/react/src/menubar/menubar.tsx

```text
packages/react/src/menubar/index.ts: export { UMenubar } from "./menubar";
packages/react/src/menubar/menubar.tsx: componentName: "menubar"
packages/react/src/menubar/menubar-style.ts: export const menubarStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./menubar";
packages/react/package.json: "./menubar": {
packages/themes/src/presets/aura/index.ts:     menubar,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/menubar/menubar-sub.tsx: export interface UMenubarSubProps {
packages/react/src/menubar/menubar-sub.tsx: export const UMenubarSub: React.FC<UMenubarSubProps> = ({ items, root, cx, onItemSelect }) => {
packages/react/src/menubar/menubar.tsx: export interface UMenubarProps {
packages/react/src/menubar/menubar.tsx: export const UMenubar = React.forwardRef<HTMLElement, UMenubarProps>(function UMenubar(
packages/react/src/menubar/menubar-sub.tsx: const forwardKey = root ? "ArrowRight" : "ArrowDown";
packages/react/src/menubar/menubar-sub.tsx: role={root ? "menubar" : "menu"}
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.menubar → [react.menubar](react.menubar.md) (reconciled family alias)
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
