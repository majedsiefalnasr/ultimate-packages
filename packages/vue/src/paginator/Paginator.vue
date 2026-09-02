<template>
  <nav :class="cx('root')" :data-page-count="pageCount">
    <div :class="cx('content')">
      <button
        type="button"
        data-u-paginator-first
        :class="cx('first', { disabled: isFirstPage })"
        :disabled="isFirstPage"
        aria-label="First Page"
        @click="changePage(0)"
      />
      <button
        type="button"
        data-u-paginator-prev
        :class="cx('prev', { disabled: isFirstPage })"
        :disabled="isFirstPage"
        aria-label="Previous Page"
        @click="changePage(Math.max(0, d_first - d_rows))"
      />
      <button
        v-for="link in pageLinks"
        :key="link"
        type="button"
        data-u-paginator-page
        :class="cx('page', { selected: link - 1 === page })"
        :aria-current="link - 1 === page ? 'page' : null"
        :aria-label="'Page ' + link"
        @click="changePage((link - 1) * d_rows)"
      >{{ link }}</button>
      <button
        type="button"
        data-u-paginator-next
        :class="cx('next', { disabled: isLastPage })"
        :disabled="isLastPage"
        aria-label="Next Page"
        @click="changePage(d_first + d_rows)"
      />
      <button
        type="button"
        data-u-paginator-last
        :class="cx('last', { disabled: isLastPage })"
        :disabled="isLastPage"
        aria-label="Last Page"
        @click="changePage((pageCount - 1) * d_rows)"
      />
      <span data-u-paginator-current-report :class="cx('currentPageReport')" aria-live="polite">{{ page + 1 }} of {{ pageCount }}</span>
    </div>
  </nav>
</template>

<script>
import { getPageCount } from "@ultimate/uix-data";
import { createBasePaginator } from "./base-paginator";

export default {
  name: "UPaginator",
  extends: createBasePaginator(),
  computed: {
    pageCount() {
      return getPageCount(this.totalRecords, this.d_rows);
    },
    page() {
      return this.d_rows > 0 ? Math.floor(this.d_first / this.d_rows) : 0;
    },
    isFirstPage() {
      return this.page === 0;
    },
    isLastPage() {
      return this.page === this.pageCount - 1;
    },
    pageLinks() {
      const pageCount = this.pageCount;
      const pageLinkSize = this.pageLinkSize;
      const currentPage = this.page;
      const visiblePages = Math.min(pageLinkSize, pageCount);
      let start = Math.max(0, Math.ceil(currentPage - visiblePages / 2));
      const end = Math.min(pageCount - 1, start + visiblePages - 1);
      const delta = pageLinkSize - (end - start + 1);
      start = Math.max(0, start - delta);
      const links = [];
      for (let i = start; i <= end; i++) links.push(i + 1);
      return links;
    },
  },
  methods: {
    changePage(newFirst) {
      const pageCount = this.pageCount;
      const p = this.d_rows > 0 ? Math.floor(newFirst / this.d_rows) : 0;
      if (p >= 0 && p < pageCount) {
        this.d_first = newFirst;
        this.$emit("page", { page: p, first: newFirst, rows: this.d_rows, pageCount });
        this.$emit("update:first", newFirst);
        this.$emit("update:rows", this.d_rows);
      }
    },
  },
};
</script>
