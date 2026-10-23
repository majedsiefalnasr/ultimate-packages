# ScrollTop

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ScrollTop is a floating button that appears once a scroll container has been scrolled past a numeric threshold (400 by default) and scrolls that container back to its top when activated. The container is the window by default; setting the target to `parent` switches it to the parent element of the component. All three frameworks ship it under the Misc menu group. The visible button is built differently in each: PrimeNG renders a `p-button` driven by a motion directive, PrimeVue wraps a `Button` in a Vue `transition`, and PrimeReact renders its own native `button` with a CSS transition and no Button component (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).

## 2. Names & status

- Canonical name: **ScrollTop** (issue #82, Misc list). PrimeNG also accepts the element selectors `p-scrollTop` and `p-scroll-top` as aliases (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`).
- No component-level deprecation in any of the three frameworks. `ScrollTop.d.ts` in PrimeVue and `scrolltop.d.ts` in PrimeReact carry no `@deprecated` tag (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.d.ts`, `primereact-10.9.9:components/lib/scrolltop/scrolltop.d.ts`).
- Member deprecation, PrimeNG only: `showTransitionOptions` and `hideTransitionOptions` are tagged `@deprecated since v21.0.0. Use motionOptions instead.` Neither is read anywhere in the component; they exist only as declarations (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.spec.ts`).
- Showcase menu: ScrollTop is listed under Components > Misc in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                | PrimeVue                                                                                             | PrimeReact                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Import         | `import { ScrollTopModule } from 'primeng/scrolltop'` (showcase); standalone `ScrollTop` class is exported too                                         | `import ScrollTop from 'primevue/scrolltop'`                                                         | `import { ScrollTop } from 'primereact/scrolltop'`                                               |
| Selector / tag | `<p-scrollTop>`, `<p-scrolltop>`, `<p-scroll-top>`                                                                                                     | `<ScrollTop>`                                                                                        | `<ScrollTop />`                                                                                  |
| Entry point    | `packages/primeng/src/scrolltop/public_api.ts` re-exports the types, `./scrolltop` and `./style/scrolltopstyle`                                        | `packages/primevue/src/scrolltop/package.json`: `main` `./ScrollTop.vue`, `types` `./ScrollTop.d.ts` | `components/lib/scrolltop/package.json`: `main` `./scrolltop.cjs.js`, `types` `./scrolltop.d.ts` |
| Source         | `packages/primeng/src/scrolltop/scrolltop.ts` (`ScrollTop`, `ScrollTopModule`)                                                                         | `packages/primevue/src/scrolltop/ScrollTop.vue` with base `BaseScrollTop.vue`                        | `components/lib/scrolltop/ScrollTop.js` with base `ScrollTopBase.js`                             |
| Companions     | `ScrollTopModule`, `ScrollTopStyle`, types `ScrollTopPassThroughOptions`, `ScrollTopPassThrough`, `ScrollTopIconTemplateContext`, `ScrollTopTemplates` | `style/ScrollTopStyle.js`; `ChevronUpIcon` from `@primevue/icons`; no exported sub-components        | none exported; `Ripple`, `CSSTransition` and `ChevronUpIcon` are internal dependencies           |
| Showcase title | "Angular Scroll Top Component"                                                                                                                         | "Vue ScrollTop Component"                                                                            | "React ScrollTop Component"                                                                      |

PrimeNG's `ScrollTopModule` imports and exports `ScrollTop` and `SharedModule` (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`). The showcase imports the module (`primeng-21.1.9:apps/showcase/doc/scrolltop/import-doc.ts`), PrimeVue imports the default export (`primevue-4.5.5:apps/showcase/doc/scrolltop/ImportDoc.vue`), and PrimeReact uses the named export (`primereact-10.9.9:components/doc/scrolltop/importdoc.js`). Page titles are in `primeng-21.1.9:apps/showcase/pages/scrolltop/index.ts`, `primevue-4.5.5:apps/showcase/pages/scrolltop/index.vue` and `primereact-10.9.9:pages/scrolltop/index.js`.

## 4. Anatomy

| Part               | PrimeNG                                                                                       | PrimeVue                                                                   | PrimeReact                                                                      | Class                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Scroll button      | inner `<button>` rendered by `p-button`, `type="button"`                                      | `<button>` rendered by `Button`, `type="button"` by default                | `<button type="button">`                                                        | `p-scrolltop` (plus `p-button` from Button; PrimeReact adds `p-link p-component`) |
| Host element       | `<p-scrolltop>` carries only Bind host attributes                                             | none; the transition and Button are the root                               | none; a fragment                                                                | —                                                                                 |
| Icon               | `svg data-p-icon="chevron-up"`; `span` when `icon` is a string; `icon` template when provided | `ChevronUpIcon`; `span` when `icon` is a string; `icon` slot when provided | `ChevronUpIcon`, or the `icon` prop (string or element)                         | `p-scrolltop-icon`                                                                |
| Visibility wrapper | `pMotion` directive on `p-button`, motion name `p-scrolltop`                                  | `<transition name="p-scrolltop" appear>` around `v-if` Button              | `CSSTransition` with class prefix `p-scrolltop` and `unmountOnExit`             | `p-scrolltop-enter*`, `p-scrolltop-leave*` (motion or transition classes)         |
| Ripple             | Button template applies `pRipple`                                                             | Button applies `v-ripple`                                                  | `<Ripple />` inside the button                                                  | —                                                                                 |
| Parent helper      | none                                                                                          | none                                                                       | `span` with class `p-scrolltop-helper`, rendered only when `target` is `parent` | `p-scrolltop-helper`                                                              |

- PrimeNG renders the button only while `render()` is true, and clears that flag after the leave motion (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`). PrimeVue uses `v-if="visible"` (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`). PrimeReact sets `unmountOnExit: true` (`primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`). A hidden button is therefore absent from the DOM in all three.
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/scrolltop/scrolltop.types.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.d.ts`, `primereact-10.9.9:components/lib/scrolltop/scrolltop.d.ts`.

## 5. API highlights

| Member             | PrimeNG (`ScrollTop`)                                                                                      | PrimeVue (`ScrollTop`)                                               | PrimeReact (`ScrollTop`)                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `target`           | `'window' \| 'parent' \| undefined`, default `window`                                                      | `HintedString<'window' \| 'parent'>`, default `window`               | `'window' \| 'parent' \| undefined`, default `window`                  |
| `threshold`        | `number`, default `400`, `numberAttribute` transform                                                       | `number`, default `400`                                              | `number`, default `400`                                                |
| `behavior`         | `'auto' \| 'smooth' \| undefined`, default `smooth`                                                        | `string`, default `smooth`                                           | `'auto' \| 'smooth' \| undefined`, default `smooth`                    |
| `icon`             | `string` (getter and setter over `_icon`)                                                                  | `string`, no default                                                 | `IconType<ScrollTopProps>`, default `null`                             |
| `styleClass`       | `string`                                                                                                   | not a prop                                                           | `className`: `string`                                                  |
| `style`            | `{ [klass: string]: any } \| null \| undefined`                                                            | not a prop                                                           | `CSSProperties`                                                        |
| `buttonProps`      | `ButtonProps`, default `{ rounded: true }`                                                                 | `object`, default `{ rounded: true }`                                | not a prop                                                             |
| `buttonAriaLabel`  | `string`, no default                                                                                       | not a prop; uses the locale                                          | not a prop; uses the locale                                            |
| Transition         | `motionOptions` (`MotionOptions`); `showTransitionOptions` and `hideTransitionOptions` (`.15s`) deprecated | none                                                                 | `transitionOptions`: `CSSTransitionProps`, default `null`              |
| `pt` / `ptOptions` | `pt`: `ScrollTopPassThrough`; `ptOptions`: `PassThroughOptions`                                            | `pt`: `PassThrough<ScrollTopPassThroughOptions>`; `ptOptions`: `any` | `pt`: `ScrollTopPassThroughOptions`; `ptOptions`: `PassThroughOptions` |
| `unstyled`         | `InputSignal<boolean>`                                                                                     | `boolean`, default `false`                                           | `boolean`, default `false`                                             |
| `dt`               | `InputSignal<Object>`                                                                                      | `any`                                                                | not declared                                                           |
| Children           | not used                                                                                                   | not used                                                             | `children` is declared read-only but never rendered                    |
| Icon template      | `ng-template #icon` content child or `PrimeTemplate` of type `icon`, context `{ styleClass }`              | `icon` slot, slot props carry `class`                                | none                                                                   |
| Events             | none (no `@Output`)                                                                                        | none (`ScrollTopEmitsOptions` is empty)                              | `onShow()` and `onHide()` callbacks                                    |
| Methods            | none public                                                                                                | none public                                                          | `getElement(): null \| HTMLButtonElement` (see section 11)             |

- Sources: `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts` (inputs and template), `primevue-4.5.5:packages/primevue/src/scrolltop/BaseScrollTop.vue` (prop defaults), `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.d.ts`, `primereact-10.9.9:components/lib/scrolltop/ScrollTopBase.js` (defaults), `primereact-10.9.9:components/lib/scrolltop/scrolltop.d.ts`.
- `dt`, `pt`, `unstyled` and `ptOptions` are inherited signals on the PrimeNG base component (`primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`).
- PrimeNG's `motionOptions` is a signal input merged over `ptm('motion')` (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`).
- Full API: catalog modules `scrolltop` in `docs/prime-reference/catalog/primeng.json`, `primevue.json` and `primereact.json`.

## 6. Usage guidance

- **Import** — PrimeNG imports `ScrollTopModule` from `primeng/scrolltop`; PrimeVue uses the default export from `primevue/scrolltop`; PrimeReact uses the named export from `primereact/scrolltop` (`primeng-21.1.9:apps/showcase/doc/scrolltop/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/ImportDoc.vue`, `primereact-10.9.9:components/doc/scrolltop/importdoc.js`).
- **Basic** — place one component in the page and it listens to window scroll by default, showing itself once the offset passes the threshold. The showcase demo adds a tall spacer above it (`primeng-21.1.9:apps/showcase/doc/scrolltop/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/BasicDoc.vue`, `primereact-10.9.9:components/doc/scrolltop/basicdoc.js`).
- **Target element** — place it inside a scrollable element and set `target="parent"` to watch that element instead of the window. The showcase uses a 250 × 200 scroll box with `threshold` 100, an arrow-up icon and contrast raised buttons. PrimeVue wraps the box in a ScrollPanel (`primeng-21.1.9:apps/showcase/doc/scrolltop/element-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/ElementDoc.vue`, `primereact-10.9.9:components/doc/scrolltop/elementdoc.js`).
- **Accessibility** — the showcase explains the button label and its keyboard behaviour (see section 7). Use it as a checklist, not as a guarantee (`primeng-21.1.9:apps/showcase/doc/scrolltop/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/scrolltop/accessibilitydoc.js`).
- **Pass-through** — PT options are documented on a Viewer tab plus a "ScrollTop PT Options" table (`primeng-21.1.9:apps/showcase/doc/scrolltop/pt/PTComponent.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/pt/index.vue`, `primereact-10.9.9:components/doc/scrolltop/pt/wireframe.js`).
- **Theming** — styled and unstyled modes; PrimeReact documents a Tailwind preset (`primevue-4.5.5:apps/showcase/doc/scrolltop/theming/index.vue`, `primereact-10.9.9:components/doc/scrolltop/theming/tailwinddoc.js`).
- **Behaviour choice** — `behavior` is passed straight to the scroll call, so `auto` jumps and `smooth` animates. Every framework defaults to `smooth`. PrimeNG's motion path honours `prefers-reduced-motion` because `@primeuix/motion` defaults `safe` to `true` (`@primeuix/motion-0.0.10:dist/index.mjs`, `primeng-21.1.9:packages/primeng/src/motion/motion.directive.ts`); PrimeVue and PrimeReact do not read it (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).
- **Services and providers** — none required by the showcase examples. PrimeVue reads `$primevue.config`, so the PrimeVue plugin must be installed for the locale label and zIndex. PrimeNG and PrimeReact read their configuration internally for zIndex (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`).

## 7. Accessibility

- **Element and role** — each framework renders a native `button`, so the role and keyboard behaviour come from the browser. PrimeNG and PrimeVue set `type="button"` explicitly, and PrimeReact sets it on the root (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primevue-4.5.5:packages/primevue/src/button/Button.vue`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).
- **Label, PrimeVue and PrimeReact** — `aria-label` is read from the locale key `aria.scrollTop`, whose default is "Scroll Top" in both frameworks. PrimeVue's label reaches the inner button through Button's merge of attributes, and PrimeReact sets it on the root (`primevue-4.5.5:packages/core/src/config/PrimeVue.js`, `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primereact-10.9.9:components/lib/api/Locale.js`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).
- **Label, PrimeNG** — the showcase says the label defaults to `aria.scrollTop`. The source does not do this: no ScrollTop file reads the translation object, and `buttonAriaLabel` has no default. The PrimeNG template binds `[attr.aria-label]` on the `p-button` host element, not on the inner button, and the Button only uses an `ariaLabel` input or `buttonProps.ariaLabel` for its own button (`primeng-21.1.9:apps/showcase/doc/scrolltop/accessibility-doc.ts`, `primeng-21.1.9:packages/primeng/src/button/button.ts`). This is a source-reading conclusion that I did not confirm in a browser.
- **Extra attributes** — the showcase says any valid attribute is passed to the button. PrimeReact spreads unknown props onto its button, which matches. PrimeVue's `ScrollTop.vue` sets `inheritAttrs: false` and does not bind `$attrs`, so attributes on `<ScrollTop>` do not reach the button. PrimeNG's template has no attribute forwarding, so they stay on the host (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primereact-10.9.9:components/lib/scrolltop/ScrollTopBase.js`, `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`).
- **Keyboard** — no key handlers exist in any framework. Enter and Space work because the element is a native button. The showcase table lists both keys as "Scrolls to top." (`primeng-21.1.9:apps/showcase/doc/scrolltop/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrolltop/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/scrolltop/accessibilitydoc.js`).
- **Focus** — no framework moves focus when the button appears or disappears. A focused button is removed from the DOM when it hides, so focus is lost.
- **Motion** — PrimeNG skips the fade under `prefers-reduced-motion` (`safe` defaults to `true`); PrimeVue and PrimeReact do not read it. The fade is 300 ms in PrimeNG and PrimeVue (CSS from `@primeuix/styles`; PrimeNG sets no duration in code) and 150 ms in PrimeReact.

## 8. Theming

- **Style classes** — `p-scrolltop` (root) and `p-scrolltop-icon` (icon). The root also gets `p-scrolltop-sticky` when `target` is not `window`, a conditional class the catalog does not list (`primeng-21.1.9:packages/primeng/src/scrolltop/style/scrolltopstyle.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/style/ScrollTopStyle.js`, `primereact-10.9.9:components/lib/scrolltop/ScrollTopBase.js`).
- **Catalog** — `primeng-21.1.9` `modules.scrolltop.style.classes` lists `p-scrolltop` and `p-scrolltop-icon`; `primevue-4.5.5` `scrolltopstyle` enumerates `root` and `icon`.
- **PT section keys** — PrimeNG: `host`, `root` (set on the host element by Bind), `pcButton` (forwarded to `p-button`), `motion` (merged into motion options). Global key `scrollTop` (`primeng-21.1.9:packages/primeng/src/types/scrolltop/scrolltop.types.ts`, `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`). PrimeVue: `root` (applied to the Button root; the icon is read from `root.icon`), `transition` (applied to the transition wrapper), `hooks`. Global key `scrolltop` in `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`. PrimeReact: `root`, `icon`, `transition`, `hooks`. Global key `scrolltop` in `primereact-10.9.9:components/lib/api/api.d.ts`.
- **Design tokens (`@primeuix/themes`)** — N/A for ScrollTop itself. There is no `scrolltop` group in `@primeuix/themes-2.0.3` `types/`, `tokens/` or `dist/`. PrimeNG and PrimeVue render a Button, so the button is styled by Button tokens (`@primeuix/themes-2.0.3:types/button/index.d.ts`).
- **Structural CSS (`@primeuix/styles`)** — `@primeuix/styles-2.0.3:dist/scrolltop/index.mjs` positions `.p-scrolltop.p-button` as fixed at 20 px from the bottom-right, makes `.p-scrolltop-sticky.p-button` sticky, and defines 300 ms opacity enter and leave transitions. PrimeNG and PrimeVue import this module from their style services (`primeng-21.1.9:packages/primeng/src/scrolltop/style/scrolltopstyle.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/style/ScrollTopStyle.js`).
- **PrimeReact CSS** — PrimeReact has no `@primeuix` dependency. Its own CSS lives in `ScrollTopBase.js` under `@layer primereact`: fixed at 20 px from the bottom-right, a 0.15 s opacity transition, and a hidden helper span. Tokens are N/A (`primereact-10.9.9:components/lib/scrolltop/ScrollTopBase.js`).
- **Tailwind preset (PrimeReact)** — `primereact-10.9.9:components/lib/passthrough/tailwind/index.js` defines a `scrolltop` entry with root classes that differ between window and parent targets and a transition.
- **PT docs** — see section 6.

## 9. Relationships

- **Embeds** — `Button` in PrimeNG (`p-button`) and PrimeVue (`Button`); PrimeReact does not use Button. All three embed `ChevronUpIcon` as the default icon. PrimeNG uses `MotionDirective`, PrimeVue a native transition, and PrimeReact `CSSTransition` (`primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).
- **Embedded by** — none. The only references are in global configuration and the library index files (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primereact-10.9.9:components/lib/api/api.d.ts`).
- **Related** — ScrollPanel (Panel category) appears in the PrimeVue element demo as the scroll container (`primevue-4.5.5:apps/showcase/doc/scrolltop/ElementDoc.vue`). Button (Button category) supplies the visible button, configured through `buttonProps`. ChevronUpIcon is the default icon.
- **Configuration links** — the locale key `aria.scrollTop` (PrimeVue and PrimeReact) and the zIndex overlay value (all three) come from the global configuration (`primevue-4.5.5:packages/core/src/config/PrimeVue.js`, `primereact-10.9.9:components/lib/api/Locale.js`, `primeng-21.1.9:packages/primeng/src/config/primeng.ts`).

## 10. Dependencies

- **PrimeNG (internal)** — `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent` (`BaseComponent`, `PARENT_INSTANCE`), `primeng/bind`, `primeng/button` (`Button`, `ButtonProps`), `primeng/icons` (`ChevronUpIcon`), `primeng/motion` (`MotionDirective`), `primeng/utils` (`ZIndexUtils`), `primeng/base` (through the style service). Source: `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`, `primeng-21.1.9:packages/primeng/src/scrolltop/style/scrolltopstyle.ts`.
- **PrimeNG (external)** — `@primeuix/motion` (`MotionEvent`, `MotionOptions`), `@primeuix/utils` (`getWindowScrollTop`), `@primeuix/styles/scrolltop` (CSS). Declared in `primeng-21.1.9:packages/primeng/package.json`.
- **PrimeVue (internal)** — `@primevue/core/basecomponent` (via `BaseScrollTop.vue`), `primevue/button`, `@primevue/icons/chevronup`, `./BaseScrollTop.vue`, `primevue/scrolltop/style`. Source: `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primevue-4.5.5:packages/primevue/src/scrolltop/BaseScrollTop.vue`.
- **PrimeVue (external)** — `@primeuix/utils/dom` (`getWindowScrollTop`), `@primeuix/utils/zindex` (`ZIndex`), `@primeuix/styles/scrolltop` (CSS) (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`, `primevue-4.5.5:packages/primevue/src/scrolltop/style/ScrollTopStyle.js`).
- **PrimeReact (internal)** — `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks`, `../icons/chevronup`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`).
- **PrimeReact (external)** — `react` and `react-transition-group` (CSSTransition wrapper) (`primereact-10.9.9:components/lib/csstransition/CSSTransition.js`).

## 11. Framework differences

| Aspect                | PrimeNG                                                                                                 | PrimeVue                                               | PrimeReact                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Visible button        | `p-button`                                                                                              | `Button`                                               | native `button` with `Ripple`                 |
| Show / hide mechanism | `pMotion` directive, `render` and `visible` signals                                                     | `transition` plus `v-if`                               | `CSSTransition` with `unmountOnExit`          |
| Scroll listener       | `renderer.listen` on the window or the parent                                                           | `window.addEventListener` or parent `addEventListener` | `useEventListener` (window or parent helper)  |
| Visibility rule       | `scrollY > threshold`                                                                                   | `scrollY > threshold`                                  | `scrollY > threshold`                         |
| Button props          | `buttonProps`, default `rounded`                                                                        | `buttonProps`, default `rounded`                       | none                                          |
| Aria label source     | `buttonAriaLabel` input, no default                                                                     | `aria.scrollTop` locale, default "Scroll Top"          | `aria.scrollTop` locale, default "Scroll Top" |
| Root PT target        | host element (Bind)                                                                                     | Button root                                            | button root                                   |
| Transition PT         | `motion`                                                                                                | `transition`                                           | `transition`                                  |
| Motion timing         | `motionOptions`; no duration set in code (300 ms from `@primeuix/styles`); skipped under reduced motion | 300 ms `@primeuix/styles`                              | 150 ms `CSSTransition` timeout, `.15s` CSS    |
| Events                | none                                                                                                    | none                                                   | `onShow`, `onHide`                            |
| Methods               | none                                                                                                    | none                                                   | `getElement()` (see below)                    |
| Parent-target helper  | none                                                                                                    | none                                                   | `span.p-scrolltop-helper`                     |
| Sticky class          | `p-scrolltop-sticky` when not window                                                                    | `p-scrolltop-sticky` when not window                   | `p-scrolltop-sticky` when not window          |
| Deprecated members    | `showTransitionOptions`, `hideTransitionOptions`                                                        | none                                                   | none                                          |
| Theming               | `@primeuix` styles and Button tokens                                                                    | `@primeuix` styles and Button tokens                   | own CSS, tokens N/A                           |

- PrimeReact's `scrolltop.d.ts` declares `ScrollTop` as a `React.Component` class with `getElement(): HTMLButtonElement | null`. The implementation is a `React.memo(React.forwardRef(...))` function. Its imperative handle returns `elementRef.current`, but no `elementRef` is declared in `ScrollTop.js`, so calling `getElement()` would throw a `ReferenceError` (`primereact-10.9.9:components/lib/scrolltop/scrolltop.d.ts`, `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`). This is a source-reading conclusion that I did not run.
- PrimeVue's `ScrollTop.d.ts` omits `icon` from the root PT options. The icon's PT is read from `root.icon` in the template (`primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.ts`
- `primeng-21.1.9:packages/primeng/src/scrolltop/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/scrolltop/style/scrolltopstyle.ts`
- `primeng-21.1.9:packages/primeng/src/scrolltop/scrolltop.spec.ts`
- `primeng-21.1.9:packages/primeng/src/types/scrolltop/scrolltop.types.ts`
- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:packages/primeng/package.json`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/element-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/pt/PTComponent.ts`
- `primeng-21.1.9:apps/showcase/doc/scrolltop/pt/PTViewer.ts`
- `primeng-21.1.9:apps/showcase/pages/scrolltop/index.ts`
- `primeng-21.1.9:apps/showcase/pages/scrolltop/scrolltopdemo.scss`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.vue`
- `primevue-4.5.5:packages/primevue/src/scrolltop/BaseScrollTop.vue`
- `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.d.ts`
- `primevue-4.5.5:packages/primevue/src/scrolltop/ScrollTop.spec.js`
- `primevue-4.5.5:packages/primevue/src/scrolltop/package.json`
- `primevue-4.5.5:packages/primevue/src/scrolltop/style/ScrollTopStyle.js`
- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/button/BaseButton.vue`
- `primevue-4.5.5:packages/primevue/src/button/Button.d.ts`
- `primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`
- `primevue-4.5.5:packages/core/src/config/PrimeVue.js`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/icons/src/chevronup/ChevronUpIcon.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/ElementDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/scrolltop/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/scrolltop/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`
- `primereact-10.9.9:components/lib/scrolltop/ScrollTopBase.js`
- `primereact-10.9.9:components/lib/scrolltop/scrolltop.d.ts`
- `primereact-10.9.9:components/lib/scrolltop/package.json`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/api/Locale.js`
- `primereact-10.9.9:components/lib/csstransition/CSSTransition.js`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/scrolltop/importdoc.js`
- `primereact-10.9.9:components/doc/scrolltop/basicdoc.js`
- `primereact-10.9.9:components/doc/scrolltop/elementdoc.js`
- `primereact-10.9.9:components/doc/scrolltop/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/scrolltop/pt/wireframe.js`
- `primereact-10.9.9:components/doc/scrolltop/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/scrolltop/theming/tailwinddoc.js`
- `primereact-10.9.9:pages/scrolltop/index.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/scrolltop/index.mjs`
- `@primeuix/themes-2.0.3:types/button/index.d.ts`
- `@primeuix/motion-0.0.10:dist/index.mjs`
- `primeng-21.1.9:packages/primeng/src/motion/motion.directive.ts`
