<script>
import { createBaseOrderList } from "./BaseOrderList";
import Listbox from "../listbox/Listbox.vue";

export default {
  name: "UOrderList",
  extends: createBaseOrderList(),
  components: { Listbox },
  data() {
    return {
      selected: [[]],
      narrow: false,
      media: null,
      mediaListener: null,
      directions: ["up", "top", "down", "bottom"],
    };
  },
  computed: {
    lists() {
      return [this.modelValue];
    },
  },
  watch: {
    breakpoint() {
      this.bindMedia();
    },
    responsive() {
      this.bindMedia();
    },
  },
  mounted() {
    this.bindMedia();
    this.syncListboxDom();
  },
  updated() {
    this.syncListboxDom();
  },
  beforeUnmount() {
    this.media?.removeEventListener("change", this.mediaListener);
  },
  methods: {
    bindMedia() {
      this.media?.removeEventListener("change", this.mediaListener);
      this.narrow = false;
      if (!this.responsive || typeof window === "undefined" || !window.matchMedia) return;
      this.media = window.matchMedia("(max-width: " + this.breakpoint + ")");
      this.mediaListener = (event) => {
        this.narrow = event.matches;
      };
      this.narrow = this.media.matches;
      this.media.addEventListener("change", this.mediaListener);
    },
    identity(item) {
      return this.dataKey && item != null ? item[this.dataKey] : item;
    },
    optionValue(item) {
      return this.identity(item);
    },
    isGloballyDisabled() {
      return this.disabled;
    },
    listboxAriaLabel() {
      return this.ariaLabel ? this.ariaLabel + " source" : null;
    },
    label(item) {
      return String(this.dataKey && item != null ? item[this.dataKey] : item);
    },
    isSelected(side, item) {
      return this.selected[side].includes(this.optionValue(item));
    },
    select(side, event) {
      if (this.disabled) return;
      const nextValue = Array.isArray(event.value) ? event.value : [];
      const next = this.selected.map((items) => [...items]);
      const current = next[side];
      const original = event.originalEvent;
      if (this.metaKeySelection && !original.ctrlKey && !original.metaKey) {
        const added = nextValue.find((value) => !current.includes(value));
        const removed = current.find((value) => !nextValue.includes(value));
        next[side] = added !== undefined ? [added] : removed !== undefined ? [removed] : current;
      } else {
        next[side] = nextValue;
      }
      this.selected = next;
    },
    move(side, direction) {
      if (this.disabled) return;
      const next = [...this.lists[side]];
      let result = next;
      if (direction === "top" || direction === "bottom") {
        const chosen = next.filter((item) => this.isSelected(side, item));
        const rest = next.filter((item) => !this.isSelected(side, item));
        result = direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen];
      } else {
        const delta = direction === "up" ? -1 : 1;
        const indexes = next.map((_, index) => index);
        if (delta === 1) indexes.reverse();
        for (const index of indexes) {
          const to = index + delta;
          if (
            to >= 0 &&
            to < next.length &&
            this.isSelected(side, next[index]) &&
            !this.isSelected(side, next[to])
          ) {
            [next[index], next[to]] = [next[to], next[index]];
          }
        }
      }
      this.$emit("update:modelValue", result);
      this.focusListbox();
    },
    propsFor(direction) {
      const names = {
        up: "moveUpButtonProps",
        top: "moveTopButtonProps",
        down: "moveDownButtonProps",
        bottom: "moveBottomButtonProps",
      };
      return { ...this.buttonProps, ...this[names[direction]] };
    },
    listboxComponent() {
      const refs = Array.isArray(this.$refs.listbox) ? this.$refs.listbox : [this.$refs.listbox];
      return refs[0] ?? null;
    },
    listboxElement() {
      return this.listboxComponent()?.$el?.querySelector('[role="listbox"]') ?? null;
    },
    syncListboxDom() {
      this.$nextTick(() => {
        const listbox = this.listboxElement();
        if (!listbox) return;
        listbox.tabIndex = this.disabled ? -1 : this.tabindex;
        if (this.ariaLabelledby) {
          listbox.setAttribute("aria-labelledby", this.ariaLabelledby);
          listbox.removeAttribute("aria-label");
        } else {
          listbox.removeAttribute("aria-labelledby");
          if (this.listboxAriaLabel()) listbox.setAttribute("aria-label", this.listboxAriaLabel());
          else listbox.removeAttribute("aria-label");
        }
        if (this.disabled) listbox.setAttribute("aria-disabled", "true");
        else listbox.removeAttribute("aria-disabled");
      });
    },
    focusListbox(force = false) {
      if (!force && !this.autoOptionFocus) return;
      this.$nextTick(() => this.listboxElement()?.focus());
    },
    focusOption(event) {
      if (
        this.autoOptionFocus &&
        event.target.getAttribute("role") === "listbox" &&
        this.listboxComponent()?.focusedIndex < 0
      ) {
        event.target.dispatchEvent(
          new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true })
        );
      }
    },
    hoverOption(event) {
      if (this.focusOnHover && event.target.closest('[role="option"]')) this.focusListbox(true);
    },
  },
};
</script>

<template>
  <div
    :class="[cx('root'), { 'u-striped': striped, 'u-order-list-narrow': responsive && narrow }]"
    :style="{ gridTemplateColumns: responsive && narrow ? 'minmax(0, 1fr)' : undefined }"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @focusin="focusOption"
  >
    <section
      v-for="(items, side) in lists"
      :key="side"
      :data-pc-section="side === 0 ? 'sourcelist' : 'targetlist'"
    >
      <div :class="cx('controls')">
        <button
          v-for="direction in directions"
          :key="direction"
          v-bind="propsFor(direction)"
          type="button"
          :data-pc-section="'move' + direction + 'button'"
          :disabled="disabled || !selected[side].length"
          @click="move(side, direction)"
        >
          Move {{ direction }}
        </button>
      </div>
      <div
        :class="cx('list')"
        :style="{ maxHeight: scrollHeight, overflow: 'auto' }"
        @mouseover="hoverOption"
      >
        <Listbox
          ref="listbox"
          :options="items"
          :model-value="selected[side]"
          :multiple="true"
          :option-label="label"
          :option-value="optionValue"
          :option-disabled="isGloballyDisabled"
          :disabled="disabled"
          :aria-label="ariaLabelledby ? null : listboxAriaLabel()"
          @focus="focusOption"
          @change="select(side, $event)"
        />
      </div>
    </section>
  </div>
</template>
