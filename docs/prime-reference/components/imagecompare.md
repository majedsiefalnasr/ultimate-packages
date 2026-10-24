# ImageCompare

**Category:** Media · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5

## 1. Summary

ImageCompare stacks two images in one box and puts a native range input over them; dragging the input clips the second image so that a vertical split line reveals the first image on one side and the second on the other. The images come from two application templates (`left`, `right`); the component itself only owns the root box and the slider. It has no events and no value binding (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`).

## 2. Names & status

- Canonical name: **ImageCompare** in PrimeNG and PrimeVue; no legacy alias, no deprecation.
- Showcase menu: `ImageCompare` under **Media** in PrimeNG and PrimeVue (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`); PrimeVue metadata lists it in the `media` group (`primevue-4.5.5:packages/metadata/src/components/index.ts`).
- PrimeReact: N/A — not shipped in primereact-10.9.9. There is no `components/lib/imagecompare/` or `components/doc/imagecompare/` folder, and the PrimeReact Media menu lists only Carousel, Galleria and Image (`primereact-10.9.9:components/layout/menu.json`).
- Deprecated members: none.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { ImageCompareModule } from 'primeng/imagecompare'` (showcase), or the standalone `ImageCompare` class (`primeng-21.1.9:apps/showcase/doc/imagecompare/import-doc.ts`).
- Selectors: `p-imageCompare`, `p-imagecompare`, `p-image-compare`; standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, `hostDirectives: [Bind]` (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`).
- Source: `primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`; style `primeng-21.1.9:packages/primeng/src/imagecompare/style/imagecomparestyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/imagecompare/imagecompare.types.ts`.
- Exports: `ImageCompare`, `ImageCompareModule`, `ImageCompareStyle`, `ImageCompareClasses` (`primeng-21.1.9:packages/primeng/src/imagecompare/public_api.ts`); types `ImageComparePassThroughOptions`, `ImageComparePassThrough`, `ImageCompareTemplates` from `primeng/types/imagecompare` (`primeng-21.1.9:packages/primeng/src/types/imagecompare/public_api.ts`).

**PrimeVue 4.5.5**

- Import: `import ImageCompare from 'primevue/imagecompare'` (`primevue-4.5.5:apps/showcase/doc/imagecompare/ImportDoc.vue`); also re-exported from the root barrel (`primevue-4.5.5:packages/primevue/src/index.js`).
- Tag: `<ImageCompare>`.
- Source: `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`, props in `primevue-4.5.5:packages/primevue/src/imagecompare/BaseImageCompare.vue`, types `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.d.ts`, style `primevue-4.5.5:packages/primevue/src/imagecompare/style/ImageCompareStyle.js`.
- Package entry: `primevue-4.5.5:packages/primevue/src/imagecompare/package.json`.

**PrimeReact 10.9.9:** N/A — not shipped (see Names & status).

## 4. Anatomy

| Part        | PT section              | Element                 | Content                                                   |
| ----------- | ----------------------- | ----------------------- | --------------------------------------------------------- |
| Root        | `root` (NG also `host`) | `div` (PrimeVue) / host | Relative, `overflow: hidden`, `aspect-ratio: 16 / 9` box. |
| Left image  | —                       | application content     | `left` template output, rendered first.                   |
| Right image | —                       | application content     | `right` template output; the image that gets clipped.     |
| Slider      | `slider`                | `input type="range"`    | `min="0" max="100" value="50"`; drives the clip position. |

The slider handler takes `event.target.previousElementSibling` as the image to clip, so the right template is expected to render a single `<img>` immediately before the input; the structural CSS also targets `img + img` (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`, `@primeuix/styles-2.0.3:dist/imagecompare/index.mjs`). PT keys: `primeng-21.1.9:packages/primeng/src/types/imagecompare/imagecompare.types.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.d.ts`.

## 5. API highlights

| Prop             | PrimeNG                                                                            | PrimeVue                 |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| `tabindex`       | `@Input() tabindex: number \| undefined` (JSDoc `@defaultValue 0`; no initializer) | `Number`, default `0`    |
| `ariaLabel`      | `@Input() ariaLabel: string \| undefined`                                          | `String`, default `null` |
| `ariaLabelledby` | `@Input() ariaLabelledby: string \| undefined`                                     | `String`, default `null` |

- Templates / slots: `left` and `right`. PrimeNG accepts `#left`/`#right` content children or `pTemplate="left"`/`pTemplate="right"`, typed `TemplateRef<void>` (no context) (`primeng-21.1.9:packages/primeng/src/types/imagecompare/imagecompare.types.ts`). PrimeVue slots `left(): VNode[]`, `right(): VNode[]` (`primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.d.ts`).
- Inherited: `dt`, `pt`, `ptOptions`, `unstyled` (PrimeNG as signal inputs from `BaseComponent`, per the catalog `docs/prime-reference/catalog/primeng.json`).
- Events: none (`ImageCompareEmitsOptions` is empty). Methods: none public. There is no prop to set or read the split position; the slider always starts at `50`.
- Source vs typings:
  - PrimeNG binds `tabindex` on the host; with no initializer the attribute is absent unless set. PrimeVue declares `tabindex` but never binds it in the template, so the prop has no effect (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`).
  - The JSDoc descriptions of `ariaLabel` ("Identifier of the underlying input element") and `ariaLabelledby` ("a string value that labels…") are swapped relative to their meaning in both frameworks (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.d.ts`).

## 6. Usage guidance

- **Basic:** put one `<img>` in each of the `left` and `right` templates; size the container with `class`/`style` (`primeng-21.1.9:apps/showcase/doc/imagecompare/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/imagecompare/BasicDoc.vue`).
- **Responsive:** apply responsive width utilities to the component itself to change its size per breakpoint (`primeng-21.1.9:apps/showcase/doc/imagecompare/responsive-doc.ts`, `primevue-4.5.5:apps/showcase/doc/imagecompare/ResponsiveDoc.vue`).
- No services or providers are needed.

## 7. Accessibility

- Both accessibility docs say the component relies on a native range input and that `aria-labelledby` / `aria-label` describe it. The keyboard table is the native range behaviour: Tab focuses; Left/Up arrow decrement; Right/Down arrow increment; Home sets the minimum; End the maximum; Page Up/Page Down change by 10 steps (`primeng-21.1.9:apps/showcase/doc/imagecompare/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/imagecompare/AccessibilityDoc.vue`).
- Source vs docs: `ariaLabel` and `ariaLabelledby` are rendered on the root (`div` in PrimeVue, the host in PrimeNG), not on the `<input type="range">`, and the root has no role, so the native slider that receives focus carries no accessible name unless it is given one through `pt.slider` (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`).
- The docs example uses `id="image_label"` with `aria-labelledby="image-label"` (ids do not match) and calls the component "ImageComponent" (same files).

## 8. Theming

- Style classes: `p-imagecompare` (root), `p-imagecompare-slider` (slider); enums `ImageCompareClasses.root` / `.slider` (`primeng-21.1.9:packages/primeng/src/imagecompare/style/imagecomparestyle.ts`, `primevue-4.5.5:packages/primevue/src/imagecompare/style/ImageCompareStyle.js`, catalog `docs/prime-reference/catalog/primevue.json` `imagecomparestyle`).
- PT sections: `root`, `slider` (PrimeNG also applies `host` via `ptms(['host', 'root'])`); PrimeVue adds `hooks`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/imagecompare/index.mjs` — absolute full-size images; the second image is clipped with `clip-path: polygon(...)` built from the scoped token `imagecompare.scope.x` (default `50%`), with a mirrored polygon under `:dir(rtl)`; the range thumb (WebKit and Mozilla) is styled from handle tokens and grows on hover.
- Clip mechanics differ: PrimeVue writes the `imagecompare.scope.x` CSS variable on the image (`setCSSProperty(image, $dt('imagecompare.scope.x').name, ...)`), so the shared CSS does the clipping; PrimeNG writes `image.style.clipPath` inline and tracks RTL itself (`closest('[dir="rtl"]')` plus a `MutationObserver` on `<html dir>`) (`primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`, `primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`).
- Design tokens: `ImageCompareDesignTokens` with one section `handle` (`size`, `hoverSize`, `background`, `hoverBackground`, `borderColor`, `hoverBorderColor`, `borderWidth`, `borderRadius`, `transitionDuration`, `focusRing{width, style, color, offset, shadow}`) (`@primeuix/themes-2.0.3:types/imagecompare/index.d.ts`); 14 tokens in the table (`@primeuix/themes-2.0.3:tokens/index.mjs`); Aura values (for example `size: '15px'`, `hoverSize: '30px'`, `borderRadius: '50%'`) in `@primeuix/themes-2.0.3:dist/aura/imagecompare/index.mjs`. The CSS also reads `imagecompare.handle.border.style`, which is not a declared token.
- PrimeReact: N/A.

## 9. Relationships

- Embeds no other Prime component; uses a plain native range input rather than the Slider component.
- Related: Image (single image with preview), Galleria (multi-image viewer).

## 10. Dependencies

- PrimeNG: `@angular/common` (`isPlatformBrowser`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/imagecompare` (`primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`, `primeng-21.1.9:packages/primeng/src/imagecompare/style/imagecomparestyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styled` (`$dt`), `@primeuix/utils/dom` (`setCSSProperty`), `@primeuix/styles/imagecompare` (`primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`, `primevue-4.5.5:packages/primevue/src/imagecompare/style/ImageCompareStyle.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect         | PrimeNG                            | PrimeVue                                | PrimeReact |
| -------------- | ---------------------------------- | --------------------------------------- | ---------- |
| Shipped        | Yes                                | Yes                                     | No         |
| Selector / tag | `p-imagecompare` (+ 2 aliases)     | `<ImageCompare>`                        | N/A        |
| Templates      | `#left` / `#right` or `pTemplate`  | `left` / `right` slots                  | N/A        |
| `tabindex`     | Bound on host; no runtime default  | Declared (default `0`) but not rendered | N/A        |
| Clip mechanism | Inline `clip-path` from TS         | CSS variable `imagecompare.scope.x`     | N/A        |
| RTL detection  | `MutationObserver` on `<html dir>` | CSS `:dir(rtl)`                         | N/A        |
| PT sections    | `host`, `root`, `slider`           | `root`, `slider`, `hooks`               | N/A        |
| Design tokens  | `@primeuix/themes`                 | `@primeuix/themes`                      | N/A        |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/imagecompare/imagecompare.ts`
- `primeng-21.1.9:packages/primeng/src/imagecompare/style/imagecomparestyle.ts`
- `primeng-21.1.9:packages/primeng/src/imagecompare/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/imagecompare/imagecompare.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/imagecompare/public_api.ts`
- `primeng-21.1.9:apps/showcase/doc/imagecompare/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/imagecompare/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/imagecompare/responsive-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/imagecompare/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.vue`
- `primevue-4.5.5:packages/primevue/src/imagecompare/BaseImageCompare.vue`
- `primevue-4.5.5:packages/primevue/src/imagecompare/ImageCompare.d.ts`
- `primevue-4.5.5:packages/primevue/src/imagecompare/style/ImageCompareStyle.js`
- `primevue-4.5.5:packages/primevue/src/imagecompare/package.json`
- `primevue-4.5.5:apps/showcase/doc/imagecompare/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/imagecompare/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/imagecompare/ResponsiveDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/imagecompare/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/imagecompare/index.mjs`
- `@primeuix/themes-2.0.3:types/imagecompare/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/imagecompare/index.mjs`
