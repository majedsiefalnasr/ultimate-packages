# Listbox

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Listbox shows a list of options inline (no overlay) and lets the user pick one value or, in multiple mode, several values. It supports option groups, a built-in filter input, item templates and virtual scrolling for long lists. PrimeNG adds per-option checkboxes with a toggle-all header and drag-and-drop reordering through the Angular CDK (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`, `primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`, `primereact-10.9.9:components/lib/listbox/ListBox.js`).

## 2. Names & status

- Canonical display name: **Listbox**. PrimeReact exports the component as `ListBox` (capital B) from folder `listbox`; PrimeNG names its pass-through types `ListBoxPassThrough` / `ListBoxPassThroughOptions` while the class is `Listbox` (`primereact-10.9.9:components/lib/listbox/listbox.d.ts`, `primeng-21.1.9:packages/primeng/src/types/listbox/listbox.types.ts`).
- PrimeNG accepts three selectors: `p-listbox`, `p-listBox`, `p-list-box` (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`).
- Not deprecated. PrimeNG `styleClass` is deprecated since v20.0.0 in favour of `class` (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`).
- Listed in the Form group of all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                       | PrimeVue                                                                          | PrimeReact                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Import         | `import { ListboxModule } from 'primeng/listbox'` (standalone `Listbox` also importable)      | `import Listbox from 'primevue/listbox'`                                          | `import { ListBox } from 'primereact/listbox'`                                               |
| Selector / tag | `<p-listbox>` (aliases `p-listBox`, `p-list-box`)                                             | `<Listbox>`                                                                       | `<ListBox />`                                                                                |
| Source         | `listbox/listbox.ts`, `listbox/style/listboxstyle.ts`, `types/listbox/listbox.types.ts`       | `listbox/Listbox.vue`, `BaseListbox.vue`, `Listbox.d.ts`, `style/ListboxStyle.js` | `listbox/ListBox.js`, `ListBoxBase.js`, `ListBoxHeader.js`, `ListBoxItem.js`, `listbox.d.ts` |
| Exports        | `Listbox`, `ListboxModule`, `LISTBOX_VALUE_ACCESSOR`, `ListboxStyle`, `ListboxClasses`, types | default `Listbox`; `ListboxStyle` from `primevue/listbox/style`                   | `ListBox`                                                                                    |
| Base class     | `BaseEditableHolder<ListBoxPassThrough>`                                                      | `BaseEditableHolder` (via `BaseListbox`)                                          | `ComponentBase.extend` (`ListBoxBase`)                                                       |

Sources: `primeng-21.1.9:apps/showcase/doc/listbox/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/listbox/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/listbox/BaseListbox.vue`, `primereact-10.9.9:components/doc/listbox/importdoc.js`, `primereact-10.9.9:components/lib/listbox/ListBoxBase.js`.

## 4. Anatomy

| Part                   | Element                                                | PrimeNG PT key                                                         | PrimeVue PT key                                                                               | PrimeReact PT key                              | Class (NG/Vue · React)                                                                         |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Root                   | host / `div`                                           | `root`                                                                 | `root`                                                                                        | `root`                                         | `p-listbox` · `p-listbox`                                                                      |
| Hidden focus sentinels | `span` (`role="presentation"`)                         | `hiddenFirstFocusableEl`, `hiddenLastFocusableEl`                      | same                                                                                          | used in source, not typed                      | —                                                                                              |
| Header                 | `div`                                                  | `header`                                                               | `header`                                                                                      | `header`                                       | `p-listbox-header` · `p-listbox-header`                                                        |
| Toggle-all checkbox    | `p-checkbox`                                           | `pcCheckbox`                                                           | —                                                                                             | —                                              | —                                                                                              |
| Filter field           | IconField + InputText + InputIcon                      | `pcFilterContainer`, `pcFilter`, `pcFilterIconContainer`, `filterIcon` | same                                                                                          | `filterContainer`, `filterInput`, `filterIcon` | `p-listbox-filter` · `p-listbox-filter-container`, `p-listbox-filter`, `p-listbox-filter-icon` |
| List container         | `div` (scroll area / VirtualScroller)                  | `listContainer`, `virtualScroller`                                     | `listContainer`, `virtualScroller`                                                            | `wrapper`, `virtualScroller`                   | `p-listbox-list-container` · `p-listbox-list-wrapper`                                          |
| List                   | `ul` `role="listbox"`                                  | `list`                                                                 | `list`                                                                                        | `list`                                         | `p-listbox-list` · `p-listbox-list`                                                            |
| Option group           | `li` `role="option"` (NG/Vue) / `role="group"` (React) | `optionGroup`                                                          | `optionGroup`                                                                                 | `itemGroup`                                    | `p-listbox-option-group` · `p-listbox-item-group`                                              |
| Option                 | `li` `role="option"`                                   | `option`                                                               | `option`                                                                                      | `item`                                         | `p-listbox-option` · `p-listbox-item`                                                          |
| Checkmark icons        | CheckIcon / BlankIcon                                  | `optionCheckIcon`, `optionBlankIcon`                                   | `optionCheckIcon`, `optionBlankIcon`                                                          | —                                              | `p-listbox-option-check-icon`, `p-listbox-option-blank-icon`                                   |
| Empty message          | `li`                                                   | `emptyMessage`                                                         | `emptyMessage`                                                                                | `emptyMessage`                                 | `p-listbox-empty-message`                                                                      |
| Live-region messages   | hidden `span` (`aria-live="polite"`)                   | `hiddenFilterResult`, `hiddenEmptyMessage`, `hiddenSelectedMessage`    | `hiddenFilterResult`, `hiddenSelectedMessage` (source also uses untyped `hiddenEmptyMessage`) | —                                              | `p-hidden-accessible`                                                                          |
| Tooltip                | Tooltip                                                | —                                                                      | —                                                                                             | `tooltip`                                      | —                                                                                              |

Sources: catalog `primeng.json` `modules.listbox`, `primevue.json` `modules.listbox` / `modules.listboxstyle`, `primereact.json` `modules.listbox`; `primereact-10.9.9:components/lib/listbox/ListBoxBase.js`.

## 5. API highlights

| Member            | PrimeNG                                                                                                                  | PrimeVue                                                                                                     | PrimeReact                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Value binding     | `ngModel` / `formControlName`                                                                                            | `modelValue` / `v-model`, `defaultValue`                                                                     | `value` + `onChange`                                                                                                                        |
| Options           | `options`, `optionLabel`, `optionValue`, `optionDisabled`, `dataKey`                                                     | same (also accept functions)                                                                                 | same                                                                                                                                        |
| Groups            | `group`, `optionGroupLabel = 'label'`, `optionGroupChildren = 'items'`                                                   | `optionGroupLabel`, `optionGroupChildren`                                                                    | `optionGroupLabel`, `optionGroupChildren`, `optionGroupTemplate`                                                                            |
| Multiple          | `multiple`, `metaKeySelection = false`                                                                                   | `multiple`, `metaKeySelection = false`                                                                       | `multiple`, `metaKeySelection` (`false` in `defaultProps`; d.ts says `true`)                                                                |
| Filter            | `filter`, `filterBy`, `filterFields`, `filterMatchMode = 'contains'`, `filterLocale`, `filterValue`, `filterPlaceHolder` | `filter`, `filterFields`, `filterMatchMode`, `filterLocale`, `filterPlaceholder`, `filterIcon`               | `filter`, `filterBy = 'label'`, `filterMatchMode`, `filterLocale`, `filterValue`, `filterPlaceholder`, `filterInputProps`, `filterTemplate` |
| Selection display | `checkmark`, `highlightOnSelect = true`, `checkbox`, `showToggleAll = true`, `selectAll`                                 | `checkmark`, `highlightOnSelect = true`                                                                      | highlight only                                                                                                                              |
| Focus behaviour   | `autoOptionFocus = true`, `selectOnFocus`, `focusOnHover = true`                                                         | `autoOptionFocus = false`, `selectOnFocus`, `focusOnHover = true`                                            | `autoOptionFocus = false`, `selectOnFocus`, `focusOnHover = true`                                                                           |
| Layout            | `scrollHeight = '14rem'`, `listStyle`, `listStyleClass`, `striped`, `fluid`                                              | `scrollHeight = '14rem'`, `listStyle`, `striped`, `fluid`                                                    | `listStyle`, `listClassName`                                                                                                                |
| Virtual scroll    | `virtualScroll`, `virtualScrollItemSize`, `virtualScrollOptions`, `lazy`                                                 | `virtualScrollerOptions`                                                                                     | `virtualScrollerOptions`                                                                                                                    |
| Drag and drop     | `dragdrop`, `dropListData`, `onDrop`                                                                                     | —                                                                                                            | —                                                                                                                                           |
| Messages          | `emptyMessage`, `emptyFilterMessage`, `filterMessage`, `selectionMessage`, `emptySelectionMessage`, `searchMessage`      | `emptyMessage`, `emptyFilterMessage`, `filterMessage`, `selectionMessage`, `emptySelectionMessage`           | `emptyMessage`, `emptyFilterMessage`                                                                                                        |
| Events            | `onChange`, `onClick`, `onDblClick`, `onFilter`, `onFocus`, `onBlur`, `onSelectAllChange`, `onLazyLoad`, `onDrop`        | `change`, `update:modelValue`, `value-change`, `focus`, `blur`, `filter`, `option-dblclick`, `item-dblclick` | `onChange`, `onFilterValueChange`                                                                                                           |
| Templates / slots | `item`, `group`, `header`, `footer`, `filter`, `empty`, `emptyfilter`, `filtericon`, `checkicon`, `checkmark`, `loader`  | `option`, `optiongroup`, `header`, `footer`, `content`, `empty`, `emptyfilter`, `filtericon`, `loader`       | `itemTemplate`, `optionGroupTemplate`, `filterTemplate`, `emptyMessage` (node or function)                                                  |
| Methods           | `updateModel(value, event)`                                                                                              | —                                                                                                            | `focus()`, `getElement()`, `getVirtualScroller()`                                                                                           |
| Form state        | `invalid`, `required`, `disabled`, `name`, `readonly`                                                                    | `invalid`, `disabled`, `name`, `formControl`                                                                 | `invalid`, `disabled`, `tooltip`, `tooltipOptions`                                                                                          |

- PrimeVue emits both `option-dblclick` and the older `item-dblclick` (`primevue-4.5.5:packages/primevue/src/listbox/Listbox.d.ts`).
- Full API: catalog modules `listbox` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — single selection from `options` with `optionLabel` (`primeng-21.1.9:apps/showcase/doc/listbox/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/BasicDoc.vue`, `primereact-10.9.9:components/doc/listbox/basicdoc.js`).
- **Checkmark** — show a check icon next to the selected option, usually with `highlightOnSelect` off; NG/Vue only (`primeng-21.1.9:apps/showcase/doc/listbox/checkmark-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/CheckmarkDoc.vue`).
- **Multiple** — `multiple` allows several values; by default each click toggles, `metaKeySelection` restores Ctrl/Cmd-click semantics (`primeng-21.1.9:apps/showcase/doc/listbox/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/MultipleDoc.vue`, `primereact-10.9.9:components/doc/listbox/multipledoc.js`).
- **Checkbox** — PrimeNG-only: `checkbox` with `multiple` renders a checkbox per option and a toggle-all header (`primeng-21.1.9:apps/showcase/doc/listbox/checkbox-doc.ts`).
- **Group** — nested option arrays with `optionGroupLabel` / `optionGroupChildren` (NG also needs `group`) (`primeng-21.1.9:apps/showcase/doc/listbox/group-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/GroupDoc.vue`, `primereact-10.9.9:components/doc/listbox/groupdoc.js`).
- **Filter** — `filter` adds a search input above the list (`primeng-21.1.9:apps/showcase/doc/listbox/filter-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/FilterDoc.vue`, `primereact-10.9.9:components/doc/listbox/filterdoc.js`).
- **Template** — custom option content via the item / option template (`primeng-21.1.9:apps/showcase/doc/listbox/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/TemplateDoc.vue`, `primereact-10.9.9:components/doc/listbox/templatedoc.js`).
- **Drag and drop** — PrimeNG-only reordering with `dragdrop`, built on `@angular/cdk/drag-drop` (`primeng-21.1.9:apps/showcase/doc/listbox/dragdrop-doc.ts`).
- **Virtual scroll** — render only visible options for large lists (`primeng-21.1.9:apps/showcase/doc/listbox/virtualscroll-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/VirtualScrollDoc.vue`, `primereact-10.9.9:components/doc/listbox/virtualscrolldoc.js`).
- **Invalid / Disabled** — `invalid` marks a validation error; `disabled` blocks interaction (`primeng-21.1.9:apps/showcase/doc/listbox/invalid-doc.ts`, `primeng-21.1.9:apps/showcase/doc/listbox/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/InvalidDoc.vue`, `primevue-4.5.5:apps/showcase/doc/listbox/DisabledDoc.vue`, `primereact-10.9.9:components/doc/listbox/invaliddoc.js`, `primereact-10.9.9:components/doc/listbox/disableddoc.js`).
- **Forms** — PrimeNG shows template-driven and reactive forms; PrimeVue shows `@primevue/forms` (`primeng-21.1.9:apps/showcase/doc/listbox/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/listbox/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/FormsDoc.vue`).
- **Style** (PrimeReact) — lists the legacy class names (`primereact-10.9.9:components/doc/listbox/styledoc.js`).

## 7. Accessibility

- The list is a `ul` with `role="listbox"`, `aria-activedescendant` pointing at the focused option, `aria-label` / `aria-labelledby` from props, and options with `role="option"`, `aria-selected`, `aria-disabled`, `aria-setsize` and position-in-set (`primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`, `primereact-10.9.9:components/lib/listbox/ListBoxItem.js`).
- The filter input has `role="searchbox"`; hidden `aria-live="polite"` spans announce filter results and the selection count in NG/Vue; hidden first/last focusable spans route Tab into the list (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`, `primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`).
- Keyboard (documented): Tab focuses the first selected or first option; Up/Down move focus; Enter/Space toggle; Home/End jump; Shift+Up/Down move and toggle; Shift+Space selects a range; Ctrl+Shift+Home/End select to the ends; Ctrl+A selects all (multiple). PrimeVue also lists Page Up/Page Down and type-ahead on printable characters (`primeng-21.1.9:apps/showcase/doc/listbox/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/listbox/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/listbox/accessibilitydoc.js`).
- PrimeNG defects: `aria-multiselectable` is bound to the constant `true` regardless of `multiple`, and the option binding `[attr.ariaPosInset]` produces an attribute named `ariaposinset` instead of `aria-posinset`. PrimeVue and PrimeReact bind `aria-multiselectable` to `multiple` (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`).
- PrimeNG's accessibility doc and showcase example use an `ariaLabelledBy` input, but `Listbox` declares only `ariaLabel` (no `ariaLabelledBy` input or `aria-labelledby` binding) (`primeng-21.1.9:apps/showcase/doc/listbox/accessibility-doc.ts`, `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`).
- PrimeVue's accessibility doc text for the filter input refers to "the multiselect element", a copy from MultiSelect (`primevue-4.5.5:apps/showcase/doc/listbox/AccessibilityDoc.vue`).

## 8. Theming

- NG/Vue classes: `p-listbox` (modifiers `p-disabled`, `p-invalid`, `p-listbox-striped`, `p-listbox-fluid`), `p-listbox-header`, `p-listbox-filter`, `p-listbox-list-container`, `p-listbox-list`, `p-listbox-option-group`, `p-listbox-option` (modifiers `p-listbox-option-selected`, `p-focus`, `p-disabled`), `p-listbox-option-check-icon`, `p-listbox-option-blank-icon`, `p-listbox-empty-message` (catalog `primeng.json` `modules.listbox.style.classes`, `primevue.json` `modules.listboxstyle.enumerations.ListboxClasses`; `primevue-4.5.5:packages/primevue/src/listbox/style/ListboxStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/listbox/index.mjs`. PrimeNG appends extra rules for the invalid border and CDK drag preview/placeholder (`primeng-21.1.9:packages/primeng/src/listbox/style/listboxstyle.ts`).
- Design tokens (`@primeuix/themes-2.0.3:types/listbox/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`): `root` (background, disabled background, border/invalid border color, color, disabled color, shadow, radius, transition), `list` (padding, gap, header padding), `option` (focus/selected backgrounds and colors, padding, radius, striped background), `optionGroup` (background, color, font weight, padding), `checkmark` (color, gutters), `emptyMessage.padding`.
- PrimeReact: `ListBoxBase.js` `css.classes` keeps v9 names — `p-listbox-list-wrapper`, `p-listbox-item` with `p-highlight` / `p-focus`, `p-listbox-item-group`, `p-listbox-filter-container`, `p-listbox-filter-icon`; design tokens N/A (`primereact-10.9.9:components/lib/listbox/ListBoxBase.js`, `primereact-10.9.9:components/doc/listbox/theming/styleddoc.js`).

## 9. Relationships

- Embeds: InputText, IconField / InputIcon (NG/Vue filter), VirtualScroller / Scroller, Ripple, Checkbox (NG `checkbox` mode), Tooltip (React).
- Shares the option model (options/optionLabel/optionValue/groups/filter) and keyboard model with Select and MultiSelect, which put the same list in an overlay.
- Related: PickList and OrderList (Data category) for list transfer/reordering.

## 10. Dependencies

- PrimeNG: `@angular/forms`, `@angular/cdk/drag-drop`, `@primeuix/utils`, `primeng/api` (`FilterService`), `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/checkbox`, `primeng/iconfield`, `primeng/icons`, `primeng/inputicon`, `primeng/inputtext`, `primeng/ripple`, `primeng/scroller`, `rxjs`, `@primeuix/styles/listbox` (`primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`).
- PrimeVue: `@primeuix/utils`, `@primevue/core/api` (`FilterService`), `@primevue/core/baseeditableholder`, `@primevue/icons` (blank, check, search), `primevue/iconfield`, `primevue/inputicon`, `primevue/inputtext`, `primevue/ripple`, `primevue/virtualscroller` (`primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`, `primevue-4.5.5:packages/primevue/src/listbox/BaseListbox.vue`).
- PrimeReact: `../api/Api` (`FilterService`, `localeOption`), `../componentbase/ComponentBase`, `../hooks/Hooks`, `../tooltip/Tooltip`, `../virtualscroller/VirtualScroller`, `../inputtext/InputText`, `../icons/search`, `../ripple/Ripple`, `../utils/Utils` (`primereact-10.9.9:components/lib/listbox/ListBox.js`, `primereact-10.9.9:components/lib/listbox/ListBoxHeader.js`, `primereact-10.9.9:components/lib/listbox/ListBoxItem.js`).
- External npm: `@angular/cdk` for PrimeNG only.

## 11. Framework differences

| Aspect                     | PrimeNG                | PrimeVue            | PrimeReact                                  |
| -------------------------- | ---------------------- | ------------------- | ------------------------------------------- |
| Component name             | `Listbox`              | `Listbox`           | `ListBox`                                   |
| Checkbox mode / toggle-all | yes                    | no                  | no                                          |
| Checkmark mode             | yes                    | yes                 | no                                          |
| Drag and drop              | yes (`@angular/cdk`)   | no                  | no                                          |
| Striped rows / `fluid`     | yes                    | yes                 | no                                          |
| `autoOptionFocus` default  | `true`                 | `false`             | `false`                                     |
| `aria-multiselectable`     | always `true` (defect) | follows `multiple`  | follows `multiple`                          |
| Live-region messages       | yes                    | yes                 | no                                          |
| Class names                | `p-listbox-option*`    | `p-listbox-option*` | `p-listbox-item*`, `p-highlight`            |
| Imperative API             | `updateModel`          | —                   | `focus`, `getElement`, `getVirtualScroller` |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/listbox/listbox.ts`
- `primeng-21.1.9:packages/primeng/src/listbox/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/listbox/style/listboxstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/listbox/listbox.types.ts`
- `primeng-21.1.9:apps/showcase/doc/listbox/` (`import-doc.ts`, `basic-doc.ts`, `checkbox-doc.ts`, `checkmark-doc.ts`, `multiple-doc.ts`, `group-doc.ts`, `filter-doc.ts`, `template-doc.ts`, `dragdrop-doc.ts`, `virtualscroll-doc.ts`, `invalid-doc.ts`, `disabled-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/listbox/Listbox.vue`
- `primevue-4.5.5:packages/primevue/src/listbox/BaseListbox.vue`
- `primevue-4.5.5:packages/primevue/src/listbox/Listbox.d.ts`
- `primevue-4.5.5:packages/primevue/src/listbox/style/ListboxStyle.js`
- `primevue-4.5.5:apps/showcase/doc/listbox/` (`ImportDoc.vue`, `BasicDoc.vue`, `CheckmarkDoc.vue`, `MultipleDoc.vue`, `GroupDoc.vue`, `FilterDoc.vue`, `TemplateDoc.vue`, `VirtualScrollDoc.vue`, `InvalidDoc.vue`, `DisabledDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/listbox/ListBox.js`
- `primereact-10.9.9:components/lib/listbox/ListBoxBase.js`
- `primereact-10.9.9:components/lib/listbox/ListBoxHeader.js`
- `primereact-10.9.9:components/lib/listbox/ListBoxItem.js`
- `primereact-10.9.9:components/lib/listbox/listbox.d.ts`
- `primereact-10.9.9:components/doc/listbox/` (`importdoc.js`, `basicdoc.js`, `multipledoc.js`, `groupdoc.js`, `filterdoc.js`, `templatedoc.js`, `virtualscrolldoc.js`, `invaliddoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/listbox/index.mjs`
- `@primeuix/themes-2.0.3:types/listbox/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
