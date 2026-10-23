# InputGroup

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

InputGroup joins a form field with add-ons — text, icons, buttons, checkboxes or radio buttons — into one visually connected row, collapsing the inner border radii so the pieces read as a single control. Add-ons are wrapped in the companion **InputGroupAddon**. In PrimeNG and PrimeVue both are components; in PrimeReact 10.9.9 InputGroup is a CSS-only pattern (class names on plain elements).

## 2. Names & status

- Canonical name: **InputGroup** (file `inputgroup`); companion **InputGroupAddon** recorded here (no separate showcase page anywhere).
- PrimeNG: `InputGroup` (selectors `p-inputgroup`, `p-inputGroup`, `p-input-group`) + `InputGroupAddon` (`p-inputgroup-addon`, `p-inputGroupAddon`); stable. `styleClass` deprecated since v20.0.0 on InputGroup; InputGroupAddon still exposes plain `style` and `styleClass` inputs without a deprecation tag.
- PrimeVue: `InputGroup` + `InputGroupAddon`; stable.
- PrimeReact: **no component** — no `components/lib/inputgroup` folder and no `inputgroup` module in `docs/prime-reference/catalog/primereact.json`. The showcase page (`primereact-10.9.9:pages/inputgroup/index.js`) documents the `p-inputgroup` / `p-inputgroup-addon` CSS classes, implemented in `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`. Recorded as a CSS-only pattern, not as a missing feature.

## 3. Per framework

### PrimeNG 21.1.9

- Import: `InputGroupModule` from `primeng/inputgroup`, `InputGroupAddonModule` from `primeng/inputgroupaddon` (`primeng-21.1.9:apps/showcase/doc/inputgroup/import-doc.ts`).
- Selectors: `p-inputgroup, p-inputGroup, p-input-group` and `p-inputgroup-addon, p-inputGroupAddon`; both project content.
- Source: `primeng-21.1.9:packages/primeng/src/inputgroup/inputgroup.ts`, `primeng-21.1.9:packages/primeng/src/inputgroupaddon/inputgroupaddon.ts`; styles `primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`, `primeng-21.1.9:packages/primeng/src/inputgroupaddon/style/inputgroupaddonstyle.ts`; PT types `primeng-21.1.9:packages/primeng/src/types/inputgroup/inputgroup.types.ts`, `primeng-21.1.9:packages/primeng/src/types/inputgroupaddon/inputgroupaddon.types.ts`.

### PrimeVue 4.5.5

- Import: `import InputGroup from 'primevue/inputgroup'`, `import InputGroupAddon from 'primevue/inputgroupaddon'` (`primevue-4.5.5:apps/showcase/doc/inputgroup/ImportDoc.vue`).
- Tags: `<InputGroup>` → `<div class="p-inputgroup">`; `<InputGroupAddon>` → `<div class="p-inputgroupaddon">`.
- Source: `primevue-4.5.5:packages/primevue/src/inputgroup/InputGroup.vue`, `primevue-4.5.5:packages/primevue/src/inputgroup/BaseInputGroup.vue`, `primevue-4.5.5:packages/primevue/src/inputgroup/InputGroup.d.ts`, `primevue-4.5.5:packages/primevue/src/inputgroupaddon/InputGroupAddon.vue`, `primevue-4.5.5:packages/primevue/src/inputgroupaddon/InputGroupAddon.d.ts`; styles `primevue-4.5.5:packages/primevue/src/inputgroup/style/InputGroupStyle.js`, `primevue-4.5.5:packages/primevue/src/inputgroupaddon/style/InputGroupAddonStyle.js`.

### PrimeReact 10.9.9

- No import; markup is `<div className="p-inputgroup">` with `<span className="p-inputgroup-addon">` children (`primereact-10.9.9:components/doc/inputgroup/basicdoc.js`).
- CSS: `primereact-10.9.9:components/lib/componentbase/ComponentBase.js` (rules for `.p-inputgroup`, `.p-inputgroup-addon`, `.p-inputgroup .p-float-label`, `.p-inputgroup .p-inputtext`, `.p-inputgroup .p-inputwrapper`).

## 4. Anatomy

- **root** — `p-inputgroup`, a flex row.
- **addon** — `p-inputgroupaddon` (PrimeNG/PrimeVue) or `p-inputgroup-addon` (PrimeReact), holding text, an icon, a Checkbox or RadioButton.
- **field** — the input component (InputText, InputNumber, Select, …), optionally wrapped in FloatLabel/IftaLabel.
- **button** — a Prime Button placed directly in the group at either end.

## 5. API highlights

- PrimeNG InputGroup: `styleClass` (deprecated since v20.0.0) + inherited `pt`, `ptOptions`, `unstyled`, `dt`. InputGroupAddon: `style: { [klass: string]: any }`, `styleClass: string` + inherited PT inputs. No outputs or templates.
- PrimeVue InputGroup/InputGroupAddon: inherited `pt`, `ptOptions`, `unstyled`, `dt`; slots typed `[key: string]` (default slot in practice).
- PrimeReact: N/A (no component API).
- PrimeNG's style maps `p-inputgroup-fluid` to `instance.fluid`, but `InputGroup` declares no `fluid` input in `inputgroup.ts` — the class cannot be toggled through the public API.

## 6. Usage guidance

- Wrap the field and its add-ons in InputGroup; each add-on goes in InputGroupAddon (or an element with the add-on class in PrimeReact) (`primeng-21.1.9:apps/showcase/doc/inputgroup/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/BasicDoc.vue`, `primereact-10.9.9:components/doc/inputgroup/basicdoc.js`).
- Several add-ons may be placed on the same side or both sides (`primeng-21.1.9:apps/showcase/doc/inputgroup/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/MultipleDoc.vue`, `primereact-10.9.9:components/doc/inputgroup/multipledoc.js`).
- Buttons can sit at either end of the field (`primeng-21.1.9:apps/showcase/doc/inputgroup/button-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/ButtonDoc.vue`, `primereact-10.9.9:components/doc/inputgroup/buttondoc.js`).
- Checkbox and RadioButton can be placed inside add-ons (`primeng-21.1.9:apps/showcase/doc/inputgroup/checkbox-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/CheckboxDoc.vue`, `primereact-10.9.9:components/doc/inputgroup/checkboxdoc.js`).
- Combine with FloatLabel and IftaLabel (`primeng-21.1.9:apps/showcase/doc/inputgroup/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/iftalabel-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/IftaLabelDoc.vue`).
- No services required.

## 7. Accessibility

- No roles or ARIA needed; the group itself is not interactive (`primeng-21.1.9:apps/showcase/doc/inputgroup/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inputgroup/AccessibilityDoc.vue`). PrimeReact has no accessibility section for the pattern.
- Text add-ons are not labels: the field still needs its own `<label>` or `aria-label`; interactive add-ons (buttons, checkboxes) need their own accessible names.

## 8. Theming

- Classes: `p-inputgroup`, `p-inputgroupaddon` (catalog `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`); PrimeReact `p-inputgroup`, `p-inputgroup-addon`.
- PrimeNG adds structural rules in `inputgroupstyle.ts` for `p-button` hosts, `p-inputmask`, and nested FloatLabel/IftaLabel radii.
- PT keys: PrimeNG `host`, `root` for each; PrimeVue `root` for each.
- Design tokens (`@primeuix/themes-2.0.3:types/inputgroup/index.d.ts`): section `addon` (background, borderColor, color, borderRadius, padding, minWidth). InputGroupAddon has no own token set. Aura preset `@primeuix/themes-2.0.3:dist/aura/inputgroup/index.mjs`.
- Style module `@primeuix/styles-2.0.3:dist/inputgroup/index.mjs` styles both `.p-inputgroup` and `.p-inputgroupaddon`, plus `.p-button`, `.p-iconfield`, `.p-floatlabel`, `.p-iftalabel` inside groups. PrimeNG's `inputgroupaddonstyle.ts` imports no `@primeuix/styles` module.
- PrimeReact: CSS in `ComponentBase.js`; tokens N/A.

## 9. Relationships

- Hosts: [InputText](inputtext.md), [InputNumber](inputnumber.md), [InputMask](inputmask.md), Select, Button, [Checkbox](checkbox.md), RadioButton, [IconField](iconfield.md), [FloatLabel](floatlabel.md), [IftaLabel](iftalabel.md).
- Alternative for in-field icons: IconField (icon inside the field) vs. InputGroup add-on (icon beside the field).

## 10. Dependencies

- PrimeNG: `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/inputgroup`.
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/inputgroup`.
- PrimeReact: none (CSS only).
- No external npm dependency.

## 11. Framework differences

| Aspect            | PrimeNG                                                                           | PrimeVue                      | PrimeReact                                      |
| ----------------- | --------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| Form              | components                                                                        | components                    | CSS classes only                                |
| Addon class       | `p-inputgroupaddon`                                                               | `p-inputgroupaddon`           | `p-inputgroup-addon`                            |
| Showcase sections | Basic, Multiple, Button, Checkbox & Radio, Float Label, Ifta Label, Accessibility | same                          | Basic, Multiple, Button, Checkbox & RadioButton |
| Deprecated inputs | `styleClass` on InputGroup (since v20.0.0)                                        | —                             | —                                               |
| Styling source    | `@primeuix/styles/inputgroup` + extra NG rules                                    | `@primeuix/styles/inputgroup` | `ComponentBase.js` CSS; tokens N/A              |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/inputgroup/inputgroup.ts`, `primeng-21.1.9:packages/primeng/src/inputgroup/style/inputgroupstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputgroup/inputgroup.types.ts`
- `primeng-21.1.9:packages/primeng/src/inputgroupaddon/inputgroupaddon.ts`, `primeng-21.1.9:packages/primeng/src/inputgroupaddon/style/inputgroupaddonstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/inputgroupaddon/inputgroupaddon.types.ts`
- `primeng-21.1.9:apps/showcase/doc/inputgroup/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/multiple-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/button-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/checkbox-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/floatlabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/iftalabel-doc.ts`, `primeng-21.1.9:apps/showcase/doc/inputgroup/accessibility-doc.ts`
- `primevue-4.5.5:packages/primevue/src/inputgroup/InputGroup.vue`, `primevue-4.5.5:packages/primevue/src/inputgroup/BaseInputGroup.vue`, `primevue-4.5.5:packages/primevue/src/inputgroup/InputGroup.d.ts`, `primevue-4.5.5:packages/primevue/src/inputgroup/style/InputGroupStyle.js`
- `primevue-4.5.5:packages/primevue/src/inputgroupaddon/InputGroupAddon.vue`, `primevue-4.5.5:packages/primevue/src/inputgroupaddon/InputGroupAddon.d.ts`, `primevue-4.5.5:packages/primevue/src/inputgroupaddon/style/InputGroupAddonStyle.js`
- `primevue-4.5.5:apps/showcase/doc/inputgroup/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/MultipleDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/ButtonDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/CheckboxDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/FloatLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/IftaLabelDoc.vue`, `primevue-4.5.5:apps/showcase/doc/inputgroup/AccessibilityDoc.vue`
- `primereact-10.9.9:pages/inputgroup/index.js`, `primereact-10.9.9:components/doc/inputgroup/basicdoc.js`, `primereact-10.9.9:components/doc/inputgroup/multipledoc.js`, `primereact-10.9.9:components/doc/inputgroup/buttondoc.js`, `primereact-10.9.9:components/doc/inputgroup/checkboxdoc.js`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `@primeuix/styles-2.0.3:dist/inputgroup/index.mjs`
- `@primeuix/themes-2.0.3:types/inputgroup/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputgroup/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
