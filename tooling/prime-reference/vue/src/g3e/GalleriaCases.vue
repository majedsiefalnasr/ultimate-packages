<template>
  <div v-if="c === 'item-thumbnails'" style="max-width: 40rem">
    <Galleria :value="images" :showItemNavigators="true">
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
      <template #thumbnail="{ item }"
        ><img :src="item" style="width: 5rem; display: block"
      /></template>
    </Galleria>
  </div>
  <div v-else-if="c === 'no-thumbnails'" style="max-width: 40rem">
    <Galleria :value="images" :showItemNavigators="true" :showThumbnails="false">
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
    </Galleria>
  </div>
  <div v-else-if="c === 'fullscreen'">
    <button type="button" @click="visible = true">Show</button>
    <Galleria
      v-model:visible="visible"
      :value="images"
      :fullScreen="true"
      :showItemNavigators="true"
    >
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
      <template #thumbnail="{ item }"
        ><img :src="item" style="width: 5rem; display: block"
      /></template>
    </Galleria>
  </div>
</template>
<script setup lang="ts">
import Galleria from "primevue/galleria";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const images = ["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"];
const visible = ref(false);
</script>
