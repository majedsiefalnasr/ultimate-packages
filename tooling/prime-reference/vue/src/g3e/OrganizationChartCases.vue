<!-- Step 3: PrimeVue renders node content only through the default slot (labels mirror the Ultimate stories). -->
<template>
  <OrganizationChart v-if="c === 'basic'" :value="tree"
    ><template #default="{ node }">{{ node.label }}</template></OrganizationChart
  >
  <OrganizationChart
    v-else-if="c === 'single'"
    :value="tree"
    selectionMode="single"
    v-model:selectionKeys="single"
    ><template #default="{ node }">{{ node.label }}</template></OrganizationChart
  >
  <OrganizationChart
    v-else-if="c === 'multiple'"
    :value="tree"
    selectionMode="multiple"
    v-model:selectionKeys="multiple"
    ><template #default="{ node }">{{ node.label }}</template></OrganizationChart
  >
  <OrganizationChart v-else-if="c === 'collapsible'" :value="tree" collapsible
    ><template #default="{ node }">{{ node.label }}</template></OrganizationChart
  >
</template>
<script setup lang="ts">
import OrganizationChart from "primevue/organizationchart";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const tree = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};
const single = ref({ "0_0": true });
const multiple = ref({ "0_0": true, "0_1": true });
</script>
