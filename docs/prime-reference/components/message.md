# Message

**Category:** Messages · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Message is a static, in-flow notice that shows a severity-coloured box with an icon and text, typically next to a form field or at the top of a section. All three frameworks ship a component named `Message`, but they are not the same widget:

- PrimeNG and PrimeVue `Message` is the v4-era unified component: severity, optional close button, optional auto-dismiss (`life`), `outlined`/`simple` variants and `small`/`large` sizes (`primeng-21.1.9:packages/primeng/src/message/message.ts`, `primevue-4.5.5:packages/primevue/src/message/Message.vue`).
- PrimeReact `Message` is the older _inline message_: a compact severity box with icon and text only, no close button, no timer and no variants. It renders `p-inline-message*` classes (`primereact-10.9.9:components/lib/message/Message.js`, `primereact-10.9.9:components/lib/message/MessageBase.js`). Its closable, list-style sibling is the PrimeReact-only [Messages](messages.md).

PrimeVue still ships the deprecated `InlineMessage` (types-level deprecation only); PrimeNG removed both `InlineMessage` and `Messages` in v20 and points to `Message` (see §2).

## 2. Names & status

- Canonical name: **Message** in all three frameworks; listed under the Messages group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- **PrimeVue `InlineMessage` (deprecated → Message).** The component is still shipped and exported (`primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.vue`) and still registered in the metadata group `messages = toMeta(['Message', 'InlineMessage', …])` (`primevue-4.5.5:packages/metadata/src/components/index.ts`). The only deprecation marker is the JSDoc `@deprecated since v4. Use Message component instead.` in `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.d.ts` (line 141); the runtime emits no warning. The v4 migration guide lists InlineMessage as deprecated because it overlaps with Message (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`). There is no InlineMessage showcase page.
- **PrimeVue `sticky` prop** on Message is typed but marked `@deprecated since 4.0` and is not declared as a runtime prop (`primevue-4.5.5:packages/primevue/src/message/Message.d.ts`, `primevue-4.5.5:packages/primevue/src/message/BaseMessage.vue`).
- **PrimeNG history.** `packages/primeng/src/` has only a `message` folder (no `messages`, no `inlinemessage`). The v19 migration page lists `InlineMessage` and `Messages` as deprecated with "use Message" as the replacement (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`), and the v20 removals table records both as deprecated in v18 and removed, replaced by `Message` (`primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`). A leftover theme shim still re-exports the `inlinemessage` preset from `@primeuix/themes` (`primeng-21.1.9:packages/themes/src/presets/aura/inlinemessage/index.ts`, same for lara, material, nora).
- **PrimeNG deprecated inputs:** `text` and `escape` are `@deprecated since v20.0.0` (use content projection); `styleClass` deprecated since v20 (use `class`); `showTransitionOptions` / `hideTransitionOptions` deprecated since v21 (use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/message/message.ts`).
- **PrimeReact:** not deprecated; no aliases. Functionally it corresponds to PrimeVue's deprecated `InlineMessage` rather than to PrimeVue/PrimeNG `Message`.

## 3. Per framework

| Aspect         | PrimeNG                                                                                                       | PrimeVue                                                                                                                            | PrimeReact                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Import         | `import { MessageModule } from 'primeng/message'` (component `Message` is standalone)                         | `import Message from 'primevue/message'` (deprecated: `primevue/inlinemessage`)                                                     | `import { Message } from 'primereact/message'`                        |
| Selector / tag | `<p-message>`                                                                                                 | `<Message>` (deprecated `<InlineMessage>`)                                                                                          | `<Message />`                                                         |
| Source         | `packages/primeng/src/message/message.ts`, `style/messagestyle.ts`, types in `types/message/message.types.ts` | `packages/primevue/src/message/Message.vue`, `BaseMessage.vue`, `Message.d.ts`, `style/MessageStyle.js`; `inlinemessage/*` likewise | `components/lib/message/Message.js`, `MessageBase.js`, `message.d.ts` |
| Exports        | `Message`, `MessageModule`, `MessageStyle`, `MessageClasses`                                                  | default `Message`; `MessageStyle` from `primevue/message/style`; default `InlineMessage`                                            | `Message`                                                             |
| Base class     | `BaseComponent<MessagePassThrough>`                                                                           | `BaseComponent` (via `BaseMessage` / `BaseInlineMessage`)                                                                           | `ComponentBase.extend` (`MessageBase`); `React.memo(forwardRef)`      |

Sources: `primeng-21.1.9:apps/showcase/doc/message/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/message/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/message/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/message/package.json`, `primereact-10.9.9:components/doc/message/importdoc.js`.

## 4. Anatomy

PrimeNG / PrimeVue Message:

| Part            | Element                | PrimeNG PT key   | PrimeVue PT key  | Class                                                                     |
| --------------- | ---------------------- | ---------------- | ---------------- | ------------------------------------------------------------------------- |
| Root            | host / `<div>`         | `host`, `root`   | `root`           | `p-message p-component p-message-<severity>`                              |
| Content wrapper | `<div>`                | `contentWrapper` | `contentWrapper` | `p-message-content-wrapper`                                               |
| Content         | `<div>`                | `content`        | `content`        | `p-message-content`                                                       |
| Icon            | `<i>` / slot           | `icon`           | `icon`           | `p-message-icon`                                                          |
| Text            | `<div>`                | `text`           | `text`           | `p-message-text`                                                          |
| Close button    | `<button>` with Ripple | `closeButton`    | `closeButton`    | `p-message-close-button`                                                  |
| Close icon      | `TimesIcon` / `<i>`    | `closeIcon`      | `closeIcon`      | `p-message-close-icon`                                                    |
| Animation       | —                      | `motion`         | `transition`     | NG `p-message-enter-active` / `-leave-active`; Vue `p-message` transition |

Modifier classes on the root: `p-message-outlined`, `p-message-simple`, `p-message-sm`, `p-message-lg` (`primeng-21.1.9:packages/primeng/src/message/style/messagestyle.ts`, `primevue-4.5.5:packages/primevue/src/message/style/MessageStyle.js`). The PrimeNG `MessageClasses` enum omits `contentWrapper` although the class is applied.

PrimeReact Message and PrimeVue InlineMessage (the inline form):

| Part | Element          | PrimeVue InlineMessage PT key | PrimeReact PT key | Class (PrimeVue / PrimeReact)                                                                                         |
| ---- | ---------------- | ----------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Root | `<div>`          | `root`                        | `root`            | `p-inlinemessage p-component p-inlinemessage-<severity>` / `p-inline-message p-component p-inline-message-<severity>` |
| Icon | icon component   | `icon`                        | `icon`            | `p-inlinemessage-icon` / `p-inline-message-icon`                                                                      |
| Text | `<div>`/`<span>` | `text`                        | `text`            | `p-inlinemessage-text` / `p-inline-message-text`                                                                      |

Both add an icon-only modifier when no text is given (`p-inlinemessage-icon-only` / `p-inline-message-icon-only`) (`primevue-4.5.5:packages/primevue/src/inlinemessage/style/InlineMessageStyle.js`, `primereact-10.9.9:components/lib/message/MessageBase.js`).

## 5. API highlights

| Member         | PrimeNG                                                                                   | PrimeVue Message                                   | PrimeReact                                                                |
| -------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| `severity`     | `'success' \| 'info' \| 'warn' \| 'error' \| 'secondary' \| 'contrast'`, default `'info'` | same six values (hinted string), default `'info'`  | same six values, default `'info'`                                         |
| Text           | content projection; `text` input (deprecated v20), `escape` (deprecated v20)              | default slot                                       | `text` (ReactNode or function), or `children`                             |
| `icon`         | CSS class string; `#icon` template                                                        | class string; `icon` slot                          | `IconType`; defaults to a severity icon (none for `secondary`/`contrast`) |
| Custom content | `#container` template (`closeCallback`)                                                   | `container` slot (`closeCallback`)                 | `content` prop replaces icon + text                                       |
| `closable`     | `false`                                                                                   | `false`                                            | N/A                                                                       |
| `closeIcon`    | class string; `#closeicon` template                                                       | class string; `closeicon` slot; `closeButtonProps` | N/A                                                                       |
| `life`         | ms before auto-hide (no default)                                                          | ms before auto-hide, default `null`                | N/A                                                                       |
| `size`         | `'small' \| 'large'`                                                                      | `'small' \| 'large'`                               | N/A                                                                       |
| `variant`      | `'outlined' \| 'text' \| 'simple'` (`text` has no style)                                  | `'outlined' \| 'simple'`                           | N/A                                                                       |
| Animation      | `motionOptions` (signal input); deprecated `show/hideTransitionOptions`                   | `transition` PT key                                | N/A                                                                       |
| Events         | `onClose: { originalEvent: Event }`                                                       | `close(event)`, `life-end()`                       | none                                                                      |
| Imperative     | `close(event)` method                                                                     | —                                                  | ref `getElement()`                                                        |

PrimeVue InlineMessage props: `severity` (runtime default `'error'` in `BaseInlineMessage.vue`, while the `.d.ts` documents `info`) and `icon`; slots `default` and `icon`; no events. Its `mounted()` hook reads `this.sticky` and `this.life`, which are not declared props, so the auto-hide branch is dead code (`primevue-4.5.5:packages/primevue/src/inlinemessage/BaseInlineMessage.vue`, `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.vue`, `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.d.ts`).

Sources: `primeng-21.1.9:packages/primeng/src/message/message.ts`, `primeng-21.1.9:packages/primeng/src/types/message/message.types.ts`, `primevue-4.5.5:packages/primevue/src/message/BaseMessage.vue`, `primevue-4.5.5:packages/primevue/src/message/Message.d.ts`, `primereact-10.9.9:components/lib/message/MessageBase.js`, `primereact-10.9.9:components/lib/message/message.d.ts`.

## 6. Usage guidance

PrimeNG (page `primeng-21.1.9:apps/showcase/pages/message/index.ts`) and PrimeVue (page `primevue-4.5.5:apps/showcase/pages/message/index.vue`) share the same section list:

- **Import** — module/standalone import vs default import (`primeng-21.1.9:apps/showcase/doc/message/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/ImportDoc.vue`).
- **Basic** — text goes in the element body (`primeng-21.1.9:apps/showcase/doc/message/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/BasicDoc.vue`).
- **Severity** — one example per severity value (`primeng-21.1.9:apps/showcase/doc/message/severity-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/SeverityDoc.vue`).
- **Icon** — `icon` class or icon template/slot, e.g. an avatar in place of the icon (`primeng-21.1.9:apps/showcase/doc/message/icon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/IconDoc.vue`).
- **Outlined / Simple** — `variant="outlined"` adds a border without fill; `variant="simple"` removes background and border (`primeng-21.1.9:apps/showcase/doc/message/outlined-doc.ts`, `primeng-21.1.9:apps/showcase/doc/message/simple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/OutlinedDoc.vue`, `primevue-4.5.5:apps/showcase/doc/message/SimpleDoc.vue`).
- **Sizes** — `size="small"` / `"large"` (`primeng-21.1.9:apps/showcase/doc/message/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/SizesDoc.vue`).
- **Forms** — the main validation pattern: a `simple`, `small`, `error` message under an invalid input (`primeng-21.1.9:apps/showcase/doc/message/form-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/FormsDoc.vue`).
- **Dynamic** — render a list of messages from state with `@for` / `v-for` (`primeng-21.1.9:apps/showcase/doc/message/dynamic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/DynamicDoc.vue`).
- **Closable** — `closable` shows the close button (`primeng-21.1.9:apps/showcase/doc/message/closable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/ClosableDoc.vue`).
- **Life** — `life` (ms) hides the message automatically (`primeng-21.1.9:apps/showcase/doc/message/life-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/LifeDoc.vue`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/message/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/AccessibilityDoc.vue`).

PrimeReact (page `primereact-10.9.9:pages/message/index.js`):

- **Import** — `primereact-10.9.9:components/doc/message/importdoc.js`.
- **Basic** — `text` and `severity` (`primereact-10.9.9:components/doc/message/basicdoc.js`).
- **Severity** — all six severities (`primereact-10.9.9:components/doc/message/severitydoc.js`).
- **Form** — error messages beside invalid inputs; a message without text renders icon-only (`primereact-10.9.9:components/doc/message/validationdoc.js`).
- **Template** — the `content` prop replaces the default icon + text (`primereact-10.9.9:components/doc/message/templatedoc.js`).
- **Accessibility** — `primereact-10.9.9:components/doc/message/accessibilitydoc.js`.

Choosing the widget: use Message for a persistent inline notice; use [Toast](toast.md) for transient, overlay notifications triggered by code; in PrimeReact, use [Messages](messages.md) for a closable, programmatically fed list of notices.

## 7. Accessibility

- **Role:** root has `role="alert"` everywhere.
- **Live region:** PrimeVue Message and InlineMessage set `aria-live="assertive"` and `aria-atomic="true"` (`primevue-4.5.5:packages/primevue/src/message/Message.vue`, `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.vue`). PrimeNG sets `aria-live="polite"` on the host (`primeng-21.1.9:packages/primeng/src/message/message.ts`) and PrimeReact sets `aria-live="polite"` with `aria-atomic="true"` (`primereact-10.9.9:components/lib/message/Message.js`), while their accessibility docs say the alert role implies assertive announcements — source and doc disagree.
- **Close button (NG/Vue):** a real `<button>`; label from the locale `aria.close` key; PrimeVue lets `closeButtonProps` override attributes. Enter and Space activate it (`primeng-21.1.9:apps/showcase/doc/message/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/message/AccessibilityDoc.vue`).
- **PrimeReact:** no interactive parts. Its accessibility doc describes a close button, `closeButtonProps` and Enter/Space handling that this component does not have (`primereact-10.9.9:components/doc/message/accessibilitydoc.js`) — stale doc.

## 8. Theming

- **Style module:** `MessageStyle` (`name: 'message'`) imports `@primeuix/styles/message` in PrimeNG and PrimeVue (`@primeuix/styles-2.0.3:dist/message/index.mjs`). PrimeVue `InlineMessageStyle` (`name: 'inlinemessage'`) imports `@primeuix/styles/inlinemessage` (`@primeuix/styles-2.0.3:dist/inlinemessage/index.mjs`).
- **Token groups (`message`):** `root`, `content`, `text`, `icon`, `closeButton`, `closeIcon`, `outlined`, `simple`, and one group per severity `info`, `success`, `warn`, `error`, `secondary`, `contrast` (`@primeuix/themes-2.0.3:types/message/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/message/index.mjs`).
- **Token groups (`inlinemessage`):** `root`, `text`, `icon` plus the six severity groups (`@primeuix/themes-2.0.3:types/inlinemessage/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inlinemessage/index.mjs`).
- **PT keys / classes:** see §4. PrimeVue also documents styled/unstyled theming (`primevue-4.5.5:apps/showcase/doc/message/theming/index.vue`).
- **PrimeReact:** own CSS in `MessageBase.js` (`css.styles` inside `@layer primereact`: inline-flex root, icon-only rule, full width under `.p-fluid`); design tokens N/A — PrimeReact 10 does not consume `@primeuix/themes`. The styled-mode doc lists `p-messages*` classes, which belong to Messages, not to this component (`primereact-10.9.9:components/doc/message/theming/styleddoc.js`) — stale doc.

## 9. Relationships

- Replaces PrimeVue `InlineMessage` and PrimeNG's removed `InlineMessage` and `Messages`.
- [Toast](toast.md) uses the same severity vocabulary and similar layout in an overlay.
- PrimeReact [Messages](messages.md) is the list/closable counterpart of PrimeReact Message; PrimeNG/PrimeVue `Message` covers both roles.
- Commonly paired with form inputs (InputText, InputMask) in validation layouts.

## 10. Dependencies

- PrimeNG: `@angular/core`, `@angular/common`; internal `BaseComponent`, `Ripple`, `TimesIcon`, motion support; style from `@primeuix/styles/message` (`primeng-21.1.9:packages/primeng/src/message/message.ts`).
- PrimeVue: `vue`; internal `BaseComponent`, `Ripple` directive, `@primevue/icons/times`; style from `@primeuix/styles/message` / `inlinemessage` (`primevue-4.5.5:packages/primevue/src/message/Message.vue`).
- PrimeReact: `react`, `react-dom`; internal `ComponentBase`, hooks (`useMergeProps`), `Utils`, severity icons (`primereact-10.9.9:components/lib/message/Message.js`, `primereact-10.9.9:package.json`).
- No service required.

## 11. Framework differences

| Aspect           | PrimeNG                                                   | PrimeVue                                     | PrimeReact                              |
| ---------------- | --------------------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| Widget model     | unified Message                                           | unified Message (+ deprecated InlineMessage) | inline message only                     |
| Root classes     | `p-message*`                                              | `p-message*` (`p-inlinemessage*`)            | `p-inline-message*`                     |
| Close / life     | `closable`, `life`                                        | `closable`, `life`                           | N/A                                     |
| Variants / sizes | `outlined`, `simple` (+ unstyled `text`); `small`/`large` | `outlined`, `simple`; `small`/`large`        | N/A                                     |
| Custom content   | `#container` template                                     | `container` slot                             | `content` prop                          |
| `aria-live`      | `polite`                                                  | `assertive` + `aria-atomic`                  | `polite` + `aria-atomic`                |
| Events           | `onClose`                                                 | `close`, `life-end`                          | none                                    |
| Removed / legacy | Messages, InlineMessage removed in v20                    | InlineMessage deprecated (types only)        | Messages still shipped separately       |
| Theming          | `@primeuix/styles/message` + tokens                       | `@primeuix/styles/message` + tokens          | own CSS in `MessageBase.js`; tokens N/A |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/message/message.ts`
- `primeng-21.1.9:packages/primeng/src/message/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/message/style/messagestyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/message/message.types.ts`
- `primeng-21.1.9:packages/themes/src/presets/aura/inlinemessage/index.ts`
- `primeng-21.1.9:apps/showcase/pages/message/index.ts`
- `primeng-21.1.9:apps/showcase/doc/message/` (`import-doc.ts`, `basic-doc.ts`, `severity-doc.ts`, `icon-doc.ts`, `outlined-doc.ts`, `simple-doc.ts`, `sizes-doc.ts`, `form-doc.ts`, `dynamic-doc.ts`, `closable-doc.ts`, `life-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/message/Message.vue`
- `primevue-4.5.5:packages/primevue/src/message/BaseMessage.vue`
- `primevue-4.5.5:packages/primevue/src/message/Message.d.ts`
- `primevue-4.5.5:packages/primevue/src/message/package.json`
- `primevue-4.5.5:packages/primevue/src/message/style/MessageStyle.js`
- `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.vue`
- `primevue-4.5.5:packages/primevue/src/inlinemessage/BaseInlineMessage.vue`
- `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.d.ts`
- `primevue-4.5.5:packages/primevue/src/inlinemessage/style/InlineMessageStyle.js`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:apps/showcase/pages/message/index.vue`
- `primevue-4.5.5:apps/showcase/doc/message/` (`ImportDoc.vue`, `BasicDoc.vue`, `SeverityDoc.vue`, `IconDoc.vue`, `OutlinedDoc.vue`, `SimpleDoc.vue`, `SizesDoc.vue`, `FormsDoc.vue`, `DynamicDoc.vue`, `ClosableDoc.vue`, `LifeDoc.vue`, `AccessibilityDoc.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/message/Message.js`
- `primereact-10.9.9:components/lib/message/MessageBase.js`
- `primereact-10.9.9:components/lib/message/message.d.ts`
- `primereact-10.9.9:pages/message/index.js`
- `primereact-10.9.9:components/doc/message/` (`importdoc.js`, `basicdoc.js`, `severitydoc.js`, `validationdoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:package.json`
- `@primeuix/styles-2.0.3:dist/message/index.mjs`
- `@primeuix/styles-2.0.3:dist/inlinemessage/index.mjs`
- `@primeuix/themes-2.0.3:types/message/index.d.ts`
- `@primeuix/themes-2.0.3:types/inlinemessage/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/message/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/inlinemessage/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (`message`), `docs/prime-reference/catalog/primevue.json` (`message`, `messagestyle`, `inlinemessage`, `inlinemessagestyle`), `docs/prime-reference/catalog/primereact.json` (`message`)
