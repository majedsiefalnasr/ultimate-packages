# React UMenu

ID: react.menu

Framework: react; availability: public

## Authored interpretation

Flat inline or imperative popup command and navigation list.

## Framework surface

UMenu forwards UMenuHandle with toggle(event), show(event), hide(event?). UMenuProps requires model: UMenuItem[]; optional popup=false, popupAlignment (accepted but unread), id, ariaLabel, ariaLabelledBy, className, style, baseZIndex, appendTo, closeOnEscape=true, onShow and onHide. UMenuItem has optional label, ReactNode icon, command({originalEvent,item}), disabled, separator, visible, url and recursive items; this renderer remains flat and does not consume items. The list has role menu, tabIndex=0 and aria-activedescendant, clamps ArrowUp/Down, supports Home/End and Enter/Space invocation, Tab dismissal and Alt+ArrowUp focus return. Popup uses Portal, useOverlayListener, useGlobalEscapeKey, useDisplayOrder/ESCAPE_PRIORITIES, useZIndex and useMotion; useUpdateEffect and useUnmountEffect manage lifecycle. onShow runs in show; onHide runs in onAfterLeave, after clearing z-index and listeners. containerVisible retains mounting through leave; portalReady resets for reopening. Inline toggle is guarded, but show/hide are not popup-guarded. Local popup CSS starts at top/left -9999px; no target positioning measurement is implemented. MENU_METADATA references this React source and models shown/hidden callbacks; metadata is not runtime integration. menuStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/menu expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers menu; its preset key matches componentName "menu"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion.

## Public exports

@ultimate/react#UMenu
@ultimate/react/menu#UMenu
@ultimate/react#UMenuProps
@ultimate/react/menu#UMenuProps
@ultimate/react#UMenuItem
@ultimate/react/menu#UMenuItem
@ultimate/react#UMenuHandle
@ultimate/react/menu#UMenuHandle

## Owned source and evidence

packages/react/src/menu/index.ts
packages/react/src/menu/menu-style.ts
packages/react/src/menu/menu.tsx

```text
packages/react/src/menu/index.ts: export { UMenu } from "./menu";
packages/react/src/menu/menu.tsx: componentName: "menu"
packages/react/src/menu/menu-style.ts: export const menuStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./menu";
packages/react/package.json: "./menu": {
packages/themes/src/presets/aura/index.ts:     menu,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/menu/menu.tsx: export interface UMenuItem {
packages/react/src/menu/menu.tsx: export interface UMenuProps {
packages/react/src/menu/menu.tsx: export interface UMenuHandle {
packages/react/src/menu/menu.tsx: export const UMenu = React.forwardRef<UMenuHandle, UMenuProps>(function UMenu(
packages/component-metadata/src/records/menu.ts: react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/menu/menu.tsx" }
packages/react/src/menu/menu.tsx: popupAlignment?: "left" | "right";
packages/react/src/menu/menu.tsx: aria-activedescendant={focused ? (focusedId ?? undefined) : undefined}
packages/react/src/menu/menu.tsx: onAfterLeave: () => {
packages/react/src/menu/menu-style.ts: .u-menu-overlay { position: absolute; top: -9999px; left: -9999px; }
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.menu → [react.menu](react.menu.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.motion (pending cross-batch)
package.ultimate.react-core.hooks (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
