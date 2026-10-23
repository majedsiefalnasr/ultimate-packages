# IftaLabel

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5

## 1. Summary

IftaLabel ("in-field top-aligned label") is a layout wrapper that places a small, static label inside the top edge of the wrapped form field, with the field padding enlarged to make room. Unlike FloatLabel it does not animate between positions. It has no interactive behaviour; all styling is CSS.

## 2. Names & status

- Canonical name: **IftaLabel** (file `iftalabel`).
- PrimeNG: `IftaLabel` component, selectors `p-iftalabel`, `p-iftaLabel`, `p-ifta-label`; stable.
- PrimeVue: `IftaLabel` component; stable.
- PrimeReact: N/A — not shipped in primereact-10.9.9 (no `components/lib/iftalabel`, no `components/doc/iftalabel`, no `pages/iftalabel`, and no `iftalabel` module in `docs/prime-reference/catalog/primereact.json`).

## 3. Per framework

### PrimeNG 21.1.9

- Import: `IftaLabelModule` (or standalone `IftaLabel`) from `primeng/iftalabel` (`primeng-21.1.9:apps/showcase/doc/iftalabel/import-doc.ts`).
- Selector: `p-iftalabel, p-iftaLabel, p-ifta-label`; template is content projection; host class `cx('root')`.
- Source: `primeng-21.1.9:packages/primeng/src/iftalabel/iftalabel.ts`, style `primeng-21.1.9:packages/primeng/src/iftalabel/style/iftalabelstyle.ts`, PT types `primeng-21.1.9:packages/primeng/src/types/iftalabel/iftalabel.types.ts`.
- `IftaLabelModule` re-exports `CommonModule`, `SharedModule` and `RouterModule` imports (an unusual but harmless `RouterModule` import in the NgModule).
- Sub-components: none.

### PrimeVue 4.5.5

- Import: `import IftaLabel from 'primevue/iftalabel'` (`primevue-4.5.5:apps/showcase/doc/iftalabel/ImportDoc.vue`).
- Tag: `<IftaLabel>` rendering a `<span>` around the default slot.
- Source: `primevue-4.5.5:packages/primevue/src/iftalabel/IftaLabel.vue`, `primevue-4.5.5:packages/primevue/src/iftalabel/BaseIftaLabel.vue`, types `primevue-4.5.5:packages/primevue/src/iftalabel/IftaLabel.d.ts`, style `primevue-4.5.5:packages/primevue/src/iftalabel/style/IftaLabelStyle.js`.

### PrimeReact 10.9.9

N/A — not shipped in primereact-10.9.9 (see §2).

## 4. Anatomy

- **root** — wrapper with class `p-iftalabel`.
- Projected **field** — the input component (placed first).
- Projected **label** — a native `<label for="…">` placed after the field and positioned absolutely at the top of the field.

## 5. API highlights

- PrimeNG: only inherited inputs `pt`, `ptOptions`, `unstyled`, `dt`; no outputs or templates.
- PrimeVue: inherited `pt`, `ptOptions`, `unstyled` (default `false`), `dt`; slot `default`.
- The field's own `invalid` / `variant` / `size` drive appearance; IftaLabel has no variants.

## 6. Usage guidance

- Wrap the field and its label in IftaLabel to get a compact top-aligned label inside the field (`primeng-21.1.9:apps/showcase/doc/iftalabel/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iftalabel/BasicDoc.vue`).
- An invalid field also highlights the label; PrimeNG additionally reacts to Angular's `ng-invalid.ng-dirty` (`primeng-21.1.9:apps/showcase/doc/iftalabel/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iftalabel/InvalidDoc.vue`).
- No services required.

## 7. Accessibility

- No roles or ARIA attributes are required and the wrapper has no interactive element (`primeng-21.1.9:apps/showcase/doc/iftalabel/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/iftalabel/AccessibilityDoc.vue`).
- Associate the label with the field via `for`/`id` as usual.

## 8. Theming

- Class: `p-iftalabel` (catalog `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`). PrimeNG adds `.p-iftalabel:has(.ng-invalid.ng-dirty) label`.
- PT keys: PrimeNG `host`, `root`; PrimeVue `root` (+ `hooks`).
- Design tokens (`@primeuix/themes-2.0.3:types/iftalabel/index.d.ts`): `root` (color, focusColor, invalidColor, transitionDuration, positionX, top, fontSize, fontWeight), `input` (paddingTop, paddingBottom). Aura preset `@primeuix/themes-2.0.3:dist/aura/iftalabel/index.mjs`.
- Style module `@primeuix/styles-2.0.3:dist/iftalabel/index.mjs` targets `.p-inputtext`, `.p-textarea`, `.p-select-label`, `.p-multiselect-label`, `.p-cascadeselect-label`, `.p-treeselect-label`, `.p-autocomplete-input-multiple`, `.p-chip`, `.p-inputicon`, `.p-inputwrapper-focus`, `.p-invalid`.

## 9. Relationships

- Wraps any form field; showcased with InputText, InputGroup, IconField, AutoComplete, CascadeSelect, DatePicker, InputMask, InputNumber and others ("Ifta Label" sections).
- Alternative: [FloatLabel](floatlabel.md) (animated floating label; its `in` variant gives a similar final position).
- Can sit inside an [InputGroup](inputgroup.md) (`@primeuix/styles-2.0.3:dist/inputgroup/index.mjs` styles `.p-inputgroup .p-iftalabel`).

## 10. Dependencies

- PrimeNG: `primeng/basecomponent`, `primeng/bind`, `primeng/api`, `@angular/router` (NgModule import only), `@primeuix/styles/iftalabel`.
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/iftalabel`.
- No external npm dependency.

## 11. Framework differences

| Aspect         | PrimeNG                                    | PrimeVue                              | PrimeReact  |
| -------------- | ------------------------------------------ | ------------------------------------- | ----------- |
| Shipped        | yes                                        | yes                                   | not shipped |
| Root element   | host element `p-iftalabel`                 | `<span>`                              | —           |
| Invalid hook   | `invalid` on field + `ng-invalid.ng-dirty` | `invalid` on field                    | —           |
| PT keys        | `host`, `root`                             | `root`                                | —           |
| Styling source | `@primeuix/styles/iftalabel` + tokens      | `@primeuix/styles/iftalabel` + tokens | —           |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/iftalabel/iftalabel.ts`
- `primeng-21.1.9:packages/primeng/src/iftalabel/style/iftalabelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/iftalabel/iftalabel.types.ts`
- `primeng-21.1.9:apps/showcase/doc/iftalabel/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iftalabel/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iftalabel/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/iftalabel/accessibility-doc.ts`
- `primevue-4.5.5:packages/primevue/src/iftalabel/IftaLabel.vue`, `primevue-4.5.5:packages/primevue/src/iftalabel/BaseIftaLabel.vue`, `primevue-4.5.5:packages/primevue/src/iftalabel/IftaLabel.d.ts`, `primevue-4.5.5:packages/primevue/src/iftalabel/style/IftaLabelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/iftalabel/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iftalabel/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iftalabel/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/iftalabel/AccessibilityDoc.vue`
- `@primeuix/styles-2.0.3:dist/iftalabel/index.mjs`, `@primeuix/styles-2.0.3:dist/inputgroup/index.mjs`
- `@primeuix/themes-2.0.3:types/iftalabel/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/iftalabel/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
