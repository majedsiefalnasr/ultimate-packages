# Drawer

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Drawer is a panel that slides in from an edge of the viewport (left, right, top, bottom) or covers the whole screen, usually above a modal mask. Visibility is bound to a `visible` property, and the panel has an optional header, a close button, a content area and (NG/Vue) a footer. PrimeNG and PrimeVue ship it as `Drawer`; PrimeReact 10.9.9 still ships the same component under its earlier name `Sidebar` (`primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`, `primevue-4.5.5:packages/primevue/src/drawer/Drawer.vue`, `primereact-10.9.9:components/lib/sidebar/Sidebar.js`).

## 2. Names & status

- Canonical name: **Drawer** (glossary term; avoid "Sidebar").
- PrimeNG: only `Drawer` (`p-drawer`, `DrawerModule`). There is no `sidebar` folder; the class JSDoc still opens with "Sidebar is a panel component..." (`primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`).
- PrimeVue: `Drawer` is current. `Sidebar` is a deprecated wrapper that extends `Drawer` and logs `Deprecated since v4. Use Drawer component instead.` on mount; its typings are marked `@deprecated since v4. Use Drawer component instead.` and its style module only renames `BaseStyle` to `sidebar` (`primevue-4.5.5:packages/primevue/src/sidebar/Sidebar.vue`, `primevue-4.5.5:packages/primevue/src/sidebar/Sidebar.d.ts`, `primevue-4.5.5:packages/primevue/src/sidebar/style/SidebarStyle.js`).
- PrimeReact: only `Sidebar` (`primereact/sidebar`); not deprecated, no `Drawer` export (`primereact-10.9.9:components/lib/sidebar/sidebar.d.ts`).
- PrimeNG deprecations: `showCloseIcon` (`@deprecated use 'closable' instead`) and `transitionOptions` (`@deprecated since v21.0.0`, use `motionOptions`). `styleClass` is still a plain `@Input()` here.
- Menus: "Drawer" in PrimeNG and PrimeVue, "Sidebar" in PrimeReact, all under Overlay (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect           | PrimeNG                                                                                         | PrimeVue                                                                                           | PrimeReact                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Import           | `import { DrawerModule } from 'primeng/drawer'` (component `Drawer` is standalone)              | `import Drawer from 'primevue/drawer'`                                                             | `import { Sidebar } from 'primereact/sidebar'`                        |
| Selector / tag   | `<p-drawer>`                                                                                    | `<Drawer>` (deprecated `<Sidebar>`)                                                                | `<Sidebar />`                                                         |
| Source           | `packages/primeng/src/drawer/drawer.ts`, `style/drawerstyle.ts`, `types/drawer/drawer.types.ts` | `packages/primevue/src/drawer/Drawer.vue`, `BaseDrawer.vue`, `Drawer.d.ts`, `style/DrawerStyle.js` | `components/lib/sidebar/Sidebar.js`, `SidebarBase.js`, `sidebar.d.ts` |
| Rendering layer  | inline template; `appendTo` moves the panel; mask element created in `document.body`            | `<Portal>` (no `appendTo` prop, so always body) + `<transition name="p-drawer">`                   | `<Portal appendTo>` + `CSSTransition`                                 |
| Focus            | `pFocusTrap` directive                                                                          | `v-focustrap`                                                                                      | focuses the close icon on show; no focus trap                         |
| Required service | none                                                                                            | none                                                                                               | none                                                                  |

Sources: `primeng-21.1.9:apps/showcase/doc/drawer/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/ImportDoc.vue`, `primereact-10.9.9:components/doc/sidebar/importdoc.js`.

## 4. Anatomy

| Part         | PrimeNG PT key      | PrimeVue PT key | PrimeReact PT key                              | Class (NG/Vue)                                                     | Class (React)                                                            |
| ------------ | ------------------- | --------------- | ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Mask         | — (no PT key)       | `mask`          | `mask`                                         | `p-drawer-mask` (+ `p-overlay-mask` when modal, + `p-drawer-full`) | `p-sidebar-mask` (+ `p-sidebar-<pos>`, `p-component-overlay` when modal) |
| Root         | `root` (`host` too) | `root`          | `root`                                         | `p-drawer` (+ `p-drawer-<pos>`, `p-drawer-open`, `p-drawer-full`)  | `p-sidebar`                                                              |
| Header       | `header`            | `header`        | `header`                                       | `p-drawer-header`                                                  | `p-sidebar-header` (+ `p-sidebar-custom-header`)                         |
| Title        | `title`             | `title`         | —                                              | `p-drawer-title`                                                   | —                                                                        |
| Icons area   | —                   | —               | `icons`                                        | —                                                                  | `p-sidebar-icons`                                                        |
| Close button | `pcCloseButton`     | `pcCloseButton` | `closeButton`, `closeButtonIcon` / `closeIcon` | `p-drawer-close-button`                                            | `p-sidebar-close p-sidebar-icon p-link`, icon `p-sidebar-close-icon`     |
| Content      | `content`           | `content`       | `content`                                      | `p-drawer-content`                                                 | `p-sidebar-content`                                                      |
| Footer       | `footer`            | `footer`        | —                                              | `p-drawer-footer`                                                  | —                                                                        |

PrimeNG adds a `motion` PT entry; PrimeVue and PrimeReact have `transition` and `hooks` (`primeng-21.1.9:packages/primeng/src/types/drawer/drawer.types.ts`, `primeng-21.1.9:packages/primeng/src/drawer/style/drawerstyle.ts`, `primevue-4.5.5:packages/primevue/src/drawer/Drawer.d.ts`, `primevue-4.5.5:packages/primevue/src/drawer/style/DrawerStyle.js`, `primereact-10.9.9:components/lib/sidebar/SidebarBase.js`).

## 5. API highlights

| Member               | PrimeNG                                                                    | PrimeVue                                                             | PrimeReact                                                        |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Visibility           | `visible` + `visibleChange` (`[(visible)]`)                                | `visible = false` + `update:visible` (`v-model:visible`)             | `visible = false` + `onHide`                                      |
| `position`           | `'left' \| 'right' \| 'bottom' \| 'top' \| 'full'`, default `'left'`       | `'left' \| 'right' \| 'top' \| 'bottom' \| 'full'`, default `'left'` | `'top' \| 'bottom' \| 'left' \| 'right'`, default `'left'`        |
| Full screen          | `fullScreen = false` (separate input) or `position="full"`                 | `position="full"` only                                               | `fullScreen = false`                                              |
| `header`             | `string`                                                                   | `string`                                                             | `ReactNode \| Function`                                           |
| `modal`              | `true`                                                                     | `true`                                                               | `true`                                                            |
| Dismiss on mask      | `dismissible = true`                                                       | `dismissable = true`                                                 | `dismissable = true`                                              |
| `closeOnEscape`      | `true`                                                                     | `true`                                                               | `true`                                                            |
| Close button         | `closable = true`, `showCloseIcon = true` (deprecated), `closeButtonProps` | `showCloseIcon = true`, `closeButtonProps`, `closeIcon`              | `showCloseIcon = true`, `closeIcon`, `icons` (extra header icons) |
| Default button props | `{ severity: 'secondary', text: true, rounded: true }`                     | same                                                                 | — (plain `button` with Ripple)                                    |
| `blockScroll`        | `false`                                                                    | `false`                                                              | `false`                                                           |
| `appendTo`           | signal input; falls back to `config.overlayAppendTo()`                     | — (Portal to body)                                                   | `null` → `document.body`                                          |
| Z-index              | `autoZIndex = true`, `baseZIndex = 0`                                      | `autoZIndex = true`, `baseZIndex = 0`                                | `baseZIndex = 0` (auto from context/`PrimeReact.autoZIndex`)      |
| Close label          | `ariaCloseLabel`                                                           | locale `aria.close`                                                  | `ariaCloseLabel` (falls back to locale `close`)                   |
| Styling              | `style`, `styleClass`, `maskStyle`                                         | `class`/`style` attrs, `pt`                                          | `className`, `style`, `maskClassName`, `maskStyle`                |
| Animation            | `motionOptions`; `transitionOptions` (deprecated)                          | `transition` PT                                                      | `transitionOptions`                                               |

Events:

- PrimeNG outputs: `onShow`, `onHide`, `visibleChange`.
- PrimeVue emits: `update:visible`, `show`, `after-show`, `hide`, `before-hide`, `after-hide`.
- PrimeReact callbacks: `onShow`, `onHide`; ref methods `getElement`, `getMask`, `getCloseIcon`.

Templates / slots:

- PrimeNG: `header`, `content`, `footer`, `closeicon`, `headless`.
- PrimeVue: `default`, `header`, `footer`, `closebutton` (`closeCallback`), `closeicon`, `container` (`closeCallback`).
- PrimeReact: `children`, `header`, `icons`, `content` (headless; receives `{ closeIconRef, hide }`).

Sources: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`, `primevue-4.5.5:packages/primevue/src/drawer/BaseDrawer.vue`, `primereact-10.9.9:components/lib/sidebar/SidebarBase.js`, `primereact-10.9.9:components/lib/sidebar/sidebar.d.ts`.

## 6. Usage guidance

- **Import.** Register the module or import the component (`primeng-21.1.9:apps/showcase/doc/drawer/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/ImportDoc.vue`, `primereact-10.9.9:components/doc/sidebar/importdoc.js`).
- **Basic.** Bind `visible` two-way (NG/Vue) or pair `visible` with an `onHide` that clears it (React); the header text comes from `header` (`primeng-21.1.9:apps/showcase/doc/drawer/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/BasicDoc.vue`, `primereact-10.9.9:components/doc/sidebar/basicdoc.js`).
- **Position.** `position` picks the edge; top and bottom examples override the height to `auto` (`primeng-21.1.9:apps/showcase/doc/drawer/position-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/PositionDoc.vue`, `primereact-10.9.9:components/doc/sidebar/positiondoc.js`).
- **Size.** There is no size prop; widths are set with responsive utility classes (`styleClass` in NG, `class` in Vue, `className` in React) (`primeng-21.1.9:apps/showcase/doc/drawer/size-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/SizeDoc.vue`, `primereact-10.9.9:components/doc/sidebar/sizedoc.js`).
- **Full screen.** NG uses `[fullScreen]="true"`, Vue uses `position="full"`, React uses `fullScreen` (`primeng-21.1.9:apps/showcase/doc/drawer/fullscreen-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/FullScreenDoc.vue`, `primereact-10.9.9:components/doc/sidebar/fullscreendoc.js`).
- **Template.** Replace the header with custom markup (NG example also hides the close button with `[closable]="false"`); NG/Vue add a footer (`primeng-21.1.9:apps/showcase/doc/drawer/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/TemplateDoc.vue`, `primereact-10.9.9:components/doc/sidebar/templatedoc.js`).
- **Headless.** Render the whole panel yourself with the `headless` template (NG), `container` slot (Vue) or `content` prop (React), using the supplied close callback (`primeng-21.1.9:apps/showcase/doc/drawer/headless-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/HeadlessDoc.vue`, `primereact-10.9.9:components/doc/sidebar/headlessdoc.js`).
- **Style / theming (React).** Lists the `p-sidebar-*` classes and the styled/unstyled theming pages (`primereact-10.9.9:components/doc/sidebar/styledoc.js`, `primereact-10.9.9:components/doc/sidebar/theming/styleddoc.js`, `primereact-10.9.9:components/doc/sidebar/theming/tailwinddoc.js`).
- No service is required in any framework.

## 7. Accessibility

- Role: PrimeNG and PrimeReact render a fixed `role="complementary"`; PrimeVue uses `role="dialog"` with `aria-modal="true"` when `modal`, and `complementary` otherwise (`primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`, `primevue-4.5.5:packages/primevue/src/drawer/Drawer.vue`, `primereact-10.9.9:components/lib/sidebar/Sidebar.js`).
- Doc/source mismatch: all three accessibility docs say `aria-modal` is added when modal, but neither the PrimeNG nor the PrimeReact source sets it. The docs also tell the app to give the trigger `aria-expanded` and `aria-controls`; no source does this (`primeng-21.1.9:apps/showcase/doc/drawer/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/drawer/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/sidebar/accessibilitydoc.js`).
- The role can be overridden with attributes on the root (the Vue doc example uses `role="region"`) and labelled with `aria-labelledby`.
- Keyboard: `Tab` / `Shift+Tab` move through focusable elements (trapped in NG/Vue); `Escape` closes when `closeOnEscape`; `Enter` / `Space` activate the close button.
- Escape handling: PrimeNG listens on the document and closes only the drawer with the highest `modal` z-index; PrimeVue uses a document keydown listener; PrimeReact uses `useGlobalOnEscapeKey` with `ESC_KEY_HANDLING_PRIORITIES.SIDEBAR` and `useDisplayOrder('sidebar')`.
- Initial focus: PrimeVue focuses an `[autofocus]` element in header/content/footer, else the close button; PrimeReact focuses the close icon.

## 8. Theming

- Style module: `@primeuix/styles/drawer` (`primeng-21.1.9:packages/primeng/src/drawer/style/drawerstyle.ts`, `primevue-4.5.5:packages/primevue/src/drawer/style/DrawerStyle.js`, `@primeuix/styles-2.0.3:dist/drawer/index.mjs`). It covers the panel, header/title/content/footer, the four edge classes `p-drawer-left|right|top|bottom`, `p-drawer-full`, `p-drawer-open` and the `p-drawer-enter-active` / `p-drawer-leave-active` transitions.
- PrimeNG appends its own CSS to the shared module: `position: fixed`, 20rem width for left/right, 10rem height for top/bottom, and keyframe animations `p-drawer-enter-<pos>` / `p-drawer-leave-<pos>` (0.5s `cubic-bezier(0.32, 0.72, 0, 1)`) for `pMotion`.
- Design tokens (`drawer`): `root.{background, borderColor, color, shadow}`, `header.padding`, `title.{fontSize, fontWeight}`, `content.padding`, `footer.padding` (`@primeuix/themes-2.0.3:types/drawer/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). The modal mask uses the shared `mask` tokens via `p-overlay-mask`.
- PrimeVue `inlineStyles` set the mask to a fixed full-viewport flex container and switch `pointer-events` off when not modal.
- PrimeReact: classes from `SidebarBase.js`, including legacy `p-sidebar-sm|md|lg` size classes and `p-sidebar-mask-scrollblocker`; styled-mode CSS comes from the theme, no design tokens (`primereact-10.9.9:components/lib/sidebar/SidebarBase.js`).
- Pass-through keys: see §4.

## 9. Relationships

- Uses: Button (close button, NG/Vue), FocusTrap (NG/Vue), Portal (Vue/React), Ripple (React), `TimesIcon`.
- Related: Dialog (centered window, same mask and z-index group), Popover (anchored, non-modal).
- Often hosts navigation menus such as PanelMenu or Menu.
- PrimeVue `Sidebar` is a thin alias of this component.
- Shared overlay machinery: Drawer registers in the `modal` z-index group (base 1100) like Dialog; PrimeNG puts the counter on the panel and sets the mask one below it, PrimeVue and PrimeReact put it on the mask. See the shared overlay section of [dialog.md](dialog.md).

## 10. Dependencies

- PrimeNG: `primeng/button`, `primeng/focustrap`, `primeng/dom` (`blockBodyScroll`, `unblockBodyScroll`), `primeng/utils` (`ZIndexUtils`), `primeng/motion`, `primeng/icons` (`TimesIcon`), `primeng/bind`, `@primeuix/motion`, `@primeuix/utils`, `@primeuix/styles/drawer`.
- PrimeVue: `primevue/button`, `primevue/focustrap`, `primevue/portal`, `primevue/utils` (`blockBodyScroll`), `@primeuix/utils/dom`, `@primeuix/utils/zindex`, `@primevue/icons/times`, `@primeuix/styles/drawer`.
- PrimeReact: `../portal/Portal`, `../csstransition/CSSTransition`, `../ripple/Ripple`, `../hooks/Hooks` (`useGlobalOnEscapeKey`, `useDisplayOrder`), `../utils/Utils` (`ZIndexUtils`, `DomHandler`), `../icons/times`.

## 11. Framework differences

| Aspect            | PrimeNG                                         | PrimeVue                        | PrimeReact                            |
| ----------------- | ----------------------------------------------- | ------------------------------- | ------------------------------------- |
| Name              | `Drawer`                                        | `Drawer` (deprecated `Sidebar`) | `Sidebar`                             |
| Full screen       | `fullScreen` input and `position="full"`        | `position="full"`               | `fullScreen`                          |
| Footer            | `footer` template                               | `footer` slot                   | not supported                         |
| Root role         | `complementary`                                 | `dialog` when modal             | `complementary`                       |
| `aria-modal`      | not set                                         | set when modal                  | not set                               |
| Focus trap        | yes                                             | yes                             | no                                    |
| Dismiss prop name | `dismissible`                                   | `dismissable`                   | `dismissable`                         |
| `appendTo`        | yes (global fallback)                           | no (always body)                | yes (`document.body`)                 |
| Animation API     | `motionOptions`; `transitionOptions` deprecated | `<transition>` + PT             | `transitionOptions` (`CSSTransition`) |
| Theming           | `@primeuix` tokens + styles, NG extra CSS       | `@primeuix` tokens + styles     | own classes, no tokens                |

Note: in PrimeNG the `p-drawer-full` class and the full-screen animation follow the `fullScreen` input, while the `data-p-full-screen` attribute follows `position === 'full'`, so the two ways to request full screen do not behave identically (`primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`, `primeng-21.1.9:packages/primeng/src/drawer/style/drawerstyle.ts`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/drawer/drawer.ts`
- `primeng-21.1.9:packages/primeng/src/drawer/style/drawerstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/drawer/drawer.types.ts`
- `primeng-21.1.9:apps/showcase/doc/drawer/` (`import-doc.ts`, `basic-doc.ts`, `position-doc.ts`, `size-doc.ts`, `fullscreen-doc.ts`, `template-doc.ts`, `headless-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/pages/drawer/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/drawer/Drawer.vue`
- `primevue-4.5.5:packages/primevue/src/drawer/BaseDrawer.vue`
- `primevue-4.5.5:packages/primevue/src/drawer/Drawer.d.ts`
- `primevue-4.5.5:packages/primevue/src/drawer/style/DrawerStyle.js`
- `primevue-4.5.5:packages/primevue/src/sidebar/Sidebar.vue`
- `primevue-4.5.5:packages/primevue/src/sidebar/Sidebar.d.ts`
- `primevue-4.5.5:packages/primevue/src/sidebar/style/SidebarStyle.js`
- `primevue-4.5.5:apps/showcase/doc/drawer/` (`ImportDoc.vue`, `BasicDoc.vue`, `PositionDoc.vue`, `SizeDoc.vue`, `FullScreenDoc.vue`, `TemplateDoc.vue`, `HeadlessDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/sidebar/Sidebar.js`
- `primereact-10.9.9:components/lib/sidebar/SidebarBase.js`
- `primereact-10.9.9:components/lib/sidebar/sidebar.d.ts`
- `primereact-10.9.9:components/doc/sidebar/` (`importdoc.js`, `basicdoc.js`, `positiondoc.js`, `sizedoc.js`, `fullscreendoc.js`, `templatedoc.js`, `headlessdoc.js`, `accessibilitydoc.js`, `styledoc.js`)
- `primereact-10.9.9:components/doc/sidebar/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/sidebar/theming/tailwinddoc.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/drawer/index.mjs`
- `@primeuix/themes-2.0.3:types/drawer/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
