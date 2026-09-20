<template>
  <textarea
    ref="textarea"
    :class="cx('root', styleParams)"
    :value="dValue"
    :name="name"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  ></textarea>
</template>

<script>
import { createBaseTextarea } from "./BaseTextarea";

// Real rendered DOM verified against .vendor-extracted PrimeVue Textarea.vue:
// a single native `<textarea>`, no decorative wrapper — same single-element
// shape as UInputText. `autoResize`'s real algorithm (verified against real
// source's own `mounted()`/`updated()`/`resize()`): a `ResizeObserver`
// watches the element (installed once, in `mounted()`, only when
// `autoResize` is true) and, on every observed resize AND on every Vue
// `updated()` pass, measures `scrollHeight` against the current inline
// `style.height` — shrinking first (`height: auto` then re-measuring
// `scrollHeight`) when content got shorter, or growing directly to
// `scrollHeight` when it needs more room. Ported here as a real, working
// port (not a stub) using the same shrink-then-grow two-step, same
// `requestAnimationFrame`-wrapped observer callback (documented upstream as
// a Firefox `ResizeObserver`-loop workaround), and the same
// `beforeUnmount`-time `observer.disconnect()` cleanup.
export default {
  name: "UTextarea",
  extends: createBaseTextarea(),
  emits: ["focus", "blur"],
  data() {
    return { observer: null };
  },
  computed: {
    styleParams() {
      return {
        invalid: this.invalid,
        fluid: this.resolvedFluid,
        variantFilled: this.resolvedVariant === "filled",
        autoResize: this.autoResize,
      };
    },
  },
  mounted() {
    if (this.autoResize && typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.resize();
        });
      });
      this.observer.observe(this.$refs.textarea);
    }
  },
  updated() {
    if (this.autoResize) {
      this.resize();
    }
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    resize() {
      const el = this.$refs.textarea;
      if (!el || !el.offsetParent) return;

      const currentHeightValue = parseInt(el.style.height, 10) || 0;
      const initialScrollHeight = el.scrollHeight;

      const needsExpanding = !currentHeightValue || initialScrollHeight > currentHeightValue;
      const needsShrinking = currentHeightValue && initialScrollHeight < currentHeightValue;

      if (needsShrinking) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      } else if (needsExpanding) {
        el.style.height = `${initialScrollHeight}px`;
      }
    },
    onInput(event) {
      if (this.autoResize) {
        this.resize();
      }
      this.writeValue(event.target.value, event);
    },
    onFocus(event) {
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
  },
};
</script>
