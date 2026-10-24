# Tooltip

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Tooltip is a small, text-oriented floating hint anchored to an element and shown on hover or focus. It has an arrow pointing at the target, picks an alternative side when the preferred one does not fit, supports show/hide delays, can stay open while the pointer is over it, and hides on Escape (see §7 for the caveats), window resize and scrolling of the target's scroll parents. It is not a component with a template in PrimeNG and PrimeVue: it is an attribute **directive** (`pTooltip` in PrimeNG, `v-tooltip` in PrimeVue) that attaches to any host element. PrimeReact ships a real **component** (`<Tooltip target=... />`) that finds its targets by selector, ref or `data-pr-*` attributes, plus a `tooltip` / `tooltipOptions` pair of props baked into many form components (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`, `primereact-10.9.9:components/lib/tooltip/Tooltip.js`).

## 2. Names & status

- Canonical name: **Tooltip**.
- PrimeNG: directive `Tooltip` (selector `[pTooltip]`, standalone) and `TooltipModule`; options type `TooltipOptions` in `primeng/api` (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`, `primeng-21.1.9:packages/primeng/src/api/tooltipoptions.ts`).
- PrimeVue: directive `Tooltip`, registered by the application as `v-tooltip`; the showcase page is titled "Vue Tooltip Directive" (`primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`, `primevue-4.5.5:apps/showcase/pages/tooltip/index.vue`).
- PrimeReact: component `Tooltip` (`primereact/tooltip`), props type `TooltipOptions` (`primereact-10.9.9:components/lib/tooltip/Tooltip.js`, `primereact-10.9.9:components/lib/tooltip/tooltipoptions.d.ts`).
- Deprecations: PrimeNG input `ptTooltip` is marked deprecated in favour of `pTooltipPT`. No deprecated component or alias exists in PrimeVue or PrimeReact (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`).
- Menus: "Tooltip" under Overlay in all three showcases (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Catalog entries: modules `tooltip` and `tooltipoptions` (PrimeNG, PrimeReact), `tooltip` and `tooltipstyle` (PrimeVue) in `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`.

## 3. Per framework

| Aspect           | PrimeNG                                                                                                                       | PrimeVue                                                                                              | PrimeReact                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Kind             | attribute directive                                                                                                           | custom directive                                                                                      | component (memo + forwardRef)                                                                  |
| Import           | `import { TooltipModule } from 'primeng/tooltip'` (directive `Tooltip` is standalone)                                         | `import Tooltip from 'primevue/tooltip'; app.directive('tooltip', Tooltip)`                           | `import { Tooltip } from 'primereact/tooltip'`                                                 |
| Usage            | `<input pTooltip="Hint" tooltipPosition="top" />`                                                                             | `<input v-tooltip.top="'Hint'" />`                                                                    | `<Tooltip target=".hint" content="Hint" position="top" />`                                     |
| Content          | string or `TemplateRef` (the `pTooltip` input)                                                                                | string only (or `{ value }` in the options object)                                                    | `content` prop (string or node) or `children`                                                  |
| Configuration    | individual inputs or one `[tooltipOptions]` object                                                                            | modifiers (`.top`, `.focus`) plus an options object                                                   | props on the component, or `data-pr-*` attributes on each target                               |
| Target discovery | the host element itself                                                                                                       | the host element itself                                                                               | `target` prop (CSS selector, selector array, element or ref) plus `data-pr-tooltip` attributes |
| Rendering        | container `div` built imperatively and appended to `body` (or the target)                                                     | container `div` built imperatively and appended to `document.body`                                    | JSX through `<Portal>`, mounted only while visible                                             |
| Source           | `packages/primeng/src/tooltip/tooltip.ts`, `style/tooltipstyle.ts`, `types/tooltip/tooltip.types.ts`, `api/tooltipoptions.ts` | `packages/primevue/src/tooltip/Tooltip.js`, `BaseTooltip.js`, `Tooltip.d.ts`, `style/TooltipStyle.js` | `components/lib/tooltip/Tooltip.js`, `TooltipBase.js`, `tooltip.d.ts`, `tooltipoptions.d.ts`   |
| Required service | none                                                                                                                          | none                                                                                                  | none                                                                                           |

Sources: `primeng-21.1.9:apps/showcase/doc/tooltip/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/ImportDoc.vue`, `primereact-10.9.9:components/doc/tooltip/importdoc.js`.

## 4. Anatomy

The directive/component produces a single floating element with an arrow and a text node; the target itself is not wrapped (except in PrimeReact `showOnDisabled`, see §5).

| Part  | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                               |
| ----- | -------------- | --------------- | ----------------- | ------------------------------------------------------------------- |
| Root  | `root`         | `root`          | `root`            | `p-tooltip p-component` plus `p-tooltip-<right\|left\|top\|bottom>` |
| Arrow | `arrow`        | `arrow`         | `arrow`           | `p-tooltip-arrow`                                                   |
| Text  | `text`         | `text`          | `text`            | `p-tooltip-text`                                                    |

- The root carries `role="tooltip"` in all three. PrimeNG also writes `data-pc-section` (`root`, `arrow`, `text`); PrimeVue writes a `data-p-position` attribute on the root and marks the target with `data-pd-tooltip` (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`).
- The arrow is a zero-size CSS triangle (borders), offset with inline styles computed during alignment.
- PrimeVue passes the position flags as pass-through context (`{ top, right, bottom, left }`); PrimeReact passes the same flags plus component props and state; PrimeNG has no context argument. PrimeVue's PT type also has a `hooks` entry (directive lifecycle hooks), and PrimeReact's has `hooks` as well (`primeng-21.1.9:packages/primeng/src/types/tooltip/tooltip.types.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.d.ts`, `primereact-10.9.9:components/lib/tooltip/tooltip.d.ts`).
- PrimeReact `showOnDisabled` wraps the target in `div.p-tooltip-target-wrapper` (`display: inline-flex`, plus `p-inputwrapper` for inputs) (`primereact-10.9.9:components/lib/tooltip/Tooltip.js`, `primereact-10.9.9:components/lib/tooltip/TooltipBase.js`).

## 5. API highlights

| Member          | PrimeNG                                                             | PrimeVue                                                 | PrimeReact                                                                                                                             |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Content         | `pTooltip` (`string \| TemplateRef`)                                | binding value (string) or `value`                        | `content` (string/node) or `children`                                                                                                  |
| Position        | `tooltipPosition`: `right` (default), `left`, `top`, `bottom`       | modifiers `.right` (default), `.left`, `.top`, `.bottom` | `position`: `right` (default), `left`, `top`, `bottom`, `mouse`; `my` / `at` for custom anchoring                                      |
| Event           | `tooltipEvent`: `hover` (default), `focus`, `both`                  | hover by default, `.focus` modifier                      | `event`: `hover`, `focus`, `both`; or `showEvent` (`mouseenter`) / `hideEvent` (`mouseleave`)                                          |
| Delays          | `showDelay`, `hideDelay`, `life` (auto-hide timer)                  | `showDelay`, `hideDelay`                                 | `showDelay`, `hideDelay`, `updateDelay`                                                                                                |
| `autoHide`      | `true`                                                              | `true`                                                   | `true`                                                                                                                                 |
| Disabled        | `tooltipDisabled`                                                   | `disabled` (default `false`)                             | `disabled`; `showOnDisabled` to tooltip disabled targets                                                                               |
| HTML content    | `escape = true` (set `false` to use `innerHTML`)                    | `escape = true`                                          | none (string rendered as a text node)                                                                                                  |
| Width           | `fitContent = true`                                                 | `fitContent = true`                                      | CSS only                                                                                                                               |
| Escape closes   | `hideOnEscape = true`                                               | always (keydown on target)                               | `closeOnEscape = false`                                                                                                                |
| Ellipsis only   | `showOnEllipsis = false`                                            | —                                                        | —                                                                                                                                      |
| Offsets / style | `positionTop`, `positionLeft`, `positionStyle`, `tooltipStyleClass` | `class`                                                  | `className`, `style`, `mouseTrackTop` / `mouseTrackLeft`                                                                               |
| Mount point     | `appendTo` (`body` in code, `target`, element)                      | always `document.body`                                   | `appendTo`: `null` → body, `'self'`, element or function                                                                               |
| Z-index         | `tooltipZIndex = 'auto'` (uses `config.zIndex.tooltip`)             | `$primevue.config.zIndex.tooltip`                        | `autoZIndex = true`, `baseZIndex = 0` (context/`PrimeReact.zIndex.tooltip`, 1100)                                                      |
| Mouse follow    | —                                                                   | —                                                        | `mouseTrack`, `mouseTrackTop`, `mouseTrackLeft` (`position="mouse"`)                                                                   |
| Identity        | `id` (via `tooltipOptions` only)                                    | `id` (default generated `pv_id…_tooltip`)                | `id`                                                                                                                                   |
| Options object  | `[tooltipOptions]` (`TooltipOptions`)                               | the binding object (`TooltipOptions`)                    | spread `tooltipOptions` on built-in `tooltip` props                                                                                    |
| Callbacks       | none                                                                | none                                                     | `onBeforeShow`, `onBeforeHide`, `onShow`, `onHide` (`{ originalEvent, target }`; returning `false` from a `onBefore*` handler cancels) |
| Imperative API  | none                                                                | none                                                     | `show(event?)`, `hide(event?)`, `updateTargetEvents()`, `loadTargetEvents()`, `unloadTargetEvents()`, `getElement()`, `getTarget()`    |

Notes:

- PrimeNG's `TooltipOptions` interface carries `tooltipLabel`, `tooltipPosition`, `tooltipEvent`, `appendTo`, `positionStyle`, `tooltipStyleClass`, `tooltipZIndex`, `escape`, `disabled`, `positionTop`, `positionLeft`, `showDelay`, `hideDelay`, `life` and `id`; it is also the type of `MenuItem.tooltipOptions` (`primeng-21.1.9:packages/primeng/src/api/tooltipoptions.ts`, `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`).
- Alignment fallbacks: PrimeNG and PrimeVue try the requested side first, then the opposite, then the perpendicular sides (for example `top` → `bottom` → `right` → `left` in PrimeNG). PrimeReact uses `flipfitCollision` against the `my` / `at` pair.
- Passing a plain string to PrimeVue's directive resets all options to their defaults; use the object form to set anything else.
- PrimeReact's `Tooltip` has no `escape` prop and renders string content as a text node, so it cannot inject HTML; PrimeNG can with `escape = false`.

Sources: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.d.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`, `primereact-10.9.9:components/lib/tooltip/TooltipBase.js`, `primereact-10.9.9:components/lib/tooltip/tooltipoptions.d.ts`, `primereact-10.9.9:components/lib/tooltip/tooltip.d.ts`.

## 6. Usage guidance

- **Import.** PrimeNG: add `TooltipModule` (or the standalone `Tooltip`). PrimeVue: register the directive globally or locally. PrimeReact: import the component (`primeng-21.1.9:apps/showcase/doc/tooltip/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/ImportDoc.vue`, `primereact-10.9.9:components/doc/tooltip/importdoc.js`).
- **Position.** Choose `top`, `bottom`, `left` or `right` (right is the default); if the chosen side does not fit, the tooltip is moved to another side automatically. PrimeReact also documents that form components expose built-in `tooltip` and `tooltipOptions` properties (`primeng-21.1.9:apps/showcase/doc/tooltip/position-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/PositionDoc.vue`, `primereact-10.9.9:components/doc/tooltip/positiondoc.js`).
- **Event.** Switch from hover to focus (and, in NG/React, to both) for keyboard-reachable fields such as inputs (`primeng-21.1.9:apps/showcase/doc/tooltip/event-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/EventDoc.vue`, `primereact-10.9.9:components/doc/tooltip/eventdoc.js`).
- **Auto hide.** Disable `autoHide` so the pointer can move onto the tooltip (to select text or follow a link) without it closing (`primeng-21.1.9:apps/showcase/doc/tooltip/autohide-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/AutoHideDoc.vue`, `primereact-10.9.9:components/doc/tooltip/autohidedoc.js`).
- **Delay.** Use `showDelay` / `hideDelay` to avoid flicker when the pointer sweeps across many targets (`primeng-21.1.9:apps/showcase/doc/tooltip/delay-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/DelayDoc.vue`, `primereact-10.9.9:components/doc/tooltip/delaydoc.js`).
- **Custom content / styling.** PrimeNG passes a `TemplateRef` as the tooltip value; PrimeVue restyles the arrow and text through the `pt` option of the binding object; PrimeReact documents the `content` prop or children as the template (`primeng-21.1.9:apps/showcase/doc/tooltip/custom-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/CustomDoc.vue`, `primereact-10.9.9:components/doc/tooltip/templatedoc.js`).
- **Tooltip options (NG only).** Bundle position, event, delay and auto-hide in a single `[tooltipOptions]` object so the same configuration can be shared or reused from data such as `MenuItem` (`primeng-21.1.9:apps/showcase/doc/tooltip/options-doc.ts`).
- **Target (React only).** Point the component at one or many elements with a selector or ref, and override position, event and delays per element with `data-pr-*` attributes (`primereact-10.9.9:components/doc/tooltip/targetdoc.js`).
- **Mouse track (React only).** Make the tooltip follow the pointer, optionally offset by `mouseTrackTop` / `mouseTrackLeft` (`primereact-10.9.9:components/doc/tooltip/mousetrackdoc.js`).
- **Reactive (React only).** Changing `content` updates an already visible tooltip (`primereact-10.9.9:components/doc/tooltip/reactivedoc.js`).
- **Disabled (React only).** Browsers do not fire pointer events on disabled form controls; wrap the control or set `showOnDisabled` (`primereact-10.9.9:components/doc/tooltip/disableddoc.js`).
- **Style / theming.** PrimeReact lists the structural classes and offers a pre-built Tailwind theme; PrimeVue has styled and Tailwind theming pages (`primereact-10.9.9:components/doc/tooltip/styledoc.js`, `primereact-10.9.9:components/doc/tooltip/theming/styleddoc.js`, `primereact-10.9.9:components/doc/tooltip/theming/tailwinddoc.js`, `primevue-4.5.5:apps/showcase/doc/tooltip/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/tooltip/theming/TailwindDoc.vue`).
- **Pass-through.** Each framework's showcase has a PT viewer page (`primeng-21.1.9:apps/showcase/doc/tooltip/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/tooltip/pt/wireframe.js`).

## 7. Accessibility

- The tooltip element has `role="tooltip"` in all three (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`, `primereact-10.9.9:components/lib/tooltip/Tooltip.js`).
- Doc/source mismatch: the accessibility docs of all three frameworks state that the generated id of the tooltip becomes the `aria-describedby` of the target while visible. A search of the three tooltip sources finds no `aria-describedby` being written. PrimeNG does not even assign an `id` attribute to the created element; PrimeVue assigns an `id` to the element but never links it from the target (`primeng-21.1.9:apps/showcase/doc/tooltip/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/tooltip/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/tooltip/accessibilitydoc.js`).
- Keyboard (docs): the tooltip closes with `Escape` while the target has focus; there are no other keyboard interactions. Actual behaviour differs: PrimeNG listens on the document and honours `hideOnEscape` (default `true`); PrimeVue handles `keydown` `Escape` on the target; PrimeReact only registers an Escape handler when `closeOnEscape` is `true`, and its default is `false`.
- Keyboard access requires a focusable target and `tooltipEvent`/`.focus`/`event="focus"`. With the default hover-only event, keyboard users never see the tooltip.
- PrimeReact renders `aria-hidden={visibleState}` on the root, which is `true` while the tooltip is shown (the opposite of what the attribute expresses) (`primereact-10.9.9:components/lib/tooltip/Tooltip.js`).
- Touch: PrimeNG binds `touchstart` / `touchend` (passive); a click on the target hides the tooltip in PrimeNG and PrimeVue.
- The tooltip should carry supplementary information only; essential content must not be available solely on hover.

## 8. Theming

- Style module: `@primeuix/styles/tooltip` (`primeng-21.1.9:packages/primeng/src/tooltip/style/tooltipstyle.ts`, `primevue-4.5.5:packages/primevue/src/tooltip/style/TooltipStyle.js`, `@primeuix/styles-2.0.3:dist/tooltip/index.mjs`). It styles `.p-tooltip` (absolute, hidden until shown, `max-width`), the four position classes (gutter padding), `.p-tooltip-text` (`white-space: pre-line`, background, colour, padding, shadow, radius) and the arrow triangles per side. The PrimeVue style module is named `tooltip-directive`; PrimeNG's is `tooltip`.
- Design tokens (`tooltip`): `root.{maxWidth, gutter, shadow, padding, borderRadius, background, color}` (`@primeuix/themes-2.0.3:types/tooltip/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). CSS variables follow `--p-tooltip-max-width`, `--p-tooltip-gutter`, and so on.
- Aura defaults: max width `12.5rem`, gutter `0.25rem`, padding `0.5rem 0.75rem`, shadow and radius taken from `overlay.popover`, and `surface.700` background with `surface.0` text in both light and dark schemes (`@primeuix/themes-2.0.3:dist/aura/tooltip/index.mjs`).
- PrimeReact: no design tokens; `TooltipBase.js` carries its own `@layer primereact` CSS (absolute position, text padding, `pre-line` wrapping, arrow triangles) and colours come from the host theme (`primereact-10.9.9:components/lib/tooltip/TooltipBase.js`).
- Tooltip fade-in is 250 ms (programmatic) in NG and Vue when styled; there is no CSS transition class pair.
- Pass-through keys: see §4.

## 9. Relationships

- Uses: no other Prime component. Positioning helpers `ConnectedOverlayScrollHandler` (NG `primeng/dom`, Vue `@primevue/core/utils`) and `ZIndexUtils` / `ZIndex`.
- Embedded in other components: PrimeReact's `Button` and many form components render a `Tooltip` for their `tooltip` / `tooltipOptions` props (`primereact-10.9.9:components/lib/button/Button.js`); PrimeNG menu-like components (menu, menubar, contextmenu, tieredmenu, megamenu, panelmenu, breadcrumb, steps, dock) and speeddial/splitbutton read `tooltipOptions` from their items or inputs, for example [menu.md](menu.md) and [contextmenu.md](contextmenu.md); the PrimeVue directive works on any element, including [button.md](button.md) and [inputtext.md](inputtext.md).
- Related: [popover.md](popover.md) (anchored overlay for arbitrary, interactive content; click-driven, dismissed by outside click), [confirmpopup.md](confirmpopup.md) (anchored confirmation), [dialog.md](dialog.md) and [drawer.md](drawer.md) (modal surfaces). Tooltip is the lightest member of the family: text-only, non-interactive by default, and not focus-managed.
- Inside a PrimeNG `p-dialog`, showing the tooltip is delayed by 100 ms so the dialog stacking is settled first (`primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`).
- Cross-category: tooltips commonly decorate [badge.md](badge.md) hosts and toolbar buttons ([splitbutton.md](splitbutton.md) renders a `Tooltip` for its own `tooltip` prop in PrimeReact; [speeddial.md](speeddial.md) tags its items with `data-pr-tooltip` in PrimeReact).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils`, `primeng/api` (`TooltipOptions`), `primeng/basecomponent`, `primeng/bind`, `primeng/dom` (`ConnectedOverlayScrollHandler`), `primeng/ts-helpers`, `primeng/types/tooltip`, `primeng/utils` (`ZIndexUtils`), `@primeuix/styles/tooltip`.
- PrimeVue: `@primevue/core/basedirective` (`BaseDirective`), `@primevue/core/utils` (`ConnectedOverlayScrollHandler`), `@primeuix/utils/dom`, `@primeuix/utils/object`, `@primeuix/utils/uuid`, `@primeuix/utils/zindex`, `@primeuix/styles/tooltip`.
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../portal/Portal`, `../hooks/Hooks` (`useGlobalOnEscapeKey`, `useDisplayOrder`, `useResizeListener`, `useOverlayScrollListener`, `useUpdateEffect`, …), `../utils/Utils` (`DomHandler`, `ZIndexUtils`, `ObjectUtils`), `../componentbase/ComponentBase`.

## 11. Framework differences

| Aspect           | PrimeNG                            | PrimeVue                            | PrimeReact                                            |
| ---------------- | ---------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| Form             | directive `pTooltip`               | directive `v-tooltip`               | component `<Tooltip>`                                 |
| Registration     | import module/standalone directive | `app.directive('tooltip', Tooltip)` | import component                                      |
| Template content | `TemplateRef`                      | no (string only)                    | `content` node or `children`                          |
| HTML content     | `escape = false` → `innerHTML`     | `escape = false`                    | no                                                    |
| Position values  | 4 sides                            | 4 sides (modifiers)                 | 4 sides + `mouse`, `my` / `at`                        |
| Mouse tracking   | no                                 | no                                  | yes                                                   |
| Event model      | `hover` / `focus` / `both`         | hover (default) / `.focus`          | `event` or custom `showEvent` / `hideEvent`           |
| Escape default   | `hideOnEscape = true`              | always                              | `closeOnEscape = false`                               |
| Life timer       | `life`                             | no                                  | no                                                    |
| Ellipsis only    | `showOnEllipsis`                   | no                                  | no                                                    |
| Mount target     | `body` / `target` / element        | `document.body`                     | `appendTo` (`body`, `'self'`, element, function)      |
| Disabled targets | `tooltipDisabled`                  | `disabled`                          | `disabled`, `showOnDisabled` wrapper                  |
| Callbacks        | none                               | none                                | `onBeforeShow` / `onBeforeHide` / `onShow` / `onHide` |
| Imperative       | none                               | none                                | `show()`, `hide()`, target helpers                    |
| Default z-index  | `config.zIndex.tooltip`            | `config.zIndex.tooltip`             | `zIndex.tooltip` (1100)                               |
| PT keys          | `root`, `arrow`, `text`            | `root`, `arrow`, `text`, `hooks`    | `root`, `arrow`, `text`, `hooks`                      |
| Theming          | `@primeuix` tokens + styles        | `@primeuix` tokens + styles         | own CSS, no tokens                                    |
| Shared via data  | `MenuItem.tooltipOptions`          | n/a                                 | `tooltip` / `tooltipOptions` props on built-ins       |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/tooltip/tooltip.ts`
- `primeng-21.1.9:packages/primeng/src/tooltip/style/tooltipstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/tooltip/tooltip.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/tooltipoptions.ts`
- `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`
- `primeng-21.1.9:apps/showcase/doc/tooltip/` (`import-doc.ts`, `position-doc.ts`, `event-doc.ts`, `autohide-doc.ts`, `delay-doc.ts`, `custom-doc.ts`, `options-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/doc/tooltip/pt/PTViewer.ts`
- `primeng-21.1.9:apps/showcase/pages/tooltip/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.js`
- `primevue-4.5.5:packages/primevue/src/tooltip/BaseTooltip.js`
- `primevue-4.5.5:packages/primevue/src/tooltip/Tooltip.d.ts`
- `primevue-4.5.5:packages/primevue/src/tooltip/style/TooltipStyle.js`
- `primevue-4.5.5:apps/showcase/doc/tooltip/` (`ImportDoc.vue`, `PositionDoc.vue`, `EventDoc.vue`, `AutoHideDoc.vue`, `DelayDoc.vue`, `CustomDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/doc/tooltip/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/tooltip/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/tooltip/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/tooltip/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/tooltip/Tooltip.js`
- `primereact-10.9.9:components/lib/tooltip/TooltipBase.js`
- `primereact-10.9.9:components/lib/tooltip/tooltip.d.ts`
- `primereact-10.9.9:components/lib/tooltip/tooltipoptions.d.ts`
- `primereact-10.9.9:components/lib/button/Button.js`
- `primereact-10.9.9:components/doc/tooltip/` (`importdoc.js`, `positiondoc.js`, `eventdoc.js`, `autohidedoc.js`, `delaydoc.js`, `targetdoc.js`, `templatedoc.js`, `mousetrackdoc.js`, `reactivedoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`)
- `primereact-10.9.9:components/doc/tooltip/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/tooltip/theming/tailwinddoc.js`
- `primereact-10.9.9:components/doc/tooltip/pt/wireframe.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/tooltip/index.mjs`
- `@primeuix/themes-2.0.3:types/tooltip/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/tooltip/index.mjs`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
