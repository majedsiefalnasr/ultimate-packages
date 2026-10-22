# DeferredContent

**Category:** Panel · **Frameworks:** PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

DeferredContent postpones rendering its children until the wrapper element scrolls into the viewport, then emits a load event once. It is meant for heavy or data-backed blocks lower on a page (for example a table that fetches its rows on load). PrimeVue and PrimeReact ship it; PrimeNG 21.1.9 does not (`primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`, `primereact-10.9.9:components/lib/deferredcontent/DeferredContent.js`).

## 2. Names & status

- Canonical name: **DeferredContent**. The showcase menus label it "Deferred" and route to `/deferredcontent` (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Not deprecated in PrimeVue or PrimeReact.
- PrimeNG: N/A — not shipped in primeng-21.1.9. There is no `packages/primeng/src/deferredcontent/` folder, no showcase doc folder and no menu entry. PrimeNG's equivalent directive `pDefer` was deprecated in v18 ("Use Angular `defer` instead") and removed in v20 in favour of Angular deferred views (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`).
- The PrimeNG showcase still has an internal demo helper `p-deferred-demo` (`DeferredDemo`) that delays its projected content; it is showcase code, not a library export (`primeng-21.1.9:apps/showcase/components/demo/deferreddemo.ts`).

## 3. Per framework

| Aspect         | PrimeNG           | PrimeVue                                                                                                             | PrimeReact                                                                                            |
| -------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Import         | N/A — not shipped | `import DeferredContent from 'primevue/deferredcontent'`                                                             | `import { DeferredContent } from 'primereact/deferredcontent'`                                        |
| Selector / tag | N/A               | `<DeferredContent>`                                                                                                  | `<DeferredContent />`                                                                                 |
| Source         | N/A               | `packages/primevue/src/deferredcontent/DeferredContent.vue`, `DeferredContent.d.ts`, `style/DeferredContentStyle.js` | `components/lib/deferredcontent/DeferredContent.js`, `DeferredContentBase.js`, `deferredcontent.d.ts` |
| Base class     | N/A               | `BaseComponent` (no separate `BaseDeferredContent` file)                                                             | `ComponentBase.extend` (`DeferredContentBase`)                                                        |
| Sub-components | N/A               | none                                                                                                                 | none                                                                                                  |

Sources: `primevue-4.5.5:apps/showcase/doc/deferredcontent/ImportDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/importdoc.js`.

## 4. Anatomy

| Part | Element | PT key (PrimeVue / PrimeReact) | Class |
| ---- | ------- | ------------------------------ | ----- |
| Root | `div`   | `root`                         | none  |

- The root `div` is always rendered (it is the element whose position is measured); the default slot / `children` render inside it only after loading (`primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`, `primereact-10.9.9:components/lib/deferredcontent/DeferredContent.js`).
- PT definitions: `primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.d.ts`, `primereact-10.9.9:components/lib/deferredcontent/deferredcontent.d.ts`.

## 5. API highlights

| Member     | PrimeVue                                            | PrimeReact                                                         |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| Props      | only the common `dt`, `pt`, `ptOptions`, `unstyled` | `children`, `pt`, `ptOptions`; other `div` attributes pass through |
| Load event | `load` emit (`load(): void` in the d.ts)            | `onLoad(event: React.SyntheticEvent)`                              |
| Slots      | `default`                                           | `children`                                                         |
| State      | `loaded?: boolean`                                  | `loaded?: boolean`                                                 |
| Methods    | —                                                   | `getElement(): HTMLDivElement \| null`                             |

- Load rule (both): on mount, if the root's top is at or above the bottom of the viewport (`document.documentElement.clientHeight >= rect.top`) it loads immediately; otherwise it listens to `window` `scroll` and loads on the first qualifying scroll, then removes the listener. It never unloads (`primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`, `primereact-10.9.9:components/lib/deferredcontent/DeferredContent.js`).
- No `IntersectionObserver`, threshold or root-margin option; only window scrolling is observed, so content inside a scrolling container is not detected until the window itself scrolls.
- On the initial-mount path both call `load()` without an event, so the emitted payload is `undefined` there.
- Source quirk: PrimeReact `DeferredContentBase.defaultProps` declares `onload` (lower case) while the component reads `props.onLoad` (`primereact-10.9.9:components/lib/deferredcontent/DeferredContentBase.js`).
- Full API: catalog module `deferredcontent` in `docs/prime-reference/catalog/primevue.json` and `primereact.json`.

## 6. Usage guidance

- **Import** — default import (Vue) or named import (React) (`primevue-4.5.5:apps/showcase/doc/deferredcontent/ImportDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/importdoc.js`).
- **Basic** — wrap the target (an image in the demo) and react to the load event, e.g. with a toast (`primevue-4.5.5:apps/showcase/doc/deferredcontent/BasicDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/basicdoc.js`).
- **DataTable** — wrap a DataTable and fetch its rows in the load handler so the request starts only when the table is about to be seen. The PrimeVue demo also adds `role="region"`, `aria-live="polite"` and an `aria-label` on the wrapper (`primevue-4.5.5:apps/showcase/doc/deferredcontent/DataTableDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/datatabledoc.js`).

No services or providers are required (the demo's ProductService is sample data).

## 7. Accessibility

- No role is enforced, because the component is a generic wrapper; any attribute passed to it reaches the root `div`, so authors can add a landmark role and `aria-live` so screen readers announce late content (`primevue-4.5.5:apps/showcase/doc/deferredcontent/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/accessibilitydoc.js`).
- Keyboard: no interactive elements of its own.

## 8. Theming

- Style classes: none. PrimeVue registers a style named `deferredcontent` with no CSS and no classes (`primevue-4.5.5:packages/primevue/src/deferredcontent/style/DeferredContentStyle.js`); both theming docs state the component applies no styling (`primevue-4.5.5:apps/showcase/doc/deferredcontent/theming/StyledDoc.vue`, `primereact-10.9.9:components/doc/deferredcontent/theming/styleddoc.js`, `primereact-10.9.9:components/doc/deferredcontent/styledoc.js`).
- Pass-through: `root` only (plus `hooks`) (`primevue-4.5.5:apps/showcase/doc/deferredcontent/pt/index.vue`, `primereact-10.9.9:components/doc/deferredcontent/pt/wireframe.js`).
- `@primeuix/styles`: N/A — no `deferredcontent` module in `@primeuix/styles-2.0.3:dist/`. Design tokens: N/A — no `deferredcontent` entry in `@primeuix/themes-2.0.3:types/`.
- PrimeReact: no CSS in `DeferredContentBase.js`; tokens N/A.

## 9. Relationships

- Embeds nothing.
- Commonly wraps data components (DataTable in the demos) or images.
- Related: AnimateOnScroll (also viewport-driven, but animates instead of delaying render); lazy modes of other components (Accordion `lazy`, Tabs `lazy`, VirtualScroller lazy loading); Angular `@defer` replaces it in PrimeNG.

## 10. Dependencies

- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style` (`primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`, `primevue-4.5.5:packages/primevue/src/deferredcontent/style/DeferredContentStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useEventListener`, `useMergeProps`, `useMountEffect`) (`primereact-10.9.9:components/lib/deferredcontent/DeferredContent.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect          | PrimeNG                               | PrimeVue                 | PrimeReact                     |
| --------------- | ------------------------------------- | ------------------------ | ------------------------------ |
| Availability    | not shipped (`pDefer` removed in v20) | `DeferredContent`        | `DeferredContent`              |
| Load event      | —                                     | `load`                   | `onLoad`                       |
| Scroll handling | —                                     | manual `window` listener | `useEventListener` on `window` |
| Extra methods   | —                                     | none                     | `getElement()`                 |
| Styling         | —                                     | empty style registration | none                           |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primeng-21.1.9:apps/showcase/components/demo/deferreddemo.ts`
- `primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`
- `primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.d.ts`
- `primevue-4.5.5:packages/primevue/src/deferredcontent/style/DeferredContentStyle.js`
- `primevue-4.5.5:apps/showcase/doc/deferredcontent/` (`ImportDoc.vue`, `BasicDoc.vue`, `DataTableDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/StyledDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/deferredcontent/DeferredContent.js`
- `primereact-10.9.9:components/lib/deferredcontent/DeferredContentBase.js`
- `primereact-10.9.9:components/lib/deferredcontent/deferredcontent.d.ts`
- `primereact-10.9.9:components/doc/deferredcontent/` (`importdoc.js`, `basicdoc.js`, `datatabledoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
