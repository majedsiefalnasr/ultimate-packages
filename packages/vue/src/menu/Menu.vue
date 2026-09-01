<template>
  <UPortal :appendTo="appendTo" :disabled="!popup">
    <transition :css="false" name="u-menu" @enter="onEnter" @leave="onLeave" @after-leave="onAfterLeave">
      <div v-if="popup ? overlayVisible : true" ref="container" :class="cx('root')" @click="onOverlayClick">
        <ul
          ref="list"
          role="menu"
          :tabindex="tabindex"
          :aria-activedescendant="focused ? focusedOptionId : undefined"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :class="cx('list')"
          @focus="onListFocus"
          @blur="onListBlur"
          @keydown="onListKeyDown"
        >
          <template v-for="(item, i) in model" :key="(item.label || '') + i">
            <li v-if="!item.items && item.separator" :key="'sep' + i" role="separator" :class="cx('separator')" />
            <UMenuitem
              v-else-if="!item.items"
              :id="itemId(i)"
              :item="item"
              :focused-option-id="focusedOptionId"
              @item-click="itemClick"
              @item-mousemove="itemMouseMove"
            />
          </template>
        </ul>
      </div>
    </transition>
  </UPortal>
</template>

<script>
import {
  Portal as UPortal,
  useZIndex,
  Z_INDEX_KEYS,
  createMotionTransitionHooks,
} from "@ultimate/vue-core";
import { focus, isTouchDevice, absolutePosition, getOuterWidth } from "@ultimate/uix-utils/dom";
import Menuitem from "./Menuitem.vue";
import { createBaseMenu } from "./BaseMenu";

const { set: setZIndex, clear: clearZIndex } = useZIndex();
// Real upstream Menu.vue drives its overlay <transition> with plain CSS
// (`name="p-anchored-overlay"`, no `:css="false"`, no JS-side `done()`).
// This implementation uses the same JS-driven `createMotionTransitionHooks`
// (`:css="false"`) that UDialog (Task 20) already established for exactly
// this reason: real-environment finding made while running this task's own
// tests — Vue's native CSS-driven `<transition>` never resolves its
// leave-transition-end wait in jsdom (no real computed transition/animation
// duration to wait on), so `overlayVisible`/`v-if` toggling would never
// actually remove the rendered overlay in tests (hide()/outside-click/
// resize/scroll dismissal tests all failed against the plain-CSS-transition
// draft before this fix). `createMotion`'s own `whenEnd` already resolves
// immediately whenever an element has no real transition/animation
// duration (`getMotionMetadata` returns `type: undefined`), matching the
// same jsdom-safe short-circuit Dialog already relies on.
const motionHooks = createMotionTransitionHooks(() => ({ name: "u-menu" }));
let uidCounter = 0;

// Escape handling here is deliberately a LOCAL keydown handler on the <ul>,
// NOT the shared uix-utils/escape adapter — matching verified Menu.vue's real
// upstream mechanism exactly (spec §10's correction, §13). Menu's Escape only
// fires while this specific <ul> has focus; it does not need the global
// document-level stacking problem the shared adapter solves for Dialog.
// focusTrapDirective (Task 10) is likewise deliberately NOT used — real
// Menu.vue has no FocusTrap import at all (verified this task's Step 1);
// Tab closes a visible popup rather than being trapped inside it (see the
// Escape/Tab switch-case fall-through below).
export default {
  name: "UMenu",
  extends: createBaseMenu(),
  inheritAttrs: false,
  emits: ["show", "hide", "focus", "blur"],
  components: { UMenuitem: Menuitem, UPortal },
  data() {
    return {
      overlayVisible: false,
      focused: false,
      // Verified real upstream (Menu.vue) stores the active item's actual
      // rendered DOM `id` string in focusedOptionIndex (despite the name),
      // found via live `find(...)`/`findSingle(...)` DOM queries against
      // data-p-disabled markers. This implementation instead tracks a
      // position in `this.model` directly and derives the matching rendered
      // id via `itemId()` below, applied consistently to both the
      // `aria-activedescendant` value and each Menuitem's own `:id` — the
      // brief's own Step 7 draft diverged between the two (a raw model
      // index for aria-activedescendant vs. a `${_uid}_${i}` id on the
      // rendered `<li>`), which would have silently broken the
      // aria-activedescendant mechanism (the id never matches any element)
      // and this task's own Home/End/disabled-skip tests (`#${activeId}`
      // lookups). Fixed here to keep both derived from the same
      // `menuId`/model-index pair.
      focusedOptionIndex: -1,
      menuId: `u-menu-${++uidCounter}`,
    };
  },
  target: null,
  outsideClickListener: null,
  resizeListener: null,
  scrollListener: null,
  mounted() {
    if (!this.popup) {
      this.bindResizeListener();
      this.bindOutsideClickListener();
    }
  },
  beforeUnmount() {
    this.unbindResizeListener();
    this.unbindOutsideClickListener();
    this.unbindScrollListener();
    this.target = null;
    if (this.$refs.container && this.autoZIndex) clearZIndex(this.$refs.container);
  },
  computed: {
    focusedOptionId() {
      return this.focusedOptionIndex !== -1 ? this.itemId(this.focusedOptionIndex) : null;
    },
  },
  methods: {
    itemId(modelIndex) {
      return `${this.menuId}_${modelIndex}`;
    },
    itemClick(event) {
      if (this.overlayVisible) this.hide();
      if (!this.popup) this.focusedOptionIndex = this.model.indexOf(event.item);
    },
    itemMouseMove(event) {
      if (this.focused) this.focusedOptionIndex = this.model.indexOf(event.item);
    },
    onListFocus(event) {
      this.focused = true;
      if (!this.popup) this.changeFocusedOptionIndex(0);
      this.$emit("focus", event);
    },
    onListBlur(event) {
      this.focused = false;
      this.focusedOptionIndex = -1;
      this.$emit("blur", event);
    },
    // Verified fall-through preserved exactly (spec §10's confirmed real
    // upstream quirk, .vendor-extracted/vue/menu/Menu.vue's onListKeyDown):
    // the Escape case has no `break`, so it always falls into the Tab
    // case's `this.overlayVisible && this.hide()` immediately afterward.
    // Harmless by trace — Escape's own body already calls this.hide()
    // when popup, so the Tab case's hide() is a redundant no-op re-hide in
    // that path; when NOT popup, Escape's body is skipped entirely (the
    // `if (this.popup)` guard) and only the Tab case's overlayVisible-guarded
    // hide() runs, which is a no-op since overlayVisible is only ever true
    // in popup mode. No behavioral problem found beyond what the brief
    // already documented as harmless — not silently "fixed" with a break.
    onListKeyDown(event) {
      switch (event.code) {
        case "ArrowDown":
          this.onArrowDownKey(event);
          break;
        case "ArrowUp":
          this.onArrowUpKey(event);
          break;
        case "Home":
          this.onHomeKey(event);
          break;
        case "End":
          this.onEndKey(event);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(event);
          break;
        case "Space":
          this.onSpaceKey(event);
          break;
        case "Escape":
          if (this.popup) {
            focus(this.target);
            this.hide();
          }
        // eslint-disable-next-line no-fallthrough -- verified real upstream quirk, see comment above.
        case "Tab":
          if (this.overlayVisible) this.hide();
          break;
        default:
          break;
      }
    },
    onArrowDownKey(event) {
      this.changeFocusedOptionIndex(this.findNextOptionIndex(this.focusedOptionIndex));
      event.preventDefault();
    },
    onArrowUpKey(event) {
      if (event.altKey && this.popup) {
        focus(this.target);
        this.hide();
        event.preventDefault();
      } else {
        this.changeFocusedOptionIndex(this.findPrevOptionIndex(this.focusedOptionIndex));
        event.preventDefault();
      }
    },
    onHomeKey(event) {
      this.changeFocusedOptionIndex(0);
      event.preventDefault();
    },
    onEndKey(event) {
      const items = this.getEnabledItems();
      this.changeFocusedOptionIndex(items.length - 1);
      event.preventDefault();
    },
    onEnterKey(event) {
      const item = this.model[this.focusedOptionIndex];
      if (this.popup) focus(this.target);
      if (item && !item.disabled && item.command) item.command({ originalEvent: event, item });
      event.preventDefault();
    },
    onSpaceKey(event) {
      this.onEnterKey(event);
    },
    getEnabledItems() {
      return this.model.filter((item) => !item.separator && !item.disabled);
    },
    findNextOptionIndex(index) {
      const items = this.getEnabledItems();
      const currentPosition = items.indexOf(this.model[index]);
      const nextPosition = currentPosition > -1 ? currentPosition + 1 : 0;
      return Math.min(nextPosition, items.length - 1);
    },
    findPrevOptionIndex(index) {
      const items = this.getEnabledItems();
      const currentPosition = items.indexOf(this.model[index]);
      const prevPosition = currentPosition > -1 ? currentPosition - 1 : 0;
      return Math.max(prevPosition, 0);
    },
    changeFocusedOptionIndex(position) {
      const items = this.getEnabledItems();
      if (items.length === 0) {
        this.focusedOptionIndex = -1;
        return;
      }
      const clamped = position >= items.length ? items.length - 1 : position < 0 ? 0 : position;
      this.focusedOptionIndex = this.model.indexOf(items[clamped]);
    },
    toggle(event, target) {
      if (this.overlayVisible) this.hide();
      else this.show(event, target);
    },
    show(event, target) {
      this.overlayVisible = true;
      this.target = target ?? event?.currentTarget;
    },
    hide() {
      this.overlayVisible = false;
      this.target = null;
    },
    onEnter(el, done) {
      this.alignOverlay();
      this.bindOutsideClickListener();
      this.bindResizeListener();
      this.bindScrollListener();
      if (this.autoZIndex) setZIndex(Z_INDEX_KEYS.menu, this.$refs.container, this.baseZIndex);
      if (this.popup) focus(this.$refs.list);
      this.$emit("show");
      motionHooks.onEnter(el, done);
    },
    onLeave(el, done) {
      this.unbindOutsideClickListener();
      this.unbindResizeListener();
      this.unbindScrollListener();
      this.$emit("hide");
      motionHooks.onLeave(el, done);
    },
    onAfterLeave() {
      if (this.autoZIndex) clearZIndex(this.$refs.container);
    },
    alignOverlay() {
      if (!this.popup || !this.$refs.container || !this.target) return;
      absolutePosition(this.$refs.container, this.target);
      const targetWidth = getOuterWidth(this.target);
      if (targetWidth > getOuterWidth(this.$refs.container)) {
        this.$refs.container.style.minWidth = targetWidth + "px";
      }
    },
    onOverlayClick() {},
    bindOutsideClickListener() {
      if (this.outsideClickListener) return;
      this.outsideClickListener = (event) => {
        const isOutsideContainer = this.$refs.container && !this.$refs.container.contains(event.target);
        const isOutsideTarget = !(
          this.target &&
          (this.target === event.target || this.target.contains?.(event.target))
        );
        if (this.overlayVisible && isOutsideContainer && isOutsideTarget) this.hide();
        else if (!this.popup && isOutsideContainer && isOutsideTarget) this.focusedOptionIndex = -1;
      };
      document.addEventListener("click", this.outsideClickListener, true);
    },
    unbindOutsideClickListener() {
      if (!this.outsideClickListener) return;
      document.removeEventListener("click", this.outsideClickListener, true);
      this.outsideClickListener = null;
    },
    bindResizeListener() {
      if (this.resizeListener) return;
      this.resizeListener = () => {
        if (this.overlayVisible && !isTouchDevice()) this.hide();
      };
      window.addEventListener("resize", this.resizeListener);
    },
    unbindResizeListener() {
      if (!this.resizeListener) return;
      window.removeEventListener("resize", this.resizeListener);
      this.resizeListener = null;
    },
    // Verified real upstream (.vendor-extracted/vue/menu/Menu.vue) binds a
    // ConnectedOverlayScrollHandler on this.target's scrollable ancestors
    // (found via getScrollableParents) in onEnter, and dismisses the popup
    // when any of them scrolls — omitted from the brief's own Step 7 draft
    // and explicitly flagged there as a gap to close before this task is
    // complete. Closed here as a Menu-local bindScrollListener/
    // unbindScrollListener pair matching the exact shape the brief's note
    // specifies: a single `window`-level listener in the capture phase
    // (so it observes scroll events from any scrollable ancestor even
    // though native `scroll` events don't bubble), checking whether the
    // event's target is an ancestor of `this.target` (or `this.target`
    // itself) before calling hide() — same bind/unbind-pair shape as
    // bindResizeListener/bindOutsideClickListener immediately above,
    // guarded against double-binding the same way, and cleaned up in both
    // onLeave (popup close) and beforeUnmount (component teardown).
    bindScrollListener() {
      if (this.scrollListener) return;
      this.scrollListener = (event) => {
        if (!this.overlayVisible || !this.target) return;
        const scrollTarget = event.target;
        const isAncestorOfTarget =
          scrollTarget &&
          typeof scrollTarget.contains === "function" &&
          (scrollTarget === this.target || scrollTarget.contains(this.target));
        if (isAncestorOfTarget) this.hide();
      };
      window.addEventListener("scroll", this.scrollListener, true);
    },
    unbindScrollListener() {
      if (!this.scrollListener) return;
      window.removeEventListener("scroll", this.scrollListener, true);
      this.scrollListener = null;
    },
  },
};
</script>
