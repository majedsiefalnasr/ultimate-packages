# DynamicDialog

**Category:** Overlay · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

DynamicDialog opens a Dialog from code with any component as its content. The caller does not place a `<p-dialog>` or `<Dialog>` in its own template. Instead a dialog service's `open(component, config)` creates the dialog, passes data in, and gives back a handle; the loaded component closes the dialog and returns a result through an injected reference. Both PrimeNG and PrimeVue render the regular Dialog internally, so visuals, accessibility and tokens are the Dialog's. PrimeReact 10.9.9 has no DynamicDialog; there the closest equivalents are a state-driven `Dialog` or the imperative `confirmDialog()` (`primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog.ts`, `primevue-4.5.5:packages/primevue/src/dynamicdialog/DynamicDialog.vue`).

## 2. Names & status

- Canonical name: **DynamicDialog**; current in PrimeNG and PrimeVue, listed under Overlay in both menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`).
- PrimeReact: N/A. No `dynamicdialog` component, doc folder or menu entry exists (`primereact-10.9.9:components/layout/menu.json`).
- PrimeNG selector aliases: `p-dynamicDialog`, `p-dynamicdialog`, `p-dynamic-dialog`. Users rarely write it because `DialogService` creates it.
- No deprecations in either implementation. The PrimeNG `transitionOptions` config is still forwarded to Dialog, where it is deprecated since v21 in favour of `motionOptions` (see [dialog.md](dialog.md)).

## 3. Per framework

| Aspect           | PrimeNG                                                                                                                                                        | PrimeVue                                                                                                                                                     | PrimeReact |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Import           | `import { DialogService, DynamicDialogRef, DynamicDialogConfig, DynamicDialogModule } from 'primeng/dynamicdialog'`                                            | `import DynamicDialog from 'primevue/dynamicdialog'`, `import DialogService from 'primevue/dialogservice'`, `import { useDialog } from 'primevue/usedialog'` | N/A        |
| Host element     | none in user templates; `DialogService` creates `DynamicDialog` with `createComponent` and appends it to `document.body` (or `config.appendTo`)                | one `<DynamicDialog />` in the root app template renders every open instance                                                                                 | N/A        |
| Required service | `DialogService` — `@Injectable()` without `providedIn`; add it to a component's or the app's `providers`                                                       | `app.use(DialogService)` plugin; exposes `$dialog` (Options API) and `useDialog()` (Composition API)                                                         | N/A        |
| Handle returned  | `DynamicDialogRef<T>` (RxJS observables)                                                                                                                       | `DynamicDialogInstance` (`{ content, options, data, close }`)                                                                                                | N/A        |
| Inside the child | inject `DynamicDialogConfig` and `DynamicDialogRef` (custom `DynamicDialogInjector`)                                                                           | `inject('dialogRef')` (computed ref provided by Dialog)                                                                                                      | N/A        |
| Source           | `packages/primeng/src/dynamicdialog/` (`dialogservice.ts`, `dynamicdialog.ts`, `dynamicdialog-config.ts`, `dynamicdialog-ref.ts`, `dynamicdialog-injector.ts`) | `packages/primevue/src/dynamicdialog/`, `dialogservice/`, `usedialog/`, `dynamicdialogoptions/`, `dynamicdialogeventbus/`                                    | N/A        |

Sources: `primeng-21.1.9:packages/primeng/src/dynamicdialog/dialogservice.ts`, `primeng-21.1.9:packages/primeng/src/dynamicdialog/public_api.ts`, `primevue-4.5.5:packages/primevue/src/dialogservice/DialogService.js`, `primevue-4.5.5:packages/primevue/src/usedialog/UseDialog.js`.

## 4. Anatomy

DynamicDialog adds no DOM of its own. Each instance is a Dialog (mask, root, header, title, header actions, maximize/close buttons, content, footer); see [dialog.md](dialog.md) §4.

- PrimeNG: the template wraps `<p-dialog appendTo="self" hostName="DynamicDialog">`. The child component is created in a `pDynamicDialogContent` insertion point (`ViewContainerRef`) unless `templates.content` is set; a plain-string `footer` renders in a `<div>`. `DynamicDialogStyle` extends `DialogStyle` with `name = 'dialog'`, and `DynamicDialogClasses` lists the `p-dialog-*` classes (`primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialogcontent.ts`, `primeng-21.1.9:packages/primeng/src/dynamicdialog/style/dynamicdialogstyle.ts`).
- PrimeVue: one `DDialog` (Dialog) per entry in `instanceMap`, with optional `header` / `footer` template components (one or an array) and the content component bound to `options.emits` (`primevue-4.5.5:packages/primevue/src/dynamicdialog/DynamicDialog.vue`).
- PT: PrimeNG accepts a `DialogPassThrough` through `config.pt`. PrimeVue passes `options.props.pt` to Dialog; the `dynamicdialog` key also exists in the global `PrimeVuePTOptions` (`docs/prime-reference/catalog/primevue.json`).

## 5. API highlights

**Service**

| Member     | PrimeNG                                                                                                                | PrimeVue                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Open       | `open<T, DataType, InputValuesType>(componentType: Type<T>, config: DynamicDialogConfig): DynamicDialogRef<T> \| null` | `open(content: any, options?: DynamicDialogOptions): DynamicDialogInstance` |
| Instance   | `getInstance(ref): DynamicDialog`                                                                                      | —                                                                           |
| Duplicates | `open` returns `null` when the same component type is already open, unless `config.duplicate: true`                    | always opens                                                                |

**Reference / instance**

- PrimeNG `DynamicDialogRef`: `close(result?)`, `destroy()`, observables `onClose`, `onDestroy`, `onDragStart`, `onDragEnd`, `onResizeInit`, `onResizeEnd`, `onMaximize`, plus the `onChildComponentLoaded` subject (`primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog-ref.ts`).
- PrimeVue `DynamicDialogInstance`: `content`, `options`, `data`, `close(params?)`. `options.onClose({ data, type })` receives `type: 'config-close'` (closed through `close()`) or `'dialog-close'` (closed by the dialog UI) (`primevue-4.5.5:packages/primevue/src/dynamicdialogoptions/DynamicDialogOptions.d.ts`).

**Configuration**

- PrimeNG `DynamicDialogConfig`: `data`, `inputValues` (applied with `componentRef.setInput`), `header`, `footer`, `width`, `height`, `style`, `contentStyle`, `styleClass`, `maskStyleClass`, `modal`, `closable`, `closeOnEscape`, `dismissableMask`, `showHeader`, `draggable`, `resizable`, `keepInViewport`, `minX`, `minY`, `maximizable`, `maximizeIcon`, `minimizeIcon`, `position`, `breakpoints`, `focusOnShow`, `focusTrap`, `autoZIndex`, `baseZIndex`, `rtl`, `transitionOptions`, `closeAriaLabel`, `ariaLabelledBy`, `appendTo`, `duplicate`, `templates` (`header`, `content`, `footer`, `closeicon`, `maximizeicon`, `minimizeicon` as component types), `pt`, `unstyled`.
- The PrimeNG class declares defaults such as `modal = false` and `closeOnEscape = false`, but users pass object literals. The template forwards most flags with `!== false`, so `modal`, `closeOnEscape`, `draggable`, `resizable`, `showHeader`, `autoZIndex`, `focusOnShow` and `focusTrap` are effectively **on** unless set to `false`. `closable` and `maximizable` are forwarded as-is, so they stay off unless set to `true`.
- PrimeVue `DynamicDialogOptions`: `props` (any `DialogProps`), `templates` (`header`, `footer`), `data`, `emits` (event handlers bound to the content component), `onClose`.

Sources: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog-config.ts`, `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog.ts`, `primevue-4.5.5:packages/primevue/src/dialogservice/DialogService.d.ts`, `primevue-4.5.5:packages/primevue/src/dynamicdialog/DynamicDialog.d.ts`.

## 6. Usage guidance

- **Import.** NG imports from `primeng/dynamicdialog`; Vue imports the `DynamicDialog` component (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/ImportDoc.vue`).
- **Service setup.** NG: list `DialogService` in `providers` and inject it next to a `DynamicDialogRef` field. Vue: install the `DialogService` plugin, place `<DynamicDialog />` once in the root template, then call `useDialog()` or `this.$dialog` (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/usage-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/DialogServiceDoc.vue`).
- **Open.** Call `open(component, config)`. In Vue the content may be a `defineAsyncComponent` so it loads lazily (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/open-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/OpenDialogDoc.vue`).
- **Passing data.** NG: `data` for free-form values and `inputValues` for typed component inputs; the child injects `DynamicDialogConfig` / `DynamicDialogRef`. Vue: `data`, read as `dialogRef.value.data` in the child (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/passingdata-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/PassingDataDoc.vue`).
- **Closing with a result.** NG `ref.close(result)` → caller's `onClose` observable. Vue `dialogRef.value.close(params)` → `options.onClose({ data })` (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/close-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/CloseDialogDoc.vue`).
- **Events (Vue).** `options.emits` binds handlers to events the content component emits (`primevue-4.5.5:apps/showcase/doc/dynamicdialog/EventsDoc.vue`).
- **Customization.** All Dialog features are available: NG through config fields, Vue through `options.props` (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/customization-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/CustomizationDoc.vue`).
- **Example.** A product list dialog with a header/footer component and a nested dialog (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/example-doc.ts`, `primeng-21.1.9:apps/showcase/doc/dynamicdialog/productlistdemo.ts`, `primeng-21.1.9:apps/showcase/doc/dynamicdialog/footer.ts`, `primeng-21.1.9:apps/showcase/doc/dynamicdialog/infodemo.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/ExampleDoc.vue`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/demo/ProductListDemo.vue`).
- **Style.** NG lists the structural `p-dialog-*` classes; Vue points to the Dialog theming page (`primeng-21.1.9:apps/showcase/doc/dynamicdialog/style-doc.ts`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/theming/StyledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/dynamicdialog/theming/TailwindDoc.vue`).
- **PrimeReact.** N/A — render a `Dialog` controlled by state, or use `confirmDialog()` for confirmation prompts (see [dialog.md](dialog.md), [confirmdialog.md](confirmdialog.md)).

## 7. Accessibility

Inherited entirely from Dialog: `role="dialog"`, `aria-modal`, `aria-labelledby` pointing at the header, focus trap, Escape to close, close button labelled from the locale `aria.close` string. The Vue accessibility doc just links to Dialog (`primevue-4.5.5:apps/showcase/doc/dynamicdialog/AccessibilityDoc.vue`); PrimeNG ships no DynamicDialog accessibility doc.

- PrimeNG computes `ariaLabelledBy` as a fresh `uuid('pn_id_') + '_header'` (or `null` when there is no header) but never binds it in the template; Dialog builds its own label id (`primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog.ts`).
- Default close label: NG `config.closeAriaLabel` or the `TranslationKeys.ARIA` `close` translation; Vue via Dialog's own locale lookup.

## 8. Theming

- No separate style or tokens. PrimeNG `DynamicDialogStyle extends DialogStyle` (`name = 'dialog'`); PrimeVue `DynamicDialogStyle` is an empty `BaseStyle.extend({ name: 'dynamicdialog' })` and every visual comes from Dialog (`primevue-4.5.5:packages/primevue/src/dynamicdialog/style/DynamicDialogStyle.js`).
- Classes: `p-dialog-mask`, `p-dialog`, `p-dialog-header`, `p-dialog-title`, `p-dialog-header-actions`, `p-dialog-maximize-button`, `p-dialog-close-button`, `p-dialog-content`, `p-dialog-footer`.
- Tokens: Dialog's `dialog` token set (`@primeuix/themes-2.0.3:types/dialog/index.d.ts`); styles module `@primeuix/styles/dialog` (`@primeuix/styles-2.0.3:dist/dialog/index.mjs`).
- PrimeNG fixes the close and maximize buttons to `{ severity: 'secondary', variant: 'text', rounded: true }`.
- PrimeReact: N/A (no component).

## 9. Relationships

- Built on: Dialog (both frameworks). Related: ConfirmDialog, a service-driven Dialog specialised for confirmations; [confirmdialog.md](confirmdialog.md).
- PrimeVue's pieces live in five packages: `dynamicdialog` (renderer), `dialogservice` (plugin), `usedialog` (`useDialog`, `PrimeVueDialogSymbol`), `dynamicdialogoptions` (types only) and `dynamicdialogeventbus` (an `@primeuix/utils/eventbus` instance carrying `open` / `close`).
- Nested dialogs: PrimeNG supports opening another dynamic dialog from a loaded component. The class still contains its own drag, resize, modality and document-Escape code (`onAnimationStart`, `initDrag`, `enableModality`, `bindDocumentEscapeListener`, …) that the current template, which delegates to `<p-dialog>`, never calls.

### Shared overlay machinery

- Z-index: each instance is a Dialog in the `modal` group (base 1100). PrimeNG forwards `autoZIndex` and `baseZIndex` from the config. See [dialog.md](dialog.md) §9 for the layering table and config files.
- Attachment: PrimeNG appends the host element to `document.body` unless `config.appendTo` names another element, then renders the inner Dialog with `appendTo="self"`. PrimeVue renders inside the single `<DynamicDialog />` and each Dialog portals to `body` by default.

## 10. Dependencies

- PrimeNG: `primeng/dialog` (`Dialog`, `DialogStyle`, `DialogPassThrough`), `primeng/api` (`SharedModule`, `TranslationKeys`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/utils` (`uuid`, `appendChild`), `rxjs` (`Subject`, `Observable`), Angular `createComponent` / `ApplicationRef`.
- PrimeVue: `primevue/dialog`, `primevue/dynamicdialogeventbus`, `primevue/usedialog`, `@primeuix/utils` (`uuid`, `eventbus`), Vue `markRaw` / `inject`.
- PrimeReact: N/A.

## 11. Framework differences

| Aspect               | PrimeNG                                               | PrimeVue                                        | PrimeReact |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------- | ---------- |
| Availability         | yes                                                   | yes                                             | no         |
| Service registration | `providers: [DialogService]` (not root-provided)      | `app.use(DialogService)`                        | N/A        |
| Renderer placement   | created on demand per open, attached to body          | single `<DynamicDialog />` in the root template | N/A        |
| Child access         | DI: `DynamicDialogConfig`, `DynamicDialogRef`         | `inject('dialogRef')`                           | N/A        |
| Result delivery      | `ref.onClose` observable                              | `options.onClose({ data, type })` callback      | N/A        |
| Typed inputs         | `inputValues` → `setInput`                            | —                                               | N/A        |
| Child events         | —                                                     | `options.emits`                                 | N/A        |
| Duplicate guard      | yes, unless `duplicate: true`                         | no                                              | N/A        |
| Dialog options       | flattened into `DynamicDialogConfig`                  | `options.props` (any `DialogProps`)             | N/A        |
| Templates            | component types: header, content, footer, three icons | component(s): header, footer                    | N/A        |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dialogservice.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog-config.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog-ref.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialog-injector.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/dynamicdialogcontent.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/dynamicdialog/style/dynamicdialogstyle.ts`
- `primeng-21.1.9:apps/showcase/doc/dynamicdialog/` (`import-doc.ts`, `usage-doc.ts`, `open-doc.ts`, `passingdata-doc.ts`, `close-doc.ts`, `customization-doc.ts`, `example-doc.ts`, `productlistdemo.ts`, `footer.ts`, `infodemo.ts`, `style-doc.ts`)
- `primeng-21.1.9:apps/showcase/pages/dynamicdialog/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/dynamicdialog/DynamicDialog.vue`
- `primevue-4.5.5:packages/primevue/src/dynamicdialog/BaseDynamicDialog.vue`
- `primevue-4.5.5:packages/primevue/src/dynamicdialog/DynamicDialog.d.ts`
- `primevue-4.5.5:packages/primevue/src/dynamicdialog/style/DynamicDialogStyle.js`
- `primevue-4.5.5:packages/primevue/src/dialogservice/DialogService.js`
- `primevue-4.5.5:packages/primevue/src/dialogservice/DialogService.d.ts`
- `primevue-4.5.5:packages/primevue/src/usedialog/UseDialog.js`
- `primevue-4.5.5:packages/primevue/src/dynamicdialogoptions/DynamicDialogOptions.d.ts`
- `primevue-4.5.5:packages/primevue/src/dynamicdialogeventbus/DynamicDialogEventBus.js`
- `primevue-4.5.5:packages/primevue/src/dialog/Dialog.vue`
- `primevue-4.5.5:apps/showcase/doc/dynamicdialog/` (`ImportDoc.vue`, `DialogServiceDoc.vue`, `OpenDialogDoc.vue`, `PassingDataDoc.vue`, `CloseDialogDoc.vue`, `EventsDoc.vue`, `CustomizationDoc.vue`, `ExampleDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/doc/dynamicdialog/demo/ProductListDemo.vue`
- `primevue-4.5.5:apps/showcase/doc/dynamicdialog/theming/StyledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/dynamicdialog/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/dynamicdialog/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/dialog/index.mjs`
- `@primeuix/themes-2.0.3:types/dialog/index.d.ts`
- `docs/prime-reference/catalog/primeng.json`
- `docs/prime-reference/catalog/primevue.json`
