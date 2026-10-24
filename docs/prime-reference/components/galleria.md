# Galleria

**Category:** Media · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Galleria is an image-gallery viewer. It takes an array (`value`) plus an `item` template for the large view and a `thumbnail` template for the strip, and shows one item at a time with optional extras: a thumbnail strip (bottom, top, left or right) that pages through `numVisible` thumbnails, previous/next item buttons, a row of indicator dots (below the image or inset on it), a per-item caption, header/footer areas, timed autoplay, and a modal full-screen mode with a close button. The three frameworks share the same behavioural model and the same structural CSS class vocabulary for PrimeNG and PrimeVue; PrimeReact keeps older class names and carries its own CSS (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`, `primereact-10.9.9:components/lib/galleria/Galleria.js`).

The component is split internally into a shell (mask, portal, focus trap in full-screen mode), a content block (header, items, thumbnails, footer, close button) and two sub-parts: the item area with navigators/indicators/caption, and the thumbnail strip (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`).

The study found one real functional defect and several accessibility gaps: PrimeReact passes the wrong prop name to its item sub-component, so indicator state and keyboard handling are broken; PrimeNG's item navigators have no `disabled` attribute and its autoplay never stops at the end of a non-circular list; the showcase accessibility text is inverted against the code for `aria-live` (details in sections 7 and 11).

## 2. Names & status

- Canonical name: **Galleria** in all three frameworks, listed under **Media** (after Carousel, before Image) in each showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`) and in the PrimeVue metadata `media` group (`primevue-4.5.5:packages/metadata/src/components/index.ts`).
- Catalog entries: one `galleria` module per framework; PrimeVue additionally has a `galleriastyle` module, and PrimeReact lists the event `GalleriaItemChangeEvent` plus the interfaces `GalleriaPassThroughOptions`, `GalleriaPassThroughMethodOptions`, `GalleriaResponsiveOptions`, `GalleriaState` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`).
- Deprecated members: PrimeNG `showTransitionOptions` and `hideTransitionOptions` (both marked deprecated since v21.0.0, replaced by `motionOptions`) (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`). None found in PrimeVue or PrimeReact typings (`primevue-4.5.5:packages/primevue/src/galleria/Galleria.d.ts`, `primereact-10.9.9:components/lib/galleria/galleria.d.ts`).
- RTL: the PrimeNG and PrimeVue RTL guides name Galleria and Carousel as the two components without RTL support, to be replaced by a newer implementation (`primeng-21.1.9:apps/showcase/doc/guides/rtl/limitations-doc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/rtl/LimitationsDoc.vue`). The shared structural CSS nevertheless contains `:dir(rtl)` rules that swap the item navigators, rotate the arrows and reverse the thumbnail row (`@primeuix/styles-2.0.3:dist/galleria/index.mjs`). The PrimeReact RTL guide was not checked.
- Source-folder quirk: PrimeNG's indicator docs contain two near-identical files, `clickevent-doc.ts` and `clickeventdoc.ts`, with different selectors (`click-event-doc` vs `clickevent-doc`) (`primeng-21.1.9:apps/showcase/doc/galleria/indicator/clickevent-doc.ts`, `primeng-21.1.9:apps/showcase/doc/galleria/indicator/clickeventdoc.ts`).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `GalleriaModule` from `primeng/galleria` (`primeng-21.1.9:apps/showcase/doc/galleria/import-doc.ts`). The component is declared with `standalone: false`, so the module is the only way to consume it; it imports Ripple, FocusTrap, the Bind and Motion modules and the times/chevron icons (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`).
- Selector: `p-galleria`; `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, `hostDirectives: [Bind]`. Internal helper components use attribute selectors `div[pGalleriaContent]`, `div[pGalleriaItemSlot]`, `div[pGalleriaItem]`, `div[pGalleriaThumbnails]`; the content host carries `role="region"` and the root class.
- Source: `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`; style `primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/galleria/galleria.types.ts`; a spec exists at `primeng-21.1.9:packages/primeng/src/galleria/galleria.spec.ts`.
- Exports: `Galleria`, `GalleriaContent`, `GalleriaItemSlot`, `GalleriaItem`, `GalleriaThumbnails`, `GalleriaModule`, `GalleriaStyle`, `GalleriaClasses`, plus the types `GalleriaPassThroughOptions`, `GalleriaPassThrough`, `GalleriaResponsiveOptions`, `GalleriaIndicatorTemplateContext`, `GalleriaItemTemplateContext`, `GalleriaThumbnailTemplateContext`, `GalleriaCaptionTemplateContext`, `GalleriaTemplates` (`primeng-21.1.9:packages/primeng/src/galleria/public_api.ts`, `primeng-21.1.9:packages/primeng/src/types/galleria/public_api.ts`).

**PrimeVue 4.5.5**

- Import: `import Galleria from 'primevue/galleria'` (`primevue-4.5.5:apps/showcase/doc/galleria/ImportDoc.vue`).
- Tag: `<Galleria>`; `inheritAttrs` is off, the extra attributes land on the inner content root (`primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`).
- Source: shell `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`, props `primevue-4.5.5:packages/primevue/src/galleria/BaseGalleria.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`, types `primevue-4.5.5:packages/primevue/src/galleria/Galleria.d.ts`, style `primevue-4.5.5:packages/primevue/src/galleria/style/GalleriaStyle.js`.
- Emits: `update:activeIndex` (number) and `update:visible` (boolean), which support `v-model:activeIndex` and `v-model:visible`.

**PrimeReact 10.9.9**

- Import: `import { Galleria } from 'primereact/galleria'` (`primereact-10.9.9:components/doc/galleria/importdoc.js`).
- Component: `React.memo(React.forwardRef(...))`. The ref exposes `props`, `show`, `hide`, `isAutoPlayActive`, `startSlideShow`, `stopSlideShow`, `getElement` and `getPreviewContent`; the typing class declares all of these except `props` and `getPreviewContent` (`primereact-10.9.9:components/lib/galleria/Galleria.js`, `primereact-10.9.9:components/lib/galleria/galleria.d.ts`).
- Source: `primereact-10.9.9:components/lib/galleria/Galleria.js`; defaults, class names and the CSS block in `primereact-10.9.9:components/lib/galleria/GalleriaBase.js`; sub-parts `primereact-10.9.9:components/lib/galleria/GalleriaItem.js` and `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`.

## 4. Anatomy

Class names for PrimeNG and PrimeVue are identical (`primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`, `primevue-4.5.5:packages/primevue/src/galleria/style/GalleriaStyle.js`); PrimeReact uses its own set (`primereact-10.9.9:components/lib/galleria/GalleriaBase.js`).

| Part                 | PrimeNG / PrimeVue PT (class)                                            | PrimeReact PT (class)                                                                 | Notes                                                                                          |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Host                 | `host` (PrimeNG only)                                                    | –                                                                                     | PrimeNG host directive; PrimeVue and PrimeReact have no host key                               |
| Mask (full-screen)   | `mask` (`p-galleria-mask p-overlay-mask`)                                | `mask` (`p-galleria-mask`, `p-galleria-visible`)                                      | `role="dialog"`, `aria-modal="true"`                                                           |
| Root                 | `root` (`p-galleria p-component` + state modifiers)                      | `root` (`p-galleria p-component` + modifiers)                                         | `role="region"`                                                                                |
| Close button / icon  | `closeButton`, `closeIcon`                                               | `closeButton` (`p-galleria-close p-link`), `closeIcon`                                | full-screen only                                                                               |
| Header / footer      | `header`, `footer`                                                       | `header`, `footer`                                                                    | template/slot/prop content                                                                     |
| Content              | `content`                                                                | `content`                                                                             | carries `aria-live`                                                                            |
| Item wrappers        | `itemsContainer`, `items`                                                | `itemWrapper`, `itemContainer`                                                        | different names for the same layers                                                            |
| Item navigators      | `prevButton`, `prevIcon`, `nextButton`, `nextIcon`                       | `previousItemButton`, `previousItemIcon`, `nextItemButton`, `nextItemIcon`            | shown with `showItemNavigators`                                                                |
| Item                 | `item`                                                                   | `item`                                                                                | `role="group"`                                                                                 |
| Caption              | `caption`                                                                | `caption`                                                                             | PrimeReact renders it only when `caption` is passed                                            |
| Indicators           | `indicatorList`, `indicator`, `indicatorButton`                          | `indicators`, `indicator`                                                             | PrimeReact has no `indicatorButton` PT key                                                     |
| Thumbnail wrappers   | `thumbnails`, `thumbnailContent`, `thumbnailsViewport`, `thumbnailItems` | `thumbnailWrapper`, `thumbnailContainer`, `thumbnailItemsContainer`, `thumbnailItems` | PrimeReact adds one more wrapper level                                                         |
| Thumbnail navigators | `thumbnailPrevButton/Icon`, `thumbnailNextButton/Icon`                   | `previousThumbnailButton/Icon`, `nextThumbnailButton/Icon`                            | class `p-galleria-thumbnail-prev-button` vs PrimeReact `p-galleria-thumbnail-prev`             |
| Thumbnail item       | `thumbnailItem`, `thumbnail`                                             | `thumbnailItem`, `thumbnailItemContent`                                               | state classes `-current`, `-active`, `-start`, `-end`                                          |
| Transition           | `motion` (PrimeNG)                                                       | `transition`                                                                          | PrimeVue also has `transition`; PrimeNG code additionally reads an undeclared `maskMotion` key |
| Hooks                | –                                                                        | `hooks`                                                                               | PrimeVue also declares `hooks` in `Galleria.d.ts`                                              |

Sources for the key lists: `primeng-21.1.9:packages/primeng/src/types/galleria/galleria.types.ts`, `primevue-4.5.5:packages/primevue/src/galleria/Galleria.d.ts`, `primereact-10.9.9:components/lib/galleria/galleria.d.ts`.

Root-level state classes: `p-galleria-fullscreen`, inset indicators (`p-galleria-inset-indicators` in PrimeNG/PrimeVue, `p-galleria-indicator-onitem` in PrimeReact), hover navigators (`p-galleria-hover-navigators` vs `p-galleria-item-nav-onhover`), `p-galleria-thumbnails-<position>` and `p-galleria-indicators-<position>`. PrimeNG applies the hover-navigators class only when not in full-screen mode (`primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`).

## 5. API highlights

Common props (same name and default in all three unless noted): `value` (array; nothing renders when empty), `activeIndex` (0), `fullScreen` (false), `numVisible` (3), `responsiveOptions` (list of `{ breakpoint: string; numVisible: number }`), `showItemNavigators` (false), `showThumbnailNavigators` (true), `showItemNavigatorsOnHover` (false), `changeItemOnIndicatorHover` (false), `circular` (false), `autoPlay` (false), `transitionInterval` (4000 ms), `showThumbnails` (true), `thumbnailsPosition` (`'bottom'`; also top, left, right), `verticalThumbnailViewPortHeight` (`'300px'`), `showIndicators` (false), `showIndicatorsOnItem` (false), `indicatorsPosition` (`'bottom'`), `baseZIndex` (0), `id` (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/BaseGalleria.vue`, `primereact-10.9.9:components/lib/galleria/GalleriaBase.js`).

| Capability             | PrimeNG                                                                                            | PrimeVue                                                                                            | PrimeReact                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Full-screen visibility | `visible` input + `visibleChange` output                                                           | `visible` prop + `update:visible`                                                                   | no prop; ref `show()` / `hide()`, callbacks `onShow` / `onHide`                             |
| Active index binding   | `activeIndex` + `activeIndexChange`                                                                | `activeIndex` + `update:activeIndex`                                                                | `activeIndex`; controlled only when `onItemChange({ index })` is given                      |
| Item template          | `#item` (`$implicit` = item)                                                                       | slot `item` (`{ item }`)                                                                            | prop `item(item)`                                                                           |
| Thumbnail template     | `#thumbnail`                                                                                       | slot `thumbnail`                                                                                    | prop `thumbnail(item)`                                                                      |
| Caption                | `#caption`                                                                                         | slot `caption`                                                                                      | prop `caption(item)`                                                                        |
| Indicator              | `#indicator` (context: index)                                                                      | slot `indicator` (`{ index, activeIndex, tabindex }`)                                               | prop `indicator(index)`                                                                     |
| Header / footer        | `#header`, `#footer`                                                                               | slots `header`, `footer`                                                                            | props `header`, `footer` (nodes)                                                            |
| Icons                  | `#closeicon`, `#itempreviousicon`, `#itemnexticon`, `#previousthumbnailicon`, `#nextthumbnailicon` | slots `closeicon`, `previousitemicon`, `nextitemicon`, `previousthumbnailicon`, `nextthumbnailicon` | props `closeIcon`, `itemPrevIcon`, `itemNextIcon`, `prevThumbnailIcon`, `nextThumbnailIcon` |
| Container styling      | `containerClass`, `containerStyle`, `maskClass`                                                    | `containerClass`, `containerStyle`, `containerProps`, `maskClass`                                   | `className`, `style`, spread DOM attributes                                                 |
| Transition control     | `motionOptions`, `maskMotionOptions`; deprecated `showTransitionOptions` / `hideTransitionOptions` | CSS transition `p-galleria` via PT `transition`                                                     | `transitionOptions` (CSSTransition props)                                                   |
| Autoplay stop on click | `shouldStopAutoplayByClick` (default true)                                                         | always stops                                                                                        | n/a (see below)                                                                             |
| Navigator a11y props   | none                                                                                               | `prevButtonProps`, `nextButtonProps` (thumbnail buttons only), `ariaLabel`, `ariaRoledescription`   | none                                                                                        |
| Imperative API         | –                                                                                                  | –                                                                                                   | `show`, `hide`, `isAutoPlayActive`, `startSlideShow`, `stopSlideShow`, `getElement`         |

Source vs typings/docs:

- PrimeReact reads `props.closeOnEscape` to close the full-screen view on Escape, but the prop is absent from the defaults, the typings and the docs, so it is effectively an undocumented opt-in (`primereact-10.9.9:components/lib/galleria/Galleria.js`, `primereact-10.9.9:components/lib/galleria/galleria.d.ts`, `primereact-10.9.9:components/lib/galleria/GalleriaBase.js`).
- Escape handling differs: PrimeVue binds a document keydown listener while full-screen is open and closes on Escape; PrimeNG has no Escape handler in the component and closes only through the close button or by clicking the mask itself; PrimeVue has no mask-click close (`primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`, `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`).
- Autoplay end behaviour: PrimeReact stops the slideshow when the index would pass the last item (comment references issue 3973); PrimeNG wraps only when `circular` and otherwise keeps incrementing the index past the end; the PrimeVue content block advances the same way as PrimeNG (`primereact-10.9.9:components/lib/galleria/Galleria.js`, `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`).
- Item navigator disabling: PrimeVue and PrimeReact set a native `disabled` attribute on the buttons at the ends of a non-circular list; PrimeNG only adds the `p-disabled` class (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`, `primereact-10.9.9:components/lib/galleria/GalleriaItem.js`, `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`).
- When `value.length < numVisible`, PrimeNG and PrimeVue shrink the visible-thumbnail count to the list length (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`).
- Touch swipe on the thumbnail strip: wired end to end in PrimeVue and PrimeReact; in PrimeNG the template binds `touchstart` and `touchmove` but not `touchend`, so the swipe handler is never invoked (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`, `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`, `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`).
- Typing oddity: PrimeReact's `GalleriaState` declares `visible` and `slideShowActive` as `number` (`primereact-10.9.9:components/lib/galleria/galleria.d.ts`).
- Responsive thumbnails: all three inject a style element with the per-breakpoint `flex: 1 0 <100/numVisible>%` rule for the thumbnail item (PrimeNG appends it to `body` with the CSP nonce and only registers a resize listener when `responsiveOptions` is set; PrimeReact uses an inline-style helper with a context/global nonce) (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`).

## 6. Usage guidance

Each point below corresponds to one showcase doc section. Doc files exist in all three showcases; the PrimeVue file is cited first and the PrimeNG / PrimeReact counterparts in the same folder with the framework's naming style.

- Basic: supply `value`, an `item` template for the large image and a `thumbnail` template for the strip (`primevue-4.5.5:apps/showcase/doc/galleria/BasicDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/basic-doc.ts`, `primereact-10.9.9:components/doc/galleria/basicdoc.js`).
- Advanced: build a custom UI by combining navigators, hover navigators, circular autoplay, a ref for programmatic control and PassThrough styling (`primevue-4.5.5:apps/showcase/doc/galleria/AdvancedDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/advanced-doc.ts`, `primereact-10.9.9:components/doc/galleria/advanceddoc.js`).
- Autoplay: a slideshow is `circular` plus `autoPlay`, with the delay set through `transitionInterval` (`primevue-4.5.5:apps/showcase/doc/galleria/AutoPlayDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/autoplay-doc.ts`, `primereact-10.9.9:components/doc/galleria/autoplaydoc.js`).
- Caption: describe each image with the `caption` template that receives the current item (`primevue-4.5.5:apps/showcase/doc/galleria/CaptionDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/caption-doc.ts`, `primereact-10.9.9:components/doc/galleria/captiondoc.js`).
- Controlled: bind `activeIndex` to drive the gallery from outside (`primevue-4.5.5:apps/showcase/doc/galleria/ControlledDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/controlled-doc.ts`, `primereact-10.9.9:components/doc/galleria/controlleddoc.js`).
- Responsive: change `numVisible` per screen width with `responsiveOptions` (`primevue-4.5.5:apps/showcase/doc/galleria/ResponsiveDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/responsive-doc.ts`, `primereact-10.9.9:components/doc/galleria/responsivedoc.js`).
- Thumbnail: place the strip with `thumbnailsPosition` (`primevue-4.5.5:apps/showcase/doc/galleria/ThumbnailDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/thumbnail-doc.ts`, `primereact-10.9.9:components/doc/galleria/thumbnaildoc.js`).
- Full screen with thumbnails: add `fullScreen` and control visibility through `visible` (PrimeNG, PrimeVue) or the ref's `show()` (PrimeReact) (`primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/WithThumbnailsDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/withthumbnails-doc.ts`, `primereact-10.9.9:components/doc/galleria/fullscreen/withthumbnailsdoc.js`).
- Full screen without thumbnails: thumbnails can be hidden in full-screen mode (`primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/WithoutThumbnailsDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/withoutthumbnails-doc.ts`, `primereact-10.9.9:components/doc/galleria/fullscreen/withoutthumbnailsdoc.js`).
- Full screen custom content: set `activeIndex` so the viewer opens on the clicked image (`primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/CustomContentDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/customcontent-doc.ts`, `primereact-10.9.9:components/doc/galleria/fullscreen/customcontentdoc.js`).
- Indicators, click: `showIndicators` shows a dot row that changes the item on click (`primevue-4.5.5:apps/showcase/doc/galleria/indicator/ClickEventDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/indicator/clickevent-doc.ts`, `primereact-10.9.9:components/doc/galleria/indicator/clickeventdoc.js`).
- Indicators, hover: `changeItemOnIndicatorHover` switches the item on hover instead (`primevue-4.5.5:apps/showcase/doc/galleria/indicator/HoverEventDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/indicator/hoverevent-doc.ts`, `primereact-10.9.9:components/doc/galleria/indicator/hovereventdoc.js`).
- Indicators, position: `indicatorsPosition` picks one of four sides and `showIndicatorsOnItem` moves the dots onto the image (`primevue-4.5.5:apps/showcase/doc/galleria/indicator/PositionDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/indicator/positioned-doc.ts`, `primereact-10.9.9:components/doc/galleria/indicator/positiondoc.js`).
- Indicators, template: customise the dot content with the `indicator` template (`primevue-4.5.5:apps/showcase/doc/galleria/indicator/TemplateDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/indicator/template-doc.ts`, `primereact-10.9.9:components/doc/galleria/indicator/templatedoc.js`).
- Navigators with thumbnails: `showItemNavigators` adds left/right buttons (`primevue-4.5.5:apps/showcase/doc/galleria/navigator/ItemThumbnailsDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/navigator/itemthumbnails-doc.ts`, `primereact-10.9.9:components/doc/galleria/navigator/itemthumbnailsdoc.js`).
- Navigators without thumbnails: a navigators-only variant (`primevue-4.5.5:apps/showcase/doc/galleria/navigator/ItemWithoutThumbnailsDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/navigator/itemwithoutthumbnails-doc.ts`, `primereact-10.9.9:components/doc/galleria/navigator/itemwithouthumbnailsdoc.js`).
- Navigators on hover: `showItemNavigatorsOnHover` reveals them only on pointer hover (`primevue-4.5.5:apps/showcase/doc/galleria/navigator/HoverDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/navigator/hover-doc.ts`, `primereact-10.9.9:components/doc/galleria/navigator/hoverdoc.js`).
- Navigators with indicators: both can be combined (`primevue-4.5.5:apps/showcase/doc/galleria/navigator/IndicatorsDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/navigator/indicators-doc.ts`, `primereact-10.9.9:components/doc/galleria/navigator/indicatorsdoc.js`).
- PassThrough: the PT sections are demonstrated by a viewer in PrimeNG/PrimeVue and by a wireframe in PrimeReact (`primevue-4.5.5:apps/showcase/doc/galleria/pt/PTViewer.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/pt/PTViewer.ts`, `primereact-10.9.9:components/doc/galleria/pt/wireframe.js`).
- Theming: PrimeVue links to Tailwind presets and PrimeReact has a styled-mode class list and a Tailwind section (`primevue-4.5.5:apps/showcase/doc/galleria/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/galleria/theming/styleddoc.js`, `primereact-10.9.9:components/doc/galleria/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/galleria/styledoc.js`).
- Accessibility: see section 7 (`primevue-4.5.5:apps/showcase/doc/galleria/AccessibilityDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/accessibility-doc.ts`, `primereact-10.9.9:components/doc/galleria/accessibilitydoc.js`).

## 7. Accessibility

What the docs promise (the three accessibility pages are essentially the same text; they were checked in `primevue-4.5.5:apps/showcase/doc/galleria/AccessibilityDoc.vue`, `primeng-21.1.9:apps/showcase/doc/galleria/accessibility-doc.ts`, `primereact-10.9.9:components/doc/galleria/accessibilitydoc.js`):

- Root has `role="region"`; `aria-label` and `aria-roledescription` can be supplied.
- The slide container's `aria-live` is described as "polite" when not auto-playing and "off" while auto-playing.
- A slide is a `group` with `aria-label` from `aria.slideNumber` and `aria-roledescription` from `aria.slide`; inactive slides are said to be hidden with `aria-hidden`.
- Next/previous are buttons labelled from `aria.nextPageLabel` / `aria.firstPageLabel` (PrimeNG, PrimeReact text) or `aria.prevPageLabel` / `aria.nextPageLabel` (PrimeVue text); the pages also mention `nextButtonProps` / `prevButtonProps`.
- Indicators and thumbnails follow the tab pattern (`tablist`, `tab`, `aria-selected`, `aria-controls`, `aria-label` from `aria.pageLabel`, `aria-current`).
- Full screen uses a `dialog` with `aria-modal`; the close button label is `aria.close`.
- Keyboard tables: buttons use Tab/Enter/Space; quick navigation uses Tab, Enter, Space, Right/Left arrows, Home and End. The sentence text still says "carousel" in one cell (copy-paste from Carousel).

What the code does (including mismatches against the docs):

- `aria-live` is `'polite'` when `autoPlay` is true and `'off'` otherwise in all three, the opposite of the docs (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`, `primereact-10.9.9:components/lib/galleria/Galleria.js`).
- No `aria-hidden` is emitted on slides; only the active item is rendered, so the doc sentence is not reflected in the markup (same files).
- The `aria.prevPageLabel` / `aria.nextPageLabel` labels are applied to the **thumbnail** navigators in every framework; the item navigators carry no `aria-label` (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`, `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`). `prevButtonProps` / `nextButtonProps` exist only in PrimeVue and reach only the thumbnail buttons (`primevue-4.5.5:packages/primevue/src/galleria/BaseGalleria.vue`).
- Full-screen dialog: `role="dialog"` and `aria-modal="true"` on the mask in all three; PrimeNG and PrimeVue add a focus trap, PrimeVue also stores and restores the previously focused element and focuses the close button on open; PrimeNG focuses the close button 25 ms after the enter animation starts; PrimeReact uses a Portal and CSSTransition without a focus trap (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`, `primereact-10.9.9:components/lib/galleria/Galleria.js`).
- Indicators: list items are focusable (`tabindex` 0 on every `li` in PrimeNG and PrimeReact; the inner button is `-1` or `0` depending on state) with `aria-label`, `aria-selected`, `aria-controls` and an active data attribute. PrimeVue handles Enter/NumpadEnter/Space, arrows, Home/End and Tab sync; PrimeNG handles only Enter/Space and cancels ArrowUp/ArrowDown; PrimeReact has the keyboard handlers but they depend on a button with `tabindex="0"` which never exists because of the prop-name bug described in section 11 (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`, `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primereact-10.9.9:components/lib/galleria/GalleriaItem.js`).
- Thumbnails: the container is `role="tablist"`; PrimeVue and PrimeReact set `role="tab"` on each thumbnail item, PrimeNG sets `aria-selected` / `aria-controls` without `role="tab"`. The focusable thumbnail element uses a roving tabindex, `aria-current="page"` and `aria-label` from `aria.pageLabel`; keyboard support is Enter/Space plus arrows, Home/End and Tab sync (PrimeNG additionally cancels Up/Down) (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`, `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`).
- PrimeNG item navigators carry `role="navigation"` on button elements (an unusual role for a button) and expose disabled state only as a class (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`).
- Item slot: `role="group"`, label from `aria.slideNumber`, `aria-roledescription` from `aria.slide`, id `<id>_item_<index>` (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`).
- Close button label comes from the locale `aria.close` entry in all three.

## 8. Theming

- Shared structural CSS (PrimeNG and PrimeVue) lives in `@primeuix/styles-2.0.3:dist/galleria/index.mjs`, consumed by PrimeNG as `@primeuix/styles/galleria` (`primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`) and by PrimeVue through its style file (`primevue-4.5.5:packages/primevue/src/galleria/style/GalleriaStyle.js`). It covers the bordered root, the flex content column, absolutely positioned item navigators vertically centred, the hover-navigators mode, the caption bar, thumbnails in four positions, indicator lists in four positions, inset indicators in four positions, the fixed full-screen mask, the close button, the `p-items-hidden` helper and 300 ms enter/leave animations (`@primeuix/styles-2.0.3:dist/galleria/index.mjs`).
- Design tokens: `GalleriaDesignTokens` has 13 sections: `root`, `navButton`, `navIcon`, `thumbnailsContent`, `thumbnailNavButton`, `thumbnailNavButtonIcon`, `caption`, `indicatorList`, `indicatorButton`, `insetIndicatorList`, `insetIndicatorButton`, `closeButton`, `closeButtonIcon` (`@primeuix/themes-2.0.3:types/galleria/index.d.ts`). The token catalogue lists 65 `galleria.*` token names under "Galleria Design Tokens" (`@primeuix/themes-2.0.3:tokens/index.mjs`).
- Aura preset values: 1 px border using the content border colour/radius; nav and close buttons 3 rem round buttons with translucent white backgrounds (0.1 rest, 0.2 hover); nav icon 1.5 rem; thumbnail nav button 2 rem with the content radius; caption on a half-transparent black bar with 1 rem padding; indicator buttons 1 rem circles with the primary colour when active; inset indicators on half-transparent black; light and dark colour schemes override only the thumbnail nav button and indicator button colours (`@primeuix/themes-2.0.3:dist/aura/galleria/index.mjs`).
- PrimeReact does not use these tokens: its CSS (including dimensions, thumbnail opacity 0.5/1, scale 0.7 enter/exit and the full-screen mask) is a string inside `GalleriaBase.js` under `@layer primereact` (`primereact-10.9.9:components/lib/galleria/GalleriaBase.js`).
- PT: PrimeNG exposes 30 keys including `host` and `motion`; PrimeVue exposes the same set minus `host` plus `transition` and `hooks`; PrimeReact uses its own key names (section 4).

## 9. Relationships

- Same category, closest siblings: **carousel** (paged item slider with its own `numVisible`/`numScroll` paging and RTL gap; Galleria is the image-viewer variant with thumbnails and full-screen), **image** (single image with a built-in preview modal; the Galleria full-screen mode is the multi-image counterpart), **imagecompare** (before/after slider; unrelated interaction model).
- Shares the overlay mask pattern and body-scroll blocking with Image's preview and with Dialog-like overlays; PrimeNG and PrimeVue use the common `p-overlay-mask` class on the mask (`primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`).
- Shares the focus trap directive with Dialog and Drawer-style overlays (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`, `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`).
- Uses Ripple and the shared icon set (times, chevron-left/right/up/down) (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`).
- Depends on the locale configuration for all ARIA labels, so it is tied to the configuration/locale feature rather than to a sibling component.

## 10. Dependencies

- PrimeNG: `@primeuix/motion` (motion types), `@primeuix/utils` (DOM helpers `addClass`, `find`, `findSingle`, `focus`, `getAttribute`, `removeClass`, `setAttribute`, `uuid`), and the in-repo modules `primeng/api`, `basecomponent`, `bind`, `dom`, `focustrap`, `icons`, `motion`, `ripple`, `ts-helpers`, `utils` (z-index) (`primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`). Styles from `@primeuix/styles/galleria` (`primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`).
- PrimeVue: `@primeuix/utils` (`dom`, `object` for `localeComparator`/`sort`, `zindex`), `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primevue/icons` (chevrondown, chevronleft, chevronright, chevronup, times), and `primevue/ripple`, `primevue/focustrap`, `primevue/portal`, `primevue/utils` for body-scroll blocking (`primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`, `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`, `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`).
- PrimeReact: internal modules only: Api (locale, `PrimeReact`, context), ComponentBase, CSSTransition, Hooks (`useInterval`, `useMergeProps`, `useUnmountEffect`, `useGlobalOnEscapeKey`), icons (times, chevron-left/right), Portal, Ripple and Utils (`DomHandler`, `IconUtils`, `ObjectUtils`, `UniqueComponentId`, `ZIndexUtils`, `classNames`) (`primereact-10.9.9:components/lib/galleria/Galleria.js`, `primereact-10.9.9:components/lib/galleria/GalleriaItem.js`).
- Demo data in the showcases comes from the shared photo service, which is not part of the component (`primevue-4.5.5:apps/showcase/doc/galleria/BasicDoc.vue`).

## 11. Framework differences

| Topic                         | PrimeNG                                                                | PrimeVue                                                  | PrimeReact                                                                         |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Packaging                     | `standalone: false`, via `GalleriaModule`                              | single-file component, `inheritAttrs: false`              | `memo(forwardRef)` with imperative ref                                             |
| Full-screen visibility        | `visible` input, `visibleChange` output                                | `visible` prop, `update:visible`                          | internal state, `show()`/`hide()`, `onShow`/`onHide`                               |
| Mask click closes             | yes (only when the mask itself is clicked)                             | no                                                        | not confirmed in the component (mask rendered with Portal, no click handler found) |
| Escape closes                 | no handler                                                             | yes, document keydown in full screen                      | only via undocumented `closeOnEscape`                                              |
| Focus trap                    | yes (`pFocusTrap`, disabled outside full screen)                       | yes (`v-focustrap`) + focus restore                       | no                                                                                 |
| Item navigator disabled       | class `p-disabled` only                                                | native `disabled`                                         | native `disabled` + `data-p-disabled`                                              |
| Item navigator icon names     | `itempreviousicon` / `itemnexticon`                                    | `previousitemicon` / `nextitemicon`                       | `itemPrevIcon` / `itemNextIcon`                                                    |
| Autoplay at end (no circular) | index keeps increasing, no stop                                        | same as PrimeNG                                           | stops at the end                                                                   |
| Stop autoplay on click        | `shouldStopAutoplayByClick` (default true)                             | always                                                    | n/a                                                                                |
| Thumbnail role `tab`          | missing                                                                | present                                                   | present                                                                            |
| Thumbnail touch swipe         | `touchend` not bound                                                   | works                                                     | works                                                                              |
| Indicator state               | works; `tabindex="0"` on every item                                    | works                                                     | broken: GalleriaItem receives `activeItemIndex` but reads `activeIndex`            |
| Navigator button props        | none                                                                   | `prevButtonProps` / `nextButtonProps` (thumbnail buttons) | none                                                                               |
| Transitions                   | `motionOptions`, `maskMotionOptions` (+ deprecated transition strings) | CSS transition `p-galleria`                               | `transitionOptions` (CSSTransition)                                                |
| Class vocabulary              | shared with PrimeVue                                                   | shared with PrimeNG                                       | different (`p-galleria-item-prev`, `p-link`, `p-galleria-indicators` etc.)         |
| Styling source                | `@primeuix/styles` + design tokens                                     | `@primeuix/styles` + design tokens                        | CSS string in `GalleriaBase.js`                                                    |
| Extra DOM attributes          | via host                                                               | `containerProps`                                          | spread through `getOtherProps`                                                     |

Evidence for the PrimeReact indicator defect: `Galleria.js` hands the sub-component `activeItemIndex`, but `GalleriaItem.js` computes `aria-selected`, the button `tabIndex` and the `button[tabindex="0"]` lookup used by the keyboard handlers from `props.activeIndex`; the lookup therefore finds nothing and the arrow/Home/End handlers dereference a null element (`primereact-10.9.9:components/lib/galleria/Galleria.js`, `primereact-10.9.9:components/lib/galleria/GalleriaItem.js`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`
- `primeng-21.1.9:packages/primeng/src/galleria/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/galleria/galleria.spec.ts`
- `primeng-21.1.9:packages/primeng/src/galleria/style/galleriastyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/galleria/galleria.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/galleria/public_api.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/guides/rtl/limitations-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/advanced-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/autoplay-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/caption-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/controlled-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/responsive-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/thumbnail-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/customcontent-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/withoutthumbnails-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/fullscreen/withthumbnails-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/indicator/clickevent-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/indicator/clickeventdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/indicator/hoverevent-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/indicator/positioned-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/indicator/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/navigator/hover-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/navigator/indicators-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/navigator/itemthumbnails-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/navigator/itemwithoutthumbnails-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/galleria/pt/PTViewer.ts`
- `primevue-4.5.5:packages/primevue/src/galleria/Galleria.vue`
- `primevue-4.5.5:packages/primevue/src/galleria/BaseGalleria.vue`
- `primevue-4.5.5:packages/primevue/src/galleria/GalleriaContent.vue`
- `primevue-4.5.5:packages/primevue/src/galleria/GalleriaItem.vue`
- `primevue-4.5.5:packages/primevue/src/galleria/GalleriaThumbnails.vue`
- `primevue-4.5.5:packages/primevue/src/galleria/Galleria.d.ts`
- `primevue-4.5.5:packages/primevue/src/galleria/style/GalleriaStyle.js`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/guides/rtl/LimitationsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/AdvancedDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/AutoPlayDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/CaptionDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/ControlledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/ResponsiveDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/ThumbnailDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/CustomContentDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/WithThumbnailsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/fullscreen/WithoutThumbnailsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/indicator/ClickEventDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/indicator/HoverEventDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/indicator/PositionDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/indicator/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/navigator/HoverDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/navigator/IndicatorsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/navigator/ItemThumbnailsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/navigator/ItemWithoutThumbnailsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/galleria/theming/TailwindDoc.vue`
- `primereact-10.9.9:components/lib/galleria/Galleria.js`
- `primereact-10.9.9:components/lib/galleria/GalleriaBase.js`
- `primereact-10.9.9:components/lib/galleria/GalleriaItem.js`
- `primereact-10.9.9:components/lib/galleria/GalleriaThumbnails.js`
- `primereact-10.9.9:components/lib/galleria/galleria.d.ts`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/doc/galleria/importdoc.js`
- `primereact-10.9.9:components/doc/galleria/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/galleria/advanceddoc.js`
- `primereact-10.9.9:components/doc/galleria/autoplaydoc.js`
- `primereact-10.9.9:components/doc/galleria/basicdoc.js`
- `primereact-10.9.9:components/doc/galleria/captiondoc.js`
- `primereact-10.9.9:components/doc/galleria/controlleddoc.js`
- `primereact-10.9.9:components/doc/galleria/responsivedoc.js`
- `primereact-10.9.9:components/doc/galleria/styledoc.js`
- `primereact-10.9.9:components/doc/galleria/thumbnaildoc.js`
- `primereact-10.9.9:components/doc/galleria/fullscreen/customcontentdoc.js`
- `primereact-10.9.9:components/doc/galleria/fullscreen/withoutthumbnailsdoc.js`
- `primereact-10.9.9:components/doc/galleria/fullscreen/withthumbnailsdoc.js`
- `primereact-10.9.9:components/doc/galleria/indicator/clickeventdoc.js`
- `primereact-10.9.9:components/doc/galleria/indicator/hovereventdoc.js`
- `primereact-10.9.9:components/doc/galleria/indicator/positiondoc.js`
- `primereact-10.9.9:components/doc/galleria/indicator/templatedoc.js`
- `primereact-10.9.9:components/doc/galleria/navigator/hoverdoc.js`
- `primereact-10.9.9:components/doc/galleria/navigator/indicatorsdoc.js`
- `primereact-10.9.9:components/doc/galleria/navigator/itemthumbnailsdoc.js`
- `primereact-10.9.9:components/doc/galleria/navigator/itemwithouthumbnailsdoc.js`
- `primereact-10.9.9:components/doc/galleria/pt/wireframe.js`
- `primereact-10.9.9:components/doc/galleria/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/galleria/theming/tailwinddoc.js`
- `@primeuix/styles-2.0.3:dist/galleria/index.mjs`
- `@primeuix/themes-2.0.3:types/galleria/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/galleria/index.mjs`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `docs/prime-reference/catalog/primeng.json`
- `docs/prime-reference/catalog/primevue.json`
- `docs/prime-reference/catalog/primereact.json`
