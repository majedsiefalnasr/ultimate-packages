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
      <ul ref="listEl" :class="cx('list')" role="menu" :style="listDirectionStyle" @keydown="onKeydown">
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
    /**
     * Roving focus among action items once open (Spec §5.5, GAP-056), bound
     * on the `<ul role="menu">` itself — never on the toggle button —
     * matching the ancestor-binding requirement established while fixing
     * GAP-054/GAP-055. Axis follows `direction`: ArrowRight/ArrowLeft move
     * focus for a left/right-opening dial; ArrowDown/ArrowUp for every other
     * direction (`up`, `down`, and the diagonal `type: "quarter-circle"`
     * directions, which all lay items out along the vertical axis per
     * `listDirectionStyle()`/the CSS default). Disabled and `visible: false`
     * items are skipped — Vue SpeedDial keeps a `[role=menuitem]` button in
     * the DOM for every model entry even when hidden (CSS `hidden` class,
     * never omitted, matching Angular/React's own confirmed shape), so the
     * eligible list is filtered rather than relying on a
     * `renderedItems()`-style DOM-omission remap (that pattern is for
     * PanelMenu's own different, DOM-omission shape). Uses `event.code`,
     * distinct from this component's pre-existing `event.key`-based Escape
     * check in `bindEscapeListener`, which is NOT modified by this handler.
     */
    onKeydown(event) {
      if (!this.d_visible) return;

      const target = event.target;
      const links = this.getItemLinks();
      const index = links.indexOf(target);
      if (index === -1) return;

      const horizontal = this.direction === "left" || this.direction === "right";
      const nextCode = horizontal ? "ArrowRight" : "ArrowDown";
      const prevCode = horizontal ? "ArrowLeft" : "ArrowUp";

      if (event.code === nextCode) {
        event.preventDefault();
        this.moveFocus(index, 1);
      } else if (event.code === prevCode) {
        event.preventDefault();
        this.moveFocus(index, -1);
      }
    },
    /** This dial's own action-item buttons, in DOM order (one per model entry, including hidden ones). */
    getItemLinks() {
      const list = this.$refs.listEl;
      return list ? Array.from(list.querySelectorAll(":scope > li > button")) : [];
    },
    /** Whether the model entry at `index` is eligible to receive roving focus (not disabled, not hidden). */
    isEligible(index) {
      const item = this.model[index];
      return !!item && !item.disabled && item.visible !== false;
    },
    moveFocus(fromIndex, direction) {
      const links = this.getItemLinks();
      const length = links.length;
      if (length === 0) return;

      let nextIndex = fromIndex;
      for (let step = 0; step < length; step++) {
        nextIndex = (nextIndex + direction + length) % length;
        if (this.isEligible(nextIndex)) {
          links[nextIndex]?.focus();
          return;
        }
      }
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
