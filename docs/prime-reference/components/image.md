# Image

**Category:** Media · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Image renders a native `<img>` inside a `span` and, when `preview` is on, adds a hover overlay button that opens a full-screen modal mask. The mask shows the image with a toolbar to rotate it left or right in 90° steps, zoom in or out in 0.1 steps between 0.5 and 1.5, and close the preview. Transform state resets every time the preview closes. All three frameworks ship it with the same overall behaviour; they differ in how the preview source is chosen, how the overlay is attached, and in PrimeReact's extra download action (`primeng-21.1.9:packages/primeng/src/image/image.ts`, `primevue-4.5.5:packages/primevue/src/image/Image.vue`, `primereact-10.9.9:components/lib/image/Image.js`).

## 2. Names & status

- Canonical name: **Image** in all three frameworks; listed under **Media** in each showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`) and in the PrimeVue metadata `media` group (`primevue-4.5.5:packages/metadata/src/components/index.ts`).
- Deprecated members:
  - PrimeNG: `styleClass` (since v20.0.0, use `class`); `showTransitionOptions` / `hideTransitionOptions` (since v21.0.0, use `motionOptions`) (`primeng-21.1.9:packages/primeng/src/image/image.ts`).
  - PrimeVue: prop `indicatorIcon` (since v4.0, use `previewIcon`); slot `indicatoricon` (since v4.0, use `previewicon`); slot `preview` (since v4.0, use `original`) (`primevue-4.5.5:packages/primevue/src/image/Image.d.ts`).
  - PrimeReact: prop `template` (since v9, use `indicatorIcon`) (`primereact-10.9.9:components/lib/image/image.d.ts`).

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { ImageModule } from 'primeng/image'` (`primeng-21.1.9:apps/showcase/doc/Image/import-doc.ts`), or the standalone `Image` class.
- Selector: `p-image`; standalone, `ChangeDetectionStrategy.OnPush`, `hostDirectives: [Bind]`, host classes `cx('root')` plus `styleClass`.
- Source: `primeng-21.1.9:packages/primeng/src/image/image.ts`; style `primeng-21.1.9:packages/primeng/src/image/style/imagestyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/image/image.types.ts`.
- Exports: `Image`, `ImageModule`, `ImageStyle`, `ImageClasses`; types `ImagePassThroughOptions`, `ImagePassThrough`, `ImageTemplates`, `ImagePreviewTemplateContext`, `ImageImageTemplateContext` (`primeng-21.1.9:packages/primeng/src/image/public_api.ts`, `primeng-21.1.9:packages/primeng/src/types/image/public_api.ts`).
- Note: the showcase doc folder is `apps/showcase/doc/Image/` with a capital `I`, unlike the other Media folders.

**PrimeVue 4.5.5**

- Import: `import Image from 'primevue/image'` (`primevue-4.5.5:apps/showcase/doc/image/ImportDoc.vue`).
- Tag: `<Image>`; `inheritAttrs: false`, so undeclared attributes (`src`, `alt`, `width`, …) go to the inner `<img>`, while `class` / `style` are declared props that go to the root `span`.
- Source: `primevue-4.5.5:packages/primevue/src/image/Image.vue`, props in `primevue-4.5.5:packages/primevue/src/image/BaseImage.vue`, types `primevue-4.5.5:packages/primevue/src/image/Image.d.ts`, style `primevue-4.5.5:packages/primevue/src/image/style/ImageStyle.js`.

**PrimeReact 10.9.9**

- Import: `import { Image } from 'primereact/image'` (`primereact-10.9.9:components/doc/image/importdoc.js`).
- Component: `React.memo(React.forwardRef(...))`; declared as a class in typings with methods `show()`, `hide()`, `getElement(): HTMLSpanElement | null`, `getImage(): HTMLImageElement | null` (`primereact-10.9.9:components/lib/image/image.d.ts`).
- Source: `primereact-10.9.9:components/lib/image/Image.js`; defaults, classes and CSS in `primereact-10.9.9:components/lib/image/ImageBase.js`.

## 4. Anatomy

| Part                | PrimeNG PT                                 | PrimeVue PT                           | PrimeReact PT                         | Element / notes                                            |
| ------------------- | ------------------------------------------ | ------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| Root                | `root`                                     | `root`                                | `root`                                | `span`                                                     |
| Image               | `image`                                    | `image`                               | `image`                               | `img` (PrimeReact renders it only when `src` is set)       |
| Preview button      | `previewMask`                              | `previewMask`                         | `button`                              | `button` overlay, visible on hover / focus                 |
| Preview icon        | `previewIcon`                              | `previewIcon`                         | `icon`                                | Eye icon by default                                        |
| Mask                | `mask`                                     | `mask`                                | `mask`                                | `div role="dialog"`, `aria-modal`, focus-trapped (NG, Vue) |
| Toolbar             | `toolbar`                                  | `toolbar`                             | `toolbar`                             | Action buttons                                             |
| Download action     | —                                          | —                                     | `downloadButton`, `downloadIcon`      | PrimeReact only, when `downloadable`                       |
| Rotate right / left | `rotateRightButton`, `rotateLeftButton`    | + `rotateRightIcon`, `rotateLeftIcon` | + `rotateRightIcon`, `rotateLeftIcon` | `button`                                                   |
| Zoom out / in       | `zoomOutButton`, `zoomInButton`            | + `zoomOutIcon`, `zoomInIcon`         | + `zoomOutIcon`, `zoomInIcon`         | `button`, disabled at the limit                            |
| Close               | `closeButton`                              | + `closeIcon`                         | + `closeIcon`                         | `button`, receives initial focus                           |
| Preview container   | —                                          | `originalContainer`                   | `previewContainer`                    | Animated wrapper                                           |
| Preview image       | `original`                                 | `original`                            | `preview`                             | Transformed `img`                                          |
| Animation           | `motion` (also reads untyped `maskMotion`) | `transition`, `hooks`                 | `transition`, `hooks`                 |                                                            |

PT sources: `primeng-21.1.9:packages/primeng/src/types/image/image.types.ts`, `primevue-4.5.5:packages/primevue/src/image/Image.d.ts`, `primereact-10.9.9:components/lib/image/image.d.ts`.

## 5. API highlights

**Props / inputs**

| Concern                 | PrimeNG                                                                                                                                                                                         | PrimeVue                                      | PrimeReact                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Enable preview          | `preview: boolean` = `false`                                                                                                                                                                    | `preview: Boolean` = `false`                  | `preview: boolean` = `false`                                                                  |
| Image source            | `src: string \| SafeUrl`, `srcSet`, `sizes`                                                                                                                                                     | `src` via attrs (typed `src?: string`)        | `src: string` = `null`                                                                        |
| Separate preview source | `previewImageSrc`, `previewImageSrcSet`, `previewImageSizes`                                                                                                                                    | — (preview reuses `$attrs.src`)               | `zoomSrc` (falls back to `src`)                                                               |
| Native img attrs        | `alt`, `width`, `height`, `loading: 'lazy' \| 'eager'`                                                                                                                                          | any attr via `$attrs`                         | `alt`, `width`, `height`, `loading`, `crossOrigin`, `referrerPolicy`, `useMap`                |
| Inner img styling       | `imageClass`, `imageStyle`                                                                                                                                                                      | `imageClass`, `imageStyle`                    | `imageClassName`, `imageStyle`                                                                |
| Preview button attrs    | —                                                                                                                                                                                               | `previewButtonProps`                          | —                                                                                             |
| Preview icon            | `indicator` template                                                                                                                                                                            | `previewIcon: String` (class), slot           | `indicatorIcon: IconType`                                                                     |
| Toolbar icons           | templates                                                                                                                                                                                       | slots                                         | `rotateRightIcon`, `rotateLeftIcon`, `zoomInIcon`, `zoomOutIcon`, `closeIcon`, `downloadIcon` |
| Force-disable zoom      | —                                                                                                                                                                                               | `zoomInDisabled`, `zoomOutDisabled` (`false`) | —                                                                                             |
| Download                | —                                                                                                                                                                                               | —                                             | `downloadable` = `false`                                                                      |
| Escape closes           | always                                                                                                                                                                                          | always (when focus is inside the mask)        | `closeOnEscape` = `true`                                                                      |
| Overlay target          | `appendTo` signal input (default `undefined` → `config.overlayAppendTo()`; JSDoc says `'self'`)                                                                                                 | always `Portal` (body)                        | always `document.body`                                                                        |
| Animation               | `motionOptions`, `maskMotionOptions`; deprecated `showTransitionOptions` / `hideTransitionOptions` = `'150ms cubic-bezier(0, 0, 0.2, 1)'`; unused `modalEnterAnimation` / `modalLeaveAnimation` | `pt.transition`                               | `pt.transition`; `CSSTransition` timeout 150 / 150 ms                                         |

**Events**

| PrimeNG                             | PrimeVue               | PrimeReact                              |
| ----------------------------------- | ---------------------- | --------------------------------------- |
| `onShow` (emits `{}`)               | `show()`               | `onShow()`                              |
| `onHide` (emits `{}`)               | `hide()`               | `onHide()`                              |
| `onImageError: EventEmitter<Event>` | `error()` (no payload) | `onError` (native, passed to the `img`) |

**Templates / slots**

- PrimeNG (`#name` or `pTemplate`; an unknown `pTemplate` type is treated as `indicator`): `indicator`, `rotaterighticon`, `rotatelefticon`, `zoomouticon`, `zoominicon`, `closeicon`, `preview` (context `ImagePreviewTemplateContext { class, style, previewCallback }`), `image` (context `ImageImageTemplateContext { errorCallback(event) }`).
- PrimeVue: `previewicon`, `indicatoricon` (deprecated), `refresh`, `undo`, `zoomout`, `zoomin`, `close`, `image` (`{ class, style, errorCallback }`), `original` (`{ class, style, previewCallback }`), `preview` (deprecated alias of `original`).
- PrimeReact: no render props besides the deprecated `template` (replaces the preview icon content).

**Source vs typings / docs**

- PrimeNG: `appendTo` is documented `@defaultValue 'self'` but initialised `undefined`, so the global `overlayAppendTo` setting decides the target (`primeng-21.1.9:packages/primeng/src/image/image.ts`).
- PrimeVue: mask-click detection looks for `data-pc-section-group="action"` while the toolbar buttons set `data-pc-group-section`; buttons still keep the mask open because each handler sets an internal `previewClick` flag (`primevue-4.5.5:packages/primevue/src/image/Image.vue`).
- PrimeVue template doc uses the deprecated `preview` slot and calls `slotProps.onClick`, which is not in the slot scope (`previewCallback` is) (`primevue-4.5.5:apps/showcase/doc/image/TemplateDoc.vue`).
- PrimeReact: `decoding` is in `defaultProps` but is neither typed nor forwarded to the `img`; being a default prop it is also stripped from pass-through attributes (`primereact-10.9.9:components/lib/image/ImageBase.js`, `primereact-10.9.9:components/lib/image/Image.js`).

## 6. Usage guidance

- **Basic:** use it like a native `img` with `src`, `alt`, `width`; PrimeNG's basic doc points to Galleria for multiple images (`primeng-21.1.9:apps/showcase/doc/Image/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/image/BasicDoc.vue`, `primereact-10.9.9:components/doc/image/basicdoc.js`).
- **Preview:** add `preview` to get the modal with rotate and zoom actions (`primeng-21.1.9:apps/showcase/doc/Image/preview-doc.ts`, `primevue-4.5.5:apps/showcase/doc/image/PreviewDoc.vue`, `primereact-10.9.9:components/doc/image/previewdoc.js`).
- **Different preview source:** show a small image inline and a larger one in the preview — PrimeNG `previewImageSrc` (`primeng-21.1.9:apps/showcase/doc/Image/previewimagesource-doc.ts`; this section exists but is not registered on the page, `primeng-21.1.9:apps/showcase/pages/image/index.ts`), PrimeReact `zoomSrc` in the thumbnail section (`primereact-10.9.9:components/doc/image/thumbnaildoc.js`). PrimeVue has no prop for it; use the `original` slot.
- **Template:** replace the preview icon (`indicator` template / `previewicon` slot / `indicatorIcon` prop); PrimeVue also shows replacing the thumbnail and preview images through slots (`primeng-21.1.9:apps/showcase/doc/Image/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/image/TemplateDoc.vue`, `primereact-10.9.9:components/doc/image/templatedoc.js`).
- **Programmatic:** only PrimeReact exposes `show()` / `hide()` through the ref.

## 7. Accessibility

- Preview button: native `button` with `aria-label` from the locale `aria.zoomImage` key. PrimeVue lets authors override its attributes through `previewButtonProps` (`primevue-4.5.5:apps/showcase/doc/image/AccessibilityDoc.vue`).
- Mask: `role="dialog"` with `aria-modal`; toolbar buttons are labelled from locale keys `aria.rotateRight`, `aria.rotateLeft`, `aria.zoomIn`, `aria.zoomOut`, `aria.close` (PrimeNG reads `config.translation.aria`, PrimeVue `config.locale.aria`, PrimeReact `localeOption('aria')`).
- Keyboard (all three docs): Tab moves through the toolbar; Enter / Space activate a button; Escape closes the preview. The close button gets initial focus when the preview opens (`primeng-21.1.9:apps/showcase/doc/Image/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/image/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/image/accessibilitydoc.js`).
- Focus handling: PrimeNG and PrimeVue trap focus inside the mask (`pFocusTrap` / `v-focustrap`); PrimeReact has no focus trap. After Escape, focus returns to the preview button (25 ms delay in PrimeNG, 200 ms in PrimeVue and PrimeReact). PrimeNG additionally closes on any document-level Escape; PrimeReact routes Escape through `useGlobalOnEscapeKey` with priority `ESC_KEY_HANDLING_PRIORITIES.IMAGE` (`primereact-10.9.9:components/lib/image/Image.js`).
- Gaps: PrimeReact's download button has no `aria-label`. The PrimeReact accessibility doc mentions `previewButtonProps`, which PrimeReact does not have (copied from the PrimeVue text) (`primereact-10.9.9:components/doc/image/accessibilitydoc.js`, `primereact-10.9.9:components/lib/image/image.d.ts`).
- Body scroll is blocked while the preview is open in all three.

## 8. Theming

- Style classes (PrimeNG / PrimeVue): `p-image p-component` (+ `p-image-preview` when previewable), `p-image-preview-mask`, `p-image-preview-icon`, `p-image-mask p-overlay-mask` (PrimeVue adds `p-overlay-mask-enter-active`), `p-image-toolbar`, `p-image-action` with `p-image-rotate-right-button`, `p-image-rotate-left-button`, `p-image-zoom-out-button`, `p-image-zoom-in-button` (+ `p-disabled`), `p-image-close-button`, `p-image-original` (`primeng-21.1.9:packages/primeng/src/image/style/imagestyle.ts`, `primevue-4.5.5:packages/primevue/src/image/style/ImageStyle.js`, catalog `docs/prime-reference/catalog/primevue.json` `imagestyle`).
- PrimeReact classes are the older set: root `p-image p-component` (+ `p-image-preview-container`), button `p-image-preview-indicator`, mask `p-image-mask p-component-overlay p-component-overlay-enter`, actions `p-image-action p-link`, preview `p-image-preview`, icon `p-image-preview-icon`; CSS lives in `ImageBase.js` under `@layer primereact` with `p-image-preview-enter/exit` transition classes (`primereact-10.9.9:components/lib/image/ImageBase.js`). Note `p-image-preview` means the root in NG/Vue but the preview `img` in PrimeReact.
- Animation: PrimeNG uses `pMotion` with `p-overlay-mask-enter-active` / `-leave-active` on the mask and a `p-motion name="p-image-original"` on the preview; PrimeVue uses `<transition name="p-image-original">`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/image/index.mjs` — centred flex mask, overlay button hidden until hover / `:focus-visible`, absolutely positioned toolbar using logical `inset-*` properties and `backdrop-filter: blur(...)`, round action buttons with focus ring.
- Design tokens: `ImageDesignTokens` sections `root` (`transitionDuration`), `preview` (`icon.size`, `mask.background`, `mask.color`), `toolbar` (`position.{left,right,top,bottom}`, `blur`, `background`, `borderColor`, `borderWidth`, `borderRadius`, `padding`, `gap`), `action` (`hoverBackground`, `color`, `hoverColor`, `size`, `iconSize`, `borderRadius`, `focusRing{…}`) (`@primeuix/themes-2.0.3:types/image/index.d.ts`); 26 tokens (`@primeuix/themes-2.0.3:tokens/index.mjs`); Aura uses a translucent white toolbar (`rgba(255,255,255,0.1)`, `blur: '8px'`, `borderRadius: '30px'`) at `top: 1rem`, `right: 1rem` (`@primeuix/themes-2.0.3:dist/aura/image/index.mjs`). PrimeReact: tokens N/A.

## 9. Relationships

- Galleria is the multi-image counterpart (referenced from the PrimeNG basic doc); ImageCompare is the side-by-side variant.
- Shares the modal overlay family (`p-overlay-mask`, `config.zIndex.modal`) with Dialog / Drawer, and the FocusTrap directive (Utilities) in PrimeNG and PrimeVue; PrimeReact uses Portal and shares the global Escape priority stack with Dialog-like overlays.

## 10. Dependencies

- PrimeNG: `primeng/basecomponent`, `primeng/bind`, `primeng/focustrap`, `primeng/motion` (`MotionModule`), `primeng/icons` (Eye, Refresh, Undo, SearchMinus, SearchPlus, Times), `primeng/dom` (`blockBodyScroll`), `primeng/utils` (`ZIndexUtils`), `@primeuix/utils`, `@primeuix/motion` types, `@primeuix/styles/image`.
- PrimeVue: `@primevue/core/basecomponent`, `primevue/focustrap`, `primevue/portal`, `primevue/utils` (`blockBodyScroll`), `@primevue/icons/*`, `@primeuix/utils/dom`, `@primeuix/utils/zindex`, `@primeuix/styles/image`.
- PrimeReact: `../api/Api` (`localeOption`), `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useGlobalOnEscapeKey`, `useMergeProps`, `useUnmountEffect`), `../portal/Portal`, `../icons/*` (Download, Eye, Refresh, SearchMinus, SearchPlus, Times, Undo), `../utils/Utils` (`DomHandler.saveAs`, `ZIndexUtils`, `IconUtils`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect              | PrimeNG                                    | PrimeVue                             | PrimeReact                                     |
| ------------------- | ------------------------------------------ | ------------------------------------ | ---------------------------------------------- |
| Preview source prop | `previewImageSrc` (+ srcset/sizes)         | none (slot)                          | `zoomSrc`                                      |
| Download action     | No                                         | No                                   | `downloadable`                                 |
| Overlay target      | `appendTo` / global default                | Portal                               | `document.body`                                |
| Focus trap          | Yes                                        | Yes                                  | No                                             |
| Escape              | Mask keydown + document listener           | Mask keydown                         | Global Escape stack (`closeOnEscape`)          |
| Zoom limit override | No                                         | `zoomInDisabled` / `zoomOutDisabled` | No                                             |
| Imperative API      | None                                       | None                                 | `show`, `hide`, `getElement`, `getImage`       |
| Error event payload | `Event`                                    | none                                 | native `onError` event                         |
| Class naming        | `p-image-preview-mask`, `p-image-original` | same as PrimeNG                      | `p-image-preview-indicator`, `p-image-preview` |
| Design tokens       | `@primeuix/themes`                         | `@primeuix/themes`                   | N/A (`@layer primereact` CSS)                  |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/image/image.ts`
- `primeng-21.1.9:packages/primeng/src/image/style/imagestyle.ts`
- `primeng-21.1.9:packages/primeng/src/image/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/types/image/image.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/image/public_api.ts`
- `primeng-21.1.9:apps/showcase/pages/image/index.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/preview-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/previewimagesource-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/Image/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:packages/primevue/src/image/Image.vue`
- `primevue-4.5.5:packages/primevue/src/image/BaseImage.vue`
- `primevue-4.5.5:packages/primevue/src/image/Image.d.ts`
- `primevue-4.5.5:packages/primevue/src/image/style/ImageStyle.js`
- `primevue-4.5.5:apps/showcase/doc/image/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/image/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/image/PreviewDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/image/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/image/AccessibilityDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/image/Image.js`
- `primereact-10.9.9:components/lib/image/ImageBase.js`
- `primereact-10.9.9:components/lib/image/image.d.ts`
- `primereact-10.9.9:components/doc/image/importdoc.js`
- `primereact-10.9.9:components/doc/image/basicdoc.js`
- `primereact-10.9.9:components/doc/image/previewdoc.js`
- `primereact-10.9.9:components/doc/image/thumbnaildoc.js`
- `primereact-10.9.9:components/doc/image/templatedoc.js`
- `primereact-10.9.9:components/doc/image/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/image/index.mjs`
- `@primeuix/themes-2.0.3:types/image/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/image/index.mjs`
