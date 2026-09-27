<template>
  <div :class="cx('root')" role="table">
    <table :class="cx('table')">
      <thead :class="cx('thead')" role="rowgroup">
        <tr role="row">
          <th v-if="selectionColumn && selectionMode">
            <input
              v-if="selectionMode === 'multiple'"
              type="checkbox"
              :checked="allSelected"
              @click="toggleAllSelection"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.field"
            role="columnheader"
            :aria-sort="ariaSortFor(col.field)"
            @click="sortColumn(col.field)"
          >{{ col.header }}</th>
        </tr>
      </thead>
      <tbody v-if="!virtualScrollerOptions" :class="cx('tbody')" role="rowgroup">
        <template v-for="(entry, index) in groupedRows" :key="index">
          <tr
            v-if="rowGroupMode === 'subheader' && entry.isGroupHeader"
            data-u-table-group-header
            :class="cx('rowGroupHeader')"
          >
            <td :colspan="columns.length">{{ entry.row[groupRowsBy] }}</td>
          </tr>
          <tr
            :class="cx('row')"
            role="row"
            tabindex="0"
            :aria-selected="isSelected(entry.row)"
            @click="selectRow(entry.row)"
            @keydown="onRowKeyDown($event, entry.row)"
          >
            <td v-if="selectionColumn && selectionMode">
              <input
                :type="selectionMode === 'multiple' ? 'checkbox' : 'radio'"
                :checked="isSelected(entry.row)"
                @click.stop="selectRow(entry.row)"
              />
            </td>
            <td v-for="col in columns" :key="col.field">{{ renderCell(entry.row, col, index) }}</td>
            <td v-if="editMode === 'row'">
              <button
                type="button"
                data-u-table-row-edit-init
                @click.stop="initRowEdit(entry.row)"
              >Edit</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <UScroller
      v-if="virtualScrollerOptions"
      :items="filteredValue"
      :item-size="virtualScrollerOptions.itemSize"
      :lazy="lazy"
      @lazy-load="$emit('lazy-load', $event)"
    >
      <template #content="slotProps">
        <table data-u-table-virtual-body :class="cx('table')">
          <tbody :class="cx('tbody')" role="rowgroup">
            <tr
              v-for="entry in slotProps.items"
              :key="entry.index"
              :class="cx('row')"
              role="row"
              tabindex="0"
              :aria-selected="isSelected(entry.value)"
              :style="{
                position: 'absolute',
                top: slotProps.getItemOptions(entry.index).index * slotProps.itemSize + 'px',
                width: '100%',
              }"
              @click="selectRow(entry.value)"
              @keydown="onRowKeyDown($event, entry.value)"
            >
              <!--
                Known limitation: onRowKeyDown walks nextElementSibling/
                previousElementSibling/parentElement's first/last child
                within this tbody, which under virtualization only contains
                the currently-rendered window, not the full logical
                dataset — so ArrowDown/ArrowUp/Home/End stop at the edges of
                what's mounted, not the edges of the full `value` dataset.
                This is intentional (a row outside the window isn't in the
                DOM to focus), not a bug.
              -->
              <td v-for="col in columns" :key="col.field">{{ renderCell(entry.value, col, entry.index) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </UScroller>
    <UPaginator
      v-if="paginator"
      :first="first"
      :rows="rows"
      :total-records="totalRecords"
      @page="onPaginatorPage"
    />
  </div>
</template>

<script>
import { equals } from "@ultimate/uix-data";
import { deepEquals } from "@ultimate/uix-utils/object";
import { createBaseTable } from "./base-table";
import UPaginator from "../paginator/Paginator.vue";
import UScroller from "../scroller/Scroller.vue";

/**
 * @typedef {Object} UTableColumn
 * @property {string} field
 * @property {string} header
 * @property {(row: unknown, options: { field: string; rowIndex: number }) => import("vue").VNode | string} [body]
 */

/**
 * Sort execution is entangled with row-value resolution per uix-data's
 * SortMeta doc comment, so it lives here rather than as a shared primitive.
 * Mirrors Angular's `compareValues`/React's `compareValues` (identical
 * null-first, numeric, then locale-string comparison rules).
 */
function resolveCell(row, field) {
  return row[field];
}

/**
 * Renders a column's body function output when supplied, else falls back to
 * the raw field value (spec §5.1, matching Angular's/React's `renderCell`).
 * @param {unknown} row
 * @param {UTableColumn} col
 * @param {number} rowIndex
 */
function renderCell(row, col, rowIndex) {
  return col.body ? col.body(row, { field: col.field, rowIndex }) : row[col.field];
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Tests one row's field value against a single `FilterMetadata`. Every
 * `FilterMatchMode` value is dispatched except `custom`, which has no
 * executable registration path for Vue (Spec §3.4.2) and always resolves
 * to `false`.
 */
function matchesFilter(row, field, filter) {
  const rawCellValue = resolveCell(row, field);
  const rawFilterValue = filter.value;
  const cellValue = String(rawCellValue ?? "").toLowerCase();
  const filterValue = String(rawFilterValue ?? "").toLowerCase();

  const toComparable = (v) => (typeof v === "string" ? new Date(v) : v);

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    case "startsWith":
      return cellValue.startsWith(filterValue);
    case "notContains":
      // Real PrimeVue FilterService.js (matching PrimeNG's/PrimeReact's own
      // notContains): an absent/empty filter value passes through (matches
      // everything). String.prototype.includes("") is always true, so
      // without this guard `!cellValue.includes("")` would be false for
      // every row, hiding all of them instead of showing all of them.
      if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return true;
      return !cellValue.includes(filterValue);
    case "endsWith":
      return cellValue.endsWith(filterValue);
    case "equals":
      return cellValue === filterValue;
    case "notEquals":
      // Real PrimeVue FilterService.js: absent (undefined/null) OR an empty
      // string filter value => false (does not match) — matching Angular's
      // real outcome, not React's.
      if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return false;
      return cellValue !== filterValue;
    case "lt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue < rawFilterValue;
    case "lte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue <= rawFilterValue;
    case "gt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue > rawFilterValue;
    case "gte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return rawCellValue >= rawFilterValue;
    case "between": {
      const range = rawFilterValue;
      if (range == null || range[0] == null || range[1] == null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return range[0] <= rawCellValue && rawCellValue <= range[1];
    }
    case "in": {
      const options = rawFilterValue;
      if (options == null || options.length === 0) return true;
      return options.some((option) => equals(rawCellValue, option));
    }
    case "notIn": {
      const options = rawFilterValue;
      if (options == null || options.length === 0) return true;
      return !options.some((option) => equals(rawCellValue, option));
    }
    case "dateIs": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.toDateString() === filterVal.toDateString();
    }
    case "dateIsNot": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.toDateString() !== filterVal.toDateString();
    }
    case "dateBefore": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.getTime() < filterVal.getTime();
    }
    case "dateAfter": {
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const value = toComparable(rawCellValue);
      const filterVal = toComparable(rawFilterValue);
      return value.getTime() > filterVal.getTime();
    }
    case "custom":
      // No executable registration path exists for Vue's UTable (Spec
      // §3.4.2) — 'custom' is a recognized but permanently inert mode name
      // here, matching no rows. This must never be changed to read from or
      // invoke an application-supplied function without a new specification
      // authorizing that surface.
      return false;
    default:
      return true;
  }
}

/**
 * Tests one row's field value against a `filters` entry, which is either a
 * single `FilterMetadata` (must match) or a `{operator, constraints}` group
 * (spec §9's object-with-constraints-array shape, same as React's Task 13,
 * distinct from Angular's array-of-alternatives shape): `constraints` are
 * combined with AND (every constraint must match) or OR (any constraint
 * matches) per `operator`.
 */
function matchesFilterEntry(row, field, entry) {
  if (!("constraints" in entry)) return matchesFilter(row, field, entry);

  return entry.operator === "or"
    ? entry.constraints.some((c) => matchesFilter(row, field, c))
    : entry.constraints.every((c) => matchesFilter(row, field, c));
}

export default {
  name: "UTable",
  extends: createBaseTable(),
  components: { UPaginator, UScroller },
  data() {
    return {
      /**
       * Always-internal cell-edit dirty-value tracking (spec §11.3), keyed
       * by `rowIndex` only — never `dataKey`-resolved, a confirmed
       * real-source difference from React's `dataKey`-or-`rowIndex` keying.
       * Scaffolded per this task's row-edit-lifecycle scope (matching
       * Angular Task 10 / React Task 16's own deferral for cross-framework
       * symmetry); no consumer reads this yet.
       */
      d_editingMeta: {},
    };
  },
  computed: {
    /**
     * Clones `value` (`[...this.value]`) before sorting so the caller's
     * input array is never mutated, matching Angular's/React's `applySort`.
     * Single mode uses `sortField`/`sortOrder`; multi mode applies
     * `multiSortMeta` entries in priority order (first entry is primary
     * key).
     */
    sortedValue() {
      return this.applySortTo(this.value);
    },
    /**
     * Header select-all checkbox state (GAP-042, Spec §5.2): checked only
     * when there is at least one row and every row is currently selected —
     * an empty `value` is never considered "all selected".
     */
    allSelected() {
      return this.value.length > 0 && this.value.every((row) => this.isSelected(row));
    },
    /**
     * Applies `filters` (filter-then-sort) via `matchesFilterEntry`/
     * `matchesFilter`: each `filters` entry is keyed by field and is either
     * a single `FilterMetadata` (must match) or a `{operator, constraints}`
     * group (spec §9's object-with-constraints-array shape) whose
     * `constraints` combine with AND/OR per `operator`. Only `contains`
     * match mode is dispatched in this task's scope — see `matchesFilter`'s
     * dispatch comment for the deferred modes. Reuses `sortedValue`'s sort
     * logic (via `applySortTo`) rather than a parallel comparator so
     * filtered rows still respect `sortField`/`sortOrder`/`multiSortMeta`.
     */
    filteredValue() {
      const fields = Object.keys(this.filters);
      if (fields.length === 0) return this.sortedValue;

      const filtered = this.value.filter((row) =>
        fields.every((field) => matchesFilterEntry(row, field, this.filters[field]))
      );
      return this.applySortTo(filtered);
    },
    /**
     * Slices `filteredValue` to the current page window (`[first, first +
     * rows)`) when `paginator` is enabled, matching Angular's/React's
     * paginator composition (an alternative body-rendering strategy over
     * the same sorted+filtered data, not a stacked layer). Real upstream
     * evidence (PrimeVue's `DataTable.vue`: `<DTPaginator v-if="paginatorTop"
     * .../>`) confirms `paginator` is gated only on its own flag, independent
     * of virtualization state, so no mutual-exclusivity restriction is
     * imposed here.
     */
    pagedValue() {
      if (!this.paginator) return this.filteredValue;
      return this.filteredValue.slice(this.first, this.first + this.rows);
    },
    /**
     * Row-grouping view (spec §13's confirmed algorithm, matching Angular
     * Task 10's `groupedRows` getter / React Task 16's `groupedRows` memo):
     * reuses the existing multi-field sort comparator (`compareValues`, the
     * same one `applySortTo` uses) rather than a parallel comparator —
     * `groupRowsBy` is injected as a synthetic leading sort entry ahead of
     * any existing `multiSortMeta`, so rows sharing the same group value are
     * always adjacent in the result, then the rows are walked once
     * comparing each row's group value against the previous row's via
     * `uix-data`'s shared `equals` (2-arg form) to detect group boundaries.
     * When `groupRowsBy` is unset, this degrades to `pagedValue` unchanged
     * (no boundaries ever detected), preserving every prior task's
     * ungrouped rendering.
     */
    groupedRows() {
      if (!this.groupRowsBy) {
        return this.pagedValue.map((row) => ({ row, isGroupHeader: false }));
      }

      const meta = [{ field: this.groupRowsBy, order: 1 }, ...this.multiSortMeta];
      const rows = [...this.pagedValue].sort((a, b) => {
        for (const { field, order } of meta) {
          const result = compareValues(resolveCell(a, field), resolveCell(b, field));
          if (result !== 0) return result * order;
        }
        return 0;
      });

      return rows.map((row, index) => {
        const previous = rows[index - 1];
        const isGroupHeader =
          index === 0 ||
          !equals(resolveCell(row, this.groupRowsBy), resolveCell(previous, this.groupRowsBy));
        return { row, isGroupHeader };
      });
    },
  },
  methods: {
    /**
     * Renders a column's body function output when supplied, else falls
     * back to the raw field value (spec §5.1). Exposed as a method (rather
     * than calling the module-level `renderCell` helper directly from the
     * template) so the template can invoke it the same way it already calls
     * `ariaSortFor`/`isSelected`/etc.
     */
    renderCell(row, col, rowIndex) {
      return renderCell(row, col, rowIndex);
    },
    /**
     * Re-emits UPaginator's own `page` event as Table's `page` event.
     * UPaginator owns its internal `d_first`/`d_rows` mutate-then-emit
     * model (its own real upstream behavior) — Table does not mirror that
     * pattern for its own `first`/`rows` props, which stay one-way like
     * `sortField`/`sortOrder`/`selection`; the parent feeds new values back
     * via `first`/`rows` bindings if it wants persistence.
     */
    onPaginatorPage(event) {
      this.$emit("page", event);
    },
    /**
     * Clones `input` (`[...input]`) before sorting so the caller's array is
     * never mutated, matching Angular's/React's `applySort`. Single mode
     * uses `sortField`/`sortOrder`; multi mode applies `multiSortMeta`
     * entries in priority order (first entry is primary key). Factored out
     * of `sortedValue` so `filteredValue` can sort its already-filtered
     * subset without duplicating the comparator logic.
     */
    applySortTo(input) {
      const rows = [...input];

      if (this.sortMode === "multiple") {
        if (this.multiSortMeta.length === 0) return rows;
        return rows.sort((a, b) => {
          for (const { field, order } of this.multiSortMeta) {
            const result = compareValues(resolveCell(a, field), resolveCell(b, field));
            if (result !== 0) return result * order;
          }
          return 0;
        });
      }

      if (!this.sortField || this.sortOrder === 0) return rows;
      return rows.sort(
        (a, b) => compareValues(resolveCell(a, this.sortField), resolveCell(b, this.sortField)) * this.sortOrder
      );
    },
    ariaSortFor(field) {
      if (this.sortMode === "multiple") {
        const entry = this.multiSortMeta.find((m) => m.field === field);
        if (!entry || entry.order === 0) return undefined;
        return entry.order === 1 ? "ascending" : "descending";
      }

      if (this.sortField !== field || this.sortOrder === 0) return undefined;
      return this.sortOrder === 1 ? "ascending" : "descending";
    },
    /**
     * Directly sets/replaces sort state for the clicked column rather than
     * cycling through asc/desc/none (deferred per plan's Global
     * Constraints). Vue props are one-way, so this never assigns back to
     * `this.sortField`/`this.sortOrder`/`this.multiSortMeta` — it only
     * emits the computed next state; the parent feeds it back via
     * `v-model:sortField`/`v-model:sortOrder` bindings if it wants
     * persistence, matching Paginator's `page` + `update:first`/
     * `update:rows` pattern.
     */
    sortColumn(field) {
      if (this.sortMode === "multiple") {
        const meta = [...this.multiSortMeta];
        const index = meta.findIndex((m) => m.field === field);
        if (index === -1) {
          meta.push({ field, order: 1 });
        } else {
          meta[index] = { field, order: 1 };
        }
        this.$emit("sort", { multiSortMeta: meta });
        return;
      }

      this.$emit("sort", { sortField: field, sortOrder: 1 });
    },
    /**
     * Dispatches on `compareSelectionBy` between `uix-data`'s `equals`
     * (default, `dataKey`-based field identity) and `uix-utils`'s
     * structural `deepEquals`, matching React's `isRowEqual`.
     */
    isRowEqual(a, b) {
      return this.compareSelectionBy === "deepEquals" ? deepEquals(a, b) : equals(a, b, this.dataKey);
    },
    isSelected(row) {
      if (this.selection == null) return false;
      if (Array.isArray(this.selection)) return this.selection.some((s) => this.isRowEqual(s, row));
      return this.isRowEqual(this.selection, row);
    },
    /**
     * Header select-all checkbox click handler (GAP-042, Spec §5.2):
     * selects every row in `value` if not all are already selected,
     * otherwise deselects all — same dual-emit pattern as `selectRow`.
     */
    toggleAllSelection() {
      const next = this.allSelected ? [] : [...this.value];
      this.$emit("update:selection", next);
      this.$emit("selection-change", next);
    },
    /**
     * Computes the next selection value and emits it rather than mutating
     * `this.selection` directly (Vue props are one-way, same discipline as
     * `sortColumn`): single mode always emits the clicked row; multiple
     * mode toggles it in/out of the current selection array. Emits both
     * `update:selection` (for `v-model:selection`) and the plain
     * `selection-change` event, mirroring Paginator's `page` +
     * `update:first`/`update:rows` dual-emit pattern. Inert when
     * `selectionMode` is unset — no internal selection state, matching
     * sort's "no uncontrolled fallback" pattern.
     */
    selectRow(row) {
      if (!this.selectionMode) return;

      let next;
      if (this.selectionMode === "single") {
        next = row;
      } else {
        const current = Array.isArray(this.selection) ? this.selection : [];
        const index = current.findIndex((s) => this.isRowEqual(s, row));
        next = index === -1 ? [...current, row] : current.filter((_, i) => i !== index);
      }

      this.$emit("update:selection", next);
      this.$emit("selection-change", next);
    },
    /**
     * Keyboard-equivalent path for row navigation (spec §15's confirmed
     * ArrowDown/ArrowUp/Home/End baseline), matching Angular's Task 7
     * `onRowKeyDown` and React's Task 14 `handleRowKeyDown` vocabulary —
     * the mechanism differs (DOM sibling traversal via
     * `$el.nextElementSibling`/`previousElementSibling` here vs. Angular's
     * `@HostListener`/React's `querySelectorAll`), the vocabulary does not.
     * Only moves `.focus()` between sibling `tbody [role="row"]` elements —
     * never the header row, since this handler is bound per data row.
     *
     * Also handles keyboard selection (GAP-047, Spec §5.7): Space/Enter
     * toggle the focused row's selection by reusing the same `selectRow`
     * toggle logic the row-click handler and selection-column controls
     * already share (no duplicated toggle logic), and Ctrl+A/Cmd+A selects
     * every row in `value` when `selectionMode` is exactly `"multiple"`.
     * When `selectionMode` is not `"multiple"` (including unset), Ctrl+A
     * does nothing and does not call `preventDefault()` — the browser's
     * native "select all text" behavior is only swallowed when Ctrl+A
     * actually did something (Review Focus item 3).
     */
    onRowKeyDown(event, row) {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyA") {
        if (this.selectionMode === "multiple") {
          event.preventDefault();
          const next = [...this.value];
          this.$emit("update:selection", next);
          this.$emit("selection-change", next);
        }
        return;
      }

      if (event.code === "Space" || event.code === "Enter") {
        if (this.selectionMode) {
          event.preventDefault();
          this.selectRow(row);
        }
        return;
      }

      const rowElement = event.currentTarget;

      let target;
      switch (event.key) {
        case "ArrowDown":
          target = rowElement.nextElementSibling;
          break;
        case "ArrowUp":
          target = rowElement.previousElementSibling;
          break;
        case "Home":
          target = rowElement.parentElement.firstElementChild;
          break;
        case "End":
          target = rowElement.parentElement.lastElementChild;
          break;
        default:
          return;
      }

      if (target) {
        event.preventDefault();
        target.focus();
      }
    },
    /**
     * Row-editing lifecycle entry point (spec §11.3's Array-append idiom,
     * distinct from Angular's/React's key-map shape): appends `row` to
     * `editingRows` and emits `update:editingRows` with the next array
     * value — never mutates the `editingRows` prop directly, matching the
     * one-way-prop discipline already established for `sortField`/
     * `selection`/etc.
     */
    initRowEdit(row) {
      this.$emit("update:editingRows", [...this.editingRows, row]);
    },
  },
};
</script>
