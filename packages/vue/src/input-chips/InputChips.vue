<template>
  <div :class="cx('root', styleParams)">
    <ul
      ref="container"
      :class="cx('input')"
      tabindex="-1"
      role="listbox"
      aria-orientation="horizontal"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      @click="onWrapperClick"
      @focus="onContainerFocus"
      @blur="onContainerBlur"
      @keydown="onContainerKeyDown"
    >
      <li
        v-for="(token, index) of modelValue || []"
        :key="`${index}_${token}`"
        role="option"
        :class="cx('chipItem', { focused: focusedIndex === index })"
        :aria-label="token"
        aria-selected="true"
      >
        <span>{{ token }}</span>
        <button
          v-if="!disabled"
          type="button"
          :class="cx('chipIcon')"
          :aria-label="`Remove ${token}`"
          @click="removeItem($event, index)"
        >
          &times;
        </button>
      </li>
      <li :class="cx('inputItem')">
        <input
          ref="input"
          :id="inputId"
          type="text"
          :disabled="disabled || maxedOut"
          :placeholder="placeholder"
          :aria-invalid="invalid || undefined"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
          @keydown="onKeyDown"
          @paste="onPaste"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { createBaseInputChips } from "./BaseInputChips";

// Rendering shape adapted from the real extracted InputChips.vue (primevue
// root, inputchips/InputChips.vue): a root <div> wrapping a <ul role=
// "listbox"> of tag <li role="option"> tokens plus a trailing text-input
// <li>. Deliberately renders each tag's markup inline (a <span> label + a
// remove <button>) rather than depending on a <Chip> sub-component: no
// UChip exists yet in this package (unlike real source, which does render
// a real <Chip removable> for each token) — matching this batch's
// established "smaller surface than upstream, no forced new dependency on
// an unbuilt sibling component" convention.
//
// TIER FINDING: extends createBaseInputChips() -> createBaseComponent()
// directly (see BaseInputChips.ts's own doc comment) — real source's own
// modelValue/update:modelValue wiring is implemented manually here, not
// through writeValue()/dValue (the editable-holder tier real source does
// NOT use for this component).
export default {
  name: "UInputChips",
  extends: createBaseInputChips(),
  inheritAttrs: false,
  emits: ["update:modelValue", "add", "remove", "focus", "blur"],
  data() {
    return {
      inputValue: "",
      focused: false,
      focusedIndex: null,
    };
  },
  computed: {
    maxedOut() {
      return this.max && this.modelValue && this.max === this.modelValue.length;
    },
    isFilled() {
      return (this.modelValue && this.modelValue.length > 0) || this.inputValue.length > 0;
    },
    styleParams() {
      return { disabled: this.disabled, invalid: this.invalid, focused: this.focused, filled: this.isFilled };
    },
  },
  methods: {
    onWrapperClick() {
      this.$refs.input.focus();
    },
    onInput(event) {
      this.inputValue = event.target.value;
      this.focusedIndex = null;
    },
    onFocus(event) {
      this.focused = true;
      this.focusedIndex = null;
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.focused = false;
      this.focusedIndex = null;

      if (this.addOnBlur) {
        this.addItem(event, event.target.value, false);
      }

      this.$emit("blur", event);
    },
    onKeyDown(event) {
      const inputValue = event.target.value;

      switch (event.code) {
        case "Backspace":
          if (inputValue.length === 0 && this.modelValue && this.modelValue.length > 0) {
            if (this.focusedIndex !== null) {
              this.removeItem(event, this.focusedIndex);
            } else {
              this.removeItem(event, this.modelValue.length - 1);
            }
          }
          break;

        case "Enter":
        case "NumpadEnter":
          if (inputValue && inputValue.trim().length && !this.maxedOut) {
            this.addItem(event, inputValue, true);
          }
          break;

        case "ArrowLeft":
          if (inputValue.length === 0 && this.modelValue && this.modelValue.length > 0) {
            this.$refs.container.focus();
          }
          break;

        case "ArrowRight":
          event.stopPropagation();
          break;

        default:
          if (this.separator && event.key === this.separator) {
            if (inputValue && inputValue.trim().length && !this.maxedOut) {
              this.addItem(event, inputValue, true);
            }
            event.preventDefault();
          }
          break;
      }
    },
    onPaste(event) {
      if (!this.separator) return;

      const separator = this.separator.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t");
      const pastedData = (event.clipboardData || window.clipboardData).getData("Text");

      if (pastedData) {
        let value = this.modelValue || [];
        let pastedValues = pastedData.split(separator);
        pastedValues = pastedValues.filter(
          (val) => (this.allowDuplicate || value.indexOf(val) === -1) && val.trim().length
        );
        value = [...value, ...pastedValues];
        this.updateModel(event, value, true);
      }
    },
    onContainerFocus() {
      this.focused = true;
    },
    onContainerBlur() {
      this.focusedIndex = -1;
      this.focused = false;
    },
    onContainerKeyDown(event) {
      switch (event.code) {
        case "ArrowLeft":
          this.onArrowLeftKeyOn();
          break;
        case "ArrowRight":
          this.onArrowRightKeyOn();
          break;
        case "Backspace":
          this.onBackspaceKeyOn(event);
          break;
        default:
          break;
      }
    },
    onArrowLeftKeyOn() {
      if (this.inputValue.length === 0 && this.modelValue && this.modelValue.length > 0) {
        this.focusedIndex = this.focusedIndex === null ? this.modelValue.length - 1 : this.focusedIndex - 1;
        if (this.focusedIndex < 0) this.focusedIndex = 0;
      }
    },
    onArrowRightKeyOn() {
      if (this.inputValue.length === 0 && this.modelValue && this.modelValue.length > 0) {
        if (this.focusedIndex === this.modelValue.length - 1) {
          this.focusedIndex = null;
          this.$refs.input.focus();
        } else if (this.focusedIndex !== null) {
          this.focusedIndex++;
        }
      }
    },
    onBackspaceKeyOn(event) {
      if (this.focusedIndex !== null) {
        this.removeItem(event, this.focusedIndex);
      }
    },
    updateModel(event, value, preventDefault) {
      this.$emit("update:modelValue", value);
      this.$emit("add", { originalEvent: event, value });
      this.$refs.input.value = "";
      this.inputValue = "";

      if (preventDefault) {
        event.preventDefault();
      }
    },
    addItem(event, item, preventDefault) {
      const trimmed = item && item.trim();
      if (!trimmed) return;

      const value = this.modelValue ? [...this.modelValue] : [];
      if (this.allowDuplicate || value.indexOf(trimmed) === -1) {
        value.push(trimmed);
        this.updateModel(event, value, preventDefault);
      }
    },
    removeItem(event, index) {
      if (this.disabled) return;

      const values = [...this.modelValue];
      const removedItem = values.splice(index, 1)[0];

      this.focusedIndex = null;
      this.$refs.input.focus();
      this.$emit("update:modelValue", values);
      this.$emit("remove", { originalEvent: event, value: removedItem });
    },
  },
};
</script>
