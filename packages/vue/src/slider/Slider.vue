<template>
  <div :class="cx('root', { orientation, disabled })" @click="onBarClick">
    <template v-if="!range">
      <span :class="cx('range')" :style="singleRangeStyle"></span>
      <span
        :class="cx('handle')"
        :style="singleHandleStyle"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuenow="singleValue"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        @mousedown="onMouseDown($event)"
        @keydown="onKeyDown($event)"
      ></span>
    </template>
    <template v-else>
      <span :class="cx('range')" :style="rangeStyle"></span>
      <span
        :class="cx('handle')"
        :style="startHandleStyle"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuenow="rangeValue[0]"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        @mousedown="onMouseDown($event, 0)"
        @keydown="onKeyDown($event, 0)"
      ></span>
      <span
        :class="cx('handle')"
        :style="endHandleStyle"
        role="slider"
        tabindex="0"
        :aria-valuemin="min"
        :aria-valuenow="rangeValue[1]"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        @mousedown="onMouseDown($event, 1)"
        @keydown="onKeyDown($event, 1)"
      ></span>
    </template>
  </div>
</template>

<script>
import { createBaseSlider } from "./BaseSlider";

// Real PrimeVue Slider (.vendor-extracted/vue/slider/Slider.vue) renders a
// track with one drag handle (or two in range mode) — NOT overlay-based, no
// panel/dropdown.
//
// Supports both single-value (range false, default) and two-handle range
// mode (range true — modelValue is a [start, end] tuple), matching real
// source's own range branch throughout setValue/updateModel.
export default {
  name: "USlider",
  extends: createBaseSlider(),
  emits: ["change", "slideend"],
  data() {
    // Base tier's own data() (createBaseEditableHolder) initializes dValue
    // independently of this child's own data() — same corrected pattern
    // documented in Select.vue's own data(). handleIndex/barRect/dragging
    // are all independent local interaction state, not derived from dValue,
    // so no derivation pitfall applies here, but this comment documents the
    // same known pitfall was checked.
    return {
      handleIndex: 0,
      barRect: { left: 0, top: 0, width: 0, height: 0 },
      dragging: false,
    };
  },
  computed: {
    singleValue() {
      return typeof this.dValue === "number" ? this.dValue : this.min;
    },
    rangeValue() {
      return Array.isArray(this.dValue) ? this.dValue : [this.min, this.max];
    },
    handlePercent() {
      return this.toPercent(this.singleValue);
    },
    startPercent() {
      return this.toPercent(this.rangeValue[0]);
    },
    endPercent() {
      return this.toPercent(this.rangeValue[1]);
    },
    rangeStart() {
      return Math.min(this.startPercent, this.endPercent);
    },
    rangeWidth() {
      return Math.abs(this.endPercent - this.startPercent);
    },
    singleRangeStyle() {
      return this.orientation === "horizontal"
        ? { width: `${this.handlePercent}%` }
        : { height: `${this.handlePercent}%` };
    },
    singleHandleStyle() {
      return this.orientation === "horizontal"
        ? { left: `${this.handlePercent}%` }
        : { bottom: `${this.handlePercent}%` };
    },
    rangeStyle() {
      return this.orientation === "horizontal"
        ? { left: `${this.rangeStart}%`, width: `${this.rangeWidth}%` }
        : { bottom: `${this.rangeStart}%`, height: `${this.rangeWidth}%` };
    },
    startHandleStyle() {
      return this.orientation === "horizontal"
        ? { left: `${this.startPercent}%` }
        : { bottom: `${this.startPercent}%` };
    },
    endHandleStyle() {
      return this.orientation === "horizontal"
        ? { left: `${this.endPercent}%` }
        : { bottom: `${this.endPercent}%` };
    },
  },
  methods: {
    toPercent(value) {
      if (value < this.min) return 0;
      if (value > this.max) return 100;
      return ((value - this.min) * 100) / (this.max - this.min);
    },
    applyStep(raw) {
      if (!this.step) return Math.floor(raw);
      const decimalsCount = Math.floor(this.step) !== this.step ? (this.step.toString().split(".")[1]?.length ?? 0) : 0;
      const stepped = Math.round(raw / this.step) * this.step;
      return decimalsCount > 0 ? +stepped.toFixed(decimalsCount) : stepped;
    },
    updateValue(raw, event) {
      const clamped = Math.min(Math.max(raw, this.min), this.max);
      if (this.range) {
        const values = [...this.rangeValue];
        values[this.handleIndex] = clamped;
        this.writeValue(values, event);
        this.$emit("change", { originalEvent: event, value: values });
      } else {
        this.writeValue(clamped, event);
        this.$emit("change", { originalEvent: event, value: clamped });
      }
    },
    calculatePercent(clientX, clientY) {
      if (this.orientation === "horizontal") {
        return ((clientX - this.barRect.left) * 100) / this.barRect.width;
      }
      return ((this.barRect.top + this.barRect.height - clientY) * 100) / this.barRect.height;
    },
    setValueFromPointer(clientX, clientY, event) {
      const percent = this.calculatePercent(clientX, clientY);
      const raw = (this.max - this.min) * (percent / 100) + this.min;
      this.updateValue(this.applyStep(raw), event);
    },
    emitSlideEnd(event) {
      this.$emit("slideend", { originalEvent: event, value: this.range ? this.rangeValue : this.singleValue });
    },
    updateBarRect() {
      const rect = this.$el.getBoundingClientRect();
      this.barRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    },
    onMouseDown(event, index) {
      if (this.disabled) return;
      this.handleIndex = index ?? 0;
      this.dragging = true;
      this.updateBarRect();
      event.target.focus();
      event.preventDefault();

      const move = (moveEvent) => {
        if (!this.dragging) return;
        this.setValueFromPointer(moveEvent.clientX, moveEvent.clientY, moveEvent);
      };
      const up = (upEvent) => {
        if (!this.dragging) return;
        this.dragging = false;
        this.emitSlideEnd(upEvent);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
    nearestHandleIndex(clientX, clientY) {
      const percent = this.calculatePercent(clientX, clientY);
      return Math.abs(percent - this.startPercent) <= Math.abs(percent - this.endPercent) ? 0 : 1;
    },
    onBarClick(event) {
      if (this.disabled || this.dragging) return;
      if (event.target.getAttribute("role") === "slider") return;
      this.updateBarRect();
      this.handleIndex = this.range ? this.nearestHandleIndex(event.clientX, event.clientY) : 0;
      this.setValueFromPointer(event.clientX, event.clientY, event);
      this.emitSlideEnd(event);
    },
    onKeyDown(event, index) {
      if (this.disabled) return;
      this.handleIndex = index ?? 0;
      const current = this.range ? this.rangeValue[this.handleIndex] : this.singleValue;
      const stepAmount = this.step || 1;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowLeft":
          this.updateValue(current - stepAmount, event);
          event.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowRight":
          this.updateValue(current + stepAmount, event);
          event.preventDefault();
          break;
        case "PageDown":
          this.updateValue(current - stepAmount * 10, event);
          event.preventDefault();
          break;
        case "PageUp":
          this.updateValue(current + stepAmount * 10, event);
          event.preventDefault();
          break;
        case "Home":
          this.updateValue(this.min, event);
          event.preventDefault();
          break;
        case "End":
          this.updateValue(this.max, event);
          event.preventDefault();
          break;
        default:
          break;
      }
    },
  },
};
</script>
