# React UTabView and UTabMenu

ID: react.tabs

Framework: react; availability: public

## Authored interpretation

Tabbed content views with panel markers, plus a model-driven tab navigation strip.

## Framework surface

Three public components share one family and one tabsStyleModule. UTabView forwards HTMLDivElement. UTabViewProps: activeIndex, onTabChange({originalEvent,index}), tabIndex=0, scrollable=false, onBeforeTabClose (returning false cancels), onTabClose, children, className. UTabView is controlled only when onTabChange is supplied (activeIndex defaults to 0 then); otherwise internal state is used. Children are filtered by child.type === UTabPanel, so other children are ignored. UTabPanel is a marker declared React.FC<UTabPanelProps> = () => null and never rendered itself; UTabPanelProps: header, disabled, closable, closeIcon, children. Closed tabs are tracked in internal hiddenTabs state keyed by an explicit React key (EXPLICIT_KEY regex) else by index, and are not synced back to props. findVisibleActiveTab picks the first enabled visible tab at or after the closed index, else the nearest before. Tab list items are role=tab with aria-selected; the button tabIndex is the configured tabIndex only when selected, else -1. Keyboard: ArrowRight/ArrowLeft wrap, Home/End jump, Enter and Space activate; focus alone does not activate. Close button has aria-label Close and default glyph ×. Scrollable mode adds Previous Page and Next Page buttons shown only when scrolling is possible, recomputed by an effect on every render and on scroll using getComputedStyle widths. Panels are role=tabpanel and hidden when unselected; all non-closed panels stay mounted. The tabViewInkbar class exists in local CSS but is never rendered. UTabMenu forwards HTMLDivElement. UTabMenuProps: model (UMenuItem[], type-only import from ../menu), activeIndex, onTabChange({originalEvent,value,index}), className; controlled only when onTabChange is supplied. Items render role=tab with aria-selected and an anchor (href item.url ?? #, tabIndex -1 when disabled). Disabled clicks preventDefault; item.command runs; navigation is prevented when no url. Icon is a class-name string, not a ReactNode. UTabMenu has no panels and no keyboard handler, and ignores visible, separator and nested items; tabMenuInkbar is likewise unused. Public types are UTabViewProps, UTabPanelProps and UTabMenuProps. tabsStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. The family uses useComponentBase from react-core/base with componentName "tabs", whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/tabs expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers tabs; registration is not rendered theme verification. UTabMenu reuses UMenuItem from the React menu family as a type only; react.menu is not an owned part of this scope. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision, so no metadata relationship is claimed. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#UTabView
@ultimate/react/tabs#UTabView
@ultimate/react#UTabViewProps
@ultimate/react/tabs#UTabViewProps
@ultimate/react#UTabPanel
@ultimate/react/tabs#UTabPanel
@ultimate/react#UTabPanelProps
@ultimate/react/tabs#UTabPanelProps
@ultimate/react#UTabMenu
@ultimate/react/tabs#UTabMenu
@ultimate/react#UTabMenuProps
@ultimate/react/tabs#UTabMenuProps

## Owned source and evidence

packages/react/src/tabs/index.ts
packages/react/src/tabs/tab-menu.tsx
packages/react/src/tabs/tab-panel.tsx
packages/react/src/tabs/tab-view.tsx
packages/react/src/tabs/tabs-style.ts

```text
packages/react/src/tabs/index.ts: export { UTabView } from "./tab-view";
packages/react/src/tabs/tab-view.tsx: componentName: "tabs"
packages/react/src/tabs/tab-menu.tsx: componentName: "tabs"
packages/react/src/tabs/tabs-style.ts: export const tabsStyleModule: StyleModule = { css, classes };
packages/react/src/tabs/tab-panel.tsx: export const UTabPanel: React.FC<UTabPanelProps> = () => null;
packages/react/src/tabs/tab-view.tsx: export interface UTabViewProps {
packages/react/src/tabs/tab-menu.tsx: export interface UTabMenuProps {
packages/react/src/tabs/tab-view.tsx: const EXPLICIT_KEY = /(^\.|:)\$/;
packages/react/src/tabs/tab-view.tsx: aria-label="Previous Page"
packages/react/src/tabs/tab-menu.tsx: import type { UMenuItem } from "../menu";
packages/react/src/index.ts: export * from "./tabs";
packages/react/package.json: "./tabs": {
packages/themes/src/presets/aura/index.ts:     tabs,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.tabs → [react.tabs](react.tabs.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --maxWorkers=1 --no-file-parallelism",
    "outcome": "unavailable",
    "revision": "87100121a16fd637290078679faf1bc47fcb1190",
    "output": "Vitest exited 1: Failed to load PostCSS config; Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs",
    "limitations": "Node v24.15.0 and pnpm; ancestor host PostCSS configuration prevents execution. No product assertions passed; no host or product repair attempted."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
