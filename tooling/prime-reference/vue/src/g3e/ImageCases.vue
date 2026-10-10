<template>
  <Image v-if="c === 'default'" src="/media/landscape-1.png" alt="Image" width="200" />
  <Image v-else-if="c === 'preview'" src="/media/landscape-1.png" alt="Image" width="200" preview />
</template>

<script setup lang="ts">
import Image from "primevue/image";

const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
</script>
