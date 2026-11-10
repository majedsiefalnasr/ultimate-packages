# React USpeedDial

ID: react.speed-dial

Framework: react; availability: public

## Authored interpretation

Floating action toggle with linear or circular secondary actions.

## Framework surface

USpeedDial forwards USpeedDialHandle with show()/hide(). USpeedDialProps: model defaults [], icon, direction=up, type=linear, radius=0, transitionDelay=30ms, mask=false, disabled=false, closeOnEscape=true, ariaLabel, onVisibleChange(boolean), onClick(MouseEvent), onShow, onHide, className. Public USpeedDialDirection allows up/down/left/right/up-left/up-right/down-left/down-right; USpeedDialType allows linear/circle/semi-circle/quarter-circle. The native toggle button (not UButton) has aria-expanded/haspopup/label and disabled; imperative show is not disabled-guarded. State updater callbacks emit visibility and show/hide once per transition. Document Escape hides while open; optional mask click hides. Every model entry remains mounted as a native menuitem button; disabled uses the native attribute, closed state tabIndex=-1. Keyboard movement wraps eligible visible enabled actions on an axis chosen by direction. Hidden entries receive a u-speeddial-item-hidden class, but local CSS targets data-u-hidden, which is not emitted. Local CSS has transitions but no open/closed transform or opacity rule. Inline positions use trigonometry for circle variants with radius fallback model.length*20; semi steps divide by (length-1) and quarter steps by 2*(length-1), with no single-item guard. transitionDelay reverses on close. Item click calls command then hide; url is not consumed. No Portal, UButton, overlay foundation or motion hook is imported. speedDialStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/speed-dial expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers speeddial: speedDial; its preset key differs from componentName "speed-dial"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#USpeedDial
@ultimate/react/speed-dial#USpeedDial
@ultimate/react#USpeedDialProps
@ultimate/react/speed-dial#USpeedDialProps
@ultimate/react#USpeedDialHandle
@ultimate/react/speed-dial#USpeedDialHandle
@ultimate/react#USpeedDialDirection
@ultimate/react/speed-dial#USpeedDialDirection
@ultimate/react#USpeedDialType
@ultimate/react/speed-dial#USpeedDialType

## Owned source and evidence

packages/react/src/speed-dial/index.ts
packages/react/src/speed-dial/speed-dial-style.ts
packages/react/src/speed-dial/speed-dial.tsx

```text
packages/react/src/speed-dial/index.ts: export { USpeedDial } from "./speed-dial";
packages/react/src/speed-dial/speed-dial.tsx: componentName: "speed-dial"
packages/react/src/speed-dial/speed-dial-style.ts: export const speedDialStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./speed-dial";
packages/react/package.json: "./speed-dial": {
packages/themes/src/presets/aura/index.ts:     speeddial: speedDial,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/speed-dial/speed-dial.tsx: export type USpeedDialDirection =
packages/react/src/speed-dial/speed-dial.tsx: export type USpeedDialType = "linear" | "circle" | "semi-circle" | "quarter-circle";
packages/react/src/speed-dial/speed-dial.tsx: export interface USpeedDialProps {
packages/react/src/speed-dial/speed-dial.tsx: export interface USpeedDialHandle {
packages/react/src/speed-dial/speed-dial.tsx: export const USpeedDial = React.forwardRef<USpeedDialHandle, USpeedDialProps>(function USpeedDial(
packages/react/src/speed-dial/speed-dial.tsx: className={cx("item", { hidden: item.visible === false })}
packages/react/src/speed-dial/speed-dial-style.ts: .u-speeddial-item[data-u-hidden="true"] { visibility: hidden; }
packages/react/src/speed-dial/speed-dial.tsx: const delay = (visible ? index : length - index - 1) * transitionDelay;
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.speed-dial → [react.speed-dial](react.speed-dial.md) (reconciled family alias)
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
