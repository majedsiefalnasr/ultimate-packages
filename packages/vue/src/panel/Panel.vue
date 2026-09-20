<template>
  <div :class="cx('root')" :id="instanceId">
    <div v-if="showHeader" :class="cx('header', { toggleable })">
      <span v-if="header" :class="cx('title')" :id="headerId">{{ header }}</span>
      <slot name="header"></slot>
      <div :class="cx('headerActions')">
        <UButton
          v-if="toggleable"
          severity="secondary"
          text
          rounded
          type="button"
          :aria-controls="contentId"
          :aria-expanded="!d_collapsed"
          :icon="d_collapsed ? 'pi pi-plus' : 'pi pi-minus'"
          @click="toggle"
        />
      </div>
    </div>
    <div
      v-if="!toggleable || !d_collapsed"
      :class="cx('contentContainer')"
      role="region"
      :id="contentId"
      :aria-labelledby="headerId"
    >
      <div :class="cx('content')">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" :class="cx('footer')">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Panel` component (see
// .vendor-extracted/vue/panel/Panel.vue). Confirmed against real source:
// extends the bare `BaseComponent` tier (no v-model/writeValue) — a
// container with header/content/footer regions and an optional
// content-toggle feature, composing `UButton` for its toggle affordance
// (matching this batch's own `UButton` composition precedent from
// `USplitButton`), and following `UFieldset`'s own `d_collapsed`
// internal-state pattern exactly.
//
// Deliberately excludes real source's `icons`/custom header/footer
// template-override system and its `<transition name="p-collapsible">`
// collapse animation — same "smaller surface than upstream" precedent as
// every sibling component.
import { UButton } from "../button";
import { createBasePanel } from "./BasePanel";

let uid = 0;

export default {
  name: "UPanel",
  extends: createBasePanel(),
  inheritAttrs: false,
  components: { UButton },
  emits: ["update:collapsed", "before-toggle", "after-toggle"],
  data() {
    return {
      d_collapsed: this.collapsed,
      instanceId: `u_panel_${++uid}`,
    };
  },
  computed: {
    headerId() {
      return `${this.instanceId}_header`;
    },
    contentId() {
      return `${this.instanceId}_content`;
    },
  },
  watch: {
    collapsed(newValue) {
      this.d_collapsed = newValue;
    },
  },
  methods: {
    toggle(event) {
      this.$emit("before-toggle", { originalEvent: event, collapsed: this.d_collapsed });
      this.d_collapsed = !this.d_collapsed;
      this.$emit("update:collapsed", this.d_collapsed);
      this.$emit("after-toggle", { originalEvent: event, collapsed: this.d_collapsed });
    },
  },
};
</script>
