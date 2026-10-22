# Button

**Category:** Button · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Button is the basic action trigger of the Prime suite. It wraps a native `<button>` element and adds a label, an optional icon at one of four positions, a loading state with a spinner, an optional badge, severities, size variants, and visual variants such as raised, rounded, text, outlined, and link. All three frameworks also ship a ButtonGroup container that renders its child buttons as one connected segment. PrimeNG also ships an attribute-directive form (`pButton`) with helper directives for the label and icon parts.

## 2. Names & status

| Framework  | Public names                                                                                                                                                                                   | Status                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| PrimeNG    | `Button` (`p-button`), `ButtonDirective` (`[pButton]`), `ButtonLabel` (`[pButtonLabel]`), `ButtonIcon` (`[pButtonIcon]`), `ButtonModule`; `ButtonGroup` (`p-buttongroup`), `ButtonGroupModule` | Shipped. Several directive inputs are deprecated (see §5).     |
| PrimeVue   | `Button`, `ButtonGroup`                                                                                                                                                                        | Shipped. `plain` is deprecated since v4.2.0.                   |
| PrimeReact | `Button`, `ButtonGroup`                                                                                                                                                                        | Shipped. No deprecations are declared in the type definitions. |

Aliases: none. The PrimeNG ButtonGroup accepts three selector spellings (`p-buttonGroup`, `p-buttongroup`, `p-button-group`).

## 3. Per framework

### PrimeNG 21.1.9

- **Import:** `import { ButtonModule } from 'primeng/button'` (or the standalone `Button` / `ButtonDirective` / `ButtonLabel` / `ButtonIcon` classes); `ButtonGroupModule` / `ButtonGroup` from `primeng/buttongroup`.
- **Selectors:** `p-button` (component), `[pButton]` (directive on a native `<button>` or `<a>`), `[pButtonLabel]`, `[pButtonIcon]`, `p-buttongroup`.
- **Entry points:** `primeng-21.1.9:packages/primeng/src/button/public_api.ts`, `primeng-21.1.9:packages/primeng/src/buttongroup/public_api.ts`.
- **Source:** `primeng-21.1.9:packages/primeng/src/button/button.ts` holds all four Button classes and `ButtonModule`; `primeng-21.1.9:packages/primeng/src/buttongroup/buttongroup.ts` holds ButtonGroup.
- **Types:** `primeng-21.1.9:packages/primeng/src/types/button/button.types.ts` (pass-through options, templates, `ButtonProps`). There is no `types/buttongroup` folder; ButtonGroup has no typed API.
- **Sub-parts:**
  - `ButtonDirective` turns the host element into a Prime button by adding classes imperatively after view init, and creates icon and label `<span>` elements itself when `icon` / `label` inputs are used.
  - `ButtonLabel` and `ButtonIcon` mark projected children as the label (`p-button-label`) and icon (`p-button-icon`); the directive uses their presence to decide icon-only styling.
  - `ButtonGroup` renders a `<span class="p-buttongroup p-component" role="group">` around projected content.

### PrimeVue 4.5.5

- **Import:** `import Button from 'primevue/button'`; `import ButtonGroup from 'primevue/buttongroup'`.
- **Tag:** `<Button>`, `<ButtonGroup>`.
- **Source:** `primevue-4.5.5:packages/primevue/src/button/Button.vue` with props in `primevue-4.5.5:packages/primevue/src/button/BaseButton.vue` and types in `primevue-4.5.5:packages/primevue/src/button/Button.d.ts`; ButtonGroup in `primevue-4.5.5:packages/primevue/src/buttongroup/ButtonGroup.vue`, `primevue-4.5.5:packages/primevue/src/buttongroup/BaseButtonGroup.vue`, `primevue-4.5.5:packages/primevue/src/buttongroup/ButtonGroup.d.ts`.
- **Rendering:** Button renders a dynamic element chosen by `as` (default `BUTTON`); with `asChild` it renders nothing itself and hands classes and accessibility attributes to the default slot (headless mode). ButtonGroup renders a `<span role="group">` around its default slot.
- **Sub-components:** none beyond ButtonGroup; Button embeds Badge.

### PrimeReact 10.9.9

- **Import:** `import { Button } from 'primereact/button'`; `import { ButtonGroup } from 'primereact/buttongroup'`.
- **Tag:** `<Button>`, `<ButtonGroup>`.
- **Source:** `primereact-10.9.9:components/lib/button/Button.js` with defaults and classes in `primereact-10.9.9:components/lib/button/ButtonBase.js` and types in `primereact-10.9.9:components/lib/button/button.d.ts`; ButtonGroup in `primereact-10.9.9:components/lib/buttongroup/ButtonGroup.js`, `primereact-10.9.9:components/lib/buttongroup/ButtonGroupBase.js`, `primereact-10.9.9:components/lib/buttongroup/buttongroup.d.ts`.
- **Rendering:** Button is a memoised `forwardRef` component that renders a native `<button>`, returns nothing when `visible` is false, and attaches a Tooltip when `tooltip` is set. ButtonGroup renders a `<span role="group">` and adds `p-button-group-single` when it has exactly one child.

## 4. Anatomy

- **root** — the native `<button>` (PrimeNG component and directive, PrimeReact) or the element chosen by `as` (PrimeVue). Carries `p-button p-component` plus modifier classes.
- **icon** — `<span class="p-button-icon p-button-icon-<pos>">` (PrimeNG/PrimeVue) or `p-button-icon p-c` (PrimeReact); replaced by the loading icon while `loading` is true.
- **loadingIcon** — spinner (`SpinnerIcon` component, or an inline SVG in the PrimeNG directive) or a custom `loadingIcon` class, carrying `p-button-loading-icon`.
- **label** — `<span class="p-button-label">`. PrimeReact renders a non-breaking-space label span when neither `label` nor children are given. PrimeNG marks the label `aria-hidden` when an icon is present without a label.
- **pcBadge / badge** — embedded Badge component showing `badge`.
- **ButtonGroup root** — `<span role="group">` with class `p-buttongroup` (PrimeNG, PrimeVue) or `p-button-group` (PrimeReact).

## 5. API highlights

### PrimeNG — `p-button` component

- Inputs: `type` = `'button'`, `label`, `icon`, `iconPos: ButtonIconPosition` (`'left' | 'right' | 'top' | 'bottom'`) = `'left'`, `badge`, `badgeSeverity` = `'secondary'`, `badgeClass` (**deprecated**, use `badgeSeverity`), `loading` = `false`, `loadingIcon`, `disabled`, `severity: ButtonSeverity` (`'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast'`), `raised` / `rounded` / `text` / `plain` / `outlined` / `link` = `false`, `variant: 'outlined' | 'text'`, `size: 'small' | 'large'`, `fluid` (signal input; also inherited from a parent Fluid), `tabindex`, `ariaLabel`, `autofocus`, `style`, `styleClass` (deprecated since v20 in favour of `class`), `buttonProps: ButtonProps`.
- Outputs: `onClick(MouseEvent)`, `onFocus(FocusEvent)`, `onBlur(FocusEvent)`.
- Templates: `#content` (replaces the inner content), `#icon` (context `ButtonIconTemplateContext { class, pt }`), `#loadingicon`; `pTemplate` names `content`, `icon`, `loadingicon`.
- The native `disabled` attribute is set when `disabled` or `loading` is true.

### PrimeNG — `[pButton]` directive and helpers

- `ButtonDirective` inputs: `text`, `plain`, `raised`, `outlined`, `rounded` (all `false`), `size: 'small' | 'large'`, `iconPos` = `'left'`, `severity`, `loading`, `loadingIcon`, `fluid` (signal), `pButtonPT`, `pButtonUnstyled`. Deprecated: `label` ("use pButtonLabel directive"), `icon` ("use pButtonIcon directive"), `buttonProps` ("assign props directly to the button element"), `ptButtonDirective` (use `pButtonPT`). There is no `link` or `variant` input on the directive.
- `ButtonLabel` inputs: `pButtonLabelPT`, `pButtonLabelUnstyled`; `ptButtonLabel` is deprecated in favour of `pButtonLabelPT`.
- `ButtonIcon` inputs: `pButtonIconPT`, plus an unstyled flag named `pButtonUnstyled` (not `pButtonIconUnstyled`); `ptButtonIcon` is deprecated in favour of `pButtonIconPT`.
- `ButtonGroup` has no inputs, outputs, or pass-through options.

### PrimeVue

- Props: `label`, `icon`, `iconPos` = `'left'`, `iconClass`, `badge`, `badgeClass`, `badgeSeverity` = `'secondary'`, `loading` = `false`, `loadingIcon`, `as` = `'BUTTON'` (string or component), `asChild` = `false`, `link` = `false`, `severity` (`'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'`, hinted string), `raised` / `rounded` / `text` / `outlined` = `false`, `size`, `variant` (`'outlined' | 'text' | 'link'`), `plain` (**deprecated since v4.2.0**, use the `contrast` severity), `fluid` = `null` (falls back to an injected Fluid parent). Native button attributes pass through (`ButtonProps` extends `ButtonHTMLAttributes`).
- Slots: `default` (replaces icon, label, and badge; with `asChild` it receives `{ class, a11yAttrs }`), `icon` (`{ class }`), `loadingicon`.
- Emits: none declared (`ButtonEmitsOptions` is empty); native events pass through.
- ButtonGroup: props `dt`, `pt`, `ptOptions`, `unstyled`; `default` slot only.

### PrimeReact

- Props: `label`, `icon` (`IconType`), `iconPos` = `'left'`, `badge`, `badgeClassName`, `loading` = `false`, `loadingIcon`, `disabled` = `false`, `severity` (`'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'`), `size` (`'small' | 'large'`), `raised` / `rounded` / `text` / `outlined` / `link` / `plain` = `false`, `tooltip`, `tooltipOptions`, `visible` = `true`, `pt`, `ptOptions`, `unstyled`, plus native button attributes.
- No `variant` prop; visual variants are boolean props only. Events are native (`onClick` etc.).
- ButtonGroup: `pt`, `ptOptions`, `unstyled`, `children`.

## 6. Usage guidance

- **Import** — bring in the module or component from its framework entry point (`primeng-21.1.9:apps/showcase/doc/button/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/ImportDoc.vue`, `primereact-10.9.9:components/doc/button/importdoc.js`).
- **Basic** — a button with just a `label` and a click handler (`primeng-21.1.9:apps/showcase/doc/button/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/BasicDoc.vue`, `primereact-10.9.9:components/doc/button/basicdoc.js`).
- **Directive (PrimeNG only)** — apply `pButton` to a native button and mark children with `pButtonIcon` and `pButtonLabel` (`primeng-21.1.9:apps/showcase/doc/button/directive-doc.ts`).
- **Link** — PrimeNG uses the `link` input and also applies `pButton` to an `<a>` with `href` or `routerLink`; PrimeVue uses `variant="link"`, `as="a"`, or `asChild`; PrimeReact uses `link` with a click handler (`primeng-21.1.9:apps/showcase/doc/button/link-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/LinkDoc.vue`, `primereact-10.9.9:components/doc/button/linkdoc.js`).
- **Icons** — set `icon` and position it with `iconPos` left, right, top, or bottom (`primeng-21.1.9:apps/showcase/doc/button/icons-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/IconsDoc.vue`, `primereact-10.9.9:components/doc/button/iconsdoc.js`).
- **Loading** — `loading` swaps the icon for a spinner and disables the button (`primeng-21.1.9:apps/showcase/doc/button/loading-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/LoadingDoc.vue`, `primereact-10.9.9:components/doc/button/loadingdoc.js`).
- **Severity** — choose a semantic colour; PrimeReact spells the warning severity `warning`, the others `warn` (`primeng-21.1.9:apps/showcase/doc/button/severity-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/SeverityDoc.vue`, `primereact-10.9.9:components/doc/button/severitydoc.js`).
- **Disabled** — `disabled` blocks interaction (`primeng-21.1.9:apps/showcase/doc/button/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/DisabledDoc.vue`, `primereact-10.9.9:components/doc/button/disableddoc.js`).
- **Raised** — adds an elevation shadow (`primeng-21.1.9:apps/showcase/doc/button/raised-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/RaisedDoc.vue`, `primereact-10.9.9:components/doc/button/raiseddoc.js`).
- **Rounded** — pill-shaped corners (`primeng-21.1.9:apps/showcase/doc/button/rounded-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/RoundedDoc.vue`, `primereact-10.9.9:components/doc/button/roundeddoc.js`).
- **Text** — a borderless, transparent button; PrimeNG and PrimeVue demos use `variant="text"`, PrimeReact uses `text` (`primeng-21.1.9:apps/showcase/doc/button/text-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/TextDoc.vue`, `primereact-10.9.9:components/doc/button/textdoc.js`).
- **Raised text** — combine the text variant with `raised` (`primeng-21.1.9:apps/showcase/doc/button/raisedtext-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/RaisedTextDoc.vue`, `primereact-10.9.9:components/doc/button/raisedtextdoc.js`).
- **Outlined** — border only, no fill; `variant="outlined"` in PrimeNG/PrimeVue demos, `outlined` in PrimeReact (`primeng-21.1.9:apps/showcase/doc/button/outlined-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/OutlinedDoc.vue`, `primereact-10.9.9:components/doc/button/outlineddoc.js`).
- **Icon only** — omit the label for a square icon button and give it an accessible name (`primeng-21.1.9:apps/showcase/doc/button/iconsonly-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/IconOnlyDoc.vue`, `primereact-10.9.9:components/doc/button/icononlydoc.js`).
- **Badge** — show a count with `badge` and colour it with `badgeSeverity` (PrimeNG/PrimeVue) or `badgeClassName` (PrimeReact) (`primeng-21.1.9:apps/showcase/doc/button/badge-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/BadgeDoc.vue`, `primereact-10.9.9:components/doc/button/badgesdoc.js`).
- **Button group** — wrap related buttons in ButtonGroup so they render as one segment (`primeng-21.1.9:apps/showcase/doc/button/buttongroup-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/ButtonGroupDoc.vue`, `primereact-10.9.9:components/doc/button/buttongroupdoc.js`).
- **Sizes** — `size="small"` or `size="large"` (`primeng-21.1.9:apps/showcase/doc/button/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/SizesDoc.vue`, `primereact-10.9.9:components/doc/button/sizesdoc.js`).
- **Template** — replace the default content with custom markup through projected content, the default slot, or children (`primeng-21.1.9:apps/showcase/doc/button/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/TemplateDoc.vue`, `primereact-10.9.9:components/doc/button/templatedoc.js`).
- **Headless (PrimeVue only)** — `asChild` with `a11yAttrs` from the slot to render a fully custom element (`primevue-4.5.5:apps/showcase/doc/button/HeadlessDoc.vue`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/button/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/button/accessibilitydoc.js`).

## 7. Accessibility

- The component renders a native `<button>` (PrimeVue: unless `as` / `asChild` changes the element), so it gets the button role and keyboard handling from the browser.
- Accessible name: `ariaLabel` / `aria-label` when given; otherwise the visible label. PrimeVue and PrimeReact build the `aria-label` from the label plus the badge value when a badge is present. Icon-only buttons need an explicit label.
- Keyboard: Tab moves focus to the button; Enter and Space activate it.
- PrimeNG marks the label `aria-hidden` when an icon is shown without a label. Loading sets the native `disabled` attribute in all three frameworks.
- ButtonGroup sets `role="group"` on its wrapper in all three frameworks; none of them adds an accessible name to the group.
- Showcase sources: `primeng-21.1.9:apps/showcase/doc/button/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/button/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/button/accessibilitydoc.js`.

## 8. Theming

- **Style module:** `@primeuix/styles/button` (`@primeuix/styles-2.0.3:dist/button/index.mjs`) and `@primeuix/styles/buttongroup` (`@primeuix/styles-2.0.3:dist/buttongroup/index.mjs`), used by PrimeNG (`primeng-21.1.9:packages/primeng/src/button/style/buttonstyle.ts`, `primeng-21.1.9:packages/primeng/src/buttongroup/style/buttongroupstyle.ts`) and PrimeVue (`primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`, `primevue-4.5.5:packages/primevue/src/buttongroup/style/ButtonGroupStyle.js`). The PrimeNG ButtonGroup style adds its own rules for `p-button` host elements inside the group.
- **Catalog classes:** `p-button`, `p-button-icon`, `p-button-label`, `p-button-loading-icon`; ButtonGroup `p-buttongroup`. Modifier classes include `p-button-icon-only`, `p-button-vertical`, `p-button-loading`, `p-button-link`, `p-button-<severity>`, `p-button-raised`, `p-button-rounded`, `p-button-text`, `p-button-outlined`, `p-button-sm`, `p-button-lg`, `p-button-plain`, `p-button-fluid`.
- **Pass-through keys:** PrimeNG `host`, `root`, `loadingIcon`, `icon`, `label`, `pcBadge`; PrimeVue `root`, `loadingIcon`, `icon`, `label`, `pcBadge`, `hooks` (ButtonGroup `root`, `hooks`); PrimeReact `root`, `loadingIcon`, `icon`, `label`, `badge`, `tooltip`, `hooks` (ButtonGroup `root`, `hooks`).
- **Design tokens:** `@primeuix/themes-2.0.3:types/button/index.d.ts` defines sections `root`, `outlined`, `text`, `link`. `root` covers radius, rounded radius, gap, padding, icon-only width, `sm` / `lg` sizing, label font weight, raised shadow, focus ring, badge size, transition duration, and per-severity colour sets (`primary`, `secondary`, `info`, `success`, `warn`, `help`, `danger`, `contrast`) for background, border, and text in rest / hover / active states plus focus ring. `outlined` and `text` repeat per-severity colours plus `plain`; `link` holds `color`, `hoverColor`, `activeColor`. Aura values are in `@primeuix/themes-2.0.3:dist/aura/button/index.mjs`. There are no ButtonGroup tokens.
- **PrimeReact:** ships its own CSS rather than `@primeuix/styles`. Button and ButtonGroup base rules live in `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`; class maps are in `primereact-10.9.9:components/lib/button/ButtonBase.js` and `primereact-10.9.9:components/lib/buttongroup/ButtonGroupBase.js`. Design tokens: N/A — PrimeReact 10 uses theme stylesheets, not `@primeuix/themes` tokens.

## 9. Relationships

- **Embeds:** Badge (all), Ripple (all), SpinnerIcon (all), AutoFocus (PrimeNG), Tooltip (PrimeReact `tooltip` prop).
- **Embedded by:** SpeedDial (toggler and action buttons), SplitButton (main and dropdown buttons), and many other components that render action buttons.
- **Alternatives / related:** ButtonGroup for connected segments; SplitButton when the button needs a menu of secondary actions; SpeedDial for a floating action menu.

## 10. Dependencies

- **PrimeNG:** internal `primeng/api`, `primeng/autofocus`, `primeng/badge`, `primeng/basecomponent`, `primeng/bind`, `primeng/fluid`, `primeng/icons`, `primeng/ripple`; external `@primeuix/utils` and `@primeuix/styles`.
- **PrimeVue:** internal `primevue/badge`, `primevue/ripple`, `@primevue/icons/spinner`, `@primevue/core/basecomponent`; external `@primeuix/utils`, `@primeuix/styles`.
- **PrimeReact:** internal `../api/Api`, `../badge/Badge`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/spinner`, `../ripple/Ripple`, `../tooltip/Tooltip`, `../utils/Utils`; no external Prime packages.

## 11. Framework differences

| Aspect             | PrimeNG                                                               | PrimeVue                                                | PrimeReact                                   |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| Forms              | Component `p-button` and directive `[pButton]` with helper directives | Component only                                          | Component only                               |
| Variant API        | `variant: 'outlined' \| 'text'` on the component; booleans too        | `variant: 'outlined' \| 'text' \| 'link'`; booleans too | Booleans only (`outlined`, `text`, `link`)   |
| Warning severity   | `warn`                                                                | `warn`                                                  | `warning`                                    |
| `primary` severity | Allowed                                                               | Not in the hint list                                    | Not in the type                              |
| Render element     | Native `<button>` (directive: any host)                               | `as` / `asChild` (headless)                             | Native `<button>`                            |
| Badge colour       | `badgeSeverity` (`badgeClass` deprecated)                             | `badgeSeverity`, `badgeClass`                           | `badgeClassName`                             |
| Tooltip            | Not built in                                                          | Not built in                                            | `tooltip` / `tooltipOptions` props           |
| Hide               | N/A                                                                   | N/A                                                     | `visible` prop                               |
| ButtonGroup class  | `p-buttongroup`                                                       | `p-buttongroup`                                         | `p-button-group` (+ `p-button-group-single`) |
| Styling            | `@primeuix/styles` + tokens                                           | `@primeuix/styles` + tokens                             | Own CSS in `ComponentBase.js`                |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:packages/primeng/src/button/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/button/style/buttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/button/button.types.ts`
- `primeng-21.1.9:packages/primeng/src/buttongroup/buttongroup.ts`
- `primeng-21.1.9:packages/primeng/src/buttongroup/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/buttongroup/style/buttongroupstyle.ts`
- `primeng-21.1.9:apps/showcase/pages/button/index.ts`
- `primeng-21.1.9:apps/showcase/doc/button/buttonset-doc.ts`
- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/button/BaseButton.vue`
- `primevue-4.5.5:packages/primevue/src/button/Button.d.ts`
- `primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`
- `primevue-4.5.5:packages/primevue/src/buttongroup/ButtonGroup.vue`
- `primevue-4.5.5:packages/primevue/src/buttongroup/BaseButtonGroup.vue`
- `primevue-4.5.5:packages/primevue/src/buttongroup/ButtonGroup.d.ts`
- `primevue-4.5.5:packages/primevue/src/buttongroup/style/ButtonGroupStyle.js`
- `primevue-4.5.5:apps/showcase/pages/button/index.vue`
- `primevue-4.5.5:apps/showcase/doc/button/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/button/theming/index.vue`
- `primereact-10.9.9:components/lib/button/Button.js`
- `primereact-10.9.9:components/lib/button/ButtonBase.js`
- `primereact-10.9.9:components/lib/button/button.d.ts`
- `primereact-10.9.9:components/lib/buttongroup/ButtonGroup.js`
- `primereact-10.9.9:components/lib/buttongroup/ButtonGroupBase.js`
- `primereact-10.9.9:components/lib/buttongroup/buttongroup.d.ts`
- `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/doc/button/styledoc.js`
- `primereact-10.9.9:pages/button/index.js`
- `@primeuix/styles-2.0.3:dist/button/index.mjs`
- `@primeuix/styles-2.0.3:dist/buttongroup/index.mjs`
- `@primeuix/themes-2.0.3:types/button/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/button/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (`button`, `buttongroup`), `docs/prime-reference/catalog/primevue.json` (`button`, `buttongroup`, `buttonstyle`, `buttongroupstyle`), `docs/prime-reference/catalog/primereact.json` (`button`, `buttongroup`)
- Showcase doc files cited in §6 and §7.
