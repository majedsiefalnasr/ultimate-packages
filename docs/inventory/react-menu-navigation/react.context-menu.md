# React UContextMenu

ID: react.context-menu

Framework: react; availability: public

## Authored interpretation

Flat right-click command menu with local or document-wide activation.

## Framework surface

UContextMenu forwards UContextMenuHandle exposing show(React.MouseEvent) and hide(). UContextMenuProps requires model: UContextMenuItem[] and optionally global=false, onShow, onHide, onItemSelect and children. UContextMenuItem has optional label, ReactNode icon, command({originalEvent,item}), disabled, separator, visible and url; no nested items. Local mode wraps children in a div with onContextMenu; global mode binds document contextmenu and does not render children. show prevents default/propagation, resets focusedIndex, sets visible and calls onShow, then schedules pageX/pageY positioning in a microtask; the position function adds one pixel, clamps after viewport overflow and sets menu z-index only if its ref exists. Portal rendering and this scheduling are implementation evidence, not proof positioning succeeds. useEventListener binds outside clicks, useResizeListener dismisses on resize and useGlobalEscapeKey/useDisplayOrder/ESCAPE_PRIORITIES handles Escape. Cleanup unbinds and calls clearZIndex. The list has role menu; anchors tabIndex=-1, hover focus bookkeeping and aria-disabled; there is no list keyboard-navigation handler. Separator handling precedes visible filtering. Selection runs item.command, onItemSelect then hide/onHide. contextMenuStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/context-menu expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers contextmenu: contextMenu; its preset key differs from componentName "context-menu"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UContextMenu
@ultimate/react/context-menu#UContextMenu
@ultimate/react#UContextMenuProps
@ultimate/react/context-menu#UContextMenuProps
@ultimate/react#UContextMenuItem
@ultimate/react/context-menu#UContextMenuItem
@ultimate/react#UContextMenuHandle
@ultimate/react/context-menu#UContextMenuHandle

## Owned source and evidence

packages/react/src/context-menu/context-menu-style.ts
packages/react/src/context-menu/context-menu.tsx
packages/react/src/context-menu/index.ts

```text
packages/react/src/context-menu/index.ts: export { UContextMenu } from "./context-menu";
packages/react/src/context-menu/context-menu.tsx: componentName: "context-menu"
packages/react/src/context-menu/context-menu-style.ts: export const contextMenuStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./context-menu";
packages/react/package.json: "./context-menu": {
packages/themes/src/presets/aura/index.ts:     contextmenu: contextMenu,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/context-menu/context-menu.tsx: export interface UContextMenuItem {
packages/react/src/context-menu/context-menu.tsx: export interface UContextMenuProps {
packages/react/src/context-menu/context-menu.tsx: export interface UContextMenuHandle {
packages/react/src/context-menu/context-menu.tsx: export const UContextMenu = React.forwardRef<UContextMenuHandle, UContextMenuProps>(
packages/react/src/context-menu/context-menu.tsx: Promise.resolve().then(() => position(pageX, pageY));
packages/react/src/context-menu/context-menu.tsx: const [bindResize, unbindResize] = useResizeListener({ listener: () => hide(), when: visible });
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.context-menu → [react.context-menu](react.context-menu.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.hooks (pending cross-batch)

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
