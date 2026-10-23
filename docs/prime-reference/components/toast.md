# Toast

**Category:** Messages · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Toast shows transient notifications in a fixed-position overlay stack (corner, edge centre or screen centre). Messages are pushed from code, each with a severity, summary and detail; they auto-dismiss after a lifetime unless sticky, and can be closed manually. The component is a container that owns a list of messages and renders one item per message.

The three frameworks differ mainly in **how code pushes messages**:

- PrimeNG: an injectable `MessageService` that the application must provide (`primeng-21.1.9:packages/primeng/src/api/messageservice.ts`).
- PrimeVue: the `ToastService` plugin installed with `app.use`, used through `useToast()` or `this.$toast` (`primevue-4.5.5:packages/primevue/src/toastservice/ToastService.js`, `primevue-4.5.5:packages/primevue/src/usetoast/UseToast.js`).
- PrimeReact: an imperative ref API (`toast.current.show(...)`) on the component instance (`primereact-10.9.9:components/lib/toast/Toast.js`).

## 2. Names & status

- Canonical name: **Toast** in all three frameworks; listed under the Messages group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Internal item components: PrimeNG `ToastItem` (`p-toastItem`), PrimeVue `ToastMessage.vue`, PrimeReact `ToastMessage.js` — not public building blocks.
- Not deprecated. Deprecated members:
  - PrimeNG: `styleClass` (since v20, use `class`); `showTransformOptions`, `hideTransformOptions`, `showTransitionOptions`, `hideTransitionOptions` (since v21, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/toast/toast.ts`).
  - PrimeVue: the `icon` slot (`@deprecated since v4.0`, use `messageicon`) (`primevue-4.5.5:packages/primevue/src/toast/Toast.d.ts`).
- PrimeVue metadata registers Toast with `use: { as: 'ToastService' }`, i.e. auto-import tooling installs the service rather than only the component (`primevue-4.5.5:packages/metadata/src/components/index.ts`); `useToast` is listed as a composable (`primevue-4.5.5:packages/metadata/src/composables/index.ts`).

## 3. Per framework

| Aspect           | PrimeNG                                                                                                                                          | PrimeVue                                                                                                                                   | PrimeReact                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Import           | `import { ToastModule } from 'primeng/toast'`; `import { MessageService } from 'primeng/api'`                                                    | `import Toast from 'primevue/toast'`; `ToastService` from `primevue/toastservice`; `useToast` from `primevue/usetoast`                     | `import { Toast } from 'primereact/toast'`                                       |
| Selector / tag   | `<p-toast>`                                                                                                                                      | `<Toast>`                                                                                                                                  | `<Toast ref={toast} />`                                                          |
| Source           | `packages/primeng/src/toast/toast.ts`, `style/toaststyle.ts`, types `types/toast/toast.types.ts`; `api/messageservice.ts`, `api/toastmessage.ts` | `packages/primevue/src/toast/Toast.vue`, `BaseToast.vue`, `ToastMessage.vue`, `Toast.d.ts`; `toastservice/`, `usetoast/`, `toasteventbus/` | `components/lib/toast/Toast.js`, `ToastBase.js`, `ToastMessage.js`, `toast.d.ts` |
| Required service | `MessageService` — `@Injectable()` without `providedIn`; add it to `providers`                                                                   | `ToastService` plugin via `app.use(ToastService)`                                                                                          | none — hold a ref                                                                |
| Exports          | `Toast`, `ToastItem`, `ToastModule`, `ToastStyle`, toast types; `MessageService`, `ToastMessageOptions` from `primeng/api`                       | default `Toast`, `ToastService`, `useToast`; `ToastStyle` from `primevue/toast/style`                                                      | `Toast`                                                                          |
| Rendering target | in place; `ZIndexUtils.set('modal', …)`                                                                                                          | `<Portal>` (body); `ZIndex.set('modal', …)`                                                                                                | `<Portal>` with `appendTo` (default `'self'`); `ZIndexUtils.set('toast', …)`     |

Sources: `primeng-21.1.9:apps/showcase/doc/toast/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/toast/public_api.ts`, `primeng-21.1.9:packages/primeng/src/api/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/toast/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/toast/ToastServiceDoc.vue`, `primereact-10.9.9:components/doc/toast/importdoc.js`.

### Service wiring

- **PrimeNG.** `Toast` does `inject(MessageService)`. Because `MessageService` is declared with a bare `@Injectable()`, there is no root instance: the app (or a component) must list it in `providers`, as every showcase example does with `providers: [MessageService]`. Methods: `add(message)`, `addAll(messages)`, `clear(key?)`; internally two RxJS subjects (`messageObserver`, `clearObserver`). A toast only shows messages whose `key` equals its own `key` input (both undefined counts as a match) (`primeng-21.1.9:packages/primeng/src/api/messageservice.ts`, `primeng-21.1.9:packages/primeng/src/toast/toast.ts`).
- **PrimeVue.** `ToastService.install(app)` sets `app.config.globalProperties.$toast` and `app.provide(PrimeVueToastSymbol, …)`. Methods `add(message)`, `remove(message)`, `removeGroup(group)`, `removeAllGroups()` emit on a shared `ToastEventBus` (an `EventBus()` from `@primeuix/utils/eventbus`) which every mounted `Toast` listens to; a toast accepts a message when `group` matches. `useToast()` throws `No PrimeVue Toast provided!` if the plugin is not installed (`primevue-4.5.5:packages/primevue/src/toastservice/ToastService.js`, `primevue-4.5.5:packages/primevue/src/toastservice/ToastService.d.ts`, `primevue-4.5.5:packages/primevue/src/usetoast/UseToast.js`, `primevue-4.5.5:packages/primevue/src/toasteventbus/ToastEventBus.js`). `ToastSeverity` constants (`INFO`, `WARN`, `ERROR`, `SUCCESS`) live in `primevue-4.5.5:packages/core/src/api/ToastSeverity.js`.
- **PrimeReact.** No service and no group/key routing: each `<Toast>` instance is addressed directly through its ref — `show(message | message[])`, `replace(message | message[])`, `remove(message | message[])`, `clear()`, `getElement()` (`primereact-10.9.9:components/lib/toast/toast.d.ts`).

## 4. Anatomy

| Part         | Element                | PrimeNG PT key   | PrimeVue PT key   | PrimeReact PT key | Class (NG/Vue)                               | Class (React)               |
| ------------ | ---------------------- | ---------------- | ----------------- | ----------------- | -------------------------------------------- | --------------------------- |
| Root         | host / `<div>`         | `host`, `root`   | `root`            | `root`            | `p-toast p-component p-toast-<position>`     | same                        |
| Message      | `<div>` per message    | `message`        | `message`         | `message`         | `p-toast-message p-toast-message-<severity>` | same                        |
| Content      | `<div>`                | `messageContent` | `messageContent`  | `content`         | `p-toast-message-content`                    | same                        |
| Icon         | severity icon          | `messageIcon`    | `messageIcon`     | `icon`            | `p-toast-message-icon`                       | same                        |
| Text         | `<div>`                | `messageText`    | `messageText`     | `text`            | `p-toast-message-text`                       | same                        |
| Summary      | `<div>` / `<span>`     | `summary`        | `summary`         | `summary`         | `p-toast-summary`                            | same                        |
| Detail       | `<div>`                | `detail`         | `detail`          | `detail`          | `p-toast-detail`                             | same                        |
| Button slot  | `<div>`                | —                | `buttonContainer` | —                 | —                                            | —                           |
| Close button | `<button>` with Ripple | `closeButton`    | `closeButton`     | `closeButton`     | `p-toast-close-button`                       | `p-toast-icon-close p-link` |
| Close icon   | `TimesIcon`            | `closeIcon`      | `closeIcon`       | `closeButtonIcon` | `p-toast-close-icon`                         | `p-toast-icon-close-icon`   |
| Animation    | —                      | `motion`         | `transition`      | `transition`      | `p-toast-message` (motion / transition name) | `p-toast-message`           |

Severity modifiers cover `info`, `warn`, `error`, `success`, `secondary`, `contrast`. The root's position styles (fixed, 20px offsets, centring) come from `inlineStyles` in the style module, not from CSS (`primeng-21.1.9:packages/primeng/src/toast/style/toaststyle.ts`, `primevue-4.5.5:packages/primevue/src/toast/style/ToastStyle.js`, `primereact-10.9.9:components/lib/toast/ToastBase.js`). PrimeReact's `.d.ts` names the close-icon PT key `closeButtonIcon`, but `ToastMessage.js` requests `buttonicon` — the typed key may not apply.

## 5. API highlights

Component props:

| Member           | PrimeNG                                                         | PrimeVue                                                                            | PrimeReact                                                                |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Routing          | `key`                                                           | `group`                                                                             | per-instance ref                                                          |
| `position`       | 7 positions, default `'top-right'`                              | same, default `'top-right'`                                                         | same, default `'top-right'`                                               |
| Default lifetime | `life = 3000` on the toast; message `life` overrides            | none — a message without `life` stays until closed                                  | `life                                                                     |     | 3000` per message |
| Sticky           | message `sticky: true`                                          | omit `life`                                                                         | message `sticky: true`                                                    |
| Duplicates       | `preventOpenDuplicates`, `preventDuplicates` (default `false`)  | N/A                                                                                 | N/A                                                                       |
| Z-index          | `autoZIndex = true`, `baseZIndex = 0`                           | `autoZIndex = true`, `baseZIndex = 0`                                               | `baseZIndex = 0`                                                          |
| Responsive       | `breakpoints` (injects `<style>` with media queries, CSP nonce) | `breakpoints` (same mechanism)                                                      | N/A                                                                       |
| Icons            | per message `icon`, `closeIcon`                                 | `closeIcon`, `infoIcon`, `warnIcon`, `errorIcon`, `successIcon`; `closeButtonProps` | per message `icon`, `closeIcon`                                           |
| Animation        | `motionOptions`; deprecated transform/transition options        | `transition` PT key                                                                 | `transitionOptions`                                                       |
| Mount target     | —                                                               | Portal to body                                                                      | `appendTo` (`'self'` default)                                             |
| Custom message   | `#message` template (`$implicit`)                               | `message` slot (`{ message }`)                                                      | per-message `content`                                                     |
| Headless         | `#headless` template (`$implicit`, `closeFn`)                   | `container` slot (`{ message, closeCallback }`)                                     | toast-level `content` prop                                                |
| Events           | `onClose({ message })`                                          | `close({ message })`, `life-end({ message })`                                       | `onClick`, `onRemove`, `onShow`, `onHide`, `onMouseEnter`, `onMouseLeave` |

Message object (`ToastMessageOptions` in NG/Vue, `ToastMessage` in React): `severity` (six values), `summary`, `detail`, `life`, `closable` (default true), plus — NG: `key`, `sticky`, `id`, `icon`, `closeIcon`, `data`, `styleClass`, `contentStyleClass`, `text`; Vue: `group`, `styleClass`, `contentStyleClass`; React: `id`, `sticky`, `icon`, `closeIcon`, `content`, `className`, `style`, `contentClassName`, `contentStyle`, `pt`. PrimeReact's `toast.d.ts` also declares an unused `ToastMessageOptions` interface with Vue-style fields (`group`, `styleClass`).

Behaviour notes:

- **Hover pause:** PrimeNG and PrimeReact pause the timer on mouse enter and restart on leave. PrimeVue pauses only when an `onMouseEnter` handler is passed to `<Toast>` (`primevue-4.5.5:packages/primevue/src/toast/ToastMessage.vue`).
- **PrimeReact quirks:** `ToastMessage.js` reads `ariaCloseLabel`, which is never passed or declared; `Toast.js` forwards an undeclared `closeIcon` prop.

Sources: `primeng-21.1.9:packages/primeng/src/toast/toast.ts`, `primeng-21.1.9:packages/primeng/src/api/toastmessage.ts`, `primeng-21.1.9:packages/primeng/src/types/toast/toast.types.ts`, `primevue-4.5.5:packages/primevue/src/toast/BaseToast.vue`, `primevue-4.5.5:packages/primevue/src/toast/Toast.d.ts`, `primereact-10.9.9:components/lib/toast/ToastBase.js`, `primereact-10.9.9:components/lib/toast/ToastMessage.js`, `primereact-10.9.9:components/lib/toast/toast.d.ts`.

## 6. Usage guidance

PrimeNG (page `primeng-21.1.9:apps/showcase/pages/toast/index.ts`):

- **Import** — `ToastModule` plus `MessageService` in `providers` (`primeng-21.1.9:apps/showcase/doc/toast/import-doc.ts`).
- **Basic** — place one `<p-toast>` and call `messageService.add(...)` (`primeng-21.1.9:apps/showcase/doc/toast/basic-doc.ts`).
- **Severity** — six severities (the prose mentions four) (`primeng-21.1.9:apps/showcase/doc/toast/severity-doc.ts`).
- **Position** — `position` plus `key` to target a specific toast (`primeng-21.1.9:apps/showcase/doc/toast/position-doc.ts`).
- **Multiple** — `addAll` with an array (prose says `showAll`) (`primeng-21.1.9:apps/showcase/doc/toast/multiple-doc.ts`).
- **Sticky** — `sticky: true` keeps a message until closed; `clear()` removes all (`primeng-21.1.9:apps/showcase/doc/toast/sticky-doc.ts`).
- **Templating** — `#message` template for custom content (`primeng-21.1.9:apps/showcase/doc/toast/template-doc.ts`).
- **Headless** — `#headless` template with `closeFn` replaces the whole item (`primeng-21.1.9:apps/showcase/doc/toast/headless-doc.ts`).
- **Responsive** — `breakpoints` for small screens (`primeng-21.1.9:apps/showcase/doc/toast/responsive-doc.ts`).
- **Accessibility** — `primeng-21.1.9:apps/showcase/doc/toast/accessibility-doc.ts`.
- Unlinked docs present in the folder but not on the page: `clear-doc.ts`, `life-doc.ts`, `target-doc.ts`.

PrimeVue (page `primevue-4.5.5:apps/showcase/pages/toast/index.vue`):

- **Import** — `primevue-4.5.5:apps/showcase/doc/toast/ImportDoc.vue`.
- **Toast Service** — install `ToastService` with `app.use`, then call `useToast()` (Composition API) or `this.$toast` (Options API) (`primevue-4.5.5:apps/showcase/doc/toast/ToastServiceDoc.vue`).
- **Basic** — `toast.add({ severity, summary, detail, life })` (`primevue-4.5.5:apps/showcase/doc/toast/BasicDoc.vue`).
- **Severity** — six severities (`primevue-4.5.5:apps/showcase/doc/toast/SeverityDoc.vue`).
- **Position** — `position` with a matching `group` per toast (`primevue-4.5.5:apps/showcase/doc/toast/PositionDoc.vue`).
- **Multiple** — several `add` calls in a row (prose mentions a `show` method) (`primevue-4.5.5:apps/showcase/doc/toast/MultipleDoc.vue`).
- **Sticky** — omit `life`; `removeAllGroups()` clears (`primevue-4.5.5:apps/showcase/doc/toast/StickyDoc.vue`).
- **Template** — `message` slot in a dedicated group (`primevue-4.5.5:apps/showcase/doc/toast/TemplateDoc.vue`).
- **Headless** — `container` slot with `closeCallback` (`primevue-4.5.5:apps/showcase/doc/toast/HeadlessDoc.vue`).
- **Accessibility** — `primevue-4.5.5:apps/showcase/doc/toast/AccessibilityDoc.vue`.

PrimeReact (page `primereact-10.9.9:pages/toast/index.js`):

- **Import** — `primereact-10.9.9:components/doc/toast/importdoc.js`.
- **Basic** — `useRef` + `toast.current.show({...})` (`primereact-10.9.9:components/doc/toast/basicdoc.js`).
- **Severity** — `primereact-10.9.9:components/doc/toast/severitydoc.js`.
- **Position** — one `<Toast>` per position, each with its own ref (`primereact-10.9.9:components/doc/toast/positiondoc.js`).
- **Multiple** — `show` with an array (`primereact-10.9.9:components/doc/toast/multipledoc.js`).
- **Sticky** — `sticky: true`; `clear()` (`primereact-10.9.9:components/doc/toast/stickydoc.js`).
- **Template** — per-message `content` (`primereact-10.9.9:components/doc/toast/templatedoc.js`).
- **Headless** — toast-level `content` render function (`primereact-10.9.9:components/doc/toast/headlessdoc.js`).
- **Accessibility** — `primereact-10.9.9:components/doc/toast/accessibilitydoc.js`.

## 7. Accessibility

- Each message item: `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"` in all three (`primeng-21.1.9:packages/primeng/src/toast/toast.ts`, `primevue-4.5.5:packages/primevue/src/toast/ToastMessage.vue`, `primereact-10.9.9:components/lib/toast/ToastMessage.js`).
- Close button: a `<button>` labelled from the locale `aria.close` key, with Enter/Space activation. PrimeNG and PrimeVue put `autofocus` on it; PrimeVue allows `closeButtonProps` overrides. PrimeReact's accessibility doc mentions `closeButtonProps`, which Toast does not have (`primereact-10.9.9:components/doc/toast/accessibilitydoc.js`).
- Timers: auto-dismiss can remove content before it is read; sticky messages are the accessible choice for important information.

## 8. Theming

- **Style module:** `ToastStyle` (`name: 'toast'`) imports `@primeuix/styles/toast` in PrimeNG and PrimeVue (`@primeuix/styles-2.0.3:dist/toast/index.mjs`).
- **Token groups (`toast`):** `root`, `icon`, `content`, `text`, `summary`, `detail`, `closeButton`, `closeIcon`, and one group per severity `info`, `success`, `warn`, `error`, `secondary`, `contrast` (`@primeuix/themes-2.0.3:types/toast/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/toast/index.mjs`).
- **PT keys / classes:** see §4; PrimeVue theming docs at `primevue-4.5.5:apps/showcase/doc/toast/theming/index.vue`.
- **PrimeReact:** own CSS in `ToastBase.js` (`@layer primereact`); root also gets `p-input-filled` / `p-ripple-disabled` from context; design tokens N/A. The styled-mode doc lists old class names (`p-toast-container`, `p-toast-item`, `p-toast-image`, `p-toast-title`) not used by the source (`primereact-10.9.9:components/doc/toast/theming/styleddoc.js`) — stale doc.

## 9. Relationships

- [Message](message.md) — inline, in-flow counterpart with the same severity set.
- PrimeReact [Messages](messages.md) — in-flow list with the same imperative ref API (`show`/`replace`/`remove`/`clear`) as Toast.
- PrimeNG `MessageService` historically also fed the removed `p-messages` component (its JSDoc still says it is used in messages and toast components) (`primeng-21.1.9:packages/primeng/src/api/messageservice.ts`).
- Shares the overlay z-index layer with dialogs (`modal` in NG/Vue, dedicated `toast` layer in React).

## 10. Dependencies

- PrimeNG: `@angular/core`, `@angular/common`, `rxjs` (MessageService subjects); internal `BaseComponent`, `ZIndexUtils`, `Ripple`, `primeng/icons`, motion; `@primeuix/styles/toast`.
- PrimeVue: `vue`; internal `Portal`, `ZIndex`, `Ripple`, `@primevue/icons`, `ToastEventBus` on `@primeuix/utils/eventbus`; `@primeuix/styles/toast`. Requires the `ToastService` plugin.
- PrimeReact: `react`, `react-dom`, `react-transition-group` (`TransitionGroup` + internal `CSSTransition`); internal `Portal`, `ZIndexUtils`, `useTimeout`, `Ripple`, icons (`primereact-10.9.9:package.json`, `primereact-10.9.9:components/lib/hooks/useTimeout.js`).

## 11. Framework differences

| Aspect          | PrimeNG                                  | PrimeVue                                     | PrimeReact                                |
| --------------- | ---------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| Push API        | injected `MessageService` (app-provided) | `ToastService` plugin, `useToast()`/`$toast` | component ref methods                     |
| Routing         | `key`                                    | `group`                                      | one ref per toast                         |
| Add many        | `addAll`                                 | repeated `add`                               | `show([...])`                             |
| Remove          | `clear(key?)`                            | `remove`, `removeGroup`, `removeAllGroups`   | `remove`, `replace`, `clear`              |
| Default life    | 3000 ms                                  | none (sticky unless `life`)                  | 3000 ms                                   |
| Hover pause     | always                                   | only with `onMouseEnter` handler             | always                                    |
| Duplicate guard | yes                                      | no                                           | no                                        |
| Headless        | `#headless`                              | `container` slot                             | `content` prop on Toast                   |
| Mounting        | in place                                 | Portal to body                               | Portal, `appendTo='self'`                 |
| Close classes   | `p-toast-close-button` / `-close-icon`   | same                                         | `p-toast-icon-close` / `-icon-close-icon` |
| Theming         | `@primeuix/styles/toast` + tokens        | same                                         | own CSS; tokens N/A                       |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/toast/toast.ts`
- `primeng-21.1.9:packages/primeng/src/toast/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/toast/style/toaststyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/toast/toast.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/messageservice.ts`
- `primeng-21.1.9:packages/primeng/src/api/toastmessage.ts`
- `primeng-21.1.9:packages/primeng/src/api/public_api.ts`
- `primeng-21.1.9:apps/showcase/pages/toast/index.ts`
- `primeng-21.1.9:apps/showcase/doc/toast/` (`import-doc.ts`, `basic-doc.ts`, `severity-doc.ts`, `position-doc.ts`, `multiple-doc.ts`, `sticky-doc.ts`, `template-doc.ts`, `headless-doc.ts`, `responsive-doc.ts`, `accessibility-doc.ts`, `clear-doc.ts`, `life-doc.ts`, `target-doc.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/toast/Toast.vue`
- `primevue-4.5.5:packages/primevue/src/toast/BaseToast.vue`
- `primevue-4.5.5:packages/primevue/src/toast/ToastMessage.vue`
- `primevue-4.5.5:packages/primevue/src/toast/Toast.d.ts`
- `primevue-4.5.5:packages/primevue/src/toast/style/ToastStyle.js`
- `primevue-4.5.5:packages/primevue/src/toastservice/ToastService.js`
- `primevue-4.5.5:packages/primevue/src/toastservice/ToastService.d.ts`
- `primevue-4.5.5:packages/primevue/src/usetoast/UseToast.js`
- `primevue-4.5.5:packages/primevue/src/usetoast/UseToast.d.ts`
- `primevue-4.5.5:packages/primevue/src/toasteventbus/ToastEventBus.js`
- `primevue-4.5.5:packages/core/src/api/ToastSeverity.js`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:packages/metadata/src/composables/index.ts`
- `primevue-4.5.5:apps/showcase/pages/toast/index.vue`
- `primevue-4.5.5:apps/showcase/doc/toast/` (`ImportDoc.vue`, `ToastServiceDoc.vue`, `BasicDoc.vue`, `SeverityDoc.vue`, `PositionDoc.vue`, `MultipleDoc.vue`, `StickyDoc.vue`, `TemplateDoc.vue`, `HeadlessDoc.vue`, `AccessibilityDoc.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/toast/Toast.js`
- `primereact-10.9.9:components/lib/toast/ToastBase.js`
- `primereact-10.9.9:components/lib/toast/ToastMessage.js`
- `primereact-10.9.9:components/lib/toast/toast.d.ts`
- `primereact-10.9.9:components/lib/hooks/useTimeout.js`
- `primereact-10.9.9:pages/toast/index.js`
- `primereact-10.9.9:components/doc/toast/` (`importdoc.js`, `basicdoc.js`, `severitydoc.js`, `positiondoc.js`, `multipledoc.js`, `stickydoc.js`, `templatedoc.js`, `headlessdoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:package.json`
- `@primeuix/styles-2.0.3:dist/toast/index.mjs`
- `@primeuix/themes-2.0.3:types/toast/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/toast/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (`toast`, `messageservice`, `toastmessage`), `docs/prime-reference/catalog/primevue.json` (`toast`, `toaststyle`, `toastservice-usetoast`), `docs/prime-reference/catalog/primereact.json` (`toast`)
