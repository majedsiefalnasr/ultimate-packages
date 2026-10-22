# BlockUI

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

BlockUI lays a modal mask over a region or the whole page so the user cannot interact with it while some work is in progress, controlled by a boolean `blocked` input. All three frameworks ship it, but they differ in how the blocked area is chosen: PrimeNG blocks a separate `target` component (or the document when no target is given), while PrimeVue and PrimeReact block their own children or, with `fullScreen`, the document (`primeng-21.1.9:packages/primeng/src/blockui/blockui.ts`, `primevue-4.5.5:packages/primevue/src/blockui/BlockUI.vue`, `primereact-10.9.9:components/lib/blockui/BlockUI.js`).

## 2. Names & status

- Canonical name: **BlockUI**. No legacy aliases; not deprecated.
- PrimeNG `styleClass` is `@deprecated since v20.0.0` (catalog `blockui` in `docs/prime-reference/catalog/primeng.json`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                           | PrimeVue                                    | PrimeReact                                     |
| -------------- | ------------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Import         | `import { BlockUIModule } from 'primeng/blockui'` | `import BlockUI from 'primevue/blockui'`    | `import { BlockUI } from 'primereact/blockui'` |
| Selector / tag | `<p-blockui>` (also `p-blockUI`, `p-block-ui`)    | `<BlockUI>`                                 | `<BlockUI>`                                    |
| Source         | `packages/primeng/src/blockui/blockui.ts`         | `packages/primevue/src/blockui/BlockUI.vue` | `components/lib/blockui/BlockUI.js`            |
| Base           | `BaseComponent<BlockUIPassThrough>`, standalone   | `BaseComponent` via `BaseBlockUI.vue`       | `ComponentBase.extend` (`BlockUIBase.js`)      |

Sources: `primeng-21.1.9:apps/showcase/doc/blockui/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/blockui/ImportDoc.vue`, `primereact-10.9.9:components/doc/blockui/importdoc.js`.

## 4. Anatomy

| Part | Element                                         | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                                              |
| ---- | ----------------------------------------------- | -------------- | --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| Root | host element (PrimeNG) / wrapping `div`         | `host`, `root` | `root`          | `root`            | `p-blockui` (PrimeReact `p-blockui-container`)                                     |
| Mask | host itself (PrimeNG) / generated `div` overlay | —              | `mask`          | `mask`            | `p-blockui-mask`, `p-overlay-mask` (PrimeReact `p-blockui`, `p-component-overlay`) |

- PrimeNG has no separate mask element: the host itself becomes the mask, is shown as `display: flex`, and is moved into the target's blockable element or `document.body` (`primeng-21.1.9:packages/primeng/src/blockui/blockui.ts`).
- PrimeVue creates the mask with `createElement` and appends it to its container, or to `document.body` when `fullScreen` (`primevue-4.5.5:packages/primevue/src/blockui/BlockUI.vue`). PrimeReact renders the mask through `Portal`, to `self` or `document.body` (`primereact-10.9.9:components/lib/blockui/BlockUI.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/blockui/blockui.types.ts`, `primevue-4.5.5:packages/primevue/src/blockui/BlockUI.d.ts`, `primereact-10.9.9:components/lib/blockui/blockui.d.ts`.

## 5. API highlights

| Prop                        | PrimeNG                           | PrimeVue            | PrimeReact          |
| --------------------------- | --------------------------------- | ------------------- | ------------------- |
| `blocked`                   | `boolean` (`false`)               | `boolean` (`false`) | `boolean` (`false`) |
| `target`                    | `any` (a `BlockableUI` component) | —                   | —                   |
| `fullScreen`                | — (no target = document)          | `boolean` (`false`) | `boolean` (`false`) |
| `autoZIndex` / `baseZIndex` | `true` / `0`                      | `true` / `0`        | `true` / `0`        |

- PrimeNG: template `#content` (or any `pTemplate`) renders inside the mask; the target must implement `BlockableUI` (`getBlockableElement()`), otherwise `onAfterViewInit` throws `Target of BlockUI must implement BlockableUI interface` (`primeng-21.1.9:packages/primeng/src/blockui/blockui.ts`, `primeng-21.1.9:packages/primeng/src/api/blockableui.ts`).
- PrimeVue: emits `block` and `unblock`; `default` slot holds the content to block; there is no mask-content slot (`primevue-4.5.5:packages/primevue/src/blockui/BlockUI.d.ts`).
- PrimeReact: `template` renders inside the mask; `containerClassName`/`containerStyle` style the wrapper while `className`/`style` go to the mask; callbacks `onBlocked`, `onUnblocked`; methods `block()`, `unblock()`, `getElement()` (`primereact-10.9.9:components/lib/blockui/BlockUIBase.js`, `primereact-10.9.9:components/lib/blockui/blockui.d.ts`).
- Full API: catalog module `blockui` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — toggle `blocked` to mask a region. The text in all three says the blocked element goes inside BlockUI, but the PrimeNG demo actually renders `<p-blockui [target]="pnl" [blocked]="blockedPanel" />` beside a `<p-panel #pnl>` (`primeng-21.1.9:apps/showcase/doc/blockui/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/blockui/BasicDoc.vue`, `primereact-10.9.9:components/doc/blockui/basicdoc.js`).
- **Document** — block the whole page: in PrimeNG by omitting `target`, in PrimeVue and PrimeReact with `fullScreen` (`primeng-21.1.9:apps/showcase/doc/blockui/document-doc.ts`, `primevue-4.5.5:apps/showcase/doc/blockui/DocumentDoc.vue`, `primereact-10.9.9:components/doc/blockui/documentdoc.js`).
- **Template** (PrimeReact only) — show a spinner or message inside the mask with `template` (`primereact-10.9.9:components/doc/blockui/templatedoc.js`).
- Blocking the document locks body scroll in all three; PrimeVue and PrimeReact also blur the active element, and PrimeReact restores focus to it on unblock.

## 7. Accessibility

- The root carries `aria-busy` reflecting the blocked state; other attributes such as `role` and `aria-live` pass to the root so it can act as a live region. The component has no interactive elements and no keyboard support (`primeng-21.1.9:apps/showcase/doc/blockui/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/blockui/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/blockui/accessibilitydoc.js`).
- The mask only stops pointer input; nothing in the source traps or blocks keyboard focus inside a region-level mask, so tabbable elements under it stay reachable.

## 8. Theming

- Style classes: PrimeNG root `p-blockui p-blockui-mask`, plus `p-blockui-mask-document` without a target, and `p-overlay-mask p-overlay-mask-enter-active`/`-leave-active` added while blocking; PrimeVue root `p-blockui`, mask `p-blockui-mask p-overlay-mask p-overlay-mask-enter-active` (+ `p-blockui-mask-document`) (`primeng-21.1.9:packages/primeng/src/blockui/style/blockuistyle.ts`, `primevue-4.5.5:packages/primevue/src/blockui/style/BlockUIStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/blockui/index.mjs` (relative root, mask radius, absolute vs fixed mask). Mask colour comes from the shared `p-overlay-mask` rules.
- Design tokens (`@primeuix/themes-2.0.3:types/blockui/index.d.ts`): `root.borderRadius` only. Aura values: `@primeuix/themes-2.0.3:dist/aura/blockui/index.mjs`.
- PrimeReact: root `p-blockui-container`, mask `p-blockui p-component-overlay p-component-overlay-enter` (+ `p-blockui-document`, leave class `p-component-overlay-leave`); own CSS in `BlockUIBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/blockui/BlockUIBase.js`, `primereact-10.9.9:components/doc/blockui/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/blockui/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/blockui/pt/index.vue`, `primereact-10.9.9:components/doc/blockui/pt/wireframe.js`.

## 9. Relationships

- PrimeNG BlockUI works with any component implementing `BlockableUI`; in this version those are Accordion, Card, DataView, Fieldset, FileUpload, Panel, Table, Timeline, Toolbar, Tree and TreeTable (classes declaring `implements BlockableUI` under `primeng-21.1.9:packages/primeng/src/`).
- Shares the `p-overlay-mask` styling and modal z-index layer with Dialog and Drawer; often paired with ProgressSpinner as mask content.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils` (`blockBodyScroll`, `unblockBodyScroll`), `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/utils` (`ZIndexUtils`), `@primeuix/styles/blockui` (`primeng-21.1.9:packages/primeng/src/blockui/blockui.ts`).
- PrimeVue: `@primeuix/utils/dom`, `@primeuix/utils/zindex`, `primevue/utils`, `@primevue/core/basecomponent`, `@primeuix/styles/blockui` (`primevue-4.5.5:packages/primevue/src/blockui/BlockUI.vue`, `primevue-4.5.5:packages/primevue/src/blockui/style/BlockUIStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../portal/Portal`, `../utils/Utils` (`primereact-10.9.9:components/lib/blockui/BlockUI.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect          | PrimeNG                               | PrimeVue                                 | PrimeReact                               |
| --------------- | ------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| What is blocked | `target` component, else the document | own children, or document (`fullScreen`) | own children, or document (`fullScreen`) |
| Mask element    | host moved into target / body         | created `div` (PT `mask`)                | portal `div` (PT `mask`)                 |
| Mask content    | `#content` template                   | none                                     | `template` prop                          |
| Events          | none                                  | `block`, `unblock`                       | `onBlocked`, `onUnblocked`               |
| z-index layer   | `modal`                               | `modal`                                  | `modal` when full screen, else `overlay` |
| Focus handling  | none                                  | blurs active element (full screen)       | blurs, then refocuses previous element   |
| Theming         | `@primeuix` tokens                    | `@primeuix` tokens                       | own CSS, no tokens                       |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/blockui/blockui.ts`
- `primeng-21.1.9:packages/primeng/src/blockui/style/blockuistyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/blockui/blockui.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/blockableui.ts`
- `primeng-21.1.9:apps/showcase/doc/blockui/` (`import-doc.ts`, `basic-doc.ts`, `document-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/blockui/` (`BlockUI.vue`, `BaseBlockUI.vue`, `BlockUI.d.ts`, `style/BlockUIStyle.js`)
- `primevue-4.5.5:apps/showcase/doc/blockui/` (`ImportDoc.vue`, `BasicDoc.vue`, `DocumentDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/blockui/` (`BlockUI.js`, `BlockUIBase.js`, `blockui.d.ts`)
- `primereact-10.9.9:components/doc/blockui/` (`importdoc.js`, `basicdoc.js`, `documentdoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/blockui/index.mjs`
- `@primeuix/themes-2.0.3:types/blockui/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/blockui/index.mjs`
