<template>
  <div v-if="c === 'sized'" style="width: 20rem; display: flex">
    <ImageCompare>
      <template #left><img src="/media/landscape-1.png" alt="before" /></template>
      <template #right><img src="/media/landscape-2.png" alt="after" /></template>
    </ImageCompare>
  </div>
  <div v-else-if="c === 'rtl'" dir="rtl" style="width: 20rem; display: flex">
    <ImageCompare>
      <template #left><img src="/media/landscape-1.png" alt="before" /></template>
      <template #right><img src="/media/landscape-2.png" alt="after" /></template>
    </ImageCompare>
  </div>
  <ImageCompare v-else-if="c === 'root-style'" style="width: 20rem">
    <template #left><img src="/media/landscape-1.png" alt="before" /></template>
    <template #right><img src="/media/landscape-2.png" alt="after" /></template>
  </ImageCompare>
</template>

<script setup lang="ts">
import ImageCompare from "primevue/imagecompare";

const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
</script>
