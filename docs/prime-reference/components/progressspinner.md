# ProgressSpinner

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ProgressSpinner is a circular, always-spinning loading indicator drawn as an SVG circle with an animated dash and colour cycle. It has no value: it only says "work is in progress". All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/progressspinner/progressspinner.ts`, `primevue-4.5.5:packages/primevue/src/progressspinner/ProgressSpinner.vue`, `primereact-10.9.9:components/lib/progressspinner/ProgressSpinner.js`).

## 2. Names & status

- Canonical name: **ProgressSpinner**. No aliases; not deprecated.
- PrimeNG `styleClass` is `@deprecated since v20.0.0` (catalog `progressspinner` in `docs/prime-reference/catalog/primeng.json`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                | PrimeVue                                                    | PrimeReact                                                     |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Import         | `import { ProgressSpinnerModule } from 'primeng/progressspinner'`      | `import ProgressSpinner from 'primevue/progressspinner'`    | `import { ProgressSpinner } from 'primereact/progressspinner'` |
| Selector / tag | `<p-progressspinner>` (also `p-progressSpinner`, `p-progress-spinner`) | `<ProgressSpinner>`                                         | `<ProgressSpinner />`                                          |
| Source         | `packages/primeng/src/progressspinner/progressspinner.ts`              | `packages/primevue/src/progressspinner/ProgressSpinner.vue` | `components/lib/progressspinner/ProgressSpinner.js`            |
| Base           | `BaseComponent<ProgressSpinnerPassThrough>`, standalone                | `BaseComponent` via `BaseProgressSpinner.vue`               | `ComponentBase.extend` (`ProgressSpinnerBase.js`)              |

Sources: `primeng-21.1.9:apps/showcase/doc/progressspinner/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressspinner/ImportDoc.vue`, `primereact-10.9.9:components/doc/progressspinner/importdoc.js`.

## 4. Anatomy

| Part   | Element                           | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                               |
| ------ | --------------------------------- | -------------- | --------------- | ----------------- | ------------------------------------------------------------------- |
| Root   | host / `div` `role="progressbar"` | `host`, `root` | `root`          | `root`            | `p-progressspinner` (PrimeReact `p-progress-spinner`)               |
| Spin   | `svg` `viewBox="25 25 50 50"`     | `spin`         | `spin`          | `spinner`         | `p-progressspinner-spin` (PrimeReact `p-progress-spinner-svg`)      |
| Circle | `circle` `r="20"`                 | `circle`       | `circle`        | `circle`          | `p-progressspinner-circle` (PrimeReact `p-progress-spinner-circle`) |

- PT definitions: `primeng-21.1.9:packages/primeng/src/types/progressspinner/progressspinner.types.ts`, `primevue-4.5.5:packages/primevue/src/progressspinner/ProgressSpinner.d.ts`, `primereact-10.9.9:components/lib/progressspinner/progressspinner.d.ts`.

## 5. API highlights

| Prop                | PrimeNG             | PrimeVue             | PrimeReact           |
| ------------------- | ------------------- | -------------------- | -------------------- |
| `strokeWidth`       | `string` (`'2'`)    | `string` (`'2'`)     | `string` (`'2'`)     |
| `fill`              | `string` (`'none'`) | `string` (`'none'`)  | `string` (`'none'`)  |
| `animationDuration` | `string` (`'2s'`)   | `string` (`'2s'`)    | `string` (`'2s'`)    |
| `ariaLabel`         | `string`            | — (use `aria-label`) | — (use `aria-label`) |

- `animationDuration` sets the CSS `animation-duration` of the rotating SVG; the dash and colour animations keep their CSS durations.
- No events, slots or templates. PrimeReact exposes `getElement()` (`primereact-10.9.9:components/lib/progressspinner/ProgressSpinner.js`).
- Size is controlled through `style`/`class` width and height (default 100px × 100px in the structural CSS).
- Full API: catalog module `progressspinner` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — drop in for an infinite spin (`primeng-21.1.9:apps/showcase/doc/progressspinner/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressspinner/BasicDoc.vue`, `primereact-10.9.9:components/doc/progressspinner/basicdoc.js`).
- **Custom** — change size via style, plus `strokeWidth`, `fill` and `animationDuration` (`primeng-21.1.9:apps/showcase/doc/progressspinner/custom-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressspinner/CustomDoc.vue`, `primereact-10.9.9:components/doc/progressspinner/customdoc.js`).

No services or providers are required.

## 7. Accessibility

- Root has `role="progressbar"`; describe it with `aria-label` or `aria-labelledby`. Not interactive (`primeng-21.1.9:apps/showcase/doc/progressspinner/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressspinner/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/progressspinner/accessibilitydoc.js`).
- PrimeNG and PrimeReact also set `aria-busy="true"`; PrimeVue does not (`primevue-4.5.5:packages/primevue/src/progressspinner/ProgressSpinner.vue`).
- There is no `aria-valuenow`, which is correct for an indeterminate progressbar.
- The animation ignores `prefers-reduced-motion` in the structural CSS (`@primeuix/styles-2.0.3:dist/progressspinner/index.mjs`).

## 8. Theming

- Style classes: `p-progressspinner`, `p-progressspinner-spin`, `p-progressspinner-circle` (`primeng-21.1.9:packages/primeng/src/progressspinner/style/progressspinnerstyle.ts`, `primevue-4.5.5:packages/primevue/src/progressspinner/style/ProgressSpinnerStyle.js`). The root has no `p-component` class.
- Structural CSS with `p-progressspinner-rotate`, `-dash` and `-color` keyframes: `@primeuix/styles-2.0.3:dist/progressspinner/index.mjs`.
- Design tokens (`@primeuix/themes-2.0.3:types/progressspinner/index.d.ts`): `root` (`colorOne`, `colorTwo`, `colorThree`, `colorFour`) — the four colours cycled by the stroke animation. Aura values: `@primeuix/themes-2.0.3:dist/aura/progressspinner/index.mjs`.
- PrimeReact: hyphenated classes `p-progress-spinner`, `p-progress-spinner-svg`, `p-progress-spinner-circle`; own CSS and keyframes in `ProgressSpinnerBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/progressspinner/ProgressSpinnerBase.js`, `primereact-10.9.9:components/doc/progressspinner/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/progressspinner/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/progressspinner/pt/index.vue`, `primereact-10.9.9:components/doc/progressspinner/pt/wireframe.js`.

## 9. Relationships

- Sibling of ProgressBar (`mode="indeterminate"` is its linear counterpart) and Skeleton (placeholder shapes while loading).
- Other components draw their own loading icons (for example the `SpinnerIcon`) rather than embedding ProgressSpinner; no PrimeNG, PrimeVue or PrimeReact component imports it.
- Commonly placed inside a BlockUI mask or a loading overlay.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/progressspinner` (`primeng-21.1.9:packages/primeng/src/progressspinner/progressspinner.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/progressspinner` (`primevue-4.5.5:packages/primevue/src/progressspinner/BaseProgressSpinner.vue`, `primevue-4.5.5:packages/primevue/src/progressspinner/style/ProgressSpinnerStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/progressspinner/ProgressSpinner.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect          | PrimeNG             | PrimeVue            | PrimeReact           |
| --------------- | ------------------- | ------------------- | -------------------- |
| Accessible name | `ariaLabel` input   | `aria-label` attr   | `aria-label` attr    |
| `aria-busy`     | `true`              | not set             | `true`               |
| SVG PT key      | `spin`              | `spin`              | `spinner`            |
| Class prefix    | `p-progressspinner` | `p-progressspinner` | `p-progress-spinner` |
| Theming         | `@primeuix` tokens  | `@primeuix` tokens  | own CSS, no tokens   |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/progressspinner/progressspinner.ts`
- `primeng-21.1.9:packages/primeng/src/progressspinner/style/progressspinnerstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/progressspinner/progressspinner.types.ts`
- `primeng-21.1.9:apps/showcase/doc/progressspinner/` (`import-doc.ts`, `basic-doc.ts`, `custom-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/progressspinner/` (`ProgressSpinner.vue`, `BaseProgressSpinner.vue`, `ProgressSpinner.d.ts`, `style/ProgressSpinnerStyle.js`)
- `primevue-4.5.5:apps/showcase/doc/progressspinner/` (`ImportDoc.vue`, `BasicDoc.vue`, `CustomDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/progressspinner/` (`ProgressSpinner.js`, `ProgressSpinnerBase.js`, `progressspinner.d.ts`)
- `primereact-10.9.9:components/doc/progressspinner/` (`importdoc.js`, `basicdoc.js`, `customdoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/progressspinner/index.mjs`
- `@primeuix/themes-2.0.3:types/progressspinner/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/progressspinner/index.mjs`
