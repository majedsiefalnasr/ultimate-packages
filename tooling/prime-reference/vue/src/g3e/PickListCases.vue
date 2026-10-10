<template>
  <PickList v-if="c === 'basic'" v-model="lists"
    ><template #option="{ option }">{{ option }}</template></PickList
  >
</template>
<script setup lang="ts">
import PickList from "primevue/picklist";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const lists = ref([["Apple", "Banana"], ["Cherry"]]);
</script>
