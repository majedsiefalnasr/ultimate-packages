# FloatLabel

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

FloatLabel is a layout wrapper that pairs a form field with its `<label>` and moves the label above (or into, or onto the border of) the field once the field is focused or holds a value. It renders no interactive element of its own; the floating effect is pure CSS driven by the state classes and pseudo-classes of the wrapped field.

## 2. Names & status

- Canonical name: **FloatLabel** (file `floatlabel`).
- PrimeNG: `FloatLabel` component, selectors `p-floatlabel`, `p-floatLabel`, `p-float-label`; stable.
- PrimeVue: `FloatLabel` component; stable.
- PrimeReact: `FloatLabel` component; stable. Its root class is `p-float-label` (hyphenated) rather than `p-floatlabel`.
- No deprecations recorded on the component itself.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `FloatLabelModule` (or standalone `FloatLabel`) from `primeng/floatlabel` (`primeng-21.1.9:apps/showcase/doc/floatlabel/import-doc.ts`).
- Selector: `p-floatlabel, p-floatLabel, p-float-label`; template is a bare content projection; host class bound to `cx('root')`.
- Source: `primeng-21.1.9:packages/primeng/src/floatlabel/floatlabel.ts`, style `primeng-21.1.9:packages/primeng/src/floatlabel/style/floatlabelstyle.ts`, PT types `primeng-21.1.9:packages/primeng/src/types/floatlabel/floatlabel.types.ts`.
- Sub-components: none.

### PrimeVue 4.5.5

- Import: `import FloatLabel from 'primevue/floatlabel'` (`primevue-4.5.5:apps/showcase/doc/floatlabel/ImportDoc.vue`).
- Tag: `<FloatLabel>` rendering a `<span>` around the default slot.
- Source: `primevue-4.5.5:packages/primevue/src/floatlabel/FloatLabel.vue`, `primevue-4.5.5:packages/primevue/src/floatlabel/BaseFloatLabel.vue`, types `primevue-4.5.5:packages/primevue/src/floatlabel/FloatLabel.d.ts`, style `primevue-4.5.5:packages/primevue/src/floatlabel/style/FloatLabelStyle.js`.
- Sub-components: none.

### PrimeReact 10.9.9

- Import: `import { FloatLabel } from 'primereact/floatlabel'` (`primereact-10.9.9:components/doc/floatlabel/importdoc.js`).
- Tag: `<FloatLabel>` rendering a `<span className="p-float-label">` around its children.
- Source: `primereact-10.9.9:components/lib/floatlabel/FloatLabel.js`, `primereact-10.9.9:components/lib/floatlabel/FloatLabelBase.js`, types `primereact-10.9.9:components/lib/floatlabel/floatlabel.d.ts`.
- Sub-components: none.

## 4. Anatomy

- **root** — the wrapper (`p-floatlabel` in PrimeNG/PrimeVue, `p-float-label` in PrimeReact).
- Projected **field** — any Prime input (InputText, Select, AutoComplete, DatePicker, Textarea, …) placed first.
- Projected **label** — a native `<label for="…">` placed after the field; the CSS uses sibling and `:has()` selectors, so the field must precede the label.

## 5. API highlights

- PrimeNG: `@Input() variant: 'in' | 'over' | 'on' = 'over'`; inherited `pt`, `ptOptions`, `unstyled`, `dt`. No outputs, no templates.
- PrimeVue: prop `variant: HintedString<'on' | 'in' | 'over'>`, default `'over'`; inherited `pt`, `ptOptions`, `unstyled`, `dt`; slot `default`.
- PrimeReact: props `children`, `pt`, `ptOptions`, `unstyled`. No `variant` prop — only the "over" behaviour exists.
- Variant meanings (PrimeNG/PrimeVue): `over` floats the label above the field, `in` keeps it inside the field box at the top, `on` places it over the top border.

## 6. Usage guidance

- Wrap the field and its label in FloatLabel; the label floats when the field is focused or filled (`primeng-21.1.9:apps/showcase/doc/floatlabel/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/floatlabel/BasicDoc.vue`, `primereact-10.9.9:components/doc/floatlabel/basicdoc.js`).
- Choose a `variant` (`over`, `in`, `on`) to change label placement — PrimeNG/PrimeVue only (`primeng-21.1.9:apps/showcase/doc/floatlabel/variants-doc.ts`, `primevue-4.5.5:apps/showcase/doc/floatlabel/VariantsDoc.vue`).
- When the wrapped field is invalid the label is highlighted too; PrimeNG reacts to `ng-invalid.ng-dirty` as well as the `invalid` input (`primeng-21.1.9:apps/showcase/doc/floatlabel/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/floatlabel/InvalidDoc.vue`).
- PrimeReact additionally documents styled/unstyled (Tailwind) theming and a PT wireframe (`primereact-10.9.9:components/doc/floatlabel/theming/styleddoc.js`, `primereact-10.9.9:components/doc/floatlabel/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/floatlabel/pt/wireframe.js`).
- No services required.

## 7. Accessibility

- FloatLabel needs no roles or ARIA attributes and contains no interactive element; keyboard behaviour is that of the wrapped field (`primeng-21.1.9:apps/showcase/doc/floatlabel/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/floatlabel/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/floatlabel/accessibilitydoc.js`).
- The label must still be associated with the field via `for`/`id`; the visual float does not change the accessible name.

## 8. Theming

- Classes (PrimeNG/PrimeVue): `p-floatlabel`, plus `p-floatlabel-over`, `p-floatlabel-in`, `p-floatlabel-on`. Catalog lists `p-floatlabel` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`).
- PrimeNG adds `.p-floatlabel:has(.ng-invalid.ng-dirty) label` to the shared style.
- PT keys: PrimeNG `host`, `root`; PrimeVue `root` (+ `hooks`); PrimeReact `root` (+ `hooks`).
- Design tokens (`@primeuix/themes-2.0.3:types/floatlabel/index.d.ts`): `root` (color, focusColor, activeColor, invalidColor, transitionDuration, positionX, positionY, fontWeight, active.fontSize/fontWeight), `over` (active.top), `in` (input.paddingTop/paddingBottom, active.top), `on` (borderRadius, active.background/padding). Aura preset: `@primeuix/themes-2.0.3:dist/aura/floatlabel/index.mjs`.
- Style module: `@primeuix/styles-2.0.3:dist/floatlabel/index.mjs`; it targets many field classes (`.p-inputtext`, `.p-textarea`, `.p-select-label`, `.p-multiselect-label`, `.p-cascadeselect-label`, `.p-treeselect-label`, `.p-autocomplete-input-multiple`, `.p-inputicon`, `.p-inputwrapper-filled`, `.p-inputwrapper-focus`, …).
- PrimeReact: own CSS in `FloatLabelBase.js` under `@layer primereact` (label moves when `:has(input:focus)`, `input.p-filled`, `.p-inputwrapper-focus`, `.p-inputwrapper-filled`, autofill); shared rules also in `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`. Design tokens N/A.

## 9. Relationships

- Embeds: nothing; wraps any form field.
- Embedded by / showcased with: InputText, InputGroup, IconField, AutoComplete, CascadeSelect, DatePicker, InputMask, InputNumber, and most Form records each have a "Float Label" section.
- Alternative: [IftaLabel](iftalabel.md) (in-field top-aligned label; PrimeNG/PrimeVue only). The `in` variant of FloatLabel looks similar but animates.
- Inside an [InputGroup](inputgroup.md), FloatLabel is placed in the middle cell (`@primeuix/styles-2.0.3:dist/inputgroup/index.mjs` styles `.p-inputgroup .p-floatlabel`).

## 10. Dependencies

- PrimeNG: `primeng/basecomponent`, `primeng/bind`, `primeng/api` (SharedModule), `@primeuix/styles/floatlabel`.
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/floatlabel`.
- PrimeReact: `ComponentBase`, `PrimeReactContext`, hooks/utils.
- No external npm dependency.

## 11. Framework differences

| Aspect          | PrimeNG                                    | PrimeVue                               | PrimeReact                     |
| --------------- | ------------------------------------------ | -------------------------------------- | ------------------------------ |
| Root element    | host element `p-floatlabel`                | `<span>`                               | `<span>`                       |
| Root class      | `p-floatlabel`                             | `p-floatlabel`                         | `p-float-label`                |
| Variants        | `over` (default), `in`, `on`               | `over` (default), `in`, `on`           | none (over only)               |
| Invalid styling | `invalid` on field + `ng-invalid.ng-dirty` | `invalid` on field                     | `p-invalid` on field           |
| Styling source  | `@primeuix/styles/floatlabel` + tokens     | `@primeuix/styles/floatlabel` + tokens | own CSS in `FloatLabelBase.js` |
| PT keys         | `host`, `root`                             | `root`                                 | `root`                         |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/floatlabel/floatlabel.ts`
- `primeng-21.1.9:packages/primeng/src/floatlabel/style/floatlabelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/floatlabel/floatlabel.types.ts`
- `primeng-21.1.9:apps/showcase/doc/floatlabel/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/floatlabel/variants-doc.ts`, `primeng-21.1.9:apps/showcase/doc/floatlabel/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/floatlabel/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/doc/floatlabel/import-doc.ts`
- `primevue-4.5.5:packages/primevue/src/floatlabel/FloatLabel.vue`, `primevue-4.5.5:packages/primevue/src/floatlabel/BaseFloatLabel.vue`, `primevue-4.5.5:packages/primevue/src/floatlabel/FloatLabel.d.ts`, `primevue-4.5.5:packages/primevue/src/floatlabel/style/FloatLabelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/floatlabel/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/floatlabel/VariantsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/floatlabel/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/floatlabel/AccessibilityDoc.vue`, `primevue-4.5.5:apps/showcase/doc/floatlabel/ImportDoc.vue`
- `primereact-10.9.9:components/lib/floatlabel/FloatLabel.js`, `primereact-10.9.9:components/lib/floatlabel/FloatLabelBase.js`, `primereact-10.9.9:components/lib/floatlabel/floatlabel.d.ts`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/doc/floatlabel/basicdoc.js`, `primereact-10.9.9:components/doc/floatlabel/accessibilitydoc.js`, `primereact-10.9.9:components/doc/floatlabel/importdoc.js`, `primereact-10.9.9:components/doc/floatlabel/theming/styleddoc.js`, `primereact-10.9.9:components/doc/floatlabel/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/floatlabel/pt/wireframe.js`
- `@primeuix/styles-2.0.3:dist/floatlabel/index.mjs`, `@primeuix/styles-2.0.3:dist/inputgroup/index.mjs`
- `@primeuix/themes-2.0.3:types/floatlabel/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/floatlabel/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
