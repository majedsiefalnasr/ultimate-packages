# Card

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Card is a static content container with optional header (media), title, subtitle, body content and footer regions. It has no interactive behavior of its own. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/card/card.ts`, `primevue-4.5.5:packages/primevue/src/card/Card.vue`, `primereact-10.9.9:components/lib/card/Card.js`).

## 2. Names & status

- Canonical name: **Card** in all three frameworks; no legacy aliases.
- Not deprecated. In PrimeNG the `styleClass` input is deprecated since v20.0.0 in favor of `class` (`primeng-21.1.9:packages/primeng/src/card/card.ts`).
- PrimeNG still accepts the legacy `<p-header>` / `<p-footer>` facet elements from `primeng/api` alongside the newer templates (`primeng-21.1.9:packages/primeng/src/card/card.ts`).
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                        | PrimeVue                                                                                 | PrimeReact                                                |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Import         | `import { CardModule } from 'primeng/card'` (component `Card` is standalone)                   | `import Card from 'primevue/card'`                                                       | `import { Card } from 'primereact/card'`                  |
| Selector / tag | `<p-card>`                                                                                     | `<Card>`                                                                                 | `<Card />`                                                |
| Source         | `packages/primeng/src/card/card.ts`, `style/cardstyle.ts`, types in `types/card/card.types.ts` | `packages/primevue/src/card/Card.vue`, `BaseCard.vue`, `Card.d.ts`, `style/CardStyle.js` | `components/lib/card/Card.js`, `CardBase.js`, `card.d.ts` |
| Base class     | `BaseComponent<CardPassThrough>`, implements `BlockableUI`                                     | `BaseComponent` (via `BaseCard`, provides `$pcCard`)                                     | `ComponentBase.extend` (`CardBase`)                       |
| Sub-components | none                                                                                           | none                                                                                     | none                                                      |

Sources: `primeng-21.1.9:apps/showcase/doc/card/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/card/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/card/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/card/BaseCard.vue`, `primereact-10.9.9:components/doc/card/importdoc.js`, `primereact-10.9.9:components/lib/card/CardBase.js`.

## 4. Anatomy

| Part     | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class             |
| -------- | -------------- | --------------- | ----------------- | ----------------- |
| Root     | `root`         | `root`          | `root`            | `p-card`          |
| Header   | `header`       | `header`        | `header`          | `p-card-header`   |
| Body     | `body`         | `body`          | `body`            | `p-card-body`     |
| Caption  | —              | `caption`       | —                 | `p-card-caption`  |
| Title    | `title`        | `title`         | `title`           | `p-card-title`    |
| Subtitle | `subtitle`     | `subtitle`      | `subTitle`        | `p-card-subtitle` |
| Content  | `content`      | `content`       | `content`         | `p-card-content`  |
| Footer   | `footer`       | `footer`        | `footer`          | `p-card-footer`   |

- The header sits outside the body; title, subtitle, content and footer sit inside the body.
- Only PrimeVue renders the caption wrapper (around title and subtitle, when either slot is present). PrimeNG defines a `caption` class in its style map but its template never renders it; PrimeReact has no caption (`primevue-4.5.5:packages/primevue/src/card/Card.vue`, `primeng-21.1.9:packages/primeng/src/card/style/cardstyle.ts`).
- PrimeReact renders the content wrapper only when `children` are present (`primereact-10.9.9:components/lib/card/Card.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/card/card.types.ts`, `primevue-4.5.5:packages/primevue/src/card/Card.d.ts`, `primereact-10.9.9:components/lib/card/card.d.ts`.

## 5. API highlights

| Member                   | PrimeNG                                                       | PrimeVue                                      | PrimeReact                                          |
| ------------------------ | ------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| Title text               | `header: string` input (rendered as the title)                | `title` slot                                  | `title: ReactNode \| (props) => ReactNode`          |
| Subtitle text            | `subheader: string` input                                     | `subtitle` slot                               | `subTitle: ReactNode \| (props) => ReactNode`       |
| Header area              | `header` template or `<p-header>` facet                       | `header` slot                                 | `header: ReactNode \| (props) => ReactNode`         |
| Body content             | default projection plus `content` template                    | `content` slot                                | `children`                                          |
| Footer                   | `footer` template or `<p-footer>` facet                       | `footer` slot                                 | `footer: ReactNode \| (props) => ReactNode`         |
| Title/subtitle templates | `title`, `subtitle` templates                                 | `title`, `subtitle` slots                     | via the props above                                 |
| Styling                  | `style`, `styleClass` (deprecated since v20.0.0, use `class`) | inherited `pt`, `ptOptions`, `unstyled`, `dt` | `style`, `className`, `pt`, `ptOptions`, `unstyled` |
| Methods                  | `getBlockableElement()` (BlockableUI)                         | —                                             | —                                                   |

- Naming trap: PrimeNG's `header` input sets the **title** text, while PrimeNG's `header` template and the PrimeVue/PrimeReact `header` slot/prop fill the **header** (media) area above the body (`primeng-21.1.9:packages/primeng/src/card/card.ts`).
- Templates in PrimeNG are accepted as `#name` content children or `pTemplate="name"` (`primeng-21.1.9:packages/primeng/src/types/card/card.types.ts`).
- Full API: catalog module `card` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — a card with a title and body text (`primeng-21.1.9:apps/showcase/doc/card/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/card/BasicDoc.vue`, `primereact-10.9.9:components/doc/card/basicdoc.js`).
- **Advanced** — combine a header image, title, subtitle, body and footer actions (buttons) (`primeng-21.1.9:apps/showcase/doc/card/advanced-doc.ts`, `primevue-4.5.5:apps/showcase/doc/card/AdvancedDoc.vue`, `primereact-10.9.9:components/doc/card/advanceddoc.js`).
- PrimeReact styles an image placed in the header at full width by default (`primereact-10.9.9:components/lib/card/CardBase.js`).

No services or providers are required.

## 7. Accessibility

- Card is a plain `div` with no implicit role; when the card is a landmark-worthy section, the consumer supplies a role such as `region` plus a label through attributes (`primeng-21.1.9:apps/showcase/doc/card/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/card/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/card/accessibilitydoc.js`).
- No interactive elements and no keyboard support of its own; focus behavior comes entirely from content.
- Title and subtitle render as `div`s, not headings, so heading semantics must come from the content the consumer puts in them.

## 8. Theming

- Style classes: `p-card` (with `p-component`), `p-card-header`, `p-card-body`, `p-card-caption`, `p-card-title`, `p-card-subtitle`, `p-card-content`, `p-card-footer` (catalog `primeng.json` `modules.card`; `primeng-21.1.9:packages/primeng/src/card/style/cardstyle.ts`, `primevue-4.5.5:packages/primevue/src/card/style/CardStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/card/index.mjs`; PrimeNG adds `.p-card { display: block }` for its host element.
- Design tokens (`@primeuix/themes-2.0.3:types/card/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 10 tokens): `root` (`background`, `borderRadius`, `color`, `shadow`), `body` (`padding`, `gap`), `caption.gap`, `title` (`fontSize`, `fontWeight`), `subtitle.color`. Aura preset values: `@primeuix/themes-2.0.3:dist/aura/card/index.mjs`.
- PrimeReact: classes from `css.classes` in `CardBase.js`; structural CSS in `css.styles` (header image width); design tokens N/A (`primereact-10.9.9:components/lib/card/CardBase.js`, `primereact-10.9.9:components/doc/card/theming/styleddoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/card/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/card/pt/index.vue`, `primereact-10.9.9:components/doc/card/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime components.
- Related: Panel (adds a header bar, toggling and icons), Fieldset (semantic grouping with a legend).
- PrimeNG Card implements `BlockableUI`, so BlockUI can target it (`primeng-21.1.9:packages/primeng/src/card/card.ts`).
- Showcase demos pair it with Button in the footer (`primevue-4.5.5:apps/showcase/doc/card/AdvancedDoc.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils`, `primeng/api` (`Header`, `Footer`, `SharedModule`, `PrimeTemplate`, `BlockableUI`), `primeng/basecomponent`, `primeng/bind`, `primeng/base`, `@primeuix/styles/card` (`primeng-21.1.9:packages/primeng/src/card/card.ts`, `primeng-21.1.9:packages/primeng/src/card/style/cardstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/styles/card` (`primevue-4.5.5:packages/primevue/src/card/BaseCard.vue`, `primevue-4.5.5:packages/primevue/src/card/style/CardStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/card/Card.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect          | PrimeNG                                     | PrimeVue                         | PrimeReact                 |
| --------------- | ------------------------------------------- | -------------------------------- | -------------------------- |
| Title input     | `header` (string) or `title` template       | `title` slot                     | `title` prop               |
| Subtitle input  | `subheader` (string) or `subtitle` template | `subtitle` slot                  | `subTitle` prop            |
| Caption wrapper | class defined, not rendered                 | rendered when title/subtitle set | none                       |
| Content wrapper | always rendered                             | always rendered                  | only when `children` exist |
| Legacy facets   | `<p-header>`, `<p-footer>`                  | —                                | —                          |
| Subtitle PT key | `subtitle`                                  | `subtitle`                       | `subTitle`                 |
| BlockUI target  | yes (`BlockableUI`)                         | n/a                              | n/a                        |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/card/card.ts`
- `primeng-21.1.9:packages/primeng/src/card/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/card/style/cardstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/card/card.types.ts`
- `primeng-21.1.9:apps/showcase/doc/card/` (`import-doc.ts`, `basic-doc.ts`, `advanced-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/card/Card.vue`
- `primevue-4.5.5:packages/primevue/src/card/BaseCard.vue`
- `primevue-4.5.5:packages/primevue/src/card/Card.d.ts`
- `primevue-4.5.5:packages/primevue/src/card/style/CardStyle.js`
- `primevue-4.5.5:apps/showcase/doc/card/` (`ImportDoc.vue`, `BasicDoc.vue`, `AdvancedDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/card/Card.js`
- `primereact-10.9.9:components/lib/card/CardBase.js`
- `primereact-10.9.9:components/lib/card/card.d.ts`
- `primereact-10.9.9:components/doc/card/` (`importdoc.js`, `basicdoc.js`, `advanceddoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/card/index.mjs`
- `@primeuix/themes-2.0.3:types/card/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/card/index.mjs`
