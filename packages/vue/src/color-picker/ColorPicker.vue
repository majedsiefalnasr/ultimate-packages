<template>
  <div :class="cx('root')">
    <input
      type="text"
      readonly
      :class="cx('preview', { disabled })"
      :tabindex="disabled ? -1 : 0"
      :disabled="disabled"
      :style="{ backgroundColor: inputBgColor }"
      aria-label="Select color"
      aria-haspopup="true"
      :aria-expanded="overlayVisible"
      @click="onInputClick"
      @keydown="onInputKeydown"
    />
    <UPortal v-if="overlayVisible" :appendTo="appendTo">
      <div :class="cx('panel')">
        <div :class="cx('content')">
          <div
            ref="colorSelectorRef"
            :class="cx('colorSelector')"
            :style="{ backgroundColor: colorSelectorBg }"
            @mousedown="onColorMouseDown"
          >
            <div :class="cx('colorBackground')">
              <div :class="cx('colorHandle')" :style="{ left: colorHandleLeft + 'px', top: colorHandleTop + 'px' }"></div>
            </div>
          </div>
          <div ref="hueRef" :class="cx('hue')" @mousedown="onHueMouseDown">
            <div :class="cx('hueHandle')" :style="{ top: hueHandleTop + 'px' }"></div>
          </div>
        </div>
      </div>
    </UPortal>
  </div>
</template>

<script>
import { Portal as UPortal } from "@ultimate/vue-core";
import { createBaseColorPicker } from "./BaseColorPicker";

function validateHsb(hsb) {
  return {
    h: Math.min(360, Math.max(0, hsb.h)),
    s: Math.min(100, Math.max(0, hsb.s)),
    b: Math.min(100, Math.max(0, hsb.b)),
  };
}

function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
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

function hexToHsb(hex) {
  return rgbToHsb(hexToRgb(hex));
}

function hsbToRgb(hsb) {
  let rgb = { r: 0, g: 0, b: 0 };
  const h = hsb.h;
  const s = (hsb.s * 255) / 100;
  const v = (hsb.b * 255) / 100;
  if (s === 0) {
    rgb = { r: v, g: v, b: v };
  } else {
    const t1 = v;
    const t2 = ((255 - s) * v) / 255;
    const t3 = ((t1 - t2) * (h % 60)) / 60;
    let hh = h;
    if (hh === 360) hh = 0;
    if (hh < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3;
    } else if (hh < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3;
    } else if (hh < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3;
    } else if (hh < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3;
    } else if (hh < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3;
    } else if (hh < 360) {
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

// Real PrimeVue ColorPicker (.vendor-extracted/vue/colorpicker/ColorPicker.vue)
// composes its own Portal + transition around a color-selector square
// (saturation/brightness drag) plus a hue strip (vertical drag). This port
// composes UPortal the same way Select.vue does
// (packages/vue/src/select/Select.vue), matching real source's own
// "preview input trigger + Portal-rendered overlay panel" shape.
//
// Value format matches real source's own `format` prop: 'hex' (default, a
// #rrggbb string), 'rgb' ({r,g,b}), or 'hsb' ({h,s,b}) — same HSB/RGB/HEX
// conversion math as real source's own HSBtoRGB/RGBtoHSB/HSBtoHEX/HEXtoHSB.
//
// Deliberately excludes real source's much larger surface: inline mode,
// touch-event handling (mouse/keyboard interaction only, matching every
// sibling component's established "smaller surface than upstream"
// precedent), and passthrough.
export default {
  name: "UColorPicker",
  extends: createBaseColorPicker(),
  components: { UPortal },
  emits: ["change", "show", "hide"],
  data() {
    // Base tier's own data() (createBaseEditableHolder) initializes dValue
    // independently of this child's own data() — same corrected pattern
    // documented in Select.vue's own data(). overlayVisible/drag flags are
    // all independent of dValue, so no derivation pitfall applies here, but
    // this comment documents the same known pitfall was checked.
    return {
      overlayVisible: false,
      colorDragging: false,
      hueDragging: false,
    };
  },
  computed: {
    hsbValue() {
      return this.toHsb(this.dValue);
    },
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
      if (value) {
        switch (this.format) {
          case "rgb":
            return rgbToHsb(value);
          case "hsb":
            return value;
          case "hex":
          default:
            return hexToHsb(value);
        }
      }
      return hexToHsb(this.defaultColor);
    },
    getValueToUpdate(hsb) {
      switch (this.format) {
        case "rgb":
          return hsbToRgb(hsb);
        case "hsb":
          return { ...hsb };
        case "hex":
        default:
          return "#" + hsbToHex(hsb);
      }
    },
    updateModel(hsb, event) {
      const value = this.getValueToUpdate(hsb);
      this.writeValue(value, event);
      this.$emit("change", { originalEvent: event, value });
    },
    togglePanel() {
      if (this.disabled) return;
      this.overlayVisible = !this.overlayVisible;
      this.$emit(this.overlayVisible ? "show" : "hide");
    },
    onInputClick() {
      this.togglePanel();
    },
    onInputKeydown(event) {
      switch (event.code) {
        case "Space":
          this.togglePanel();
          event.preventDefault();
          break;
        case "Escape":
        case "Tab":
          if (this.overlayVisible) {
            this.overlayVisible = false;
            this.$emit("hide");
          }
          break;
        default:
          break;
      }
    },
    pickColor(clientX, clientY, event) {
      const rect = this.$refs.colorSelectorRef?.getBoundingClientRect();
      if (!rect) return;
      const saturation = Math.floor((100 * Math.max(0, Math.min(150, clientX - rect.left))) / 150);
      const brightness = Math.floor((100 * (150 - Math.max(0, Math.min(150, clientY - rect.top)))) / 150);
      this.updateModel(validateHsb({ h: this.hsbValue.h, s: saturation, b: brightness }), event);
    },
    pickHue(clientY, event) {
      const rect = this.$refs.hueRef?.getBoundingClientRect();
      if (!rect) return;
      const hue = Math.floor((360 * (150 - Math.max(0, Math.min(150, clientY - rect.top)))) / 150);
      this.updateModel(validateHsb({ h: hue, s: this.hsbValue.s, b: this.hsbValue.b }), event);
    },
    onColorMouseDown(event) {
      if (this.disabled) return;
      this.colorDragging = true;
      this.pickColor(event.clientX, event.clientY, event);
      this.bindDragListeners();
    },
    onHueMouseDown(event) {
      if (this.disabled) return;
      this.hueDragging = true;
      this.pickHue(event.clientY, event);
      this.bindDragListeners();
    },
    bindDragListeners() {
      const move = (event) => {
        if (this.colorDragging) this.pickColor(event.clientX, event.clientY, event);
        if (this.hueDragging) this.pickHue(event.clientY, event);
      };
      const up = () => {
        this.colorDragging = false;
        this.hueDragging = false;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
  },
};
</script>
