<template>
  <div :class="cx('root', styleParams)">
    <input
      ref="input"
      :id="inputId"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="overlayVisible"
      :aria-activedescendant="focusedIndex !== -1 ? uid + '_option_' + focusedIndex : undefined"
      :class="cx('pcInputText')"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @input="onInput"
      @keydown="onKeyDown"
      @focus="onFocus"
      @blur="onBlur"
    />
    <span v-if="loading" :class="cx('loader')" aria-hidden="true">&hellip;</span>
    <UPortal v-if="overlayVisible" :appendTo="appendTo">
      <ul :class="cx('list')" role="listbox" :id="uid + '_list'">
        <li
          v-for="(option, index) in suggestions"
          :key="index"
          :id="uid + '_option_' + index"
          role="option"
          :class="cx('option', { focused: focusedIndex === index, selected: isSelected(option) })"
          :aria-selected="isSelected(option)"
          @click="onOptionSelect($event, option)"
          @mouseenter="focusedIndex = index"
        >
          {{ getOptionLabel(option) }}
        </li>
        <li v-if="suggestions.length === 0 && showEmptyMessage" :class="cx('emptyMessage')" role="option">
          {{ emptyMessage }}
        </li>
      </ul>
    </UPortal>
  </div>
</template>

<script>
import { Portal as UPortal } from "@ultimate/vue-core";
import { createBaseAutoComplete } from "./BaseAutoComplete";

let instanceCount = 0;

// Real PrimeVue AutoComplete's own completeMethod/suggestions relationship
// (BaseAutoComplete.vue extends BaseInput; AutoComplete.vue emits 'complete'
// and drives an externally-populated `suggestions` prop) is kept verbatim —
// the consumer owns the async search, this component owns the
// overlay/list/keyboard-nav, matching UAutoComplete's Angular/React
// realizations in this same batch exactly. Overlay composed via UPortal
// (vue-core's Teleport wrapper), same primitive UPassword/UDialog compose.
//
// Deliberately excludes real source's much larger surface: `multiple`
// selection (chip list), grouped options, virtual scrolling, `dropdown`
// button, header/footer/item/loader slot templates, `forceSelection` — same
// "smaller surface than upstream" precedent as this batch's other two
// realizations.
export default {
  name: "UAutoComplete",
  extends: createBaseAutoComplete(),
  emits: ["change", "focus", "blur", "complete", "option-select", "clear"],
  components: { UPortal },
  data() {
    return {
      // Base tier's own data() (createBaseEditableHolder) initializes
      // `dValue` from `this.modelValue`/`this.defaultValue`, but Vue's
      // Options API `extends` merge calls each data() independently — a
      // child data() cannot see a base data()'s own return value on `this`
      // at merge time (verified empirically: `this.dValue` reads as
      // `undefined` here even when `modelValue` was passed). Deriving from
      // `this.modelValue`/`this.defaultValue` directly (the same inputs
      // `dValue` itself is seeded from) avoids depending on merge order.
      inputValue: this.getOptionLabel(this.defaultValue !== undefined ? this.defaultValue : this.modelValue),
      overlayVisible: false,
      focusedIndex: -1,
      searchTimeout: null,
      uid: `u_autocomplete_${++instanceCount}`,
    };
  },
  watch: {
    dValue(newValue) {
      this.inputValue = this.getOptionLabel(newValue);
    },
  },
  computed: {
    styleParams() {
      return {
        filled: this.filled,
        fluid: this.resolvedFluid,
        disabled: this.disabled,
      };
    },
  },
  methods: {
    getOptionLabel(option) {
      if (option == null) return "";
      if (typeof this.optionLabel === "function") return this.optionLabel(option);
      if (typeof this.optionLabel === "string" && typeof option === "object") {
        return String(option[this.optionLabel] ?? "");
      }
      return typeof option === "string" ? option : String(option);
    },
    isSelected(option) {
      return this.dValue === option;
    },
    hide() {
      this.overlayVisible = false;
      this.focusedIndex = -1;
    },
    onInput(event) {
      const query = event.target.value;
      this.inputValue = query;

      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      if (query.length === 0) {
        this.writeValue(null, event);
        this.$emit("clear");
        this.hide();
        return;
      }

      if (query.length >= this.minLength) {
        this.focusedIndex = -1;
        this.searchTimeout = setTimeout(() => {
          this.$emit("complete", { originalEvent: event, query });
          this.overlayVisible = true;
        }, this.delay);
      } else {
        this.hide();
      }
    },
    onFocus(event) {
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.hide();
      this.$emit("blur", event);
    },
    onKeyDown(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      switch (event.code) {
        case "ArrowDown":
          if (!this.overlayVisible) return;
          this.focusedIndex = this.focusedIndex + 1 >= this.suggestions.length ? 0 : this.focusedIndex + 1;
          event.preventDefault();
          break;
        case "ArrowUp":
          if (!this.overlayVisible) return;
          this.focusedIndex = this.focusedIndex <= 0 ? this.suggestions.length - 1 : this.focusedIndex - 1;
          event.preventDefault();
          break;
        case "Enter":
        case "NumpadEnter":
          if (!this.overlayVisible) return;
          if (this.focusedIndex !== -1) {
            this.onOptionSelect(event, this.suggestions[this.focusedIndex]);
          }
          event.preventDefault();
          break;
        case "Escape":
          if (this.overlayVisible) {
            this.hide();
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    },
    onOptionSelect(event, option) {
      this.writeValue(option, event);
      this.inputValue = this.getOptionLabel(option);
      this.$emit("option-select", { originalEvent: event, value: option });
      this.hide();
    },
  },
};
</script>
