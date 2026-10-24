# Badge

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Badge is a small inline status indicator that shows a number, a short text or an empty dot, coloured by severity and offered in several sizes. All three frameworks ship a standalone Badge. Attaching a badge to the corner of another element is handled differently: PrimeNG ships both an `OverlayBadge` component and a `pBadge` attribute directive, PrimeVue ships an `OverlayBadge` component plus the deprecated `v-badge` directive, and PrimeReact has neither and relies on a `p-overlay-badge` wrapper class (`primeng-21.1.9:packages/primeng/src/badge/badge.ts`, `primeng-21.1.9:packages/primeng/src/overlaybadge/overlaybadge.ts`, `primevue-4.5.5:packages/primevue/src/overlaybadge/OverlayBadge.vue`, `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.js`, `primereact-10.9.9:components/doc/badge/positiondoc.js`).

## 2. Names & status

- Canonical name: **Badge**. This record also covers **OverlayBadge** (PrimeNG, PrimeVue), the PrimeNG **`pBadge`** directive (`BadgeDirective`) and the PrimeVue **`v-badge`** directive (`primevue/badgedirective`).
- PrimeVue `v-badge` is deprecated: its `mounted` hook logs `Deprecated since v4. Use OverlayBadge component instead.` The `.d.ts` does not carry a `@deprecated` tag and the showcase no longer documents the directive (`primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.js`, `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.d.ts`).
- PrimeNG `pBadge` is not deprecated, but several of its members are: `size` (setter logs `size property is deprecated and will removed in v18, use badgeSize instead.`) and `ptBadgeDirective` (`@deprecated use pBadgePT instead`). `Badge.size`/`OverlayBadge.size` are also superseded by `badgeSize`, and `Badge.styleClass` is `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/badge/badge.ts`, `primeng-21.1.9:packages/primeng/src/overlaybadge/overlaybadge.ts`).
- Showcase menus list only **Badge** under Misc in all three; OverlayBadge has no menu entry or doc folder of its own and is documented on the Badge page (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                | PrimeVue                                                                                                                                                 | PrimeReact                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import         | `import { BadgeModule } from 'primeng/badge'`, `import { OverlayBadgeModule } from 'primeng/overlaybadge'`             | `import Badge from 'primevue/badge'`, `import OverlayBadge from 'primevue/overlaybadge'`                                                                 | `import { Badge } from 'primereact/badge'`                                                                                                                        |
| Selector / tag | `<p-badge>`; `[pBadge]` directive; `<p-overlay-badge>` (also `p-overlayBadge`, `p-overlaybadge`)                       | `<Badge>`, `<OverlayBadge>`; `v-badge` (`primevue/badgedirective`, deprecated)                                                                           | `<Badge />`                                                                                                                                                       |
| Source         | `packages/primeng/src/badge/badge.ts` (`Badge`, `BadgeDirective`), `packages/primeng/src/overlaybadge/overlaybadge.ts` | `packages/primevue/src/badge/Badge.vue`, `packages/primevue/src/overlaybadge/OverlayBadge.vue`, `packages/primevue/src/badgedirective/BadgeDirective.js` | `components/lib/badge/Badge.js`                                                                                                                                   |
| Overlay form   | `OverlayBadge` component or `pBadge` directive                                                                         | `OverlayBadge` component (directive deprecated)                                                                                                          | N/A — no OverlayBadge or badge directive in primereact-10.9.9 (no `overlaybadge`/`badgedirective` folder under `components/lib`); use the `p-overlay-badge` class |

Sources: `primeng-21.1.9:apps/showcase/doc/badge/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/ImportDoc.vue`, `primereact-10.9.9:components/doc/badge/importdoc.js`.

## 4. Anatomy

| Part            | Element                          | PrimeNG PT key                | PrimeVue PT key                    | PrimeReact PT key | Class            |
| --------------- | -------------------------------- | ----------------------------- | ---------------------------------- | ----------------- | ---------------- |
| Badge root      | host / `span`                    | `host`, `root`                | `root`                             | `root`            | `p-badge`        |
| Overlay root    | `div` wrapping projected content | `host`, `root` (OverlayBadge) | `root`                             | —                 | `p-overlaybadge` |
| Overlay badge   | embedded Badge                   | `pcBadge`                     | `pcBadge`                          | —                 | `p-badge`        |
| Directive badge | `span` appended to host          | `pBadgePT` (directive input)  | `root` (global `directives.badge`) | —                 | `p-badge`        |

- The directives add `p-overlay-badge` to the host element and append a generated badge `span`. PrimeNG targets the first child instead when the host is a custom element whose tag contains `-`, and gives the span an id of `pn_id_…_badge` (`primeng-21.1.9:packages/primeng/src/badge/badge.ts`, `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/badge/badge.types.ts`, `primeng-21.1.9:packages/primeng/src/types/overlaybadge/overlaybadge.types.ts`, `primevue-4.5.5:packages/primevue/src/badge/Badge.d.ts`, `primevue-4.5.5:packages/primevue/src/overlaybadge/OverlayBadge.d.ts`, `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.d.ts`, `primereact-10.9.9:components/lib/badge/badge.d.ts`.

## 5. API highlights

| Prop     | PrimeNG (`Badge`, `OverlayBadge`, `pBadge`)                              | PrimeVue (`Badge`, `OverlayBadge`)         | PrimeReact (`Badge`)                                                        |
| -------- | ------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------- |
| value    | `value: string \| number \| null`                                        | `value: string \| number` (default `null`) | `value: any` (default `null`)                                               |
| severity | `'secondary' \| 'info' \| 'success' \| 'warn' \| 'danger' \| 'contrast'` | same set, `HintedString`                   | `'success' \| 'info' \| 'warning' \| 'danger' \| 'secondary' \| 'contrast'` |
| size     | `badgeSize: 'small' \| 'large' \| 'xlarge'` (`size` deprecated)          | `size: 'small' \| 'large' \| 'xlarge'`     | `size: 'normal' \| 'large' \| 'xlarge'`                                     |
| disabled | `badgeDisabled` (default `false`; hides the badge)                       | —                                          | —                                                                           |

- An empty value renders a dot (`p-badge-dot`); a one-character value renders a circle (`p-badge-circle`, PrimeReact `p-badge-no-gutter`).
- PrimeNG `pBadge` extra inputs: `badgeStyle`, `badgeStyleClass`, `pBadgePT`, `pBadgeUnstyled`; `badgeDisabled` is the alias of the internal `disabled` input (`primeng-21.1.9:packages/primeng/src/badge/badge.ts`).
- PrimeVue Badge renders its `default` slot and falls back to `value`; OverlayBadge extends Badge's props, projects the `default` slot and passes props to the inner Badge (`primevue-4.5.5:packages/primevue/src/badge/Badge.vue`, `primevue-4.5.5:packages/primevue/src/overlaybadge/BaseOverlayBadge.vue`).
- PrimeVue `v-badge` reads its value from the binding (a string or `{ value }`) and severity from modifiers `info`, `success`, `warn`, `danger` (`primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.d.ts`).
- PrimeReact renders `props.value` only (children are ignored) and exposes `getElement()` (`primereact-10.9.9:components/lib/badge/Badge.js`).
- Full API: catalog modules `badge`, `overlaybadge` (PrimeNG, PrimeVue) and `badgedirective` (PrimeVue) in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — set `value` (PrimeVue also accepts slot content) (`primeng-21.1.9:apps/showcase/doc/badge/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/BasicDoc.vue`, `primereact-10.9.9:components/doc/badge/basicdoc.js`).
- **Severity** — choose a colour with `severity` (`primeng-21.1.9:apps/showcase/doc/badge/severity-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/SeverityDoc.vue`, `primereact-10.9.9:components/doc/badge/severitydoc.js`).
- **Size** — use `badgeSize` (PrimeNG; component mode only per the doc) or `size` (`primeng-21.1.9:apps/showcase/doc/badge/size-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/SizeDoc.vue`, `primereact-10.9.9:components/doc/badge/sizedoc.js`).
- **Overlay** — wrap an icon or avatar in `OverlayBadge` (PrimeNG, PrimeVue); PrimeReact instead wraps content in an element with class `p-overlay-badge` (`primeng-21.1.9:apps/showcase/doc/badge/overlay-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/OverlayDoc.vue`, `primereact-10.9.9:components/doc/badge/positiondoc.js`).
- **Directive / Position** (PrimeNG doc files not linked from the Badge page) — `pBadge` on any element, and manual positioning with the `p-overlay-badge` class (`primeng-21.1.9:apps/showcase/doc/badge/directive-doc.ts`, `primeng-21.1.9:apps/showcase/doc/badge/position-doc.ts`, `primeng-21.1.9:apps/showcase/pages/badge/index.ts`).
- **Button** — Buttons have built-in `badge` and badge-class props (`primeng-21.1.9:apps/showcase/doc/badge/button-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/ButtonDoc.vue`, `primereact-10.9.9:components/doc/badge/buttondoc.js`).

No services or providers are required.

## 7. Accessibility

- No role is set by default; extra attributes go to the root, so dynamic counters should add `aria-live`. Interactive badges need a `tabindex` and author-supplied key handling; there is no built-in keyboard support (`primeng-21.1.9:apps/showcase/doc/badge/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/badge/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/badge/accessibilitydoc.js`).
- A badge sitting on an icon-only element conveys its number visually only; authors must reflect it in the host's accessible name.

## 8. Theming

- Style classes: `p-badge` (with `p-component`), `p-badge-circle`, `p-badge-dot`, `p-badge-sm`, `p-badge-lg`, `p-badge-xl`, `p-badge-{info,success,warn,danger,secondary,contrast}`; overlay root `p-overlaybadge`; host marker `p-overlay-badge` (`primeng-21.1.9:packages/primeng/src/badge/style/badgestyle.ts`, `primeng-21.1.9:packages/primeng/src/overlaybadge/style/overlaybadgestyle.ts`, `primevue-4.5.5:packages/primevue/src/badge/style/BadgeStyle.js`, `primevue-4.5.5:packages/primevue/src/overlaybadge/style/OverlayBadgeStyle.js`, `primevue-4.5.5:packages/primevue/src/badgedirective/style/BadgeDirectiveStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/badge/index.mjs` and `@primeuix/styles-2.0.3:dist/overlaybadge/index.mjs`. PrimeNG's badge style appends its own `.p-overlay-badge` rules for the directive, and PrimeNG's OverlayBadge style carries its own CSS (using `right: 0`) instead of importing the `@primeuix` overlaybadge module, which uses logical `inset-inline-end` and an RTL rule.
- Design tokens: badge (`@primeuix/themes-2.0.3:types/badge/index.d.ts`) — `root` (`borderRadius`, `padding`, `fontSize`, `fontWeight`, `minWidth`, `height`), `dot.size`, `sm`/`lg`/`xl` (`fontSize`, `minWidth`, `height`), and `background`/`color` for `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `contrast`; overlaybadge (`@primeuix/themes-2.0.3:types/overlaybadge/index.d.ts`) — `root.outline` (`width`, `color`). Aura values: `@primeuix/themes-2.0.3:dist/aura/badge/index.mjs`, `@primeuix/themes-2.0.3:dist/aura/overlaybadge/index.mjs`.
- PrimeReact: classes and CSS (including `.p-overlay-badge` and `p-badge-no-gutter`) in `BadgeBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/badge/BadgeBase.js`, `primereact-10.9.9:components/doc/badge/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/badge/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/badge/pt/index.vue`, `primereact-10.9.9:components/doc/badge/pt/wireframe.js`. PrimeVue global PT keys: `badge`, `overlaybadge`, and `directives.badge` (`primevue-4.5.5:packages/primevue/src/config/Config.d.ts`).

## 9. Relationships

- OverlayBadge embeds Badge (`pcBadge`).
- Button embeds a Badge via its `badge` prop in all three (PrimeNG `badge`, `badgeClass`, `badgeSeverity`; PrimeVue `badge`, `badgeClass`, `badgeSeverity`, PT `pcBadge`) (`primeng-21.1.9:packages/primeng/src/button/button.ts`, `primevue-4.5.5:packages/primevue/src/button/Button.vue`, `primereact-10.9.9:components/lib/button/button.d.ts`).
- Commonly attached to Avatar and icons; visually related to Tag (larger, text-oriented label) and Chip.

## 10. Dependencies

- PrimeNG: `@angular/core`, `@angular/common`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `@primeuix/utils`, `@primeuix/styles/badge`; OverlayBadge imports `primeng/badge` (`primeng-21.1.9:packages/primeng/src/badge/badge.ts`, `primeng-21.1.9:packages/primeng/src/overlaybadge/overlaybadge.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/basedirective` (directive), `@primeuix/utils`, `@primeuix/styles/badge`, `@primeuix/styles/overlaybadge`; OverlayBadge imports `primevue/badge` (`primevue-4.5.5:packages/primevue/src/badge/BaseBadge.vue`, `primevue-4.5.5:packages/primevue/src/badgedirective/BaseBadgeDirective.js`, `primevue-4.5.5:packages/primevue/src/overlaybadge/OverlayBadge.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/badge/Badge.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect            | PrimeNG              | PrimeVue                        | PrimeReact                     |
| ----------------- | -------------------- | ------------------------------- | ------------------------------ |
| Overlay component | `OverlayBadge`       | `OverlayBadge`                  | none (`p-overlay-badge` class) |
| Directive         | `pBadge` (current)   | `v-badge` (deprecated since v4) | none                           |
| Warning severity  | `warn`               | `warn`                          | `warning`                      |
| Small size        | `small`              | `small`                         | not offered (`normal` instead) |
| Hide switch       | `badgeDisabled`      | —                               | —                              |
| Content           | `value` only         | `default` slot or `value`       | `value` only                   |
| Circle class      | `p-badge-circle`     | `p-badge-circle`                | `p-badge-no-gutter`            |
| Overlay CSS       | own `right: 0` rules | `@primeuix` logical-inset rules | own CSS                        |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/badge/badge.ts`
- `primeng-21.1.9:packages/primeng/src/badge/style/badgestyle.ts`
- `primeng-21.1.9:packages/primeng/src/overlaybadge/overlaybadge.ts`
- `primeng-21.1.9:packages/primeng/src/overlaybadge/style/overlaybadgestyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/badge/badge.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/overlaybadge/overlaybadge.types.ts`
- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:apps/showcase/doc/badge/` (`import-doc.ts`, `basic-doc.ts`, `severity-doc.ts`, `size-doc.ts`, `overlay-doc.ts`, `directive-doc.ts`, `position-doc.ts`, `button-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/pages/badge/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/badge/` (`Badge.vue`, `BaseBadge.vue`, `Badge.d.ts`, `style/BadgeStyle.js`)
- `primevue-4.5.5:packages/primevue/src/overlaybadge/` (`OverlayBadge.vue`, `BaseOverlayBadge.vue`, `OverlayBadge.d.ts`, `style/OverlayBadgeStyle.js`)
- `primevue-4.5.5:packages/primevue/src/badgedirective/` (`BadgeDirective.js`, `BaseBadgeDirective.js`, `BadgeDirective.d.ts`, `style/BadgeDirectiveStyle.js`)
- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:apps/showcase/doc/badge/` (`ImportDoc.vue`, `BasicDoc.vue`, `SeverityDoc.vue`, `SizeDoc.vue`, `OverlayDoc.vue`, `ButtonDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/badge/` (`Badge.js`, `BadgeBase.js`, `badge.d.ts`)
- `primereact-10.9.9:components/lib/button/button.d.ts`
- `primereact-10.9.9:components/doc/badge/` (`importdoc.js`, `basicdoc.js`, `severitydoc.js`, `sizedoc.js`, `positiondoc.js`, `buttondoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/badge/index.mjs`
- `@primeuix/styles-2.0.3:dist/overlaybadge/index.mjs`
- `@primeuix/themes-2.0.3:types/badge/index.d.ts`
- `@primeuix/themes-2.0.3:types/overlaybadge/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/badge/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/overlaybadge/index.mjs`
