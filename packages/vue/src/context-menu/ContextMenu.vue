<template>
  <div v-if="!global" @contextmenu="onTriggerContextMenu">
    <slot />
  </div>
  <UPortal v-if="visible">
    <div ref="container" :class="cx('root')">
      <ul ref="list" :class="cx('rootList')" role="menu">
        <template v-for="(item, index) in model" :key="item.label + index">
          <li v-if="item.separator" :class="cx('separator')" role="separator" />
          <li
            v-else-if="item.visible !== false"
            :class="cx('item', { disabled: item.disabled, focused: focusedIndex === index })"
            role="menuitem"
            :data-u-disabled="!!item.disabled"
          >
            <div :class="cx('itemContent')">
              <a
                :href="item.url ?? '#'"
                :class="cx('itemLink')"
                :aria-disabled="item.disabled || null"
                tabindex="-1"
                @click="onItemClick($event, item)"
                @mouseenter="focusedIndex = index"
              >
                <span v-if="item.icon" :class="[item.icon, cx('itemIcon')]" />
                <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
              </a>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </UPortal>
</template>

<script>
import {
  Portal as UPortal,
  useZIndex,
  Z_INDEX_KEYS,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { createBaseContextMenu } from "./BaseContextMenu";

const { set: setZIndex, clear: clearZIndex } = useZIndex();

// Real activation mechanism verified against .vendor-extracted/vue/contextmenu/
// ContextMenu.vue: the browser's native `contextmenu` DOM event (right-click)
// — real source's `bindDocumentContextMenuListener` listens on `document`
// when `global` is set, this port's own trigger wrapper's `@contextmenu`
// listens on its own slot content otherwise, calling `show(event)` which
// reads `event.pageX`/`event.pageY` to position the menu and calls
// `event.preventDefault()` to suppress the browser's own native context menu.
//
// Renders a flat `model` list (no nested submenus) — matching UMenu's own
// established reduction of PrimeVue's real recursive ContextMenuSub
// structure; nested-submenu support belongs to UTieredMenu, not duplicated
// here. Dismissed on outside click, Escape, and window resize.
export default {
  name: "UContextMenu",
  extends: createBaseContextMenu(),
  emits: ["show", "hide", "item-select"],
  data() {
    return {
      visible: false,
      focusedIndex: -1,
    };
  },
  documentClickListener: null,
  documentContextMenuListener: null,
  windowResizeListener: null,
  created() {
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "menu",
      isVisible: () => this.visible,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.hide(),
      when: () => this.visible,
      priority: [ESCAPE_PRIORITIES.MENU, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
    if (this.global) {
      this.documentContextMenuListener = (event) => this.show(event);
      document.addEventListener("contextmenu", this.documentContextMenuListener);
    }
  },
  updated() {
    this.displayOrderMixin.updated.call(this);
    this.escapeMixin.updated.call(this);
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
    this.unbindDismissListeners();
    if (this.documentContextMenuListener) {
      document.removeEventListener("contextmenu", this.documentContextMenuListener);
    }
    if (this.$refs.container) clearZIndex(this.$refs.container);
  },
  methods: {
    onTriggerContextMenu(event) {
      if (!this.global) this.show(event);
    },
    show(event) {
      event.preventDefault();
      event.stopPropagation();
      this.focusedIndex = -1;
      this.visible = true;
      this.$emit("show");
      this.bindDismissListeners();
      const pageX = event.pageX;
      const pageY = event.pageY;
      this.$nextTick(() => this.position(pageX, pageY));
    },
    hide() {
      if (!this.visible) return;
      this.visible = false;
      this.unbindDismissListeners();
      this.$emit("hide");
    },
    position(pageX, pageY) {
      const container = this.$refs.container;
      if (!container) return;
      let left = pageX + 1;
      let top = pageY + 1;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (left + width > window.innerWidth) left -= width;
      if (top + height > window.innerHeight) top -= height;
      container.style.left = `${Math.max(0, left)}px`;
      container.style.top = `${Math.max(0, top)}px`;
      setZIndex(Z_INDEX_KEYS.menu, container);
    },
    onItemClick(event, item) {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      if (!item.url) event.preventDefault();
      if (item.command) item.command({ originalEvent: event, item });
      this.$emit("item-select", { originalEvent: event, item });
      this.hide();
    },
    bindDismissListeners() {
      if (!this.documentClickListener) {
        this.documentClickListener = (event) => {
          const container = this.$refs.container;
          if (container && !container.contains(event.target) && event.button !== 2) {
            this.hide();
          }
        };
        document.addEventListener("click", this.documentClickListener);
      }
      if (!this.windowResizeListener) {
        this.windowResizeListener = () => this.hide();
        window.addEventListener("resize", this.windowResizeListener);
      }
    },
    unbindDismissListeners() {
      if (this.documentClickListener) {
        document.removeEventListener("click", this.documentClickListener);
        this.documentClickListener = null;
      }
      if (this.windowResizeListener) {
        window.removeEventListener("resize", this.windowResizeListener);
        this.windowResizeListener = null;
      }
    },
  },
  components: { UPortal },
};
</script>
