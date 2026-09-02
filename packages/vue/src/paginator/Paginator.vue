<template>
  <nav :class="cx('root')" :data-page-count="pageCount"></nav>
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
  },
};
</script>
