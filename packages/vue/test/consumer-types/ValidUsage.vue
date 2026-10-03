<template>
  <!-- GAP-082 valid usage: every line must type-check with no error. -->
  <UButton label="Save" severity="danger" :loading="false" />
  <UBarrelButton label="From the barrel" />
  <UInputText v-model="text" size="small" variant="filled" fluid />
  <UInputText v-model="text" :fluid="true" default-value="seed" @value-change="onValueChange" />
  <USelect v-model="choice" :options="mutableOptions" @update:model-value="onChoice" />
  <USelect v-model="choice" :options="readonlyOptions" />
  <UCheckbox v-model="checked" binary />
  <UCheckbox v-model="answer" true-value="yes" false-value="no" />
  <URadioButton v-model="picked" :value="{ id: 1 }" />
  <UToggleSwitch v-model="flag" :true-value="1" :false-value="0" />
  <UTable :value="mutableRows" />
  <UTable :value="readonlyRows" />
  <UTable :value="mutableRows" :selection="mutableRows" />
  <UTable :value="mutableRows" :selection="readonlyRows" />
  <UTable :value="mutableRows" :selection="{ id: 1 }" />
  <UScroller :items="mutableOptions" :item-size="40" disabled />
  <UScroller :items="readonlyOptions" :item-size="40" />
  <UTieredMenuSub :items="mutableItems" />
  <UTieredMenuSub :items="readonlyItems" />
  <UAccordion value="0" />
  <UAccordion :value="0" />
  <UAccordion :value="readonlyKeys" />
  <UOrderList v-model="mutableRows" />
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { UButton as UBarrelButton } from "@ultimate/vue";
import { UAccordion } from "@ultimate/vue/accordion";
import { UButton } from "@ultimate/vue/button";
import { UCheckbox } from "@ultimate/vue/checkbox";
import { UInputText } from "@ultimate/vue/input-text";
import { UOrderList } from "@ultimate/vue/order-list";
import { URadioButton } from "@ultimate/vue/radio-button";
import { UScroller } from "@ultimate/vue/scroller";
import { USelect } from "@ultimate/vue/select";
import { UTable } from "@ultimate/vue/table";
import { UTieredMenuSub } from "@ultimate/vue/tiered-menu";
import { UToggleSwitch } from "@ultimate/vue/toggle-switch";

const text = ref("hello");
const choice = ref<string | null>(null);
const checked = ref(false);
const answer = ref("no");
const picked = ref<{ id: number } | null>(null);
const flag = ref(0);
const mutableOptions: string[] = ["a", "b"];
const readonlyOptions: readonly string[] = ["a", "b"];
const mutableRows = ref<{ id: number }[]>([{ id: 1 }]);
const readonlyRows: readonly { id: number }[] = [{ id: 1 }];
const mutableItems = [{ label: "One" }];
const readonlyItems = [{ label: "One" }] as const;
const readonlyKeys: readonly string[] = ["0"];

function onValueChange(value: unknown): void {
  void value;
}
function onChoice(value: unknown): void {
  void value;
}

// Render-function consumers must type-check too.
export const rendered = h(UButton, { label: "Save", loading: true });
</script>
