<template>
  <DataView v-if="c === 'list' || c === 'grid'" :value="fruits" :layout="c">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
    <template #grid="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
  <DataView v-else-if="c === 'paginator'" :value="six" paginator :rows="2">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
  <DataView v-else-if="c === 'empty'" :value="[]">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
</template>
<script setup lang="ts">
import DataView from "primevue/dataview";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const fruits = [{ name: "Apple" }, { name: "Banana" }];
const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
</script>
