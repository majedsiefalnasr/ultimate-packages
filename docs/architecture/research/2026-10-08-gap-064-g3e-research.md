# GAP-064 G3-E research — Media and Data (verification-first)

**Date:** 2026-10-08
**Evidence gathered at:** `main` = `origin/main` = `cad9f85` (Playbook and pilot merged), clean tree.
**Status:** research record for review. No CSS, component, story, baseline or CI change; no Spec, Plan or tasks; no new GAP. G3-A..G3-D are not reopened.
**Method:**

- Pinned sources (ADR-048): PrimeNG 21.1.9 and PrimeVue 4.5.5 component, style and showcase sources from `.vendor-cache/`; `@primeuix/styles` 2.0.3 from `.vendor-extracted/uix-styles-full/`.
- Ultimate: source, style modules and stories at `cad9f85`; the rendered DOM of every existing G3-E story (Chromium, 1280 × 720, both Storybooks) captured read-only.
- Process: `docs/architecture/PARITY_PLAYBOOK.md`. PrimeNG is the Angular oracle, PrimeVue the Vue oracle. Prime source below is **diagnostic**: every expected visual is a hypothesis for the rendered comparison, not a verdict.
- Working files (git-ignored): `.superpowers/sdd/2026-10-08-gap-064-g3e-research/` (extracted Prime sources, `dom-ultimate.txt`, probe script).

**Markers:** ✅ confirmed (source or rendered Ultimate DOM); 🔶 to be confirmed by the rendered Prime comparison.

---

## 1. Summary

- **Scope:** 8 Aura keys: carousel, galleria, image, imagecompare, dataview, orderlist, organizationchart, picklist. That is 7 Angular and 8 Vue components. Angular OrganizationChart does not exist: protected DECISION-D blocks it.
- **Proposed canonical cases:** 43 case definitions (§B), within the tier caps: 39 Angular and 39 Vue comparisons, 20 recorded D cases, and 18 case needs that today's stories cannot serve (§B.9, §6).
- **Framework-specific Prime behavior** exists in 5 of 8 components (§C.2–§C.3): OrderList (PrimeNG-only CSS layer and controls position), ImageCompare (inline `clip-path` vs CSS variable), DataView (PrimeNG-only loading overlay), OrderList/PickList (`pButton` directive vs `<Button>` component), and Galleria/Carousel/OrderList/PickList (runtime `<style>` injection in both).
- **Cross-cutting findings that need a decision before the Spec** (§7):
  1. Every media story loads images from `primefaces.org`. ImageCompare's images fail to load today, in both frameworks (✅). A deterministic local image fixture is needed for verification.
  2. Existing stories cannot render several canonical cases, and two stories are broken (Angular DataView throws NG0950; Vue ImageCompare drops its width). This needs a ruling on which stories may be added or repaired, within the Playbook's "only for a canonical case" rule.
  3. For the Ultimate-specific structures (OrganizationChart, DataView, the Galleria thumbnails), it must be decided whether the rendered target is full Prime parity (which may need a DOM-change exception under X-2) or a documented C.
- **Existing GAPs that apply:** GAP-098 (box model, every component); GAP-099 D3/D4 pattern (Prime Button vs Ultimate native button) is likely repeated in Carousel, OrderList and PickList 🔶, but no new GAP is proposed before rendered evidence. GAP-050/GAP-051 (Galleria/Carousel accessibility) are resolved.

---

## A. Component inventory

| Key               | Tier | Angular                                 | Vue                                               | Source-port status (GAP-064) | Stories today (ids)                                                                                               | Known gaps / notes                                                                                |
| ----------------- | ---- | --------------------------------------- | ------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| carousel          | A    | `UCarousel` (`carousel`)                | `UCarousel` (`carousel`)                          | not ported (hand-written)    | ng/vue: `*-carousel--default`, `*-carousel--circular-with-autoplay`                                               | GAP-051 resolved; GAP-098                                                                         |
| galleria          | A    | `UGalleria` (`galleria`)                | `UGalleria` (`galleria`)                          | not ported                   | ng/vue: `*-galleria--default`                                                                                     | GAP-050 resolved; GAP-098; Ultimate-specific thumbnails (G3 research: 7/41 classes)               |
| image             | B    | `UImage` (`image`)                      | `UImage` (`image`)                                | not ported                   | ng/vue: `*-image--default`, `*-image--with-preview`                                                               | GAP-098; X-5 overlay-mask role applies                                                            |
| imagecompare      | B    | `UImageCompare` (`image-compare` ⚠ key) | `UImageCompare` (`image-compare` ⚠ key)           | not ported                   | ng/vue: `*-imagecompare--default` (**images fail to load**)                                                       | GAP-098; runtime variable (D-G3-4/X-4)                                                            |
| dataview          | B    | `UDataView` (`data-view` ⚠ key)         | `UDataView` (`data-view` ⚠ key)                   | not ported                   | ng/vue: `data-dataview--default` (**Angular throws NG0950**)                                                      | GAP-098; Ultimate-specific structure (G3 research: 0/7 classes); DECISION-C resolved for DataView |
| orderlist         | B    | `UOrderList` (`order-list` ⚠ key)       | `UOrderList` (`order-list` ⚠ key)                 | not ported                   | ng: `data-orderlist--default`, `--with-drag-drop`, `--controlled`; vue: `data-orderlist--default`, `--controlled` | GAP-098; ng uses `u-listbox`, Vue its own list (D-G3-9)                                           |
| organizationchart | B    | — (protected DECISION-D)                | `UOrganizationChart` (`organization-chart` ⚠ key) | not ported                   | vue: `panel-organizationchart--default`                                                                           | GAP-098; Ultimate-specific structure (G3 research: 0/11 classes); DECISION-D                      |
| picklist          | B    | `UPickList` (`pick-list` ⚠ key)         | `UPickList` (`pick-list` ⚠ key)                   | not ported                   | ng/vue: `data-picklist--default`, `--controlled`                                                                  | GAP-098; Listbox divergence (D-G3-9)                                                              |

"⚠ key": the registered style key differs from the Aura key (ADR-051 rename at port time). No G3-E component has screenshot, reach or accessibility coverage today (✅ no e2e spec mentions them; 0 accessibility-baseline rows).

### A.1 Rendered Ultimate structure (✅, both Storybooks)

| Key               | Ultimate DOM (both frameworks unless stated)                                                                                                                                                                                                                                                            | Major differences from Prime DOM (diagnostic)                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| carousel          | `.u-carousel.u-carousel-horizontal > .u-carousel-content > (.u-carousel-content-inner > button.u-carousel-prev-button, .u-carousel-viewport > .u-carousel-item-list > .u-carousel-item*, button.u-carousel-next-button) + ul.u-carousel-indicator-list > li.u-carousel-indicator > button`              | Prime: `.p-carousel > .p-carousel-content-container > .p-carousel-content > (p-button/Button prev, viewport, next) + indicator list`; optional header/footer. Ultimate nav buttons are native 20 × 21 buttons; Prime uses its Button component (text, rounded) 🔶. No `-item-active/-start/-end`, `-item-clone` classes.                                             |
| galleria          | `.u-galleria > .u-galleria-item-wrapper > (button.u-galleria-prev-button 40×40, .u-galleria-item-container > img, button.u-galleria-next-button) + ul.u-galleria-thumbnail-list > li.u-galleria-thumbnail-item(-active) > img`; Angular adds the `u-galleria` host; Vue adds an unclassed wrapper `div` | Prime: `.p-galleria > .p-galleria-content > .p-galleria-items-container > .p-galleria-items > .p-galleria-item` plus a thumbnail carousel (`.p-galleria-thumbnails-content > thumbnail prev/next buttons, .p-galleria-thumbnails-viewport > .p-galleria-thumbnail-items`), optional indicators and caption. Ultimate thumbnails are a plain list without navigation. |
| image             | `span.u-image > img + button.u-image-preview-mask > svg.u-image-preview-icon`; preview overlay with `u-image-mask`, `u-image-toolbar`, action buttons, `u-image-original`                                                                                                                               | Close to Prime class-for-class (renamed). Prime mask is `p-image-mask p-overlay-mask` (base overlay-mask role, X-5).                                                                                                                                                                                                                                                 |
| imagecompare      | `.u-image-compare > img + span > img + input.u-image-compare-slider`                                                                                                                                                                                                                                    | Prime: `.p-imagecompare > (left slot) + (right slot) + input.p-imagecompare-slider`, upstream rules target `img + img`. Ultimate wraps the second image in a `span`, so `img + img` cannot match as written (X-1).                                                                                                                                                   |
| dataview          | Angular: `.u-data-view > ul.u-data-view-list > li.u-data-view-item*`; Vue: `.u-data-view > div.u-data-view-list > div.u-data-view-item*`                                                                                                                                                                | Prime: `.p-dataview > (header?) + paginator? + .p-dataview-content > [user list/grid template] + paginator? + (footer?)`. Prime renders no item wrappers; the user template does. Ultimate adds wrappers and differs per framework.                                                                                                                                  |
| orderlist         | Angular: `.u-order-list > .u-order-list-controls > button*4 (text "Move …") + div > .u-order-list-list > u-listbox`; Vue: `.u-order-list > section > (.u-order-list-controls, .u-order-list-list > .u-listbox)`; Vue options show a 13 × 13 `input` per option                                          | Prime: `.p-orderlist > .p-orderlist-controls > 4 icon-only buttons + .p-listbox`. Ultimate controls are text buttons; Vue list column is 96 px wide (narrow layout) 🔶; Vue options render visible checkbox inputs 🔶.                                                                                                                                               |
| organizationchart | Vue: `.u-organization-chart > .u-organization-chart-node > .u-organization-chart-node-content + .u-organization-chart-children > node*` (flex `div`s)                                                                                                                                                   | Prime: table layout (`table.p-organizationchart-table`, rows for node, connector lines `-connector-down/left/right/top`, children). Ultimate has no connector lines and no toggle button 🔶.                                                                                                                                                                         |
| picklist          | `.u-pick-list > section.u-pick-list-source (h3?, .u-pick-list-controls, .u-pick-list-list) + transfer `.u-pick-list-controls` + section.u-pick-list-target`; **Angular renders the transfer controls after the target section**, Vue between                                                            | Prime: `.p-picklist > source controls + source list container + transfer controls + target list container + target controls`. Ultimate puts source/target controls above each list (text buttons).                                                                                                                                                                   |

---

## B. Canonical verification matrix

Rules applied (Playbook §5): one axis at a time; variant strips; tier caps (A ≤ 12, B ≤ 6); unsupported → D; content of each case is identical on both sides (simplified from the showcase; local images, decision G3E-1). "Setup differs" means the Angular and Vue cases need different wiring.

Abbreviations: **V** visual + probe; **Bh** behavior script; **story** = existing Ultimate story id (`ng` / `vue`); **new** = a story is needed (§6).

### B.1 Carousel — Tier A (7 cases, cap 12)

| Case               | PrimeNG source           | PrimeVue source   | Kind | Axis                                        | Ultimate story                                   | Setup differs | Comparison target                                                                                          |
| ------------------ | ------------------------ | ----------------- | ---- | ------------------------------------------- | ------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| carousel/default   | `basic-doc.ts`           | `BasicDoc.vue`    | V    | default (3 visible, scroll 1, not circular) | `ng-carousel--default` / `vue-carousel--default` | no            | Root, viewport, item width, prev (disabled at start) and next buttons, indicator list and active indicator |
| carousel/next      | `basic-doc.ts`           | `BasicDoc.vue`    | Bh+V | navigate                                    | same                                             | no            | After one Next: first visible item, active indicator, prev enabled                                         |
| carousel/indicator | `basic-doc.ts`           | `BasicDoc.vue`    | Bh   | indicator click                             | same                                             | no            | Page shown and active indicator after clicking indicator 2                                                 |
| carousel/nav-focus | `basic-doc.ts`           | `BasicDoc.vue`    | V    | focus-visible on Next                       | same                                             | no            | Focus ring on the next button                                                                              |
| carousel/circular  | `circular-doc.ts`        | `CircularDoc.vue` | V    | circular, 1 visible                         | `*-carousel--circular-with-autoplay`             | no            | Both nav buttons enabled at start; autoplay frozen (G3E-4)                                                 |
| carousel/vertical  | `vertical-doc.ts`        | `VerticalDoc.vue` | V    | orientation vertical                        | **new** (orientation supported, no story)        | no            | Vertical viewport height (Prime `verticalViewPortHeight`, default 300 px), up/down buttons                 |
| carousel/rtl       | — (upstream `:dir(rtl)`) | —                 | V    | RTL                                         | **new**                                          | no            | Mirrored nav icons/order (upstream has 2 `:dir(rtl)` rules)                                                |

D: `responsive` (no `responsiveOptions`), header/footer facets (no inputs/slots). Not canonical: autoplay timing (behavior already covered by GAP-051's checks).

### B.2 Galleria — Tier A (7 cases, cap 12)

| Case                      | PrimeNG source                           | PrimeVue source                          | Kind | Axis                                   | Ultimate story                   | Setup differs                                       | Comparison target                                                               |
| ------------------------- | ---------------------------------------- | ---------------------------------------- | ---- | -------------------------------------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| galleria/item-thumbnails  | `navigator/itemthumbnails-doc.ts`        | `navigator/ItemThumbnailsDoc.vue`        | V    | item navigators + thumbnails (default) | `*-galleria--default`            | **yes** (§D: Angular host swallows the story width) | Item area, nav buttons, thumbnail strip, active thumbnail                       |
| galleria/no-thumbnails    | `navigator/itemwithoutthumbnails-doc.ts` | `navigator/ItemWithoutThumbnailsDoc.vue` | V    | `showThumbnails=false`                 | **new**                          | yes                                                 | Item area with navigators only                                                  |
| galleria/next             | `navigator/itemthumbnails-doc.ts`        | same                                     | Bh+V | item navigation                        | `*-galleria--default`            | yes                                                 | Active item and active thumbnail after Next; prev state at start (not circular) |
| galleria/thumbnail-select | `basic-doc.ts`                           | `BasicDoc.vue`                           | Bh   | thumbnail click                        | `*-galleria--default`            | yes                                                 | Active item after clicking thumbnail 3                                          |
| galleria/nav-focus        | `navigator/itemthumbnails-doc.ts`        | same                                     | V    | focus-visible on item Next             | `*-galleria--default`            | yes                                                 | Focus ring                                                                      |
| galleria/fullscreen       | `fullscreen/withthumbnails-doc.ts`       | `fullscreen/WithThumbnailsDoc.vue`       | V    | full screen open                       | **new** (`fullScreen` supported) | yes                                                 | Mask (overlay-mask role, X-5), close button, item, thumbnails                   |
| galleria/fullscreen-close | same                                     | same                                     | Bh   | Escape / close button                  | **new**                          | yes                                                 | Overlay removed; focus return                                                   |

D: indicators (`showIndicators`, positions, hover, template — no input), `thumbnailsPosition`, `responsiveOptions`, caption, hover navigators (`showItemNavigatorsOnHover`), custom full-screen content, advanced. **Default divergence ✅:** Prime `showItemNavigators` defaults to `false`, Ultimate to `true`; cases set it explicitly on both sides. Not canonical: autoplay.

### B.3 Image — Tier B (5 cases, cap 6)

| Case                | PrimeNG source         | PrimeVue source  | Kind | Axis                   | Ultimate story          | Setup differs | Comparison target                                           |
| ------------------- | ---------------------- | ---------------- | ---- | ---------------------- | ----------------------- | ------------- | ----------------------------------------------------------- |
| image/default       | `Image/basic-doc.ts`   | `BasicDoc.vue`   | V    | default (width 200)    | `*-image--default`      | no            | Root box and image size                                     |
| image/preview-hover | `Image/preview-doc.ts` | `PreviewDoc.vue` | V    | hover on preview image | `*-image--with-preview` | no            | Preview mask and icon visibility                            |
| image/preview-open  | same                   | same             | V    | preview open           | `*-image--with-preview` | no            | Overlay mask (X-5), toolbar, action buttons, original image |
| image/preview-zoom  | same                   | same             | Bh+V | zoom in, rotate        | `*-image--with-preview` | no            | Zoom-out enabled after zoom-in; image transform             |
| image/preview-close | same                   | same             | Bh   | Escape / close button  | `*-image--with-preview` | no            | Overlay removed; focus return to the preview button         |

D: template (custom indicator/image slots — none), PrimeNG `previewimagesource` (`previewImageSrc`, Angular-only in Prime; no Ultimate input).

### B.4 ImageCompare — Tier B (4 cases, cap 6)

| Case                 | PrimeNG source           | PrimeVue source | Kind | Axis                        | Ultimate story                                      | Setup differs       | Comparison target                                                                                |
| -------------------- | ------------------------ | --------------- | ---- | --------------------------- | --------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| imagecompare/default | `basic-doc.ts`           | `BasicDoc.vue`  | V    | default, 50 %               | `*-imagecompare--default` (**broken**, G3E-1/G3E-3) | **yes** (Vue width) | Root box (`aspect-ratio: 16 / 9`), clip at 50 %, handle                                          |
| imagecompare/slide   | same                     | same            | Bh+V | slider at 25 %              | same                                                | no                  | Clip position. PrimeNG sets inline `clip-path`; PrimeVue sets `imagecompare.scope.x` (§C.2–§C.3) |
| imagecompare/focus   | same                     | same            | V    | focus-visible on the handle | same                                                | no                  | Handle focus ring                                                                                |
| imagecompare/rtl     | — (upstream `:dir(rtl)`) | —               | V    | RTL                         | **new**                                             | no                  | Mirrored clip (PrimeNG computes it in JS; PrimeVue via CSS)                                      |

D: `responsive` (demo-only Tailwind sizing classes).

### B.5 DataView — Tier B (5 cases, cap 6)

| Case               | PrimeNG source      | PrimeVue source                 | Kind | Axis              | Ultimate story                                | Setup differs      | Comparison target                                                                                                                                       |
| ------------------ | ------------------- | ------------------------------- | ---- | ----------------- | --------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dataview/list      | `basic-doc.ts`      | `BasicDoc.vue`                  | V    | list layout       | `data-dataview--default` (**Angular broken**) | yes (template API) | Root, content area, item rows (identical item template)                                                                                                 |
| dataview/grid      | `layout-doc.ts`     | `LayoutDoc.vue`                 | V    | grid layout       | **new** (`layout` supported)                  | yes                | Grid content area                                                                                                                                       |
| dataview/paginator | `pagination-doc.ts` | `PaginationDoc.vue`             | V    | paginator, rows 5 | **new** (`paginator` supported)               | yes                | Paginator position and styling (Paginator itself is Tranche 1)                                                                                          |
| dataview/empty     | — (`emptyMessage`)  | — (`empty` slot/`emptyMessage`) | V    | empty value       | **new**                                       | yes                | Empty-message element                                                                                                                                   |
| dataview/loading   | `loading-doc.ts`    | `LoadingDoc.vue`                | V    | loading           | **new**                                       | **yes**            | **Angular only:** PrimeNG loading overlay + icon. **Vue:** PrimeVue renders no loading state (its demo uses skeleton templates) — no oracle (§C.2–§C.3) |

D: sorting demo (header `Select`; Ultimate has no header facet — `sortField` ordering itself is covered by `list`), header/footer facets.

### B.6 OrderList — Tier B (Angular 6, Vue 4; cap 6)

| Case               | PrimeNG source    | PrimeVue source           | Kind | Axis                        | Ultimate story                         | Setup differs | Comparison target                                               |
| ------------------ | ----------------- | ------------------------- | ---- | --------------------------- | -------------------------------------- | ------------- | --------------------------------------------------------------- |
| orderlist/default  | `basic-doc.ts`    | `BasicDoc.vue`            | V    | default                     | `data-orderlist--default` (ng/vue)     | no            | Controls column (4 icon buttons in Prime), listbox, option rows |
| orderlist/selected | same              | same                      | V    | one option selected         | `data-orderlist--controlled`           | no            | Selected option highlight; controls enabled                     |
| orderlist/move     | same              | same                      | Bh   | select + Move up            | `data-orderlist--controlled`           | no            | Resulting order and kept selection                              |
| orderlist/focus    | same              | same                      | V    | keyboard focus on an option | `data-orderlist--default`              | no            | Focused-option styling                                          |
| orderlist/filter   | `filter-doc.ts`   | — (not in PrimeVue 4.5.5) | V    | filter input                | **new** (Angular `filterBy` supported) | Angular only  | Filter field and filtered list                                  |
| orderlist/dragdrop | `dragdrop-doc.ts` | —                         | Bh   | drag reorder                | `data-orderlist--with-drag-drop`       | Angular only  | Order after drag                                                |

D: PrimeNG `controlsPosition` left/right (PrimeNG-only feature and CSS, no Ultimate input); item template (no Ultimate template input/slot).

### B.7 PickList — Tier B (Angular 5, Vue 4; cap 6)

| Case              | PrimeNG source  | PrimeVue source | Kind | Axis                        | Ultimate story                         | Setup differs | Comparison target                                                    |
| ----------------- | --------------- | --------------- | ---- | --------------------------- | -------------------------------------- | ------------- | -------------------------------------------------------------------- |
| picklist/default  | `basic-doc.ts`  | `BasicDoc.vue`  | V    | default                     | `data-picklist--default`               | no            | Source/target lists, source/transfer/target controls and their order |
| picklist/selected | same            | same            | V    | one source item selected    | `data-picklist--controlled`            | no            | Selection highlight; transfer controls enabled                       |
| picklist/transfer | same            | same            | Bh   | move selected to target     | `data-picklist--controlled`            | no            | Lists after transfer                                                 |
| picklist/focus    | same            | same            | V    | keyboard focus on an option | `data-picklist--default`               | no            | Focused-option styling                                               |
| picklist/filter   | `filter-doc.ts` | —               | V    | source/target filter        | **new** (Angular `filterBy` supported) | Angular only  | Filter fields                                                        |

D: item templates (`template-doc`, `templates-doc`); responsive stacking below `breakpoint` (both sides support `breakpoint`, but it needs a viewport change — not canonical at 1280 × 720).

### B.8 OrganizationChart — Tier B (Vue only, 4 cases, cap 6)

| Case                     | PrimeNG source               | PrimeVue source                | Kind | Axis                   | Ultimate story                                  | Setup differs | Comparison target                 |
| ------------------------ | ---------------------------- | ------------------------------ | ---- | ---------------------- | ----------------------------------------------- | ------------- | --------------------------------- |
| organizationchart/basic  | (n/a — no Angular component) | `BasicDoc.vue`                 | V    | three levels           | `panel-organizationchart--default` (two levels) | —             | Nodes, connector lines, spacing   |
| organizationchart/select | —                            | `TemplateDoc.vue` (single)     | V    | node selected (single) | **new** (`selectionMode` supported)             | —             | Selected-node styling             |
| organizationchart/multi  | —                            | `SelectionDoc.vue`             | V    | multiple selection     | **new**                                         | —             | Two selected nodes                |
| organizationchart/toggle | —                            | `ColoredDoc.vue` (collapsible) | Bh+V | collapse a node        | **new** (`collapsible` supported)               | —             | Toggle button, collapsed children |

D: colored nodes (`styleClass` per node) and custom node templates, unless Ultimate exposes them (no slot found). Angular: the whole component is outside scope (DECISION-D).

### B.9 Totals

| Key               | Tier | Visual / behavior cases (ng / vue) | D   | Coverage gaps (cases needing a new or repaired story)            |
| ----------------- | ---- | ---------------------------------- | --- | ---------------------------------------------------------------- |
| carousel          | A    | 7 / 7                              | 2   | vertical, rtl                                                    |
| galleria          | A    | 7 / 7                              | 7   | no-thumbnails, fullscreen, fullscreen-close; Angular story width |
| image             | B    | 5 / 5                              | 2   | —                                                                |
| imagecompare      | B    | 4 / 4                              | 1   | rtl; default story broken                                        |
| dataview          | B    | 5 / 4 (loading: no Vue oracle)     | 2   | grid, paginator, empty, loading; Angular story broken            |
| orderlist         | B    | 6 / 4                              | 2   | filter (Angular)                                                 |
| picklist          | B    | 5 / 4                              | 2   | filter (Angular)                                                 |
| organizationchart | B    | — / 4                              | 2   | select, multi, toggle                                            |
| **Total**         |      | **39 / 39**, 43 definitions        | 20  | 18 case needs across 7 components                                |

---

## C. Prime source and style analysis (diagnostic)

### C.1 Shared PrimeUIX styling (`@primeuix/styles` 2.0.3)

| Key               | ≈ rule groups | `dt()` refs | `:dir(rtl)` | Notes                                                                                                    |
| ----------------- | ------------- | ----------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| carousel          | 17            | 18          | 2           | Indicator, nav button, vertical rules                                                                    |
| galleria          | 65            | 90          | 5           | Largest set: thumbnails carousel, indicators (inset/positions), caption, full-screen mask, navigators    |
| image             | 14            | 35          | 0           | Preview mask/icon, toolbar, actions; the dimming comes from the base `.p-overlay-mask` role              |
| imagecompare      | 12            | 41          | 1           | `aspect-ratio: 16/9`; `img + img` clip with `dt('imagecompare.scope.x', '50%')`; slider thumb per engine |
| dataview          | 7             | 26          | 0           | Header/content/footer/paginator borders and paddings; loading overlay (`p-overlay-mask` role)            |
| orderlist         | 3             | 2           | 0           | Root flex and controls column; the list styling comes from Listbox                                       |
| organizationchart | 18            | 42          | 0           | Table layout, connector lines, node, toggle button, selectable/selected states                           |
| picklist          | 4             | 2           | 0           | Root flex, controls, list containers; list styling from Listbox                                          |

Every component also depends on the base layer (`box-sizing`, `.p-overlay-mask`) — GAP-098 and X-5.

### C.2 PrimeNG-specific (beyond the shared styles)

- **OrderList:** extra CSS layer ("For PrimeNG": `.p-orderlist-controls-right .p-orderlist-controls { order: 2 }`) and the `controlsPosition` feature (`p-orderlist-controls-left/right`) — PrimeNG-only ✅.
- **OrderList, PickList:** native `<button pButton>` controls (directive) instead of a Button component; PickList also wraps its lists in `p-listbox` ✅.
- **Carousel:** `<p-button>` host elements for prev/next ✅.
- **ImageCompare:** writes inline `clip-path` on the second image in `onSlide` (overrides the CSS rule; handles RTL in JS) ✅.
- **DataView:** loading overlay (`p-dataview-loading`, `-loading-overlay p-overlay-mask`, `-loading-icon`) ✅; `p-paginator` component.
- **Image:** `previewImageSrc` (showcase `previewimagesource`) ✅.
- **Galleria/Carousel/OrderList/PickList:** runtime `<style>` injection (`createStyle`) for responsive item `flex` bases and breakpoints; `[ngStyle]` inline styles ✅.

### C.3 PrimeVue-specific

- **ImageCompare:** sets the `imagecompare.scope.x` CSS variable (`setCSSProperty`), so the shared CSS rule does the clipping ✅.
- **DataView:** no loading rendering; `empty` slot; `DVPaginator` ✅.
- **OrderList, PickList:** `<Button>` components and `<Listbox>` ✅.
- **Galleria/Image:** mask adds `p-overlay-mask-enter-active` ✅; inline `:style` for container/preview transforms.
- **Carousel/Galleria/OrderList/PickList:** runtime `<style>` injection as in PrimeNG ✅.

### C.4 Component/runtime behavior to compare

Carousel and Galleria navigation and active states; Image preview open/zoom/rotate/close and focus return; ImageCompare slider; OrderList/PickList selection, move and transfer; OrganizationChart selection and collapse. Galleria/Image full-screen overlays carry the overlay-mask role (X-5). The runtime-styling roles of X-4 (inline styles, injected `<style>`, runtime variables) apply to Carousel, Galleria, ImageCompare, OrderList and PickList.

### C.5 Ultimate-specific adaptation requirements (for the Spec)

- **Keys (ADR-051):** `image-compare`, `data-view`, `order-list`, `organization-chart`, `pick-list` register under hyphenated keys today.
- **Selector mapping (D-G3-1/2):** class names differ (`u-image-compare`, `u-data-view`, `u-order-list`, `u-pick-list`, `u-organization-chart`; Carousel `content-inner` vs `content-container`; Galleria `item-wrapper`/`item-container` vs `items-container`/`items`).
- **Structural differences** (§A.1): ImageCompare `span` wrapper; DataView item wrappers; OrganizationChart flex vs table; Galleria thumbnail list vs thumbnail carousel; PickList control placement; Angular Galleria/Carousel host elements.
- **Feature exclusions (D-G3-3)** follow the D rows of §B.

---

## D. Verification-first risks (what the rendered comparison must check)

| Risk                              | Where                                                                    | What to verify                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Global/base styles (GAP-098)      | all                                                                      | Item, thumbnail and list sizes with padding/borders; report `box-sizing` as explanatory                                                     |
| Overlay-mask role (X-5)           | Image preview, Galleria full screen, DataView loading (Angular)          | Mask dimming present. Unlike the Drawer there is no ruling that removes it                                                                  |
| Framework-specific CSS/DOM        | OrderList, PickList, ImageCompare, DataView, Carousel                    | PrimeNG and PrimeVue each against their own Ultimate framework; never substitute                                                            |
| Button component vs native button | Carousel nav, OrderList/PickList controls, Image actions, Galleria nav   | Size, shape, icon vs text. Same pattern as GAP-099 D3/D4; Ultimate controls are text "Move …" buttons ✅ while Prime uses icon-only buttons |
| Host elements / projected content | Angular Galleria, Carousel, ImageCompare (`[left]`/`[right]` projection) | Host `display: inline` swallows story sizing ✅ (Galleria `max-width` has no effect); projected images                                      |
| `inheritAttrs` on Vue roots       | Vue ImageCompare                                                         | Consumer `style`/`class` reach the root ✅ (today the `width: 20rem` is dropped; root 57 px)                                                |
| Sizing / responsive image         | Image, ImageCompare, Galleria                                            | `aspect-ratio`, width attribute, natural image size — needs fixed local images                                                              |
| Hidden / in-flow elements         | Galleria thumbnails, Carousel indicators, Image preview mask             | Display and footprint when hidden; preview mask visible only on hover                                                                       |
| Positioning / overflow            | Carousel viewport, Galleria items, OrganizationChart                     | Item translation, clipping, connector placement                                                                                             |
| Focus behavior                    | Carousel/Galleria nav, Image preview, OrderList/PickList options         | Focus ring, focus move into overlays and return                                                                                             |
| RTL                               | Carousel (2 rules), Galleria (5), ImageCompare (1)                       | Mirrored icons, order and clip                                                                                                              |
| Disabled states                   | Carousel prev at start, OrderList/PickList controls without selection    | Disabled appearance (X-3b) and no interaction                                                                                               |
| Animation / timers                | Carousel/Galleria autoplay and transitions, Image preview                | Freeze timers (Playwright clock) and wait for motion (X-6)                                                                                  |
| Default-value differences         | Galleria `showItemNavigators` (Prime false, Ultimate true) ✅            | Set explicitly in each case; the default difference is a separate observation                                                               |
| Composite components              | OrderList/PickList (Listbox), DataView (Paginator)                       | The composed Listbox/Paginator are outside G3-E; differences there are classified against their own components, not fixed here              |
| Vue option checkboxes             | Vue OrderList/PickList                                                   | The visible 13 × 13 inputs in options ✅ versus Prime's plain options 🔶                                                                    |
| No oracle                         | Vue DataView `loading`                                                   | PrimeVue renders nothing for loading; the Ultimate Vue feature has no Prime reference                                                       |

These are verification targets, not defects.

---

## E. Implementation boundary (recommended batches)

Verification-first order for each batch: harness cases → before-port Prime comparison → classify → port only what A/B need → re-run once → closeout.

| Batch | Components                         | Why together                                                                                                                          | Notes                                                                           |
| ----- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| E-0   | Verification fixtures (no product) | Local deterministic images in the reference apps and the media stories; the necessary stories of §6, after your ruling; frozen timers | Precondition for E-1/E-2. Story work only where authorized                      |
| E-1   | Image, ImageCompare (B)            | Small, overlay-mask and runtime-variable patterns; good first batch                                                                   | ImageCompare `span` wrapper and runtime variable mechanism need a Spec decision |
| E-2   | Carousel, Galleria (A)             | Shared navigation/indicator/thumbnail patterns; largest rule sets                                                                     | Galleria is Ultimate-specific in its thumbnails; scope decision G3E-5           |
| E-3   | OrderList, PickList (B)            | Shared Listbox composition and controls pattern                                                                                       | Framework-specific: PrimeNG `pButton` + filter/drag; PrimeVue `<Button>`        |
| E-4   | DataView, OrganizationChart (B)    | Both Ultimate-specific structures; OrganizationChart Vue-only                                                                         | Needs the G3E-5 scope decision first                                            |

Each batch can have its own short Spec section and Plan tasks; a single G3-E Spec with these five sections is recommended (as G3-C was split into C1/C2 only after research). Size gate and X-rulings apply per batch.

---

## 6. Missing stories that are actually necessary

Only cases that are canonical for the tier and exercise a supported Ultimate feature:

| Component         | Story needed                                                                 | Why necessary                                                  |
| ----------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| carousel          | vertical; RTL                                                                | Orientation is a main variant (Tier A); upstream has RTL rules |
| galleria          | without thumbnails; full screen (open, closable)                             | Full screen is an overlay with mask (Tier A)                   |
| imagecompare      | repaired default (working images, Vue width); RTL                            | The only story renders nothing comparable today                |
| dataview          | repaired default (Angular NG0950); grid; paginator; empty; loading (Angular) | Layout and paginator are DataView's main variants              |
| orderlist         | Angular filter                                                               | PrimeNG canonical case; Angular supports `filterBy`            |
| picklist          | Angular filter                                                               | Same                                                           |
| organizationchart | single selection; multiple selection; collapsible                            | Selection and collapse are its main states                     |

Not necessary (recorded as coverage gaps only): Galleria autoplay, Carousel autoplay timing, Image templates, PickList/OrderList item templates, responsive breakpoints.

---

## 7. Decisions requested

1. **G3E-1 — Deterministic images.** Use local image fixtures (same files) in the reference apps and in the media stories (Carousel content is text; Galleria, Image, ImageCompare use images). Today ImageCompare's CDN images fail to load in both frameworks ✅, and U2 showed CDN images are not reproducible. Recommended: commit a few small images once and point the stories at them (story change).
2. **G3E-2 — Story authorization.** Approve the §6 list (new stories and the two repairs) as part of G3-E E-0, or a subset.
3. **G3E-3 — Story repairs vs product defects.** The Angular DataView NG0950 and the Vue ImageCompare dropped `style` may be story wiring or product behavior (`inheritAttrs`; required input). Recommended: classify them in E-0 by the Playbook (harness/story artifact vs A) before any change.
4. **G3E-4 — Timers.** Freeze autoplay/transition timers with Playwright's clock in the harness (harness-only).
5. **G3E-5 — Ultimate-specific structures** (OrganizationChart table vs flex, DataView item wrappers, Galleria thumbnail list vs carousel). Options: (a) target full rendered parity, allowing narrow DOM exceptions under X-2 by ruling; (b) port CSS onto the existing DOM, compare, and record the remainder as C; (c) exclude the structural parts from G3-E (D-G3-8 continues). Recommended: (b), deciding per finding after the before-port comparison.
6. **G3E-6 — Batches.** Approve E-0..E-4 and their order (§E).
7. **G3E-7 — No-oracle features.** Vue DataView `loading` has no PrimeVue rendering. Recommended: record as "no oracle" (not D, not verified) and keep Ultimate's behavior.
