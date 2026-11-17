# React UTieredMenu

ID: react.tiered-menu

Framework: react; availability: public

## Authored interpretation

Vertical recursive menu, inline or imperatively toggled popup.

## Framework surface

UTieredMenu forwards UTieredMenuHandle with toggle(), show(), hide(). UTieredMenuProps: model defaults [], popup=false, onItemSelect({originalEvent,item}), onShow, onHide, className. Visibility initializes !popup; show/hide invoke callbacks inside guarded state updaters. Popup hidden returns null; document keydown Escape is registered only while popup and visible. Leaf selection calls onItemSelect then hides popup. UTieredMenuSub and UTieredMenuSubProps are source-only, not barrel exports: items, root, cx(key,params?), onItemSelect. Each recursive level tracks openItem; ArrowDown/Up wraps enabled siblings at every depth, ArrowRight/Enter/Space opens and defers first-child focus, Escape closes/refocuses the innermost group via bubbling. Hover opens; groups toggle on click; leaves run command then selection callback. Separators precede visible filtering. All enabled anchors have tabIndex=0; menu/menuitem roles and aria-haspopup/expanded/disabled are present. No Portal, target positioning, z-index hook or outside-click listener; popup local CSS stays at top/left -9999px. Nested menus always mount with CSS controlling display. tieredMenuStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/tiered-menu expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers tieredmenu: tieredMenu; its preset key differs from componentName "tiered-menu"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UTieredMenu
@ultimate/react/tiered-menu#UTieredMenu
@ultimate/react#UTieredMenuProps
@ultimate/react/tiered-menu#UTieredMenuProps
@ultimate/react#UTieredMenuHandle
@ultimate/react/tiered-menu#UTieredMenuHandle

## Owned source and evidence

packages/react/src/tiered-menu/index.ts
packages/react/src/tiered-menu/tiered-menu-style.ts
packages/react/src/tiered-menu/tiered-menu-sub.tsx
packages/react/src/tiered-menu/tiered-menu.tsx

```text
packages/react/src/tiered-menu/index.ts: export { UTieredMenu } from "./tiered-menu";
packages/react/src/tiered-menu/tiered-menu.tsx: componentName: "tiered-menu"
packages/react/src/tiered-menu/tiered-menu-style.ts: export const tieredMenuStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./tiered-menu";
packages/react/package.json: "./tiered-menu": {
packages/themes/src/presets/aura/index.ts:     tieredmenu: tieredMenu,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/tiered-menu/tiered-menu-sub.tsx: export interface UTieredMenuSubProps {
packages/react/src/tiered-menu/tiered-menu-sub.tsx: export const UTieredMenuSub: React.FC<UTieredMenuSubProps> = ({
packages/react/src/tiered-menu/tiered-menu.tsx: export interface UTieredMenuProps {
packages/react/src/tiered-menu/tiered-menu.tsx: export interface UTieredMenuHandle {
packages/react/src/tiered-menu/tiered-menu.tsx: export const UTieredMenu = React.forwardRef<UTieredMenuHandle, UTieredMenuProps>(
packages/react/src/tiered-menu/tiered-menu.tsx: document.addEventListener("keydown", onEscape);
packages/react/src/tiered-menu/tiered-menu-style.ts: .u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px; }
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.tiered-menu → [react.tiered-menu](react.tiered-menu.md) (reconciled family alias)
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
