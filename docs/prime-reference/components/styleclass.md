# StyleClass

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

StyleClass adds, removes or toggles CSS class names on a target element when a trigger is clicked, and can run a three-step enter and leave class sequence for animation. All three frameworks ship it, in different shapes: an Angular attribute directive in PrimeNG (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`), a Vue directive in PrimeVue (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`), and a React wrapper component that binds to a trigger through `nodeRef` and renders only its children (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`). It owns no markup and no structural CSS.

## 2. Names & status

- Canonical name: **StyleClass**. `GLOSSARY.md` has no StyleClass entry and defines no legacy alias.
- PrimeNG: standalone directive class `StyleClass` with selector `[pStyleClass]`, also wrapped by the NgModule `StyleClassModule` (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`).
- PrimeVue: directive registered under the name `styleclass` and used as `v-styleclass` (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`, `primevue-4.5.5:packages/metadata/src/directives/index.ts`).
- PrimeReact: component `StyleClass`, with `displayName` `StyleClass` (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`).
- Status: the StyleClass entry points themselves carry no `@deprecated` tag in PrimeNG or PrimeVue. PrimeReact deprecates two member props, `enterClassName` and `leaveClassName`, since 10.5.2 (`primereact-10.9.9:components/lib/styleclass/styleclass.d.ts`, lines 27 and 44).
- PrimeNG's `styleClass` deprecation (`@deprecated since v20.0.0`) belongs to other components' `styleClass` input, for example Chip (`primeng-21.1.9:packages/primeng/src/chip/chip.ts`). It does not apply to StyleClass, which has no `styleClass` input.
- Catalog location: PrimeNG's entry sits at `class.style.components.StyleClass` in `docs/prime-reference/catalog/primeng.json`, not under a `styleclass` module key. PrimeVue and PrimeReact use a `styleclass` module (`docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                         | PrimeVue                                                                                       | PrimeReact                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Import         | `import { StyleClassModule } from 'primeng/styleclass';` (or the standalone `StyleClass`)       | `import StyleClass from 'primevue/styleclass';` then `app.directive('styleclass', StyleClass)` | `import { StyleClass } from 'primereact/styleclass';`                                                                              |
| Selector / tag | attribute `pStyleClass` on the trigger                                                          | directive `v-styleclass` on the trigger                                                        | `<StyleClass nodeRef={...} selector="..." />` wrapping children                                                                    |
| Source         | `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`                                  | `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`                                | `primereact-10.9.9:components/lib/styleclass/StyleClass.js`                                                                        |
| Entry point    | `primeng-21.1.9:packages/primeng/src/styleclass/public_api.ts` (`export * from './styleclass'`) | `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.d.ts` (default export)             | `primereact-10.9.9:components/lib/styleclass/styleclass.d.ts`; re-exported by `primereact-10.9.9:components/lib/primereact.all.js` |
| Base           | plain `@Directive` with `OnDestroy`; does not extend `BaseComponent`                            | `BaseStyleClass.js`: `BaseDirective.extend({ style: StyleClassStyle })`                        | `StyleClassBase.js` (defaults and merge helpers) under `React.forwardRef`                                                          |
| Sub-parts      | none beyond the directive and `StyleClassModule`                                                | `style/StyleClassStyle.js` only; no other directive                                            | none                                                                                                                               |

Import examples: `primeng-21.1.9:apps/showcase/doc/styleclass/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/styleclass/ImportDoc.vue`, `primereact-10.9.9:components/doc/styleclass/importdoc.js`.

## 4. Anatomy

N/A — StyleClass renders no element of its own. The PrimeNG and PrimeVue directives attach to the consumer's trigger element, and the PrimeReact component returns `props.children` unchanged (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`, line 224). The target that receives the classes comes from a selector and lives in the consumer's markup (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`).

## 5. API highlights

| Concern               | PrimeNG (directive input)                               | PrimeVue (`StyleClassOptions` key)                                                                   | PrimeReact (prop)                                                                                                          |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Target selector       | `selector`, alias `pStyleClass`, `string \| undefined`  | `selector`, `HintedString<'@next' \| '@prev' \| '@parent' \| '@grandparent'> \| string \| undefined` | `selector`, `'@next' \| '@prev' \| '@parent' \| '@grandparent' \| string`, default `null`                                  |
| Enter classes         | `enterFromClass`, `enterActiveClass`, `enterToClass`    | same names, `string`                                                                                 | `enterFromClassName`, `enterActiveClassName`, `enterToClassName`; `enterClassName` deprecated                              |
| Leave classes         | `leaveFromClass`, `leaveActiveClass`, `leaveToClass`    | same names, `string`                                                                                 | `leaveFromClassName`, `leaveActiveClassName`, `leaveToClassName`; `leaveClassName` deprecated                              |
| Toggle                | `toggleClass`, `string \| undefined`                    | `toggleClass`, `string`                                                                              | `toggleClassName`, default `null`                                                                                          |
| Hide on outside click | `hideOnOutsideClick`, boolean via `booleanAttribute`    | `hideOnOutsideClick`, boolean, `@defaultValue false`                                                 | `hideOnOutsideClick`, boolean, default `false`                                                                             |
| Hide on Escape        | `hideOnEscape`, boolean via `booleanAttribute`          | not present                                                                                          | not present                                                                                                                |
| Hide on resize        | `hideOnResize`, boolean via `booleanAttribute`          | `hideOnResize`, boolean, `@defaultValue false`                                                       | not present                                                                                                                |
| Resize target         | `resizeSelector`, `string \| undefined`, no initializer | `resizeSelector`, `string`, `@defaultValue window` (`'window'`, `'document'` or a target)            | not present                                                                                                                |
| Slide hidden class    | not present (falls back to `'hidden'`)                  | `hiddenClass`, `string`, used only by the slide animation                                            | not present (hard-coded `'hidden'`)                                                                                        |
| Trigger reference     | not needed (host element)                               | not needed (directive host)                                                                          | `nodeRef`, typed `React.MutableRefObject<React.ReactNode>`, required in the `.d.ts`, default `null` in `StyleClassBase.js` |
| Pass-through / tokens | none                                                    | `dt`, `pt`, `ptOptions` typed on the options                                                         | none                                                                                                                       |

- Outputs and events: none in any framework. The PrimeNG directive declares no `@Output` or `EventEmitter` (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`). PrimeVue emits nothing, and PrimeReact has no callback props.
- Methods: PrimeReact declares `getElement(): HTMLElement | null` and `getTarget(): HTMLElement | null` (`primereact-10.9.9:components/lib/styleclass/styleclass.d.ts`), exposed through `React.useImperativeHandle` (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`, lines 202–206). PrimeNG's directive methods (`enter()`, `leave()`, `toggle()` and the bind helpers) carry no access modifier, so they are public in TypeScript terms, but none is documented as API (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, lines 116, 121, 175). PrimeVue's directive hooks and methods are internal to the directive object and not documented as API (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`).
- Selector resolution: PrimeNG and PrimeVue resolve `selector` with `getTargetElement` from `@primeuix/utils` (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`, line 15). Its minified code also accepts `window`, `document`, `body`, `@first`, `@last`, `@child` and `@child[n]` (`@primeuix/utils-0.7.2:dist/dom/index.mjs`). The PrimeReact component accepts only the four `@` keywords and otherwise calls `document.querySelector` (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`, lines 158–180).
- Target caching: PrimeNG caches the resolved target on the first click (`this.target ||=` in `clickListener()`). PrimeVue resolves once at mount inside `bind()`. PrimeReact resolves on each click but returns the cached `targetRef` once it is set.
- Defaults: the catalog lists `false` defaults for PrimeNG's `hideOnEscape`, `hideOnOutsideClick` and `hideOnResize`, but the PrimeNG source declares them with no initializer, so they behave as falsy (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, lines 58, 68, 73).

## 6. Usage guidance

- **Import** — PrimeNG: import `StyleClassModule` (or the standalone `StyleClass`) and add it to the component's `imports`. PrimeVue: register the directive once with `app.directive('styleclass', StyleClass)`. PrimeReact: import `StyleClass` and pass a `nodeRef` that points at a mounted element such as a `Button` ref. No services or providers are needed (`primeng-21.1.9:apps/showcase/doc/styleclass/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/styleclass/ImportDoc.vue`, `primereact-10.9.9:components/doc/styleclass/importdoc.js`).
- **Toggle Class** — `toggleClass` adds the class when it is absent and removes it when present, instead of running the enter and leave sequence. Selector keywords such as `@next` point at a sibling, so a button can switch a disabled state on an adjacent input. PrimeReact uses `toggleClassName` (`primeng-21.1.9:apps/showcase/doc/styleclass/toggleclass-doc.ts`, `primevue-4.5.5:apps/showcase/doc/styleclass/ToggleClassDoc.vue`, `primereact-10.9.9:components/doc/styleclass/toggleclassdoc.js`).
- **Animation** — the enter and leave sequences are three classes each (from, active, to); the active class is removed on `animationend` and an animating flag blocks overlapping runs. For overlays, `hideOnOutsideClick` closes the popup on an outside click, and PrimeNG additionally offers `hideOnEscape` (`primeng-21.1.9:apps/showcase/doc/styleclass/animation-doc.ts`, prose at line 15). The showcase defines its own keyframes `my-fadein` and `my-fadeout` in component styles (same file, lines 47 and 56). PrimeVue's example uses a custom fade and an `animate-slide` class from the external tailwind-primeui plugin, which is not in the pinned archives (`primevue-4.5.5:apps/showcase/doc/styleclass/AnimationDoc.vue`, line 7). The PrimeReact animation doc names the deprecated `enterClassName` and `leaveClassName` props (`primereact-10.9.9:components/doc/styleclass/animationdoc.js`).
- **Hide On Resize** — `hideOnResize` runs leave when the viewport or a chosen element resizes while the target is visible. `resizeSelector` takes `window` (the default), `document`, or a CSS selector for an element observed with `ResizeObserver`; `document` is not an Element, so the code takes the window `resize` path (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, line 260; `@primeuix/utils-0.7.2:dist/dom/index.mjs`) (`primeng-21.1.9:apps/showcase/doc/styleclass/hideonresize-doc.ts`, `primevue-4.5.5:apps/showcase/doc/styleclass/HideOnResizeDoc.vue`). PrimeReact has no hide-on-resize documentation or prop.

## 7. Accessibility

- ARIA and roles: none. No StyleClass source sets `aria-*` or `role` attributes (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`, `primereact-10.9.9:components/lib/styleclass/StyleClass.js`). Expanded or controls state on the trigger therefore belongs to the consumer.
- Keyboard activation: triggers respond to `click` only. PrimeNG uses `@HostListener('click')`, PrimeVue binds a click listener in `bind()`, and PrimeReact uses `useEventListener` with type `click` on the `nodeRef` element. Keyboard use works only when the trigger emits `click` itself, as a native button does.
- Escape: only PrimeNG handles it. `hideOnEscape` listens for `keydown` on the owner document and leaves when the target is visible and the key is `Escape` (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, lines 225–231). PrimeVue and PrimeReact have no Escape handling.
- Focus: no framework moves, traps or restores focus.
- Data attribute: PrimeVue sets `data-pd-styleclass` to `true` on the trigger (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`, line 6). PrimeNG and PrimeReact set none.
- Documentation: no accessibility, pass-through or theming doc exists for StyleClass in any showcase folder. PrimeNG's `apps/showcase/doc/styleclass/` holds four files (import, toggle class, animation, hide on resize), PrimeVue's holds four, and PrimeReact's holds three (`primereact-10.9.9:components/doc/styleclass/`).

## 8. Theming

- Style classes: StyleClass defines none. It only adds, removes and toggles consumer-supplied class names. PrimeVue's `style/StyleClassStyle.d.ts` exports an empty `StyleClassClasses` enum (`primevue-4.5.5:packages/primevue/src/styleclass/style/StyleClassStyle.d.ts`). PrimeNG has no `style/` folder for StyleClass.
- PrimeVue style hook: `StyleClassStyle.js` extends `BaseStyle` with `name: 'styleclass-directive'` (`primevue-4.5.5:packages/primevue/src/styleclass/style/StyleClassStyle.js`). No matching structural CSS or token group exists in the pinned `@primeuix` packages.
- Structural CSS: `@primeuix/styles-2.0.3:dist` has no StyleClass folder. No `.hidden` rule appears in the `@primeuix/styles-2.0.3:dist` or `@primeuix/themes-2.0.3:dist` folders.
- Design tokens: N/A. `@primeuix/themes-2.0.3:types` and `@primeuix/themes-2.0.3:dist` contain no StyleClass group for any preset.
- Slide hidden class: PrimeNG falls back to `'hidden'` when `enterFromClass` is unset (`primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, lines 128–130). PrimeVue uses `hiddenClass` with fallbacks (`primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`, lines 47–49). PrimeReact hard-codes `'hidden'` (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`, lines 26–30 and 82–86). The consumer must supply that class, because no `@primeuix` package defines it.
- Pass-through: PrimeNG has none, because the directive does not extend `BaseComponent` and exposes no `pt`, `dt` or `unstyled`. PrimeVue exposes directive pass-through through `Config.directives.styleclass`, which accepts hooks only (`primevue-4.5.5:packages/primevue/src/config/Config.d.ts`; `StyleClassDirectivePassThroughOptions` is `{ hooks }` in `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.d.ts`). PrimeReact has none.
- PrimeReact CSS: `primereact-10.9.9:components/lib/styleclass/StyleClassBase.js` holds defaults only and no CSS, so its design tokens are N/A.

## 9. Relationships

- Consumers in the pinned showcases: the PrimeNG drawer headless doc puts `pStyleClass` on a `pRipple` trigger (`primeng-21.1.9:apps/showcase/doc/drawer/headless-doc.ts`). PrimeVue's `primevue-4.5.5:apps/showcase/doc/drawer/HeadlessDoc.vue` uses `v-styleclass` in several places. PrimeReact's `primereact-10.9.9:components/doc/sidebar/headlessdoc.js` and its layout components `primereact-10.9.9:components/layout/topbar.js` (line 227) and `primereact-10.9.9:components/layout/menuitem.js` (line 21) render `<StyleClass>`.
- Library embedding: no PrimeNG component source outside `packages/primeng/src/styleclass/` imports the directive. The only other text match is an unrelated `data-styleclass` attribute in `primeng-21.1.9:packages/primeng/src/toolbar/toolbar.spec.ts` (line 782), not a StyleClass import. PrimeVue wires it only into registration surfaces (`primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/index.d.ts`, `primevue-4.5.5:packages/primevue/src/umd/primevue.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`). PrimeReact exports it from `primereact-10.9.9:components/lib/primereact.all.js`.
- Embeds: StyleClass embeds no other component.
- Related by usage, by canonical name: Button (the trigger in the PrimeVue and PrimeReact toggle docs), Ripple (`pRipple` beside `pStyleClass` in the PrimeNG drawer doc), Drawer (the headless drawer examples), and the PrimeReact layout menu examples (`primereact-10.9.9:components/layout/menuitem.js`).
- Alias chains: none. PrimeReact's `enterFromClassName` and `leaveFromClassName` replace deprecated member names, not component aliases.

## 10. Dependencies

- PrimeNG internal: `primeng/ts-helpers` for `VoidListener` (`primeng-21.1.9:packages/primeng/src/ts-helpers/ts-helpers.ts`).
- PrimeNG external: `@angular/core` (`booleanAttribute`, `Directive`, `ElementRef`, `HostListener`, `Input`, `NgModule`, `NgZone`, `OnDestroy`, `Renderer2`) and `@primeuix/utils` 0.7.2 (`addClass`, `getTargetElement`, `hasClass`, `isElement`, `removeClass`), as imported in `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`.
- PrimeVue internal: `BaseDirective` from `@primevue/core/basedirective` (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`) and `StyleClassStyle` from `primevue/styleclass/style` (`primevue-4.5.5:packages/primevue/src/styleclass/BaseStyleClass.js`).
- PrimeVue external: `@primeuix/utils/dom` (`addClass`, `getTargetElement`, `hasClass`, `isElement`, `removeClass`), as imported in `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`.
- PrimeReact internal: `PrimeReactContext` from `../api/Api` (`primereact-10.9.9:components/lib/api/Api.js`), `useEventListener`, `useMountEffect`, `useUnmountEffect` and `useUpdateEffect` from `../hooks/Hooks` (`primereact-10.9.9:components/lib/hooks/Hooks.js`), `DomHandler` and `ObjectUtils` from `../utils/Utils`, and `StyleClassBase` (`primereact-10.9.9:components/lib/styleclass/StyleClass.js`).
- PrimeReact helpers: `useEventListener` defaults its target to `document` (`primereact-10.9.9:components/lib/hooks/useEventListener.js`). `ObjectUtils.getRefElement` unwraps a `nodeRef` (`primereact-10.9.9:components/lib/utils/ObjectUtils.js`, line 315). `DomHandler.getTargetElement` (`primereact-10.9.9:components/lib/utils/DomHandler.js`, line 1165) and `DomHandler.isVisible` (same file, line 932) serve the click path.
- External npm packages beyond the framework: none. The `@primeuix` package used is `@primeuix/utils` only, and it appears in PrimeNG and PrimeVue. No `@primeuix/styles` or `@primeuix/themes` module is imported.

## 11. Framework differences

| Aspect                | PrimeNG                                                                         | PrimeVue                                                                | PrimeReact                                                        |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Form                  | Standalone attribute directive (`StyleClass`, `[pStyleClass]`)                  | Directive (`styleclass`, `v-styleclass`)                                | Wrapper component that renders its children                       |
| Trigger binding       | Host `click` via `@HostListener`                                                | `click` listener bound in `bind()` on mount                             | `useEventListener` with type `click` on the `nodeRef` element     |
| Selector keywords     | `@next`, `@prev`, `@parent`, `@grandparent`, plus the `getTargetElement` extras | Same as PrimeNG                                                         | Four `@` keywords; anything else goes to `document.querySelector` |
| Enter and leave end   | `animationend` only                                                             | `animationend` and `animationcancel`                                    | `animationend` only                                               |
| Visibility test       | `offsetParent !== null`                                                         | `offsetParent !== null`                                                 | `DomHandler.isVisible` on click; local helper uses `offsetParent` |
| Toggle prop           | `toggleClass`                                                                   | `toggleClass`                                                           | `toggleClassName`                                                 |
| Escape                | `hideOnEscape`                                                                  | not implemented                                                         | not implemented                                                   |
| Resize                | `hideOnResize` and `resizeSelector` (`ResizeObserver` or window `resize`)       | `hideOnResize` and `resizeSelector`, default `window`                   | not implemented                                                   |
| Slide hidden class    | `enterFromClass \|\| 'hidden'`                                                  | `hiddenClass` with fallbacks to `enterFromClass` and `enterActiveClass` | literal `'hidden'`                                                |
| Data attribute        | none                                                                            | `data-pd-styleclass` on the trigger                                     | none                                                              |
| Deprecated names      | none                                                                            | none                                                                    | `enterClassName` and `leaveClassName` (since 10.5.2)              |
| Pass-through          | none                                                                            | directive hooks via `Config.directives.styleclass`                      | none                                                              |
| Cleanup               | `ngOnDestroy` unbinds all listeners                                             | `unmounted` calls `unbind`                                              | `useUnmountEffect` calls `destroy`                                |
| Design tokens and CSS | none                                                                            | none (empty `StyleClassClasses` enum)                                   | none (defaults only)                                              |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`
- `primeng-21.1.9:packages/primeng/src/styleclass/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.spec.ts`
- `primeng-21.1.9:packages/primeng/src/styleclass/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/ts-helpers/ts-helpers.ts`
- `primeng-21.1.9:packages/primeng/src/chip/chip.ts`
- `primeng-21.1.9:packages/primeng/src/toolbar/toolbar.spec.ts` (unrelated `data-styleclass` attribute only)
- `primeng-21.1.9:apps/showcase/doc/styleclass/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/styleclass/toggleclass-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/styleclass/animation-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/styleclass/hideonresize-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/drawer/headless-doc.ts`
- `primeng-21.1.9:apps/showcase/pages/styleclass/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.js`
- `primevue-4.5.5:packages/primevue/src/styleclass/BaseStyleClass.js`
- `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.d.ts`
- `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.spec.js`
- `primevue-4.5.5:packages/primevue/src/styleclass/package.json`
- `primevue-4.5.5:packages/primevue/src/styleclass/style/StyleClassStyle.js`
- `primevue-4.5.5:packages/primevue/src/styleclass/style/StyleClassStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/styleclass/style/package.json`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/umd/primevue.js`
- `primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`
- `primevue-4.5.5:packages/metadata/src/directives/index.ts`
- `primevue-4.5.5:apps/showcase/doc/styleclass/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/styleclass/ToggleClassDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/styleclass/AnimationDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/styleclass/HideOnResizeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/drawer/HeadlessDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/styleclass/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/styleclass/StyleClass.js`
- `primereact-10.9.9:components/lib/styleclass/StyleClassBase.js`
- `primereact-10.9.9:components/lib/styleclass/styleclass.d.ts`
- `primereact-10.9.9:components/lib/styleclass/package.json`
- `primereact-10.9.9:components/lib/hooks/Hooks.js`
- `primereact-10.9.9:components/lib/hooks/useEventListener.js`
- `primereact-10.9.9:components/lib/api/Api.js`
- `primereact-10.9.9:components/lib/utils/DomHandler.js`
- `primereact-10.9.9:components/lib/utils/ObjectUtils.js`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/styleclass/importdoc.js`
- `primereact-10.9.9:components/doc/styleclass/toggleclassdoc.js`
- `primereact-10.9.9:components/doc/styleclass/animationdoc.js`
- `primereact-10.9.9:components/doc/sidebar/headlessdoc.js`
- `primereact-10.9.9:components/layout/topbar.js`
- `primereact-10.9.9:components/layout/menuitem.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:pages/styleclass/index.js`
- `@primeuix/utils-0.7.2:dist/dom/index.mjs`
- `@primeuix/styles-2.0.3:dist`
- `@primeuix/themes-2.0.3:types`
- `@primeuix/themes-2.0.3:dist`
- Repo files (not archive citations): `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `GLOSSARY.md`
