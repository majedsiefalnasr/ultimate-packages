<template>
  <div
    :class="cx('root', { orientation })"
    role="meter"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="totalPercent"
  >
    <div :class="cx('meters')">
      <template v-for="(item, index) in value" :key="index">
        <span
          v-if="item.value > 0"
          :class="cx('meter')"
          :style="meterStyle(item)"
        ></span>
      </template>
    </div>
    <ol :class="cx('labelList', { orientation })">
      <li v-for="(item, index) in value" :key="index" :class="cx('label')">
        <i v-if="item.icon" :class="[cx('labelIcon'), item.icon]" :style="{ color: item.color }"></i>
        <span v-else :class="cx('labelMarker')" :style="{ backgroundColor: item.color }"></span>
        <span :class="cx('labelText')">{{ item.label }} ({{ percentValue(item.value) }})</span>
      </li>
    </ol>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `MeterGroup` component (see
// .vendor-extracted/vue/metergroup/MeterGroup.vue). Confirmed against real
// source: extends the bare `BaseComponent` tier (no v-model/writeValue) —
// a display component rendering a segmented bar of weighted `value` items
// within a `min`/`max` range, plus an optional legend list. Real source's
// `value` shape (`{ label, color, value, icon }[]`) is reused verbatim.
//
// Deliberately excludes real source's separate `MeterGroupLabel` component
// (folded into this single file, matching the "reduce a decomposed family
// to one component" precedent already established by `UAccordion`), its
// per-slot template-override system, and `labelPosition: 'start'` (only
// `'end'`, the default, is implemented) — same "smaller surface than
// upstream" precedent as every sibling component.
import { createBaseMeterGroup } from "./BaseMeterGroup";

export default {
  name: "UMeterGroup",
  extends: createBaseMeterGroup(),
  inheritAttrs: false,
  computed: {
    totalPercent() {
      const sum = (this.value || []).reduce((total, item) => total + (item.value || 0), 0);
      return this.percent(sum);
    },
  },
  methods: {
    percent(meter = 0) {
      if (this.max === this.min) return 100;
      const percentOfItem = ((meter - this.min) / (this.max - this.min)) * 100;
      return Math.round(Math.max(0, Math.min(100, percentOfItem)));
    },
    percentValue(meter) {
      return `${this.percent(meter)}%`;
    },
    meterStyle(item) {
      return {
        background: item.color,
        width: this.orientation === "horizontal" ? this.percentValue(item.value) : undefined,
        height: this.orientation === "vertical" ? this.percentValue(item.value) : undefined,
      };
    },
  },
};
</script>
