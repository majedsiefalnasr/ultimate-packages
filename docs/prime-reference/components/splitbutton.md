# SplitButton

**Category:** Button · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

SplitButton pairs a default action button with a dropdown button that opens a popup menu of secondary actions. The default button runs its own click handler; the dropdown opens a TieredMenu built from a `MenuItem` model, so nested submenus are supported. It shares the Button visual options (severity, raised, rounded, text, outlined, sizes) and offers per-part accessibility props for the two buttons.

## 2. Names & status

| Framework  | Public names                                         | Status                                                                                                                                         |
| ---------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| PrimeNG    | `SplitButton` (`p-splitbutton`), `SplitButtonModule` | Shipped. `styleClass` deprecated since v20.0.0; `showTransitionOptions` / `hideTransitionOptions` deprecated since v21.0.0.                    |
| PrimeVue   | `SplitButton`                                        | Shipped. `menubuttonicon` slot deprecated since v4.0 (use `dropdownicon`); `menuButtonIcon` prop marked deprecated only in a template comment. |
| PrimeReact | `SplitButton`                                        | Shipped. No deprecations declared.                                                                                                             |

Aliases: none. PrimeNG accepts the selector spellings `p-splitbutton`, `p-splitButton`, and `p-split-button`.

## 3. Per framework

### PrimeNG 21.1.9

- **Import:** `import { SplitButtonModule } from 'primeng/splitbutton'` (or the standalone `SplitButton` class).
- **Selector:** `p-splitbutton`.
- **Source:** `primeng-21.1.9:packages/primeng/src/splitbutton/splitbutton.ts`; style `primeng-21.1.9:packages/primeng/src/splitbutton/style/splitbuttonstyle.ts`; types `primeng-21.1.9:packages/primeng/src/types/splitbutton/splitbutton.types.ts`.
- **Sub-components:** none public. Both buttons are `pButton` directive buttons; the menu is a popup `p-tieredmenu`.

### PrimeVue 4.5.5

- **Import:** `import SplitButton from 'primevue/splitbutton'`.
- **Tag:** `<SplitButton>`.
- **Source:** `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.vue`; props in `primevue-4.5.5:packages/primevue/src/splitbutton/BaseSplitButton.vue`; types `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.d.ts`; style `primevue-4.5.5:packages/primevue/src/splitbutton/style/SplitButtonStyle.js`.
- **Sub-components:** none public. Both buttons are PrimeVue `Button` components; the menu is a popup `TieredMenu`.

### PrimeReact 10.9.9

- **Import:** `import { SplitButton } from 'primereact/splitbutton'`.
- **Tag:** `<SplitButton>`.
- **Source:** `primereact-10.9.9:components/lib/splitbutton/SplitButton.js`; defaults, classes, and CSS in `primereact-10.9.9:components/lib/splitbutton/SplitButtonBase.js`; types `primereact-10.9.9:components/lib/splitbutton/splitbutton.d.ts`.
- **Sub-components:** none public. Both buttons are PrimeReact `Button` components; the menu is a popup `TieredMenu`; an optional Tooltip attaches to the root.

## 4. Anatomy

- **root** — wrapper (`p-splitbutton p-component`) with modifier classes for raised, rounded, and (framework-dependent) outlined, text, size, fluid, severity, and disabled.
- **default button** (`pcButton` in PrimeNG/PrimeVue, `button` in PrimeReact) — `p-splitbutton-button` (PrimeNG/PrimeVue) or `p-splitbutton-defaultbutton` (PrimeReact); shows `label` and `icon`.
- **dropdown button** (`pcDropdown` / `menuButton`) — icon-only button with a chevron-down icon by default; `p-splitbutton-dropdown` (PrimeNG/PrimeVue) or `p-splitbutton-menubutton` (PrimeReact).
- **menu** (`pcMenu` / `menu`) — popup TieredMenu rendered from `model`, appended to `body` by default in PrimeNG and PrimeVue.

## 5. API highlights

### Shared props (same name in all three unless noted)

- `label`, `icon`, `model` (`MenuItem[]`), `disabled`, `severity`, `raised`, `rounded`, `text`, `outlined` (all booleans default `false`), `size` (`'small' | 'large'`), `dropdownIcon`, `buttonProps`, `menuButtonProps`, `appendTo`.
- Severity values: PrimeNG `'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast'`; PrimeVue uses `warn`; PrimeReact `'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'contrast' | 'help'`.

### PrimeNG

- Extra inputs: `iconPos` = `'left'`, `plain` = `false` (declared but not used in the template), `tooltip`, `tooltipOptions`, `menuStyle`, `menuStyleClass`, `appendTo` (signal input, default `'body'`), `dir`, `expandAriaLabel`, `motionOptions` (signal input), `autofocus`, `tabindex`, `buttonDisabled` = `false`, `menuButtonDisabled` = `false` (`disabled` sets both).
- `buttonProps: ButtonProps` (`{ ariaLabel }`) and `menuButtonProps: MenuButtonProps` (`{ ariaLabel, ariaHasPopup, ariaExpanded, ariaControls }`).
- Deprecated: `styleClass` (since v20.0.0, use `class`), `showTransitionOptions` (default `'.12s cubic-bezier(0, 0, 0.2, 1)'`) and `hideTransitionOptions` (default `'.1s linear'`), both since v21.0.0 in favour of `motionOptions`.
- Outputs: `onClick(MouseEvent)`, `onDropdownClick(MouseEvent)`, `onMenuShow`, `onMenuHide`.
- Templates: `#content` (replaces the default button content), `#dropdownicon`.
- `raised` and `rounded` only add root classes; they are not forwarded to the inner buttons.

### PrimeVue

- Extra props: `autoZIndex` = `true`, `baseZIndex` = `0`, `appendTo` = `'body'`, `fluid` = `null` (inherits from a Fluid parent), `plain` = `false`, `menuButtonIcon` (superseded by `dropdownIcon`).
- Emits: `click` only.
- Slots: `default` (default-button content), `icon` (`{ class }`), `dropdownicon` (`{ class }`), `menubuttonicon` (**deprecated since v4.0**), `menuitemicon` (`{ item, class }`), `item` (`{ item, hasSubmenu, label, props }`). `buttoncontent` is declared in the types but not rendered by the component.

### PrimeReact

- Extra props: `id`, `style`, `className`, `buttonClassName`, `menuStyle`, `menuClassName`, `menuButtonClassName`, `loading` = `false`, `loadingIcon`, `autoZIndex` = `true`, `baseZIndex` = `0`, `appendTo` (`'self' | HTMLElement | null | function`, default `null`), `tabIndex`, `tooltip`, `tooltipOptions`, `buttonTemplate`, `transitionOptions`, `visible`. `buttonProps` and `menuButtonProps` are typed `any`.
- Events: `onClick(event)`, `onShow()`, `onHide()`.
- Methods: `show()`, `hide()`, `getElement()`.
- Unlike PrimeNG and PrimeVue, `raised` is forwarded to both inner buttons.

## 6. Usage guidance

- **Import** — import from the framework entry point (`primeng-21.1.9:apps/showcase/doc/splitbutton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/ImportDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/importdoc.js`).
- **Basic** — a `label`, a click handler for the default action, and a `model` for the menu (`primeng-21.1.9:apps/showcase/doc/splitbutton/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/BasicDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/basicdoc.js`).
- **Icons** — `icon` on the default button and `dropdownIcon` to replace the chevron (`primeng-21.1.9:apps/showcase/doc/splitbutton/icons-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/IconsDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/iconsdoc.js`).
- **Nested (PrimeNG, PrimeVue)** — model items with `items` children open as TieredMenu submenus (`primeng-21.1.9:apps/showcase/doc/splitbutton/nested-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/NestedDoc.vue`).
- **Severity** — choose a semantic colour (`primeng-21.1.9:apps/showcase/doc/splitbutton/severity-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/SeverityDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/severitydoc.js`).
- **Loading (PrimeReact only)** — `loading` shows a spinner on the default button (`primereact-10.9.9:components/doc/splitbutton/loadingdoc.js`).
- **Disabled** — `disabled` turns off both parts; PrimeNG can also disable either part with `buttonDisabled` / `menuButtonDisabled` (`primeng-21.1.9:apps/showcase/doc/splitbutton/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/DisabledDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/disableddoc.js`).
- **Raised** — elevation shadow (`primeng-21.1.9:apps/showcase/doc/splitbutton/raised-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/RaisedDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/raiseddoc.js`).
- **Rounded** — pill-shaped outer corners (`primeng-21.1.9:apps/showcase/doc/splitbutton/rounded-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/RoundedDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/roundeddoc.js`).
- **Text** — transparent, borderless parts (`primeng-21.1.9:apps/showcase/doc/splitbutton/text-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/TextDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/textdoc.js`).
- **Raised text** — text style combined with `raised` (`primeng-21.1.9:apps/showcase/doc/splitbutton/raisedtext-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/RaisedTextDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/raisedtextdoc.js`).
- **Outlined** — border-only parts (`primeng-21.1.9:apps/showcase/doc/splitbutton/outlined-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/OutlinedDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/outlineddoc.js`).
- **Sizes** — `size="small"` or `size="large"` (`primeng-21.1.9:apps/showcase/doc/splitbutton/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/SizesDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/sizesdoc.js`).
- **Template** — custom default-button content via `#content` (PrimeNG), the default slot (PrimeVue), or a JSX `label` (PrimeReact) (`primeng-21.1.9:apps/showcase/doc/splitbutton/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/TemplateDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/templatedoc.js`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/splitbutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/accessibilitydoc.js`).

## 7. Accessibility

- Both parts are native buttons. The default button's accessible name comes from `label` and can be overridden through `buttonProps`; the icon-only dropdown button needs a name through `menuButtonProps` (PrimeNG also offers `expandAriaLabel`).
- The dropdown button sets `aria-haspopup="true"`, `aria-expanded`, and `aria-controls` pointing at the menu (PrimeVue only while open).
- The popup is a TieredMenu with `role="menu"` and `role="menuitem"` items.
- Keys: Enter / Space activate the default button; Enter, Space, Down Arrow, or Up Arrow on the dropdown button open the menu (the components toggle the menu on Down / Up Arrow); inside the menu Enter activates, Escape closes and returns focus, Down / Up Arrow move, Home / End jump. PrimeReact closes on Escape through its global Escape-key stack (`primereact-10.9.9:components/lib/hooks/useGlobalOnEscapeKey.js`).
- Showcase sources: `primeng-21.1.9:apps/showcase/doc/splitbutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/splitbutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/splitbutton/accessibilitydoc.js`.

## 8. Theming

- **Style module:** `@primeuix/styles/splitbutton` (`@primeuix/styles-2.0.3:dist/splitbutton/index.mjs`), used by PrimeNG (`primeng-21.1.9:packages/primeng/src/splitbutton/style/splitbuttonstyle.ts`) and PrimeVue (`primevue-4.5.5:packages/primevue/src/splitbutton/style/SplitButtonStyle.js`).
- **Catalog classes:** `p-splitbutton`, `p-splitbutton-button`, `p-splitbutton-dropdown`; modifiers `p-splitbutton-raised`, `p-splitbutton-rounded`, `p-splitbutton-fluid` (PrimeVue), and `p-splitbutton-outlined`, `p-splitbutton-text`, `p-splitbutton-sm`, `p-splitbutton-lg` (PrimeNG).
- **Pass-through keys:** PrimeNG `root`, `pcButton`, `pcDropdown`, `pcMenu`; PrimeVue the same plus `hooks`; PrimeReact `root`, `icon`, `button`, `menuButton`, `menu`, `menuList`, `separator`, `menuIcon`, `menuLabel`, `anchor`, `menuItem`, `tooltip`, `hooks`, `transition`.
- **Design tokens:** `@primeuix/themes-2.0.3:types/splitbutton/index.d.ts` defines `root.borderRadius`, `root.roundedBorderRadius`, `root.raisedShadow` (Aura: `@primeuix/themes-2.0.3:dist/aura/splitbutton/index.mjs`). The inner buttons use the Button tokens and the menu uses TieredMenu tokens.
- **PrimeReact:** own CSS string in `primereact-10.9.9:components/lib/splitbutton/SplitButtonBase.js`; root reuses `p-button-<severity>` / `p-button-<size>` classes. Design tokens N/A — PrimeReact 10 does not use `@primeuix/themes`.

## 9. Relationships

- **Embeds:** Button (both parts), TieredMenu (Menu category) as the popup, ChevronDownIcon, Ripple and AutoFocus (PrimeNG), Tooltip (PrimeNG `pTooltip` on the default button, PrimeReact on the root).
- **Embedded by:** none in the shipped sources.
- **Alternatives / related:** Button plus a popup Menu for a dropdown with no default action; SpeedDial for a floating action set; ButtonGroup for a set of independent actions. Consumes the shared `MenuItem` model used by the menu components.

## 10. Dependencies

- **PrimeNG:** internal `primeng/button` (`ButtonDirective`), `primeng/tieredmenu`, `primeng/autofocus`, `primeng/ripple`, `primeng/tooltip`, `primeng/icons`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`; external `@primeuix/motion`, `@primeuix/utils`, `@primeuix/styles`.
- **PrimeVue:** internal `primevue/button`, `primevue/tieredmenu`, `@primevue/icons/chevrondown`; external `@primeuix/utils`, `@primeuix/styles`.
- **PrimeReact:** internal `../api/Api`, `../button/Button`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/chevrondown`, `../overlayservice/OverlayService`, `../tieredmenu/TieredMenu`, `../tooltip/Tooltip`, `../utils/Utils`; no external Prime packages.

## 11. Framework differences

| Aspect                    | PrimeNG                                                  | PrimeVue                    | PrimeReact                                                |
| ------------------------- | -------------------------------------------------------- | --------------------------- | --------------------------------------------------------- |
| Independent part disable  | `buttonDisabled`, `menuButtonDisabled`                   | `disabled` only             | `disabled` only                                           |
| Loading state             | N/A                                                      | N/A                         | `loading`, `loadingIcon`                                  |
| Tooltip                   | `tooltip` on the default button                          | Not built in                | `tooltip` on the root                                     |
| Events                    | `onClick`, `onDropdownClick`, `onMenuShow`, `onMenuHide` | `click` only                | `onClick`, `onShow`, `onHide`                             |
| Menu animation            | `motionOptions` (transition options deprecated)          | N/A (TieredMenu default)    | `transitionOptions`                                       |
| Warning severity          | `warn`                                                   | `warn`                      | `warning`                                                 |
| Part classes              | `p-splitbutton-button`, `p-splitbutton-dropdown`         | Same as PrimeNG             | `p-splitbutton-defaultbutton`, `p-splitbutton-menubutton` |
| `raised` on inner buttons | Root class only                                          | Root class only             | Forwarded to both buttons                                 |
| Imperative API            | None                                                     | None                        | `show()`, `hide()`, `getElement()`                        |
| Styling                   | `@primeuix/styles` + tokens                              | `@primeuix/styles` + tokens | Own CSS in `SplitButtonBase.js`                           |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/splitbutton/splitbutton.ts`
- `primeng-21.1.9:packages/primeng/src/splitbutton/style/splitbuttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/splitbutton/splitbutton.types.ts`
- `primeng-21.1.9:apps/showcase/pages/splitbutton/index.ts`
- `primeng-21.1.9:apps/showcase/doc/splitbutton/reversedkeys-doc.ts`
- `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.vue`
- `primevue-4.5.5:packages/primevue/src/splitbutton/BaseSplitButton.vue`
- `primevue-4.5.5:packages/primevue/src/splitbutton/SplitButton.d.ts`
- `primevue-4.5.5:packages/primevue/src/splitbutton/style/SplitButtonStyle.js`
- `primevue-4.5.5:apps/showcase/pages/splitbutton/index.vue`
- `primevue-4.5.5:apps/showcase/doc/splitbutton/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/splitbutton/theming/index.vue`
- `primereact-10.9.9:components/lib/splitbutton/SplitButton.js`
- `primereact-10.9.9:components/lib/splitbutton/SplitButtonBase.js`
- `primereact-10.9.9:components/lib/splitbutton/splitbutton.d.ts`
- `primereact-10.9.9:components/lib/hooks/useGlobalOnEscapeKey.js`
- `primereact-10.9.9:pages/splitbutton/index.js`
- `@primeuix/styles-2.0.3:dist/splitbutton/index.mjs`
- `@primeuix/themes-2.0.3:types/splitbutton/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/splitbutton/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (`splitbutton`), `docs/prime-reference/catalog/primevue.json` (`splitbutton`, `splitbuttonstyle`), `docs/prime-reference/catalog/primereact.json` (`splitbutton`)
- Showcase doc files cited in §6 and §7.
