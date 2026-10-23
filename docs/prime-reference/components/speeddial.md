# SpeedDial

**Category:** Button · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

SpeedDial is a floating action button that opens a set of related action items when activated. A round toggler button shows a plus icon (which can rotate); its items are laid out in a line, circle, semi-circle, or quarter-circle around it, in one of eight directions. Items come from a `MenuItem` model, can show tooltips, and an optional mask can dim the page while the menu is open.

## 2. Names & status

| Framework  | Public names                                   | Status                                                  |
| ---------- | ---------------------------------------------- | ------------------------------------------------------- |
| PrimeNG    | `SpeedDial` (`p-speeddial`), `SpeedDialModule` | Shipped. No deprecated members in the component source. |
| PrimeVue   | `SpeedDial`                                    | Shipped. No deprecations declared.                      |
| PrimeReact | `SpeedDial`                                    | Shipped. No deprecations declared.                      |

Aliases: none. PrimeNG accepts the selector spellings `p-speeddial`, `p-speedDial`, and `p-speed-dial`.

## 3. Per framework

### PrimeNG 21.1.9

- **Import:** `import { SpeedDialModule } from 'primeng/speeddial'` (or the standalone `SpeedDial` class).
- **Selector:** `p-speeddial`.
- **Source:** `primeng-21.1.9:packages/primeng/src/speeddial/speeddial.ts`; style `primeng-21.1.9:packages/primeng/src/speeddial/style/speeddialstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/speeddial/speeddial.types.ts`.
- **Sub-components:** none public. The toggler and each action are `pButton` directive buttons; items carry `pTooltip`.

### PrimeVue 4.5.5

- **Import:** `import SpeedDial from 'primevue/speeddial'`.
- **Tag:** `<SpeedDial>`.
- **Source:** `primevue-4.5.5:packages/primevue/src/speeddial/SpeedDial.vue`; props in `primevue-4.5.5:packages/primevue/src/speeddial/BaseSpeedDial.vue`; types `primevue-4.5.5:packages/primevue/src/speeddial/SpeedDial.d.ts`; style `primevue-4.5.5:packages/primevue/src/speeddial/style/SpeedDialStyle.js`.
- **Sub-components:** none public. The toggler and actions are PrimeVue `Button` components; actions use the `v-tooltip` directive.

### PrimeReact 10.9.9

- **Import:** `import { SpeedDial } from 'primereact/speeddial'`.
- **Tag:** `<SpeedDial>`.
- **Source:** `primereact-10.9.9:components/lib/speeddial/SpeedDial.js`; defaults, classes, and CSS in `primereact-10.9.9:components/lib/speeddial/SpeedDialBase.js`; types `primereact-10.9.9:components/lib/speeddial/speeddial.d.ts`.
- **Sub-components:** none public. The toggler is a PrimeReact `Button`; actions are `<a>` elements with Ripple. There is no built-in tooltip; the showcase attaches a standalone Tooltip by CSS selector.

## 4. Anatomy

- **root** — container `<div>`; class `p-speeddial p-component p-speeddial-<type>`, a direction class for non-circle types, and an open-state class (`p-speeddial-open` in PrimeNG/PrimeVue, `p-speeddial-opened` in PrimeReact).
- **toggler button** (`pcButton` in PrimeNG/PrimeVue, `button` in PrimeReact) — round icon-only button with `p-speeddial-button`; gains `p-speeddial-rotate` when `rotateAnimation` is on and no `hideIcon` is set.
- **list** — `<ul role="menu" class="p-speeddial-list">` (PrimeReact PT key `menu`).
- **item** — `<li class="p-speeddial-item">` (PrimeReact PT key `menuitem`); hidden and focus states add classes.
- **action** — the clickable element inside an item (`pcAction` / `p-speeddial-action`): a small rounded secondary Button in PrimeNG and PrimeVue, an `<a>` in PrimeReact.
- **actionIcon** — the item icon (`p-speeddial-action-icon`).
- **mask** — optional overlay (`p-speeddial-mask`, plus `p-overlay-mask` in PrimeNG/PrimeVue and `p-speeddial-mask-visible` in PrimeReact).

## 5. API highlights

### Shared props (same name and default in all three unless noted)

- `model` — `MenuItem[]` (default `null`).
- `visible` — default `false`.
- `direction` — `'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'`, default `'up'`.
- `type` — `'linear' | 'circle' | 'semi-circle' | 'quarter-circle'`, default `'linear'`.
- `radius` — default `0`; used by the circular types.
- `transitionDelay` — per-item stagger in ms, default `30`.
- `mask` — default `false`; `maskStyle` plus `maskClassName` (PrimeNG/PrimeReact) or `maskClass` (PrimeVue).
- `disabled` — default `false`. `hideOnClickOutside` — default `true`. `rotateAnimation` — default `true`.
- `showIcon` / `hideIcon` — icons for the closed and open toggler.
- Accessible naming: `ariaLabel` / `ariaLabelledBy` (PrimeNG), `ariaLabel` / `ariaLabelledby` (PrimeVue), `aria-label` / `ariaLabelledby` (PrimeReact).

### PrimeNG

- Extra inputs: `id`, `style`, `className`, `buttonStyle`, `buttonClassName`, `tooltipOptions: TooltipOptions`, `buttonProps: ButtonProps` (forwarded to the toggler).
- Outputs: `onVisibleChange(boolean)`, `visibleChange(boolean)` (supports `[(visible)]`), `onClick(MouseEvent)`, `onShow`, `onHide`.
- Templates: `#button` (context `{ toggleCallback }`), `#item` (context `{ $implicit: item, index, toggleCallback }`), `#icon`.
- Clicking an item calls `item.command({ originalEvent, item })` and closes the menu.

### PrimeVue

- Extra props: `buttonClass`, `tooltipOptions` (default `null`), `buttonProps` (default `{ rounded: true }`), `actionButtonProps` (default `{ severity: 'secondary', rounded: true, size: 'small' }`).
- Emits: `click`, `show`, `hide`, `focus`, `blur`. There is no `update:visible`; `visible` is one-way.
- Slots: `button` (`{ visible, toggleCallback }`), `icon` (`{ visible }`), `item` (`{ item, onClick, toggleCallback }`), `itemicon` (`{ item, class }`).

### PrimeReact

- Extra props: `id`, `style`, `className`, `buttonStyle`, `buttonClassName`, `buttonTemplate` (node or function receiving `{ onClick, className, iconClassName, element, props, visible }`).
- Events: `onVisibleChange(visible)` (makes `visible` controlled), `onClick(event)`, `onShow()`, `onHide()`.
- Methods: `show()`, `hide()`, `getElement()`.
- Items may supply their own `template`; the default open icon is a minus icon.

## 6. Usage guidance

- **Import** — import from the framework entry point (`primeng-21.1.9:apps/showcase/doc/speeddial/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/ImportDoc.vue`, `primereact-10.9.9:components/doc/speeddial/importdoc.js`).
- **Linear** — default layout; set `direction` to choose where the items open (`primeng-21.1.9:apps/showcase/doc/speeddial/linear-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/LinearDoc.vue`, `primereact-10.9.9:components/doc/speeddial/lineardoc.js`).
- **Circle** — `type="circle"` with a `radius` spreads items all around the toggler; the PrimeNG demo also styles the toggler through `buttonProps` (`primeng-21.1.9:apps/showcase/doc/speeddial/circle-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/CircleDoc.vue`, `primereact-10.9.9:components/doc/speeddial/circledoc.js`).
- **Semi circle** — `type="semi-circle"` places items on a half circle facing `direction` (`primeng-21.1.9:apps/showcase/doc/speeddial/semicircle-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/SemiCircleDoc.vue`, `primereact-10.9.9:components/doc/speeddial/semicircledoc.js`).
- **Quarter circle** — `type="quarter-circle"` with a diagonal direction, suited to screen corners (`primeng-21.1.9:apps/showcase/doc/speeddial/quartercircle-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/QuarterCircleDoc.vue`, `primereact-10.9.9:components/doc/speeddial/quartercircledoc.js`).
- **Tooltip** — PrimeNG and PrimeVue enable item tooltips through `tooltipOptions` (position option named `tooltipPosition` in PrimeNG, `position` in PrimeVue); PrimeReact pairs SpeedDial with a separate Tooltip (`primeng-21.1.9:apps/showcase/doc/speeddial/tooltip-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/TooltipDoc.vue`, `primereact-10.9.9:components/doc/speeddial/tooltipdoc.js`).
- **Mask** — `mask` dims the page while open (`primeng-21.1.9:apps/showcase/doc/speeddial/mask-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/MaskDoc.vue`, `primereact-10.9.9:components/doc/speeddial/maskdoc.js`).
- **Template / custom** — PrimeNG and PrimeVue replace the toggler and items through templates or slots; PrimeReact's "custom" section swaps the icons with `showIcon` / `hideIcon` and restyles the toggler (`primeng-21.1.9:apps/showcase/doc/speeddial/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/TemplateDoc.vue`, `primereact-10.9.9:components/doc/speeddial/customdoc.js`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/speeddial/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/speeddial/accessibilitydoc.js`).

## 7. Accessibility

- The toggler is a native button named by `aria-label` or `aria-labelledby`, with `aria-haspopup="true"`, `aria-expanded` reflecting the open state, and `aria-controls` pointing at the list (PrimeReact points it at the space-separated item ids; PrimeVue only sets it while open).
- The list has `role="menu"` and tracks focus with `aria-activedescendant`; each action has `role="menuitem"` and uses the item label as its `aria-label`. In PrimeVue the `<li>` has `role="none"` and the action button carries the menuitem role; in PrimeNG and PrimeReact both the `<li>` and the action carry `role="menuitem"`.
- Toggler keys: Enter / Space toggle; Down Arrow opens and focuses the first item; Up Arrow opens and focuses the last item.
- Menu keys: Enter activates the item, closes the menu, and returns focus to the toggler; Escape closes and returns focus; arrow keys move between items according to `direction`; Home / End jump to the first / last item. PrimeVue also accepts NumpadEnter. PrimeReact handles Escape through its global Escape-key stack (`primereact-10.9.9:components/lib/hooks/useGlobalOnEscapeKey.js`).
- Showcase sources: `primeng-21.1.9:apps/showcase/doc/speeddial/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/speeddial/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/speeddial/accessibilitydoc.js`.

## 8. Theming

- **Style module:** `@primeuix/styles/speeddial` (`@primeuix/styles-2.0.3:dist/speeddial/index.mjs`), used by PrimeNG (`primeng-21.1.9:packages/primeng/src/speeddial/style/speeddialstyle.ts`) and PrimeVue (`primevue-4.5.5:packages/primevue/src/speeddial/style/SpeedDialStyle.js`). Both also set the root and list `flex-direction` inline from `direction`.
- **Catalog classes:** `p-speeddial`, `p-speeddial-button`, `p-speeddial-list`, `p-speeddial-item`, `p-speeddial-action`, `p-speeddial-action-icon`, `p-speeddial-mask`; modifiers `p-speeddial-<type>`, `p-speeddial-direction-<dir>`, `p-speeddial-open`, `p-speeddial-rotate`.
- **Pass-through keys:** PrimeNG `root`, `pcButton`, `list`, `item`, `pcAction`, `actionIcon`, `mask`; PrimeVue the same plus `hooks`; PrimeReact `root`, `button`, `menu`, `menuitem`, `action`, `actionIcon`, `mask`, `hooks`.
- **Design tokens:** `@primeuix/themes-2.0.3:types/speeddial/index.d.ts` defines only `root.gap` and `root.transitionDuration` (Aura: `@primeuix/themes-2.0.3:dist/aura/speeddial/index.mjs`). The embedded buttons are themed by the Button tokens.
- **PrimeReact:** own CSS string in `primereact-10.9.9:components/lib/speeddial/SpeedDialBase.js`; design tokens N/A — PrimeReact 10 does not use `@primeuix/themes`.

## 9. Relationships

- **Embeds:** Button (toggler in all three; actions in PrimeNG and PrimeVue), Ripple, Tooltip (PrimeNG `pTooltip`, PrimeVue `v-tooltip`), PlusIcon (all) and MinusIcon (PrimeReact), RouterModule for `routerLink` items (PrimeNG).
- **Embedded by:** none in the shipped sources.
- **Alternatives / related:** SplitButton for a primary action with a dropdown list; Menu or TieredMenu (Menu category) for non-floating action lists. Consumes the shared `MenuItem` model used by the menu components.

## 10. Dependencies

- **PrimeNG:** internal `primeng/button`, `primeng/ripple`, `primeng/tooltip`, `primeng/icons`, `primeng/api` (`MenuItem`, `TooltipOptions`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`; Angular `@angular/router`; external `@primeuix/utils`, `@primeuix/styles`, `rxjs`.
- **PrimeVue:** internal `primevue/button`, `primevue/ripple`, `primevue/tooltip`, `@primevue/icons/plus`; external `@primeuix/styled`, `@primeuix/utils`, `@primeuix/styles`.
- **PrimeReact:** internal `../button/Button`, `../hooks/Hooks`, `../icons/plus`, `../icons/minus`, `../ripple/Ripple`, `../utils/Utils`; no external Prime packages.

## 11. Framework differences

| Aspect                | PrimeNG                                      | PrimeVue                                      | PrimeReact                           |
| --------------------- | -------------------------------------------- | --------------------------------------------- | ------------------------------------ |
| Visibility binding    | Two-way `[(visible)]` plus `onVisibleChange` | One-way `visible`; no `update:visible`        | Controlled via `onVisibleChange`     |
| Action element        | `pButton` (secondary, rounded, small)        | `Button` configurable via `actionButtonProps` | `<a href>` with Ripple               |
| Item tooltip          | Built in via `tooltipOptions`                | Built in via `tooltipOptions`                 | Not built in; use a separate Tooltip |
| Toggler customisation | `buttonProps`, `#button` template            | `buttonProps`, `button` slot                  | `buttonTemplate`, `buttonClassName`  |
| Open-state class      | `p-speeddial-open`                           | `p-speeddial-open`                            | `p-speeddial-opened`                 |
| Default hide icon     | Same plus icon (rotated)                     | Same plus icon (rotated)                      | Minus icon                           |
| Imperative API        | None                                         | None                                          | `show()`, `hide()`, `getElement()`   |
| Extra events          | `onShow`, `onHide`, `onClick`                | `click`, `show`, `hide`, `focus`, `blur`      | `onClick`, `onShow`, `onHide`        |
| Styling               | `@primeuix/styles` + tokens                  | `@primeuix/styles` + tokens                   | Own CSS in `SpeedDialBase.js`        |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/speeddial/speeddial.ts`
- `primeng-21.1.9:packages/primeng/src/speeddial/style/speeddialstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/speeddial/speeddial.types.ts`
- `primeng-21.1.9:apps/showcase/pages/speeddial/index.ts`
- `primevue-4.5.5:packages/primevue/src/speeddial/SpeedDial.vue`
- `primevue-4.5.5:packages/primevue/src/speeddial/BaseSpeedDial.vue`
- `primevue-4.5.5:packages/primevue/src/speeddial/SpeedDial.d.ts`
- `primevue-4.5.5:packages/primevue/src/speeddial/style/SpeedDialStyle.js`
- `primevue-4.5.5:apps/showcase/pages/speeddial/index.vue`
- `primevue-4.5.5:apps/showcase/doc/speeddial/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/speeddial/theming/index.vue`
- `primereact-10.9.9:components/lib/speeddial/SpeedDial.js`
- `primereact-10.9.9:components/lib/speeddial/SpeedDialBase.js`
- `primereact-10.9.9:components/lib/speeddial/speeddial.d.ts`
- `primereact-10.9.9:components/lib/hooks/useGlobalOnEscapeKey.js`
- `primereact-10.9.9:pages/speeddial/index.js`
- `@primeuix/styles-2.0.3:dist/speeddial/index.mjs`
- `@primeuix/themes-2.0.3:types/speeddial/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/speeddial/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (`speeddial`), `docs/prime-reference/catalog/primevue.json` (`speeddial`, `speeddialstyle`), `docs/prime-reference/catalog/primereact.json` (`speeddial`)
- Showcase doc files cited in §6 and §7.
