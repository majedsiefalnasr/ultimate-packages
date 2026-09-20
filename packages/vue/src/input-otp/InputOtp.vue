<template>
  <div :class="cx('root')">
    <input
      v-for="i in length"
      :key="i"
      :ref="(el) => setInputRef(el, i - 1)"
      :type="inputType"
      :value="tokens[i - 1] ?? ''"
      :class="cx('pcInputText')"
      :inputmode="inputMode"
      :name="name"
      :readonly="readonly"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :tabindex="tabindex"
      @input="onInput($event, i - 1)"
      @focus="onFocus"
      @blur="onBlur"
      @paste="onPaste"
      @keydown="onKeyDown"
      @click="onClick"
    />
  </div>
</template>

<script>
import { createBaseInputOtp } from "./BaseInputOtp";

// Real rendered DOM verified against .vendor-extracted PrimeVue InputOtp.vue:
// `length` sibling native `<input type="text">` elements (real source
// renders its own `InputText` component per slot — here each slot is a
// plain native input styled with the same `pcInputText` class token, since
// this package's own UInputText is a separate top-level component and
// InputOtp does not need its full v-model/writeValue machinery per segment
// — createBaseInput()'s single-value writeValue() operates once, on the
// JOINED string, matching real source's own `updateModel()`, which also
// joins `tokens` into one string and calls `writeValue(newValue, event)`
// exactly once per edit, never per-segment.
//
// Real behavior ported: modelValue -> tokens split on mount/change (real
// source's own `watch: { modelValue: { immediate: true, handler... } }`),
// arrow-key navigation (ArrowLeft/ArrowRight move focus across segments),
// Backspace-at-empty-segment moves to the previous segment, paste splits
// clipboard text across segments (respecting `integerOnly`), `integerOnly`
// filters non-digit keydowns, `mask` renders each segment as
// `type="password"`-equivalent obscured text (real source flips `type` to
// "password"; native `<input type="password">` used here identically via a
// computed `inputType`), max-length-per-batch enforcement blocks further
// typing once `length` is reached without an active selection.
export default {
  name: "UInputOtp",
  extends: createBaseInputOtp(),
  emits: ["change", "focus", "blur"],
  data() {
    return {
      tokens: [],
      inputRefs: [],
    };
  },
  watch: {
    dValue: {
      immediate: true,
      handler(newValue) {
        this.tokens = newValue ? String(newValue).split("") : new Array(this.length);
      },
    },
  },
  computed: {
    inputMode() {
      return this.integerOnly ? "numeric" : "text";
    },
    inputType() {
      return this.mask ? "password" : "text";
    },
  },
  methods: {
    setInputRef(el, index) {
      this.inputRefs[index] = el;
    },
    onInput(event, index) {
      const value = event.target.value;
      if (index === 0 && value.length > 1) {
        this.handlePaste(value, event);
        return;
      }
      this.tokens[index] = value;
      this.updateModel(event);

      if (event.inputType === "deleteContentBackward") {
        this.moveToPrev(index);
      } else if (event.inputType === "insertText" || event.inputType === "deleteContentForward") {
        this.moveToNext(index);
      }
    },
    updateModel(event) {
      const newValue = this.tokens.join("");
      this.writeValue(newValue, event);
      this.$emit("change", { originalEvent: event, value: newValue });
    },
    moveToPrev(index) {
      const prev = this.inputRefs[index - 1];
      if (prev) {
        prev.focus();
        prev.select();
      }
    },
    moveToNext(index) {
      const next = this.inputRefs[index + 1];
      if (next) {
        next.focus();
        next.select();
      }
    },
    onFocus(event) {
      event.target.select();
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
    onClick(event) {
      setTimeout(() => event.target.select(), 1);
    },
    onKeyDown(event) {
      if (event.ctrlKey || event.metaKey) return;

      const index = this.inputRefs.indexOf(event.target);

      switch (event.key) {
        case "ArrowLeft":
          this.moveToPrev(index);
          event.preventDefault();
          break;
        case "ArrowRight":
          this.moveToNext(index);
          event.preventDefault();
          break;
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          break;
        case "Backspace":
          if (event.target.value.length === 0) {
            this.moveToPrev(index);
            event.preventDefault();
          }
          break;
        case "Enter":
        case "Tab":
          break;
        default: {
          const target = event.target;
          const hasSelection = target.selectionStart !== target.selectionEnd;
          const isAtMaxLength = this.tokens.join("").length >= this.length;
          const isValidKey = this.integerOnly ? /^[0-9]$/.test(event.key) : true;

          if (!isValidKey || (isAtMaxLength && event.key !== "Delete" && !hasSelection)) {
            event.preventDefault();
          }
          break;
        }
      }
    },
    onPaste(event) {
      if (this.readonly || this.disabled) return;

      const paste = event.clipboardData.getData("text");
      if (paste.length) {
        this.handlePaste(paste, event);
      }
      event.preventDefault();
    },
    handlePaste(paste, event) {
      const pastedCode = paste.substring(0, this.length);
      if (!this.integerOnly || !isNaN(Number(pastedCode))) {
        this.tokens = pastedCode.split("");
        this.updateModel(event);
      }
    },
  },
};
</script>
