# ConfirmPopup

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ConfirmPopup is a small confirmation box anchored to the element that triggered it (for example a delete button), with an arrow pointing at that element, a message, an optional icon and accept/reject buttons. It is the non-modal, in-context counterpart of ConfirmDialog and is driven by the same confirmation APIs: PrimeNG `ConfirmationService`, the PrimeVue `ConfirmationService` plugin (`$confirm` / `useConfirm()`), and PrimeReact's `confirmPopup()` function. The trigger element must be passed as `target` so the popup can align to it (`primeng-21.1.9:packages/primeng/src/confirmpopup/confirmpopup.ts`, `primevue-4.5.5:packages/primevue/src/confirmpopup/ConfirmPopup.vue`, `primereact-10.9.9:components/lib/confirmpopup/ConfirmPopup.js`).

## 2. Names & status

- Canonical name: **ConfirmPopup** in all three frameworks; no legacy aliases.
- Not deprecated. PrimeNG deprecates the `showTransitionOptions` (default `'.12s cubic-bezier(0, 0, 0.2, 1)'`) and `hideTransitionOptions` (default `'.1s linear'`) inputs — `@deprecated since v21.0.0`, use `motionOptions` (`primeng-21.1.9:packages/primeng/src/confirmpopup/confirmpopup.ts`).
- The PrimeNG basic doc still names the tag `p-confirmPopup`, but the component selector is only `p-confirmpopup` (`primeng-21.1.9:apps/showcase/doc/confirmpopup/basic-doc.ts`).
- Listed under Overlay in every showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect           | PrimeNG                                                                                                                       | PrimeVue                                                                                                                         | PrimeReact                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Import           | `import { ConfirmPopupModule } from 'primeng/confirmpopup'` (component `ConfirmPopup` is standalone)                          | `import ConfirmPopup from 'primevue/confirmpopup'`                                                                               | `import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'`                    |
| Selector / tag   | `<p-confirmpopup>`                                                                                                            | `<ConfirmPopup>`                                                                                                                 | `<ConfirmPopup />`                                                                        |
| Source           | `packages/primeng/src/confirmpopup/confirmpopup.ts`, `style/confirmpopupstyle.ts`, `types/confirmpopup/confirmpopup.types.ts` | `packages/primevue/src/confirmpopup/ConfirmPopup.vue`, `BaseConfirmPopup.vue`, `ConfirmPopup.d.ts`, `style/ConfirmPopupStyle.js` | `components/lib/confirmpopup/ConfirmPopup.js`, `ConfirmPopupBase.js`, `confirmpopup.d.ts` |
| Required service | `ConfirmationService` (app-provided), plus root `OverlayService` for overlay-click events                                     | `app.use(ConfirmationService)`; `$confirm.require({ target, … })` or `useConfirm()`                                              | none — `confirmPopup(props)` emits on `OverlayService`                                    |
| Rendering layer  | inline; moved to `body` or `appendTo` element; `pMotion` name `p-anchored-overlay`                                            | `<Portal>` (body) + `<transition name="p-anchored-overlay">`                                                                     | `<Portal appendTo>` + `CSSTransition` (`p-connected-overlay`)                             |

Sources: `primeng-21.1.9:apps/showcase/doc/confirmpopup/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/ConfirmationServiceDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/importdoc.js`.

## 4. Anatomy

| Part          | PrimeNG PT key    | PrimeVue PT key  | PrimeReact PT key | Class (NG/Vue)                 | Class (React)                                            |
| ------------- | ----------------- | ---------------- | ----------------- | ------------------------------ | -------------------------------------------------------- |
| Root          | `root` (+ `host`) | `root`           | `root`            | `p-confirmpopup`               | `p-confirm-popup`                                        |
| Content       | `content`         | `content`        | `content`         | `p-confirmpopup-content`       | `p-confirm-popup-content`                                |
| Icon          | `icon`            | `icon`           | `icon`            | `p-confirmpopup-icon`          | `p-confirm-popup-icon`                                   |
| Message       | `message`         | `message`        | `message`         | `p-confirmpopup-message`       | `p-confirm-popup-message`                                |
| Footer        | `footer`          | `footer`         | `footer`          | `p-confirmpopup-footer`        | `p-confirm-popup-footer`                                 |
| Reject button | `pcRejectButton`  | `pcRejectButton` | `rejectButton`    | `p-confirmpopup-reject-button` | `p-confirm-popup-reject p-button-sm` (+ `p-button-text`) |
| Accept button | `pcAcceptButton`  | `pcAcceptButton` | `acceptButton`    | `p-confirmpopup-accept-button` | `p-confirm-popup-accept p-button-sm`                     |

The arrow is drawn with `::before`/`::after` pseudo-elements whose horizontal offset is a CSS variable set at show time (`--p-confirmpopup-arrow-left` in NG; `--overlayArrowLeft` in React). When the popup has to open above its target it is marked flipped: attribute `data-p-confirmpopup-flipped="true"` and class `p-confirmpopup-flipped` (Vue) / `p-confirm-popup-flipped` (NG and React). PrimeNG also has a `motion` PT key; PrimeVue and PrimeReact add `transition` and `hooks` (`primeng-21.1.9:packages/primeng/src/types/confirmpopup/confirmpopup.types.ts`, `primevue-4.5.5:packages/primevue/src/confirmpopup/ConfirmPopup.d.ts`, `primereact-10.9.9:components/lib/confirmpopup/ConfirmPopupBase.js`).

## 5. API highlights

The confirmation object is the same one ConfirmDialog consumes — see [confirmdialog.md](confirmdialog.md) §5 for the full option list (`Confirmation` in NG, `ConfirmationOptions` in Vue). For ConfirmPopup the essential option is `target` (the anchor element, usually `event.currentTarget`).

| Member         | PrimeNG                                                                                                                                              | PrimeVue                              | PrimeReact                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| Routing key    | `key`                                                                                                                                                | `group: String`                       | `tagKey` (+ `group` read when matching)                                 |
| Visibility     | `visible` signal input (optional; internal state otherwise)                                                                                          | internal, driven by plugin            | `visible = false` + `onHide(result: string)` (declarative)              |
| Anchor         | `confirmation.target`                                                                                                                                | `options.target`                      | `target: HTMLElement`                                                   |
| `appendTo`     | signal input, default `'body'`                                                                                                                       | Portal default (body)                 | `appendTo = document.body`                                              |
| `defaultFocus` | `'accept'`                                                                                                                                           | option (`'accept'` / `'reject'`)      | `defaultFocus = 'accept'`                                               |
| Dismiss        | outside click unless `confirmation.dismissableMask === false`; Escape unless `confirmation.closeOnEscape === false`; window resize hides (non-touch) | outside click; Escape                 | `dismissable = true`, `closeOnEscape = true`                            |
| Z-index        | `autoZIndex = true`, `baseZIndex = 0`; group `overlay`                                                                                               | group `overlay`                       | group `overlay`                                                         |
| Animation      | `motionOptions`; deprecated `showTransitionOptions`, `hideTransitionOptions`                                                                         | `transition` PT                       | `transitionOptions: CSSTransitionProps`                                 |
| Button labels  | `confirmation.acceptLabel` / `rejectLabel`, else `TranslationKeys.ACCEPT` / `REJECT`                                                                 | options or locale `accept` / `reject` | `acceptLabel` / `rejectLabel`, else `localeOption('accept' / 'reject')` |

Templates / slots / render props:

- PrimeNG: `content` (context `$implicit: Confirmation`), `accepticon`, `rejecticon`, `headless` (context `$implicit: Confirmation`).
- PrimeVue: `message` (`message`), `icon` (`class`), `accepticon`, `rejecticon`, `container` (`message`, `acceptCallback`, `rejectCallback`).
- PrimeReact: `message`, `icon`, `footer`, `content` (headless; `{ message, acceptBtnRef, rejectBtnRef, hide }`).

Functions / services:

- PrimeNG: `ConfirmationService.confirm({ target, … })`; accept/reject emit `acceptEvent` / `rejectEvent` and call the confirmation's `accept` / `reject` (`primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`).
- PrimeVue: `$confirm.require(options)`, `$confirm.close()` (`primevue-4.5.5:packages/primevue/src/confirmationservice/ConfirmationService.js`).
- PrimeReact: `confirmPopup(props): ConfirmPopupReturn` with `show()` / `hide()`, emitting `'confirm-popup'`; ref method `confirm(props)`. An instance only subscribes to the function when it has no `target` and no `message` of its own (`primereact-10.9.9:components/lib/confirmpopup/ConfirmPopup.js`).

## 6. Usage guidance

- **Import / service setup.** PrimeNG imports the module and provides `ConfirmationService`; PrimeVue installs the plugin; PrimeReact imports the component and the `confirmPopup` function (`primeng-21.1.9:apps/showcase/doc/confirmpopup/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/ConfirmationServiceDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/importdoc.js`).
- **Basic.** Put one ConfirmPopup in the template and, in the trigger's click handler, call the confirm API with `target: event.currentTarget` plus message, icon and callbacks; without `target` the popup cannot align (`primeng-21.1.9:apps/showcase/doc/confirmpopup/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/BasicDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/basicdoc.js`).
- **Declarative (React only).** Bind `visible`, `onHide` and `target` (a ref to the trigger) instead of calling the function (`primereact-10.9.9:components/doc/confirmpopup/declarativedoc.js`).
- **Template.** Replace the message area via the `content` template (NG), `message` slot (Vue) or a node `message` (React) (`primeng-21.1.9:apps/showcase/doc/confirmpopup/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/TemplateDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/templatedoc.js`).
- **Headless.** Render the whole popup yourself via `headless` (NG), `container` (Vue) or `content` (React) and call the supplied accept/reject/hide callbacks (`primeng-21.1.9:apps/showcase/doc/confirmpopup/headless-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/HeadlessDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/headlessdoc.js`).
- **Unlisted NG docs.** `confirmationapi-doc.ts`, `props-doc.ts` and `templates-doc.ts` are older hand-written API tables not referenced by the NG showcase page, which lists only import, basic, template, headless and accessibility (`primeng-21.1.9:apps/showcase/pages/confirmpopup/index.ts`).

## 7. Accessibility

- Role: PrimeNG and PrimeVue render the root with `role="alertdialog"` inside a focus trap; PrimeVue also binds `aria-modal` to `visible`. PrimeReact's root sets no `role` and no `aria-modal` in source, although its docs describe both (`primeng-21.1.9:packages/primeng/src/confirmpopup/confirmpopup.ts`, `primevue-4.5.5:packages/primevue/src/confirmpopup/ConfirmPopup.vue`, `primereact-10.9.9:components/lib/confirmpopup/ConfirmPopup.js`).
- Labels: the popup has no automatic label; pass `aria-label` / `aria-labelledby` as attributes. PrimeNG sets `aria-label` on both buttons to their label text.
- Focus: the accept button is focused on show by default (`defaultFocus`); after accept/reject (and Escape in Vue/NG) focus returns to the `target`. PrimeReact restores the previously active element.
- Keyboard: `Tab` / `Shift+Tab` cycle inside the popup, `Escape` closes, `Enter` / `Space` trigger the buttons. PrimeReact handles Escape through `useGlobalOnEscapeKey` (priority `DIALOG`) only when `dismissable` and `closeOnEscape` are both true (`primeng-21.1.9:apps/showcase/doc/confirmpopup/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/confirmpopup/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/confirmpopup/accessibilitydoc.js`).
- Doc vs. source: the docs claim the trigger receives `aria-expanded` and `aria-controls`; none of the three sources sets them.

## 8. Theming

- Style module: `@primeuix/styles/confirmpopup` (`primeng-21.1.9:packages/primeng/src/confirmpopup/style/confirmpopupstyle.ts`, `primevue-4.5.5:packages/primevue/src/confirmpopup/style/ConfirmPopupStyle.js`, `@primeuix/styles-2.0.3:dist/confirmpopup/index.mjs`). The stylesheet styles root, content, icon, footer and the arrow, plus `.p-confirmpopup-flipped`.
- Design tokens (`confirmpopup`, 13 vars): `root.{background, borderColor, color, borderRadius, shadow, gutter, arrowOffset}`, `content.{padding, gap}`, `icon.{size, color}`, `footer.{gap, padding}` (`@primeuix/themes-2.0.3:types/confirmpopup/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`).
- PrimeReact: structural CSS is embedded in `ConfirmPopupBase.js` (`@layer primereact`, arrow and flipped rules) with theme CSS on top; no design tokens (`primereact-10.9.9:components/lib/confirmpopup/ConfirmPopupBase.js`, `primereact-10.9.9:components/doc/confirmpopup/styledoc.js`).
- Pass-through keys: see §4.

## 9. Relationships

- Uses: Button (small size by default), FocusTrap (NG/Vue), ConnectedOverlayScrollHandler (hides the popup when a scrollable ancestor of the target scrolls), OverlayService / OverlayEventBus (overlay-click coordination with other overlays).
- Siblings: ConfirmDialog (modal, same service and options), Popover (generic anchored overlay with the same arrow/flip mechanics; see [popover.md](popover.md)).

## 10. Dependencies

- PrimeNG: `primeng/api` (`ConfirmationService`, `Confirmation`, `OverlayService`, `TranslationKeys`), `primeng/button`, `primeng/focustrap`, `primeng/dom` (`ConnectedOverlayScrollHandler`), `primeng/utils` (`ZIndexUtils`), `primeng/motion` + `@primeuix/motion`, `@primeuix/utils` (`absolutePosition`, `getOffset`, `isIOS`, `isTouchDevice`), `@primeuix/styles/confirmpopup`.
- PrimeVue: `primevue/button`, `primevue/focustrap`, `primevue/portal`, `primevue/overlayeventbus`, `primevue/confirmationeventbus`, `@primevue/core/utils` (`ConnectedOverlayScrollHandler`), `@primeuix/utils/dom`, `@primeuix/utils/zindex`, `@primeuix/styles/confirmpopup`.
- PrimeReact: `../overlayservice/OverlayService`, `../portal/Portal`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useOverlayListener`, `useGlobalOnEscapeKey`, `useDisplayOrder`), `../button/Button`, `../utils/Utils` (`ZIndexUtils`, `DomHandler.absolutePosition`), `react-transition-group` (types).

## 11. Framework differences

| Aspect            | PrimeNG                                                      | PrimeVue                              | PrimeReact                            |
| ----------------- | ------------------------------------------------------------ | ------------------------------------- | ------------------------------------- |
| Trigger mechanism | `ConfirmationService.confirm()`                              | `$confirm.require()` / `useConfirm()` | `confirmPopup()` or declarative props |
| Instance routing  | `key`                                                        | `group`                               | `tagKey` / `group`                    |
| Root role         | `alertdialog`                                                | `alertdialog` + `aria-modal`          | none set                              |
| Focus trap        | `pFocusTrap`                                                 | `v-focustrap`                         | no trap; button `focus()` on show     |
| Dismiss controls  | per-confirmation `dismissableMask`, `closeOnEscape`          | outside click, Escape (fixed)         | `dismissable`, `closeOnEscape` props  |
| Class prefix      | `p-confirmpopup-*` (flipped class `p-confirm-popup-flipped`) | `p-confirmpopup-*`                    | `p-confirm-popup-*`                   |
| Headless hook     | `headless` template                                          | `container` slot                      | `content` prop                        |
| Animation         | `pMotion` `p-anchored-overlay`                               | `<transition>` `p-anchored-overlay`   | `CSSTransition` `p-connected-overlay` |
| Theming           | `@primeuix` tokens + styles                                  | `@primeuix` tokens + styles           | embedded CSS + own classes, no tokens |

Implementation note (PrimeNG): the flipped state adds `p-confirm-popup-flipped`, but the `@primeuix/styles` sheet targets `.p-confirmpopup-flipped`; only the `data-p-confirmpopup-flipped` attribute matches the current naming (`primeng-21.1.9:packages/primeng/src/confirmpopup/confirmpopup.ts`, `@primeuix/styles-2.0.3:dist/confirmpopup/index.mjs`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/confirmpopup/confirmpopup.ts`
- `primeng-21.1.9:packages/primeng/src/confirmpopup/style/confirmpopupstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/confirmpopup/confirmpopup.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`
- `primeng-21.1.9:packages/primeng/src/api/confirmation.ts`
- `primeng-21.1.9:apps/showcase/doc/confirmpopup/` (`import-doc.ts`, `basic-doc.ts`, `template-doc.ts`, `headless-doc.ts`, `accessibility-doc.ts`, `confirmationapi-doc.ts`, `props-doc.ts`, `templates-doc.ts`)
- `primeng-21.1.9:apps/showcase/pages/confirmpopup/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/confirmpopup/ConfirmPopup.vue`
- `primevue-4.5.5:packages/primevue/src/confirmpopup/BaseConfirmPopup.vue`
- `primevue-4.5.5:packages/primevue/src/confirmpopup/ConfirmPopup.d.ts`
- `primevue-4.5.5:packages/primevue/src/confirmpopup/style/ConfirmPopupStyle.js`
- `primevue-4.5.5:packages/primevue/src/confirmationservice/ConfirmationService.js`
- `primevue-4.5.5:apps/showcase/doc/confirmpopup/` (`ImportDoc.vue`, `ConfirmationServiceDoc.vue`, `BasicDoc.vue`, `TemplateDoc.vue`, `HeadlessDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/confirmpopup/ConfirmPopup.js`
- `primereact-10.9.9:components/lib/confirmpopup/ConfirmPopupBase.js`
- `primereact-10.9.9:components/lib/confirmpopup/confirmpopup.d.ts`
- `primereact-10.9.9:components/doc/confirmpopup/` (`importdoc.js`, `basicdoc.js`, `declarativedoc.js`, `templatedoc.js`, `headlessdoc.js`, `accessibilitydoc.js`, `styledoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/confirmpopup/index.mjs`
- `@primeuix/themes-2.0.3:types/confirmpopup/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
