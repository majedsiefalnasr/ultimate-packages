# DataScroller

**Category:** Data · **Frameworks:** PrimeReact 10.9.9

## 1. Summary

DataScroller shows a list of items and appends more of them on demand, in pages of `rows` items. A page loads when the user scrolls near the end of the document, or of the component itself in inline mode, or when the application calls `load()` (loader mode). In lazy mode it does not slice `value` itself; it emits `onLazyLoad` with `{ first, rows }` and renders whatever `value` the application passes back (`primereact-10.9.9:components/lib/datascroller/DataScroller.js`). It is a display list with no selection, sorting, or keyboard interaction.

## 2. Names & status

- Canonical name: **DataScroller**, PrimeReact only. Listed under **Data** at route `/datascroller` in `primereact-10.9.9:components/layout/menu.json`.
- PrimeNG: N/A — not shipped in primeng-21.1.9. There is no `packages/primeng/src/datascroller` folder, no DataScroller entry in `primeng-21.1.9:apps/showcase/assets/data/menu.json`, and no `datascroller` module in `docs/prime-reference/catalog/primeng.json`.
- PrimeVue: N/A — not shipped in primevue-4.5.5. There is no `packages/primevue/src/datascroller` folder, no entry in `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, and no `datascroller` module in `docs/prime-reference/catalog/primevue.json`.
- The nearest equivalents in those frameworks are DataView with a paginator, and VirtualScroller (`scroller` in PrimeNG) with lazy loading. See [dataview.md](dataview.md) and [virtualscroller.md](virtualscroller.md).
- Deprecated members: none.

## 3. Per framework

**PrimeNG 21.1.9:** N/A — not shipped (see §2).

**PrimeVue 4.5.5:** N/A — not shipped (see §2).

**PrimeReact 10.9.9**

- Import: `import { DataScroller } from 'primereact/datascroller'` (`primereact-10.9.9:components/doc/datascroller/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/datascroller/DataScroller.js` (`React.memo(React.forwardRef(...))`); defaults and CSS in `primereact-10.9.9:components/lib/datascroller/DataScrollerBase.js`; types in `primereact-10.9.9:components/lib/datascroller/datascroller.d.ts`; package entry in `primereact-10.9.9:components/lib/datascroller/package.json`.
- Showcase page: `primereact-10.9.9:pages/datascroller/index.js` (sections Import, Basic, Inline, Loader, Accessibility; PT Wireframe and PT options; theming Styled and Tailwind).

## 4. Anatomy

| Part          | PT key         | Element | Notes                                                                   |
| ------------- | -------------- | ------- | ----------------------------------------------------------------------- |
| Root          | `root`         | `<div>` | Classes `p-datascroller p-component`, plus `p-datascroller-inline`.     |
| Header        | `header`       | `<div>` | Rendered only when `header` is set.                                     |
| Content       | `content`      | `<div>` | Inline `max-height` from `scrollHeight`; the scroll target when inline. |
| List          | `list`         | `<ul>`  | Holds the loaded items.                                                 |
| Item          | `item`         | `<li>`  | One per loaded item; `itemTemplate(item)` output, or the raw item.      |
| Empty message | `emptyMessage` | `<li>`  | Shown when nothing is loaded yet.                                       |
| Footer        | `footer`       | `<div>` | Rendered only when `footer` is set; the usual place for a Load button.  |

PT keys are from `DataScrollerPassThroughOptions`, which also has `hooks` (`primereact-10.9.9:components/lib/datascroller/datascroller.d.ts`).

## 5. API highlights

| Prop / member                 | Type                                               | Default (`DataScrollerBase`) | Effect                                                                              |
| ----------------------------- | -------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| `value`                       | `any[]`                                            | `null`                       | Full data set (eager), or the data loaded so far (lazy).                            |
| `rows`                        | `number`                                           | `0`                          | Page size for each load. Must be set, because with `0` nothing loads.               |
| `itemTemplate`                | `(item: any) => React.ReactNode`                   | `null`                       | Renders one item. There is no index argument.                                       |
| `inline`                      | `boolean`                                          | `false`                      | Listens to scrolling of the content element instead of `window`.                    |
| `scrollHeight`                | `string`                                           | `null`                       | Max height of the content area, used with `inline`.                                 |
| `buffer`                      | `number`                                           | `0.9`                        | Fraction of the scroll height at which the next page loads.                         |
| `loader`                      | `boolean`                                          | `false`                      | Disables the scroll trigger. Loading then happens only through the ref `load()`.    |
| `lazy`                        | `boolean`                                          | `false`                      | Each load fires `onLazyLoad` instead of slicing `value`.                            |
| `onLazyLoad`                  | `(event: { first: number; rows: number }) => void` | `null`                       | Lazy load request (`DataScrollerLazyLoadEvents`).                                   |
| `emptyMessage`                | `React.ReactNode \| ((props) => React.ReactNode)`  | `null`                       | Falls back to the `emptyMessage` locale option (d.ts documents "No records found"). |
| `header` / `footer`           | `React.ReactNode`                                  | `null`                       | Optional header and footer areas.                                                   |
| `pt`, `ptOptions`, `unstyled` | —                                                  | `unstyled` `false`           | Standard PrimeReact pass-through and unstyled support.                              |

- Ref methods: the d.ts declares `load(): void` and `getElement(): HTMLDivElement | null`. The implementation also exposes `reset()` (clears the loaded items and loads the first page again), `getContent()`, and `props` through `useImperativeHandle`, but these are not typed (`primereact-10.9.9:components/lib/datascroller/DataScroller.js`, `primereact-10.9.9:components/lib/datascroller/datascroller.d.ts`).
- Behaviour on `value` change: the loaded items are cleared. In eager mode paging restarts from 0 and the first page reloads. In lazy mode `value` is rendered as-is and the internal `first` keeps advancing, so the application must accumulate the pages itself.
- Source quirk: when the scroll listener is unbound and the component is not inline, `window.removeEventListener` runs only while `loader` is false. Switching `loader` from false to true at runtime therefore leaves the window scroll listener attached (`primereact-10.9.9:components/lib/datascroller/DataScroller.js`).

## 6. Usage guidance

- **Basic:** set `value`, `rows` and `itemTemplate`. Further pages append as the page scrolls toward its end (`primereact-10.9.9:components/doc/datascroller/basicdoc.js`).
- **Inline:** `inline` with a `scrollHeight` turns the component into its own scroll container (`primereact-10.9.9:components/doc/datascroller/inlinedoc.js`).
- **Loader:** with `loader`, scrolling triggers nothing. A control (the demo uses a Button in `footer`) calls `load()` on the component ref (`primereact-10.9.9:components/doc/datascroller/loaderdoc.js`).
- **Lazy:** no dedicated showcase section. Behaviour comes from the source only (§5).
- No services or providers are required.

## 7. Accessibility

- The accessibility doc says the items are a semantic list, no role is enforced, any ARIA attribute is forwarded to the container, and there are no built-in interactive elements, hence no keyboard support (`primereact-10.9.9:components/doc/datascroller/accessibilitydoc.js`).
- Source agrees on the markup: a `<ul>` with `<li>` items, and the empty message is also an `<li>`.
- Doc/source mismatch: the doc says the list can be customized through a `listProps` property, but no such prop exists. The `<ul>` is reached through `pt.list` (`primereact-10.9.9:components/lib/datascroller/DataScroller.js`, `primereact-10.9.9:components/lib/datascroller/datascroller.d.ts`).
- Newly loaded items are not announced (no live region). If users need to know that loading happened, the application has to provide that feedback.

## 8. Theming

- Structural classes: `p-datascroller`, `p-datascroller-inline`, `p-datascroller-header`, `p-datascroller-content`, `p-datascroller-list`, `p-datascroller-footer` (`primereact-10.9.9:components/lib/datascroller/DataScrollerBase.js`, `primereact-10.9.9:components/doc/datascroller/theming/styleddoc.js`). The item and empty-message `<li>` elements get no class.
- Own CSS: `DataScrollerBase.css.styles` under `@layer primereact`, injected through `useHandleStyle` with name `datascroller`. Content gets `overflow: auto` only in inline mode.
- PT keys: see §4. Unlike most PrimeReact components, `datascroller` has no key in `PrimeReactPTOptions` (`primereact-10.9.9:components/lib/api/api.d.ts`), so global pass-through for it is not typed.
- Tailwind preset: the `datascroller` entry in `primereact-10.9.9:components/lib/passthrough/tailwind/index.js` styles `content` and `header`. It also defines a `grid` key that matches no DataScroller PT section, apparently left over from DataView (`primereact-10.9.9:components/doc/datascroller/theming/tailwinddoc.js`).
- Design tokens: N/A. PrimeReact 10 does not use `@primeuix/themes`, and `@primeuix/styles-2.0.3` has no `datascroller` module.

## 9. Relationships

- Overlaps with DataView, which supports paging through Paginator but not infinite append, and with VirtualScroller, which renders only the visible window and can lazy-load. DataScroller keeps every loaded item in the DOM.
- The Loader demo uses Button. No other component is embedded.

## 10. Dependencies

- Internal: `../api/Api` (`PrimeReactContext`, `localeOption`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`, `useUnmountEffect`, `useUpdateEffect`), `../utils/Utils` (`ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/datascroller/DataScroller.js`).
- External npm packages: `react` only.

## 11. Framework differences

| Aspect           | PrimeNG                   | PrimeVue                  | PrimeReact                                 |
| ---------------- | ------------------------- | ------------------------- | ------------------------------------------ |
| Shipped          | No                        | No                        | Yes                                        |
| Nearest option   | DataView, Scroller (lazy) | DataView, VirtualScroller | Itself, DataView, VirtualScroller          |
| Load triggers    | N/A                       | N/A                       | Window scroll, inline scroll, ref `load()` |
| Lazy loading     | N/A                       | N/A                       | `lazy` + `onLazyLoad`                      |
| Global PT typing | N/A                       | N/A                       | Missing from `PrimeReactPTOptions`         |
| Design tokens    | N/A                       | N/A                       | N/A (own CSS)                              |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/datascroller/DataScroller.js`
- `primereact-10.9.9:components/lib/datascroller/DataScrollerBase.js`
- `primereact-10.9.9:components/lib/datascroller/datascroller.d.ts`
- `primereact-10.9.9:components/lib/datascroller/package.json`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:pages/datascroller/index.js`
- `primereact-10.9.9:components/doc/datascroller/importdoc.js`
- `primereact-10.9.9:components/doc/datascroller/basicdoc.js`
- `primereact-10.9.9:components/doc/datascroller/inlinedoc.js`
- `primereact-10.9.9:components/doc/datascroller/loaderdoc.js`
- `primereact-10.9.9:components/doc/datascroller/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/datascroller/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/datascroller/theming/tailwinddoc.js`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
