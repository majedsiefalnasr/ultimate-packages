<template>
  <!-- GAP-082 invalid usage: every marker must be consumed by a real type error. -->
  <!-- @vue-expect-error label is a string prop -->
  <UButton :label="123" />
  <!-- @vue-expect-error loading is a boolean prop -->
  <UButton :loading="'yes'" />
  <!-- @vue-expect-error rows is a number prop -->
  <UTable :value="[]" :rows="'ten'" />
  <!-- @vue-expect-error size is a string prop -->
  <UInputText :size="3" />
  <!-- @vue-expect-error variant is a string prop -->
  <UInputText :variant="1" />
  <!-- @vue-expect-error fluid is a boolean prop -->
  <UInputText :fluid="'yes'" />
  <!-- @vue-expect-error UTable value (factory array prop) is an array -->
  <UTable :value="'not-an-array'" />
  <!-- @vue-expect-error UScroller items (factory array prop) is an array -->
  <UScroller :items="{ a: 1 }" />
  <!-- @vue-expect-error UTieredMenuSub items (SFC-local array prop) is an array -->
  <UTieredMenuSub :items="'not-an-array'" />
  <!-- @vue-expect-error UTable selection (union with Array) is an object or array -->
  <UTable :value="[]" :selection="5" />
  <!-- @vue-expect-error UAccordion value (union with Array) is a string, number or array -->
  <UAccordion :value="{ a: 1 }" />
  <!-- @vue-expect-error UPickList.ariaLabelledby is non-nullable (research §7 row 150) -->
  <UPickList :ariaLabelledby="null" />
</template>

<script setup lang="ts">
import { h } from "vue";
import { UAccordion } from "@ultimate/vue/accordion";
import { UButton } from "@ultimate/vue/button";
import { UInputText } from "@ultimate/vue/input-text";
import { UPickList } from "@ultimate/vue/pick-list";
import { UScroller } from "@ultimate/vue/scroller";
import { UTable } from "@ultimate/vue/table";
import { UTieredMenuSub } from "@ultimate/vue/tiered-menu";

// @ts-expect-error label is a string prop (render-function consumer)
export const rendered = h(UButton, { label: 123 });
</script>
