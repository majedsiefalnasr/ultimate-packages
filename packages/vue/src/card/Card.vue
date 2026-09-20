<template>
  <div :class="cx('root')">
    <div v-if="$slots.header" :class="cx('header')">
      <slot name="header" />
    </div>
    <div :class="cx('body')">
      <div v-if="$slots.title || $slots.subtitle" :class="cx('caption')">
        <div v-if="$slots.title" :class="cx('title')">
          <slot name="title" />
        </div>
        <div v-if="$slots.subtitle" :class="cx('subtitle')">
          <slot name="subtitle" />
        </div>
      </div>
      <div :class="cx('content')">
        <slot name="content" />
      </div>
      <div v-if="$slots.footer" :class="cx('footer')">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Card` component (see
// .vendor-extracted/vue/card/Card.vue). A flexible content-slot layout
// container: an optional `header` slot, a `title`/`subtitle` slot pair
// (rendered only when at least one is provided, matching real source's own
// `v-if` guard), a `content` slot, and an optional `footer` slot — matches
// real source's own template shape and slot names exactly (Vue's real
// Card, unlike Angular's/React's, already exposes header/title/subtitle/
// content/footer purely as slots, no string props).
import { createBaseCard } from "./BaseCard";

export default {
  name: "UCard",
  extends: createBaseCard(),
  inheritAttrs: false,
};
</script>
