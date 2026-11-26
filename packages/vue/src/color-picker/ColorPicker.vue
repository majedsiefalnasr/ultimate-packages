<template>
  <div ref="container" :class="cx('root', { inline, dragging })" v-bind="ptmi('root')">
    <input
      v-if="!inline"
      ref="input"
      :id="inputId"
      type="text"
      :class="cx('preview', { disabled })"
      readonly
      :tabindex="tabindex"
      :disabled="disabled"
      :style="{ backgroundColor: inputBgColor }"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      aria-haspopup="true"
      :aria-expanded="overlayVisible"
      v-bind="ptm('preview')"
      @click="onInputClick"
      @keydown="onInputKeydown"
    />
    <UPortal :appendTo="appendTo" :disabled="inline">
      <transition
        :css="false"
        name="u-anchored-overlay"
        @enter="onOverlayEnter"
        @leave="onOverlayLeave"
        @after-leave="onOverlayAfterLeave"
      >
        <div
          v-if="inline ? true : overlayVisible"
          ref="panel"
          :class="[cx('panel', { inline, disabled, invalid }), overlayClass]"
          v-bind="{ ...ptm('panel'), ...ptm('overlay') }"
        >
          <div :class="cx('content')" v-bind="ptm('content')">
            <div
              :class="cx('colorSelector')"
              :style="{ backgroundColor: colorSelectorBg }"
              v-bind="ptm('colorSelector')"
              @mousedown="onDragStart($event, 'color')"
              @touchstart="onDragStart($event, 'color')"
            >
              <div :class="cx('colorBackground')" v-bind="ptm('colorBackground')">
                <div
                  :class="cx('colorHandle')"
                  :style="{ left: colorHandleLeft + 'px', top: colorHandleTop + 'px' }"
                  v-bind="ptm('colorHandle')"
                ></div>
              </div>
            </div>
            <div
              :class="cx('hue')"
              v-bind="ptm('hue')"
              @mousedown="onDragStart($event, 'hue')"
              @touchstart="onDragStart($event, 'hue')"
            >
              <div
                :class="cx('hueHandle')"
                :style="{ top: hueHandleTop + 'px' }"
                v-bind="ptm('hueHandle')"
              ></div>
            </div>
          </div>
        </div>
      </transition>
    </UPortal>
  </div>
</template>

<script>
import {
  Portal as UPortal,
  useZIndex,
  Z_INDEX_KEYS,
  createMotionTransitionHooks,
} from "@ultimate/vue-core";
import {
  ConnectedOverlayScrollHandler,
  absolutePosition,
  isTouchDevice,
  relativePosition,
} from "@ultimate/uix-utils/dom";
import { createBaseColorPicker } from "./BaseColorPicker";

const { set: setZIndex, clear: clearZIndex } = useZIndex();
// JS-driven motion (`:css="false"`), as UMenu does: the leave wait of a
// CSS-driven <transition> never resolves in jsdom.
const motionHooks = createMotionTransitionHooks(() => ({ name: "u-anchored-overlay" }));

function validateHsb(hsb) {
  return {
    h: Math.min(360, Math.max(0, hsb.h)),
    s: Math.min(100, Math.max(0, hsb.s)),
    b: Math.min(100, Math.max(0, hsb.b)),
  };
}

function hexToRgb(hex) {
  const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
  return { r: hexValue >> 16, g: (hexValue & 0x00ff00) >> 8, b: hexValue & 0x0000ff };
}

function rgbToHsb(rgb) {
  const hsb = { h: 0, s: 0, b: 0 };
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  hsb.b = max;
  hsb.s = max !== 0 ? (255 * delta) / max : 0;
  if (hsb.s !== 0) {
    if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
    else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
    else hsb.h = 4 + (rgb.r - rgb.g) / delta;
  } else {
    hsb.h = -1;
  }
  hsb.h *= 60;
  if (hsb.h < 0) hsb.h += 360;
  hsb.s *= 100 / 255;
  hsb.b *= 100 / 255;
  return hsb;
}

function hsbToRgb(hsb) {
  let rgb = { r: 0, g: 0, b: 0 };
  let h = Math.round(hsb.h);
  const s = Math.round((hsb.s * 255) / 100);
  const v = Math.round((hsb.b * 255) / 100);
  if (s === 0) {
    rgb = { r: v, g: v, b: v };
  } else {
    const t1 = v;
    const t2 = ((255 - s) * v) / 255;
    const t3 = ((t1 - t2) * (h % 60)) / 60;
    if (h === 360) h = 0;
    if (h < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3;
    } else if (h < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3;
    } else if (h < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3;
    } else if (h < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3;
    } else if (h < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3;
    } else if (h < 360) {
      rgb.r = t1;
      rgb.g = t2;
      rgb.b = t1 - t3;
    }
  }
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

function rgbToHex(rgb) {
  const hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
  for (let i = 0; i < hex.length; i++) {
    if (hex[i].length === 1) hex[i] = "0" + hex[i];
  }
  return hex.join("");
}

function hsbToHex(hsb) {
  return rgbToHex(hsbToRgb(hsb));
}

function pointFromEvent(event, touchId) {
  if ("changedTouches" in event) {
    const touches = Array.from(event.changedTouches);
    const touch =
      touchId === undefined ? touches[0] : touches.find((item) => item.identifier === touchId);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}

// Real PrimeVue ColorPicker (.vendor-extracted/vue/colorpicker/ColorPicker.vue)
// renders a preview input and a panel with a saturation/brightness square and
// a hue strip; `inline` renders the panel in place without the input. The
// panel goes through UPortal (`appendTo`, default body), is positioned with
// absolutePosition/relativePosition, stacked with ZIndex under the `overlay`
// key, and closed on an outside click, a window resize (not on touch
// devices) or a scroll of any scrollable ancestor
// (ConnectedOverlayScrollHandler), as PrimeVue does. `show` and `hide` are
// emitted when the panel starts to enter and to leave.
//
// Pointer input is mouse and touch. A drag binds document listeners, follows
// only the touch that started it, ends on `touchcancel`, and is removed when
// it ends or the component unmounts. While a drag runs the picker keeps its
// own colour and ignores model updates. The hue of a grey, white or black
// colour is kept in `localHue`, as PrimeVue does. The value is `rrggbb` (no
// `#`) for 'hex', {r,g,b} for 'rgb' and {h,s,b} for 'hsb'; hex is read with
// or without `#`. `change` carries `{ originalEvent, value, event }`.
//
// `pt`, `unstyled` and `dt` come from the base chain; `inheritAttrs` is off
// because `ptmi('root')` places the attributes on the root. The CSS is the
// shared `@ultimate/uix-styles/colorpicker` module (ADR-082). Excluded
// (ADR-104): `panelClass` (use `overlayClass`), the @primevue/forms
// coupling, and the OverlayEventBus `overlay-click` emit.
export default {
  name: "UColorPicker",
  extends: createBaseColorPicker(),
  inheritAttrs: false,
  emits: ["change", "show", "hide"],
  components: { UPortal },
  data() {
    return {
      overlayVisible: false,
      dragging: false,
      hsbValue: { h: 0, s: 0, b: 0 },
    };
  },
  created() {
    this.localHue = null;
    this.stopDrag = null;
    this.outsideClickListener = null;
    this.resizeListener = null;
    this.scrollHandler = null;
    this.hsbValue = this.toHsb(this.dValue);
  },
  watch: {
    dValue(newValue) {
      if (!this.dragging) this.hsbValue = this.toHsb(newValue);
    },
    format() {
      this.hsbValue = this.toHsb(this.dValue);
    },
  },
  beforeUnmount() {
    if (this.stopDrag) this.stopDrag();
    this.unbindOutsideClickListener();
    this.unbindResizeListener();
    if (this.scrollHandler) {
      this.scrollHandler.destroy();
      this.scrollHandler = null;
    }
    if (this.$refs.panel && this.autoZIndex) clearZIndex(this.$refs.panel);
  },
  computed: {
    inputBgColor() {
      return "#" + hsbToHex(this.hsbValue);
    },
    colorSelectorBg() {
      return "#" + hsbToHex(validateHsb({ h: this.hsbValue.h, s: 100, b: 100 }));
    },
    colorHandleLeft() {
      return Math.floor((150 * this.hsbValue.s) / 100);
    },
    colorHandleTop() {
      return Math.floor((150 * (100 - this.hsbValue.b)) / 100);
    },
    hueHandleTop() {
      return Math.floor(150 - (150 * this.hsbValue.h) / 360);
    },
  },
  methods: {
    toHsb(value) {
      let hsb;
      if (value) {
        switch (this.format) {
          case "rgb":
            hsb = rgbToHsb(value);
            break;
          case "hsb":
            hsb = { ...value };
            break;
          case "hex":
          default:
            hsb = rgbToHsb(hexToRgb(value));
            break;
        }
      } else {
        hsb = rgbToHsb(hexToRgb(this.defaultColor));
      }
      if (hsb.s === 0 || hsb.b === 0) hsb.h = this.localHue ?? 0;
      else this.localHue = hsb.h;
      return hsb;
    },
    toValue(hsb) {
      switch (this.format) {
        case "rgb":
          return hsbToRgb(hsb);
        case "hsb":
          return { ...hsb };
        case "hex":
        default:
          return hsbToHex(hsb);
      }
    },
    updateModel(hsb, event) {
      this.hsbValue = hsb;
      const value = this.toValue(hsb);
      this.writeValue(value, event);
      this.$emit("change", { originalEvent: event, value, event });
    },
    onInputClick() {
      if (this.disabled) return;
      this.overlayVisible = !this.overlayVisible;
    },
    onInputKeydown(event) {
      switch (event.code) {
        case "Space":
          this.overlayVisible = !this.overlayVisible;
          event.preventDefault();
          break;
        case "Escape":
        case "Tab":
          this.overlayVisible = false;
          break;
        default:
          break;
      }
    },
    pick(element, point, part, event) {
      const rect = element.getBoundingClientRect();
      if (part === "color") {
        const saturation = Math.floor(
          (100 * Math.max(0, Math.min(150, point.x - rect.left))) / 150
        );
        const brightness = Math.floor(
          (100 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150
        );
        this.updateModel(
          validateHsb({ h: this.localHue ?? 0, s: saturation, b: brightness }),
          event
        );
      } else {
        this.localHue = Math.floor(
          (360 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150
        );
        this.updateModel(
          validateHsb({ h: this.localHue, s: this.hsbValue.s, b: this.hsbValue.b }),
          event
        );
      }
    },
    onDragStart(event, part) {
      if (this.disabled) return;
      if (this.stopDrag) this.stopDrag();
      const element = event.currentTarget;
      const touch = "changedTouches" in event;
      const touchId = touch ? event.changedTouches[0]?.identifier : undefined;
      if (!touch) event.preventDefault();

      const move = (moveEvent) => {
        if (this.disabled) return;
        const point = pointFromEvent(moveEvent, touchId);
        if (!point) return;
        if (moveEvent.cancelable) moveEvent.preventDefault();
        this.pick(element, point, part, moveEvent);
      };
      const stop = () => {
        this.stopDrag = null;
        this.dragging = false;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", stop);
        document.removeEventListener("touchcancel", stop);
      };

      if (touch) {
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("touchend", stop);
        document.addEventListener("touchcancel", stop);
      } else {
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
      }
      this.stopDrag = stop;
      this.dragging = true;
      const point = pointFromEvent(event, touchId);
      if (point) this.pick(element, point, part, event);
    },
    onOverlayEnter(el, done) {
      this.alignOverlay();
      this.bindOutsideClickListener();
      this.bindScrollListener();
      this.bindResizeListener();
      if (this.autoZIndex) setZIndex(Z_INDEX_KEYS.overlay, el, this.baseZIndex || 1000);
      this.$emit("show");
      motionHooks.onEnter(el, done);
    },
    onOverlayLeave(el, done) {
      this.unbindOutsideClickListener();
      this.unbindScrollListener();
      this.unbindResizeListener();
      this.$emit("hide");
      motionHooks.onLeave(el, done);
    },
    onOverlayAfterLeave(el) {
      if (this.autoZIndex) clearZIndex(el);
    },
    alignOverlay() {
      if (!this.$refs.panel || !this.$refs.input) return;
      if (this.appendTo === "self") relativePosition(this.$refs.panel, this.$refs.input);
      else absolutePosition(this.$refs.panel, this.$refs.input);
    },
    bindOutsideClickListener() {
      if (this.outsideClickListener) return;
      this.outsideClickListener = (event) => {
        const panel = this.$refs.panel;
        const input = this.$refs.input;
        if (
          this.overlayVisible &&
          panel &&
          !panel.contains(event.target) &&
          !(input && input.isSameNode(event.target))
        ) {
          this.overlayVisible = false;
        }
      };
      document.addEventListener("click", this.outsideClickListener, true);
    },
    unbindOutsideClickListener() {
      if (!this.outsideClickListener) return;
      document.removeEventListener("click", this.outsideClickListener, true);
      this.outsideClickListener = null;
    },
    bindScrollListener() {
      if (!this.scrollHandler) {
        this.scrollHandler = new ConnectedOverlayScrollHandler(this.$refs.container, () => {
          if (this.overlayVisible) this.overlayVisible = false;
        });
      }
      this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener() {
      if (this.scrollHandler) this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener() {
      if (this.resizeListener) return;
      this.resizeListener = () => {
        if (this.overlayVisible && !isTouchDevice()) this.overlayVisible = false;
      };
      window.addEventListener("resize", this.resizeListener);
    },
    unbindResizeListener() {
      if (!this.resizeListener) return;
      window.removeEventListener("resize", this.resizeListener);
      this.resizeListener = null;
    },
  },
};
</script>
