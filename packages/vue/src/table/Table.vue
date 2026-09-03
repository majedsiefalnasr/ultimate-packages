<template>
  <div :class="cx('root')" role="table">
    <table :class="cx('table')">
      <thead :class="cx('thead')" role="rowgroup">
        <tr role="row">
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
        <tr
          v-for="(row, index) in pagedValue"
          :key="index"
          :class="cx('row')"
          role="row"
          tabindex="0"
          :aria-selected="isSelected(row)"
          @click="selectRow(row)"
          @keydown="onRowKeyDown"
        >
          <td v-for="col in columns" :key="col.field">{{ row[col.field] }}</td>
        </tr>
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
              @keydown="onRowKeyDown"
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
              <td v-for="col in columns" :key="col.field">{{ entry.value[col.field] }}</td>
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
 * Sort execution is entangled with row-value resolution per uix-data's
 * SortMeta doc comment, so it lives here rather than as a shared primitive.
 * Mirrors Angular's `compareValues`/React's `compareValues` (identical
 * null-first, numeric, then locale-string comparison rules).
 */
function resolveCell(row, field) {
  return row[field];
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Tests one row's field value against a single `FilterMetadata`. Only
 * `contains` (case-insensitive substring) is dispatched in this task's
 * scope; all other `FilterMatchMode` values are deferred, matching React's
 * Task 13 narrowed scope.
 */
function matchesFilter(row, field, filter) {
  const cellValue = String(resolveCell(row, field) ?? "").toLowerCase();
  const filterValue = String(filter.value ?? "").toLowerCase();

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    // NEEDS IMPLEMENTATION-TIME VERIFICATION: startsWith, notContains, endsWith, equals, notEquals, lt, lte, gt, gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter, custom
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
  },
  methods: {
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
     * Enter/selection-toggle behavior is already covered by `@click`, so it
     * is intentionally out of scope here.
     */
    onRowKeyDown(event) {
      const row = event.currentTarget;

      let target;
      switch (event.key) {
        case "ArrowDown":
          target = row.nextElementSibling;
          break;
        case "ArrowUp":
          target = row.previousElementSibling;
          break;
        case "Home":
          target = row.parentElement.firstElementChild;
          break;
        case "End":
          target = row.parentElement.lastElementChild;
          break;
        default:
          return;
      }

      if (target) {
        event.preventDefault();
        target.focus();
      }
    },
  },
};
</script>
