<script>
import { createBasePickList } from "./BasePickList";
import Listbox from "../listbox/Listbox.vue";

export default {
  name: "UPickList",
  extends: createBasePickList(),
  components: { Listbox },
  data() {
    return {
      selected: [[], []],
      narrow: false,
      media: null,
      mediaListener: null,
      directions: ["up", "top", "down", "bottom"],
    };
  },
  computed: {
    lists() {
      return this.modelValue;
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
    label(item) {
      return String(this.dataKey && item != null ? item[this.dataKey] : item);
    },
    isSelected(side, item) {
      return this.selected[side].includes(this.identity(item));
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
      if (this.disabled || !this.selected[side].length) return;
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
      const pair = this.modelValue.map((items) => [...items]);
      pair[side] = result;
      this.$emit("update:modelValue", pair);
      this.focusListbox(side);
    },
    transfer(side, all) {
      if (this.disabled) return;
      const chosen = this.modelValue[side].filter((item) => all || this.isSelected(side, item));
      if (!chosen.length) return;
      const pair = this.modelValue.map((items) => [...items]);
      pair[side] = pair[side].filter((item) => !chosen.includes(item));
      pair[1 - side].push(...chosen);
      this.$emit("update:modelValue", pair);
      this.selected = [[], []];
      this.focusListbox(1 - side);
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
    listboxComponent(side) {
      const refs = Array.isArray(this.$refs.listboxes)
        ? this.$refs.listboxes
        : [this.$refs.listboxes];
      return refs[side] ?? null;
    },
    listboxElement(side) {
      return this.listboxComponent(side)?.$el?.querySelector('[role="listbox"]') ?? null;
    },
    syncListboxDom() {
      this.$nextTick(() => {
        for (const side of [0, 1]) {
          const listbox = this.listboxElement(side);
          if (!listbox) continue;
          listbox.tabIndex = this.disabled ? -1 : this.tabindex;
          if (this.ariaLabelledby) {
            listbox.setAttribute("aria-labelledby", this.ariaLabelledby);
            listbox.removeAttribute("aria-label");
          } else {
            listbox.removeAttribute("aria-labelledby");
            listbox.setAttribute(
              "aria-label",
              this.ariaLabel + (side === 0 ? " source" : " target")
            );
          }
          if (this.disabled) listbox.setAttribute("aria-disabled", "true");
          else listbox.removeAttribute("aria-disabled");
        }
      });
    },
    focusListbox(side, force = false) {
      if (!force && !this.autoOptionFocus) return;
      this.$nextTick(() => this.listboxElement(side)?.focus());
    },
    focusOption(event) {
      if (!this.autoOptionFocus || event.target.getAttribute("role") !== "listbox") return;
      const side = event.target.closest('[data-pc-section="targetlist"]') ? 1 : 0;
      if (this.listboxComponent(side)?.focusedIndex < 0) {
        event.target.dispatchEvent(
          new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true })
        );
      }
    },
    hoverOption(event) {
      if (!this.focusOnHover || !event.target.closest('[role="option"]')) return;
      const side = event.target.closest('[data-pc-section="targetlist"]') ? 1 : 0;
      this.focusListbox(side, true);
    },
  },
};
</script>

<template>
  <div
    :class="[cx('root'), { 'u-striped': striped }]"
    :style="{ gridTemplateColumns: responsive && narrow ? 'minmax(0, 1fr)' : undefined }"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @focusin="focusOption"
  >
    <template v-for="(items, side) in lists" :key="side">
      <section
        :data-pc-section="side === 0 ? 'sourcelist' : 'targetlist'"
        :class="side === 0 ? cx('sourceList') : cx('targetList')"
      >
        <div v-if="side === 0 ? showSourceControls : showTargetControls" :class="cx('controls')">
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
            ref="listboxes"
            :options="items"
            :model-value="selected[side]"
            :multiple="true"
            :option-label="label"
            :option-value="identity"
            :option-disabled="() => disabled"
            :disabled="disabled"
            :aria-label="ariaLabelledby ? null : ariaLabel + (side === 0 ? ' source' : ' target')"
            @focus="focusOption"
            @change="select(side, $event)"
          />
        </div>
      </section>
      <div v-if="side === 0" :class="cx('controls')" data-pc-section="transfercontrols">
        <button
          v-bind="{ ...buttonProps, ...moveToTargetButtonProps }"
          type="button"
          data-pc-section="movetotargetbutton"
          :disabled="disabled || !selected[0].length"
          @click="transfer(0, false)"
        >
          To Target
        </button>
        <button
          v-bind="{ ...buttonProps, ...moveAllToTargetButtonProps }"
          type="button"
          data-pc-section="movealltotargetbutton"
          :disabled="disabled || !modelValue[0].length"
          @click="transfer(0, true)"
        >
          All To Target
        </button>
        <button
          v-bind="{ ...buttonProps, ...moveToSourceButtonProps }"
          type="button"
          data-pc-section="movetosourcebutton"
          :disabled="disabled || !selected[1].length"
          @click="transfer(1, false)"
        >
          To Source
        </button>
        <button
          v-bind="{ ...buttonProps, ...moveAllToSourceButtonProps }"
          type="button"
          data-pc-section="movealltosourcebutton"
          :disabled="disabled || !modelValue[1].length"
          @click="transfer(1, true)"
        >
          All To Source
        </button>
      </div>
    </template>
  </div>
</template>
