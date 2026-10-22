# IconField

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

IconField is a positioning wrapper that overlays one or more icons on a text field. It is always used with its companion **InputIcon**, which holds the icon (an icon class or arbitrary content). The wrapper is relatively positioned; InputIcon is absolutely positioned at the start or end of the field and the field padding is widened to keep text clear of the icon.

## 2. Names & status

- Canonical name: **IconField** (file `iconfield`); companion **InputIcon** (`inputicon`) is recorded here because it has no showcase page of its own in any framework.
- PrimeNG: `IconField` (selectors `p-iconfield`, `p-iconField`, `p-icon-field`) + `InputIcon` (`p-inputicon`, `p-inputIcon`); both stable. Their `styleClass` inputs are deprecated since v20.0.0 (use `class`).
- PrimeVue: `IconField` + `InputIcon`; stable.
- PrimeReact: `IconField` + `InputIcon`; stable. Replaces the older `.p-input-icon-left` / `.p-input-icon-right` wrapper classes that remain in the shared CSS (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`).

## 3. Per framework

### PrimeNG 21.1.9

- Import: `IconFieldModule` from `primeng/iconfield` and `InputIconModule` from `primeng/inputicon` (`primeng-21.1.9:apps/showcase/doc/iconfield/import-doc.ts`).
- Selectors: `p-iconfield, p-iconField, p-icon-field` and `p-inputicon, p-inputIcon`; both project content.
- Source: `primeng-21.1.9:packages/primeng/src/iconfield/iconfield.ts`, `primeng-21.1.9:packages/primeng/src/inputicon/inputicon.ts`; styles `primeng-21.1.9:packages/primeng/src/iconfield/style/iconfieldstyle.ts`, `primeng-21.1.9:packages/primeng/src/inputicon/style/inputiconstyle.ts`; PT types `primeng-21.1.9:packages/primeng/src/types/iconfield/iconfield.types.ts`, `primeng-21.1.9:packages/primeng/src/types/inputicon/inputicon.types.ts`.

### PrimeVue 4.5.5

- Import: `import IconField from 'primevue/iconfield'`, `import InputIcon from 'primevue/inputicon'` (`primevue-4.5.5:apps/showcase/doc/iconfield/ImportDoc.vue`).
- Tags: `<IconField>` renders a `<div>`; `<InputIcon>` renders `<span aria-hidden="true">`.
- Source: `primevue-4.5.5:packages/primevue/src/iconfield/IconField.vue`, `primevue-4.5.5:packages/primevue/src/iconfield/BaseIconField.vue`, `primevue-4.5.5:packages/primevue/src/iconfield/IconField.d.ts`, `primevue-4.5.5:packages/primevue/src/inputicon/InputIcon.vue`, `primevue-4.5.5:packages/primevue/src/inputicon/InputIcon.d.ts`; styles `primevue-4.5.5:packages/primevue/src/iconfield/style/IconFieldStyle.js`, `primevue-4.5.5:packages/primevue/src/inputicon/style/InputIconStyle.js`.

### PrimeReact 10.9.9

- Import: `import { IconField } from 'primereact/iconfield'`, `import { InputIcon } from 'primereact/inputicon'` (`primereact-10.9.9:components/doc/iconfield/importdoc.js`).
- Tags: `<IconField>` renders a `<div>`; `<InputIcon>` renders a `<span>`.
- Source: `primereact-10.9.9:components/lib/iconfield/IconField.js`, `primereact-10.9.9:components/lib/iconfield/IconFieldBase.js`, `primereact-10.9.9:components/lib/iconfield/IconField.d.ts`, `primereact-10.9.9:components/lib/inputicon/InputIcon.js`, `primereact-10.9.9:components/lib/inputicon/InputIconBase.js`, `primereact-10.9.9:components/lib/inputicon/InputIcon.d.ts`.

## 4. Anatomy

- **root** (IconField) — `p-iconfield` (PrimeReact `p-icon-field`).
- **icon** (InputIcon) — `p-inputicon` (PrimeReact `p-input-icon`), placed before the field (start icon) or after it (end icon).
- **field** — an InputText or another `.p-inputwrapper` component.

## 5. API highlights

- PrimeNG IconField: `@Input() iconPosition: 'right' | 'left' = 'left'` (adds `p-iconfield-left` / `p-iconfield-right`); `styleClass` (deprecated since v20.0.0). InputIcon: `styleClass` (deprecated), `hostName`. Both inherit `pt`, `ptOptions`, `unstyled`, `dt`.
- PrimeVue IconField/InputIcon: no own props beyond inherited `pt`, `ptOptions`, `unstyled`, `dt` (InputIcon accepts `class`); slot `default`. Icon side is determined purely by DOM order (`:first-child` / `:last-child` CSS).
- PrimeReact IconField: `iconPosition?: 'left' | 'right'`, default `'right'` (`IconFieldBase.js`), adds `p-icon-field-left`/`-right`, and passes the position to InputIcon children via metadata; `children`, `pt`, `ptOptions`, `unstyled`. InputIcon: `children`, `className`, `pt`, `ptOptions`, `unstyled`.

## 6. Usage guidance

- Wrap the field plus an InputIcon in IconField; place the InputIcon before or after the field to choose the side (`primeng-21.1.9:apps/showcase/doc/iconfield/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iconfield/BasicDoc.vue`, `primereact-10.9.9:components/doc/iconfield/basicdoc.js`).
- InputIcon can contain custom content (e.g. a keyboard hint or spinner) instead of an icon class (`primevue-4.5.5:apps/showcase/doc/iconfield/TemplateDoc.vue`, `primeng-21.1.9:apps/showcase/doc/iconfield/template-doc.ts`, `primereact-10.9.9:components/doc/iconfield/templatedoc.js`).
- Combine with FloatLabel and IftaLabel (`primeng-21.1.9:apps/showcase/doc/iconfield/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iconfield/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/IftaLabelDoc.vue`).
- The icon scales with the field size (`pSize` in PrimeNG, `size` in PrimeVue) via `.p-iconfield:has(.p-inputfield-sm|lg)` (`primeng-21.1.9:apps/showcase/doc/iconfield/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iconfield/SizesDoc.vue`).
- No services required.

## 7. Accessibility

- Neither component needs roles or ARIA; no interactive elements (`primeng-21.1.9:apps/showcase/doc/iconfield/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iconfield/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/iconfield/accessibilitydoc.js`).
- PrimeVue InputIcon hard-codes `aria-hidden="true"`; PrimeNG and PrimeReact do not, so decorative icons there should be hidden by the author when they carry no meaning.

## 8. Theming

- Classes: `p-iconfield`, `p-inputicon` (PrimeNG also `p-iconfield-left`/`-right`); PrimeReact `p-icon-field`, `p-icon-field-left`/`-right`, `p-input-icon`.
- PT keys: PrimeNG IconField `host`, `root`; InputIcon `host`, `root`; PrimeVue `root` each; PrimeReact `root` each. PrimeReact's global `PrimeReactPTOptions` has no `iconfield`/`inputicon` key (`primereact-10.9.9:components/lib/api/api.d.ts`).
- Design tokens (`@primeuix/themes-2.0.3:types/iconfield/index.d.ts`): single section `icon` (`color`). InputIcon has no token set; sizing uses global `icon.size` and `form.field.*` tokens. Aura preset `@primeuix/themes-2.0.3:dist/aura/iconfield/index.mjs`.
- Style module `@primeuix/styles-2.0.3:dist/iconfield/index.mjs` styles both `.p-iconfield` and `.p-inputicon` (PrimeNG's `inputiconstyle.ts` imports no `@primeuix/styles` module).
- PrimeReact: no CSS in `IconFieldBase.js`; layout comes from the theme CSS. Design tokens N/A.

## 9. Relationships

- Embeds: InputIcon (companion); wraps InputText or `.p-inputwrapper` components (AutoComplete, DatePicker, InputMask, InputNumber, Password, Select, …).
- Combines with [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md), and sits inside [InputGroup](inputgroup.md).
- Relationship with [InputText](inputtext.md): field padding rules key off `.p-inputtext` inside `.p-iconfield`.

## 10. Dependencies

- PrimeNG: `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/iconfield`.
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/iconfield`.
- PrimeReact: `ComponentBase`, `PrimeReactContext`, utils.
- No external npm dependency.

## 11. Framework differences

| Aspect              | PrimeNG                               | PrimeVue              | PrimeReact             |
| ------------------- | ------------------------------------- | --------------------- | ---------------------- |
| `iconPosition` prop | yes, default `'left'`                 | none (DOM order only) | yes, default `'right'` |
| Root class          | `p-iconfield`                         | `p-iconfield`         | `p-icon-field`         |
| InputIcon class     | `p-inputicon`                         | `p-inputicon`         | `p-input-icon`         |
| InputIcon ARIA      | none                                  | `aria-hidden="true"`  | none                   |
| Deprecated inputs   | `styleClass` on both (since v20.0.0)  | —                     | —                      |
| Styling source      | `@primeuix/styles/iconfield` + tokens | same                  | theme CSS; tokens N/A  |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/iconfield/iconfield.ts`, `primeng-21.1.9:packages/primeng/src/iconfield/style/iconfieldstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/iconfield/iconfield.types.ts`
- `primeng-21.1.9:packages/primeng/src/inputicon/inputicon.ts`, `primeng-21.1.9:packages/primeng/src/inputicon/style/inputiconstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputicon/inputicon.types.ts`
- `primeng-21.1.9:apps/showcase/doc/iconfield/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/template-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/sizes-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iconfield/accessibility-doc.ts`
- `primevue-4.5.5:packages/primevue/src/iconfield/IconField.vue`, `primevue-4.5.5:packages/primevue/src/iconfield/BaseIconField.vue`, `primevue-4.5.5:packages/primevue/src/iconfield/IconField.d.ts`, `primevue-4.5.5:packages/primevue/src/iconfield/style/IconFieldStyle.js`
- `primevue-4.5.5:packages/primevue/src/inputicon/InputIcon.vue`, `primevue-4.5.5:packages/primevue/src/inputicon/InputIcon.d.ts`, `primevue-4.5.5:packages/primevue/src/inputicon/style/InputIconStyle.js`
- `primevue-4.5.5:apps/showcase/doc/iconfield/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/TemplateDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/SizesDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iconfield/AccessibilityDoc.vue`
- `primereact-10.9.9:components/lib/iconfield/IconField.js`, `primereact-10.9.9:components/lib/iconfield/IconFieldBase.js`, `primereact-10.9.9:components/lib/iconfield/IconField.d.ts`, `primereact-10.9.9:components/lib/inputicon/InputIcon.js`, `primereact-10.9.9:components/lib/inputicon/InputIconBase.js`, `primereact-10.9.9:components/lib/inputicon/InputIcon.d.ts`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/doc/iconfield/importdoc.js`, `primereact-10.9.9:components/doc/iconfield/basicdoc.js`, `primereact-10.9.9:components/doc/iconfield/templatedoc.js`, `primereact-10.9.9:components/doc/iconfield/accessibilitydoc.js`
- `@primeuix/styles-2.0.3:dist/iconfield/index.mjs`
- `@primeuix/themes-2.0.3:types/iconfield/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/iconfield/index.mjs`
