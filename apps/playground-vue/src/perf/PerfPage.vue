<template>
  <template v-if="state.mounted">
    <UButton v-if="subject === 'button'" label="Perf Button" />
    <UInputText v-else-if="subject === 'inputtext'" v-model="text" />
    <USelect
      v-else-if="subject === 'select'"
      :model-value="state.updated === 'value' ? SELECT_UPDATE_VALUE : null"
      :options="SELECT_OPTIONS"
      option-label="label"
      option-value="value"
      placeholder="Select"
    />
    <UDatePicker v-else-if="subject === 'datepicker'" v-model="date" />
    <div v-else-if="subject === 'dialog'">
      <button type="button" data-perf-trigger @click="state.visible = true">Open</button>
      <UDialog
        header="Perf Dialog"
        :visible="state.visible"
        @update:visible="state.visible = $event"
      >
        Dialog body
      </UDialog>
    </div>
    <div v-else-if="subject === 'drawer'">
      <button type="button" data-perf-trigger @click="state.visible = true">Open</button>
      <UDrawer
        header="Perf Drawer"
        :visible="state.visible"
        @update:visible="state.visible = $event"
      >
        Drawer body
      </UDrawer>
    </div>
    <div v-else-if="subject === 'popover'">
      <button type="button" data-perf-trigger @click="popover?.toggle($event)">Open</button>
      <UPopover ref="popover">Popover body</UPopover>
    </div>
    <div v-else-if="subject === 'menu'">
      <button type="button" data-perf-trigger @click="menu?.toggle($event)">Open</button>
      <UMenu ref="menu" :model="MENU_MODEL" popup />
    </div>
    <UTable
      v-else-if="subject === 'table-100' || subject === 'table-1000'"
      :value="subject === 'table-100' ? ROWS_100 : ROWS_1000"
      :columns="TABLE_COLUMNS"
      :sort-field="state.updated === 'sort' ? TABLE_SORT.field : undefined"
      :sort-order="state.updated === 'sort' ? TABLE_SORT.order : 0"
      :filters="state.updated === 'filter' ? TABLE_FILTER : {}"
    />
    <UTable
      v-else-if="subject === 'table-virtual-10k'"
      :value="ROWS_10K"
      :columns="TABLE_COLUMNS"
      :virtual-scroller-options="{ itemSize: ROW_HEIGHT }"
    />
    <UScroller v-else-if="subject === 'scroller-10k'" :items="ITEMS_10K" :item-size="ROW_HEIGHT" />
    <UDataView
      v-else-if="subject === 'dataview'"
      :value="ROWS_1000"
      :item-template="(row: PerfRow) => row.name"
    />
    <UOrganizationChart v-else-if="subject === 'organizationchart'" :value="ORG_TREE" />
  </template>
</template>

<script setup lang="ts">
/**
 * Client-only ADR-057 Stage 1 perf page (`/perf/<subject>`), built by
 * `build:perf` into dist/perf. It is separate from the SSR proof page
 * (App.vue and the entry-* files), which it does not import.
 */
import { ref } from "vue";
import { UButton } from "@ultimate/vue/button";
import { UDataView } from "@ultimate/vue/data-view";
import { UDatePicker } from "@ultimate/vue/date-picker";
import { UDialog } from "@ultimate/vue/dialog";
import { UDrawer } from "@ultimate/vue/drawer";
import { UInputText } from "@ultimate/vue/input-text";
import { UMenu } from "@ultimate/vue/menu";
import { UOrganizationChart } from "@ultimate/vue/organization-chart";
import { UPopover } from "@ultimate/vue/popover";
import { UScroller } from "@ultimate/vue/scroller";
import { USelect } from "@ultimate/vue/select";
import { UTable } from "@ultimate/vue/table";
import {
  ITEMS_10K,
  MENU_MODEL,
  ORG_TREE,
  ROWS_100,
  ROWS_1000,
  ROWS_10K,
  ROW_HEIGHT,
  SELECT_OPTIONS,
  SELECT_UPDATE_VALUE,
  TABLE_COLUMNS,
  TABLE_FILTER,
  TABLE_SORT,
} from "../../../../scripts/perf/browser/harness";
import type { PerfRow, PerfState } from "../../../../scripts/perf/browser/harness";

defineProps<{ subject: string; state: PerfState }>();

const text = ref("");
const date = ref<Date | null>(null);
const popover = ref<{ toggle(event: Event): void; hide(): void } | null>(null);
const menu = ref<{ toggle(event: Event): void; hide(): void } | null>(null);

defineExpose({
  hideOverlay: () => {
    popover.value?.hide();
    menu.value?.hide();
  },
});
</script>
