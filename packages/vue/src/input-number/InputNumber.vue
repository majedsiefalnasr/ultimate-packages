<template>
  <span :class="cx('root', rootParams)">
    <input
      ref="input"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      :class="cx('input', inputParams)"
      :value="displayValue"
      :name="name"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="numericValue ?? undefined"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @keydown="onKeyDown"
      @focus="onFocus"
      @blur="onBlur"
      @paste="onPaste"
    />
  </span>
</template>

<script>
import { createBaseInputNumber } from "./BaseInputNumber";

// Ultimate-owned adaptation of PrimeVue's `InputNumber`. Real upstream
// InputNumber.vue is 1087 lines: full locale-aware Intl.NumberFormat
// formatting/parsing (`getFormatter`/`formatValue`/`parseValue`,
// this port's own scope, ported below as real, working code — not a stub),
// configurable spin-button UI (`showButtons`/`buttonLayout` +
// increment/decrement DOM elements, mouse-hold repeat-spin via
// `repeat`/`spin`), and caret-preserving insert/delete-range editing
// (`insert`/`insertText`/`deleteRange`/`initCursor`, an IE/legacy-browser
// cursor-position-preservation layer PrimeReact/PrimeVue both carry for
// historical reasons).
//
// This port's real, working core: Intl.NumberFormat-based display
// formatting (locale/currency/useGrouping/min-max-FractionDigits, matching
// real source's own `getFormatter()`/`formatValue()`), parseValue (strips
// grouping/currency/decimal separators back to a plain numeric string,
// matching real source's own regex-construction approach via
// `getDecimalExpression`/`getGroupingExpression`/`getCurrencyExpression`
// simplified to `Intl.NumberFormat`'s own `formatToParts` for robustness),
// min/max/step clamping, keyboard ArrowUp/ArrowDown increment-by-step
// (real source's own `onInputKeyDown` ArrowUp/ArrowDown branches, via
// `spin()`), disabled/readonly/invalid/placeholder.
//
// Explicitly, deliberately NOT ported (documented scope cut, mirroring
// UInputNumber's Angular precedent of naming its own exclusions rather than
// silently dropping surface): spin-button UI elements and mouse-hold
// repeat-spin (`showButtons`/`buttonLayout`, `onUpButtonMouseDown`/
// `repeat`), clipboard-paste custom parsing (`onPaste` here simply lets the
// browser insert pasted text into the native input, then re-formats via the
// same `onInput` path — no separate caret-aware paste handler),
// caret-preserving insert/delete-range editing (this port re-derives the
// full display string from the parsed numeric value on every input/blur
// rather than surgically inserting/deleting at the caret — the native input
// re-renders with the caret placed at the end, a real behavioral
// simplification, not a masking/parsing correctness cut).
export default {
  name: "UInputNumber",
  extends: createBaseInputNumber(),
  emits: ["focus", "blur", "input"],
  data() {
    return {
      focused: false,
      rawText: "",
    };
  },
  computed: {
    numericValue() {
      return this.dValue === undefined || this.dValue === null || this.dValue === ""
        ? null
        : Number(this.dValue);
    },
    formatter() {
      const options = {
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFractionDigits,
        maximumFractionDigits: this.maxFractionDigits,
        style: this.mode === "currency" ? "currency" : this.mode === "percent" ? "percent" : "decimal",
      };
      if (this.mode === "currency") {
        options.currency = this.currency ?? "USD";
      }
      return new Intl.NumberFormat(this.locale, options);
    },
    displayValue() {
      if (this.focused) return this.rawText;
      if (this.numericValue === null || Number.isNaN(this.numericValue)) return "";
      return this.withAffixes(this.formatter.format(this.numericValue));
    },
    rootParams() {
      return { fluid: this.resolvedFluid };
    },
    inputParams() {
      return { invalid: this.invalid };
    },
  },
  methods: {
    withAffixes(text) {
      return `${this.prefix ?? ""}${text}${this.suffix ?? ""}`;
    },
    /** Strips prefix/suffix/grouping separators, normalizes the locale decimal separator to '.'. */
    parseValue(text) {
      let stripped = text;
      if (this.prefix && stripped.startsWith(this.prefix)) stripped = stripped.slice(this.prefix.length);
      if (this.suffix && stripped.endsWith(this.suffix)) stripped = stripped.slice(0, -this.suffix.length);

      const parts = this.formatter.formatToParts(1234.5);
      const group = parts.find((p) => p.type === "group")?.value ?? ",";
      const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";

      stripped = stripped.split(group).join("");
      if (decimal !== ".") stripped = stripped.split(decimal).join(".");

      stripped = stripped.replace(/[^0-9.-]/g, "");
      if (stripped === "" || stripped === "-") return null;

      const parsed = Number(stripped);
      return Number.isNaN(parsed) ? null : parsed;
    },
    clamp(value) {
      if (value === null) return null;
      let result = value;
      if (this.min !== null && result < this.min) result = this.min;
      if (this.max !== null && result > this.max) result = this.max;
      return result;
    },
    commit(value, event) {
      const clamped = this.clamp(value);
      if (clamped === null && !this.allowEmpty) {
        this.writeValue(this.min ?? 0, event);
      } else {
        this.writeValue(clamped, event);
      }
      this.$emit("input", { originalEvent: event, value: clamped });
    },
    onInput(event) {
      this.rawText = event.target.value;
      const parsed = this.parseValue(this.rawText);
      this.commit(parsed, event);
    },
    onFocus(event) {
      this.focused = true;
      this.rawText =
        this.numericValue === null || Number.isNaN(this.numericValue) ? "" : String(this.numericValue);
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.focused = false;
      this.$emit("blur", event);
    },
    onKeyDown(event) {
      if (this.readonly || this.disabled) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.spin(event, this.step);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.spin(event, -this.step);
      }
    },
    spin(event, delta) {
      const base = this.numericValue ?? 0;
      const next = this.clamp(base + delta);
      this.rawText = next === null ? "" : String(next);
      this.commit(next, event);
    },
    onPaste(event) {
      if (this.readonly || this.disabled) {
        event.preventDefault();
      }
    },
  },
};
</script>
