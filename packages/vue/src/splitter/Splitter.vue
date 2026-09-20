<template>
  <div :class="cx('root', { layout })">
    <template v-for="(panel, i) of panels" :key="i">
      <div :class="cx('panel')" :style="{ flexBasis: panelBasis(i) }" tabindex="-1">
        <slot :item="panel" :index="i"></slot>
      </div>
      <div
        v-if="i !== panels.length - 1"
        :class="cx('gutter')"
        @mousedown="onGutterMouseDown($event, i)"
        @touchstart="onGutterTouchStart($event, i)"
      >
        <div
          :class="cx('gutterHandle')"
          role="separator"
          tabindex="0"
          :style="gutterStyle"
          :aria-orientation="layout"
          :aria-valuenow="panelSizes[i]"
          @keyup="onGutterKeyUp"
          @keydown="onGutterKeyDown($event, i)"
        ></div>
      </div>
    </template>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Splitter`/`SplitterPanel`
// components (see .vendor-extracted/vue/splitter/Splitter.vue). Confirmed
// against real source (all 3 frameworks): extends the bare `BaseComponent`
// tier (no v-model/writeValue) — real source's drag-resize mechanism is a
// mousedown/mousemove/mouseup (and touchstart/touchmove/touchend) chain
// computing each panel's new flex-basis from the pointer's delta relative
// to the gutter's start position, clamped against each panel's own
// minSize, plus an ArrowLeft/ArrowRight/ArrowUp/ArrowDown keyboard-repeat
// path stepping by `step` on a 40ms interval while held. This port keeps
// that same real mechanism.
//
// Real source scans SplitterPanel slot children to build its panel list
// (a genuine multi-component family). This port instead takes an explicit
// `panels: {minSize}[]` prop array, with each panel's content supplied via
// a scoped default slot receiving `{ item, index }` — a config-driven
// panel list rather than a child-scanning tree, same
// "reduce a multi-component family to one component with a config
// surface" precedent as `createBaseSplitter`'s own doc comment states.
//
// Deliberately excludes real source's stateStorage/stateKey
// session/localStorage persistence and RTL-aware drag-direction flip —
// same "smaller surface than upstream" precedent as every sibling
// component; touch-drag listeners are wired for parity but genuine
// touch-event testing is out of this task's scope, also disclosed.
import { createBaseSplitter } from "./BaseSplitter";

export default {
  name: "USplitter",
  extends: createBaseSplitter(),
  inheritAttrs: false,
  data() {
    return {
      panelSizes: this.panels.map(() => 100 / Math.max(this.panels.length, 1)),
    };
  },
  dragSize: 0,
  dragStartPos: 0,
  prevPanelIndex: 0,
  prevPanelSize: 0,
  nextPanelSize: 0,
  mouseMoveListener: null,
  mouseUpListener: null,
  touchMoveListener: null,
  touchEndListener: null,
  repeatTimer: null,
  beforeUnmount() {
    this.unbindMouseListeners();
    this.unbindTouchListeners();
    this.clearRepeatTimer();
  },
  computed: {
    horizontal() {
      return this.layout === "horizontal";
    },
    gutterStyle() {
      return this.horizontal ? { width: `${this.gutterSize}px` } : { height: `${this.gutterSize}px` };
    },
  },
  methods: {
    panelBasis(index) {
      const size = this.panelSizes[index] ?? 100 / Math.max(this.panels.length, 1);
      const gutterCount = Math.max(this.panels.length - 1, 0);
      return `calc(${size}% - ${gutterCount * this.gutterSize}px)`;
    },
    minSizeOf(index) {
      return this.panels[index]?.minSize ?? 0;
    },
    pointFromEvent(event) {
      if (event.changedTouches) {
        const touch = event.changedTouches[0];
        return { pageX: touch.pageX, pageY: touch.pageY };
      }
      return { pageX: event.pageX, pageY: event.pageY };
    },
    resizeStart(event, index, isKeyDown) {
      this.dragSize = this.horizontal ? this.$el.offsetWidth : this.$el.offsetHeight;

      if (!isKeyDown) {
        const point = this.pointFromEvent(event);
        this.dragStartPos = this.horizontal ? point.pageX : point.pageY;
      }

      this.prevPanelIndex = index;
      this.prevPanelSize = this.panelSizes[index] ?? 0;
      this.nextPanelSize = this.panelSizes[index + 1] ?? 0;

      this.$emit("resizestart", { originalEvent: event, sizes: [...this.panelSizes] });
    },
    resize(event, step, isKeyDown) {
      let newPrevPanelSize;
      let newNextPanelSize;

      if (isKeyDown) {
        newPrevPanelSize = this.prevPanelSize + (step ?? 0);
        newNextPanelSize = this.nextPanelSize - (step ?? 0);
      } else {
        const point = this.pointFromEvent(event);
        const pos = this.horizontal ? point.pageX : point.pageY;
        const delta = ((pos - this.dragStartPos) * 100) / this.dragSize;
        newPrevPanelSize = this.prevPanelSize + delta;
        newNextPanelSize = this.nextPanelSize - delta;
      }

      const prevMin = this.minSizeOf(this.prevPanelIndex);
      const nextMin = this.minSizeOf(this.prevPanelIndex + 1);

      if (
        newPrevPanelSize < prevMin ||
        newNextPanelSize < nextMin ||
        newPrevPanelSize > 100 - nextMin ||
        newNextPanelSize > 100 - prevMin
      ) {
        newPrevPanelSize = Math.min(Math.max(prevMin, newPrevPanelSize), 100 - nextMin);
        newNextPanelSize = Math.min(Math.max(nextMin, newNextPanelSize), 100 - prevMin);
      }

      const next = [...this.panelSizes];
      next[this.prevPanelIndex] = newPrevPanelSize;
      next[this.prevPanelIndex + 1] = newNextPanelSize;
      this.panelSizes = next;
    },
    resizeEnd(event) {
      this.$emit("resizeend", { originalEvent: event, sizes: [...this.panelSizes] });
    },
    onGutterMouseDown(event, index) {
      this.resizeStart(event, index);
      this.bindMouseListeners();
    },
    onGutterTouchStart(event, index) {
      this.resizeStart(event, index);
      this.bindTouchListeners();
    },
    onGutterKeyUp() {
      this.clearRepeatTimer();
      this.resizeEnd(new Event("keyup"));
    },
    onGutterKeyDown(event, index) {
      const horizontal = this.horizontal;
      switch (event.code) {
        case "ArrowLeft":
          if (horizontal) this.setRepeatTimer(event, index, this.step * -1);
          event.preventDefault();
          break;
        case "ArrowRight":
          if (horizontal) this.setRepeatTimer(event, index, this.step);
          event.preventDefault();
          break;
        case "ArrowDown":
          if (!horizontal) this.setRepeatTimer(event, index, this.step * -1);
          event.preventDefault();
          break;
        case "ArrowUp":
          if (!horizontal) this.setRepeatTimer(event, index, this.step);
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    setRepeatTimer(event, index, step) {
      this.clearRepeatTimer();
      const repeat = () => {
        this.resizeStart(event, index, true);
        this.resize(event, step, true);
      };
      repeat();
      this.repeatTimer = setInterval(repeat, 40);
    },
    clearRepeatTimer() {
      if (this.repeatTimer) {
        clearInterval(this.repeatTimer);
        this.repeatTimer = null;
      }
    },
    bindMouseListeners() {
      if (!this.mouseMoveListener) {
        this.mouseMoveListener = (event) => this.resize(event);
        document.addEventListener("mousemove", this.mouseMoveListener);
      }
      if (!this.mouseUpListener) {
        this.mouseUpListener = (event) => {
          this.resizeEnd(event);
          this.unbindMouseListeners();
        };
        document.addEventListener("mouseup", this.mouseUpListener);
      }
    },
    bindTouchListeners() {
      if (!this.touchMoveListener) {
        this.touchMoveListener = (event) => this.resize(event);
        document.addEventListener("touchmove", this.touchMoveListener);
      }
      if (!this.touchEndListener) {
        this.touchEndListener = (event) => {
          this.resizeEnd(event);
          this.unbindTouchListeners();
        };
        document.addEventListener("touchend", this.touchEndListener);
      }
    },
    unbindMouseListeners() {
      if (this.mouseMoveListener) {
        document.removeEventListener("mousemove", this.mouseMoveListener);
        this.mouseMoveListener = null;
      }
      if (this.mouseUpListener) {
        document.removeEventListener("mouseup", this.mouseUpListener);
        this.mouseUpListener = null;
      }
    },
    unbindTouchListeners() {
      if (this.touchMoveListener) {
        document.removeEventListener("touchmove", this.touchMoveListener);
        this.touchMoveListener = null;
      }
      if (this.touchEndListener) {
        document.removeEventListener("touchend", this.touchEndListener);
        this.touchEndListener = null;
      }
    },
  },
};
</script>
