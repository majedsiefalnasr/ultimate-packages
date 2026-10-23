# ConfirmDialog

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ConfirmDialog is a modal confirmation prompt with a message, an optional icon and accept/reject buttons. It does not draw its own window: every framework wraps its own Dialog component and only adds the message body and the two-button footer. The dialog is usually opened imperatively — PrimeNG through an app-provided `ConfirmationService`, PrimeVue through the `ConfirmationService` plugin (`$confirm` / `useConfirm()`), PrimeReact through the `confirmDialog()` function — so one `<ConfirmDialog>` instance placed in the page serves many calls (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`, `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.vue`, `primereact-10.9.9:components/lib/confirmdialog/ConfirmDialog.js`).

## 2. Names & status

- Canonical name: **ConfirmDialog** in all three frameworks; no legacy aliases.
- PrimeNG accepts three selectors: `p-confirmDialog`, `p-confirmdialog`, `p-confirm-dialog` (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`).
- Not deprecated. PrimeNG ConfirmDialog still declares a plain `transitionOptions` input (not marked deprecated), although the Dialog it wraps marks its own `transitionOptions` as `@deprecated since v21.0.0` in favour of `motionOptions` (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`, `primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`).
- Listed under Overlay in every showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- PrimeNG API helper file is named `confirmaeventtype.ts` (sic) and exports `ConfirmEventType` (`primeng-21.1.9:packages/primeng/src/api/confirmaeventtype.ts`).

## 3. Per framework

| Aspect           | PrimeNG                                                                                                                            | PrimeVue                                                                                                                                     | PrimeReact                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Import           | `import { ConfirmDialogModule } from 'primeng/confirmdialog'` (component `ConfirmDialog` is standalone)                            | `import ConfirmDialog from 'primevue/confirmdialog'`                                                                                         | `import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'`                               |
| Selector / tag   | `<p-confirmdialog>` (aliases above)                                                                                                | `<ConfirmDialog>`                                                                                                                            | `<ConfirmDialog />`                                                                                     |
| Source           | `packages/primeng/src/confirmdialog/confirmdialog.ts`, `style/confirmdialogstyle.ts`, `types/confirmdialog/confirmdialog.types.ts` | `packages/primevue/src/confirmdialog/ConfirmDialog.vue`, `BaseConfirmDialog.vue`, `ConfirmDialog.d.ts`, `style/ConfirmDialogStyle.js`        | `components/lib/confirmdialog/ConfirmDialog.js`, `ConfirmDialogBase.js`, `confirmdialog.d.ts`           |
| Required service | `ConfirmationService` from `primeng/api`, provided by the app (`providers: [ConfirmationService]`)                                 | `app.use(ConfirmationService)` from `primevue/confirmationservice`; trigger via `this.$confirm` or `useConfirm()` from `primevue/useconfirm` | none — module-level `confirmDialog(props)` function talks to mounted instances through `OverlayService` |
| Wraps            | `<p-dialog role="alertdialog">` + `Button`                                                                                         | `<Dialog role="alertdialog">` + `Button`                                                                                                     | `<Dialog>` (role stays `dialog`) + `Button`, rendered inside `<Portal>`                                 |

Sources: `primeng-21.1.9:apps/showcase/doc/confirmdialog/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/ConfirmationServiceDoc.vue`, `primevue-4.5.5:packages/primevue/src/confirmationservice/ConfirmationService.js`, `primevue-4.5.5:packages/primevue/src/useconfirm/UseConfirm.js`, `primereact-10.9.9:components/doc/confirmdialog/importdoc.js`, `primereact-10.9.9:components/lib/confirmdialog/ConfirmDialog.js`.

## 4. Anatomy

| Part          | PrimeNG PT key   | PrimeVue PT key  | PrimeReact PT key | Class (NG/Vue)                  | Class (React)                   |
| ------------- | ---------------- | ---------------- | ----------------- | ------------------------------- | ------------------------------- |
| Mask          | `mask`           | `mask`           | — (Dialog `mask`) | `p-dialog-mask`                 | `p-dialog-mask`                 |
| Root (dialog) | `root`           | `root`           | `root`            | `p-confirmdialog` + `p-dialog`  | `p-confirm-dialog` + `p-dialog` |
| Header        | `header`         | `header`         | `header`          | `p-dialog-header`               | `p-dialog-header`               |
| Title         | `title`          | `title`          | `headerTitle`     | `p-dialog-title`                | `p-dialog-title`                |
| Header icons  | `headerActions`  | `headerActions`  | `headerIcons`     | `p-dialog-header-actions`       | `p-dialog-header-icons`         |
| Close button  | `pcCloseButton`  | `pcCloseButton`  | `closeButton`     | `p-dialog-close-button`         | `p-dialog-header-close`         |
| Content       | `content`        | `content`        | `content`         | `p-dialog-content`              | `p-dialog-content`              |
| Icon          | `icon`           | `icon`           | `icon`            | `p-confirmdialog-icon`          | `p-confirm-dialog-icon`         |
| Message       | `message`        | `message`        | `message`         | `p-confirmdialog-message`       | `p-confirm-dialog-message`      |
| Footer        | `footer`         | `footer`         | `footer`          | `p-dialog-footer`               | `p-dialog-footer`               |
| Reject button | `pcRejectButton` | `pcRejectButton` | `rejectButton`    | `p-confirmdialog-reject-button` | `p-confirm-dialog-reject`       |
| Accept button | `pcAcceptButton` | `pcAcceptButton` | `acceptButton`    | `p-confirmdialog-accept-button` | `p-confirm-dialog-accept`       |

PrimeNG additionally exposes `host` and `resizeHandle`; PrimeVue and PrimeReact expose `transition` and `hooks`. In PrimeReact the reject button also gets `p-button-text` unless `rejectClassName` is set (`primeng-21.1.9:packages/primeng/src/types/confirmdialog/confirmdialog.types.ts`, `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.d.ts`, `primereact-10.9.9:components/lib/confirmdialog/confirmdialog.d.ts`, `primereact-10.9.9:components/lib/confirmdialog/ConfirmDialogBase.js`).

## 5. API highlights

### Confirmation options (what a `confirm` call carries)

| Option              | PrimeNG `Confirmation`                                                                                           | PrimeVue `ConfirmationOptions`                                 | PrimeReact `confirmDialog(props)`                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Routing key         | `key`                                                                                                            | `group`                                                        | `group` / `tagKey`                                                             |
| Text                | `header`, `message`, `icon`                                                                                      | `header`, `message`, `icon`                                    | `header`, `message` (`ReactNode` or fn), `icon`                                |
| Callbacks           | `accept`, `reject` (receives `ConfirmEventType`)                                                                 | `accept`, `reject`, `onShow`, `onHide`                         | `accept`, `reject`, `onHide(result: string)`                                   |
| Button text / icons | `acceptLabel`, `rejectLabel`, `acceptIcon`, `rejectIcon`                                                         | same four                                                      | same four                                                                      |
| Button styling      | `acceptButtonStyleClass`, `rejectButtonStyleClass`, `acceptButtonProps`, `rejectButtonProps`, `closeButtonProps` | `acceptClass`, `rejectClass`, `acceptProps`, `rejectProps`     | `acceptClassName`, `rejectClassName`                                           |
| Button visibility   | `acceptVisible`, `rejectVisible`                                                                                 | —                                                              | —                                                                              |
| Behaviour           | `blockScroll`, `closeOnEscape`, `dismissableMask`, `closable`, `modal`, `position`, `defaultFocus`               | `blockScroll`, `modal`, `position`, `appendTo`, `defaultFocus` | any `DialogProps` (minus `onHide`, `footer`, `pt`), `defaultFocus`, `appendTo` |

Sources: `primeng-21.1.9:packages/primeng/src/api/confirmation.ts`, `primevue-4.5.5:packages/primevue/src/confirmationoptions/ConfirmationOptions.d.ts`, `primereact-10.9.9:components/lib/confirmdialog/confirmdialog.d.ts`.

### Service / function surface

- PrimeNG `ConfirmationService` (`@Injectable()`, not `providedIn: 'root'`): `confirm(confirmation: Confirmation)`, `close()`, `onAccept()`, observables `requireConfirmation$` and `accept`. `ConfirmEventType` enum: `ACCEPT`, `REJECT`, `CANCEL` (`primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`, `primeng-21.1.9:packages/primeng/src/api/confirmaeventtype.ts`).
- PrimeVue plugin: installs `{ require(options: ConfirmationOptions), close() }` as `app.config.globalProperties.$confirm` and provides it under `PrimeVueConfirmSymbol`; `useConfirm()` throws `'No PrimeVue Confirmation provided!'` when the plugin is missing. Messages travel over `ConfirmationEventBus` (`'confirm'`, `'close'`) (`primevue-4.5.5:packages/primevue/src/confirmationservice/ConfirmationService.js`, `primevue-4.5.5:packages/primevue/src/useconfirm/UseConfirm.js`, `primevue-4.5.5:packages/primevue/src/confirmationeventbus/ConfirmationEventBus.js`).
- PrimeReact: `confirmDialog(props): ConfirmDialogReturn` with `show()` / `hide()`; emits `'confirm-dialog'` on `OverlayService`. Instances also expose a `confirm(props?)` ref method. An instance only listens to the global function when it has neither `target` nor `message` props (`primereact-10.9.9:components/lib/confirmdialog/ConfirmDialog.js`, `primereact-10.9.9:components/lib/overlayservice/OverlayService.js`).

### Component inputs (declarative defaults)

| Member          | PrimeNG                                                                                                                                                                                                                                                                                                                | PrimeVue                         | PrimeReact                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------- |
| Key             | `key`                                                                                                                                                                                                                                                                                                                  | `group: String`                  | `group`, `tagKey`                                  |
| Visibility      | `visible`; output `onHide(ConfirmEventType)`                                                                                                                                                                                                                                                                           | internal; opened by the plugin   | `visible` + `onHide` (declarative mode)            |
| `appendTo`      | signal input, default `'body'`                                                                                                                                                                                                                                                                                         | from options, default `'body'`   | `appendTo = null` (`'self'`, element, fn)          |
| `modal`         | `true`                                                                                                                                                                                                                                                                                                                 | from options, default `true`     | Dialog default                                     |
| `blockScroll`   | `true`                                                                                                                                                                                                                                                                                                                 | from options, default `true`     | Dialog default                                     |
| `closeOnEscape` | `true`                                                                                                                                                                                                                                                                                                                 | from options, default `true`     | Dialog default                                     |
| `draggable`     | `true`                                                                                                                                                                                                                                                                                                                 | `draggable: Boolean = true`      | Dialog default                                     |
| `breakpoints`   | `breakpoints`                                                                                                                                                                                                                                                                                                          | `breakpoints: Object = null`     | `breakpoints = null`                               |
| `defaultFocus`  | `'accept' \| 'reject' \| 'close' \| 'none'`, default `'accept'`                                                                                                                                                                                                                                                        | option; accept unless `'reject'` | `defaultFocus = 'accept'`                          |
| Other NG-only   | `acceptVisible = true`, `rejectVisible = true`, `dismissableMask = false`, `closable = true`, `focusTrap = true`, `autoZIndex = true`, `baseZIndex = 0`, `rtl = false`, `position`, `transitionOptions = '150ms cubic-bezier(0, 0, 0.2, 1)'`, `maskStyleClass`, `closeAriaLabel`, `acceptAriaLabel`, `rejectAriaLabel` | —                                | `content` (headless), `footer` (`ReactNode` or fn) |

Templates / slots:

- PrimeNG: `header`, `footer`, `message`, `icon`, `rejecticon`, `accepticon`, `headless` (context `$implicit`, `onAccept`, `onReject`).
- PrimeVue: `container` (`message`, `closeCallback`, `acceptCallback`, `rejectCallback`, `initDragCallback`), `message` (`message`), `icon` (`class`), `accepticon`, `rejecticon`.
- PrimeReact: `content` prop for headless (`{ headerRef, contentRef, footerRef, hide, message }`), `footer` prop.

Default button labels come from the locale: PrimeNG `TranslationKeys.ACCEPT` / `REJECT`, PrimeVue `$primevue.config.locale.accept` / `reject`, PrimeReact `localeOption('accept')` / `('reject')`.

## 6. Usage guidance

- **Import / service setup.** PrimeNG registers the module and provides `ConfirmationService` at the component (or app) level; the showcase also provides `MessageService` for its toast feedback (`primeng-21.1.9:apps/showcase/doc/confirmdialog/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/confirmdialog/basic-doc.ts`). PrimeVue installs the plugin with `app.use(ConfirmationService)` (`primevue-4.5.5:apps/showcase/doc/confirmdialog/ConfirmationServiceDoc.vue`). PrimeReact imports both the component and the `confirmDialog` function (`primereact-10.9.9:components/doc/confirmdialog/importdoc.js`).
- **Basic.** Place one ConfirmDialog in the template and call the service (`confirm()` / `$confirm.require()` / `confirmDialog()`) from a click handler with header, message, icon and callbacks (`primeng-21.1.9:apps/showcase/doc/confirmdialog/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/BasicDoc.vue`, `primereact-10.9.9:components/doc/confirmdialog/basicdoc.js`).
- **Position.** Pass `position` in the confirmation to open the dialog at an edge or corner; the showcase isolates this instance with a key/group (`primeng-21.1.9:apps/showcase/doc/confirmdialog/position-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/PositionDoc.vue`, `primereact-10.9.9:components/doc/confirmdialog/positiondoc.js`).
- **Declarative (React only).** Control the instance with `visible` and `onHide` plus inline message/header/callback props instead of the function (`primereact-10.9.9:components/doc/confirmdialog/declarativedoc.js`).
- **Template.** Replace the message area with custom markup through the `message` template/slot, or in React pass a node as `message` (`primeng-21.1.9:apps/showcase/doc/confirmdialog/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/TemplateDoc.vue`, `primereact-10.9.9:components/doc/confirmdialog/templatedoc.js`).
- **Responsive (React only in showcase).** `breakpoints` maps a max-width media query to a dialog width; `style.width` applies when none matches (`primereact-10.9.9:components/doc/confirmdialog/responsivedoc.js`).
- **Headless.** Render the whole dialog yourself via `headless` template (NG), `container` slot (Vue) or `content` prop (React), using the supplied accept/reject/hide callbacks (`primeng-21.1.9:apps/showcase/doc/confirmdialog/headless-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/HeadlessDoc.vue`, `primereact-10.9.9:components/doc/confirmdialog/headlessdoc.js`).
- **Multiple instances.** When more than one ConfirmDialog lives on a page, give each a `key` (NG) or `group` (Vue/React) and set the same value in the confirmation; an instance ignores confirmations that do not match (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`, `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.vue`).

## 7. Accessibility

- Role: PrimeNG and PrimeVue pass `role="alertdialog"` to the wrapped Dialog; PrimeReact's Dialog root keeps `role: 'dialog'` (no `alertdialog` string anywhere in `components/lib`), with `aria-labelledby` (header id), `aria-describedby` (content id) and `aria-modal` (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`, `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.vue`, `primereact-10.9.9:components/lib/dialog/Dialog.js`).
- `aria-labelledby` points at the header and `aria-modal` is set, because focus stays inside the dialog (focus trap enabled by default).
- Focus: the accept button receives initial focus by default (`defaultFocus`); PrimeReact remembers `document.activeElement` on show and restores it on hide (`primereact-10.9.9:components/lib/confirmdialog/ConfirmDialog.js`).
- Keyboard: `Tab` / `Shift+Tab` cycle the focusable elements, `Escape` closes when `closeOnEscape` is on; `Enter` / `Space` activate the buttons (`primeng-21.1.9:apps/showcase/doc/confirmdialog/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmdialog/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/confirmdialog/accessibilitydoc.js`).
- Doc vs. source: all three accessibility docs say a trigger passed to `confirm` gets `aria-expanded` and `aria-controls`; no code in the ConfirmDialog, Dialog or service sources of any framework sets these attributes.

## 8. Theming

- Style module: `@primeuix/styles/confirmdialog`, registered under name `confirmdialog` (`primeng-21.1.9:packages/primeng/src/confirmdialog/style/confirmdialogstyle.ts`, `primevue-4.5.5:packages/primevue/src/confirmdialog/style/ConfirmDialogStyle.js`, `@primeuix/styles-2.0.3:dist/confirmdialog/index.mjs`). The CSS only styles the icon, message and content gap; the window itself is styled by the Dialog module.
- Design tokens (`confirmdialog`): `icon.size`, `icon.color`, `content.gap` → `--p-confirmdialog-icon-size`, `--p-confirmdialog-icon-color`, `--p-confirmdialog-content-gap` (`@primeuix/themes-2.0.3:types/confirmdialog/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`). Window tokens come from `dialog` (see [dialog.md](dialog.md)).
- PrimeReact: classes from `ConfirmDialogBase.js` (`p-confirm-dialog*`); styled-mode CSS from the theme, no design tokens (`primereact-10.9.9:components/lib/confirmdialog/ConfirmDialogBase.js`, `primereact-10.9.9:components/doc/confirmdialog/theming/styleddoc.js`).
- Pass-through keys: see §4.

## 9. Relationships

- Uses: Dialog (window, mask, drag, position, breakpoints), Button (accept/reject).
- Siblings: ConfirmPopup shares the same service/options and differs by anchoring to a target element instead of opening modally (see [confirmpopup.md](confirmpopup.md)).
- Related: Toast is typically used in the showcase to report the result.

## 10. Dependencies

- PrimeNG: `primeng/dialog`, `primeng/button`, `primeng/api` (`ConfirmationService`, `Confirmation`, `ConfirmEventType`, `TranslationKeys`, `SharedModule`), `primeng/config` (translations, `zIndex.modal`), `@primeuix/styles/confirmdialog`, `rxjs` (`Subscription`).
- PrimeVue: `primevue/dialog`, `primevue/button`, `primevue/confirmationeventbus` (`@primeuix/utils/eventbus`), `primevue/confirmationservice`, `primevue/useconfirm`, `@primeuix/styles/confirmdialog`.
- PrimeReact: `../dialog/Dialog`, `../button/Button`, `../portal/Portal`, `../overlayservice/OverlayService`, `../api/Api` (`localeOption`, `PrimeReact.zIndex`).

## 11. Framework differences

| Aspect             | PrimeNG                                  | PrimeVue                                     | PrimeReact                                  |
| ------------------ | ---------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Trigger mechanism  | Injected `ConfirmationService.confirm()` | Plugin `$confirm.require()` / `useConfirm()` | Global `confirmDialog()` or ref `confirm()` |
| Service scope      | Must be provided by the app (not root)   | Installed once with `app.use`                | None needed                                 |
| Instance routing   | `key`                                    | `group`                                      | `group` / `tagKey`                          |
| Declarative mode   | `visible` input                          | No (plugin-driven)                           | `visible` + `onHide`                        |
| Root role          | `alertdialog`                            | `alertdialog`                                | `dialog`                                    |
| Class prefix       | `p-confirmdialog-*`                      | `p-confirmdialog-*`                          | `p-confirm-dialog-*`                        |
| Headless hook      | `headless` template                      | `container` slot                             | `content` prop                              |
| Button visibility  | `acceptVisible` / `rejectVisible`        | not available                                | not available                               |
| Default `appendTo` | `'body'`                                 | `'body'`                                     | `null` (Portal default)                     |
| Theming            | `@primeuix` tokens + styles              | `@primeuix` tokens + styles                  | own classes, no tokens                      |

Implementation note (PrimeNG): `getElementToFocus()` queries `.p-confirm-dialog-accept` / `.p-confirm-dialog-reject`, while the rendered buttons carry `p-confirmdialog-accept-button` / `p-confirmdialog-reject-button`; the `defaultFocus` lookup therefore looks stale in 21.1.9 (`primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/confirmdialog/confirmdialog.ts`
- `primeng-21.1.9:packages/primeng/src/confirmdialog/style/confirmdialogstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/confirmdialog/confirmdialog.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`
- `primeng-21.1.9:packages/primeng/src/api/confirmation.ts`
- `primeng-21.1.9:packages/primeng/src/api/confirmaeventtype.ts`
- `primeng-21.1.9:packages/primeng/src/dialog/dialog.ts`
- `primeng-21.1.9:apps/showcase/doc/confirmdialog/` (`import-doc.ts`, `basic-doc.ts`, `position-doc.ts`, `template-doc.ts`, `headless-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.vue`
- `primevue-4.5.5:packages/primevue/src/confirmdialog/BaseConfirmDialog.vue`
- `primevue-4.5.5:packages/primevue/src/confirmdialog/ConfirmDialog.d.ts`
- `primevue-4.5.5:packages/primevue/src/confirmdialog/style/ConfirmDialogStyle.js`
- `primevue-4.5.5:packages/primevue/src/confirmationservice/ConfirmationService.js`
- `primevue-4.5.5:packages/primevue/src/useconfirm/UseConfirm.js`
- `primevue-4.5.5:packages/primevue/src/confirmationeventbus/ConfirmationEventBus.js`
- `primevue-4.5.5:packages/primevue/src/confirmationoptions/ConfirmationOptions.d.ts`
- `primevue-4.5.5:apps/showcase/doc/confirmdialog/` (`ImportDoc.vue`, `ConfirmationServiceDoc.vue`, `BasicDoc.vue`, `PositionDoc.vue`, `TemplateDoc.vue`, `HeadlessDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/confirmdialog/ConfirmDialog.js`
- `primereact-10.9.9:components/lib/confirmdialog/ConfirmDialogBase.js`
- `primereact-10.9.9:components/lib/confirmdialog/confirmdialog.d.ts`
- `primereact-10.9.9:components/lib/dialog/Dialog.js`
- `primereact-10.9.9:components/lib/overlayservice/OverlayService.js`
- `primereact-10.9.9:components/doc/confirmdialog/` (`importdoc.js`, `basicdoc.js`, `positiondoc.js`, `declarativedoc.js`, `templatedoc.js`, `responsivedoc.js`, `headlessdoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/confirmdialog/index.mjs`
- `@primeuix/themes-2.0.3:types/confirmdialog/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
