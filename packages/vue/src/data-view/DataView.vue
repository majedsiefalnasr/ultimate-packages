<script>
import { createBaseDataView } from "./BaseDataView";
import Paginator from "../paginator/Paginator.vue";

function field(item, path) {
  if (typeof path !== "string" || !path) return undefined;
  return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), item);
}

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}

function pageNumber(value) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export default {
  name: "UDataView",
  extends: createBaseDataView(),
  components: { Paginator },
  data() {
    return { pageFirst: pageNumber(this.first), pageRows: pageNumber(this.rows) };
  },
  watch: {
    first(value) {
      this.pageFirst = pageNumber(value);
    },
    rows(value) {
      this.pageRows = pageNumber(value);
    },
    pageFirst() {
      this.emitLazy();
    },
    pageRows() {
      this.emitLazy();
    },
    sortField() {
      this.emitLazy();
    },
    sortOrder() {
      this.emitLazy();
    },
    lazy() {
      this.emitLazy();
    },
  },
  mounted() {
    this.emitLazy();
  },
  computed: {
    sourceValue() {
      return Array.isArray(this.value) ? this.value : [];
    },
    layoutMode() {
      return this.layout === "grid" ? "grid" : "list";
    },
    normalizedSortOrder() {
      return this.sortOrder === -1 ? -1 : 1;
    },
    processed() {
      if (this.lazy || typeof this.sortField !== "string" || !this.sortField)
        return this.sourceValue;
      return [...this.sourceValue].sort(
        (a, b) =>
          compare(field(a, this.sortField), field(b, this.sortField)) * this.normalizedSortOrder
      );
    },
    count() {
      return this.lazy && Number.isFinite(this.totalRecords) && this.totalRecords >= 0
        ? this.totalRecords
        : this.processed.length;
    },
    pagedValue() {
      return this.lazy || !this.paginator || this.pageRows === 0
        ? this.processed
        : this.processed.slice(this.pageFirst, this.pageFirst + this.pageRows);
    },
    showPaginator() {
      return this.paginator && (this.alwaysShowPaginator || this.count > this.pageRows);
    },
    report() {
      const pages = this.pageRows > 0 ? Math.ceil(this.count / this.pageRows) : 0;
      return this.currentPageReportTemplate
        .replaceAll("{first}", String(this.count ? this.pageFirst + 1 : 0))
        .replaceAll("{last}", String(Math.min(this.pageFirst + this.pageRows, this.count)))
        .replaceAll("{totalRecords}", String(this.count))
        .replaceAll(
          "{currentPage}",
          String(pages ? Math.floor(this.pageFirst / this.pageRows) + 1 : 0)
        )
        .replaceAll("{totalPages}", String(pages))
        .replaceAll("{rows}", String(this.pageRows));
    },
  },
  methods: {
    identity(item, index) {
      if (this.dataKey) return field(item, this.dataKey);
      return typeof this.trackBy === "function" ? this.trackBy(item, index) : index;
    },
    onPage(event) {
      if (!event || !Number.isFinite(event.first) || !Number.isFinite(event.rows)) return;
      this.pageFirst = pageNumber(event.first);
      this.pageRows = pageNumber(event.rows);
      this.$emit("page", event);
      this.$emit("update:first", this.pageFirst);
      this.$emit("update:rows", this.pageRows);
    },
    changeRows(event) {
      const rows = pageNumber(Number(event?.target?.value));
      if (rows > 0)
        this.onPage({ first: 0, rows, page: 0, pageCount: Math.ceil(this.count / rows) });
    },
    emitLazy() {
      if (this.lazy)
        this.$emit("lazy-load", {
          first: this.pageFirst,
          rows: this.pageRows,
          sortField: typeof this.sortField === "string" ? this.sortField : null,
          sortOrder: this.normalizedSortOrder,
        });
    },
  },
};
</script>

<template>
  <div :class="cx('root')" :aria-busy="loading">
    <span v-if="loading" role="status" :class="loadingIcon">Loading</span>
    <Paginator
      v-if="showPaginator && paginatorPosition !== 'bottom'"
      :first="pageFirst"
      :rows="pageRows"
      :total-records="count"
      @page="onPage"
    />
    <div v-if="layoutMode === 'grid'" :class="cx('list', { layout: 'grid' })" role="list">
      <slot name="grid" :items="pagedValue">
        <div
          v-for="(item, index) in pagedValue"
          :key="identity(item, index)"
          :class="cx('listItem')"
          role="listitem"
        >
          {{ typeof itemTemplate === "function" ? itemTemplate(item, "grid") : String(item) }}
        </div>
      </slot>
    </div>
    <div v-else :class="cx('list', { layout: 'list' })" role="list">
      <slot name="list" :items="pagedValue">
        <div
          v-for="(item, index) in pagedValue"
          :key="identity(item, index)"
          :class="cx('listItem')"
          role="listitem"
        >
          {{ typeof itemTemplate === "function" ? itemTemplate(item, "list") : String(item) }}
        </div>
      </slot>
    </div>
    <div v-if="!pagedValue.length">{{ emptyMessage }}</div>
    <Paginator
      v-if="showPaginator && paginatorPosition !== 'top'"
      :first="pageFirst"
      :rows="pageRows"
      :total-records="count"
      @page="onPage"
    />
    <template v-if="paginator">
      <label v-if="rowsPerPageOptions.length"
        >Rows per page<select :value="pageRows" @change="changeRows">
          <option v-for="size in rowsPerPageOptions" :key="size" :value="size">{{ size }}</option>
        </select></label
      >
      <span aria-live="polite">{{ report }}</span>
    </template>
  </div>
</template>
