<template>
  <UInputText
    :id="id"
    :value="currentVal"
    :class="cx('root')"
    :readonly="readonly"
    :disabled="disabled"
    :invalid="invalid"
    :size="size"
    :name="name"
    :variant="variant"
    :placeholder="placeholder"
    :fluid="resolvedFluid"
    :unstyled="unstyled"
    :pt="rootPTOptions"
    @input="onInput"
    @compositionend="onInput"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeyDown"
    @keypress="onKeyPress"
    @paste="onPaste"
  />
</template>

<script>
import { mergeProps } from "vue";
import { UInputText } from "../input-text";
import { createBaseInputMask } from "./BaseInputMask";

// Ultimate-owned port of PrimeVue 4.5.5 `InputMask.vue`, which is itself the
// jQuery-maskedinput algorithm (`initMask`/`checkVal`/`shiftL`/`shiftR`).
// The component renders a nested `UInputText`, so its `$el` is the native
// input and the InputText styling and pass-through apply unchanged.
//
// Token vocabulary: `9` digit, `a` alpha, `*` alphanumeric, `?` marks the
// rest of the mask optional, any other character is a literal.
//
// Differences from PrimeVue (recorded in ADR-095):
//   - keys are read from `event.key`, not `event.code`;
//   - `caret()` only writes a selection while the input is focused and has no
//     `offsetParent` guard, so the read side works in jsdom;
//   - keypress ignores ctrl/alt/meta chords and non-character keys, but lets
//     shift through, so capitals are masked like any other character;
//   - `onInput` returns while an IME composition is active, and the
//     `compositionend` event finalizes it;
//   - paste only emits `paste`; the browser's own `input` event reformats;
//   - `complete` carries `{ originalEvent, value }`, the earlier Ultimate
//     contract, not the bare event;
//   - without a `mask` the component behaves as a plain text input;
//   - `@primevue/forms` (`formField.onBlur`) is out of scope.
export default {
  name: "UInputMask",
  extends: createBaseInputMask(),
  inheritAttrs: false,
  emits: ["focus", "blur", "keydown", "keypress", "complete", "paste"],
  components: { UInputText },
  data() {
    return {
      currentVal: "",
    };
  },
  computed: {
    rootPTOptions() {
      return {
        root: mergeProps(
          this.ptm("pcInputText", this.ptmParams)?.root,
          this.ptmi("root", this.ptmParams)
        ),
      };
    },
    ptmParams() {
      return {
        context: {
          filled: this.filled,
        },
      };
    },
  },
  watch: {
    mask(newMask, oldMask) {
      if (oldMask !== newMask) {
        this.initMask();
      }
    },
    slotChar(newChar, oldChar) {
      if (oldChar !== newChar) {
        this.initMask();
      }
    },
    disabled(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.updateValue();
      }
    },
    dValue(newValue) {
      if (!this.mask) {
        this.currentVal = newValue === undefined || newValue === null ? "" : String(newValue);
      }
    },
  },
  created() {
    this.tests = [];
    this.buffer = [];
    this.len = 0;
    this.partialPosition = 0;
    this.firstNonMaskPos = null;
    this.lastRequiredNonMaskPos = -1;
    this.defaultBuffer = "";
    this.focusText = "";
    this.oldVal = "";
    this.androidChrome = false;
    this.caretTimeoutId = null;
    this.updateTimeoutId = null;
  },
  mounted() {
    this.initMask();
  },
  updated() {
    if (this.mask && this.isValueUpdated()) {
      this.updateValue();
    }
  },
  beforeUnmount() {
    clearTimeout(this.caretTimeoutId);
    clearTimeout(this.updateTimeoutId);
  },
  methods: {
    inputEl() {
      const el = this.$el;
      return el && el.tagName === "INPUT" ? el : null;
    },
    modelOut(value) {
      const val = this.unmask ? this.getUnmaskedValue() : value;
      return this.defaultBuffer !== val ? val : "";
    },
    emitComplete(event) {
      const el = this.inputEl();
      this.$emit("complete", { originalEvent: event, value: this.modelOut(el ? el.value : "") });
    },
    onInput(event) {
      // `isComposing` is true while an IME composition is still open; the
      // `compositionend` event finalizes it.
      if (event.isComposing) return;

      if (!this.mask) {
        this.updateModelValue(event.target.value);
        return;
      }

      if (this.androidChrome) this.handleAndroidInput(event);
      else this.handleInputChange(event);

      this.updateModelValue(event.target.value);
    },
    onFocus(event) {
      const el = this.inputEl();

      if (this.mask && !this.readonly && el) {
        this.focusText = el.value;

        if (!el.value || el.value === this.defaultBuffer) {
          clearTimeout(this.caretTimeoutId);
          this.caretTimeoutId = setTimeout(() => {
            if (this.inputEl() === document.activeElement) {
              this.caret(0, 0);
            }
          }, 0);
        } else {
          const pos = this.checkVal();

          clearTimeout(this.caretTimeoutId);
          this.caretTimeoutId = setTimeout(() => {
            const input = this.inputEl();

            if (!input || input !== document.activeElement) {
              return;
            }

            this.writeBuffer();

            if (pos === this.mask.replace("?", "").length) {
              this.caret(0, pos);
            } else {
              this.caret(pos);
            }
          }, 10);
        }
      }

      this.$emit("focus", event);
    },
    onBlur(event) {
      const el = this.inputEl();

      if (this.mask && el) {
        this.checkVal();
        this.updateModelValue(el.value);

        if (el.value !== this.focusText) {
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      this.$emit("blur", event);
    },
    onKeyDown(event) {
      const el = this.inputEl();

      if (this.mask && !this.readonly && el) {
        const key = event.key;
        const iPhone = /iphone/i.test(navigator.userAgent);

        this.oldVal = el.value;

        // Backspace, Delete (and Escape on iPhone) get special treatment.
        if (key === "Backspace" || key === "Delete" || (iPhone && key === "Escape")) {
          const pos = this.caret();
          let begin = pos.begin;
          let end = pos.end;

          if (end - begin === 0) {
            begin = key !== "Delete" ? this.seekPrev(begin) : (end = this.seekNext(begin - 1));
            end = key === "Delete" ? this.seekNext(end) : end;
          }

          this.clearBuffer(begin, end);
          this.shiftL(begin, end - 1);
          this.updateModelValue(el.value);

          event.preventDefault();
        } else if (key === "Enter") {
          el.blur();
          this.updateModelValue(el.value);
        } else if (key === "Escape") {
          el.value = this.focusText;
          this.caret(0, this.checkVal());
          this.updateModelValue(el.value);

          event.preventDefault();
        }
      }

      this.$emit("keydown", event);
    },
    onKeyPress(event) {
      const el = this.inputEl();

      if (
        this.mask &&
        !this.readonly &&
        el &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        typeof event.key === "string" &&
        event.key.length === 1
      ) {
        const pos = this.caret();
        let completed = false;

        if (pos.end - pos.begin !== 0) {
          this.clearBuffer(pos.begin, pos.end);
          this.shiftL(pos.begin, pos.end - 1);
        }

        const p = this.seekNext(pos.begin - 1);

        if (p < this.len) {
          const c = event.key;

          if (this.tests[p].test(c)) {
            this.shiftR(p);

            this.buffer[p] = c;
            this.writeBuffer();

            const next = this.seekNext(p);

            if (/android/i.test(navigator.userAgent)) {
              clearTimeout(this.caretTimeoutId);
              this.caretTimeoutId = setTimeout(() => this.caret(next), 0);
            } else {
              this.caret(next);
            }

            if (pos.begin <= this.lastRequiredNonMaskPos) {
              completed = this.isCompleted();
            }
          }
        }

        event.preventDefault();
        this.updateModelValue(el.value);

        if (completed) {
          this.emitComplete(event);
        }
      }

      this.$emit("keypress", event);
    },
    onPaste(event) {
      this.$emit("paste", event);
    },
    caret(first, last) {
      const el = this.inputEl();

      if (!el) {
        return undefined;
      }

      if (typeof first === "number") {
        if (el !== document.activeElement) {
          return undefined;
        }

        const begin = first;
        const end = typeof last === "number" ? last : begin;

        el.setSelectionRange(begin, end);
        return undefined;
      }

      return { begin: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
    },
    isCompleted() {
      for (let i = this.firstNonMaskPos; i <= this.lastRequiredNonMaskPos; i++) {
        if (this.tests[i] && this.buffer[i] === this.getPlaceholder(i)) {
          return false;
        }
      }

      return true;
    },
    getPlaceholder(i) {
      if (i < this.slotChar.length) {
        return this.slotChar.charAt(i);
      }

      return this.slotChar.charAt(0);
    },
    seekNext(pos) {
      while (++pos < this.len && !this.tests[pos]);

      return pos;
    },
    seekPrev(pos) {
      while (--pos >= 0 && !this.tests[pos]);

      return pos;
    },
    shiftL(begin, end) {
      if (begin < 0) {
        return;
      }

      for (let i = begin, j = this.seekNext(end); i < this.len; i++) {
        if (this.tests[i]) {
          if (j < this.len && this.tests[i].test(this.buffer[j])) {
            this.buffer[i] = this.buffer[j];
            this.buffer[j] = this.getPlaceholder(j);
          } else {
            break;
          }

          j = this.seekNext(j);
        }
      }

      this.writeBuffer();
      this.caret(Math.max(this.firstNonMaskPos, begin));
    },
    shiftR(pos) {
      for (let i = pos, c = this.getPlaceholder(pos); i < this.len; i++) {
        if (this.tests[i]) {
          const j = this.seekNext(i);
          const t = this.buffer[i];

          this.buffer[i] = c;

          if (j < this.len && this.tests[j].test(t)) {
            c = t;
          } else {
            break;
          }
        }
      }
    },
    handleAndroidInput(event) {
      const el = this.inputEl();
      const curVal = el.value;
      const pos = this.caret();

      if (this.oldVal && this.oldVal.length && this.oldVal.length > curVal.length) {
        // A deletion or backspace happened.
        this.checkVal(true);
        while (pos.begin > 0 && !this.tests[pos.begin - 1]) pos.begin--;

        if (pos.begin === 0) {
          while (pos.begin < this.firstNonMaskPos && !this.tests[pos.begin]) pos.begin++;
        }

        this.caret(pos.begin, pos.begin);
      } else {
        this.checkVal(true);
        while (pos.begin < this.len && !this.tests[pos.begin]) pos.begin++;

        this.caret(pos.begin, pos.begin);
      }

      if (this.isCompleted() && el.value !== this.defaultBuffer) {
        this.emitComplete(event);
      }
    },
    clearBuffer(start, end) {
      for (let i = start; i < end && i < this.len; i++) {
        if (this.tests[i]) {
          this.buffer[i] = this.getPlaceholder(i);
        }
      }
    },
    writeBuffer() {
      const el = this.inputEl();

      if (el) {
        el.value = this.buffer.join("");
      }
    },
    checkVal(allow) {
      const el = this.inputEl();
      // Try to place characters where they belong.
      const test = el.value;
      let lastMatch = -1;
      let i;
      let pos;

      for (i = 0, pos = 0; i < this.len; i++) {
        if (this.tests[i]) {
          this.buffer[i] = this.getPlaceholder(i);

          while (pos++ < test.length) {
            const c = test.charAt(pos - 1);

            if (this.tests[i].test(c)) {
              this.buffer[i] = c;
              lastMatch = i;
              break;
            }
          }

          if (pos > test.length) {
            this.clearBuffer(i + 1, this.len);
            break;
          }
        } else {
          if (this.buffer[i] === test.charAt(pos)) {
            pos++;
          }

          if (i < this.partialPosition) {
            lastMatch = i;
          }
        }
      }

      if (allow) {
        this.writeBuffer();
      } else if (lastMatch + 1 < this.partialPosition) {
        if (this.autoClear || this.buffer.join("") === this.defaultBuffer) {
          // Invalid value: remove it and replace it with the mask.
          if (el.value) el.value = "";
          this.clearBuffer(0, this.len);
        } else {
          // Invalid value, but show it so the user can correct the mistake.
          this.writeBuffer();
        }
      } else {
        this.writeBuffer();
        el.value = el.value.substring(0, lastMatch + 1);
      }

      return this.partialPosition ? i : this.firstNonMaskPos;
    },
    handleInputChange(event) {
      if (this.readonly) {
        return;
      }

      const el = this.inputEl();
      const pos = this.checkVal(true);

      this.caret(pos);
      this.updateModelValue(el.value);

      if (this.isCompleted() && el.value !== this.defaultBuffer) {
        this.emitComplete(event);
      }
    },
    getUnmaskedValue() {
      const unmaskedBuffer = [];

      for (let i = 0; i < this.buffer.length; i++) {
        const c = this.buffer[i];

        if (this.tests[i] && c !== this.getPlaceholder(i)) {
          unmaskedBuffer.push(c);
        }
      }

      return unmaskedBuffer.join("");
    },
    updateModelValue(value) {
      if (this.currentVal === value) return;

      const out = this.modelOut(value);

      this.currentVal = value;
      // An uncontrolled instance keeps its own value, so the next render does
      // not re-apply a stale one.
      this.dValue = out;
      this.writeValue(out);
    },
    updateValue(updateModel = true) {
      const el = this.inputEl();

      if (!el) {
        return;
      }

      if (!this.mask) {
        el.value = this.dValue === undefined || this.dValue === null ? "" : String(this.dValue);
        this.currentVal = el.value;
        return;
      }

      if (this.dValue === undefined || this.dValue === null) {
        el.value = "";
        this.currentVal = "";
        if (updateModel) this.updateModelValue("");
      } else {
        el.value = this.dValue;
        this.checkVal();
        this.currentVal = el.value;

        clearTimeout(this.updateTimeoutId);
        this.updateTimeoutId = setTimeout(() => {
          const input = this.inputEl();

          if (input) {
            this.writeBuffer();
            this.checkVal();
            this.currentVal = input.value;

            if (updateModel) this.updateModelValue(input.value);
          }
        }, 10);
      }

      this.focusText = el.value;
    },
    initMask() {
      const defs = {
        9: /[0-9]/,
        a: /[A-Za-z]/,
        "*": /[A-Za-z0-9]/,
      };
      const maskTokens = this.mask ? this.mask.split("") : [];

      this.tests = [];
      this.partialPosition = this.mask ? this.mask.length : 0;
      this.len = this.mask ? this.mask.length : 0;
      this.firstNonMaskPos = null;
      this.lastRequiredNonMaskPos = -1;
      this.androidChrome =
        /chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);

      for (let i = 0; i < maskTokens.length; i++) {
        const c = maskTokens[i];

        if (c === "?") {
          this.len--;
          this.partialPosition = i;
        } else if (defs[c]) {
          this.tests.push(defs[c]);

          if (this.firstNonMaskPos === null) {
            this.firstNonMaskPos = this.tests.length - 1;
          }

          if (i < this.partialPosition) {
            this.lastRequiredNonMaskPos = this.tests.length - 1;
          }
        } else {
          this.tests.push(null);
        }
      }

      this.buffer = [];

      for (let i = 0; i < maskTokens.length; i++) {
        const c = maskTokens[i];

        if (c !== "?") {
          this.buffer.push(defs[c] ? this.getPlaceholder(i) : c);
        }
      }

      this.defaultBuffer = this.buffer.join("");
      this.updateValue(false);
    },
    isValueUpdated() {
      const el = this.inputEl();

      if (!el) {
        return false;
      }

      return this.unmask
        ? this.dValue != this.getUnmaskedValue()
        : this.defaultBuffer !== el.value && el.value !== this.dValue;
    },
  },
};
</script>
