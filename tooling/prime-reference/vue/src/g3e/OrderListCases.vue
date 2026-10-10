<template>
  <OrderList v-if="c === 'basic'" v-model="items"
    ><template #option="{ option }">{{ option }}</template></OrderList
  >
</template>
<script setup lang="ts">
import OrderList from "primevue/orderlist";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const items = ref(["Apple", "Banana", "Cherry", "Date"]);
</script>
