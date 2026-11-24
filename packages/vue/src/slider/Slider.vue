<template>
  <div
    :class="cx('root', { orientation, disabled, invalid })"
    v-bind="ptmi('root')"
    @click="onBarClick"
  >
    <template v-if="!range">
      <span :class="cx('range')" :style="singleRangeStyle" v-bind="ptm('range')"></span>
      <span
        :class="cx('handle')"
        :style="singleHandleStyle"
        role="slider"
        :tabindex="handleTabindex"
        :aria-valuemin="min"
        :aria-valuenow="singleValue"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        v-bind="ptm('handle')"
        @mousedown="onMouseDown($event)"
        @touchstart.passive="onTouchStart($event)"
        @keydown="onKeyDown($event)"
      ></span>
    </template>
    <template v-else>
      <span :class="cx('range')" :style="rangeStyle" v-bind="ptm('range')"></span>
      <span
        :class="cx('handle')"
        :style="startHandleStyle"
        role="slider"
        :tabindex="handleTabindex"
        :aria-valuemin="min"
        :aria-valuenow="rangeValue[0]"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        v-bind="ptm('startHandler')"
        @mousedown="onMouseDown($event, 0)"
        @touchstart.passive="onTouchStart($event, 0)"
        @keydown="onKeyDown($event, 0)"
      ></span>
      <span
        :class="cx('handle')"
        :style="endHandleStyle"
        role="slider"
        :tabindex="handleTabindex"
        :aria-valuemin="min"
        :aria-valuenow="rangeValue[1]"
        :aria-valuemax="max"
        :aria-orientation="orientation"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        v-bind="ptm('endHandler')"
        @mousedown="onMouseDown($event, 1)"
        @touchstart.passive="onTouchStart($event, 1)"
        @keydown="onKeyDown($event, 1)"
      ></span>
    </template>
  </div>
</template>

<script>
import { createBaseSlider } from "./BaseSlider";

function toPercent(value, min, max) {
  if (max <= min || value < min) return 0;
  if (value > max) return 100;
  return ((value - min) * 100) / (max - min);
}

// PrimeVue's step rule: move from the current value toward the pointer in
// whole steps, so a non-zero min keeps its own grid.
function snapToStep(raw, oldValue, step) {
  if (!step) return Math.floor(raw);
  const diff = raw - oldValue;
  if (diff < 0) return oldValue + Math.ceil(raw / step - oldValue / step) * step;
  if (diff > 0) return oldValue + Math.floor(raw / step - oldValue / step) * step;
  return raw;
}

function pointFromEvent(event, touchId) {
  if ("changedTouches" in event) {
    const touches = Array.from(event.changedTouches);
    const touch =
      touchId === undefined ? touches[0] : touches.find((item) => item.identifier === touchId);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}

// Real PrimeVue Slider (.vendor-extracted/vue/slider/Slider.vue) renders a
// track with one drag handle (or two in range mode) — NOT overlay-based, no
// panel/dropdown.
//
// Supports both single-value (range false, default) and two-handle range
// mode (range true — modelValue is a [start, end] tuple). Pointer input is
// mouse and touch; both bind document listeners that are removed when the
// drag ends or the component unmounts. A horizontal slider is mirrored when
// the element is right-to-left, and the handle and range are placed with
// `inset-inline-start`. `pt`, `unstyled` and `dt` come from the base chain;
// `inheritAttrs` is off because `ptmi('root')` places the attributes on the
// root. `aria-label` and `aria-labelledby` go to the handles.
export default {
  name: "USlider",
  extends: createBaseSlider(),
  inheritAttrs: false,
  emits: ["change", "slideend"],
  data() {
    return {
      handleIndex: 0,
      barRect: { left: 0, top: 0, width: 0, height: 0 },
      rtl: false,
    };
  },
  created() {
    this.stopDrag = null;
    this.suppressClick = false;
  },
  beforeUnmount() {
    if (this.stopDrag) this.stopDrag();
  },
  computed: {
    singleValue() {
      return typeof this.dValue === "number" ? this.dValue : this.min;
    },
    rangeValue() {
      return Array.isArray(this.dValue) ? this.dValue : [this.min, this.max];
    },
    horizontal() {
      return this.orientation === "horizontal";
    },
    handleTabindex() {
      return this.disabled ? undefined : this.tabindex;
    },
    handlePercent() {
      return toPercent(this.singleValue, this.min, this.max);
    },
    startPercent() {
      return toPercent(this.rangeValue[0], this.min, this.max);
    },
    endPercent() {
      return toPercent(this.rangeValue[1], this.min, this.max);
    },
    rangeStart() {
      return Math.min(this.startPercent, this.endPercent);
    },
    rangeWidth() {
      return Math.abs(this.endPercent - this.startPercent);
    },
    singleRangeStyle() {
      return this.horizontal
        ? { width: `${this.handlePercent}%` }
        : { height: `${this.handlePercent}%` };
    },
    singleHandleStyle() {
      return this.horizontal
        ? { insetInlineStart: `${this.handlePercent}%` }
        : { bottom: `${this.handlePercent}%` };
    },
    rangeStyle() {
      return this.horizontal
        ? { insetInlineStart: `${this.rangeStart}%`, width: `${this.rangeWidth}%` }
        : { bottom: `${this.rangeStart}%`, height: `${this.rangeWidth}%` };
    },
    startHandleStyle() {
      return this.horizontal
        ? { insetInlineStart: `${this.startPercent}%` }
        : { bottom: `${this.startPercent}%` };
    },
    endHandleStyle() {
      return this.horizontal
        ? { insetInlineStart: `${this.endPercent}%` }
        : { bottom: `${this.endPercent}%` };
    },
  },
  methods: {
    updateValue(raw, event) {
      const clamped = Math.min(Math.max(parseFloat(raw.toFixed(10)), this.min), this.max);
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
    updateBarRect() {
      const rect = this.$el.getBoundingClientRect();
      this.barRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      this.rtl = getComputedStyle(this.$el).direction === "rtl";
    },
    percentFromPoint(point) {
      const rect = this.barRect;
      if (this.horizontal) {
        if (rect.width <= 0) return null;
        return this.rtl
          ? ((rect.left + rect.width - point.x) * 100) / rect.width
          : ((point.x - rect.left) * 100) / rect.width;
      }
      if (rect.height <= 0) return null;
      return ((rect.top + rect.height - point.y) * 100) / rect.height;
    },
    setValueFromPoint(point, event) {
      const percent = this.percentFromPoint(point);
      if (percent === null) return;
      const oldValue = this.range ? this.rangeValue[this.handleIndex] : this.singleValue;
      const raw = (this.max - this.min) * (percent / 100) + this.min;
      this.updateValue(snapToStep(raw, oldValue, this.step), event);
    },
    emitSlideEnd(event) {
      this.$emit("slideend", {
        originalEvent: event,
        value: this.range ? this.rangeValue : this.singleValue,
      });
    },
    beginDrag(event, index, touch) {
      if (this.disabled) return;
      if (this.stopDrag) this.stopDrag();
      this.updateBarRect();
      this.handleIndex = this.range && this.rangeValue[0] === this.max ? 0 : (index ?? 0);
      this.suppressClick = true;
      event.currentTarget.focus();

      const touchId = touch ? event.changedTouches[0]?.identifier : undefined;
      if (!touch) event.preventDefault();

      const move = (moveEvent) => {
        const point = pointFromEvent(moveEvent, touchId);
        if (!point) return;
        if (moveEvent.cancelable) moveEvent.preventDefault();
        this.setValueFromPoint(point, moveEvent);
      };
      const stop = () => {
        this.stopDrag = null;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", end);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", end);
        document.removeEventListener("touchcancel", end);
        window.setTimeout(() => {
          this.suppressClick = false;
        }, 0);
      };
      const end = (endEvent) => {
        stop();
        if (touch && endEvent.cancelable) endEvent.preventDefault();
        this.emitSlideEnd(endEvent);
      };

      if (touch) {
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("touchend", end);
        document.addEventListener("touchcancel", end);
      } else {
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", end);
      }
      this.stopDrag = stop;
    },
    onMouseDown(event, index) {
      this.beginDrag(event, index, false);
    },
    onTouchStart(event, index) {
      this.beginDrag(event, index, true);
    },
    onBarClick(event) {
      if (this.disabled) return;
      if (this.suppressClick) {
        this.suppressClick = false;
        return;
      }
      if (event.target.getAttribute("role") === "slider") return;
      this.updateBarRect();
      const point = { x: event.clientX, y: event.clientY };
      if (this.range) {
        const percent = this.percentFromPoint(point);
        if (percent === null) return;
        this.handleIndex =
          Math.abs(percent - this.startPercent) <= Math.abs(percent - this.endPercent) ? 0 : 1;
      } else {
        this.handleIndex = 0;
      }
      this.setValueFromPoint(point, event);
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
          break;
        case "ArrowUp":
        case "ArrowRight":
          this.updateValue(current + stepAmount, event);
          break;
        case "PageDown":
          this.updateValue(current - stepAmount * 10, event);
          break;
        case "PageUp":
          this.updateValue(current + stepAmount * 10, event);
          break;
        case "Home":
          this.updateValue(this.min, event);
          break;
        case "End":
          this.updateValue(this.max, event);
          break;
        default:
          return;
      }
      event.preventDefault();
    },
  },
};
</script>
