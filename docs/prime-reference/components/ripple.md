# Ripple

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Ripple is a press-feedback effect rather than a visible widget. Attached to a clickable element, it adds one absolutely positioned "ink" span; on press the span is placed at the pointer and animated outward until it fades. It is off by default and does nothing until the global `ripple` option is enabled. All three frameworks ship it: PrimeNG as the standalone `pRipple` directive (`primeng-21.1.9:packages/primeng/src/ripple/ripple.ts`), PrimeVue as the `v-ripple` directive (`primevue-4.5.5:packages/primevue/src/ripple/Ripple.js`), and PrimeReact as a `<Ripple />` child component (`primereact-10.9.9:components/lib/ripple/Ripple.js`). It is listed under Misc in all three showcase menus (`primevue-4.5.5:apps/showcase/assets/menu/menu.json` lines 501-502, `primeng-21.1.9:apps/showcase/assets/data/menu.json` lines 467-468, `primereact-10.9.9:components/layout/menu.json` lines 439-440). Most application code meets Ripple through components that embed it, such as Button, Tabs and Menu (see section 9).

## 2. Names & status

- **Canonical name:** Ripple. There is no legacy alias: `GLOSSARY.md` has no Ripple entry, and none of the three archives uses a different name for the component.
- **Public names per framework:**
  - PrimeNG: class `Ripple` with selector `[pRipple]` (`primeng-21.1.9:packages/primeng/src/ripple/ripple.ts` lines 13 and 20), NgModule `RippleModule` (same file, lines 145-149), and style class `RippleStyle` (`primeng-21.1.9:packages/primeng/src/ripple/style/ripplestyle.ts`).
  - PrimeVue: directive registered under the name `ripple` (`primevue-4.5.5:packages/primevue/src/ripple/Ripple.js` line 4, `BaseRipple.extend('ripple', ...)`), used as `v-ripple`, plus `RippleStyle` (`primevue-4.5.5:packages/primevue/src/ripple/style/RippleStyle.js`).
  - PrimeReact: component `Ripple` (`primereact-10.9.9:components/lib/ripple/Ripple.js` line 7; `Ripple.displayName = 'Ripple'` at line 129).
- **Deprecated:** PrimeReact's static `PrimeReact.ripple` flag. The source marks the `PrimeReact` class `@deprecated please use PrimeReactContext` (`primereact-10.9.9:components/lib/api/PrimeReact.js` line 4), and the type file says `@deprecated since version 9.6.0. Use PrimeReactContext instead.` (`primereact-10.9.9:components/lib/api/api.d.ts` line 681). It is still read as a fallback (`primereact-10.9.9:components/lib/ripple/Ripple.js` line 15). No deprecation tags were found in the PrimeNG or PrimeVue ripple folders.
- **Status:** shipped and active in all three frameworks.

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                             | PrimeVue                                                                                                                                                                               | PrimeReact                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Import         | `import { Ripple } from 'primeng/ripple'` or `RippleModule` (`primeng-21.1.9:apps/showcase/doc/ripple/import-doc.ts`)                                               | `import Ripple from 'primevue/ripple'`, then `app.directive('ripple', Ripple)` (`primevue-4.5.5:apps/showcase/doc/ripple/ImportDoc.vue` lines 23 and 30)                               | `import { Ripple } from 'primereact/ripple'` (`primereact-10.9.9:components/doc/ripple/importdoc.js`)                       |
| Usage form     | Attribute directive `pRipple` on a host element                                                                                                                     | Directive `v-ripple` on a host element                                                                                                                                                 | Child element `<Ripple />` rendered inside the host element                                                                 |
| Selector / tag | `[pRipple]` (`primeng-21.1.9:packages/primeng/src/ripple/ripple.ts` line 13)                                                                                        | `v-ripple`                                                                                                                                                                             | `<Ripple />`                                                                                                                |
| Source         | `packages/primeng/src/ripple/ripple.ts`                                                                                                                             | `packages/primevue/src/ripple/Ripple.js`, with `BaseRipple.js`                                                                                                                         | `components/lib/ripple/Ripple.js`, with `RippleBase.js`                                                                     |
| Exports        | `Ripple`, `RippleModule` (`ripple.ts`), `RippleStyle` and `RippleClasses` (`style/ripplestyle.ts`); `public_api.ts` re-exports `./ripple` and `./style/ripplestyle` | Default export `Ripple` (`Ripple.js`) with types in `Ripple.d.ts`; `RippleStyle` (`style/RippleStyle.js`); the barrel `packages/primevue/src/index.js` re-exports both (lines 552-556) | `Ripple` and its types (`components/lib/ripple/ripple.d.ts`); `RippleBase.js` is not listed in `ripple.d.ts`                |
| Base           | `BaseComponent` (`primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`), `RippleStyle` provided by the directive; `standalone: true`                 | `BaseDirective.extend` through `BaseRipple.js` (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`)                                                                     | `ComponentBase.extend` (`components/lib/ripple/RippleBase.js`)                                                              |
| Activation     | `config.ripple()` is read inside the constructor's `effect` (`ripple.ts` lines 36-43)                                                                               | The `config.ripple` watcher runs on mount with the current value and again on `config:ripple:change` (`BaseDirective.js` lines 216-218; `Ripple.js` line 6)                            | `context.ripple`, or the deprecated `PrimeReact.ripple` (`Ripple.js` line 15); returns `null` when inactive (lines 112-113) |
| Ink created    | In the effect when enabled (`ripple.ts` lines 39 and 112-124)                                                                                                       | In the watcher, through `createRipple` (`Ripple.js` lines 8 and 31-48)                                                                                                                 | On every render while active (`Ripple.js` lines 116-125)                                                                    |
| Press trigger  | `mousedown`, bound outside the Angular zone (`ripple.ts` lines 38-40)                                                                                               | `mousedown` on the host (`Ripple.js` line 26)                                                                                                                                          | `pointerdown` on the parent element (`Ripple.js` line 33)                                                                   |
| Teardown       | `onDestroy` calls `remove()` when ripple is on (`ripple.ts` lines 138-141)                                                                                          | `unmounted` calls `remove(el)` (`Ripple.js` lines 20-22)                                                                                                                               | Unmount effect clears the target and unbinds (`Ripple.js` lines 105-108)                                                    |

The PrimeNG class extends `BaseComponent` but is declared with `@Directive` (`ripple.ts` lines 12-20). PrimeVue's `Ripple` is a directive object built from `BaseRipple` (`BaseRipple.js` lines 3-7).

## 4. Anatomy

Ripple creates exactly one element, the ink span, inside its host. The ink is the only part of the component and it has no text, no tab stop and no interactive role.

| Part                 | PrimeNG                                                                                                                                  | PrimeVue                                                                                                                               | PrimeReact                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Host (clickable)     | Element carrying `pRipple`; the directive adds class `p-ripple` through host metadata (`ripple.ts` lines 14-16)                          | Element carrying `v-ripple`; the directive sets attribute `data-pd-ripple` and inline `overflow`/`position` (`Ripple.js` lines 11-13)  | Caller's element with class `p-ripple` (`components/doc/ripple/basicdoc.js` line 8); `<Ripple />` is its child                                                           |
| Ink element          | `span` with class `p-ink`, appended to the host (`ripple.ts` lines 112-115)                                                              | `span` with class `p-ink`, appended to the host (`Ripple.js` lines 35-46)                                                              | `span` with class `p-ink`, rendered as the last child of the host (`Ripple.js` lines 116-125)                                                                            |
| Ink attributes       | `data-p-ink="true"`, `data-p-ink-active="false"`, `aria-hidden="true"`, `role="presentation"` (`ripple.ts` lines 116-119)                | `role`, `aria-hidden`, `data-p-ink`, `data-p-ink-active`, and `data-pc-name="ripple"` added through `p-bind` (`Ripple.js` lines 35-43) | `aria-hidden` and `role="presentation"` only (`Ripple.js` lines 118 and 125); no `data-p-ink` attributes                                                                 |
| Active state         | `p-ink-active` is added on press and `data-p-ink-active` set to `true` (`ripple.ts` lines 73-74); removed by the timer or `animationend` | Same classes and attributes (`Ripple.js` lines 88-89); removed by the timer or `animationend` (`Ripple.js` lines 91-104)               | `activateRipple` removes and then re-adds `p-ink-active` on each press (`Ripple.js` lines 56 and 62); there is no timer, and removal happens on `animationend` (line 66) |
| Pass-through section | None (`ripple.ts` never reads `pt`, `ptm` or `$pt`)                                                                                      | `root`, applied to the ink (`Ripple.js` line 43)                                                                                       | `root`, applied to the ink (`Ripple.js` line 122)                                                                                                                        |

PrimeVue's `data-pc-name="ripple"` is generated from the directive name by `_getPTDatasets` (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js` lines 27-33), and the `p-bind` attribute object is applied by the element helper in `@primeuix/utils-0.7.2:dist/dom/index.mjs`. PrimeVue's `getInk` depends on this attribute (`Ripple.js` lines 106-108).

## 5. API highlights

### PrimeNG

- Selector `[pRipple]`, host class `p-ripple`, `standalone: true` (`primeng-21.1.9:packages/primeng/src/ripple/ripple.ts` lines 12-19).
- No inputs are declared on `Ripple` itself. It inherits signal inputs `dt`, `unstyled`, `pt` and `ptOptions` from `BaseComponent` (`primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts` lines 54, 60, 66 and 72). The catalog lists those four props, all with no default (`docs/prime-reference/catalog/primeng.json`, `modules.ripple.components.Ripple.props`).
- No outputs or events.
- Global switch: `PrimeNG.ripple` is `signal<boolean>(false)` (`primeng-21.1.9:packages/primeng/src/config/primeng.ts` line 9). `providePrimeNG` applies it only when the value is truthy (lines 189 and 193).
- Methods that exist in source but are not in the catalog's props list: `getInk()` (`ripple.ts` line 85), `onMouseDown(event: MouseEvent)` (line 51), `onAnimationEnd(event: Event)` (line 103), `create()` (line 112), `remove()` (line 126), `resetInk()` (line 95) and `onDestroy()` (line 138).

### PrimeVue

- Directive `v-ripple`. Its binding value type is `RippleOptions` (`primevue-4.5.5:packages/primevue/src/ripple/Ripple.d.ts` line 20): `dt?`, `pt?`, `ptOptions?` and `unstyled?` (default `false`). The binding type is `RippleDirectiveBinding` (line 68).
- Pass-through shape: `RippleDirectivePassThroughOptions` with `root` and `hooks` (`Ripple.d.ts` lines 46-59). `root` accepts a `RippleDirectivePassThroughAttributes` map (line 61, `[key: string]: any`) or null or undefined (line 15).
- Global switch: `ripple: false` in the default config (`primevue-4.5.5:packages/core/src/config/PrimeVue.js` line 9). Changes emit `config:ripple:change` (`PrimeVue.js` lines 229-231).
- No events, slots or public methods. Internal members are `bindEvents`, `unbindEvents`, `createRipple`, `remove`, `onMouseDown`, `onAnimationEnd` and `getInk` (`Ripple.js` lines 25-108).
- Timing: each press sets `timeout` for 401 ms (`Ripple.js` lines 91-96).

### PrimeReact

- Props (`components/lib/ripple/ripple.d.ts`): `children?: React.ReactNode`, readonly (line 43); `unstyled?: boolean`, default `false` (line 48); `pt?: RipplePassThroughOptions` (line 53); `ptOptions?: PassThroughOptions` (line 58). The catalog lists the same four, with `pt` typed as `RipplePassThroughOptions`.
- Pass-through: `RipplePassThroughOptions.root` (`ripple.d.ts` line 31) is typed as `RipplePassThroughType<React.HTMLAttributes<HTMLDivElement>>`. `RipplePassThroughMethodOptions` carries `props` (lines 19-21).
- Imperative ref handle: `props`, `getInk()` and `getTarget()` (`Ripple.js` lines 78-81). The catalog lists no methods.
- Context: `PrimeReactContext.ripple` is documented as default `false` (`primereact-10.9.9:components/lib/api/api.d.ts` lines 208-210); the provider initialises it with `propsValue.ripple ?? false` (`primereact-10.9.9:components/lib/api/PrimeReactContext.js` line 10). The setter is `setRipple` (`api.d.ts` line 281).
- Declared-type mismatch: `ripple.d.ts` line 72 declares `export declare class Ripple extends React.Component<RippleProps, any> {}`, but the runtime value is a `React.memo(React.forwardRef(...))` function component (`Ripple.js` lines 7-8) with an imperative handle.

## 6. Usage guidance

- **Import** — PrimeNG imports the directive or module directly; Button, for example, lists `Ripple` in its `imports` array (`primeng-21.1.9:packages/primeng/src/button/button.ts` lines 32 and 579). The showcase import page shows `RippleModule` (`primeng-21.1.9:apps/showcase/doc/ripple/import-doc.ts`). PrimeVue's import page imports the directive and registers it globally with `app.directive('ripple', Ripple)` (`primevue-4.5.5:apps/showcase/doc/ripple/ImportDoc.vue` lines 23 and 30). Components that embed it register it locally, as Button does with `directives: { ripple: Ripple }` (`primevue-4.5.5:packages/primevue/src/button/Button.vue` line 104). PrimeReact imports the component (`primereact-10.9.9:components/doc/ripple/importdoc.js`).
- **Enable globally (configuration)** — Ripple needs the global switch in all three. PrimeNG: `providePrimeNG({ ripple: true })`, with ripple disabled by default (`primeng-21.1.9:apps/showcase/doc/configuration/ripple-doc.ts`). Passing `ripple: false` through `providePrimeNG` does not turn it off, because the setter ignores falsy values (`primeng-21.1.9:packages/primeng/src/config/primeng.ts` line 193); set the signal directly instead. PrimeVue: `app.use(PrimeVue, { ripple: true })` (`primevue-4.5.5:apps/showcase/doc/configuration/RippleDoc.vue` line 19), and run-time assignments to `config.ripple` (`primevue-4.5.5:apps/showcase/doc/ripple/ConfigurationDoc.vue` lines 15, 20 and 28). PrimeReact: a `PrimeReactProvider` with `value={{ ripple: true }}` (`primereact-10.9.9:components/doc/ripple/configurationdoc.js`).
- **Basic (default demo)** — PrimeNG puts `pRipple` on a `div` with class `ripple-box` (`primeng-21.1.9:apps/showcase/doc/ripple/default-doc.ts`). PrimeVue puts `v-ripple` on the same kind of element (`primevue-4.5.5:apps/showcase/doc/ripple/DefaultDoc.vue` line 9). PrimeReact sets `p-ripple` on the host and adds `<Ripple />` as its child (`primereact-10.9.9:components/doc/ripple/basicdoc.js` lines 8 and 10).
  - Upstream mismatch: `DefaultDoc.vue` line 3 says the ripple is enabled "by adding add <i>p-ripple</i> class" (the text repeats "add"), but the demo at line 9 does not use that class. The directive sets `data-pd-ripple` on the host itself (`Ripple.js` line 11).
- **Custom colour** — PrimeNG (`primeng-21.1.9:apps/showcase/doc/ripple/custom-doc.ts`) and PrimeVue (`primevue-4.5.5:apps/showcase/doc/ripple/CustomDoc.vue`) change the ink colour with the `--p-ripple-background` custom property, with three example colours. PrimeReact's custom page sets the colour through `pt={{ root: { style: { background: ... } } }}` (`primereact-10.9.9:components/doc/ripple/customdoc.js`). PrimeVue's page says the default ink is "a shade of white" and that CSS on the `p-ink` element changes it (`CustomDoc.vue` line 3).
- **Pass-through** — PrimeVue has a pass-through page with the Ripple API table (`primevue-4.5.5:apps/showcase/doc/ripple/pt/index.vue`). PrimeReact exposes `pt.root` in its types (`components/lib/ripple/ripple.d.ts` line 31) but has no ripple pass-through page. PrimeNG has neither a pass-through page nor a pass-through hook for the ink (see section 8).
- **Run-time toggling (PrimeReact)** — the ripple page sets `ripple` on mount through `PrimeReactContext` and restores the previous value on unmount (`primereact-10.9.9:pages/ripple/index.js`).
- **Accessibility** and **theming** guidance appear in sections 7 and 8.

## 7. Accessibility

- The ink span is hidden from assistive technology in all three: `aria-hidden="true"` and `role="presentation"` (PrimeNG `ripple.ts` lines 118-119; PrimeVue `Ripple.js` lines 36-37; PrimeReact `Ripple.js` lines 118 and 125).
- Ripple adds no keyboard handling. None of the three ripple sources adds `keydown`, `keyup`, `keypress` or a `tabindex`.
- Showcase accessibility pages say the same: the ink carries `aria-hidden`, and the component has no interactive elements (`primeng-21.1.9:apps/showcase/doc/ripple/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/ripple/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/ripple/accessibilitydoc.js`).
- Reduced motion: no `prefers-reduced-motion` rule appears in the three ripple sources or in `@primeuix/styles-2.0.3:dist/ripple/index.mjs`, so the animation plays whenever ripple is enabled.
- The effect is visual feedback only. It does not change the host's role or accessible name.

## 8. Theming

- **Style classes:** PrimeNG uses `p-ripple` on the host (`ripple.ts` line 15), `p-ink` on the ink (`primeng-21.1.9:packages/primeng/src/ripple/style/ripplestyle.ts` lines 26-27; catalog `modules.ripple.components.Ripple.style.classes` = `p-ink`) and `p-ink-active` during the animation (`ripple.ts` line 73). PrimeVue uses `RippleClasses.root = 'p-ink'` (`primevue-4.5.5:packages/primevue/src/ripple/style/RippleStyle.js` lines 4-6), the `data-pd-ripple` attribute on the host, and `p-ink-active` on the ink (`Ripple.js` line 88). PrimeReact uses `p-ripple`, `p-ink` and `p-ink-active` from `components/lib/ripple/RippleBase.js` (lines 5-39).
- **Structural CSS:** `@primeuix/styles-2.0.3:dist/ripple/index.mjs` sets `.p-ink` to `display: block`, `position: absolute`, `background: dt('ripple.background')`, `border-radius: 100%`, `transform: scale(0)` and `pointer-events: none`. It also defines `.p-ink-active { animation: ripple 0.4s linear }` and the `ripple` keyframes (scale to 2.5 and fade to opacity 0).
- **PrimeNG extras:** `ripplestyle.ts` (lines 5-24) adds `.p-ripple { overflow: hidden; position: relative }`, `.p-ripple-disabled .p-ink { display: none !important }`, and a second `@keyframes ripple` block.
- **Design tokens:** `@primeuix/themes-2.0.3:types/ripple/index.d.ts` defines one token group, `root.background`. The token table maps `ripple.root.background` to `ripple.background` and to the CSS variable `--p-ripple-background` (`@primeuix/themes-2.0.3:tokens/index.mjs`). The theme root type exposes it as `ripple?: RippleDesignTokens` (`@primeuix/themes-2.0.3:types/index.d.ts` line 196). Preset values:
  - Aura and Lara (`@primeuix/themes-2.0.3:dist/aura/ripple/index.mjs`, `dist/lara/ripple/index.mjs`): light `rgba(0,0,0,0.1)`, dark `rgba(255,255,255,0.3)`.
  - Material (`dist/material/ripple/index.mjs`): the same light and dark values, plus an empty `css` string.
  - Nora (`dist/nora/ripple/index.mjs`): light `rgba(0,0,0,0.1)`, dark `rgba(255,255,255,0.4)`.
- **PrimeReact:** its own CSS in `RippleBase.js` (inside `@layer primereact`) sets the ink background to `rgba(255, 255, 255, 0.5)` (line 14) and has no `pointer-events` rule. Design tokens are N/A: `components/lib/ripple` has no `@primeuix` import.
- **Pass-through section keys:** PrimeVue `root` (`Ripple.js` line 43); PrimeReact `root` (`Ripple.js` line 122); PrimeNG none. In PrimeNG, `BaseComponent` exposes the `pt` input (`basecomponent.ts` line 66), but `ripple.ts` never reads it, so there is no hook on the ink.
- **Unstyled mode:** PrimeNG (`ripple.ts` lines 57, 73) and PrimeVue (`Ripple.js` lines 40, 71, 88) skip the `p-ink` and `p-ink-active` classes when unstyled. PrimeReact's `Ripple.js` has no `unstyled` branch.
- **Showcase theming:** PrimeVue has a theming page with a Styled tab (CSS classes, design tokens and presets) and an Unstyled tab that links to Tailwind (`primevue-4.5.5:apps/showcase/doc/ripple/theming/index.vue`, `theming/TailwindDoc.vue`). PrimeReact has `components/doc/ripple/theming/styleddoc.js` and `tailwinddoc.js`. PrimeNG has no theming page for ripple.
  - Upstream mismatch: PrimeReact's `tailwinddoc.js` targets `*[data-pd-ripple="true"]` (line 11) and `span[data-p-ink-active="true"]` (line 15). PrimeReact's `Ripple.js` never sets `data-pd-ripple`; that attribute comes from the PrimeVue directive.

## 9. Relationships

- **Embedded by many components.** Verified source imports: PrimeNG 26 files, PrimeVue 44 files and PrimeReact 50 files, excluding spec files and the ripple folder. Representative embeddings:
  - Button: PrimeNG `button.ts` line 590 (`pRipple`); PrimeVue `Button.vue` line 2 (`v-ripple`); PrimeReact `components/lib/button/Button.js` line 134 (`<Ripple />`).
  - Tabs: PrimeNG `tabs/tab.ts` line 37 (`hostDirectives: [Ripple, Bind]`) and line 72 (`ripple = computed(() => this.config.ripple())`); PrimeVue `tab/Tab.vue` line 2; PrimeReact `components/lib/tabview/TabView.js`.
  - Menu items: PrimeNG `menu/menu.ts` lines 84 and 107; PrimeVue `menu/Menuitem.vue` line 17; PrimeReact `components/lib/menu/Menu.js`.
  - Others (examples): PrimeNG `select/select.ts`, `paginator/paginator.ts`; PrimeVue `dialog/Dialog.vue`, `popover/Popover.vue`; PrimeReact `components/lib/sidebar/Sidebar.js` (canonical Drawer) and `components/lib/scrolltop/ScrollTop.js`.
- **Embeds:** Ripple embeds no other component. Its dependencies are the shared base and config layers (section 10).
- **Directive family:** PrimeNG pairs `Ripple` with `Bind` as host directives on Tabs (`tabs/tab.ts` line 37). The PrimeVue directive is built on `BaseDirective` (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`).
- **Siblings in Misc:** [ProgressSpinner](progressspinner.md) is in the same menu category. Ripple has no alias chain.
- **Global configuration:** each framework's config object holds the switch (PrimeNG `primeng.ts` line 9; PrimeVue `PrimeVue.js` line 9; PrimeReact `PrimeReactContext`, section 5).

## 10. Dependencies

- **PrimeNG:** `@angular/common` (`isPlatformBrowser`, `ripple.ts` line 1); `@angular/core` (`Directive`, `effect`, `inject`, `NgModule`, `NgZone`, line 2); `@primeuix/utils` for DOM helpers (line 3); `primeng/basecomponent` (line 4); `primeng/ts-helpers` (`VoidListener`, line 5); `@primeuix/styles/ripple` and `primeng/base` through `style/ripplestyle.ts` (lines 2-3). The PrimeNG config service is injected through `basecomponent.ts` (lines 7 and 29).
- **PrimeVue:** `@primeuix/utils/dom` (`Ripple.js` line 1); `@primevue/core/basedirective` and `primevue/ripple/style` (`BaseRipple.js` lines 1-2); `@primeuix/styles/ripple` and `@primevue/core/base/style` (`style/RippleStyle.js` lines 1-2). Config changes arrive through `PrimeVueService` events (`BaseDirective.js` lines 216-218).
- **PrimeReact:** `../api/Api` for `PrimeReact` and `PrimeReactContext` (`Ripple.js` line 2); `../hooks/Hooks` (line 3); `../utils/Utils` for `DomHandler` and `classNames` (line 4); `./RippleBase` (line 5). `RippleBase.js` imports `ComponentBase` and `ObjectUtils` (lines 1-2).
- **External npm packages:** none beyond the framework and `@primeuix` packages.

## 11. Framework differences

| Aspect                   | PrimeNG                                                  | PrimeVue                                                                             | PrimeReact                                                                |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Form                     | Angular attribute directive `pRipple`                    | Vue directive `v-ripple`                                                             | React child component `<Ripple />`                                        |
| Activation source        | `PrimeNG.ripple` signal, read in an effect               | `config.ripple` boolean, watched on mount and on change                              | `context.ripple`, with deprecated `PrimeReact.ripple` fallback            |
| Ink placement            | Appended to the host                                     | Appended to the host                                                                 | Rendered as a child of the caller's element                               |
| Press event              | `mousedown`                                              | `mousedown`                                                                          | `pointerdown`                                                             |
| Ink removal              | Timer (401 ms) and `animationend`                        | Timer (401 ms) and `animationend`                                                    | `animationend` only                                                       |
| Scroll offset            | `document.body.scrollTop` added to x, `scrollLeft` to y  | Same swapped terms                                                                   | Same swapped terms                                                        |
| Ink sizing               | Max outer size of host when the ink has no size          | Same                                                                                 | Same                                                                      |
| Styles                   | `@primeuix` ripple module plus `p-ripple` rules          | `@primeuix` ripple module                                                            | Own CSS in `RippleBase.js`                                                |
| Design tokens            | `ripple.background` (`--p-ripple-background`)            | Same                                                                                 | N/A                                                                       |
| Default ink colour       | Preset token (Aura light `rgba(0,0,0,0.1)`)              | Same                                                                                 | Hard-coded `rgba(255, 255, 255, 0.5)`                                     |
| Ink attributes           | `data-p-ink`, `data-p-ink-active`, `aria-hidden`, `role` | Same plus `data-pc-name="ripple"` (used by `getInk`)                                 | `aria-hidden`, `role`                                                     |
| Host attribute           | Class `p-ripple` (host metadata)                         | `data-pd-ripple`, inline `overflow` and `position`                                   | Class `p-ripple` added by the caller                                      |
| Pass-through hook on ink | None                                                     | `root`                                                                               | `root`                                                                    |
| Public methods           | `getInk`, `resetInk`, `create`, `remove` (source)        | None                                                                                 | Ref handle: `props`, `getInk`, `getTarget`                                |
| Global enable            | `providePrimeNG({ ripple: true })`                       | `app.use(PrimeVue, { ripple: true })`                                                | `PrimeReactProvider value={{ ripple: true }}`                             |
| Listener cleanup         | Stored unlisten functions; `remove()` calls them         | `removeEventListener` with a new `.bind()` reference, so the listener is not removed | Closure-based `removeEventListener` on the target; not verified to detach |
| Deprecated fallback      | None                                                     | None                                                                                 | `PrimeReact.ripple` static flag                                           |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/ripple/ripple.ts`
- `primeng-21.1.9:packages/primeng/src/ripple/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/ripple/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/ripple/style/ripplestyle.ts`
- `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:packages/primeng/src/tabs/tab.ts`
- `primeng-21.1.9:packages/primeng/src/menu/menu.ts`
- `primeng-21.1.9:apps/showcase/doc/ripple/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/ripple/default-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/ripple/custom-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/ripple/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/ripple-doc.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/ripple/Ripple.js`
- `primevue-4.5.5:packages/primevue/src/ripple/BaseRipple.js`
- `primevue-4.5.5:packages/primevue/src/ripple/Ripple.d.ts`
- `primevue-4.5.5:packages/primevue/src/ripple/package.json`
- `primevue-4.5.5:packages/primevue/src/ripple/style/RippleStyle.js`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/tab/Tab.vue`
- `primevue-4.5.5:packages/primevue/src/menu/Menuitem.vue`
- `primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`
- `primevue-4.5.5:packages/core/src/config/PrimeVue.js`
- `primevue-4.5.5:apps/showcase/doc/ripple/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/DefaultDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/CustomDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/ConfigurationDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/ripple/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/RippleDoc.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/ripple/Ripple.js`
- `primereact-10.9.9:components/lib/ripple/RippleBase.js`
- `primereact-10.9.9:components/lib/ripple/ripple.d.ts`
- `primereact-10.9.9:components/lib/ripple/package.json`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/api/PrimeReact.js`
- `primereact-10.9.9:components/lib/api/PrimeReactContext.js`
- `primereact-10.9.9:components/lib/button/Button.js`
- `primereact-10.9.9:components/lib/tabview/TabView.js`
- `primereact-10.9.9:components/lib/menu/Menu.js`
- `primereact-10.9.9:components/lib/sidebar/Sidebar.js`
- `primereact-10.9.9:components/lib/scrolltop/ScrollTop.js`
- `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/doc/ripple/importdoc.js`
- `primereact-10.9.9:components/doc/ripple/configurationdoc.js`
- `primereact-10.9.9:components/doc/ripple/basicdoc.js`
- `primereact-10.9.9:components/doc/ripple/customdoc.js`
- `primereact-10.9.9:components/doc/ripple/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/ripple/styledoc.js`
- `primereact-10.9.9:components/doc/ripple/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/ripple/theming/tailwinddoc.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:pages/ripple/index.js`
- `@primeuix/styles-2.0.3:dist/ripple/index.mjs`
- `@primeuix/themes-2.0.3:types/ripple/index.d.ts`
- `@primeuix/themes-2.0.3:types/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/ripple/index.mjs`
- `@primeuix/themes-2.0.3:dist/lara/ripple/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/ripple/index.mjs`
- `@primeuix/themes-2.0.3:dist/nora/ripple/index.mjs`
- `@primeuix/utils-0.7.2:dist/dom/index.mjs`
- `docs/prime-reference/catalog/primeng.json`
- `docs/prime-reference/catalog/primevue.json`
- `docs/prime-reference/catalog/primereact.json`

Spec files (`ripple.spec.ts`, `Ripple.spec.js`) were not used as evidence.
