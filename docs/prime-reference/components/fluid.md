# Fluid

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5

## 1. Summary

Fluid is a layout container that makes the form controls and buttons placed inside it span the full width of their parent. The container itself adds almost nothing: in PrimeNG and PrimeVue it renders the `p-fluid` class and provides a context that descendant components read to decide their own `fluid` state. The width change then comes from each child's `p-*-fluid` class. PrimeReact ships no Fluid component; it only has `.p-fluid` CSS rules that a consumer applies by hand (`primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.vue`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`).

## 2. Names & status

- Canonical name: **Fluid**. PrimeNG (`Fluid`, selector `p-fluid`) and PrimeVue (`Fluid`) use the same name, so no legacy alias applies. PrimeReact has no entry under any name.
- Not deprecated: no `@deprecated` tag appears in the PrimeNG or PrimeVue Fluid sources, styles or types (`primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.d.ts`).
- Related deprecation on the consumer side: PrimeVue's core `BaseInput` exposes `hasFluid` with the comment `@deprecated use $fluid instead` (`primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`).
- Migration note: the PrimeNG v19 and PrimeVue v4 migration guides list `.p-fluid` under "Removed Style Classes" and point to the `fluid` prop or the `Fluid` component (`primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`). The source still emits `p-fluid` as the container's root class (`primeng-21.1.9:packages/primeng/src/fluid/style/fluidstyle.ts`, `primevue-4.5.5:packages/primevue/src/fluid/style/FluidStyle.js`), and PrimeNG's DataTable column filter hard-codes it (`primeng-21.1.9:packages/primeng/src/table/table.ts`). The guides and the source disagree on whether the class was removed.
- PrimeReact: N/A. `primereact-10.9.9` has no `components/lib/fluid/` folder, no `components/doc/fluid/` folder, no `pages/fluid` page, no `fluid` module in `docs/prime-reference/catalog/primereact.json`, and no Fluid entry in the Misc menu (`primereact-10.9.9:components/layout/menu.json`).
- Menu placement: Misc in both showcase menus. PrimeVue lists Fluid between FocusTrap and Inplace (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`); PrimeNG lists it in the Misc group (`primeng-21.1.9:apps/showcase/assets/data/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                | PrimeVue                                                                                                           | PrimeReact                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Import         | `import { Fluid } from 'primeng/fluid'`, or `FluidModule` (NgModule that declares and exports `Fluid`) | `import Fluid from 'primevue/fluid'`                                                                               | N/A — not shipped in primereact-10.9.9                                                          |
| Selector / tag | `<p-fluid>`                                                                                            | `<Fluid>`                                                                                                          | N/A                                                                                             |
| Package entry  | `primeng/fluid` via `public_api.ts` and `ng-package.json`                                              | `package.json`: `main` and `module` `./Fluid.vue`, `types` `./Fluid.d.ts`                                          | N/A                                                                                             |
| Source         | `packages/primeng/src/fluid/fluid.ts`                                                                  | `packages/primevue/src/fluid/Fluid.vue`, `BaseFluid.vue`                                                           | N/A (`.p-fluid` CSS only, in `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`) |
| Style          | `packages/primeng/src/fluid/style/fluidstyle.ts`                                                       | `packages/primevue/src/fluid/style/FluidStyle.js`                                                                  | N/A                                                                                             |
| Base           | standalone `BaseComponent<FluidPassThrough>`, `OnPush`, `ViewEncapsulation.None`                       | `BaseFluid.vue` extends `BaseComponent` and provides `$pcFluid`; `Fluid.vue` extends it with `inheritAttrs: false` | N/A                                                                                             |

Sources: `primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primeng-21.1.9:packages/primeng/src/fluid/public_api.ts`, `primeng-21.1.9:packages/primeng/src/fluid/ng-package.json`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.vue`, `primevue-4.5.5:packages/primevue/src/fluid/BaseFluid.vue`, `primevue-4.5.5:packages/primevue/src/fluid/package.json`, `primevue-4.5.5:apps/showcase/doc/fluid/ImportDoc.vue`, `primeng-21.1.9:apps/showcase/doc/fluid/import-doc.ts`.

Sub-components and directives: none in either framework. PrimeNG's `fluid.ts` applies the internal `Bind` directive as a host directive. That is an implementation detail, not a public directive. PrimeNG also exports `FluidStyle` and the `FluidClasses` enum from `style/fluidstyle.ts`, and the pass-through types `FluidPassThroughOptions` and `FluidPassThrough` from `types/fluid/fluid.types.ts`. PrimeVue exports the `FluidStyle` and `FluidClasses` declarations from `style/FluidStyle.d.ts`.

## 4. Anatomy

| Part    | PrimeNG                                                                                             | PrimeVue                                                                  | PrimeReact                                         |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| Root    | the host element `<p-fluid>` itself, which carries `p-fluid` through `cx('root')`; no inner element | `<div>` with class `p-fluid` (`cx('root')`) and `ptmi('root')` attributes | N/A — the consumer's own element carries `p-fluid` |
| Content | `<ng-content>` projection                                                                           | default slot                                                              | N/A                                                |

- PrimeVue's `data-pc-name` and `data-pc-section` attributes come from `BaseComponent` (`primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`). Fluid has no other parts; the styled children are the consumers' parts.
- PrimeNG `fluid.ts` sets PT attributes on `['host', 'root']` together, so both keys land on the same host element (see §5).

Sources: `primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.vue`.

## 5. API highlights

Container props (the catalog holds the full API in `docs/prime-reference/catalog/primeng.json` and `primevue.json`, module `fluid`):

| Member      | PrimeNG                                                     | PrimeVue                                                             |
| ----------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `dt`        | `dt` (inherited from `BaseComponent`, undefined by default) | `dt?: DesignToken<any>`                                              |
| `pt`        | `pt: FluidPassThrough`, keys `host` and `root`              | `pt?: PassThrough<FluidPassThroughOptions>`, keys `root` and `hooks` |
| `ptOptions` | `PassThroughOptions` (inherited)                            | `ptOptions?: PassThroughOptions`                                     |
| `unstyled`  | `boolean` (inherited, undefined by default)                 | `unstyled?: boolean`, `@defaultValue false`                          |
| Slot        | `<ng-content>`                                              | `default`                                                            |
| Events      | none                                                        | none (`FluidEmitsOptions` is empty)                                  |

Sources: `primeng-21.1.9:packages/primeng/src/types/fluid/fluid.types.ts`, `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.d.ts`.

Consumer-side `fluid` input (the mechanism that Fluid actually drives):

| Member              | PrimeNG                                                                                  | PrimeVue                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `fluid` input       | `input(undefined, { transform: booleanAttribute })`, no default                          | `Boolean`, default `null` (`BaseInput` props)             |
| Resolved state      | `hasFluid` getter returns `this.fluid() ?? !!this.pcFluid`                               | computed `$fluid` returns `this.fluid ?? !!this.$pcFluid` |
| Container reference | `pcFluid: Fluid \| null = inject(Fluid, { optional: true, host: true, skipSelf: true })` | `inject: { $pcFluid: { default: undefined } }`            |

- Precedence: an explicit child `fluid` value wins; only an unset value falls back to the container. The showcase demonstrates this with `[fluid]="false"` inside a Fluid container (see §6).
- Sources: `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts` (lines 7, 14, 72–73), `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue` (inject block, `$fluid` computed).
- The other PrimeNG direct injectors read the container the same way; they are listed in §9.

## 6. Usage guidance

- **Basic.** Wrap a group of controls in `Fluid` so that each control spans the container width, without setting `fluid` on each one. A child's own `fluid` prop takes precedence over the container, and `[fluid]="false"` keeps a single child at its natural width (`primeng-21.1.9:apps/showcase/doc/fluid/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/BasicDoc.vue`).
- **Import.** PrimeNG's showcase imports `FluidModule` from `primeng/fluid`, while its Basic sample imports the standalone `Fluid` component. PrimeVue imports the default export from `primevue/fluid` (`primeng-21.1.9:apps/showcase/doc/fluid/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/ImportDoc.vue`).
- **Accessibility.** Both showcases have an accessibility section that says Fluid needs no roles or attributes and contains no interactive elements (see §7) (`primeng-21.1.9:apps/showcase/doc/fluid/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/AccessibilityDoc.vue`).
- **Pass Through.** The showcase has a PT page that shows the viewer and a table of Fluid PT options. PrimeNG's page uses `PTComponent.ts` and `PTViewer.ts`; PrimeVue's page uses `pt/index.vue` and `pt/PTViewer.vue` (`primeng-21.1.9:apps/showcase/doc/fluid/pt/PTComponent.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/pt/index.vue`).
- **Theming.** PrimeVue has a theming page with a styled CSS class table and a Tailwind pointer (`primevue-4.5.5:apps/showcase/doc/fluid/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/fluid/theming/TailwindDoc.vue`). PrimeNG's showcase folder has no theming page (N/A).
- **Required services or providers.** None. Fluid provides its own style service in both frameworks (`primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primevue-4.5.5:packages/primevue/src/fluid/BaseFluid.vue`), and consumers find the container through the injection described in §5.
- PrimeReact's documentation applies the same idea with a plain class: `className="card p-fluid"` on a wrapper `div` around `AutoComplete` (`primereact-10.9.9:components/doc/autocomplete/multipledoc.js`).

## 7. Accessibility

- **Screen reader.** Fluid needs no roles or attributes, per both framework docs (`primeng-21.1.9:apps/showcase/doc/fluid/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/AccessibilityDoc.vue`).
- The PrimeNG spec checks that the container gets no `aria-label` and no `role` (`primeng-21.1.9:packages/primeng/src/fluid/fluid.spec.ts`, test "should not interfere with ARIA attributes").
- **Keyboard.** The container has no interactive elements, so it has no keyboard support of its own (`primeng-21.1.9:apps/showcase/doc/fluid/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/fluid/AccessibilityDoc.vue`).
- Accessibility of the controls inside is the responsibility of each child component, as described on the child's own record.
- PrimeReact: N/A — the `p-fluid` class adds no ARIA, and the PrimeReact docs contain no Fluid accessibility section.

## 8. Theming

- **Style class.** The container renders `p-fluid` as its root class in both frameworks (`primeng-21.1.9:packages/primeng/src/fluid/style/fluidstyle.ts`, `primevue-4.5.5:packages/primevue/src/fluid/style/FluidStyle.js`). The catalog agrees: PrimeNG `fluid` `style.classes` is `p-fluid`, and PrimeVue `FluidClasses.root` is `"p-fluid"`.
- **Classes on the children that do the work.** Neither the PrimeNG nor the PrimeVue fluid package has a CSS rule for `.p-fluid`. The full-width behaviour comes from the children's classes, which are set when their fluid state resolves to true:
  - `p-inputtext-fluid` in PrimeNG (`primeng-21.1.9:packages/primeng/src/inputtext/style/inputtextstyle.ts`) and PrimeVue (`primevue-4.5.5:packages/primevue/src/inputtext/style/InputTextStyle.js`).
  - `p-button-fluid` in PrimeNG (`primeng-21.1.9:packages/primeng/src/button/button.ts` pushes it when `hasFluid`; `primeng-21.1.9:packages/primeng/src/button/style/buttonstyle.ts` binds it) and in PrimeVue (`primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`).
- **Structural CSS.** `@primeuix/styles-2.0.3:dist/inputtext/index.mjs` defines `.p-inputtext-fluid { width: 100%; }`, and `@primeuix/styles-2.0.3:dist/button/index.mjs` defines `.p-button-fluid { width: 100%; }`. Fifteen `@primeuix/styles` modules define selectors ending in `-fluid` for child components; the same pattern appears in `@primeuix/styles-2.0.3:dist/listbox/index.mjs`, `@primeuix/styles-2.0.3:dist/togglebutton/index.mjs` and `@primeuix/styles-2.0.3:dist/selectbutton/index.mjs`. None of them styles the `p-fluid` container. There is no `dist/fluid` module, and no `.p-fluid` selector appears in any `@primeuix/styles` dist file (`@primeuix/styles-2.0.3:dist/index.mjs`). The PrimeNG and PrimeVue fluid packages ship no `.p-fluid` rule either, and the PrimeNG style file imports nothing from `@primeuix`.
- **Design tokens.** N/A for the container. `@primeuix/themes-2.0.3:types/index.d.ts` has no `fluid` token group, and neither `tokens/` nor the `dist/<preset>/` folders contain a fluid folder. The width rules above belong to the children, and their tokens are on their own records.
- **Pass-through section keys.** PrimeNG: `host` and `root` (`primeng-21.1.9:packages/primeng/src/types/fluid/fluid.types.ts`). PrimeVue: `root` and `hooks` (`primevue-4.5.5:packages/primevue/src/fluid/Fluid.d.ts`). PrimeVue's global `pt` config also accepts `fluid?: DefaultPassThrough<FluidPassThroughOptions>` (`primevue-4.5.5:packages/primevue/src/config/Config.d.ts`).
- **Unstyled mode.** Both frameworks accept `unstyled` on the container. PrimeNG's `FluidPassThroughOptions.root` is typed as `HTMLDivElement` and PrimeVue's `root` is a generic attribute object (see §11).
- **PrimeReact.** No design tokens and no Fluid component. The `.p-fluid` rules live in `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, inside the shared structural block: `.p-fluid .p-inputtext { width: 100%; }`, and the InputGroup and icon rules that follow. Component-specific rules sit in each `*Base.js` file (for example `primereact-10.9.9:components/lib/dropdown/DropdownBase.js`, `.p-fluid .p-dropdown`).

## 9. Relationships

- **Uses:** no child components. Fluid is a pure container.
- **Used by (PrimeNG):** every class that extends `BaseInput` reads the container through `baseinput.ts`: AutoComplete, DatePicker, InputMask, InputNumber, Password and Select (`primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`, `primeng-21.1.9:packages/primeng/src/select/select.ts`). Classes that inject `Fluid` directly are ButtonDirective (`button.ts` line 308), Button (`button.ts` line 851), CascadeSelect, InputText, MultiSelect, Password, Textarea and TreeSelect (`primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`, `primeng-21.1.9:packages/primeng/src/inputtext/inputtext.ts`, `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`, `primeng-21.1.9:packages/primeng/src/password/password.ts`, `primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`, `primeng-21.1.9:packages/primeng/src/treeselect/treeselect.ts`, `primeng-21.1.9:packages/primeng/src/button/button.ts`).
- **Used by (PrimeVue):** the components that read `$fluid` in their component file are AutoComplete, DatePicker, InputMask, InputNumber, InputText, MultiSelect, Password, Select and Textarea (`primevue-4.5.5:packages/primevue/src/select/Select.vue`, `primevue-4.5.5:packages/primevue/src/inputtext/InputText.vue`). TreeSelect and CascadeSelect read `$fluid` only in their style files (`primevue-4.5.5:packages/primevue/src/treeselect/style/TreeSelectStyle.js`, `primevue-4.5.5:packages/primevue/src/cascadeselect/style/CascadeSelectStyle.js`). Source files that name `$pcFluid` in their own code are AutoComplete, Button, DatePicker, InputMask, InputNumber, MultiSelect, Password, SplitButton and TreeSelect (`primevue-4.5.5:packages/primevue/src/button/Button.vue`, `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.vue`, `primevue-4.5.5:packages/primevue/src/treeselect/TreeSelect.vue`). Button does not use `$fluid`: it computes `hasFluid` as `isEmpty(this.fluid) ? !!this.$pcFluid : this.fluid` (`primevue-4.5.5:packages/primevue/src/button/Button.vue`).
- **Declares `fluid` without reading the container:** PrimeNG Listbox, SelectButton and ToggleButton declare their own `fluid` input and do not inject `Fluid` (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`, `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`). Each sets its own class from that input (`primeng-21.1.9:packages/primeng/src/listbox/style/listboxstyle.ts`, `primeng-21.1.9:packages/primeng/src/selectbutton/style/selectbuttonstyle.ts`, `primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`). SelectButton forwards its own `fluid()` to the ToggleButton items it renders. No `inject(Fluid` or `pcFluid: Fluid` exists in their class chains, so a `<p-fluid>` ancestor does not reach these three.
- **Own `fluid` input, not the container:** PrimeNG InputGroup's `p-inputgroup-fluid` class reads the instance's own `fluid` property (`primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`).
- **Literal class use:** PrimeNG's DataTable column filter hard-codes `class="p-fluid"` on its form element, without using the Fluid component (`primeng-21.1.9:packages/primeng/src/table/table.ts`).
- **Related components:** the form controls in the Form category (for example Select, InputText, Textarea, DatePicker), and Button in the Button category, which consume the container (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`). Fluid is in Misc but its effect reaches the Form and Button categories, so the coverage check should count it there too.
- **Alias chains:** none.
- **Alternatives:** PrimeReact uses `p-fluid` on a plain element instead (see §8).

## 10. Dependencies

- **PrimeNG, internal:** `primeng/basecomponent` (`BaseComponent`, `PARENT_INSTANCE`), `primeng/bind` (`Bind`), `primeng/types/fluid` (`FluidPassThrough`), and `primeng/base` (`BaseStyle`, in the style file) (`primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primeng-21.1.9:packages/primeng/src/fluid/style/fluidstyle.ts`).
- **PrimeNG, external:** `@angular/common` (`CommonModule`) and `@angular/core`. No `@primeuix/*` import.
- **PrimeVue, internal:** `@primevue/core/basecomponent` (`BaseComponent`), `primevue/fluid/style` (`FluidStyle`), and `@primevue/core/base/style` (`BaseStyle`, type import) (`primevue-4.5.5:packages/primevue/src/fluid/BaseFluid.vue`, `primevue-4.5.5:packages/primevue/src/fluid/style/FluidStyle.d.ts`).
- **PrimeVue, external:** none. The style package is marked `sideEffects: false` (`primevue-4.5.5:packages/primevue/src/fluid/style/package.json`).
- **PrimeReact:** none; the rules are in `ComponentBase.js`.
- **External npm packages:** none.

## 11. Framework differences

| Aspect                      | PrimeNG                                                                        | PrimeVue                                                                        | PrimeReact                             |
| --------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------- |
| Shipped as a component      | Yes, `Fluid` (`p-fluid`), standalone, plus `FluidModule`                       | Yes, `Fluid` (`p-fluid`)                                                        | No; `.p-fluid` CSS rules only          |
| DOM                         | Host element carries the class; no wrapper element                             | `<div class="p-fluid">` wrapper                                                 | N/A                                    |
| Content                     | `<ng-content>`                                                                 | default slot                                                                    | N/A                                    |
| PT keys                     | `host`, `root`; both applied to the host element via `ptms(['host', 'root'])`  | `root`, `hooks`; attributes via `ptmi('root')`                                  | N/A                                    |
| Consumer discovery          | `inject(Fluid, { host: true, skipSelf: true })` in each input                  | `$pcFluid` provided by `BaseFluid`, injected by `BaseInput`                     | N/A                                    |
| Consumer state              | `hasFluid` (`fluid() ?? !!pcFluid`)                                            | `$fluid` (`fluid ?? !!$pcFluid`); deprecated `hasFluid` alias                   | N/A                                    |
| Styling of the container    | `p-fluid` class; no `.p-fluid` rule in the PrimeNG package or @primeuix styles | `p-fluid` class; no `.p-fluid` rule in the PrimeVue package or @primeuix styles | `.p-fluid` rules in `ComponentBase.js` |
| Design tokens for container | N/A                                                                            | N/A                                                                             | N/A                                    |
| Migration guide             | v19 guide lists `.p-fluid` under removed style classes                         | v4 guide lists `.p-fluid` under removed style classes                           | N/A — no Fluid entry in its docs       |
| Showcase docs               | Import, Basic, Accessibility, PT; no theming page                              | Import, Basic, Accessibility, PT, Theming (classes, Tailwind)                   | No page                                |
| Menu                        | Misc                                                                           | Misc                                                                            | Misc does not list Fluid               |

Sources: `primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`, `primevue-4.5.5:packages/primevue/src/fluid/Fluid.vue`, `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:components/layout/menu.json`, `primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`.

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/fluid/fluid.ts`
- `primeng-21.1.9:packages/primeng/src/fluid/fluid.spec.ts`
- `primeng-21.1.9:packages/primeng/src/fluid/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/fluid/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/fluid/style/fluidstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/fluid/fluid.types.ts`
- `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`
- `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`
- `primeng-21.1.9:packages/primeng/src/inputtext/inputtext.ts`
- `primeng-21.1.9:packages/primeng/src/inputtext/style/inputtextstyle.ts`
- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:packages/primeng/src/button/style/buttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/select/select.ts`
- `primeng-21.1.9:packages/primeng/src/textarea/textarea.ts`
- `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`
- `primeng-21.1.9:packages/primeng/src/password/password.ts`
- `primeng-21.1.9:packages/primeng/src/treeselect/treeselect.ts`
- `primeng-21.1.9:packages/primeng/src/cascadeselect/cascadeselect.ts`
- `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`
- `primeng-21.1.9:packages/primeng/src/listbox/style/listboxstyle.ts`
- `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`
- `primeng-21.1.9:packages/primeng/src/selectbutton/style/selectbuttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`
- `primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:apps/showcase/doc/fluid/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/fluid/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/fluid/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/fluid/pt/PTComponent.ts`
- `primeng-21.1.9:apps/showcase/doc/fluid/pt/PTViewer.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/fluid/Fluid.vue`
- `primevue-4.5.5:packages/primevue/src/fluid/BaseFluid.vue`
- `primevue-4.5.5:packages/primevue/src/fluid/Fluid.d.ts`
- `primevue-4.5.5:packages/primevue/src/fluid/package.json`
- `primevue-4.5.5:packages/primevue/src/fluid/style/FluidStyle.js`
- `primevue-4.5.5:packages/primevue/src/fluid/style/FluidStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/fluid/style/package.json`
- `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`
- `primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/primevue/src/inputtext/InputText.vue`
- `primevue-4.5.5:packages/primevue/src/inputtext/style/InputTextStyle.js`
- `primevue-4.5.5:packages/primevue/src/select/Select.vue`
- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`
- `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.vue`
- `primevue-4.5.5:packages/primevue/src/treeselect/TreeSelect.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/fluid/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/lib/dropdown/DropdownBase.js`
- `primereact-10.9.9:components/doc/autocomplete/multipledoc.js`
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/index.mjs`
- `@primeuix/styles-2.0.3:dist/inputtext/index.mjs`
- `@primeuix/styles-2.0.3:dist/button/index.mjs`
- `@primeuix/styles-2.0.3:dist/listbox/index.mjs`
- `@primeuix/styles-2.0.3:dist/togglebutton/index.mjs`
- `@primeuix/styles-2.0.3:dist/selectbutton/index.mjs`
- `@primeuix/themes-2.0.3:types/index.d.ts`
- Committed catalog (not an archive): `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
