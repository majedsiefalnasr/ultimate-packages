# Messages

**Category:** Messages · **Frameworks:** PrimeReact 10.9.9

## 1. Summary

Messages is a PrimeReact-only container that shows a stack of in-flow (not overlay) notices. Code pushes messages into it through an imperative ref API, the same way it feeds [Toast](toast.md); each notice has a severity, summary and detail, can be closed and auto-hides after a lifetime unless sticky (`primereact-10.9.9:components/lib/messages/Messages.js`, `primereact-10.9.9:components/lib/messages/UIMessage.js`).

PrimeNG and PrimeVue do not ship it: their unified [Message](message.md) component (closable, `life`, rendered in a loop) covers the same use case.

## 2. Names & status

- Canonical name: **Messages** (plural); listed under the Messages group of the PrimeReact menu next to Message and Toast (`primereact-10.9.9:components/layout/menu.json`).
- Not deprecated in PrimeReact 10.9.9.
- **PrimeNG: N/A — not shipped in primeng-21.1.9.** `packages/primeng/src/` contains a `message` folder but no `messages` folder, and the menu's Messages group lists only Message and Toast (`primeng-21.1.9:apps/showcase/assets/data/menu.json`). The migration docs record that `Messages` was deprecated in v18 with `Message` as the replacement and removed in v20 (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`). The only trace left is the `MessageService` JSDoc, which still mentions "messages and toast components" (`primeng-21.1.9:packages/primeng/src/api/messageservice.ts`). Replacement: `<p-message>` rendered with `@for`, with `closable` / `life` (`primeng-21.1.9:apps/showcase/doc/message/dynamic-doc.ts`).
- **PrimeVue: N/A — not shipped in primevue-4.5.5.** `packages/primevue/src/` has `message` and `inlinemessage` but no `messages`; the metadata group `messages` contains only `Message`, `InlineMessage` and `Toast` (`primevue-4.5.5:packages/metadata/src/components/index.ts`); the menu lists Message and Toast only (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`). The v4 migration guide describes the reworked Message (closable off by default, no auto-dismiss by default) as the single in-flow message component (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`). Replacement: `<Message>` in `v-for` with `closable` / `life` (`primevue-4.5.5:apps/showcase/doc/message/DynamicDoc.vue`).

## 3. Per framework

| Aspect      | PrimeNG                             | PrimeVue                            | PrimeReact                                                                                |
| ----------- | ----------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Import      | N/A — not shipped in primeng-21.1.9 | N/A — not shipped in primevue-4.5.5 | `import { Messages } from 'primereact/messages'`                                          |
| Tag         | N/A                                 | N/A                                 | `<Messages ref={msgs} />`                                                                 |
| Source      | N/A                                 | N/A                                 | `components/lib/messages/Messages.js`, `MessagesBase.js`, `UIMessage.js`, `messages.d.ts` |
| Exports     | N/A                                 | N/A                                 | `Messages`                                                                                |
| Base class  | N/A                                 | N/A                                 | `ComponentBase.extend` (`MessagesBase`); `React.memo(forwardRef)`                         |
| Replacement | `Message` in a loop                 | `Message` in a loop                 | —                                                                                         |

Sources: `primereact-10.9.9:components/doc/messages/importdoc.js`, `primereact-10.9.9:components/lib/messages/MessagesBase.js`, `primereact-10.9.9:components/lib/messages/package.json`.

## 4. Anatomy

| Part         | Element                | PrimeReact PT key                          | Class                                        |
| ------------ | ---------------------- | ------------------------------------------ | -------------------------------------------- |
| Container    | `<div>`                | `root` (Messages)                          | none from the class map                      |
| Item root    | `<div>` per message    | `root` (UIMessage, host `Messages`)        | `p-message p-component p-message-<severity>` |
| Wrapper      | `<div>`                | `wrapper`                                  | `p-message-wrapper`                          |
| Icon         | severity icon          | `icon`                                     | `p-message-icon`                             |
| Summary      | `<span>`               | `summary`                                  | `p-message-summary`                          |
| Detail       | `<span>`               | `detail`                                   | `p-message-detail`                           |
| Close button | `<button>` with Ripple | `button`                                   | `p-message-close p-link`                     |
| Close icon   | `TimesIcon`            | `buttonIcon` (typed) / `buttonicon` (code) | `p-message-close-icon`                       |
| Animation    | `CSSTransition`        | `transition`                               | `p-message` transition classes               |

Items are wrapped in a react-transition-group `TransitionGroup`; each item uses the internal `CSSTransition` with `classNames: 'p-message'`, 300 ms enter/exit, `unmountOnExit` (`primereact-10.9.9:components/lib/messages/Messages.js`). The `.d.ts` types the close-icon PT key as `buttonIcon` while `UIMessage.js` asks for `buttonicon`, so the typed key may not apply (`primereact-10.9.9:components/lib/messages/messages.d.ts`, `primereact-10.9.9:components/lib/messages/UIMessage.js`).

## 5. API highlights

Component props (defaults from `MessagesBase.js`): `id`, `className`, `style`, `transitionOptions` (`null`), `onRemove(message)` (`null`), `onClick(message)` (`null`), plus `pt`, `ptOptions`, `unstyled`.

Ref methods (`messages.d.ts`):

| Method                          | Behaviour                                                       |
| ------------------------------- | --------------------------------------------------------------- |
| `show(message \| message[])`    | appends to the current list; each entry gets an internal `_pId` |
| `replace(message \| message[])` | replaces the whole list                                         |
| `remove(message \| message[])`  | removes by `_pId` or deep equality, then calls `onRemove`       |
| `clear()`                       | empties the list                                                |
| `getElement()`                  | returns the container `div`                                     |

Message object (`MessagesMessage`): `id`, `severity` (`'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'`), `summary`, `detail`, `content` (replaces icon/summary/detail), `closable` (shown unless `false`), `closeIcon`, `icon`, `sticky`, `life` (default 3000 ms when not sticky), `pt`, `ptOptions`, `unstyled`. `UIMessage.js` additionally reads `className`, `style`, `contentClassName` and `contentStyle`, which are not in the type (`primereact-10.9.9:components/lib/messages/messages.d.ts`, `primereact-10.9.9:components/lib/messages/UIMessage.js`).

## 6. Usage guidance

Page `primereact-10.9.9:pages/messages/index.js`:

- **Import** — `primereact-10.9.9:components/doc/messages/importdoc.js`.
- **Basic** — create a ref with `useRef` and call `msgs.current.show(...)` (e.g. in an effect) (`primereact-10.9.9:components/doc/messages/basicdoc.js`).
- **Severity** — one message per severity (`primereact-10.9.9:components/doc/messages/severitydoc.js`).
- **Dynamic** — buttons that `show` and `clear` messages at runtime (`primereact-10.9.9:components/doc/messages/dynamicdoc.js`).
- **Closable** — `closable: false` hides the close button (`primereact-10.9.9:components/doc/messages/closeabledoc.js`).
- **Sticky** — `sticky: true` disables auto-hide. The demo also passes `life` values, which have no effect while sticky (`primereact-10.9.9:components/doc/messages/stickydoc.js`).
- **Custom icon** — per-message `icon` (`primereact-10.9.9:components/doc/messages/customicon.js`).
- **Template** — per-message `content` for fully custom markup (`primereact-10.9.9:components/doc/messages/templatedoc.js`).
- **Accessibility** — `primereact-10.9.9:components/doc/messages/accessibilitydoc.js`.

Choose Messages for a feed of dismissible notices inside the page; use [Message](message.md) for a single static inline notice and [Toast](toast.md) for overlay notifications.

## 7. Accessibility

- Each item has `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"` (`primereact-10.9.9:components/lib/messages/UIMessage.js`).
- Close button: `type="button"`, `aria-label` from the locale `close` key via `ariaLabel('close')`; it is a native button, so Enter/Space activate it.
- The accessibility doc mentions `closeButtonProps`, which Messages does not support, and repeats a class table there (`primereact-10.9.9:components/doc/messages/accessibilitydoc.js`) — stale doc.
- Auto-dismiss (3000 ms default) may remove content before assistive technology users can read it; use `sticky` for important notices.

## 8. Theming

- **Style module / tokens:** N/A — PrimeReact 10 ships its own CSS in `MessagesBase.js` (`css.styles` in `@layer primereact`: wrapper flex layout and enter/exit transition rules); it does not consume `@primeuix/styles` or `@primeuix/themes`. There is no `messages` module in `@primeuix/styles-2.0.3`; the closest themed module is `@primeuix/styles-2.0.3:dist/message/index.mjs` used by NG/Vue Message.
- **Classes / PT keys:** see §4 (`primereact-10.9.9:components/lib/messages/MessagesBase.js`).
- **Docs:** the styled-mode doc lists `p-messages`, `p-messages-info`/`-warn`/`-error`/`-success`, `p-messages-close`, `-icon`, `-summary`, `-detail`, none of which the source emits (it uses `p-message*`) (`primereact-10.9.9:components/doc/messages/theming/styleddoc.js`) — stale doc. Tailwind (unstyled) guidance: `primereact-10.9.9:components/doc/messages/theming/tailwinddoc.js`.

## 9. Relationships

- Sibling of PrimeReact [Message](message.md) (single inline notice, no close/timer) and [Toast](toast.md) (same ref API, overlay instead of in-flow).
- NG/Vue counterpart: their `Message` component in a loop; PrimeNG's own `Messages` (`p-messages`) was removed in v20.
- Uses the `p-message*` class names that NG/Vue `Message` also use, while PrimeReact `Message` uses `p-inline-message*` — the class names line up across frameworks by visual role, not by component name.

## 10. Dependencies

- `react`, `react-dom`, `react-transition-group` (`TransitionGroup`) (`primereact-10.9.9:package.json`).
- Internal: `ComponentBase`, `PrimeReactContext` / `ariaLabel` from the API module, `useMergeProps`, `useTimeout` (`primereact-10.9.9:components/lib/hooks/useTimeout.js`), `CSSTransition`, `Ripple`, `Utils`, severity icons.
- No service required.

## 11. Framework differences

| Aspect        | PrimeNG                                     | PrimeVue                                   | PrimeReact                                         |
| ------------- | ------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| Shipped       | no (removed in v20)                         | no                                         | yes                                                |
| Equivalent    | `<p-message>` in `@for`, `closable`, `life` | `<Message>` in `v-for`, `closable`, `life` | `Messages` with ref API                            |
| Feeding model | declarative list in component state         | declarative list in component state        | imperative `show` / `replace` / `remove` / `clear` |
| Default timer | none unless `life`                          | none unless `life`                         | 3000 ms unless `sticky`                            |
| Close default | `closable = false`                          | `closable = false`                         | close shown unless `closable: false`               |
| Item classes  | `p-message*`                                | `p-message*`                               | `p-message*`                                       |
| Theming       | `@primeuix/styles/message` + tokens         | `@primeuix/styles/message` + tokens        | own CSS; tokens N/A                                |

## 12. Sources

- `primereact-10.9.9:components/lib/messages/Messages.js`
- `primereact-10.9.9:components/lib/messages/MessagesBase.js`
- `primereact-10.9.9:components/lib/messages/UIMessage.js`
- `primereact-10.9.9:components/lib/messages/messages.d.ts`
- `primereact-10.9.9:components/lib/messages/package.json`
- `primereact-10.9.9:components/lib/hooks/useTimeout.js`
- `primereact-10.9.9:pages/messages/index.js`
- `primereact-10.9.9:components/doc/messages/` (`importdoc.js`, `basicdoc.js`, `severitydoc.js`, `dynamicdoc.js`, `closeabledoc.js`, `stickydoc.js`, `customicon.js`, `templatedoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:package.json`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/message/dynamic-doc.ts`
- `primeng-21.1.9:packages/primeng/src/api/messageservice.ts`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/message/DynamicDoc.vue`
- `@primeuix/styles-2.0.3:dist/message/index.mjs`
- Catalog: `docs/prime-reference/catalog/primereact.json` (`messages`)
