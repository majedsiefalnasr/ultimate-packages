<template>
  <div>
    <div :class="cx('root', { direction })">
      <button
        type="button"
        :class="cx('pcButton', { open: d_visible })"
        :disabled="disabled"
        :aria-expanded="d_visible"
        aria-haspopup="true"
        :aria-label="ariaLabel"
        @click="onButtonClick"
      >
        <span v-if="icon" :class="icon"></span>
      </button>
      <ul :class="cx('list')" role="menu" :style="listDirectionStyle">
        <template v-for="(item, index) in model" :key="(item.label || '') + index">
          <li :class="cx('item', { hidden: item.visible === false })" role="none" :style="getItemStyle(index)">
            <button
              type="button"
              :class="cx('pcAction')"
              role="menuitem"
              :disabled="item.disabled"
              :aria-label="item.label"
              :tabindex="item.disabled || !d_visible ? -1 : 0"
              @click="onItemClick($event, item)"
            >
              <span v-if="item.icon" :class="[cx('actionIcon'), item.icon]"></span>
            </button>
          </li>
        </template>
      </ul>
    </div>
    <div v-if="mask && d_visible" :class="cx('mask')" @click="hide"></div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `SpeedDial` component (see
// `.vendor-extracted/vue/speeddial/SpeedDial.vue`). A floating action
// button that expands into a list of secondary action items.
//
// Real PrimeVue's `SpeedDial` (`extends BaseComponent`, composes only
// `Button`, no import of `primevue/menu` or `primevue/tieredmenu`) is a
// standalone, independent component driven by a flat `model` array.
// Expand/collapse is a single boolean `visible`/`d_visible` flag; the
// fan-out is pure CSS-transition + inline per-item `transitionDelay`/
// positioning — no external animation library — well within this
// project's existing `data()` + computed-inline-style pattern, already
// established by this same capability's `UTieredMenu` sibling. This
// adaptation follows that same independent shape and mechanism (see this
// same capability's Angular `speed-dial.ts` sibling's doc comment for the
// full cross-framework confirmation).
//
// `d_visible` is derived directly from `this.visible` (the prop),
// matching this task's own "derive independently from props" pattern.
import { createBaseSpeedDial } from "./BaseSpeedDial";

export default {
  name: "USpeedDial",
  extends: createBaseSpeedDial(),
  inheritAttrs: false,
  emits: ["update:visible", "click", "show", "hide"],
  data() {
    return {
      d_visible: this.visible,
    };
  },
  computed: {
    listDirectionStyle() {
      const dir = this.direction;
      const flexDirection =
        dir === "up" ? "column-reverse" : dir === "down" ? "column" : dir === "left" ? "row-reverse" : dir === "right" ? "row" : undefined;
      return flexDirection ? { flexDirection } : {};
    },
  },
  watch: {
    visible(newValue) {
      this.d_visible = newValue;
    },
  },
  beforeUnmount() {
    this.unbindEscapeListener();
  },
  methods: {
    getItemStyle(index) {
      const length = this.model.length;
      const delay = (this.d_visible ? index : length - index - 1) * this.transitionDelay;
      return { transitionDelay: `${delay}ms`, ...this.calculatePointStyle(index) };
    },
    calculatePointStyle(index) {
      const type = this.type;
      if (type === "linear") return {};

      const length = this.model.length;
      const radius = this.radius || length * 20;

      if (type === "circle") {
        const step = (2 * Math.PI) / length;
        return { left: `${radius * Math.cos(step * index)}px`, top: `${radius * Math.sin(step * index)}px` };
      }

      const direction = this.direction;
      if (type === "semi-circle") {
        const step = Math.PI / (length - 1);
        const x = `${radius * Math.cos(step * index)}px`;
        const y = `${radius * Math.sin(step * index)}px`;
        if (direction === "up") return { left: x, bottom: y };
        if (direction === "down") return { left: x, top: y };
        if (direction === "left") return { right: y, top: x };
        if (direction === "right") return { left: y, top: x };
      }

      if (type === "quarter-circle") {
        const step = Math.PI / (2 * (length - 1));
        const x = `${radius * Math.cos(step * index)}px`;
        const y = `${radius * Math.sin(step * index)}px`;
        if (direction === "up-left") return { right: x, bottom: y };
        if (direction === "up-right") return { left: x, bottom: y };
        if (direction === "down-left") return { right: y, top: x };
        if (direction === "down-right") return { left: y, top: x };
      }

      return {};
    },
    onButtonClick(event) {
      this.d_visible ? this.hide() : this.show();
      this.$emit("click", event);
    },
    onItemClick(event, item) {
      if (item.command) item.command({ originalEvent: event, item });
      this.hide();
    },
    show() {
      if (this.d_visible) return;
      this.d_visible = true;
      this.$emit("update:visible", true);
      this.$emit("show");
      if (this.closeOnEscape) this.bindEscapeListener();
    },
    hide() {
      if (!this.d_visible) return;
      this.d_visible = false;
      this.$emit("update:visible", false);
      this.$emit("hide");
      this.unbindEscapeListener();
    },
    bindEscapeListener() {
      if (this.escapeListener) return;
      this.escapeListener = (event) => {
        if (event.key === "Escape" && this.d_visible) this.hide();
      };
      document.addEventListener("keydown", this.escapeListener);
    },
    unbindEscapeListener() {
      if (!this.escapeListener) return;
      document.removeEventListener("keydown", this.escapeListener);
      this.escapeListener = null;
    },
  },
};
</script>
