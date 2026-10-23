# Popover

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Popover is a non-modal container anchored to a trigger element. It holds arbitrary content, shows an arrow pointing at the target, flips above the target when there is no room below, and closes on outside click, Escape, scrolling of the target's scroll parents or window resize. It has no `visible` binding: it is driven imperatively through a component reference with `toggle(event, target?)`, `show(event, target?)` and `hide()`. PrimeNG and PrimeVue ship it as `Popover`; PrimeReact 10.9.9 still ships the same component under its earlier name `OverlayPanel` (`primeng-21.1.9:packages/primeng/src/popover/popover.ts`, `primevue-4.5.5:packages/primevue/src/popover/Popover.vue`, `primereact-10.9.9:components/lib/overlaypanel/OverlayPanel.js`).

## 2. Names & status

- Canonical name: **Popover** (glossary term; avoid "OverlayPanel").
- PrimeNG: only `Popover` (`p-popover`, `PopoverModule`); there is no `overlaypanel` folder. The template doc text still says "Content of the OverlayPanel is defined by content template" (`primeng-21.1.9:apps/showcase/doc/popover/template-doc.ts`).
- PrimeVue: `Popover` is current. `OverlayPanel` is a deprecated wrapper that extends `Popover` and logs `Deprecated since v4. Use Popover component instead.` on mount; its typings carry `@deprecated since v4. Use Popover component instead.` and its style module only renames `BaseStyle` to `overlaypanel` (`primevue-4.5.5:packages/primevue/src/overlaypanel/OverlayPanel.vue`, `primevue-4.5.5:packages/primevue/src/overlaypanel/OverlayPanel.d.ts`, `primevue-4.5.5:packages/primevue/src/overlaypanel/style/OverlayPanelStyle.js`).
- PrimeReact: only `OverlayPanel` (`primereact/overlaypanel`); not deprecated, no `Popover` export (`primereact-10.9.9:components/lib/overlaypanel/overlaypanel.d.ts`).
- PrimeNG deprecations: `showTransitionOptions` and `hideTransitionOptions` (`@deprecated since v21.0.0. Use motionOptions instead.`).
- Menus: "Popover" in PrimeNG and PrimeVue, "OverlayPanel" in PrimeReact, all under Overlay (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect           | PrimeNG                                                                                              | PrimeVue                                                                                                | PrimeReact                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Import           | `import { PopoverModule } from 'primeng/popover'` (component `Popover` is standalone)                | `import Popover from 'primevue/popover'`                                                                | `import { OverlayPanel } from 'primereact/overlaypanel'`                                  |
| Selector / tag   | `<p-popover #op>`                                                                                    | `<Popover ref="op">` (deprecated `<OverlayPanel>`)                                                      | `<OverlayPanel ref={op} />`                                                               |
| Source           | `packages/primeng/src/popover/popover.ts`, `style/popoverstyle.ts`, `types/popover/popover.types.ts` | `packages/primevue/src/popover/Popover.vue`, `BasePopover.vue`, `Popover.d.ts`, `style/PopoverStyle.js` | `components/lib/overlaypanel/OverlayPanel.js`, `OverlayPanelBase.js`, `overlaypanel.d.ts` |
| Rendering layer  | inline template; container moved to `appendTo` on enter; `pMotion` named `p-anchored-overlay`        | `<Portal :appendTo>` + `<transition name="p-anchored-overlay">`                                         | `<Portal appendTo>` + `CSSTransition` (`p-overlaypanel`, 120 ms in / 100 ms out)          |
| Focus            | focuses `[autofocus]` inside when `focusOnShow`; no trap                                             | `v-focustrap`; focuses `[autofocus]` inside                                                             | none                                                                                      |
| Required service | `OverlayService` from `primeng/api` (injected internally, root-provided)                             | none (uses the `OverlayEventBus` module internally)                                                     | none (uses the `OverlayService` emitter internally)                                       |

Sources: `primeng-21.1.9:apps/showcase/doc/popover/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/ImportDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/importdoc.js`.

## 4. Anatomy

| Part         | PrimeNG PT key      | PrimeVue PT key | PrimeReact PT key | Class (NG/Vue)                      | Class (React)                                 |
| ------------ | ------------------- | --------------- | ----------------- | ----------------------------------- | --------------------------------------------- |
| Root         | `root` (`host` too) | `root`          | `root`            | `p-popover` (+ `p-popover-flipped`) | `p-overlaypanel` (+ `p-overlaypanel-flipped`) |
| Content      | `content`           | `content`       | `content`         | `p-popover-content`                 | `p-overlaypanel-content`                      |
| Close button | —                   | —               | `closeButton`     | —                                   | `p-overlaypanel-close p-link`                 |
| Close icon   | —                   | —               | `closeIcon`       | —                                   | `p-overlaypanel-close-icon`                   |

The arrow is drawn with `::before` / `::after` pseudo-elements, positioned through a CSS variable set during alignment (`popover.arrow.left` token variable in NG/Vue, `--overlayArrowLeft` in React). Flipping also sets `data-p-popover-flipped` (NG/Vue) or `data-p-overlaypanel-flipped` (React). PrimeNG adds a `motion` PT entry; PrimeVue and PrimeReact have `transition` and `hooks` (`primeng-21.1.9:packages/primeng/src/types/popover/popover.types.ts`, `primeng-21.1.9:packages/primeng/src/popover/style/popoverstyle.ts`, `primevue-4.5.5:packages/primevue/src/popover/Popover.d.ts`, `primevue-4.5.5:packages/primevue/src/popover/style/PopoverStyle.js`, `primereact-10.9.9:components/lib/overlaypanel/OverlayPanelBase.js`).

## 5. API highlights

| Member          | PrimeNG                                                                            | PrimeVue                                                                     | PrimeReact                                                                                          |
| --------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Methods         | `toggle(event, target?)`, `show(event, target?)`, `hide()`, `align()`              | `toggle(event, target?)`, `show(event, target?)`, `hide()`, `alignOverlay()` | `toggle(event, target?)`, `show(event, target)`, `hide()`, `align()`, `isVisible()`, `getElement()` |
| `dismissable`   | `true`                                                                             | `true`                                                                       | `true`                                                                                              |
| `closeOnEscape` | — (Escape always hides via `document:keydown.escape`)                              | `true`                                                                       | `true`                                                                                              |
| `appendTo`      | signal input, default `'body'` (falls back to `config.overlayAppendTo()` if unset) | `'body'`                                                                     | `null` → `document.body` (`'self'`, `HTMLElement`, fn)                                              |
| Z-index         | `autoZIndex = true`, `baseZIndex = 0` (added to `config.zIndex.overlay`)           | `autoZIndex = true`, `baseZIndex = 0`                                        | auto from context/`PrimeReact.autoZIndex`, `zIndex.overlay`                                         |
| `breakpoints`   | —                                                                                  | `PopoverBreakpoints` (max-width → width)                                     | `OverlayPanelBreakpoints`                                                                           |
| Close button    | —                                                                                  | —                                                                            | `showCloseIcon = false`, `closeIcon`, `ariaCloseLabel`                                              |
| Focus           | `focusOnShow = true`                                                               | always (`[autofocus]`)                                                       | —                                                                                                   |
| ARIA inputs     | `ariaLabel`, `ariaLabelledBy`, `ariaCloseLabel` (declared, unused)                 | attributes fall through to root                                              | attributes fall through to root                                                                     |
| Styling         | `style`, `styleClass`                                                              | `class`/`style` attrs, `pt`                                                  | `id`, `className`, `style`                                                                          |
| Animation       | `motionOptions`; `showTransitionOptions` / `hideTransitionOptions` (deprecated)    | `transition` PT                                                              | `transitionOptions`                                                                                 |

Events: PrimeNG `onShow`, `onHide`; PrimeVue `show`, `hide`; PrimeReact `onShow`, `onHide`.

Templates / slots:

- PrimeNG: projected content, or `#content` template with `{ closeCallback }`.
- PrimeVue: `default`, `container` (`closeCallback`, `keydownCallback`).
- PrimeReact: `children`.

Sources: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `primeng-21.1.9:packages/primeng/src/popover/popover.ts`, `primevue-4.5.5:packages/primevue/src/popover/BasePopover.vue`, `primereact-10.9.9:components/lib/overlaypanel/OverlayPanelBase.js`, `primereact-10.9.9:components/lib/overlaypanel/overlaypanel.d.ts`.

## 6. Usage guidance

- **Import.** Register the module or import the component (`primeng-21.1.9:apps/showcase/doc/popover/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/ImportDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/importdoc.js`).
- **Basic.** Hold a reference to the popover and call `toggle` / `show` / `hide` from the trigger's click handler, passing the DOM event (`primeng-21.1.9:apps/showcase/doc/popover/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/BasicDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/basicdoc.js`).
- **Select data.** Read a choice made inside the popover and hide it afterwards (`primeng-21.1.9:apps/showcase/doc/popover/selectdata-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/SelectDataDoc.vue`).
- **DataTable.** Keep a single popover outside row-iterating components instead of one per row, and reposition it with `show(event)` per row; the React example also shows `showCloseIcon`, `closeOnEscape` and `dismissable={false}` (`primeng-21.1.9:apps/showcase/doc/popover/datatable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/DataTableDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/datatabledoc.js`).
- **Target (NG only).** The second `show` argument aligns the popover to another element than the event target (`primeng-21.1.9:apps/showcase/doc/popover/target-doc.ts`).
- **Template (NG only).** Provide content with the `#content` template and its `closeCallback` (`primeng-21.1.9:apps/showcase/doc/popover/template-doc.ts`).
- **Style / theming.** PrimeVue and PrimeReact document styled and Tailwind theming pages; PrimeReact lists the `p-overlaypanel-*` classes (`primevue-4.5.5:apps/showcase/doc/popover/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/popover/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/styledoc.js`, `primereact-10.9.9:components/doc/overlaypanel/theming/styleddoc.js`, `primereact-10.9.9:components/doc/overlaypanel/theming/tailwinddoc.js`).
- **Services.** No application-level service is needed. Internally each framework uses an overlay click bus so that clicks inside nested overlays (for example a Select opened inside the popover) are not treated as outside clicks: PrimeNG `OverlayService.clickObservable`, PrimeVue `OverlayEventBus` (`overlay-click`), PrimeReact `OverlayService` (`overlay-click`).

## 7. Accessibility

- Root has `role="dialog"` and `aria-modal` bound to the visible state in NG and Vue (`primeng-21.1.9:packages/primeng/src/popover/popover.ts`, `primevue-4.5.5:packages/primevue/src/popover/Popover.vue`). PrimeReact sets no role or `aria-modal` on the root (`primereact-10.9.9:components/lib/overlaypanel/OverlayPanel.js`).
- Doc/source mismatches: all three accessibility docs say `aria-modal` is added "since focus is kept within the popup" and that the component "adds aria-expanded state attribute and aria-controls to the trigger". No source sets trigger attributes; only PrimeVue traps focus; PrimeReact sets neither role nor `aria-modal` (`primeng-21.1.9:apps/showcase/doc/popover/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/popover/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/overlaypanel/accessibilitydoc.js`).
- Labelling: NG has `ariaLabel` / `ariaLabelledBy` inputs; Vue and React pass `aria-*` attributes through to the root.
- Keyboard (docs): `Tab` / `Shift+Tab` move within the popup; `Escape` closes and returns focus to the trigger; `Enter` / `Space` on the close button close it (NG and React docs; NG has no close button).
- Escape handling: PrimeNG `@HostListener('document:keydown.escape')` always hides, without a `closeOnEscape` switch or focus return; PrimeVue uses a document keydown listener gated by `closeOnEscape` and focuses the target from the content keydown handler; PrimeReact uses `useGlobalOnEscapeKey` with `ESC_KEY_HANDLING_PRIORITIES.OVERLAY_PANEL` and `useDisplayOrder('overlay-panel')`.
- Initial focus goes to an `[autofocus]` element inside the popup when present (NG requires `focusOnShow`).

## 8. Theming

- Style module: `@primeuix/styles/popover` (`primeng-21.1.9:packages/primeng/src/popover/style/popoverstyle.ts`, `primevue-4.5.5:packages/primevue/src/popover/style/PopoverStyle.js`, `@primeuix/styles-2.0.3:dist/popover/index.mjs`). It styles `.p-popover`, `.p-popover-content`, the arrow pseudo-elements and `.p-popover-flipped`. PrimeNG adds an inline `position: absolute` on the root.
- Design tokens (`popover`): `root.{background, borderColor, color, borderRadius, shadow, gutter, arrowOffset}`, `content.padding` (`@primeuix/themes-2.0.3:types/popover/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). The arrow position is written at runtime to the `popover.arrow.left` variable.
- Animations come from the shared `p-anchored-overlay` enter/leave classes in NG and Vue.
- PrimeReact: classes and structural CSS (arrow, flip, `p-overlaypanel-enter|exit` transitions) in `OverlayPanelBase.js`; styled-mode colours come from the theme, no design tokens (`primereact-10.9.9:components/lib/overlaypanel/OverlayPanelBase.js`). Note: the React source adds the `p-overlaypanel-flipped` class only when `isUnstyled` is true, the inverse of the NG/Vue `!unstyled` check; styled mode relies on the `data-p-overlaypanel-flipped` attribute instead.
- Pass-through keys: see §4.

## 9. Relationships

- Uses: Portal (Vue/React), FocusTrap (Vue), Ripple (Vue import, React close button), `TimesIcon` (React).
- Often hosts other components (DataTable, Listbox, forms); child overlays inside it are kept open by the overlay click bus.
- Related: Tooltip (anchored, text only, hover/focus driven), ConfirmPopup (anchored confirmation with the same arrow/flip logic), Dialog and Drawer (modal surfaces).
- PrimeVue `OverlayPanel` is a thin alias of this component.

### Shared overlay machinery

- **Z-index.** Popover registers in the `overlay` group (base 1000): `ZIndexUtils.set('overlay', container, baseZIndex + config.zIndex.overlay)` in PrimeNG, `ZIndex.set('overlay', el, baseZIndex || $primevue.config.zIndex.overlay)` in PrimeVue, `ZIndexUtils.set('overlay', el, autoZIndex, zIndex.overlay)` in PrimeReact. See [dialog.md](dialog.md) for the group table.
- **Positioning.** `absolutePosition(container, target)` from `@primeuix/utils` (NG/Vue) or `DomHandler.absolutePosition` (React); PrimeVue also re-aligns on content size changes via `ResizeObserver`.
- **Dismissal.** Outside click on the document (`touchstart` on iOS in NG); scrolling any scroll parent of the target via `ConnectedOverlayScrollHandler` (NG `primeng/dom`, Vue `@primevue/core/utils`); window resize on non-touch devices. PrimeReact wraps all three in `useOverlayListener` and, with `hideOverlaysOnDocumentScrolling`, also hides on document scroll.

## 10. Dependencies

- PrimeNG: `primeng/api` (`OverlayService`, `SharedModule`), `primeng/dom` (`ConnectedOverlayScrollHandler`), `primeng/utils` (`ZIndexUtils`), `primeng/motion`, `primeng/bind`, `@primeuix/utils`, `@primeuix/styled` (`$dt`), `@primeuix/motion`, `@primeuix/styles/popover`.
- PrimeVue: `primevue/portal`, `primevue/focustrap`, `primevue/overlayeventbus`, `primevue/ripple`, `@primevue/core/utils` (`ConnectedOverlayScrollHandler`), `@primeuix/utils/dom`, `@primeuix/utils/zindex`, `@primeuix/styled`, `@primeuix/styles/popover`.
- PrimeReact: `../portal/Portal`, `../csstransition/CSSTransition`, `../overlayservice/OverlayService`, `../ripple/Ripple`, `../hooks/Hooks` (`useOverlayListener`, `useGlobalOnEscapeKey`, `useDisplayOrder`), `../utils/Utils` (`ZIndexUtils`, `DomHandler`), `../icons/times`.

## 11. Framework differences

| Aspect                | PrimeNG                                        | PrimeVue                              | PrimeReact                            |
| --------------------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------- |
| Name                  | `Popover`                                      | `Popover` (deprecated `OverlayPanel`) | `OverlayPanel`                        |
| Root `role`           | `dialog` + `aria-modal`                        | `dialog` + `aria-modal`               | none                                  |
| Focus trap            | no                                             | yes                                   | no                                    |
| `closeOnEscape`       | not configurable                               | prop                                  | prop                                  |
| Built-in close button | no                                             | no                                    | `showCloseIcon`                       |
| `breakpoints`         | no                                             | yes                                   | yes                                   |
| Default `appendTo`    | `'body'`                                       | `'body'`                              | `document.body`                       |
| Headless              | `#content` template with `closeCallback`       | `container` slot                      | no                                    |
| Animation API         | `motionOptions`; transition options deprecated | `<transition>` + PT                   | `transitionOptions` (`CSSTransition`) |
| Theming               | `@primeuix` tokens + styles                    | `@primeuix` tokens + styles           | own classes, no tokens                |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/popover/popover.ts`
- `primeng-21.1.9:packages/primeng/src/popover/style/popoverstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/popover/popover.types.ts`
- `primeng-21.1.9:apps/showcase/doc/popover/` (`import-doc.ts`, `basic-doc.ts`, `selectdata-doc.ts`, `datatable-doc.ts`, `target-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/pages/popover/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/popover/Popover.vue`
- `primevue-4.5.5:packages/primevue/src/popover/BasePopover.vue`
- `primevue-4.5.5:packages/primevue/src/popover/Popover.d.ts`
- `primevue-4.5.5:packages/primevue/src/popover/style/PopoverStyle.js`
- `primevue-4.5.5:packages/primevue/src/overlaypanel/OverlayPanel.vue`
- `primevue-4.5.5:packages/primevue/src/overlaypanel/OverlayPanel.d.ts`
- `primevue-4.5.5:packages/primevue/src/overlaypanel/style/OverlayPanelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/popover/` (`ImportDoc.vue`, `BasicDoc.vue`, `SelectDataDoc.vue`, `DataTableDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/doc/popover/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/popover/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/popover/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/overlaypanel/OverlayPanel.js`
- `primereact-10.9.9:components/lib/overlaypanel/OverlayPanelBase.js`
- `primereact-10.9.9:components/lib/overlaypanel/overlaypanel.d.ts`
- `primereact-10.9.9:components/doc/overlaypanel/` (`importdoc.js`, `basicdoc.js`, `datatabledoc.js`, `accessibilitydoc.js`, `styledoc.js`)
- `primereact-10.9.9:components/doc/overlaypanel/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/overlaypanel/theming/tailwinddoc.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/popover/index.mjs`
- `@primeuix/themes-2.0.3:types/popover/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
