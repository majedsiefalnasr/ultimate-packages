# Carousel

**Category:** Media · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Carousel shows a page of items from an array and slides between pages with a CSS `translate3d` transform. The application supplies the array (`value`) and an item template; the component handles paging (`numVisible` items shown, `numScroll` items moved per step), previous/next navigator buttons, a row of page indicator buttons, optional infinite (`circular`) looping by cloning items at both ends, timed autoplay, touch swipe, a vertical orientation, and per-breakpoint `responsiveOptions` written into a generated `<style>` element. All three frameworks ship it with the same algorithm; they differ in naming, in how the navigators are built, and in who owns the current page (`primeng-21.1.9:packages/primeng/src/carousel/carousel.ts`, `primevue-4.5.5:packages/primevue/src/carousel/Carousel.vue`, `primereact-10.9.9:components/lib/carousel/Carousel.js`).

## 2. Names & status

- Canonical name: **Carousel** in all three frameworks; listed under **Media** in each showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`) and in the PrimeVue metadata `media` group (`primevue-4.5.5:packages/metadata/src/components/index.ts`).
- Deprecated members: PrimeNG `styleClass` (since v20.0.0, use `class`) (`primeng-21.1.9:packages/primeng/src/carousel/carousel.ts`). None in PrimeVue or PrimeReact.
- RTL: the PrimeNG and PrimeVue RTL guides name Galleria and Carousel as the two components without RTL support (`primeng-21.1.9:apps/showcase/doc/guides/rtl/limitations-doc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/rtl/LimitationsDoc.vue`), even though the shared structural CSS reverses the content and item rows under `:dir(rtl)` (`@primeuix/styles-2.0.3:dist/carousel/index.mjs`).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { CarouselModule } from 'primeng/carousel'` (`primeng-21.1.9:apps/showcase/doc/carousel/import-doc.ts`), or the standalone `Carousel` class.
- Selector: `p-carousel`; standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, `hostDirectives: [Bind]`; host binds `id`, `role="region"` and `cn(cx('root'), styleClass)`.
- Source: `primeng-21.1.9:packages/primeng/src/carousel/carousel.ts`; style `primeng-21.1.9:packages/primeng/src/carousel/style/carouselstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/carousel/carousel.types.ts`.
- Exports: `Carousel`, `CarouselModule`, `CarouselStyle`, `CarouselClasses`; types `CarouselPassThroughOptions`, `CarouselPassThrough`, `CarouselResponsiveOptions`, `CarouselPageEvent`, `CarouselItemTemplateContext`, `CarouselTemplates` (`primeng-21.1.9:packages/primeng/src/carousel/public_api.ts`, `primeng-21.1.9:packages/primeng/src/types/carousel/public_api.ts`).

**PrimeVue 4.5.5**

- Import: `import Carousel from 'primevue/carousel'` (`primevue-4.5.5:apps/showcase/doc/carousel/ImportDoc.vue`).
- Tag: `<Carousel>`; root `div role="region"`.
- Source: `primevue-4.5.5:packages/primevue/src/carousel/Carousel.vue`, props in `primevue-4.5.5:packages/primevue/src/carousel/BaseCarousel.vue`, types `primevue-4.5.5:packages/primevue/src/carousel/Carousel.d.ts`, style `primevue-4.5.5:packages/primevue/src/carousel/style/CarouselStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { Carousel } from 'primereact/carousel'` (`primereact-10.9.9:components/doc/carousel/importdoc.js`).
- Component: `React.memo(React.forwardRef(...))`; typed as a class with methods `startAutoplay()`, `stopAutoplay()`, `getElement(): HTMLDivElement | null` (`primereact-10.9.9:components/lib/carousel/carousel.d.ts`).
- Source: `primereact-10.9.9:components/lib/carousel/Carousel.js`; defaults, classes and CSS in `primereact-10.9.9:components/lib/carousel/CarouselBase.js`.

## 4. Anatomy

| Part              | PrimeNG / PrimeVue PT | PrimeReact PT                          | Element / notes                                                      |
| ----------------- | --------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Root              | `root`                | `root`                                 | `div` / host, `role="region"`                                        |
| Header            | `header`              | `header`                               | Rendered only when header content exists                             |
| Content container | `contentContainer`    | `content`                              | Wraps navigators, viewport and indicators                            |
| Content           | `content`             | `container`                            | Row holding prev button, viewport, next button; `aria-live`          |
| Previous button   | `pcPrevButton`        | `previousButton`, `previousButtonIcon` | NG/Vue: Button component; React: native `button` + Ripple            |
| Viewport          | `viewport`            | `itemsContent`                         | Clips the list; height = `verticalViewPortHeight` when vertical      |
| Item list         | `itemList`            | `itemsContainer`                       | Moved with `translate3d`; 500 ms transform transition                |
| Item              | `item`                | `item`                                 | `role="group"`, `aria-roledescription`, `aria-label`, `aria-hidden`  |
| Cloned item       | `itemClone`           | `itemCloned`                           | Copies at both ends when circular                                    |
| Next button       | `pcNextButton`        | `nextButton`, `nextButtonIcon`         | As previous                                                          |
| Indicator list    | `indicatorList`       | `indicators`                           | `ul`, handles arrow keys                                             |
| Indicator         | `indicator`           | `indicator`                            | `li`                                                                 |
| Indicator button  | `indicatorButton`     | `indicatorButton`                      | `button`, roving `tabindex`, `aria-current="page"` on the active one |
| Footer            | `footer`              | `footer`                               |                                                                      |

PrimeVue adds `hooks` and PrimeReact adds `hooks`. PT sources: `primeng-21.1.9:packages/primeng/src/types/carousel/carousel.types.ts`, `primevue-4.5.5:packages/primevue/src/carousel/Carousel.d.ts`, `primereact-10.9.9:components/lib/carousel/carousel.d.ts`. PrimeVue renders an `empty` slot (default text: the locale `emptyMessage`) in place of the content container when there are no items; PrimeNG and PrimeReact have no empty state.

## 5. API highlights

**Props / inputs** (defaults identical unless noted)

| Concern                 | PrimeNG                                                                                                     | PrimeVue                                                   | PrimeReact                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Items                   | `value: any[]` (`null`)                                                                                     | `value` (`null`)                                           | `value: any[]` (`null`)                                                |
| Page                    | `page` = `0`                                                                                                | `page` = `0`, `v-model:page`                               | `page` = `0` (controlled only with `onPageChange`)                     |
| Items per page / step   | `numVisible` = `1`, `numScroll` = `1`                                                                       | same                                                       | same                                                                   |
| Breakpoints             | `responsiveOptions: CarouselResponsiveOptions[]` (`{ breakpoint, numVisible, numScroll }`)                  | same shape                                                 | `responsiveOptions: CarouselResponsiveOption[]` (same shape)           |
| Orientation             | `orientation: 'horizontal' \| 'vertical'` = `'horizontal'`; `verticalViewPortHeight` = `'300px'`            | same                                                       | same                                                                   |
| Looping / autoplay      | `circular` = `false`; `autoplayInterval` = `0` ms                                                           | same                                                       | same                                                                   |
| Show parts              | `showNavigators` = `true`, `showIndicators` = `true`                                                        | same                                                       | same                                                                   |
| Navigator customisation | `prevButtonProps` / `nextButtonProps: ButtonProps` = `{ severity: 'secondary', text: true, rounded: true }` | same (`object`)                                            | `prevIcon` / `nextIcon: IconType`                                      |
| Class hooks             | `contentClass`, `indicatorsContentClass`, `indicatorsContentStyle`, `indicatorStyleClass`, `indicatorStyle` | `containerClass`, `contentClass`, `indicatorsContentClass` | `containerClassName`, `contentClassName`, `indicatorsContentClassName` |
| Header / footer         | templates or `p-header` / `p-footer` content                                                                | slots                                                      | `header`, `footer: ReactNode`                                          |

**Events**: PrimeNG `onPage: EventEmitter<CarouselPageEvent>` (`{ page?: number }`); PrimeVue `update:page(value: number)`; PrimeReact `onPageChange(event: CarouselPageChangeEvent)` (`{ page: number }`).

**Templates / slots**: PrimeNG `item` (context `$implicit: item`), `header`, `footer`, `previousicon`, `nexticon` (`#name` or `pTemplate`; unknown `pTemplate` types become the item template). PrimeVue `item({ data, index })`, `header`, `footer`, `previcon`, `nexticon`, `empty`. PrimeReact `itemTemplate(item)`.

**Methods**: PrimeReact ref exposes `startAutoplay`, `stopAutoplay`, `getElement`. PrimeNG has public `startAutoplay()`, `stopAutoplay()`, `isPlaying()` on the class but does not document them.

**Source vs typings / docs**

- PrimeNG's `numScroll` getter returns `_numVisible` instead of `_numScroll`; the stored value is still used internally, but reading `carousel.numScroll` (and the initial `totalShiftedItems` / responsive defaults computed from it) uses `numVisible` (`primeng-21.1.9:packages/primeng/src/carousel/carousel.ts`).
- PrimeNG's `styleClass` JSDoc calls it the "viewport container" class but it is applied to the host.
- Autoplay and circular: the circular doc says looping turns on automatically in autoplay mode. Only PrimeReact does that (`circular = props.circular || !!props.autoplayInterval`). PrimeNG's `isCircular()` checks `circular` alone; PrimeVue computes `d_circular: this.circular || this.allowAutoplay` inside `data()`, where `allowAutoplay` is not yet defined, so it also depends on `circular` (`primeng-21.1.9:apps/showcase/doc/carousel/circular-doc.ts`, `primevue-4.5.5:packages/primevue/src/carousel/Carousel.vue`, `primereact-10.9.9:components/lib/carousel/Carousel.js`).
- Circular requires `value.length >= numVisible` in PrimeNG and PrimeReact but `> numVisible` in PrimeVue.
- Any manual navigation (navigator, indicator, or `page` change) stops autoplay permanently in all three.

## 6. Usage guidance

- **Basic:** pass `value`, an item template, `numVisible` and `numScroll` (`primeng-21.1.9:apps/showcase/doc/carousel/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/carousel/BasicDoc.vue`, `primereact-10.9.9:components/doc/carousel/basicdoc.js`).
- **Circular / autoplay:** set `circular` and `autoplayInterval` (ms) together; given the behaviour above, set `circular` explicitly rather than relying on autoplay to enable it (`primeng-21.1.9:apps/showcase/doc/carousel/circular-doc.ts`, `primevue-4.5.5:apps/showcase/doc/carousel/CircularDoc.vue`, `primereact-10.9.9:components/doc/carousel/circulardoc.js`).
- **Num scroll:** PrimeReact has a separate section showing `numScroll={1}` with `numVisible={3}` (`primereact-10.9.9:components/doc/carousel/numscrolldoc.js`).
- **Responsive:** `responsiveOptions` entries are max-width breakpoints; the top-level `numVisible` / `numScroll` apply when no breakpoint matches. The component adds a window resize listener only when `responsiveOptions` is set, and writes per-breakpoint `flex` rules into a `<style>` element that carries the configured CSP nonce (`primeng-21.1.9:apps/showcase/doc/carousel/responsive-doc.ts`, `primevue-4.5.5:apps/showcase/doc/carousel/ResponsiveDoc.vue`, `primereact-10.9.9:components/doc/carousel/responsivedoc.js`).
- **Vertical:** `orientation="vertical"` plus a `verticalViewPortHeight` (`primeng-21.1.9:apps/showcase/doc/carousel/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/carousel/VerticalDoc.vue`, `primereact-10.9.9:components/doc/carousel/verticaldoc.js`).
- Touch: a swipe longer than 20 px moves one page.

## 7. Accessibility

- Root has `role="region"`; extra attributes such as `aria-label` / `aria-roledescription` pass through to it. The content element gets `aria-live="polite"` while autoplay is active, otherwise `off`.
- Each slide is `role="group"` with `aria-label` from locale `aria.slideNumber` (`{slideNumber}` placeholder) and `aria-roledescription` from `aria.slide`; slides outside the visible page get `aria-hidden`.
- Navigators use locale `aria.prevPageLabel` / `aria.nextPageLabel`; indicator buttons use `aria.pageLabel` (`{page}`) and `aria-current="page"` on the active one, with a roving `tabindex` (active = `0`, others `-1`).
- Keyboard (docs): navigators — Tab, Enter, Space; indicators — Tab focuses the active indicator, Enter / Space activate, Right / Left arrow move focus, Home / End go to first / last (`primeng-21.1.9:apps/showcase/doc/carousel/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/carousel/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/carousel/accessibilitydoc.js`).
- Source vs docs:
  - PrimeNG's indicator keydown handler only handles ArrowRight / ArrowLeft; `onHomeKey`, `onEndKey` and `onTabKey` exist but are never called, so Home / End do not work there. PrimeVue and PrimeReact handle Home, End and Tab and suppress ArrowUp / ArrowDown (PrimeVue also PageUp / PageDown).
  - PrimeNG and PrimeReact docs say the previous button uses `aria.firstPageLabel`; the code uses `aria.prevPageLabel` (the PrimeVue doc is correct).
  - PrimeNG renders the out-of-range navigator with the `p-disabled` class only, not the `disabled` attribute, so it stays focusable; PrimeVue and PrimeReact set `disabled`.

## 8. Theming

- Style classes (PrimeNG / PrimeVue): `p-carousel p-component` + `p-carousel-horizontal` / `p-carousel-vertical`, `p-carousel-header`, `p-carousel-content-container`, `p-carousel-content`, `p-carousel-prev-button` / `p-carousel-next-button` (+ `p-disabled`), `p-carousel-viewport`, `p-carousel-item-list`, `p-carousel-item` (+ `p-carousel-item-clone`, `-active`, `-start`, `-end`), `p-carousel-indicator-list`, `p-carousel-indicator` (+ `p-carousel-indicator-active`), `p-carousel-indicator-button`, `p-carousel-footer`; PrimeNG toggles `p-items-hidden` on the list between transitions (`primeng-21.1.9:packages/primeng/src/carousel/style/carouselstyle.ts`, `primevue-4.5.5:packages/primevue/src/carousel/style/CarouselStyle.js`, catalog `docs/prime-reference/catalog/primevue.json` `carouselstyle`).
- PrimeReact uses the older names: `p-carousel-container`, `p-carousel-items-content`, `p-carousel-items-container`, `p-carousel-prev p-link` / `p-carousel-next p-link`, `p-carousel-prev-icon` / `p-carousel-next-icon`, `p-carousel-indicators p-reset`, indicator active `p-highlight`, cloned items `p-carousel-item-cloned`; CSS in `CarouselBase.js` under `@layer primereact` (`primereact-10.9.9:components/lib/carousel/CarouselBase.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/carousel/index.mjs` — column flex root, row content with `:dir(rtl)` reversal, hidden-overflow viewport, centred wrapping indicator list, pill indicator buttons with focus ring and active background.
- Design tokens: `CarouselDesignTokens` sections `root` (`transitionDuration`), `content` (`gap`), `indicatorList` (`padding`, `gap`), `indicator` (`width`, `height`, `borderRadius`, `focusRing{…}`, `background`, `hoverBackground`, `activeBackground`) (`@primeuix/themes-2.0.3:types/carousel/index.d.ts`); 15 tokens (`@primeuix/themes-2.0.3:tokens/index.mjs`); Aura: indicator `2rem` × `0.5rem`, active background `{primary.color}`, light/dark surface backgrounds (`@primeuix/themes-2.0.3:dist/aura/carousel/index.mjs`). PrimeReact: tokens N/A.

## 9. Relationships

- Embeds the **Button** component for navigators in PrimeNG and PrimeVue (`prevButtonProps` / `nextButtonProps` are Button props; PT keys `pcPrevButton` / `pcNextButton` take Button PT); PrimeReact uses native buttons with **Ripple**.
- Galleria covers the image-viewer case (thumbnails, fullscreen, captions) and shares the RTL limitation.
- Item templates commonly hold other components (the showcase uses Tag and Button inside product cards).

## 10. Dependencies

- PrimeNG: `primeng/button`, `primeng/icons` (ChevronLeft/Right/Up/Down), `primeng/api` (`Header`, `Footer`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/utils` (`uuid`, DOM helpers), `@primeuix/styles/carousel`.
- PrimeVue: `primevue/button`, `@primevue/icons/chevron*`, `@primeuix/utils/dom`, `@primeuix/utils/object` (`localeComparator`, `sort`), `@primevue/core/basecomponent`, `@primeuix/styles/carousel`; also registers `primevue/ripple`.
- PrimeReact: `../api/Api` (`ariaLabel`, `localeOption`), `../hooks/Hooks` (`useResizeListener`, `usePrevious`, …), `../icons/chevron*`, `../ripple/Ripple`, `../utils/Utils` (`DomHandler.createInlineStyle`, `UniqueComponentId`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                    | PrimeNG                                               | PrimeVue                      | PrimeReact                                                                      |
| ------------------------- | ----------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| Page binding              | `page` input + `onPage` output                        | `v-model:page`                | Uncontrolled, or controlled via `page` + `onPageChange` (not while autoplaying) |
| Navigator element         | `p-button` (Button)                                   | `Button`                      | native `button` + Ripple                                                        |
| Navigator customisation   | `prevButtonProps` / `nextButtonProps`, icon templates | same, icon slots              | `prevIcon` / `nextIcon`                                                         |
| Autoplay implies circular | No                                                    | No (see §5)                   | Yes                                                                             |
| Indicator Home / End      | Not wired                                             | Yes                           | Yes                                                                             |
| Disabled navigator        | Class only                                            | `disabled` attribute          | `disabled` attribute                                                            |
| Empty state               | None                                                  | `empty` slot / locale message | None                                                                            |
| Imperative API            | Undocumented public methods                           | None                          | `startAutoplay`, `stopAutoplay`, `getElement`                                   |
| Class naming              | `p-carousel-item-list`, `-indicator-list`             | same                          | `p-carousel-items-container`, `-indicators`                                     |
| Design tokens             | `@primeuix/themes`                                    | `@primeuix/themes`            | N/A (`@layer primereact` CSS)                                                   |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/carousel/carousel.ts`
- `primeng-21.1.9:packages/primeng/src/carousel/style/carouselstyle.ts`
- `primeng-21.1.9:packages/primeng/src/carousel/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/carousel/carousel.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/carousel/public_api.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/circular-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/responsive-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/vertical-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/carousel/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/rtl/limitations-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:packages/primevue/src/carousel/Carousel.vue`
- `primevue-4.5.5:packages/primevue/src/carousel/BaseCarousel.vue`
- `primevue-4.5.5:packages/primevue/src/carousel/Carousel.d.ts`
- `primevue-4.5.5:packages/primevue/src/carousel/style/CarouselStyle.js`
- `primevue-4.5.5:apps/showcase/doc/carousel/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/carousel/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/carousel/CircularDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/carousel/ResponsiveDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/carousel/VerticalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/carousel/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/rtl/LimitationsDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/carousel/Carousel.js`
- `primereact-10.9.9:components/lib/carousel/CarouselBase.js`
- `primereact-10.9.9:components/lib/carousel/carousel.d.ts`
- `primereact-10.9.9:components/doc/carousel/importdoc.js`
- `primereact-10.9.9:components/doc/carousel/basicdoc.js`
- `primereact-10.9.9:components/doc/carousel/circulardoc.js`
- `primereact-10.9.9:components/doc/carousel/numscrolldoc.js`
- `primereact-10.9.9:components/doc/carousel/responsivedoc.js`
- `primereact-10.9.9:components/doc/carousel/verticaldoc.js`
- `primereact-10.9.9:components/doc/carousel/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/carousel/index.mjs`
- `@primeuix/themes-2.0.3:types/carousel/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/carousel/index.mjs`
