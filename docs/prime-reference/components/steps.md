# Steps

**Category:** Menu · **Frameworks:** PrimeNG 21.1.9 (source only, no showcase) · PrimeVue 4.5.5 (source only, no showcase) · PrimeReact 10.9.9

## 1. Summary

Steps is a horizontal, numbered progress indicator for a multi-step workflow. It renders a `<nav>` with a list of items built from a `model` of MenuItem objects; each item shows its index number (1, 2, 3…) and a label, and one item is marked active through an index prop. It is **read-only by default** (items are not clickable); setting `readonly` / `readOnly` to false makes the items activatable so the component can drive a non-linear flow. It holds no step content: the page below it decides what to show (`primeng-21.1.9:packages/primeng/src/steps/steps.ts`, `primevue-4.5.5:packages/primevue/src/steps/Steps.vue`, `primereact-10.9.9:components/lib/steps/Steps.js`).

Steps is the legacy sibling of [Stepper](stepper.md). All three Prime libraries direct users to "Stepper without panels" as its replacement, and only PrimeReact still presents Steps in its showcase. Items use the shared MenuItem model documented in [Menu](menu.md#menuitem-model).

## 2. Names & status

- Canonical name: **Steps** (plural). Folder and import path are `steps` in all three; the component class is `Steps` everywhere. The generated PrimeNG docs describe it as "also known as Stepper", which is a different, newer component ([Stepper](stepper.md)) (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`).
- **Status: legacy / superseded by Stepper**, but still shipped as source in all three archives:
  - **PrimeNG 21.1.9:** the source folder `packages/primeng/src/steps/` (component, style, `public_api.ts`, `ng-package.json`) and the theme presets `packages/themes/src/presets/aura/steps/` (also lara, material, nora) still exist (`primeng-21.1.9:packages/primeng/src/steps/steps.ts`, `primeng-21.1.9:packages/themes/src/presets/aura/steps/index.ts`). Yet the migration docs list Steps as deprecated since v19/v18 and "removed" in v20 with the replacement "Stepper without panels" (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`). This is a doc/source mismatch: the code was not deleted in 21.1.9.
  - **PrimeVue 4.5.5:** source, package exports (`primevue/steps`, `primevue/steps/style`), root barrel exports and the config pass-through type all remain (`primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`). The v4 migration guide lists it under "Deprecated Components" with "Use Stepper without panels" (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`). There is no `@deprecated` tag and no runtime warning in the component.
  - **PrimeReact 10.9.9:** fully active; no deprecation notice (`primereact-10.9.9:components/lib/steps/Steps.js`).
- Showcase menu: **Steps is listed under Menu only in PrimeReact** (`primereact-10.9.9:components/layout/menu.json`). The PrimeNG and PrimeVue menus list only Stepper (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`). PrimeVue's metadata package still groups `Steps` in its `menu` category (`primevue-4.5.5:packages/metadata/src/components/index.ts`).
- Evidence for "no showcase" in PrimeNG/PrimeVue: there is no `apps/showcase/doc/steps/` folder in either archive and no `steps` route in `primeng-21.1.9:apps/showcase/router/app.routes.ts` (only `stepper`, line 245). PrimeNG leaves an orphan page `primeng-21.1.9:apps/showcase/pages/steps/index.ts` that imports six doc files (`@/doc/steps/basic-doc` and the like) that no longer exist, so the page cannot build and is not routed. The generated PrimeNG LLM doc for Steps was still produced (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`).
- Catalog: PrimeVue and PrimeReact have `modules.steps` (PrimeVue also `modules.stepsstyle`); **PrimeNG has no `steps` module in the catalog** (its apidoc index has none), so PrimeNG API facts below come straight from source (`docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`).
- Deprecated members: none tagged in any of the three sources.

## 3. Per framework

**PrimeNG 21.1.9**

- Import: `StepsModule` or the standalone `Steps` from `primeng/steps`; selector `p-steps`. The docs page that used to show the import is gone, the generated doc only shows `StepsModule` in its TypeScript examples (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`).
- Source `primeng-21.1.9:packages/primeng/src/steps/steps.ts`: `class Steps extends BaseComponent`, `componentName = 'Steps'`, standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, provider `StepsStyle`; `StepsModule` imports and exports `Steps` and `SharedModule`.
- Style `primeng-21.1.9:packages/primeng/src/steps/style/stepsstyle.ts` (`StepsStyle extends BaseStyle`, name `steps`, enum `StepsClasses`); entry `primeng-21.1.9:packages/primeng/src/steps/public_api.ts` re-exports only `./steps` and `./style/stepsstyle`.
- There is no `packages/primeng/src/types/steps/` folder (only `stepper`), no `steps` key in the global pass-through map (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts` has only `stepper`) and the component does not use the `Bind` directive, so PrimeNG Steps has no pass-through (`pt`) support.
- The component injects Angular `Router` and `ActivatedRoute` and re-checks itself on every router event, so the application must provide the router.

**PrimeVue 4.5.5**

- Import: `import Steps from 'primevue/steps'`; tag `<Steps>` (`primevue-4.5.5:packages/primevue/package.json` exports `./steps` and `./steps/style`).
- Source `primevue-4.5.5:packages/primevue/src/steps/Steps.vue`, props `primevue-4.5.5:packages/primevue/src/steps/BaseSteps.vue`, types `primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`, style `primevue-4.5.5:packages/primevue/src/steps/style/StepsStyle.js` (+ `StepsStyle.d.ts`).
- Also exported from the root barrel (`Steps`, `StepsStyle`) and typed in the global config as `steps?: DefaultPassThrough<StepsPassThroughOptions>` (`primevue-4.5.5:packages/primevue/src/index.d.ts`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`).
- The API-doc generator input still exists (`primevue-4.5.5:packages/primevue/scripts/components/steps.js`), which is why the catalog carries the module.

**PrimeReact 10.9.9**

- Import: `import { Steps } from 'primereact/steps'` (`primereact-10.9.9:components/doc/steps/importdoc.js`).
- Source `primereact-10.9.9:components/lib/steps/Steps.js` (`React.memo(React.forwardRef(...))`, `displayName = 'Steps'`), defaults and CSS `primereact-10.9.9:components/lib/steps/StepsBase.js`, types `primereact-10.9.9:components/lib/steps/steps.d.ts`, entry fields `primereact-10.9.9:components/lib/steps/package.json`.
- Showcase page `primereact-10.9.9:pages/steps/index.js` (sections Import, Basic, Controlled, Linear, Interactive, Template, Accessibility; plus pass-through and theming tabs).

## 4. Anatomy

| Part        | PrimeNG                               | PrimeVue                      | PrimeReact | Element                                          |
| ----------- | ------------------------------------- | ----------------------------- | ---------- | ------------------------------------------------ |
| Root        | `root` (`data-pc-name="steps"`)       | `root`                        | `root`     | `<nav>`                                          |
| List        | `list` (`data-pc-section="menu"`)     | `list`                        | `menu`     | `<ul>` in PrimeNG, `<ol>` in PrimeVue/PrimeReact |
| Item        | `item` (`data-pc-section="menuitem"`) | `item`                        | `menuitem` | `<li>`                                           |
| Item link   | `itemLink`                            | `itemLink`                    | `action`   | `<a>` (PrimeNG, PrimeReact), `<span>` (PrimeVue) |
| Item number | `itemNumber`                          | `itemNumber`                  | `step`     | `<span>` holding index + 1                       |
| Item label  | `itemLabel`                           | `itemLabel`                   | `label`    | `<span>` with `item.label`                       |
| Item icon   | N/A (`item.icon` is not rendered)     | N/A (not rendered by default) | `icon`     | Icon from `item.icon`                            |

Sources: `primeng-21.1.9:packages/primeng/src/steps/steps.ts`, `primevue-4.5.5:packages/primevue/src/steps/Steps.vue`, `primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`, `primereact-10.9.9:components/lib/steps/Steps.js`, `primereact-10.9.9:components/lib/steps/steps.d.ts`.

- The connector line between circles is drawn by CSS (`.p-steps-item:before`), not by an element, in PrimeNG/PrimeVue (`@primeuix/styles-2.0.3:dist/steps/index.mjs`).
- PrimeReact types the `menu` section as `HTMLUListElement` although the code renders `<ol>` (`primereact-10.9.9:components/lib/steps/steps.d.ts`).
- PrimeNG's link is rendered twice in the template: a `routerLink` variant used when `item.routerLink` is set, the item is not disabled and the component is not read-only, and a plain `href` variant for every other case (`primeng-21.1.9:packages/primeng/src/steps/steps.ts`).

## 5. API highlights

| Aspect             | PrimeNG (source)                                   | PrimeVue                                                                    | PrimeReact                                                         |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Items              | `model: MenuItem[] \| undefined`                   | `model: MenuItem[]`, default `null`                                         | `model: MenuItem[] \| undefined` (required)                        |
| Active step        | `activeIndex: number = 0` (+ `activeIndexChange`)  | `activeStep: number`, default `0` (v-model:`activeStep`)                    | `activeIndex: number`, default `0`                                 |
| Read-only          | `readonly: boolean = true`                         | `readonly: boolean`, default `true`                                         | `readOnly: boolean`, default `true`                                |
| Root id            | N/A (use host `id`)                                | `id: string`                                                                | `id` (default `null`)                                              |
| Inline style/class | `style`, `styleClass`                              | via attrs (`class`, `style`)                                                | `style`, `className`                                               |
| Route exactness    | `exact: boolean = true`                            | N/A                                                                         | N/A                                                                |
| Selection callback | `activeIndexChange: EventEmitter<number>`          | `update:activeStep` (number) and `step-change` (`{ originalEvent, index }`) | `onSelect(e: StepsSelectEvent)` (`{ originalEvent, item, index }`) |
| Per-item callback  | `MenuItem.command({ originalEvent, item, index })` | `MenuItem.command({ originalEvent, item })`                                 | `MenuItem.command({ originalEvent, item, index })`                 |
| Custom item        | N/A                                                | `item` slot                                                                 | `MenuItem.template`                                                |
| Methods            | none public                                        | none                                                                        | `getElement(): HTMLDivElement \| null`                             |
| Pass-through       | N/A                                                | `pt`, `ptOptions`, `dt`, `unstyled`                                         | `pt`, `ptOptions`, `unstyled`                                      |

Sources: `primeng-21.1.9:packages/primeng/src/steps/steps.ts`, `primevue-4.5.5:packages/primevue/src/steps/BaseSteps.vue`, `primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`, `primereact-10.9.9:components/lib/steps/StepsBase.js`, `primereact-10.9.9:components/lib/steps/steps.d.ts`.

- **MenuItem fields used:** `label`, `url`, `target`, `disabled`, `visible`, `command`, `style`. PrimeNG also reads `id`, `routerLink` (+ `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, `skipLocationChange`, `replaceUrl`, `state`, `routerLinkActiveOptions`), `tooltipOptions`, `tabindex` and `escape` (label rendered as HTML when `false`). PrimeVue also reads `class` and accepts functions for `label`, `disabled` and `visible`. PrimeReact also reads `id`, `icon`, `className`, `template` (`primeng-21.1.9:packages/primeng/src/api/menuitem.ts`, `primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`, `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`).
- **Activation order:**
  - PrimeNG: ignore when read-only or disabled; emit `activeIndexChange(i)`; prevent default when the item has neither `url` nor `routerLink`; then run `command`.
  - PrimeVue: ignore when read-only or disabled; run `command`; update the internal active index and emit `update:activeStep` when it changed; always emit `step-change`.
  - PrimeReact: ignore when read-only or disabled; call `onSelect`; then `command`; prevent default and stop propagation when the item has no `url`.
- **Controlled vs uncontrolled:** PrimeNG and PrimeReact do not store the active index themselves (`activeIndex` is the single source of truth, the parent must update it from `activeIndexChange` / `onSelect`). PrimeVue keeps an internal copy (`d_activeStep`) that follows the `activeStep` prop and also changes on click, so it works uncontrolled.
- **PrimeNG active detection:** an item with `routerLink` is active when the router says the resolved URL (relative to the current route) is active; other items compare their index with `activeIndex` (`isActive` in `primeng-21.1.9:packages/primeng/src/steps/steps.ts`).
- **PrimeVue slot scope** for `item`: `{ item, active, label, index, props: StepsRouterBindProps }` where `props` carries `action`, `step` and `label` binding objects (class, handlers and pass-through merged) to spread onto custom elements (`primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`).
- **PrimeReact template options** (second argument of `template`): `onClick`, `className` (`'p-menuitem-link'`), `labelClassName` (`'p-steps-title'`), `numberClassName` (`'p-steps-number'`), `iconClassName`, `'aria-current'` (boolean active), `element` (default content), `props`, `active`, `disabled` (`primereact-10.9.9:components/lib/steps/Steps.js`).
- **PrimeVue typing gap:** `StepsEmitsOptions` is an empty interface although the component declares `emits: ['update:activeStep', 'step-change']` (`primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`, `primevue-4.5.5:packages/primevue/src/steps/Steps.vue`).

## 6. Usage guidance

PrimeNG and PrimeVue no longer ship a Steps showcase page. The PrimeNG points below come from the generated LLM doc, which still lists these sections; PrimeVue has no Steps doc at all (use its Stepper doc, see below).

- **Import:** PrimeReact imports `Steps` from `primereact/steps` (`primereact-10.9.9:components/doc/steps/importdoc.js`).
- **Basic:** supply the `model` of menu items; the component is read-only unless told otherwise (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`, `primereact-10.9.9:components/doc/steps/basicdoc.js`).
- **Controlled:** drive the active step from outside by changing `activeIndex`, for example from external buttons (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`, `primereact-10.9.9:components/doc/steps/controlleddoc.js`).
- **Linear:** with read-only on (the default) the user cannot jump ahead; set `readOnly` to false for non-linear navigation. The enforcement of "complete the previous step" is the application's job, as the component only sets disabled state (`primereact-10.9.9:components/doc/steps/lineardoc.js`).
- **Interactive:** set read-only to false, bind the active index and listen for the change callback (`activeIndexChange` in PrimeNG, `onSelect` in PrimeReact), optionally also giving items a `command` (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`, `primereact-10.9.9:components/doc/steps/interactivedoc.js`).
- **Routing (PrimeNG):** give each item a `routerLink` pointing at a child route and put a `<router-outlet>` below the component; the active item follows the router, so `activeIndex` is not needed (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`). Required service: Angular `Router` provider.
- **Template (PrimeReact):** replace an item's content through its `template`, using the options object to keep the default classes and click handling (`primereact-10.9.9:components/doc/steps/templatedoc.js`).
- **Style (PrimeReact):** class-name table for the structural classes (`primereact-10.9.9:components/doc/steps/styledoc.js`).
- **Replacement path:** when new code needs only a progress indicator, the PrimeNG and PrimeVue showcases show Stepper with a StepList and no panels (`primeng-21.1.9:apps/showcase/doc/stepper/stepsonly.ts`, `primevue-4.5.5:apps/showcase/doc/stepper/StepsOnlyDoc.vue`). See [Stepper](stepper.md).

## 7. Accessibility

- Docs (same text in the generated PrimeNG doc and the PrimeReact doc): `<nav>` root that accepts `aria-label` / `aria-labelledby`; an ordered list; the current step item has `aria-current="step"`. Keyboard table: Tab focuses the active step; Enter and Space activate the focused step; Right/Left arrows, Home and End move focus to the next, previous, first and last step; the activation and arrow rows are all qualified "if readonly is not enabled" (`primeng-21.1.9:apps/showcase/public/llms/components/steps.md`, `primereact-10.9.9:components/doc/steps/accessibilitydoc.js`).
- Source vs docs:
  - **PrimeNG:** sets `aria-current="step"` on the `<li>` when the item is active. The list is a `<ul>`, not an ordered list. Each link carries `role="link"`, `aria-expanded` (true for the active index, which is misleading on a link) and `aria-disabled` (`item.disabled` or read-only on a non-active item). It also writes an attribute literally named `ariaCurrentWhenActive` (not an ARIA attribute) when `exact` is true. Roving tabindex: the active item gets `tabindex` `0` and the others `-1` unless the item sets its own `tabindex`. Arrow/Home/End handlers are not gated by read-only, though read-only links are mostly `tabindex=-1` and cannot take focus (`primeng-21.1.9:packages/primeng/src/steps/steps.ts`).
  - **PrimeVue:** `<ol>` list; `aria-current="step"` on the active `<li>`. The default item content is a `<span>`, so items are not natively focusable. Only the first item is given `tabIndex = 0` on mount, and arrow keys move focus among items; the handlers are bound on the `<li>`. Enter/Space/NumpadEnter call `onItemClick(event, item)` without the index, so the keyboard path passes `index = undefined` (the active step is set to `undefined` and `step-change` reports an undefined index). Custom `item` slots receive `props.action` with `onClick` / `onKeyDown` already wired (`primevue-4.5.5:packages/primevue/src/steps/Steps.vue`).
  - **PrimeReact:** `<ol>` list inside `<nav>`. The `<li>` carries no `aria-current` and no `aria-disabled`; disabled state is only the `p-disabled` class. The boolean `'aria-current'` appears only in the options passed to a custom `template`. The `<ol>` gets `tabIndex="0"` when not read-only, and focusing it forwards focus to the first link; each link is `tabindex="-1"`. Key handling returns early when read-only. The `onBlur` handler returns the function `setFocusToFirstItem` instead of calling it, so it does nothing (`primereact-10.9.9:components/lib/steps/Steps.js`).

## 8. Theming

- **Style classes** (PrimeNG/PrimeVue, from the catalog enum and style files): `p-steps` (+ `p-component`, + `p-readonly` when read-only), `p-steps-list`, `p-steps-item` (+ `p-steps-item-active`, + `p-disabled`), `p-steps-item-link`, `p-steps-item-number`, `p-steps-item-label` (`primeng-21.1.9:packages/primeng/src/steps/style/stepsstyle.ts`, `primevue-4.5.5:packages/primevue/src/steps/style/StepsStyle.js`; catalog `docs/prime-reference/catalog/primevue.json` → `modules.stepsstyle.enumerations.StepsClasses`).
- **Disabled look:** `@primeuix/styles` deliberately resets opacity, pointer events and cursor on `.p-steps-item.p-disabled` and its children, so a "disabled" (non-active, read-only) step looks the same as an enabled one; clickability is expressed only through `cursor: pointer` on `.p-steps:not(.p-readonly) .p-steps-item` (`@primeuix/styles-2.0.3:dist/steps/index.mjs`).
- **Pass-through:**
  - PrimeVue keys: `root`, `list`, `item`, `itemLink`, `itemNumber`, `itemLabel`, `hooks`. The PT context is `StepsContext` `{ item, index, active, disabled }` (`primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`).
  - PrimeReact keys: `root`, `menu`, `menuitem`, `action`, `step`, `label`, `icon`, `hooks`. Step-level sections receive a `context` of `{ index, count, first, last, active, disabled }` from the source, while `StepContext` in the types names the last-but-one flag `selected` (mismatch). Per-item `pt` on a MenuItem is also merged (`primereact-10.9.9:components/lib/steps/Steps.js`, `primereact-10.9.9:components/lib/steps/steps.d.ts`).
  - PrimeNG: N/A (no `pt`, no global PT key).
- **Structural CSS:** `@primeuix/styles-2.0.3:dist/steps/index.mjs` (PrimeNG imports `@primeuix/styles/steps`, PrimeVue the same).
- **Design tokens:** `StepsDesignTokens` groups `root` (`transitionDuration`), `separator` (`background`), `itemLink` (`borderRadius`, `focusRing` {`width`, `style`, `color`, `offset`, `shadow`}, `gap`), `itemLabel` (`color`, `activeColor`, `fontWeight`) and `itemNumber` (`background`, `activeBackground`, `borderColor`, `activeBorderColor`, `color`, `activeColor`, `size`, `fontSize`, `fontWeight`, `borderRadius`, `shadow`) (`@primeuix/themes-2.0.3:types/steps/index.d.ts`). Token paths look like `steps.item.number.active.background` and CSS variables like `--p-steps-item-number-active-background`.
- **Aura values:** the numbered circle is `2rem` with `50%` radius, label weight `500`, link gap `0.5rem`, the separator takes `{content.border.color}` and the active colour is `{primary.color}` (`@primeuix/themes-2.0.3:dist/aura/steps/index.mjs`). Preset copies exist for lara, material and nora in the framework repos (`primeng-21.1.9:packages/themes/src/presets/aura/steps/index.ts`).
- **PrimeReact:** own CSS in `StepsBase.js` (a `@layer primereact` block) with classes `p-steps p-component` (+ `p-readonly`), `p-steps-item` (+ `p-highlight p-steps-current` when active, + `p-disabled`, + `item.className`), `p-menuitem-link`, `p-steps-number`, `p-steps-title`, `p-menuitem-icon`. The CSS gives layout only; colours, circles and connector lines come from the PrimeReact theme files. Tokens N/A (`primereact-10.9.9:components/lib/steps/StepsBase.js`).

## 9. Relationships

- **Replaced by:** [Stepper](stepper.md) with a StepList and no panels (all three migration notes). Stepper has `Step`, `StepList`, `StepPanels`, `StepItem`, `StepPanel` building blocks; Steps has none of them.
- **Sibling legacy menu-style navigation:** [TabMenu](tabmenu.md), replaced by Tabs without panels. Both were deprecated together (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`).
- **Related:** [Breadcrumb](breadcrumb.md) (location trail, not progress), [Menu](menu.md) (MenuItem model and Menu-category siblings).
- **Embeds:** PrimeNG embeds the Tooltip directive (`item.tooltipOptions`) and Angular `RouterLink`; PrimeReact renders item icons through its `IconUtils` helper; PrimeVue embeds nothing.
- **Embedded by:** no other Prime component embeds Steps.
- **Cross-category:** PrimeVue's metadata puts it in the Menu category; PrimeReact lists Steps under Menu and Stepper under Panel; the PrimeNG and PrimeVue menus list only Stepper under Panel (`primevue-4.5.5:packages/metadata/src/components/index.ts`, `primereact-10.9.9:components/layout/menu.json`).

## 10. Dependencies

- PrimeNG: `@angular/common` (`CommonModule`), `@angular/router` (`Router`, `ActivatedRoute`, `RouterModule`), `rxjs` (`Subscription`), `@primeuix/utils` (`find`, `findSingle`), `@primeuix/styles/steps`, `primeng/api` (`MenuItem`, `SharedModule`), `primeng/basecomponent`, `primeng/base` (`BaseStyle`), `primeng/tooltip` (`primeng-21.1.9:packages/primeng/src/steps/steps.ts`, `primeng-21.1.9:packages/primeng/src/steps/style/stepsstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/utils/dom` (`find`, `findSingle`), `@primeuix/styles/steps`, `vue` (`mergeProps`) (`primevue-4.5.5:packages/primevue/src/steps/Steps.vue`, `primevue-4.5.5:packages/primevue/src/steps/BaseSteps.vue`, `primevue-4.5.5:packages/primevue/src/steps/style/StepsStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase`, `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../utils/Utils` (`DomHandler`, `IconUtils`, `ObjectUtils`, `UniqueComponentId`, `classNames`) (`primereact-10.9.9:components/lib/steps/Steps.js`).
- External npm: none beyond the framework (PrimeNG needs `@angular/router` and `rxjs`).

## 11. Framework differences

| Aspect                | PrimeNG 21.1.9                                       | PrimeVue 4.5.5                          | PrimeReact 10.9.9                                    |
| --------------------- | ---------------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| Showcase page         | none (orphan `pages/steps`, docs removed)            | none                                    | yes, under Menu                                      |
| Deprecation notice    | migration docs: deprecated v18/v19, "removed" in v20 | migration guide only, no tag or warning | none                                                 |
| Source still shipped  | yes (despite "removed")                              | yes                                     | yes                                                  |
| Catalog module        | none                                                 | `steps`, `stepsstyle`                   | `steps`                                              |
| Read-only prop        | `readonly`                                           | `readonly`                              | `readOnly`                                           |
| Active-step prop      | `activeIndex`                                        | `activeStep`                            | `activeIndex`                                        |
| Change notification   | `activeIndexChange`                                  | `update:activeStep`, `step-change`      | `onSelect`                                           |
| Uncontrolled use      | no (parent must update `activeIndex`)                | yes (internal `d_activeStep`)           | no                                                   |
| List element          | `<ul>`                                               | `<ol>`                                  | `<ol>`                                               |
| Item link             | `<a>` (`routerLink` or `href`)                       | `<span>` (not focusable by default)     | `<a href>` (`tabindex=-1`)                           |
| Router integration    | built-in via `routerLink`, injects `Router`          | none (custom `item` slot)               | none (`url`, `command`, `template`)                  |
| Custom item rendering | none                                                 | `item` slot                             | `MenuItem.template`                                  |
| Item icon             | not rendered                                         | not rendered by default                 | rendered from `item.icon`                            |
| `aria-current="step"` | on `<li>` when active                                | on `<li>` when active                   | not set (only in template options)                   |
| Pass-through          | none                                                 | `pt` + `dt`                             | `pt`                                                 |
| Active class          | `p-steps-item-active`                                | `p-steps-item-active`                   | `p-highlight p-steps-current`                        |
| Class names           | `p-steps-item-link/-number/-label`                   | `p-steps-item-link/-number/-label`      | `p-menuitem-link`, `p-steps-number`, `p-steps-title` |
| Design tokens         | `@primeuix/themes`                                   | `@primeuix/themes`                      | N/A (theme CSS files)                                |

## 12. Sources

- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/router/app.routes.ts`
- `primeng-21.1.9:apps/showcase/pages/steps/index.ts`
- `primeng-21.1.9:apps/showcase/public/llms/components/steps.md`
- `primeng-21.1.9:apps/showcase/doc/stepper/stepsonly.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`
- `primeng-21.1.9:packages/primeng/src/steps/steps.ts`
- `primeng-21.1.9:packages/primeng/src/steps/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/steps/style/stepsstyle.ts`
- `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:packages/themes/src/presets/aura/steps/index.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/stepper/StepsOnlyDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`
- `primevue-4.5.5:packages/metadata/src/components/index.ts`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/primevue/scripts/components/steps.js`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/index.d.ts`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/primevue/src/steps/Steps.vue`
- `primevue-4.5.5:packages/primevue/src/steps/BaseSteps.vue`
- `primevue-4.5.5:packages/primevue/src/steps/Steps.d.ts`
- `primevue-4.5.5:packages/primevue/src/steps/style/StepsStyle.js`
- `primevue-4.5.5:packages/primevue/src/menuitem/MenuItem.d.ts`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:pages/steps/index.js`
- `primereact-10.9.9:components/lib/steps/Steps.js`
- `primereact-10.9.9:components/lib/steps/StepsBase.js`
- `primereact-10.9.9:components/lib/steps/steps.d.ts`
- `primereact-10.9.9:components/lib/steps/package.json`
- `primereact-10.9.9:components/lib/menuitem/menuitem.d.ts`
- `primereact-10.9.9:components/doc/steps/importdoc.js`
- `primereact-10.9.9:components/doc/steps/basicdoc.js`
- `primereact-10.9.9:components/doc/steps/controlleddoc.js`
- `primereact-10.9.9:components/doc/steps/lineardoc.js`
- `primereact-10.9.9:components/doc/steps/interactivedoc.js`
- `primereact-10.9.9:components/doc/steps/templatedoc.js`
- `primereact-10.9.9:components/doc/steps/styledoc.js`
- `primereact-10.9.9:components/doc/steps/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/steps/index.mjs`
- `@primeuix/themes-2.0.3:types/steps/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/steps/index.mjs`
