/**
 * Aura preset top-level `css`: a global rule registered once with the common
 * theme variables (`registerThemeVariables`, `u-global-style`). It resets
 * `transition` on option rows and on menu and table rows, so selection and
 * hover states switch without a delay.
 *
 * Selectors use Ultimate's class names: the `u-` prefix and the family names
 * the components ship (`u-cascade-select-*`, `u-multi-select-*`, `u-table-*`).
 */
export const css = `
    li.u-autocomplete-option,
    div.u-cascade-select-option-content,
    li.u-listbox-option,
    li.u-multi-select-option,
    li.u-select-option,
    li.u-table-filter-constraint,
    .u-table .u-table-tbody > tr,
    div.u-menu-item-content,
    div.u-tieredmenu-item-content,
    div.u-contextmenu-item-content,
    div.u-menubar-item-content,
    div.u-megamenu-item-content,
    div.u-panelmenu-header-content,
    th.u-table-header-cell,
    thead.u-table-thead > tr > th {
        transition: none;
    }
`;
