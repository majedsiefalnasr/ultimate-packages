# Stepper

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Stepper guides a user through a wizard-style, multi-step workflow: a row (or column) of numbered step headers plus one content panel per step, with separators between the headers. Exactly one step is active at a time; with `linear` set, the headers of non-active steps are locked so the user can only move through the provided buttons (`primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`, `primevue-4.5.5:packages/primevue/src/stepper/Stepper.vue`, `primereact-10.9.9:components/lib/stepper/Stepper.js`).

PrimeNG and PrimeVue build it from six cooperating parts (`Stepper`, `StepList`, `Step`, `StepPanels`, `StepPanel`, `StepItem`, plus an internal `StepperSeparator`), where a shared `value` links a step header to its panel. PrimeReact has a different design: a single `Stepper` that reads `StepperPanel` children (each with a `header` string) and renders headers and the active content itself, driven by `activeStep` (a zero-based index) and ref methods.

The legacy PrimeReact component `Steps` (a menu-style progress trail) is a separate component in the Menu category; see [Steps](steps.md).

## 2. Names & status

- Canonical name: **Stepper**. Showcase category is **Panel** in all three (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- Sub-component names: PrimeNG `Stepper`, `StepList`, `Step`, `StepPanels`, `StepPanel`, `StepItem`, `StepperSeparator` (module `StepperModule`); PrimeVue the same set under separate entry points (`StepperSeparator.vue` is an internal helper with no public entry); PrimeReact `Stepper` and `StepperPanel` only.
- Aliases: none in the Prime ecosystem. Do not confuse with `Steps` (PrimeReact Menu category; `steps` source folders also exist in PrimeNG and PrimeVue) — see [Steps](steps.md).
- Deprecated members: PrimeNG `Stepper.transitionOptions` (`@deprecated since v21.0.0, use motionOptions instead`, default `'400ms cubic-bezier(0.86, 0, 0.07, 1)'`) (`primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`). None found in PrimeVue or PrimeReact.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `import { StepperModule } from 'primeng/stepper'` (`primeng-21.1.9:apps/showcase/doc/stepper/import-doc.ts`). `StepperModule` imports and exports `Stepper`, `StepList`, `StepPanels`, `StepPanel`, `StepItem`, `Step`, `StepperSeparator`, `SharedModule`, `BindModule`; every class is also a standalone component (`standalone: true`, OnPush, no view encapsulation).
- Selectors: `p-stepper`, `p-step-list`, `p-step`, `p-step-panels`, `p-step-panel`, `p-step-item`, `p-stepper-separator`.
- All seven classes live in one file, `primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`; the entry point `primeng-21.1.9:packages/primeng/src/stepper/public_api.ts` re-exports `./stepper` and `./style/stepperstyle` only (the other style classes are not exported).
- Styles: `primeng-21.1.9:packages/primeng/src/stepper/style/stepperstyle.ts` plus `stepstyle.ts`, `stepitemstyle.ts`, `stepliststyle.ts`, `steppanelstyle.ts`, `steppanelsstyle.ts` in the same folder. Pass-through types: `primeng-21.1.9:packages/primeng/src/types/stepper/stepper.types.ts`.
- Each class extends `BaseComponent<…PassThrough>` with host directive `Bind`. `Step`, `StepPanel` and `StepItem` inject the parent `Stepper` via `inject(forwardRef(() => Stepper))`.

**PrimeVue 4.5.5**

- Imports (`primevue-4.5.5:apps/showcase/doc/stepper/ImportDoc.vue`): `primevue/stepper`, `primevue/steplist`, `primevue/steppanels`, `primevue/stepitem`, `primevue/step`, `primevue/steppanel`; tags `<Stepper>`, `<StepList>`, `<StepPanels>`, `<StepItem>`, `<Step>`, `<StepPanel>`. Package exports are declared in `primevue-4.5.5:packages/primevue/package.json`.
- Source folders under `primevue-4.5.5:packages/primevue/src/`: `stepper/` (`Stepper.vue`, `BaseStepper.vue`, `StepperSeparator.vue`, `Stepper.d.ts`), `steplist/`, `step/`, `stepitem/`, `steppanels/`, `steppanel/`, each with `<Name>.vue`, `Base<Name>.vue`, `<Name>.d.ts` and `style/<Name>Style.js` (for example `primevue-4.5.5:packages/primevue/src/step/Step.vue`, `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.vue`).

**PrimeReact 10.9.9**

- Imports: `import { Stepper } from 'primereact/stepper'` and `import { StepperPanel } from 'primereact/stepperpanel'` (`primereact-10.9.9:components/doc/stepper/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/stepper/Stepper.js` (main component, `React.memo` + `forwardRef`), defaults and CSS in `primereact-10.9.9:components/lib/stepper/StepperBase.js`, internal renderers `primereact-10.9.9:components/lib/stepper/StepperHeader.js`, `primereact-10.9.9:components/lib/stepper/StepperContent.js`, `primereact-10.9.9:components/lib/stepper/StepperSeparator.js`, types `primereact-10.9.9:components/lib/stepper/stepper.d.ts`.
- `StepperPanel` is a separate entry point: `primereact-10.9.9:components/lib/stepperpanel/StepperPanel.js` (renders just a `<span>` around its children), `primereact-10.9.9:components/lib/stepperpanel/StepperPanelBase.js`, `primereact-10.9.9:components/lib/stepperpanel/stepperpanel.d.ts`.

## 4. Anatomy

PrimeNG and PrimeVue (compositional). Horizontal layout: `Stepper` > `StepList` > `Step`\* and `StepPanels` > `StepPanel`\*. Vertical layout: `Stepper` > `StepItem`\* each wrapping one `Step` and one `StepPanel`.

| Part                     | PrimeNG / PrimeVue PT key | CSS class                     | Element / content                                                        |
| ------------------------ | ------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Stepper root             | `root`                    | `p-stepper p-component`       | Container, `role="tablist"`                                              |
| Step list                | `root` (StepList)         | `p-steplist`                  | Wrapper of the headers                                                   |
| Step item (vertical)     | `root` (StepItem)         | `p-stepitem`                  | Wrapper of one step + panel                                              |
| Step                     | `root` (Step)             | `p-step`                      | `role="presentation"` wrapper                                            |
| Step header              | `header`                  | `p-step-header`               | `<button role="tab">`                                                    |
| Step number              | `number`                  | `p-step-number`               | `<span>` showing the step `value`                                        |
| Step title               | `title`                   | `p-step-title`                | `<span>` with the default content                                        |
| Separator                | `separator` (Stepper)     | `p-stepper-separator`         | `<span>` (PrimeVue) / `<p-stepper-separator>` host (PrimeNG)             |
| Step panels              | `root` (StepPanels)       | `p-steppanels`                | Wrapper of the panels                                                    |
| Step panel               | `root` (StepPanel)        | `p-steppanel`                 | `role="tabpanel"`                                                        |
| Panel content wrapper    | `contentWrapper`          | `p-steppanel-content-wrapper` | Holds separator (vertical) and content                                   |
| Panel content            | `content`                 | `p-steppanel-content`         | User template/slot                                                       |
| Motion / transition (PT) | `motion` / `transition`   | —                             | PrimeNG `motion` (Stepper, StepPanel); PrimeVue `transition` (StepPanel) |
| Start / end (PrimeVue)   | — (slots, no PT key)      | —                             | `start` and `end` slots rendered inside the root (`Stepper.vue`)         |

PrimeReact (single component). Horizontal: `div.p-stepper` > `ul.p-stepper-nav` > `li.p-stepper-header` (> `button.p-stepper-action` > `span.p-stepper-number` + `span.p-stepper-title`, then `span.p-stepper-separator`) and `div.p-stepper-panels` > `div.p-stepper-content` (active panel only). Vertical: per step a `div.p-stepper-panel` > `div.p-stepper-header` + `CSSTransition` > `div.p-stepper-toggleable-content` > separator + content. Optional `div.p-stepper-start` / `div.p-stepper-end` bracket the layout (`primereact-10.9.9:components/lib/stepper/Stepper.js`).

| PrimeReact PT key (Stepper) | Purpose                            |
| --------------------------- | ---------------------------------- |
| `root`, `nav`               | Root `div`, header `ul`            |
| `panelContainer`            | `div.p-stepper-panels`             |
| `start`, `end`              | Start/end containers               |
| `stepperpanel`              | Nested `StepperPanel` PT options   |
| `hooks`                     | Lifecycle hooks (`ComponentHooks`) |

`StepperPanel` PT keys: `root`, `header`, `action`, `number`, `title`, `separator`, `content`, `panel`, `toggleableContent`, `transition`, `hooks` (`primereact-10.9.9:components/lib/stepperpanel/stepperpanel.d.ts`, `primereact-10.9.9:components/lib/stepper/stepper.d.ts`). PrimeNG PT per part: `primeng-21.1.9:packages/primeng/src/types/stepper/stepper.types.ts`; PrimeVue: `primevue-4.5.5:packages/primevue/src/step/Step.d.ts`, `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.d.ts`, `primevue-4.5.5:packages/primevue/src/stepper/Stepper.d.ts`.

## 5. API highlights

**Stepper (root)**

| Member           | PrimeNG                                                           | PrimeVue                                             | PrimeReact                                                                        |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Active step      | `value: ModelSignal<number \| undefined>` (default `undefined`)   | `value: string \| number` (default `undefined`)      | `activeStep: number` (default `0`, a zero-based index)                            |
| Change event     | model output (`[(value)]` / `valueChange`); no dedicated callback | `update:value` (emitted only when the value changes) | `onChangeStep(event: StepperChangeEvent)`                                         |
| Linear mode      | `linear: boolean` (default `false`)                               | `linear: boolean` (default `false`)                  | `linear: boolean` (default `false`)                                               |
| Orientation      | implicit: vertical when `StepItem` wrappers are used              | implicit: vertical when `StepItem` wrappers are used | `orientation: 'horizontal' \| 'vertical'` (default `'horizontal'`)                |
| Header placement | N/A                                                               | N/A                                                  | `headerPosition: 'top' \| 'right' \| 'bottom' \| 'left'` (code default `'right'`) |
| Start / end      | N/A                                                               | `start` and `end` slots                              | `start`, `end`: `ReactNode \| (props) => ReactNode`                               |
| Animation        | `motionOptions: MotionOptions`; deprecated `transitionOptions`    | built-in Vue `<transition name="p-collapsible">`     | built-in `CSSTransition` (vertical only)                                          |

Sources: `primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`, `primevue-4.5.5:packages/primevue/src/stepper/BaseStepper.vue`, `primevue-4.5.5:packages/primevue/src/stepper/Stepper.d.ts`, `primereact-10.9.9:components/lib/stepper/StepperBase.js`, `primereact-10.9.9:components/lib/stepper/stepper.d.ts`. `StepperChangeEvent` is `{ originalEvent: Event; index: number }`.

**Step, StepPanel and StepItem (PrimeNG/PrimeVue)**

- `value` links the parts. PrimeNG types it `ModelSignal<number | undefined>` on `Step`, `StepPanel` and `StepItem`; PrimeVue types it `string | number` (default `undefined`) on all three. Inside a `StepItem`, the item's `value` wins and the inner `Step`/`StepPanel` need no value of their own (PrimeVue: `activeValue` getter; PrimeNG: effects copy the item value into both) (`primevue-4.5.5:packages/primevue/src/step/Step.vue`, `primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`).
- `Step.disabled: boolean` (default `false`) in both. A non-active step is effectively disabled when the stepper is `linear` or the step is `disabled`.
- Display numbers: the number badge shows the step's `value` itself, not its position.
- PrimeVue `Step` and `StepPanel` also have `as` (`string | Component`) and `asChild` (`boolean`, default `false`). `asChild` renders only the default slot with scope `{ class, active, value, a11yAttrs, activateCallback }` (Step) or `{ active, a11yAttrs, activateCallback }` (StepPanel) for headless use (`primevue-4.5.5:packages/primevue/src/step/BaseStep.vue`, `primevue-4.5.5:packages/primevue/src/steppanel/BaseStepPanel.vue`).
- Templates and slots:
  - PrimeNG: `Step` takes a `#content` template with context `StepContentTemplateContext` `{ activateCallback: () => void; value: number; active: boolean }`; `StepPanel` takes `#content` with `StepPanelContentTemplateContext` `{ activateCallback: (index: number) => void; value: number; active: boolean }`.
  - PrimeVue: default slots on all parts; the `StepPanel` slot scope is `{ active, activateCallback(value) }`.
  - PrimeReact: the `StepperPanel` `header` prop is a string; `start`/`end` are the only template props (see section 11 for the template caveat).

**PrimeReact imperative API** (via ref): `getElement()`, `getActiveStep(): number | undefined`, `setActiveStep(step: number)`, `nextCallback(e?)`, `prevCallback(e?)`. Navigation buttons are not built in — the application binds `nextCallback`/`prevCallback` to its own buttons (`primereact-10.9.9:components/lib/stepper/Stepper.js`, `primereact-10.9.9:components/doc/stepper/basicdoc.js`). `setActiveStep` only sets state and does not call `onChangeStep`.

**Navigation in PrimeNG/PrimeVue:** panel content calls `activateCallback(value)` (PrimeNG `StepPanel` template and PrimeVue `StepPanel` slot) to jump to another step; clicking an enabled header calls the same stepper update (`primeng-21.1.9:apps/showcase/doc/stepper/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/HorizontalDoc.vue`).

## 6. Usage guidance

- **Basic / Horizontal:** compose `StepList` with `Step`s and `StepPanels` with `StepPanel`s; the shared `value` pairs a header with its panel, and panel templates provide the next/back buttons through `activateCallback` (`primeng-21.1.9:apps/showcase/doc/stepper/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/HorizontalDoc.vue`). PrimeReact: nest one `StepperPanel` per step and wire custom buttons to the ref's `nextCallback`/`prevCallback` (`primereact-10.9.9:components/doc/stepper/basicdoc.js`).
- **Linear:** set `linear` so the current step must be completed before moving on; header clicks on other steps are disabled and progression is controlled by the app's own buttons (`primeng-21.1.9:apps/showcase/doc/stepper/linear-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/LinearDoc.vue`, `primereact-10.9.9:components/doc/stepper/lineardoc.js`).
- **Vertical:** PrimeNG/PrimeVue wrap each `Step` and its `StepPanel` in a `StepItem`; PrimeReact switches layout with `orientation="vertical"` (`primeng-21.1.9:apps/showcase/doc/stepper/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/VerticalDoc.vue`, `primereact-10.9.9:components/doc/stepper/verticaldoc.js`).
- **Template:** customize a step header through the `#content` template (PrimeNG, with `activateCallback`, `value`, `active`) or the default slot (PrimeVue); PrimeVue also documents `as` (for example render the header container as a button) and `asChild` for a fully headless step (`primeng-21.1.9:apps/showcase/doc/stepper/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/TemplateDoc.vue`). PrimeReact has no template doc.
- **Steps only:** use `StepList` without `StepPanels` when only a progress indicator is wanted (`primeng-21.1.9:apps/showcase/doc/stepper/stepsonly.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/StepsOnlyDoc.vue`). PrimeReact has no equivalent doc; its progress-only component is [Steps](steps.md).
- **Header position (PrimeReact only):** `headerPosition` places the title relative to the number; default is `right` (`primereact-10.9.9:components/doc/stepper/headerdoc.js`).
- **Theming / Tailwind:** the PrimeVue and PrimeReact docs point to the Tailwind preset projects (`primevue-4.5.5:apps/showcase/doc/stepper/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/stepper/theming/tailwinddoc.js`); PrimeReact also lists CSS class names (`primereact-10.9.9:components/doc/stepper/theming/styleddoc.js`).
- Required services/providers: none. PrimeNG injects only its own `Stepper` parent and `Bind`; there is no router, no overlay and no icon dependency.

## 7. Accessibility

- Documented behavior (the same text appears in all three): the container has `role="tablist"` and accepts `aria-labelledby`; each header has `role="tab"` and `aria-controls` pointing to its content; each content has `role="tabpanel"`, an id matching the header's `aria-controls`, and `aria-labelledby` pointing to the header. Keyboard: `tab` moves focus through the headers; `enter` and `space` activate the focused header (`primeng-21.1.9:apps/showcase/doc/stepper/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/stepper/accessibilitydoc.js`).
- No arrow-key, Home or End handling exists in any framework; headers are native buttons, so `enter`/`space` are the browser's button behavior.
- Source vs docs:
  - PrimeNG and PrimeVue `StepPanel` set `aria-controls` back to the step header id but no `aria-labelledby` (`primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`, `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.vue`). PrimeReact does set `aria-labelledby` to the header button id (`primereact-10.9.9:components/lib/stepper/StepperContent.js`).
  - Step wrapper: `role="presentation"`, `aria-current="step"` when active, plus `data-p-active`/`data-p-disabled` in all three (PrimeReact puts them on the `li`).
  - Disabled non-active headers in linear mode: PrimeNG and PrimeVue set the native `disabled` attribute and `tabindex="-1"`; PrimeReact sets `tabIndex=-1` and the `p-disabled` class, blocks the click handler, but does not set `disabled` on the button (`primereact-10.9.9:components/lib/stepper/StepperHeader.js`).
  - PrimeReact separators carry `aria-hidden="true"`; PrimeNG and PrimeVue separators have no ARIA attributes.
  - PrimeVue's `a11yAttrs` object (headless mode) spells the header's tabindex key as `taindex` and bases it on `this.disabled` instead of the computed disabled state (`primevue-4.5.5:packages/primevue/src/step/Step.vue`).

## 8. Theming

- Style classes, PrimeNG (`primeng-21.1.9:packages/primeng/src/stepper/style/stepperstyle.ts` and siblings) and PrimeVue (`primevue-4.5.5:packages/primevue/src/stepper/style/StepperStyle.js` and siblings) — identical sets:
  - Stepper: `p-stepper` (+ `p-component`, `p-readonly` when `linear`), `p-stepper-separator`.
  - Step: `p-step` (+ `p-step-active`, `p-disabled`), `p-step-header`, `p-step-number`, `p-step-title`.
  - Item/list/panels: `p-stepitem` (+ `p-stepitem-active`), `p-steplist`, `p-steppanels`.
  - Panel: `p-steppanel` (+ `p-steppanel-active` only when vertical and active), `p-steppanel-content-wrapper`, `p-steppanel-content`.
  - PrimeVue's catalog enum `StepperClasses` lists only `root` and `separator`; the other parts have their own `*Style` modules (`primevue-4.5.5:packages/primevue/src/step/style/StepStyle.js`, `primevue-4.5.5:packages/primevue/src/steppanel/style/StepPanelStyle.js`).
- Pass-through keys: see section 4. PrimeVue PT context: `Step` receives `{ active, disabled }`, `StepPanel` receives `{ active }`. PrimeReact `StepperPanel` PT context: `{ index, count, first, last, active, highlighted, disabled }`. Both frameworks also expose `data-p` state attributes (PrimeVue builds `data-p` from `disabled`, `readonly`, `active`, `completed`, `vertical`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/stepper/index.mjs`, one module for all parts. It styles `.p-steplist`, `.p-step*`, `.p-stepper-separator`, `.p-steppanels`, `.p-steppanel*` and the vertical `.p-stepitem` rules (separator offset, `:dir(rtl)` rule, grid collapse for panels). PrimeNG adds `.p-steppanel .p-motion { display: grid; grid-template-rows: 1fr; }` in `stepperstyle.ts`.
- Design tokens (`@primeuix/themes-2.0.3:types/stepper/index.d.ts`, `StepperDesignTokens`):

| Section      | Tokens                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`       | `transitionDuration`                                                                                                                                     |
| `separator`  | `background`, `activeBackground`, `margin`, `size`                                                                                                       |
| `step`       | `padding`, `gap`                                                                                                                                         |
| `stepHeader` | `padding`, `borderRadius`, `gap`, `focusRing` (`width`, `style`, `color`, `offset`, `shadow`)                                                            |
| `stepTitle`  | `color`, `activeColor`, `fontWeight`                                                                                                                     |
| `stepNumber` | `background`, `activeBackground`, `borderColor`, `activeBorderColor`, `color`, `activeColor`, `size`, `fontSize`, `fontWeight`, `borderRadius`, `shadow` |
| `steppanels` | `padding`                                                                                                                                                |
| `steppanel`  | `background`, `color`, `padding`, `indent`                                                                                                               |

Aura preset values (examples): separator size `2px`, active separator `{primary.color}`, number size `2rem` with `50%` radius, panels padding `0.875rem 0.5rem 1.125rem 0.5rem` (`@primeuix/themes-2.0.3:dist/aura/stepper/index.mjs`).

- PrimeReact uses no `@primeuix`: layout-only CSS lives in a `@layer primereact` string in `primereact-10.9.9:components/lib/stepper/StepperBase.js`, and colors come from its separate theme CSS. Classes: `p-stepper p-component` with `p-stepper-horizontal` / `p-stepper-vertical` / `p-readonly`, `p-stepper-nav`, `p-stepper-header` (+ `p-highlight`, `p-disabled`, `p-stepper-header-{top,right,bottom,left}`), `p-stepper-action p-component`, `p-stepper-number`, `p-stepper-title`, `p-stepper-separator`, `p-stepper-panel` (+ `p-stepper-panel-active`), `p-stepper-toggleable-content`, `p-stepper-content` (+ `p-toggleable-content` when vertical), `p-stepper-panels`, `p-stepper-start`, `p-stepper-end`. Design tokens: N/A.
- Style/source mismatches: the shared CSS targets `.p-stepper.p-stepper-readonly .p-step`, but the components emit `p-readonly`, so that cursor rule does not match (`@primeuix/styles-2.0.3:dist/stepper/index.mjs`, `primeng-21.1.9:packages/primeng/src/stepper/style/stepperstyle.ts`). PrimeNG's `StepListClasses` enum documents `root = 'p-stepitem'` while the real class is `p-steplist`, and `StepPanelsStyle` registers under the name `steppanel` (`primeng-21.1.9:packages/primeng/src/stepper/style/stepliststyle.ts`, `primeng-21.1.9:packages/primeng/src/stepper/style/steppanelsstyle.ts`). The PrimeReact CSS string contains a stray SCSS `@include focused();`.

## 9. Relationships

- Embeds: PrimeNG `StepPanel` embeds the `p-motion` component (collapse animation, active only when vertical) and `Step`/`StepPanel` embed `p-stepper-separator`; no other Prime component is embedded in any framework. Buttons shown inside demos belong to the application ([Button](button.md)).
- Embedded by: none.
- Related/alternatives:
  - [Steps](steps.md) — non-panel progress trail (Menu category); in PrimeReact it is the older step indicator driven by a `model` array, and `Stepper` is the panel-based wizard.
  - [Tabs](tabs.md) — the accessibility model is a tab pattern, but tabs navigate freely and show one panel at a time without numbering or linear mode.
  - [Accordion](accordion.md) — the vertical stepper's collapsing panel behavior resembles an accordion.
- Alias chain: none; `StepperPanel` (PrimeReact) corresponds to the combination of `Step` + `StepPanel` in PrimeNG/PrimeVue.

## 10. Dependencies

- PrimeNG (`primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`): `@angular/common` (`CommonModule`), `@primeuix/motion` (`MotionOptions`), `@primeuix/utils` (`find`, `findIndexInList`, `uuid`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent` (`BaseComponent`, `PARENT_INSTANCE`), `primeng/bind`, `primeng/motion` (`MotionModule`), `primeng/utils` (`transformToBoolean`), `primeng/types/stepper`, `primeng/base` (`BaseStyle`, in the style files), `@primeuix/styles/stepper` (`primeng-21.1.9:packages/primeng/src/stepper/style/stepperstyle.ts`). No icons, no router.
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`), `@primeuix/utils/dom` (`find`, `findSingle`), `@primeuix/utils/object` (`findIndexInList`), `@primeuix/styles/stepper`, Vue `<transition>` (`primevue-4.5.5:packages/primevue/src/step/Step.vue`, `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.vue`, `primevue-4.5.5:packages/primevue/src/stepper/style/StepperStyle.js`). No icons.
- PrimeReact (`primereact-10.9.9:components/lib/stepper/Stepper.js`): `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../csstransition/CSSTransition`, `../hooks/Hooks` (`useMergeProps`, `useMountEffect`, `useUpdateEffect`), `../utils/Utils` (`UniqueComponentId`, `classNames`, `ObjectUtils`). Type-level dependency on `react-transition-group` in `primereact-10.9.9:components/lib/stepperpanel/stepperpanel.d.ts`.
- External npm packages: none beyond the framework itself.

## 11. Framework differences

| Aspect                     | PrimeNG                                                          | PrimeVue                                                              | PrimeReact                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture               | 6 public components + internal separator, all in one source file | 6 components in separate packages + internal separator                | `Stepper` + `StepperPanel` (marker component with a `header` string)                                                                                                                |
| Step/panel link            | shared numeric `value`                                           | shared `string \| number` `value`                                     | child order (zero-based index)                                                                                                                                                      |
| Active-state binding       | `value` model signal (`[(value)]`)                               | `value` prop + `update:value`                                         | `activeStep` prop + `onChangeStep`; ref `setActiveStep` (no callback)                                                                                                               |
| Vertical layout            | wrap in `StepItem`                                               | wrap in `StepItem`                                                    | `orientation="vertical"`                                                                                                                                                            |
| Headless / templating      | `#content` templates with `activateCallback`                     | default slot, `as`, `asChild` scope                                   | `start`/`end` props; per-panel `header`/`content`/`separator` function templates read from `step.children`, which looks inert on React elements (children live in `props.children`) |
| Next/back navigation       | `activateCallback(value)` in panel template                      | `activateCallback(value)` in panel slot                               | ref methods `nextCallback`/`prevCallback`                                                                                                                                           |
| Start/end content          | N/A                                                              | `start` / `end` slots                                                 | `start` / `end` props                                                                                                                                                               |
| Header position            | N/A                                                              | N/A                                                                   | `headerPosition`                                                                                                                                                                    |
| Animation                  | `p-motion` + `motionOptions`; `transitionOptions` deprecated     | Vue `<transition name="p-collapsible">`, PT key `transition`          | `CSSTransition`, timeouts `{ enter: 1000, exit: 450 }`, vertical only                                                                                                               |
| Panel mounting             | content rendered by motion wrapper                               | `v-show` (panels stay mounted); `asChild` renders only the active one | only the active panel mounted (horizontal); `unmountOnExit` (vertical)                                                                                                              |
| Disabled header            | native `disabled` + `tabindex="-1"`                              | native `disabled` + `tabindex="-1"`                                   | `tabIndex=-1`, `p-disabled`, click blocked; no native `disabled`                                                                                                                    |
| `aria-labelledby` on panel | no (`aria-controls` to step id)                                  | no (`aria-controls` to step id)                                       | yes                                                                                                                                                                                 |
| Class naming               | `p-step*`, `p-steplist`, `p-steppanel*`, `p-stepitem`            | same as PrimeNG                                                       | `p-stepper-*` (header, action, number, title, content, panel)                                                                                                                       |
| Design tokens              | `@primeuix/themes` `stepper`                                     | `@primeuix/themes` `stepper`                                          | N/A (own CSS)                                                                                                                                                                       |

Other source/doc mismatches: PrimeVue's `Step` and `StepPanel` declare `as` default `BUTTON` in their `.d.ts` files, but the base components default to `'DIV'` (`primevue-4.5.5:packages/primevue/src/step/Step.d.ts`, `primevue-4.5.5:packages/primevue/src/step/BaseStep.vue`). PrimeReact's `StepperProps.onChangeStep` is documented with a stale `@see StepperProps.onChange`, `headerPosition` has no `@defaultValue` in the typings although the code and doc default is `right`, and `Stepper.js` ends with `StepperBase.displayName = 'StepperBase'` and passes a misspelled `tempate` prop to `StepperContent` (`primereact-10.9.9:components/lib/stepper/stepper.d.ts`, `primereact-10.9.9:components/lib/stepper/StepperBase.js`).

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:packages/primeng/src/stepper/stepper.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/stepperstyle.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/stepstyle.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/stepitemstyle.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/stepliststyle.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/steppanelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/stepper/style/steppanelsstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/stepper/stepper.types.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/linear-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/vertical-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/stepsonly.ts`
- `primeng-21.1.9:apps/showcase/doc/stepper/accessibility-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/primevue/src/stepper/Stepper.vue`
- `primevue-4.5.5:packages/primevue/src/stepper/BaseStepper.vue`
- `primevue-4.5.5:packages/primevue/src/stepper/Stepper.d.ts`
- `primevue-4.5.5:packages/primevue/src/stepper/style/StepperStyle.js`
- `primevue-4.5.5:packages/primevue/src/step/Step.vue`
- `primevue-4.5.5:packages/primevue/src/step/BaseStep.vue`
- `primevue-4.5.5:packages/primevue/src/step/Step.d.ts`
- `primevue-4.5.5:packages/primevue/src/step/style/StepStyle.js`
- `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.vue`
- `primevue-4.5.5:packages/primevue/src/steppanel/BaseStepPanel.vue`
- `primevue-4.5.5:packages/primevue/src/steppanel/StepPanel.d.ts`
- `primevue-4.5.5:packages/primevue/src/steppanel/style/StepPanelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/stepper/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/HorizontalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/LinearDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/VerticalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/StepsOnlyDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/stepper/theming/TailwindDoc.vue`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/stepper/Stepper.js`
- `primereact-10.9.9:components/lib/stepper/StepperBase.js`
- `primereact-10.9.9:components/lib/stepper/StepperHeader.js`
- `primereact-10.9.9:components/lib/stepper/StepperContent.js`
- `primereact-10.9.9:components/lib/stepper/StepperSeparator.js`
- `primereact-10.9.9:components/lib/stepper/stepper.d.ts`
- `primereact-10.9.9:components/lib/stepperpanel/StepperPanel.js`
- `primereact-10.9.9:components/lib/stepperpanel/StepperPanelBase.js`
- `primereact-10.9.9:components/lib/stepperpanel/stepperpanel.d.ts`
- `primereact-10.9.9:components/doc/stepper/importdoc.js`
- `primereact-10.9.9:components/doc/stepper/basicdoc.js`
- `primereact-10.9.9:components/doc/stepper/lineardoc.js`
- `primereact-10.9.9:components/doc/stepper/verticaldoc.js`
- `primereact-10.9.9:components/doc/stepper/headerdoc.js`
- `primereact-10.9.9:components/doc/stepper/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/stepper/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/stepper/theming/tailwinddoc.js`
- `@primeuix/styles-2.0.3:dist/stepper/index.mjs`
- `@primeuix/themes-2.0.3:types/stepper/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/stepper/index.mjs`
