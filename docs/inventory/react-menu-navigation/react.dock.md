# React UDock

ID: react.dock

Framework: react; availability: public

## Authored interpretation

Positioned icon command dock with hover magnification.

## Framework surface

UDock forwards HTMLDivElement. UDockProps: model defaults [], position defaults bottom (top/left/right also allowed), ariaLabel, onItemSelect({originalEvent,item}), className. UMenuItem is reused as a type only. Hidden items are omitted; disabled clicks prevent default; enabled selection calls onItemSelect before item.command and prevents navigation without url. Icons are joined into className strings rather than rendered as ReactNode children. hoveredIndex drives active class/data-u-active; local CSS scale(1.5) supplies magnification and position classes orient the list. ArrowRight/Left applies horizontally, ArrowDown/Up vertically; Home/End jumps to enabled edges, movement wraps enabled visible entries. Anchors have role menuitem and aria-label/disabled but no disabled tabIndex override; list role menu has ariaLabel. Local CSS disabled selectors require data-u-disabled on li, but the renderer sets no such attribute on li; it emits aria-disabled on anchors. No Portal, imperative API or custom hook declaration. dockStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/dock expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers dock; its preset key matches componentName "dock"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UDock
@ultimate/react/dock#UDock
@ultimate/react#UDockProps
@ultimate/react/dock#UDockProps

## Owned source and evidence

packages/react/src/dock/dock-style.ts
packages/react/src/dock/dock.tsx
packages/react/src/dock/index.ts

```text
packages/react/src/dock/index.ts: export { UDock } from "./dock";
packages/react/src/dock/dock.tsx: componentName: "dock"
packages/react/src/dock/dock-style.ts: export const dockStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./dock";
packages/react/package.json: "./dock": {
packages/themes/src/presets/aura/index.ts:     dock,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/dock/dock.tsx: export interface UDockProps {
packages/react/src/dock/dock.tsx: export const UDock = React.forwardRef<HTMLDivElement, UDockProps>(function UDock(
packages/react/src/dock/dock.tsx: case "Home":
packages/react/src/dock/dock-style.ts: .u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"] { transform: scale(1.5); }
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.dock → [react.dock](react.dock.md) (reconciled family alias)
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
