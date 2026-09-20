<template>
  <div :class="cx('root', { layout, align })">
    <div v-for="(event, index) of value" :key="index" :class="cx('event')">
      <div :class="cx('eventOpposite')">
        <slot name="opposite" :item="event"></slot>
      </div>
      <div :class="cx('eventSeparator')">
        <slot name="marker" :item="event">
          <div :class="cx('eventMarker')"></div>
        </slot>
        <div v-if="index !== value.length - 1" :class="cx('eventConnector')"></div>
      </div>
      <div :class="cx('eventContent')">
        <slot name="content" :item="event"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Timeline` component (see
// .vendor-extracted/vue/timeline/Timeline.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a display component visualizing a series of
// chained events, never a form control.
//
// This port keeps real source's `value`/`align`/`layout` surface and its
// three content slots (opposite/marker/content), realized here as scoped
// slots receiving `{ item: event }` — matching real PrimeVue's own
// `#opposite="slotProps"`/`#marker="slotProps"`/`#content="slotProps"`
// scoped-slot shape exactly (Option B: same mechanism, Ultimate-owned
// prop name `item` instead of upstream's `$implicit`-equivalent context).
import { createBaseTimeline } from "./BaseTimeline";

export default {
  name: "UTimeline",
  extends: createBaseTimeline(),
  inheritAttrs: false,
};
</script>
