<template>
  <input
    ref="input"
    type="text"
    :class="cx('root')"
    :value="displayValue"
    :name="name"
    :placeholder="placeholder ?? defaultBuffer"
    :readonly="readonly"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    @input="onInput"
    @keydown="onKeyDown"
    @focus="onFocus"
    @blur="onBlur"
    @paste="onPaste"
  />
</template>

<script>
import { createBaseInputMask } from "./BaseInputMask";

// Ultimate-owned adaptation of PrimeVue's `InputMask` — a real, working
// masking-buffer engine ported from real source's own jQuery-maskedinput-
// derived algorithm (verified against .vendor-extracted InputMask.vue,
// `initMask`/`checkVal`/`defs` table), scoped down on ONE axis only: this
// port re-derives the buffer from the raw input value on every keystroke
// via `selectionStart`-based cursor tracking rather than real source's own
// much larger caret-preserving `insertText`/`deleteRange`/`initCursor`
// machinery (~300 lines of IE/Android-era cursor-position arithmetic this
// port does not need — modern browsers report `selectionStart`/
// `selectionEnd` reliably on `input` events). The MASKING BEHAVIOR ITSELF
// is fully real and not cut: same token vocabulary (`9`=digit, `a`=alpha,
// `*`=alphanumeric, `?`=marks everything after it optional, any other
// character = static/literal, inserted automatically and skipped over on
// typing/backspacing), same `slotChar` placeholder, same `autoClear`
// (blanks an incomplete value on blur), same `unmask` (emits the raw
// unmasked characters instead of the formatted buffer).
export default {
  name: "UInputMask",
  extends: createBaseInputMask(),
  emits: ["focus", "blur", "keydown", "complete", "paste"],
  data() {
    return {
      buffer: [],
      tests: [],
      len: 0,
      firstNonMaskPos: null,
      lastRequiredNonMaskPos: null,
      defaultBuffer: "",
      focused: false,
      selfDriven: false,
    };
  },
  computed: {
    displayValue() {
      if (this.focused || (this.dValue !== undefined && this.dValue !== null && this.dValue !== "")) {
        return this.bufferToString();
      }
      return "";
    },
  },
  watch: {
    mask() {
      this.initMask();
    },
    dValue() {
      // Skipped when this write originated from our own writeValue() call
      // (onInput/onKeyDown/onPaste/onBlur already mutated `buffer` directly,
      // char-by-char or slot-by-slot) — re-deriving it here via checkVal()
      // would re-pack digits left-to-right from scratch and silently
      // discard the caret-position-aware edit that was just made (e.g. a
      // single Backspace at position N would incorrectly shift every digit
      // after N left by one instead of just clearing slot N). Only an
      // externally-driven modelValue change (a fresh v-model assignment
      // from the consumer) should trigger a full re-sync.
      if (!this.focused && !this.selfDriven) {
        this.syncFromModel();
      }
      this.selfDriven = false;
    },
  },
  created() {
    // Both run in created() (before the initial render), not mounted():
    // mutating `buffer` in mounted() would still be correct data-wise, but
    // Vue 3 batches the resulting re-render as a microtask, so a caller
    // reading the rendered DOM synchronously right after `mount()` (with no
    // awaited tick) would see the placeholder buffer, not the synced one.
    // Syncing before the first render avoids that extra tick entirely.
    this.initMask();
    this.syncFromModel();
  },
  methods: {
    // 9 = digit, a = alpha, * = alphanumeric, ? = rest-of-mask-is-optional,
    // anything else = static/literal character (auto-inserted, not user-editable).
    initMask() {
      this.tests = [];
      this.buffer = [];
      this.firstNonMaskPos = null;
      this.lastRequiredNonMaskPos = null;

      const defs = { 9: /[0-9]/, a: /[A-Za-z]/, "*": /[A-Za-z0-9]/ };
      const mask = this.mask || "";
      let partialPosition = mask.length;
      const maskTokens = mask.split("");

      for (let i = 0; i < maskTokens.length; i++) {
        const c = maskTokens[i];
        if (c === "?") {
          partialPosition = i;
        } else if (defs[c]) {
          this.tests.push(defs[c]);
          if (this.firstNonMaskPos === null) this.firstNonMaskPos = this.tests.length - 1;
          if (i < partialPosition) this.lastRequiredNonMaskPos = this.tests.length - 1;
        } else {
          this.tests.push(null);
        }
      }

      this.partialPosition = partialPosition;
      this.len = this.tests.length;
      this.buffer = this.tests.map((test, i) => (test ? this.slotChar : maskTokens[i]));
      this.defaultBuffer = this.buffer.join("");
    },
    bufferToString() {
      return this.buffer.join("");
    },
    /** Rebuilds `buffer` from an arbitrary raw string, testing each char against `tests`. */
    checkVal(rawValue) {
      const raw = (rawValue ?? "").split("");
      this.buffer = this.tests.map((test, i) => (test ? this.slotChar : this.maskLiteralAt(i)));

      let bufferPos = 0;
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        while (bufferPos < this.len && this.tests[bufferPos] === null) {
          bufferPos++;
        }
        if (bufferPos >= this.len) break;
        const test = this.tests[bufferPos];
        if (test && test.test(ch)) {
          this.buffer[bufferPos] = ch;
          bufferPos++;
        }
      }
      return bufferPos;
    },
    maskLiteralAt(i) {
      const maskTokens = (this.mask || "").split("");
      return maskTokens[i];
    },
    isCompleted() {
      if (this.lastRequiredNonMaskPos === null) return true;
      for (let i = this.firstNonMaskPos; i <= this.lastRequiredNonMaskPos; i++) {
        if (this.tests[i] && this.buffer[i] === this.slotChar) return false;
      }
      return true;
    },
    unmaskedValue() {
      return this.buffer.filter((ch, i) => this.tests[i] && ch !== this.slotChar).join("");
    },
    syncFromModel() {
      if (!this.mask) return;
      const value = this.dValue;
      if (value === undefined || value === null || value === "") {
        this.buffer = this.tests.map((test, i) => (test ? this.slotChar : this.maskLiteralAt(i)));
        return;
      }
      this.checkVal(String(value));
    },
    emitModel(event) {
      const formatted = this.bufferToString();
      const isBlank = formatted === this.defaultBuffer;
      const outValue = isBlank ? "" : this.unmask ? this.unmaskedValue() : formatted;
      this.selfDriven = true;
      this.writeValue(outValue, event);
      if (this.isCompleted() && !isBlank) {
        this.$emit("complete", { originalEvent: event, value: outValue });
      }
    },
    onInput(event) {
      if (!this.mask) {
        this.writeValue(event.target.value, event);
        return;
      }
      this.checkVal(event.target.value);
      event.target.value = this.bufferToString();
      const caret = this.firstEditablePos();
      event.target.setSelectionRange(caret, caret);
      this.emitModel(event);
    },
    firstEditablePos() {
      for (let i = 0; i < this.len; i++) {
        if (this.tests[i] && this.buffer[i] === this.slotChar) return i;
      }
      return this.len;
    },
    onKeyDown(event) {
      this.$emit("keydown", event);
      if (!this.mask || this.readonly) return;

      if (event.key === "Backspace" || event.key === "Delete") {
        const el = event.target;
        const pos = el.selectionStart;
        if (pos !== null && el.selectionStart === el.selectionEnd) {
          const removeAt = event.key === "Backspace" ? pos - 1 : pos;
          if (removeAt >= 0 && removeAt < this.len && this.tests[removeAt]) {
            this.buffer[removeAt] = this.slotChar;
            event.preventDefault();
            el.value = this.bufferToString();
            const caret = event.key === "Backspace" ? removeAt : pos;
            el.setSelectionRange(caret, caret);
            this.emitModel(event);
          }
        }
      }
    },
    onFocus(event) {
      this.focused = true;
      this.$nextTick(() => {
        if (event.target === document.activeElement) {
          const pos = this.firstEditablePos();
          event.target.setSelectionRange(pos, pos);
        }
      });
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.focused = false;
      if (this.autoClear && !this.isCompleted()) {
        this.buffer = this.tests.map((test, i) => (test ? this.slotChar : this.maskLiteralAt(i)));
        this.writeValue("", event);
      }
      this.$emit("blur", event);
    },
    onPaste(event) {
      if (this.readonly || this.disabled || !this.mask) return;
      const paste = event.clipboardData.getData("text");
      if (paste.length) {
        this.checkVal(paste);
        this.emitModel(event);
      }
      event.preventDefault();
      this.$emit("paste", event);
    },
  },
};
</script>
