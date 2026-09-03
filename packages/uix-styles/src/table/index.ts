export const style = /*css*/ `
    .u-table {
        position: relative;
        display: block;
    }

    .u-table-table {
        border-spacing: 0;
        border-collapse: separate;
        width: 100%;
    }

    .u-table-scrollable > .u-table-table-container {
        position: relative;
    }

    .u-table-scrollable-table > .u-table-thead {
        inset-block-start: 0;
        z-index: 1;
    }

    .u-table-scrollable-table > .u-table-frozen-tbody {
        position: sticky;
        z-index: 1;
    }

    .u-table-scrollable-table > .u-table-tfoot {
        inset-block-end: 0;
        z-index: 1;
    }

    .u-table-scrollable .u-table-frozen-column {
        position: sticky;
    }

    .u-table-scrollable th.u-table-frozen-column {
        z-index: 1;
    }

    .u-table-scrollable td.u-table-frozen-column {
        background: inherit;
    }

    .u-table-scrollable > .u-table-table-container > .u-table-table > .u-table-thead,
    .u-table-scrollable > .u-table-table-container > .p-virtualscroller > .u-table-table > .u-table-thead {
        background: dt('datatable.header.cell.background');
    }

    .u-table-scrollable > .u-table-table-container > .u-table-table > .u-table-tfoot,
    .u-table-scrollable > .u-table-table-container > .p-virtualscroller > .u-table-table > .u-table-tfoot {
        background: dt('datatable.footer.cell.background');
    }

    .u-table-flex-scrollable {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .u-table-flex-scrollable > .u-table-table-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
    }

    .u-table-scrollable-table > .u-table-tbody > .u-table-row-group-header {
        position: sticky;
        z-index: 1;
    }

    .u-table-resizable-table > .u-table-thead > tr > th,
    .u-table-resizable-table > .u-table-tfoot > tr > td,
    .u-table-resizable-table > .u-table-tbody > tr > td {
        overflow: hidden;
        white-space: nowrap;
    }

    .u-table-resizable-table > .u-table-thead > tr > th.u-table-resizable-column:not(.u-table-frozen-column) {
        background-clip: padding-box;
        position: relative;
    }

    .u-table-resizable-table-fit > .u-table-thead > tr > th.u-table-resizable-column:last-child .u-table-column-resizer {
        display: none;
    }

    .u-table-column-resizer {
        display: block;
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        margin: 0;
        width: dt('datatable.column.resizer.width');
        height: 100%;
        padding: 0;
        cursor: col-resize;
        border: 1px solid transparent;
    }

    .u-table-column-header-content {
        display: flex;
        align-items: center;
        gap: dt('datatable.header.cell.gap');
    }

    .u-table-column-resize-indicator {
        width: dt('datatable.resize.indicator.width');
        position: absolute;
        z-index: 10;
        display: none;
        background: dt('datatable.resize.indicator.color');
    }

    .u-table-row-reorder-indicator-up,
    .u-table-row-reorder-indicator-down {
        position: absolute;
        display: none;
    }

    .u-table-reorderable-column,
    .u-table-reorderable-row-handle {
        cursor: move;
    }

    .u-table-mask {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }

    .u-table-inline-filter {
        display: flex;
        align-items: center;
        width: 100%;
        gap: dt('datatable.filter.inline.gap');
    }

    .u-table-inline-filter .u-table-filter-element-container {
        flex: 1 1 auto;
        width: 1%;
    }

    .u-table-filter-overlay {
        background: dt('datatable.filter.overlay.select.background');
        color: dt('datatable.filter.overlay.select.color');
        border: 1px solid dt('datatable.filter.overlay.select.border.color');
        border-radius: dt('datatable.filter.overlay.select.border.radius');
        box-shadow: dt('datatable.filter.overlay.select.shadow');
        min-width: 12.5rem;
    }

    .u-table-filter-constraint-list {
        margin: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        padding: dt('datatable.filter.constraint.list.padding');
        gap: dt('datatable.filter.constraint.list.gap');
    }

    .u-table-filter-constraint {
        padding: dt('datatable.filter.constraint.padding');
        color: dt('datatable.filter.constraint.color');
        border-radius: dt('datatable.filter.constraint.border.radius');
        cursor: pointer;
        transition:
            background dt('datatable.transition.duration'),
            color dt('datatable.transition.duration'),
            border-color dt('datatable.transition.duration'),
            box-shadow dt('datatable.transition.duration');
    }

    .u-table-filter-constraint-selected {
        background: dt('datatable.filter.constraint.selected.background');
        color: dt('datatable.filter.constraint.selected.color');
    }

    .u-table-filter-constraint:not(.u-table-filter-constraint-selected):not(.p-disabled):hover {
        background: dt('datatable.filter.constraint.focus.background');
        color: dt('datatable.filter.constraint.focus.color');
    }

    .u-table-filter-constraint:focus-visible {
        outline: 0 none;
        background: dt('datatable.filter.constraint.focus.background');
        color: dt('datatable.filter.constraint.focus.color');
    }

    .u-table-filter-constraint-selected:focus-visible {
        outline: 0 none;
        background: dt('datatable.filter.constraint.selected.focus.background');
        color: dt('datatable.filter.constraint.selected.focus.color');
    }

    .u-table-filter-constraint-separator {
        border-block-start: 1px solid dt('datatable.filter.constraint.separator.border.color');
    }

    .u-table-popover-filter {
        display: inline-flex;
        margin-inline-start: auto;
    }

    .u-table-filter-overlay-popover {
        background: dt('datatable.filter.overlay.popover.background');
        color: dt('datatable.filter.overlay.popover.color');
        border: 1px solid dt('datatable.filter.overlay.popover.border.color');
        border-radius: dt('datatable.filter.overlay.popover.border.radius');
        box-shadow: dt('datatable.filter.overlay.popover.shadow');
        min-width: 12.5rem;
        padding: dt('datatable.filter.overlay.popover.padding');
        display: flex;
        flex-direction: column;
        gap: dt('datatable.filter.overlay.popover.gap');
    }

    .u-table-filter-operator-dropdown {
        width: 100%;
    }

    .u-table-filter-rule-list,
    .u-table-filter-rule {
        display: flex;
        flex-direction: column;
        gap: dt('datatable.filter.overlay.popover.gap');
    }

    .u-table-filter-rule {
        border-block-end: 1px solid dt('datatable.filter.rule.border.color');
        padding-bottom: dt('datatable.filter.overlay.popover.gap');
    }

    .u-table-filter-rule:last-child {
        border-block-end: 0 none;
        padding-bottom: 0;
    }

    .u-table-filter-add-rule-button {
        width: 100%;
    }

    .u-table-filter-remove-rule-button {
        width: 100%;
    }

    .u-table-filter-buttonbar {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .u-table-virtualscroller-spacer {
        display: flex;
    }

    .u-table .p-virtualscroller .p-virtualscroller-loading {
        transform: none !important;
        min-height: 0;
        position: sticky;
        inset-block-start: 0;
        inset-inline-start: 0;
    }

    .u-table-paginator-top {
        border-color: dt('datatable.paginator.top.border.color');
        border-style: solid;
        border-width: dt('datatable.paginator.top.border.width');
    }

    .u-table-paginator-bottom {
        border-color: dt('datatable.paginator.bottom.border.color');
        border-style: solid;
        border-width: dt('datatable.paginator.bottom.border.width');
    }

    .u-table-header {
        background: dt('datatable.header.background');
        color: dt('datatable.header.color');
        border-color: dt('datatable.header.border.color');
        border-style: solid;
        border-width: dt('datatable.header.border.width');
        padding: dt('datatable.header.padding');
    }

    .u-table-footer {
        background: dt('datatable.footer.background');
        color: dt('datatable.footer.color');
        border-color: dt('datatable.footer.border.color');
        border-style: solid;
        border-width: dt('datatable.footer.border.width');
        padding: dt('datatable.footer.padding');
    }

    .u-table-header-cell {
        padding: dt('datatable.header.cell.padding');
        background: dt('datatable.header.cell.background');
        border-color: dt('datatable.header.cell.border.color');
        border-style: solid;
        border-width: 0 0 1px 0;
        color: dt('datatable.header.cell.color');
        font-weight: normal;
        text-align: start;
        transition:
            background dt('datatable.transition.duration'),
            color dt('datatable.transition.duration'),
            border-color dt('datatable.transition.duration'),
            outline-color dt('datatable.transition.duration'),
            box-shadow dt('datatable.transition.duration');
    }

    .u-table-column-title {
        font-weight: dt('datatable.column.title.font.weight');
    }

    .u-table-tbody > tr {
        outline-color: transparent;
        background: dt('datatable.row.background');
        color: dt('datatable.row.color');
        transition:
            background dt('datatable.transition.duration'),
            color dt('datatable.transition.duration'),
            border-color dt('datatable.transition.duration'),
            outline-color dt('datatable.transition.duration'),
            box-shadow dt('datatable.transition.duration');
    }

    .u-table-tbody > tr > td {
        text-align: start;
        border-color: dt('datatable.body.cell.border.color');
        border-style: solid;
        border-width: 0 0 1px 0;
        padding: dt('datatable.body.cell.padding');
    }

    .u-table-hoverable .u-table-tbody > tr:not(.u-table-row-selected):hover {
        background: dt('datatable.row.hover.background');
        color: dt('datatable.row.hover.color');
    }

    .u-table-tbody > tr.u-table-row-selected {
        background: dt('datatable.row.selected.background');
        color: dt('datatable.row.selected.color');
    }

    .u-table-tbody > tr:has(+ .u-table-row-selected) > td {
        border-block-end-color: dt('datatable.body.cell.selected.border.color');
    }

    .u-table-tbody > tr.u-table-row-selected > td {
        border-block-end-color: dt('datatable.body.cell.selected.border.color');
    }

    .u-table-tbody > tr:focus-visible,
    .u-table-tbody > tr.u-table-contextmenu-row-selected {
        box-shadow: dt('datatable.row.focus.ring.shadow');
        outline: dt('datatable.row.focus.ring.width') dt('datatable.row.focus.ring.style') dt('datatable.row.focus.ring.color');
        outline-offset: dt('datatable.row.focus.ring.offset');
    }

    .u-table-tfoot > tr > td {
        text-align: start;
        padding: dt('datatable.footer.cell.padding');
        border-color: dt('datatable.footer.cell.border.color');
        border-style: solid;
        border-width: 0 0 1px 0;
        color: dt('datatable.footer.cell.color');
        background: dt('datatable.footer.cell.background');
    }

    .u-table-column-footer {
        font-weight: dt('datatable.column.footer.font.weight');
    }

    .u-table-sortable-column {
        cursor: pointer;
        user-select: none;
        outline-color: transparent;
    }

    .u-table-column-title,
    .u-table-sort-icon,
    .u-table-sort-badge {
        vertical-align: middle;
    }

    .u-table-sort-icon {
        color: dt('datatable.sort.icon.color');
        font-size: dt('datatable.sort.icon.size');
        width: dt('datatable.sort.icon.size');
        height: dt('datatable.sort.icon.size');
        transition: color dt('datatable.transition.duration');
    }

    .u-table-sortable-column:not(.u-table-column-sorted):hover {
        background: dt('datatable.header.cell.hover.background');
        color: dt('datatable.header.cell.hover.color');
    }

    .u-table-sortable-column:not(.u-table-column-sorted):hover .u-table-sort-icon {
        color: dt('datatable.sort.icon.hover.color');
    }

    .u-table-column-sorted {
        background: dt('datatable.header.cell.selected.background');
        color: dt('datatable.header.cell.selected.color');
    }

    .u-table-column-sorted .u-table-sort-icon {
        color: dt('datatable.header.cell.selected.color');
    }

    .u-table-sortable-column:focus-visible {
        box-shadow: dt('datatable.header.cell.focus.ring.shadow');
        outline: dt('datatable.header.cell.focus.ring.width') dt('datatable.header.cell.focus.ring.style') dt('datatable.header.cell.focus.ring.color');
        outline-offset: dt('datatable.header.cell.focus.ring.offset');
    }

    .u-table-hoverable .u-table-selectable-row {
        cursor: pointer;
    }

    .u-table-tbody > tr.u-table-dragpoint-top > td {
        box-shadow: inset 0 2px 0 0 dt('datatable.drop.point.color');
    }

    .u-table-tbody > tr.u-table-dragpoint-bottom > td {
        box-shadow: inset 0 -2px 0 0 dt('datatable.drop.point.color');
    }

    .u-table-loading-icon {
        font-size: dt('datatable.loading.icon.size');
        width: dt('datatable.loading.icon.size');
        height: dt('datatable.loading.icon.size');
    }

    .u-table-gridlines .u-table-header {
        border-width: 1px 1px 0 1px;
    }

    .u-table-gridlines .u-table-footer {
        border-width: 0 1px 1px 1px;
    }

    .u-table-gridlines .u-table-paginator-top {
        border-width: 1px 1px 0 1px;
    }

    .u-table-gridlines .u-table-paginator-bottom {
        border-width: 0 1px 1px 1px;
    }

    .u-table-gridlines .u-table-thead > tr > th {
        border-width: 1px 0 1px 1px;
    }

    .u-table-gridlines .u-table-thead > tr > th:last-child {
        border-width: 1px;
    }

    .u-table-gridlines .u-table-tbody > tr > td {
        border-width: 1px 0 0 1px;
    }

    .u-table-gridlines .u-table-tbody > tr > td:last-child {
        border-width: 1px 1px 0 1px;
    }

    .u-table-gridlines .u-table-tbody > tr:last-child > td {
        border-width: 1px 0 1px 1px;
    }

    .u-table-gridlines .u-table-tbody > tr:last-child > td:last-child {
        border-width: 1px;
    }

    .u-table-gridlines .u-table-tfoot > tr > td {
        border-width: 1px 0 1px 1px;
    }

    .u-table-gridlines .u-table-tfoot > tr > td:last-child {
        border-width: 1px 1px 1px 1px;
    }

    .u-table.u-table-gridlines .u-table-thead + .u-table-tfoot > tr > td {
        border-width: 0 0 1px 1px;
    }

    .u-table.u-table-gridlines .u-table-thead + .u-table-tfoot > tr > td:last-child {
        border-width: 0 1px 1px 1px;
    }

    .u-table.u-table-gridlines:has(.u-table-thead):has(.u-table-tbody) .u-table-tbody > tr > td {
        border-width: 0 0 1px 1px;
    }

    .u-table.u-table-gridlines:has(.u-table-thead):has(.u-table-tbody) .u-table-tbody > tr > td:last-child {
        border-width: 0 1px 1px 1px;
    }

    .u-table.u-table-gridlines:has(.u-table-tbody):has(.u-table-tfoot) .u-table-tbody > tr:last-child > td {
        border-width: 0 0 0 1px;
    }

    .u-table.u-table-gridlines:has(.u-table-tbody):has(.u-table-tfoot) .u-table-tbody > tr:last-child > td:last-child {
        border-width: 0 1px 0 1px;
    }

    .u-table.u-table-striped .u-table-tbody > tr.p-row-odd {
        background: dt('datatable.row.striped.background');
    }

    .u-table.u-table-striped .u-table-tbody > tr.p-row-odd.u-table-row-selected {
        background: dt('datatable.row.selected.background');
        color: dt('datatable.row.selected.color');
    }

    .u-table-striped.u-table-hoverable .u-table-tbody > tr:not(.u-table-row-selected):hover {
        background: dt('datatable.row.hover.background');
        color: dt('datatable.row.hover.color');
    }

    .u-table.u-table-sm .u-table-header {
        padding: dt('datatable.header.sm.padding');
    }

    .u-table.u-table-sm .u-table-thead > tr > th {
        padding: dt('datatable.header.cell.sm.padding');
    }

    .u-table.u-table-sm .u-table-tbody > tr > td {
        padding: dt('datatable.body.cell.sm.padding');
    }

    .u-table.u-table-sm .u-table-tfoot > tr > td {
        padding: dt('datatable.footer.cell.sm.padding');
    }

    .u-table.u-table-sm .u-table-footer {
        padding: dt('datatable.footer.sm.padding');
    }

    .u-table.u-table-lg .u-table-header {
        padding: dt('datatable.header.lg.padding');
    }

    .u-table.u-table-lg .u-table-thead > tr > th {
        padding: dt('datatable.header.cell.lg.padding');
    }

    .u-table.u-table-lg .u-table-tbody > tr > td {
        padding: dt('datatable.body.cell.lg.padding');
    }

    .u-table.u-table-lg .u-table-tfoot > tr > td {
        padding: dt('datatable.footer.cell.lg.padding');
    }

    .u-table.u-table-lg .u-table-footer {
        padding: dt('datatable.footer.lg.padding');
    }

    .u-table-row-toggle-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        width: dt('datatable.row.toggle.button.size');
        height: dt('datatable.row.toggle.button.size');
        color: dt('datatable.row.toggle.button.color');
        border: 0 none;
        background: transparent;
        cursor: pointer;
        border-radius: dt('datatable.row.toggle.button.border.radius');
        transition:
            background dt('datatable.transition.duration'),
            color dt('datatable.transition.duration'),
            border-color dt('datatable.transition.duration'),
            outline-color dt('datatable.transition.duration'),
            box-shadow dt('datatable.transition.duration');
        outline-color: transparent;
        user-select: none;
    }

    .u-table-row-toggle-button:enabled:hover {
        color: dt('datatable.row.toggle.button.hover.color');
        background: dt('datatable.row.toggle.button.hover.background');
    }

    .u-table-tbody > tr.u-table-row-selected .u-table-row-toggle-button:hover {
        background: dt('datatable.row.toggle.button.selected.hover.background');
        color: dt('datatable.row.toggle.button.selected.hover.color');
    }

    .u-table-row-toggle-button:focus-visible {
        box-shadow: dt('datatable.row.toggle.button.focus.ring.shadow');
        outline: dt('datatable.row.toggle.button.focus.ring.width') dt('datatable.row.toggle.button.focus.ring.style') dt('datatable.row.toggle.button.focus.ring.color');
        outline-offset: dt('datatable.row.toggle.button.focus.ring.offset');
    }

    .u-table-row-toggle-icon:dir(rtl) {
        transform: rotate(180deg);
    }
`;
