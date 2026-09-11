<template>
  <div id="app-root" ref="rootRef">
    <h1>Ultimate Vue SSR Proof</h1>

    <section aria-labelledby="button-heading">
      <h2 id="button-heading">Button</h2>
      <UButton label="Proof Button" @click="clickCount++" />
      <p data-testid="click-counter">Clicks: {{ clickCount }}</p>
    </section>

    <section aria-labelledby="checkbox-heading">
      <h2 id="checkbox-heading">Checkbox</h2>
      <UCheckbox v-model="checkboxChecked" binary />
      <p data-testid="checkbox-state">Checked: {{ checkboxChecked }}</p>
    </section>

    <section aria-labelledby="dialog-heading">
      <h2 id="dialog-heading">Dialog</h2>
      <UButton label="Open Dialog" @click="dialogVisible = true" />
      <UDialog
        header="Proof Dialog"
        :visible="dialogVisible"
        close-on-escape
        @update:visible="dialogVisible = $event"
      >
        <p>Proof Dialog Content</p>
      </UDialog>
    </section>

    <section aria-labelledby="menu-heading">
      <h2 id="menu-heading">Menu</h2>
      <UMenu :model="menuItems" />
      <p data-testid="menu-last-selected">Last selected: {{ lastSelectedMenuItem }}</p>
    </section>

    <section aria-labelledby="paginator-heading">
      <h2 id="paginator-heading">Paginator</h2>
      <p data-testid="paginator-page">Page {{ paginatorPage }}</p>
      <UPaginator :first="paginatorFirst" :rows="2" :total-records="6" @page="onPaginatorPage" />
    </section>

    <section aria-labelledby="scroller-heading">
      <h2 id="scroller-heading">Scroller</h2>
      <UScroller :items="scrollerItems" :item-size="40" disabled />
    </section>

    <section aria-labelledby="table-heading">
      <h2 id="table-heading">Table</h2>
      <UTable
        :value="tableRows"
        :columns="tableColumns"
        :sort-field="tableSortField"
        :sort-order="tableSortOrder"
        @sort="onTableSort"
      />
    </section>

    <section aria-labelledby="tooltip-heading">
      <h2 id="tooltip-heading">Tooltip</h2>
      <span v-tooltip="'Proof Tooltip Content'" data-testid="tooltip-host">Hover for tooltip</span>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UButton } from "@ultimate/vue/button";
import { UCheckbox } from "@ultimate/vue/checkbox";
import { UDialog } from "@ultimate/vue/dialog";
import { UMenu } from "@ultimate/vue/menu";
import { UPaginator } from "@ultimate/vue/paginator";
import { UScroller } from "@ultimate/vue/scroller";
import { UTable } from "@ultimate/vue/table";
import { tooltipDirective as vTooltip } from "@ultimate/vue/tooltip";

/**
 * Single root component rendering all 8 `@ultimate/vue` components with
 * static fixture data, for Track E's SSR/hydration verification harness.
 * Every component is imported via `@ultimate/vue`'s per-component subpaths
 * (confirmed present for all 8 in the package's `exports` map). Tooltip is
 * a custom directive (`v-tooltip`, exported as `tooltipDirective`), not a
 * component — its DOM manipulation runs only from `mounted`/`updated`
 * directive hooks, which never fire during `renderToString`'s server pass,
 * matching the harness's requirement that tooltip content be absent from
 * initial SSR HTML.
 */

const rootRef = ref<HTMLDivElement | null>(null);

// --- Button ---
const clickCount = ref(0);

// --- Checkbox ---
const checkboxChecked = ref(false);

// --- Dialog ---
const dialogVisible = ref(false);

// --- Menu ---
const lastSelectedMenuItem = ref("none");
const menuItems = [
  { label: "First Item", command: () => (lastSelectedMenuItem.value = "First Item") },
  { label: "Second Item", command: () => (lastSelectedMenuItem.value = "Second Item") },
  { label: "Third Item", command: () => (lastSelectedMenuItem.value = "Third Item") },
];

// --- Paginator ---
const paginatorFirst = ref(0);
const paginatorPage = ref(1);

function onPaginatorPage(event: { page: number; first: number }) {
  paginatorFirst.value = event.first;
  paginatorPage.value = event.page + 1;
}

// --- Scroller ---
// Fixed, literal 5-item list (no windowing) — `disabled` on UScroller
// renders every item unconditionally, matching the harness's binding
// determinism/no-hidden-items rule.
const scrollerItems: readonly string[] = ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"];

// --- Table ---
// Fixed, literal fixture rows: 3 rows x 2 columns of static strings/numbers.
// No Math.random()/Date.now()/locale formatting per the harness's binding
// determinism rule.
const tableRows = [
  { name: "Alpha", score: 30 },
  { name: "Bravo", score: 10 },
  { name: "Charlie", score: 20 },
];
const tableColumns = [
  { field: "name", header: "Name" },
  { field: "score", header: "Score" },
];
const tableSortField = ref<string | undefined>(undefined);
const tableSortOrder = ref<number>(0);

function onTableSort(event: { sortField?: string; sortOrder?: number }) {
  tableSortField.value = event.sortField;
  tableSortOrder.value = event.sortOrder ?? 0;
}

// Hydration marker: flips true only after the client attaches, via
// onMounted(), which Vue's own docs confirm never fires during
// renderToString()'s server pass — a later Playwright test polls for this
// attribute.
onMounted(() => {
  rootRef.value?.setAttribute("data-hydrated", "true");
});
</script>
