<template>
  <div :class="cx('root')">
    <svg
      viewBox="0 0 100 100"
      role="slider"
      :width="size"
      :height="size"
      :tabindex="readonly || disabled ? -1 : 0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="currentValue"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      @click="onClick"
      @mousedown="onMouseDown"
      @keydown="onKeyDown"
    >
      <path :d="rangePath" :stroke-width="strokeWidth" :stroke="rangeColor" :class="cx('range')"></path>
      <path :d="valuePath" :stroke-width="strokeWidth" :stroke="valueColor" :class="cx('value')"></path>
      <text v-if="showValue" :x="50" :y="57" text-anchor="middle" :fill="textColor" :class="cx('text')">{{ valueToDisplay }}</text>
    </svg>
  </div>
</template>

<script>
import { createBaseKnob } from "./BaseKnob";

const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;
const MIN_RADIANS = (4 * Math.PI) / 3;
const MAX_RADIANS = -Math.PI / 3;

// Real PrimeVue Knob (.vendor-extracted/vue/knob/Knob.vue) renders a single
// inline SVG with two arc <path>s (range track + value arc) computed from
// trigonometry (Math.cos/Math.atan2) mapping a click/drag offset to an
// angle, then an angle to a value — NOT overlay-based, no panel/dropdown, no
// genuinely novel architectural pattern relative to the rest of this batch;
// only the amount of trigonometric math inside the component body differs.
export default {
  name: "UKnob",
  extends: createBaseKnob(),
  emits: ["change"],
  computed: {
    currentValue() {
      return typeof this.dValue === "number" ? this.dValue : this.min;
    },
    zeroRadians() {
      return this.mapRange(this.min > 0 && this.max > 0 ? this.min : 0, this.min, this.max, MIN_RADIANS, MAX_RADIANS);
    },
    valueRadians() {
      return this.mapRange(this.currentValue, this.min, this.max, MIN_RADIANS, MAX_RADIANS);
    },
    rangePath() {
      const minX = MID_X + Math.cos(MIN_RADIANS) * RADIUS;
      const minY = MID_Y - Math.sin(MIN_RADIANS) * RADIUS;
      const maxX = MID_X + Math.cos(MAX_RADIANS) * RADIUS;
      const maxY = MID_Y - Math.sin(MAX_RADIANS) * RADIUS;
      return `M ${minX} ${minY} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX} ${maxY}`;
    },
    valuePath() {
      const zeroX = MID_X + Math.cos(this.zeroRadians) * RADIUS;
      const zeroY = MID_Y - Math.sin(this.zeroRadians) * RADIUS;
      const valueX = MID_X + Math.cos(this.valueRadians) * RADIUS;
      const valueY = MID_Y - Math.sin(this.valueRadians) * RADIUS;
      const largeArc = Math.abs(this.zeroRadians - this.valueRadians) < Math.PI ? 0 : 1;
      const sweep = this.valueRadians > this.zeroRadians ? 0 : 1;
      return `M ${zeroX} ${zeroY} A ${RADIUS} ${RADIUS} 0 ${largeArc} ${sweep} ${valueX} ${valueY}`;
    },
    valueToDisplay() {
      return this.valueTemplate.replace("{value}", this.currentValue.toString());
    },
  },
  methods: {
    mapRange(x, inMin, inMax, outMin, outMax) {
      return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },
    updateModelValue(newValue) {
      const clamped = Math.min(Math.max(newValue, this.min), this.max);
      this.writeValue(clamped);
      this.$emit("change", clamped);
    },
    updateFromAngle(angle, start) {
      let mappedValue;
      if (angle > MAX_RADIANS) {
        mappedValue = this.mapRange(angle, MIN_RADIANS, MAX_RADIANS, this.min, this.max);
      } else if (angle < start) {
        mappedValue = this.mapRange(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, this.min, this.max);
      } else {
        return;
      }
      const stepped = Math.round((mappedValue - this.min) / this.step) * this.step + this.min;
      this.updateModelValue(stepped);
    },
    updateFromOffset(offsetX, offsetY) {
      const dx = offsetX - this.size / 2;
      const dy = this.size / 2 - offsetY;
      const angle = Math.atan2(dy, dx);
      const start = -Math.PI / 2 - Math.PI / 6;
      this.updateFromAngle(angle, start);
    },
    onClick(event) {
      if (this.disabled || this.readonly) return;
      this.updateFromOffset(event.offsetX, event.offsetY);
    },
    onMouseDown(event) {
      if (this.disabled || this.readonly) return;
      const svg = this.$el.querySelector("svg");
      const move = (moveEvent) => {
        const rect = svg.getBoundingClientRect();
        this.updateFromOffset(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top);
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
      event.preventDefault();
    },
    onKeyDown(event) {
      if (this.disabled || this.readonly) return;
      switch (event.code) {
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          this.updateModelValue(this.currentValue + this.step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          this.updateModelValue(this.currentValue - this.step);
          break;
        case "Home":
          event.preventDefault();
          this.updateModelValue(this.min);
          break;
        case "End":
          event.preventDefault();
          this.updateModelValue(this.max);
          break;
        case "PageUp":
          event.preventDefault();
          this.updateModelValue(this.currentValue + 10);
          break;
        case "PageDown":
          event.preventDefault();
          this.updateModelValue(this.currentValue - 10);
          break;
        default:
          break;
      }
    },
  },
};
</script>
