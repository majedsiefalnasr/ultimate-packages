<template>
  <div :class="cx('root')" role="table">
    <table :class="cx('table')">
      <thead :class="cx('thead')" role="rowgroup">
        <tr role="row">
          <th v-for="col in columns" :key="col.field" role="columnheader">{{ col.header }}</th>
        </tr>
      </thead>
      <tbody :class="cx('tbody')" role="rowgroup">
        <tr v-for="(row, index) in value" :key="index" :class="cx('row')" role="row">
          <td v-for="col in columns" :key="col.field">{{ row[col.field] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { createBaseTable } from "./base-table";

export default {
  name: "UTable",
  extends: createBaseTable(),
};
</script>
