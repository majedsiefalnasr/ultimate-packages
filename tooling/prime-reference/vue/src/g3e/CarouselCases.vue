<template>
  <Carousel v-if="c === 'basic'" :value="items" :numVisible="3" :numScroll="1">
    <template #item="{ data }"
      ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
        {{ data }}
      </div></template
    >
  </Carousel>
  <Carousel
    v-else-if="c === 'circular'"
    :value="items"
    :numVisible="1"
    circular
    :autoplayInterval="3000"
  >
    <template #item="{ data }"
      ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
        {{ data }}
      </div></template
    >
  </Carousel>
  <Carousel
    v-else-if="c === 'vertical'"
    :value="items"
    :numVisible="1"
    :numScroll="1"
    orientation="vertical"
  >
    <template #item="{ data }"
      ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
        {{ data }}
      </div></template
    >
  </Carousel>
  <div v-else-if="c === 'rtl'" dir="rtl">
    <Carousel :value="items" :numVisible="3" :numScroll="1">
      <template #item="{ data }"
        ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
          {{ data }}
        </div></template
      >
    </Carousel>
  </div>
</template>
<script setup lang="ts">
import Carousel from "primevue/carousel";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
</script>
