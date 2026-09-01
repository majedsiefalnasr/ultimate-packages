<template>
  <li
    v-if="visible"
    :id="id"
    role="menuitem"
    data-u-menuitem
    :data-u-disabled="disabled || false"
    :class="cx('item', { focused: isFocused, disabled })"
    :aria-label="item.label"
    :aria-disabled="disabled"
  >
    <div :class="cx('itemContent')" @click="onClick" @mousemove="onMouseMove">
      <a v-ripple :href="item.url" :class="cx('itemLink')" tabindex="-1">
        <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
        <span :class="cx('itemLabel')">{{ item.label }}</span>
      </a>
    </div>
  </li>
</template>

<script>
// Real upstream Menuitem.vue (.vendor-extracted/vue/menu/Menuitem.vue,
// verified this task's Step 1) renders: role="menuitem", aria-label,
// aria-disabled, plus data-p-focused/data-p-disabled/data-p markers — the
// passthrough-system-coupled selector attributes this project's "Option B"
// posture (spec §7) excludes. Ultimate's own data-u-menuitem/data-u-disabled
// convention (spec §10's selector-strategy deviation) stands in their place.
// A real inner <div class="cx('itemContent')"> wrapper (not present in the
// brief's Step 6 draft, which put onClick directly on the <a>) is restored
// here to match real upstream's actual DOM shape — item-content is the real
// click/mousemove target, not the <li> itself, and it is real upstream's
// hover/focus styling hook (`.u-menu-item-content:hover` in menu-style.ts).
import { rippleDirective } from "../ripple";
import { createBaseComponent } from "@ultimate/vue-core";
import { menuStyleModule } from "./menu-style";

export default {
  name: "UMenuitem",
  extends: createBaseComponent({ componentName: "menuitem", styleModule: menuStyleModule }),
  directives: { ripple: rippleDirective },
  emits: ["item-click", "item-mousemove"],
  props: {
    item: { type: Object, required: true },
    id: { type: String, required: true },
    focusedOptionId: { type: [String, Number], default: null },
  },
  computed: {
    visible() {
      return typeof this.item.visible === "function" ? this.item.visible() : this.item.visible !== false;
    },
    disabled() {
      return typeof this.item.disabled === "function" ? this.item.disabled() : !!this.item.disabled;
    },
    isFocused() {
      return this.focusedOptionId === this.id;
    },
  },
  methods: {
    onClick(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      if (this.item.command) this.item.command({ originalEvent: event, item: this.item });
      this.$emit("item-click", { originalEvent: event, item: this.item, id: this.id });
    },
    onMouseMove(event) {
      this.$emit("item-mousemove", { originalEvent: event, item: this.item, id: this.id });
    },
  },
};
</script>
