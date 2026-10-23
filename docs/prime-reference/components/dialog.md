# Dialog

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Dialog is a floating window with a header (title, maximize and close buttons), a content area and an optional footer, shown over the page and optionally behind a modal mask. Visibility is bound to a `visible` property. It can be dragged, resized (NG/React), maximized, positioned at any edge or corner, sized per breakpoint, or rendered headless. Dialog is also the building block for ConfirmDialog and DynamicDialog. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`, `primevue-4.5.5:packages/primevue/src/dialog/Dialog.vue`, `primereact-10.9.9:components/lib/dialog/Dialog.js`).

## 2. Names & status

- Canonical name: **Dialog** in all three frameworks; no legacy aliases.
- Not deprecated. The only deprecated PrimeNG Dialog member is `transitionOptions` (`@deprecated since v21.0.0`, use `motionOptions`); `styleClass` is still a plain input on Dialog (`primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`).
- Listed under Overlay in every showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect          | PrimeNG                                                                                         | PrimeVue                                                                                           | PrimeReact                                                        |
| --------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Import          | `import { DialogModule } from 'primeng/dialog'` (component `Dialog` is standalone)              | `import Dialog from 'primevue/dialog'`                                                             | `import { Dialog } from 'primereact/dialog'`                      |
| Selector / tag  | `<p-dialog>`                                                                                    | `<Dialog>`                                                                                         | `<Dialog />`                                                      |
| Source          | `packages/primeng/src/dialog/dialog.ts`, `style/dialogstyle.ts`, `types/dialog/dialog.types.ts` | `packages/primevue/src/dialog/Dialog.vue`, `BaseDialog.vue`, `Dialog.d.ts`, `style/DialogStyle.js` | `components/lib/dialog/Dialog.js`, `DialogBase.js`, `dialog.d.ts` |
| Rendering layer | inline template; `appendTo` moves the mask element; `pMotion` animations                        | `<Portal :appendTo>` + `<transition>`                                                              | `<Portal appendTo>` + `CSSTransition`                             |
| Focus           | `pFocusTrap` directive (`primeng/focustrap`)                                                    | `v-focustrap` (disabled when not modal)                                                            | `<FocusTrap autoFocus={focusOnShow}>`                             |

Sources: `primeng-21.1.9:apps/showcase/doc/dialog/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/ImportDoc.vue`, `primereact-10.9.9:components/doc/dialog/importdoc.js`.

## 4. Anatomy

| Part            | PrimeNG PT key      | PrimeVue PT key    | PrimeReact PT key                      | Class (NG/Vue)                                                      | Class (React)                                                            |
| --------------- | ------------------- | ------------------ | -------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Mask            | `mask`              | `mask`             | `mask`                                 | `p-dialog-mask` (+ `p-overlay-mask` when modal, + `p-dialog-<pos>`) | `p-dialog-mask` (+ `p-component-overlay` when modal, + `p-dialog-<pos>`) |
| Root            | `root` (`host` too) | `root`             | `root`                                 | `p-dialog` (+ `p-dialog-maximized`)                                 | `p-dialog` (+ `p-dialog-maximized`, `p-dialog-rtl`)                      |
| Header          | `header`            | `header`           | `header`                               | `p-dialog-header`                                                   | `p-dialog-header`                                                        |
| Title           | `title`             | `title`            | `headerTitle`                          | `p-dialog-title`                                                    | `p-dialog-title`                                                         |
| Header actions  | `headerActions`     | `headerActions`    | `headerIcons`                          | `p-dialog-header-actions`                                           | `p-dialog-header-icons`                                                  |
| Maximize button | `pcMaximizeButton`  | `pcMaximizeButton` | `maximizableButton`, `maximizableIcon` | `p-dialog-maximize-button`                                          | `p-dialog-header-maximize`                                               |
| Close button    | `pcCloseButton`     | `pcCloseButton`    | `closeButton`, `closeButtonIcon`       | `p-dialog-close-button`                                             | `p-dialog-header-close`                                                  |
| Content         | `content`           | `content`          | `content`                              | `p-dialog-content`                                                  | `p-dialog-content`                                                       |
| Footer          | `footer`            | `footer`           | `footer`                               | `p-dialog-footer`                                                   | `p-dialog-footer`                                                        |
| Resize handle   | `resizeHandle`      | —                  | — (rendered when `resizable`)          | `p-resizable-handle`                                                | `p-resizable-handle`                                                     |

PrimeNG also has a `motion` PT entry; PrimeVue and PrimeReact have `transition` and `hooks` (`primeng-21.1.9:packages/primeng/src/types/dialog/dialog.types.ts`, `primeng-21.1.9:packages/primeng/src/dialog/style/dialogstyle.ts`, `primevue-4.5.5:packages/primevue/src/dialog/Dialog.d.ts`, `primereact-10.9.9:components/lib/dialog/DialogBase.js`, `primereact-10.9.9:components/lib/dialog/dialog.d.ts`).

## 5. API highlights

| Member            | PrimeNG                                                                                        | PrimeVue                                                                                                   | PrimeReact                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Visibility        | `visible` + `visibleChange` (`[(visible)]`)                                                    | `visible = false` + `update:visible` (`v-model:visible`)                                                   | `visible = false` + required `onHide`                                         |
| `modal`           | `false`                                                                                        | `false`                                                                                                    | `true`                                                                        |
| `header`          | `string`                                                                                       | `string`                                                                                                   | `ReactNode \| Function`                                                       |
| `footer`          | template only                                                                                  | `string` / slot                                                                                            | `ReactNode \| Function`                                                       |
| `appendTo`        | signal input; falls back to `config.overlayAppendTo()` (`'self'`)                              | `'body'`                                                                                                   | `document.body` (`null`, `HTMLElement`, `'self'`, fn)                         |
| `blockScroll`     | `false`                                                                                        | `false`                                                                                                    | `false`                                                                       |
| `dismissableMask` | `false`                                                                                        | `false`                                                                                                    | `false`                                                                       |
| `closable`        | `true`                                                                                         | `true`                                                                                                     | `true` (+ `showCloseIcon = true`)                                             |
| `closeOnEscape`   | `true`                                                                                         | `true`                                                                                                     | `true`                                                                        |
| `draggable`       | `true`                                                                                         | `true`                                                                                                     | `true`                                                                        |
| `resizable`       | `true`                                                                                         | —                                                                                                          | `true`                                                                        |
| `keepInViewport`  | `true`                                                                                         | `true`                                                                                                     | `true`                                                                        |
| `minX` / `minY`   | `0` / `0`                                                                                      | `0` / `0`                                                                                                  | `0` / `0`                                                                     |
| `maximizable`     | `false`                                                                                        | `false`                                                                                                    | `false` (+ controlled `maximized`)                                            |
| `position`        | `center`, `top`, `bottom`, `left`, `right`, `topleft`, `topright`, `bottomleft`, `bottomright` | same nine values, default `center`                                                                         | `center`, `top`, …, `top-left`, `bottom-right` (hyphenated), default `center` |
| `breakpoints`     | `breakpoints`                                                                                  | `DialogBreakpoints`                                                                                        | `DialogBreakpoints`                                                           |
| Z-index           | `autoZIndex = true`, `baseZIndex = 0`                                                          | `autoZIndex = true`, `baseZIndex = 0`                                                                      | `baseZIndex = 0` (auto from context/`PrimeReact.autoZIndex`)                  |
| Focus             | `focusOnShow = true`, `focusTrap = true`                                                       | always trapped when modal                                                                                  | `focusOnShow = true`                                                          |
| `role`            | `role = 'dialog'` input                                                                        | fixed `dialog`                                                                                             | fixed `dialog`                                                                |
| Animation         | `motionOptions`, `maskMotionOptions`; `transitionOptions` (deprecated)                         | `transition` PT                                                                                            | `transitionOptions: CSSTransitionProps`                                       |
| Button config     | `closeButtonProps`, `maximizeButtonProps`, `closeAriaLabel`, `closeTabindex = '0'`             | `closeButtonProps`, `maximizeButtonProps` (default `{ severity: 'secondary', text: true, rounded: true }`) | `ariaCloseIconLabel`                                                          |
| Icons             | `closeIcon`, `maximizeIcon`, `minimizeIcon`                                                    | same three                                                                                                 | same three (`IconType`)                                                       |

Events:

- PrimeNG outputs: `onShow`, `onHide`, `visibleChange`, `onMaximize`, `onDragEnd`, `onResizeInit`, `onResizeEnd`.
- PrimeVue emits: `show`, `hide`, `after-hide`, `update:visible`, `maximize`, `unmaximize`, `dragstart`, `dragend`.
- PrimeReact callbacks: `onShow`, `onHide`, `onClick`, `onMaskClick`, `onMaximize(DialogMaximizeEvent)`, `onDragStart`, `onDrag`, `onDragEnd`, `onResizeStart`, `onResize`, `onResizeEnd`; ref methods `getElement`, `getMask`, `getContent`, `getHeader`, `getFooter`, `getCloseButton`, `resetPosition`.

Templates / slots:

- PrimeNG: `header`, `content`, `footer`, `closeicon`, `maximizeicon`, `minimizeicon`, `headless`.
- PrimeVue: `default`, `header`, `footer`, `closebutton`, `closeicon`, `maximizebutton`, `maximizeicon`, `container` (`closeCallback`, `maximizeCallback`, `initDragCallback`).
- PrimeReact: `children`, `header`, `footer`, `icons`, `content` (headless; `{ headerRef, contentRef, footerRef, closeRef, hide, message }`).

Sources: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`, `primevue-4.5.5:packages/primevue/src/dialog/BaseDialog.vue`, `primereact-10.9.9:components/lib/dialog/dialog.d.ts`.

## 6. Usage guidance

- **Import.** Register the module or import the component (`primeng-21.1.9:apps/showcase/doc/dialog/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/ImportDoc.vue`, `primereact-10.9.9:components/doc/dialog/importdoc.js`).
- **Basic.** Bind `visible` two-way (NG/Vue) or pair `visible` with an `onHide` that clears state (React); give it a `header` and a width style (`primeng-21.1.9:apps/showcase/doc/dialog/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/BasicDoc.vue`, `primereact-10.9.9:components/doc/dialog/basicdoc.js`).
- **Template.** Replace header and footer with custom markup (templates/slots, or React `header`/`footer` props) (`primeng-21.1.9:apps/showcase/doc/dialog/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/TemplateDoc.vue`, `primereact-10.9.9:components/doc/dialog/templatedoc.js`).
- **Footer (React only).** Put action buttons in the `footer` prop (`primereact-10.9.9:components/doc/dialog/footerdoc.js`).
- **Position.** Dock the dialog to an edge or corner with `position` (`primeng-21.1.9:apps/showcase/doc/dialog/position-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/PositionDoc.vue`, `primereact-10.9.9:components/doc/dialog/positiondoc.js`).
- **Maximizable.** `maximizable` adds a button toggling full-viewport mode (`primeng-21.1.9:apps/showcase/doc/dialog/maximizable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/MaximizableDoc.vue`, `primereact-10.9.9:components/doc/dialog/maximizabledoc.js`).
- **Long content.** Content taller than the viewport scrolls inside the dialog (`primeng-21.1.9:apps/showcase/doc/dialog/longcontent-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/LongContentDoc.vue`, `primereact-10.9.9:components/doc/dialog/longcontentdoc.js`).
- **Without modal.** The mask layer is controlled by `modal`; NG/Vue default to no mask, React defaults to a mask (`primeng-21.1.9:apps/showcase/doc/dialog/withoutmodal-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/WithoutModalDoc.vue`, `primereact-10.9.9:components/doc/dialog/withoutmodaldoc.js`).
- **Responsive.** `breakpoints` maps max-width queries to widths, the base style applies otherwise; PrimeVue also suggests utility classes (`primeng-21.1.9:apps/showcase/doc/dialog/responsive-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/ResponsiveDoc.vue`, `primereact-10.9.9:components/doc/dialog/responsivedoc.js`).
- **Headless.** Replace the whole UI with the `headless` template (NG), `container` slot (Vue) or `content` prop (React), using the supplied close/drag callbacks (`primeng-21.1.9:apps/showcase/doc/dialog/headless-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/HeadlessDoc.vue`, `primereact-10.9.9:components/doc/dialog/headlessdoc.js`).
- **Overlays inside a dialog (NG, unlisted doc).** Child overlays such as a Select dropdown are clipped by the dialog's overflow unless they are appended to `body` or the dialog allows overflow. This doc file and `modal-doc.ts` exist but are not referenced by the NG showcase page (`primeng-21.1.9:apps/showcase/doc/dialog/overlaysinside-doc.ts`, `primeng-21.1.9:apps/showcase/doc/dialog/modal-doc.ts`, `primeng-21.1.9:apps/showcase/pages/dialog/index.ts`).

## 7. Accessibility

- Root has `role="dialog"` (PrimeNG: `role` input, default `'dialog'`), `aria-labelledby` pointing at the header id, and `aria-modal` (PrimeNG always `true`; PrimeVue and PrimeReact bind it to `modal`). PrimeReact also sets `aria-describedby` to the content id (`primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`, `primevue-4.5.5:packages/primevue/src/dialog/Dialog.vue`, `primereact-10.9.9:components/lib/dialog/Dialog.js`).
- Close button has an `aria-label` (NG `closeAriaLabel`, Vue `closeAriaLabel` from locale, React `ariaCloseIconLabel`).
- Keyboard: `Tab` / `Shift+Tab` move within the trapped focus area; `Escape` closes when `closeOnEscape` (PrimeNG also requires `closable`); `Enter` / `Space` activate the close and maximize buttons (`primeng-21.1.9:apps/showcase/doc/dialog/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dialog/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/dialog/accessibilitydoc.js`).
- PrimeReact routes Escape through `useGlobalOnEscapeKey` with priority `ESC_KEY_HANDLING_PRIORITIES.DIALOG` so only the top-most overlay closes.
- The docs advise a keyboard-reachable trigger and relating it to the dialog with `aria-expanded` / `aria-controls`; that wiring is left to the application.

## 8. Theming

- Style module: `@primeuix/styles/dialog` (`primeng-21.1.9:packages/primeng/src/dialog/style/dialogstyle.ts`, `primevue-4.5.5:packages/primevue/src/dialog/style/DialogStyle.js`, `@primeuix/styles-2.0.3:dist/dialog/index.mjs`). The stylesheet covers the window, header/actions/title/content/footer, the eight position classes `p-dialog-top|bottom|left|right|topleft|topright|bottomleft|bottomright`, `p-dialog-maximized`, enter/leave animation classes and `.p-resizable-handle`.
- Design tokens (`dialog`, 12 vars): `root.{background, borderColor, color, borderRadius, shadow}`, `header.{padding, gap}`, `title.{fontSize, fontWeight}`, `content.padding`, `footer.{padding, gap}` (`@primeuix/themes-2.0.3:types/dialog/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). The modal mask uses the shared `mask` tokens via `p-overlay-mask`.
- PrimeReact: classes from `DialogBase.js` (modal mask adds `p-component-overlay p-component-overlay-enter`, plus `p-dialog-visible`, `p-dialog-draggable`, `p-dialog-resizable`); styled-mode CSS comes from the theme, no design tokens (`primereact-10.9.9:components/lib/dialog/DialogBase.js`, `primereact-10.9.9:components/doc/dialog/styledoc.js`).
- Pass-through keys: see §4.

## 9. Relationships

- Uses: Button (close/maximize), FocusTrap, Portal (Vue/React), Times/WindowMaximize/WindowMinimize icons.
- Used by: ConfirmDialog (all three), DynamicDialog (NG/Vue; see [dynamicdialog.md](dynamicdialog.md)).
- Related: Drawer (edge-docked panel), Popover (anchored, non-modal).

### Shared overlay machinery

- **Z-index layering.** All three keep a per-group counter: `ZIndexUtils.set('modal', el, base)` (PrimeNG `primeng/utils`, PrimeReact `Utils`) and `ZIndex.set('modal', el, base)` from `@primeuix/utils/zindex` (PrimeVue). Base values: `modal: 1100`, `overlay: 1000`, `menu: 1000`, `tooltip: 1100` (PrimeReact adds `toast: 1200`). PrimeNG adds `baseZIndex` to `config.zIndex.modal`; PrimeVue and PrimeReact use `baseZIndex` when set, else the config value (`primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primevue-4.5.5:packages/core/src/config/PrimeVue.js`, `primereact-10.9.9:components/lib/api/PrimeReact.js`).
- **appendTo.** PrimeNG components fall back to `PrimeNG.overlayAppendTo()` (default `'self'`); PrimeVue and PrimeReact default Dialog to the document body through their `Portal`.
- **Scroll lock.** `blockScroll` (or maximized) calls `blockBodyScroll()` / `unblockBodyScroll()` (`primeng/dom`, `primevue/utils`, PrimeReact `DomHandler`).

## 10. Dependencies

- PrimeNG: `primeng/button`, `primeng/focustrap`, `primeng/dom` (`blockBodyScroll`, `DomHandler`), `primeng/utils` (`ZIndexUtils`), `primeng/motion`, `primeng/icons` (`TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`), `primeng/config`, `@primeuix/styles/dialog`.
- PrimeVue: `primevue/button`, `primevue/focustrap`, `primevue/portal`, `primevue/utils`, `@primeuix/utils/zindex`, `@primevue/icons`, `@primeuix/styles/dialog`.
- PrimeReact: `../portal/Portal`, `../focustrap/FocusTrap`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useGlobalOnEscapeKey`, `useDisplayOrder`), `../utils/Utils` (`ZIndexUtils`, `DomHandler`), `../icons/*`.

## 11. Framework differences

| Aspect               | PrimeNG                                               | PrimeVue                    | PrimeReact                                             |
| -------------------- | ----------------------------------------------------- | --------------------------- | ------------------------------------------------------ |
| Default `modal`      | `false`                                               | `false`                     | `true`                                                 |
| Default `appendTo`   | global `overlayAppendTo` (`'self'`)                   | `'body'`                    | `document.body`                                        |
| Resizable            | `resizable = true`                                    | not supported               | `resizable = true`                                     |
| Position values      | `topleft`, `bottomright`, …                           | `topleft`, `bottomright`, … | `top-left`, `bottom-right` (unhyphenated accepted too) |
| Headless hook        | `headless` template                                   | `container` slot            | `content` prop                                         |
| Close event contract | two-way `visible`                                     | `v-model:visible`           | `onHide` must reset `visible`                          |
| `aria-modal`         | always `true`                                         | bound to `modal`            | bound to `modal`                                       |
| Animation API        | `motionOptions` (v21), `transitionOptions` deprecated | Vue `<transition>` + PT     | `transitionOptions` (`CSSTransition`)                  |
| Theming              | `@primeuix` tokens + styles                           | `@primeuix` tokens + styles | own classes, no tokens                                 |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`
- `primeng-21.1.9:packages/primeng/src/dialog/style/dialogstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/dialog/dialog.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:apps/showcase/doc/dialog/` (`import-doc.ts`, `basic-doc.ts`, `template-doc.ts`, `position-doc.ts`, `maximizable-doc.ts`, `longcontent-doc.ts`, `withoutmodal-doc.ts`, `responsive-doc.ts`, `headless-doc.ts`, `accessibility-doc.ts`, `modal-doc.ts`, `overlaysinside-doc.ts`)
- `primeng-21.1.9:apps/showcase/pages/dialog/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/dialog/Dialog.vue`
- `primevue-4.5.5:packages/primevue/src/dialog/BaseDialog.vue`
- `primevue-4.5.5:packages/primevue/src/dialog/Dialog.d.ts`
- `primevue-4.5.5:packages/primevue/src/dialog/style/DialogStyle.js`
- `primevue-4.5.5:packages/core/src/config/PrimeVue.js`
- `primevue-4.5.5:apps/showcase/doc/dialog/` (`ImportDoc.vue`, `BasicDoc.vue`, `TemplateDoc.vue`, `PositionDoc.vue`, `MaximizableDoc.vue`, `LongContentDoc.vue`, `WithoutModalDoc.vue`, `ResponsiveDoc.vue`, `HeadlessDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/dialog/Dialog.js`
- `primereact-10.9.9:components/lib/dialog/DialogBase.js`
- `primereact-10.9.9:components/lib/dialog/dialog.d.ts`
- `primereact-10.9.9:components/lib/api/PrimeReact.js`
- `primereact-10.9.9:components/doc/dialog/` (`importdoc.js`, `basicdoc.js`, `templatedoc.js`, `positiondoc.js`, `maximizabledoc.js`, `longcontentdoc.js`, `withoutmodaldoc.js`, `responsivedoc.js`, `footerdoc.js`, `headlessdoc.js`, `accessibilitydoc.js`, `styledoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/dialog/index.mjs`
- `@primeuix/themes-2.0.3:types/dialog/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
