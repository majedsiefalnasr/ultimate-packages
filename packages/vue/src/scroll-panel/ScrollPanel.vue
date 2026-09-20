<template>
  <div :class="cx('root')">
    <div :class="cx('contentContainer')">
      <div ref="content" :class="cx('content')" @mouseenter="moveBar" @scroll="onScroll">
        <slot></slot>
      </div>
    </div>
    <div
      ref="xBar"
      :class="cx('barX')"
      tabindex="0"
      role="scrollbar"
      aria-orientation="horizontal"
      :aria-valuenow="lastScrollLeft"
      :aria-controls="contentId"
      @mousedown="onXBarMouseDown"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @focus="onFocus"
      @blur="onBlur"
    ></div>
    <div
      ref="yBar"
      :class="cx('barY')"
      tabindex="0"
      role="scrollbar"
      aria-orientation="vertical"
      :aria-valuenow="lastScrollTop"
      :aria-controls="contentId"
      @mousedown="onYBarMouseDown"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @focus="onFocus"
      @blur="onBlur"
    ></div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ScrollPanel` component (see
// .vendor-extracted/vue/scrollpanel/ScrollPanel.vue). Confirmed against
// real source (all 3 frameworks): extends the bare `BaseComponent` tier
// (no v-model/writeValue) — a cross-browser custom scrollbar. Real
// source's own mechanism is faithfully ported: the native content `<div>`
// scrolls normally (with its native scrollbar hidden via CSS), while two
// absolutely-positioned "thumb" bars (`barX`/`barY`) mirror the native
// scroll position/ratio, sized proportionally and repositioned on every
// `scroll`/`resize`/`mouseenter` event via `requestAnimationFrame`. Both
// thumbs support drag-to-scroll and keyboard stepping (arrow keys while a
// thumb has focus, matching real source's own `step` prop and
// repeat-on-hold timer).
//
// All scroll/resize/drag tracking here uses plain instance fields (`this.*`,
// not `data()`) for values that don't need to trigger re-renders
// (scrollXRatio/scrollYRatio/isXBarClicked/etc.) — only `lastScrollLeft`/
// `lastScrollTop` (rendered via `aria-valuenow`) are reactive `data()`
// state. No object-identity-keyed Set/Map is used anywhere (the known
// reactive-Proxy-identity pitfall does not apply here).
//
// Deliberately excludes real source's `#content` slot override, touch-drag
// support (mouse events only, matching this session's disclosed "cut
// touch-drag if out of scope" allowance for ScrollPanel), and RTL
// inset-mirroring nuance beyond plain `inset-inline-*` CSS logical
// properties — same "smaller surface than upstream" precedent as every
// sibling component.
import { createBaseScrollPanel } from "./BaseScrollPanel";

let uid = 0;

export default {
  name: "UScrollPanel",
  extends: createBaseScrollPanel(),
  inheritAttrs: false,
  data() {
    return {
      lastScrollLeft: 0,
      lastScrollTop: 0,
      orientation: "vertical",
      contentId: `u_scroll_panel_${++uid}_content`,
    };
  },
  mounted() {
    this.scrollXRatio = 0;
    this.scrollYRatio = 0;
    this.isXBarClicked = false;
    this.isYBarClicked = false;
    this.lastPageX = 0;
    this.lastPageY = 0;

    this.moveBar();
    this.calculateContainerHeight();

    this.onWindowResize = () => this.moveBar();
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    this.unbindDocumentMouseListeners();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.clearTimer();
  },
  methods: {
    calculateContainerHeight() {
      const container = this.$el;
      const content = this.$refs.content;
      const xBar = this.$refs.xBar;
      if (!container || !content || !xBar) return;
      const containerStyles = window.getComputedStyle(container);
      const xBarStyles = window.getComputedStyle(xBar);
      const pureContainerHeight = container.offsetHeight - parseInt(xBarStyles.height, 10);

      if (containerStyles.maxHeight !== "none" && pureContainerHeight === 0) {
        if (
          content.offsetHeight + parseInt(xBarStyles.height, 10) >
          parseInt(containerStyles.maxHeight, 10)
        ) {
          container.style.height = containerStyles.maxHeight;
        } else {
          container.style.height =
            content.offsetHeight +
            parseFloat(containerStyles.paddingTop) +
            parseFloat(containerStyles.paddingBottom) +
            parseFloat(containerStyles.borderTopWidth) +
            parseFloat(containerStyles.borderBottomWidth) +
            "px";
        }
      }
    },
    moveBar() {
      const container = this.$el;
      const content = this.$refs.content;
      const xBar = this.$refs.xBar;
      const yBar = this.$refs.yBar;
      if (!container || !content || !xBar || !yBar) return;

      const totalWidth = content.scrollWidth;
      const ownWidth = content.clientWidth;
      const bottom = (container.clientHeight - xBar.clientHeight) * -1;
      this.scrollXRatio = ownWidth / totalWidth;

      const totalHeight = content.scrollHeight;
      const ownHeight = content.clientHeight;
      const right = (container.clientWidth - yBar.clientWidth) * -1;
      this.scrollYRatio = ownHeight / totalHeight;

      this.frame = requestAnimationFrame(() => {
        if (this.scrollXRatio >= 1) {
          xBar.classList.add("u-scroll-panel-bar-hidden");
        } else {
          xBar.classList.remove("u-scroll-panel-bar-hidden");
          const xBarWidth = Math.max(this.scrollXRatio * 100, 10);
          const xBarLeft = Math.abs(
            (content.scrollLeft * (100 - xBarWidth)) / (totalWidth - ownWidth || 1)
          );
          xBar.style.cssText = `width:${xBarWidth}%; inset-inline-start:${xBarLeft}%; bottom:${bottom}px;`;
        }

        if (this.scrollYRatio >= 1) {
          yBar.classList.add("u-scroll-panel-bar-hidden");
        } else {
          yBar.classList.remove("u-scroll-panel-bar-hidden");
          const yBarHeight = Math.max(this.scrollYRatio * 100, 10);
          const yBarTop = (content.scrollTop * (100 - yBarHeight)) / (totalHeight - ownHeight || 1);
          yBar.style.cssText = `height:${yBarHeight}%; top: calc(${yBarTop}% - ${xBar.clientHeight}px); inset-inline-end:${right}px;`;
        }
      });
    },
    onScroll(event) {
      const target = event.target;
      if (this.lastScrollLeft !== target.scrollLeft) {
        this.lastScrollLeft = target.scrollLeft;
        this.orientation = "horizontal";
      } else if (this.lastScrollTop !== target.scrollTop) {
        this.lastScrollTop = target.scrollTop;
        this.orientation = "vertical";
      }
      this.moveBar();
    },
    onKeyDown(event) {
      if (this.orientation === "vertical") {
        switch (event.code) {
          case "ArrowDown":
            this.setTimer("scrollTop", this.step);
            event.preventDefault();
            break;
          case "ArrowUp":
            this.setTimer("scrollTop", this.step * -1);
            event.preventDefault();
            break;
          case "ArrowLeft":
          case "ArrowRight":
            event.preventDefault();
            break;
        }
      } else {
        switch (event.code) {
          case "ArrowRight":
            this.setTimer("scrollLeft", this.step);
            event.preventDefault();
            break;
          case "ArrowLeft":
            this.setTimer("scrollLeft", this.step * -1);
            event.preventDefault();
            break;
          case "ArrowDown":
          case "ArrowUp":
            event.preventDefault();
            break;
        }
      }
    },
    onKeyUp() {
      this.clearTimer();
    },
    repeat(bar, step) {
      if (this.$refs.content) this.$refs.content[bar] += step;
      this.moveBar();
    },
    setTimer(bar, step) {
      this.clearTimer();
      this.timer = setTimeout(() => this.repeat(bar, step), 40);
    },
    clearTimer() {
      if (this.timer) clearTimeout(this.timer);
    },
    bindDocumentMouseListeners() {
      if (!this.documentMouseMoveListener) {
        this.documentMouseMoveListener = (e) => this.onDocumentMouseMove(e);
        document.addEventListener("mousemove", this.documentMouseMoveListener);
      }
      if (!this.documentMouseUpListener) {
        this.documentMouseUpListener = (e) => this.onDocumentMouseUp(e);
        document.addEventListener("mouseup", this.documentMouseUpListener);
      }
    },
    unbindDocumentMouseListeners() {
      if (this.documentMouseMoveListener) {
        document.removeEventListener("mousemove", this.documentMouseMoveListener);
        this.documentMouseMoveListener = null;
      }
      if (this.documentMouseUpListener) {
        document.removeEventListener("mouseup", this.documentMouseUpListener);
        this.documentMouseUpListener = null;
      }
    },
    onYBarMouseDown(event) {
      this.isYBarClicked = true;
      this.$refs.yBar?.focus();
      this.lastPageY = event.pageY;
      this.$refs.yBar?.classList.add("u-scroll-panel-bar-grabbed");
      document.body.classList.add("u-scroll-panel-bar-grabbed");
      this.bindDocumentMouseListeners();
      event.preventDefault();
    },
    onXBarMouseDown(event) {
      this.isXBarClicked = true;
      this.$refs.xBar?.focus();
      this.lastPageX = event.pageX;
      this.$refs.xBar?.classList.add("u-scroll-panel-bar-grabbed");
      document.body.classList.add("u-scroll-panel-bar-grabbed");
      this.bindDocumentMouseListeners();
      event.preventDefault();
    },
    onDocumentMouseMove(event) {
      if (this.isXBarClicked) {
        this.onMouseMoveForXBar(event);
      } else if (this.isYBarClicked) {
        this.onMouseMoveForYBar(event);
      }
    },
    onMouseMoveForXBar(event) {
      const deltaX = event.pageX - this.lastPageX;
      this.lastPageX = event.pageX;
      this.frame = requestAnimationFrame(() => {
        if (this.$refs.content) this.$refs.content.scrollLeft += deltaX / (this.scrollXRatio || 1);
      });
    },
    onMouseMoveForYBar(event) {
      const deltaY = event.pageY - this.lastPageY;
      this.lastPageY = event.pageY;
      this.frame = requestAnimationFrame(() => {
        if (this.$refs.content) this.$refs.content.scrollTop += deltaY / (this.scrollYRatio || 1);
      });
    },
    onFocus(event) {
      if (this.$refs.xBar?.isSameNode(event.target)) this.orientation = "horizontal";
      else if (this.$refs.yBar?.isSameNode(event.target)) this.orientation = "vertical";
    },
    onBlur() {
      if (this.orientation === "horizontal") this.orientation = "vertical";
    },
    onDocumentMouseUp() {
      this.$refs.yBar?.classList.remove("u-scroll-panel-bar-grabbed");
      this.$refs.xBar?.classList.remove("u-scroll-panel-bar-grabbed");
      document.body.classList.remove("u-scroll-panel-bar-grabbed");
      this.unbindDocumentMouseListeners();
      this.isXBarClicked = false;
      this.isYBarClicked = false;
    },
    /** Scrolls the content to the given top offset, clamped within range. */
    scrollTop(value) {
      const content = this.$refs.content;
      if (!content) return;
      const scrollableHeight = content.scrollHeight - content.clientHeight;
      content.scrollTop = value > scrollableHeight ? scrollableHeight : Math.max(value, 0);
    },
    /** Refreshes the position and size of the scrollbar thumbs. */
    refresh() {
      this.moveBar();
    },
  },
};
</script>
