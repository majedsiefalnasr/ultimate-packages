# Timeline

**Category:** Data · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Timeline renders an array of arbitrary event objects as a chain of entries along a line. Each entry has three zones: an "opposite" area on one side of the line, a separator holding a marker and a connector to the next entry, and a content area on the other side. The component has no state and no interaction; all visible text comes from templates the application supplies (`primevue-4.5.5:packages/primevue/src/timeline/Timeline.vue`, `primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`, `primereact-10.9.9:components/lib/timeline/Timeline.js`).

## 2. Names & status

- Canonical name: **Timeline** in all three frameworks; no legacy alias, no deprecation of the component.
- Showcase menu: listed as `Timeline` under **Data** in all three menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: PrimeNG `styleClass` (`@deprecated since v20.0.0, use class instead`) (`primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`). None in PrimeVue or PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { TimelineModule } from 'primeng/timeline'` (showcase), or the standalone `Timeline` class (`primeng-21.1.9:apps/showcase/doc/timeline/import-doc.ts`).
- Selector: `p-timeline`; standalone component, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`.
- Source: `primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`; style `primeng-21.1.9:packages/primeng/src/timeline/style/timelinestyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/timeline/timeline.types.ts`.
- Exports: `Timeline`, `TimelineModule`, `TimelineStyle`, `TimelineClasses`, and the types re-exported from `primeng/types/timeline` (`primeng-21.1.9:packages/primeng/src/timeline/public_api.ts`).
- Implements `BlockableUI` (`getBlockableElement()` returns the first child), so it can be the target of BlockUI.

**PrimeVue 4.5.5**

- Import: `import Timeline from 'primevue/timeline'` (`primevue-4.5.5:apps/showcase/doc/timeline/ImportDoc.vue`).
- Tag: `<Timeline>`.
- Source: `primevue-4.5.5:packages/primevue/src/timeline/Timeline.vue`, props in `primevue-4.5.5:packages/primevue/src/timeline/BaseTimeline.vue`, types `primevue-4.5.5:packages/primevue/src/timeline/Timeline.d.ts`, style `primevue-4.5.5:packages/primevue/src/timeline/style/TimelineStyle.js`.
- Package entry: `primevue-4.5.5:packages/primevue/src/timeline/package.json`.

**PrimeReact 10.9.9**

- Import: `import { Timeline } from 'primereact/timeline'` (`primereact-10.9.9:components/doc/timeline/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/timeline/Timeline.js` (`React.memo(React.forwardRef(...))`), defaults and CSS in `primereact-10.9.9:components/lib/timeline/TimelineBase.js`, types `primereact-10.9.9:components/lib/timeline/timeline.d.ts`.

## 4. Anatomy

One repeated event block per item of `value`:

| Part      | PrimeNG / PrimeVue section | PrimeReact section | Content                                              |
| --------- | -------------------------- | ------------------ | ---------------------------------------------------- |
| Root      | `root` (NG also `host`)    | `root`             | Container; class reflects `align` and `layout`.      |
| Event     | `event`                    | `event`            | One per item.                                        |
| Opposite  | `eventOpposite`            | `opposite`         | Opposite template output.                            |
| Separator | `eventSeparator`           | `separator`        | Wraps marker and connector.                          |
| Marker    | `eventMarker`              | `marker`           | Default dot; replaced entirely by a marker template. |
| Connector | `eventConnector`           | `connector`        | Line to the next event; omitted after the last item. |
| Content   | `eventContent`             | `content`          | Content template output.                             |

Rendered elements differ: PrimeVue renders `<ol>` with one `<li>` per event; PrimeNG renders `<div>` children directly inside the `p-timeline` host; PrimeReact renders a `<div>` root with `<div>` events (`primevue-4.5.5:packages/primevue/src/timeline/Timeline.vue`, `primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`, `primereact-10.9.9:components/lib/timeline/Timeline.js`). Section keys come from the PT types (`primeng-21.1.9:packages/primeng/src/types/timeline/timeline.types.ts`, `primevue-4.5.5:packages/primevue/src/timeline/Timeline.d.ts`, `primereact-10.9.9:components/lib/timeline/timeline.d.ts`).

## 5. API highlights

Props / inputs (all `@Input()` decorators in PrimeNG):

| Prop      | PrimeNG                                    | PrimeVue                                                                        | PrimeReact                                                        |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `value`   | `any[] \| undefined`                       | `any[]`                                                                         | `any[]`                                                           |
| `align`   | `string`, default `'left'`                 | `HintedString<'left' \| 'right' \| 'top' \| 'bottom' \| 'alternate'>`, `'left'` | `'left' \| 'right' \| 'top' \| 'bottom' \| 'alternate'`, `'left'` |
| `layout`  | `'vertical' \| 'horizontal'`, `'vertical'` | `HintedString<'vertical' \| 'horizontal'>`, runtime default `'vertical'`        | `'vertical' \| 'horizontal'`, `'vertical'`                        |
| `dataKey` | N/A                                        | `string` — field used as the `v-for` key (index otherwise)                      | `string` — React key (`pr_id__<index>` otherwise)                 |

- Templates: PrimeNG `content`, `opposite`, `marker` (`#name` or `pTemplate="name"`), context `TimelineItemTemplateContext<T>` with `$implicit: T` (`primeng-21.1.9:packages/primeng/src/types/timeline/timeline.types.ts`). PrimeVue slots `content`, `opposite`, `marker`, `connector`, each scoped `{ item: any, index: number }` (`primevue-4.5.5:packages/primevue/src/timeline/Timeline.d.ts`). PrimeReact props `content`, `opposite`, `marker`, typed `React.ReactNode | ((item: any, index: number) => React.ReactNode)` (`primereact-10.9.9:components/lib/timeline/timeline.d.ts`).
- Only PrimeVue lets the connector be templated; PrimeNG and PrimeReact always render the built-in connector.
- Methods: PrimeReact `getElement(): HTMLDivElement`; none in PrimeNG/PrimeVue beyond `getBlockableElement()` on PrimeNG.
- Events: none in any framework.
- Docs/type mismatch: the PrimeVue `.d.ts` declares `@defaultValue horizontal` for `layout`, but `BaseTimeline.vue` defaults it to `'vertical'`, as does the showcase text (`primevue-4.5.5:packages/primevue/src/timeline/Timeline.d.ts`, `primevue-4.5.5:packages/primevue/src/timeline/BaseTimeline.vue`, `primevue-4.5.5:apps/showcase/doc/timeline/HorizontalDoc.vue`). The catalog carries the `.d.ts` value.

## 6. Usage guidance

- **Basic:** pass the event objects through `value` and supply a content template; without one an entry has no visible text (`primeng-21.1.9:apps/showcase/doc/timeline/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/BasicDoc.vue`, `primereact-10.9.9:components/doc/timeline/basicdoc.js`).
- **Alignment:** `align` places content relative to the line; `alternate` switches side per entry (`primeng-21.1.9:apps/showcase/doc/timeline/alignment-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/AlignmentDoc.vue`, `primereact-10.9.9:components/doc/timeline/alignmentdoc.js`).
- **Opposite:** the opposite template fills the other side of the line, typically with dates (`primeng-21.1.9:apps/showcase/doc/timeline/opposite-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/OppositeDoc.vue`, `primereact-10.9.9:components/doc/timeline/oppositedoc.js`).
- **Template:** a custom marker template plus rich content (cards, icons) builds a styled history view (`primeng-21.1.9:apps/showcase/doc/timeline/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/TemplateDoc.vue`, `primereact-10.9.9:components/doc/timeline/templatedoc.js`).
- **Horizontal:** `layout="horizontal"` lays events in a row; `top`/`bottom` alignment applies there (`primeng-21.1.9:apps/showcase/doc/timeline/horizontal-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/HorizontalDoc.vue`, `primereact-10.9.9:components/doc/timeline/horizontaldoc.js`).
- No services or providers are needed.

## 7. Accessibility

- All three accessibility docs state that Timeline is a semantic ordered list, enforces no role, forwards any ARIA attribute to the list element, and has no interactive elements, hence no keyboard support (`primeng-21.1.9:apps/showcase/doc/timeline/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/timeline/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/timeline/accessibilitydoc.js`).
- Source vs docs: only PrimeVue actually renders `<ol>`/`<li>`. PrimeNG and PrimeReact render `<div>` elements, so the "ordered list" statement does not hold for them; list semantics would have to be added by the application (for example `role="list"`/`role="listitem"` through PT) (`primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`, `primereact-10.9.9:components/lib/timeline/Timeline.js`).

## 8. Theming

- Style classes (identical in PrimeNG and PrimeVue): `p-timeline`, `p-timeline-event`, `p-timeline-event-opposite`, `p-timeline-event-separator`, `p-timeline-event-marker`, `p-timeline-event-connector`, `p-timeline-event-content`; the root also gets `p-component`, `p-timeline-<align>` and `p-timeline-<layout>` (`primeng-21.1.9:packages/primeng/src/timeline/style/timelinestyle.ts`, `primevue-4.5.5:packages/primevue/src/timeline/style/TimelineStyle.js`). PrimeReact uses the same class names (`primereact-10.9.9:components/lib/timeline/TimelineBase.js`, `primereact-10.9.9:components/doc/timeline/theming/styleddoc.js`).
- Data attribute: PrimeNG and PrimeVue set `data-p` to the `layout` and `align` values on every part.
- PT keys: see Anatomy. PrimeVue PT method options carry `context: { index, count }` (`TimelineContext`); PrimeReact passes `context: { index }`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/timeline/index.mjs` (PrimeNG and PrimeVue). PrimeReact embeds its own CSS string in `TimelineBase.css.styles` under `@layer primereact`.
- Design tokens (PrimeNG/PrimeVue): `TimelineDesignTokens` sections `event`, `horizontal`, `vertical`, `eventMarker`, `eventConnector` (`@primeuix/themes-2.0.3:types/timeline/index.d.ts`); 14 tokens in the token table (`@primeuix/themes-2.0.3:tokens/index.mjs`); Aura values in `@primeuix/themes-2.0.3:dist/aura/timeline/index.mjs`. PrimeReact: tokens N/A.

## 9. Relationships

- Embeds no other Prime component.
- Commonly combined with Card or Button inside content templates (showcase Template demo).
- PrimeNG: target for BlockUI through `BlockableUI`.
- Related: Steps/Stepper (sequential progress, interactive) — Timeline is display-only.

## 10. Dependencies

- PrimeNG: `primeng/api` (`PrimeTemplate`, `SharedModule`, `BlockableUI`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/timeline` (`primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/utils` (`cn`, `resolveFieldData`), `@primeuix/styles/timeline` (`primevue-4.5.5:packages/primevue/src/timeline/Timeline.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/timeline/Timeline.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect            | PrimeNG                         | PrimeVue                                     | PrimeReact                            |
| ----------------- | ------------------------------- | -------------------------------------------- | ------------------------------------- |
| Root markup       | `p-timeline` host + `<div>`s    | `<ol>` + `<li>`                              | `<div>` + `<div>`s                    |
| Templates         | `content`, `opposite`, `marker` | `content`, `opposite`, `marker`, `connector` | `content`, `opposite`, `marker` props |
| Template context  | `$implicit` item                | `{ item, index }`                            | `(item, index)`                       |
| `dataKey`         | No                              | Yes                                          | Yes                                   |
| PT section naming | `event*` prefixed + `host`      | `event*` prefixed                            | Short (`marker`, `connector`, …)      |
| `layout` default  | `'vertical'`                    | `'vertical'` (d.ts says `horizontal`)        | `'vertical'`                          |
| Design tokens     | `@primeuix/themes`              | `@primeuix/themes`                           | N/A                                   |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/timeline/timeline.ts`
- `primeng-21.1.9:packages/primeng/src/timeline/style/timelinestyle.ts`
- `primeng-21.1.9:packages/primeng/src/timeline/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/timeline/timeline.types.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/alignment-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/opposite-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/horizontal-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/timeline/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/src/timeline/Timeline.vue`
- `primevue-4.5.5:packages/primevue/src/timeline/BaseTimeline.vue`
- `primevue-4.5.5:packages/primevue/src/timeline/Timeline.d.ts`
- `primevue-4.5.5:packages/primevue/src/timeline/style/TimelineStyle.js`
- `primevue-4.5.5:packages/primevue/src/timeline/package.json`
- `primevue-4.5.5:apps/showcase/doc/timeline/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/AlignmentDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/OppositeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/HorizontalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/timeline/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/timeline/Timeline.js`
- `primereact-10.9.9:components/lib/timeline/TimelineBase.js`
- `primereact-10.9.9:components/lib/timeline/timeline.d.ts`
- `primereact-10.9.9:components/doc/timeline/importdoc.js`
- `primereact-10.9.9:components/doc/timeline/basicdoc.js`
- `primereact-10.9.9:components/doc/timeline/alignmentdoc.js`
- `primereact-10.9.9:components/doc/timeline/oppositedoc.js`
- `primereact-10.9.9:components/doc/timeline/templatedoc.js`
- `primereact-10.9.9:components/doc/timeline/horizontaldoc.js`
- `primereact-10.9.9:components/doc/timeline/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/timeline/theming/styleddoc.js`
- `@primeuix/styles-2.0.3:dist/timeline/index.mjs`
- `@primeuix/themes-2.0.3:types/timeline/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/timeline/index.mjs`
