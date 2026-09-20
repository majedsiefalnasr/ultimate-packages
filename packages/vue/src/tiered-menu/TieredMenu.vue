<template>
  <div v-if="popup ? visible : true" :class="cx('root', { popup })">
    <UTieredMenuSub :items="model" :root="true" @item-select="handleItemSelect" />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `TieredMenu` component (see
// `.vendor-extracted/vue/tieredmenu/TieredMenu.vue`, `TieredMenuSub.vue`).
// Renders nested popup submenus via a recursive sub-component, either
// inline (`popup: false`, matching `UMenu`'s own inline mode) or as a
// toggleable popup (`popup: true`).
//
// Real PrimeVue's `TieredMenu` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component — it does NOT
// compose or wrap `Menu`. This adaptation follows that same independent
// shape. Real upstream wraps its root in `<Portal :appendTo :disabled=
// "!popup">` (verified this task's Step 1) — this adaptation deliberately
// does NOT use `Portal`/`Teleport` here, matching the binding choice
// already made by this same capability's Angular/React `UTieredMenu`
// siblings (a plain `v-if`-toggled wrapper, in-place, CSS-positioned via
// `.u-tieredmenu-overlay`) — cross-framework consistency for this
// capability takes precedence over an exact 1:1 port of upstream's own
// Portal usage, since neither of this task's other two realizations uses
// one either.
import { createBaseTieredMenu } from "./BaseTieredMenu";
import TieredMenuSub from "./TieredMenuSub.vue";

export default {
  name: "UTieredMenu",
  extends: createBaseTieredMenu(),
  inheritAttrs: false,
  emits: ["item-select", "show", "hide"],
  components: { UTieredMenuSub: TieredMenuSub },
  data() {
    return {
      visible: false,
    };
  },
  escapeListener: null,
  beforeUnmount() {
    this.unbindEscapeListener();
  },
  methods: {
    handleItemSelect(event) {
      this.$emit("item-select", event);
      if (this.popup) {
        this.hide();
      }
    },
    toggle() {
      this.visible ? this.hide() : this.show();
    },
    show() {
      if (this.visible) return;
      this.visible = true;
      this.$emit("show");
      if (this.popup) this.bindEscapeListener();
    },
    hide() {
      if (!this.visible) return;
      this.visible = false;
      this.$emit("hide");
      this.unbindEscapeListener();
    },
    bindEscapeListener() {
      if (this.escapeListener) return;
      this.escapeListener = (event) => {
        if (event.key === "Escape" && this.popup && this.visible) this.hide();
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
