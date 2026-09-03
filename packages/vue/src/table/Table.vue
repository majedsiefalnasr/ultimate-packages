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
      <tbody :class="cx('tbody')" role="rowgroup">
        <tr v-for="(row, index) in sortedValue" :key="index" :class="cx('row')" role="row">
          <td v-for="col in columns" :key="col.field">{{ row[col.field] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { createBaseTable } from "./base-table";

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

export default {
  name: "UTable",
  extends: createBaseTable(),
  computed: {
    /**
     * Clones `value` (`[...this.value]`) before sorting so the caller's
     * input array is never mutated, matching Angular's/React's `applySort`.
     * Single mode uses `sortField`/`sortOrder`; multi mode applies
     * `multiSortMeta` entries in priority order (first entry is primary
     * key).
     */
    sortedValue() {
      const rows = [...this.value];

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
  },
  methods: {
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
  },
};
</script>
