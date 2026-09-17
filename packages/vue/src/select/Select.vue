<template>
  <div :class="cx('root', styleParams)">
    <span
      role="combobox"
      :id="inputId"
      :aria-label="ariaLabel || label"
      aria-haspopup="listbox"
      :aria-expanded="overlayVisible"
      :aria-disabled="disabled"
      :aria-activedescendant="focusedIndex !== -1 ? uid + '_option_' + focusedIndex : undefined"
      :tabindex="disabled ? -1 : 0"
      :class="cx('label', { placeholder: selectedOption === undefined })"
      @click="onContainerClick"
      @keydown="onKeyDown"
      @focus="$emit('focus', $event)"
      @blur="onBlur"
    >
      {{ label === undefined ? ' ' : label }}
    </span>
    <span v-if="isVisibleClearIcon" :class="cx('clearIcon')" aria-hidden="true" @click="clear">&times;</span>
    <div :class="cx('dropdown')" role="button" aria-hidden="true" @click="onContainerClick">
      <span aria-hidden="true">&#9662;</span>
    </div>
    <UPortal v-if="overlayVisible" :appendTo="appendTo">
      <div :class="cx('overlay')">
        <div v-if="filter" :class="cx('header')" @click.stop>
          <input
            ref="filterInput"
            type="text"
            role="searchbox"
            autocomplete="off"
            :class="cx('pcFilter')"
            :value="filterValue"
            :placeholder="filterPlaceholder"
            :aria-label="ariaFilterLabel"
            @input="onFilterInputChange"
            @keydown="onFilterKeyDown"
            @click.stop
          />
        </div>
        <div :class="cx('listContainer')">
          <ul :class="cx('list')" role="listbox" :id="uid + '_list'">
            <li
              v-for="(option, index) in visibleOptions"
              :key="index"
              :id="uid + '_option_' + index"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="isOptionDisabled(option)"
              :class="cx('option', { focused: focusedIndex === index, selected: isSelected(option), disabled: isOptionDisabled(option) })"
              @click="onOptionSelect($event, option)"
              @mouseenter="!isOptionDisabled(option) && (focusedIndex = index)"
            >
              {{ getOptionLabel(option) }}
            </li>
            <li v-if="visibleOptions.length === 0" :class="cx('emptyMessage')" role="option">
              {{ emptyMessage }}
            </li>
          </ul>
        </div>
      </div>
    </UPortal>
  </div>
</template>

<script>
import { Portal as UPortal } from "@ultimate/vue-core";
import { createBaseSelect } from "./BaseSelect";

let instanceCount = 0;

// Real PrimeVue Select (.vendor-extracted/vue/select/Select.vue) renders a
// trigger (label span + dropdown icon) plus a filterable option-list panel
// opened on click — this port composes UPortal the same way UAutoComplete
// does (packages/vue/src/autocomplete/AutoComplete.vue), matching real
// source's own "trigger + overlay panel with optional filter input + option
// list" shape.
//
// Deliberately excludes real source's much larger surface: grouped options,
// virtual scrolling, editable free-text mode, checkmark variant, slot
// templates, passthrough — matching every sibling component's established
// "smaller surface than upstream" precedent (same boundary UAutoComplete
// already drew for this same capability family).
export default {
  name: "USelect",
  extends: createBaseSelect(),
  emits: ["change", "focus", "blur", "select", "clear"],
  components: { UPortal },
  data() {
    return {
      // Base tier's own data() (createBaseEditableHolder) initializes
      // dValue independently of this child's own data() — same corrected
      // pattern documented in AutoComplete.vue's own data(). No derived
      // initial value is needed here (overlayVisible/focusedIndex/
      // filterValue are all independent of dValue), but this comment
      // documents the same known pitfall was checked.
      overlayVisible: false,
      focusedIndex: -1,
      filterValue: "",
      uid: `u_select_${++instanceCount}`,
    };
  },
  computed: {
    styleParams() {
      return {
        disabled: this.disabled,
        filled: this.filled,
        fluid: this.resolvedFluid,
        overlayVisible: this.overlayVisible,
      };
    },
    selectedOption() {
      return this.options.find((option) => this.getOptionValue(option) === this.dValue);
    },
    label() {
      const selected = this.selectedOption;
      if (selected !== undefined) return this.getOptionLabel(selected);
      return this.placeholder;
    },
    visibleOptions() {
      const query = this.filterValue.trim().toLowerCase();
      if (!query) return this.options;
      return this.options.filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
    },
    isVisibleClearIcon() {
      return this.showClear && this.filled && !this.disabled;
    },
  },
  methods: {
    getOptionLabel(option) {
      if (typeof this.optionLabel === "function") return this.optionLabel(option);
      if (typeof this.optionLabel === "string" && typeof option === "object" && option !== null) {
        return String(option[this.optionLabel] ?? "");
      }
      return String(option);
    },
    getOptionValue(option) {
      if (typeof this.optionValue === "function") return this.optionValue(option);
      if (typeof this.optionValue === "string" && typeof option === "object" && option !== null) {
        return option[this.optionValue];
      }
      return option;
    },
    isOptionDisabled(option) {
      if (typeof this.optionDisabled === "function") return this.optionDisabled(option);
      if (typeof this.optionDisabled === "string" && typeof option === "object" && option !== null) {
        return !!option[this.optionDisabled];
      }
      return false;
    },
    isSelected(option) {
      return this.dValue === this.getOptionValue(option);
    },
    onContainerClick(event) {
      if (this.disabled) return;
      this.overlayVisible ? this.hide() : this.show();
      event.stopPropagation();
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
    show() {
      if (this.disabled) return;
      this.overlayVisible = true;
      this.focusedIndex = this.visibleOptions.findIndex((option) => this.isSelected(option));
    },
    hide() {
      this.overlayVisible = false;
      this.focusedIndex = -1;
      this.filterValue = "";
    },
    onFilterInputChange(event) {
      this.filterValue = event.target.value;
      this.focusedIndex = -1;
    },
    onFilterKeyDown(event) {
      switch (event.code) {
        case "ArrowDown":
          this.moveFocus(1);
          event.preventDefault();
          break;
        case "ArrowUp":
          this.moveFocus(-1);
          event.preventDefault();
          break;
        case "Enter":
        case "NumpadEnter":
          this.selectFocused(event);
          event.preventDefault();
          break;
        case "Escape":
          this.hide();
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    onKeyDown(event) {
      if (this.disabled) return;
      switch (event.code) {
        case "ArrowDown":
          this.overlayVisible ? this.moveFocus(1) : this.show();
          event.preventDefault();
          break;
        case "ArrowUp":
          this.overlayVisible ? this.moveFocus(-1) : this.show();
          event.preventDefault();
          break;
        case "Home":
          if (this.overlayVisible) {
            this.focusedIndex = 0;
            event.preventDefault();
          }
          break;
        case "End":
          if (this.overlayVisible) {
            this.focusedIndex = this.visibleOptions.length - 1;
            event.preventDefault();
          }
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.overlayVisible ? this.selectFocused(event) : this.show();
          event.preventDefault();
          break;
        case "Escape":
          if (this.overlayVisible) {
            this.hide();
            event.preventDefault();
          }
          break;
        case "Tab":
          this.hide();
          break;
        default:
          break;
      }
    },
    moveFocus(delta) {
      const options = this.visibleOptions;
      if (options.length === 0) return;
      let next = this.focusedIndex;
      do {
        next = (next + delta + options.length) % options.length;
      } while (this.isOptionDisabled(options[next]) && next !== this.focusedIndex);
      this.focusedIndex = next;
    },
    selectFocused(event) {
      if (this.focusedIndex !== -1 && this.visibleOptions[this.focusedIndex] !== undefined) {
        this.onOptionSelect(event, this.visibleOptions[this.focusedIndex]);
      }
    },
    onOptionSelect(event, option) {
      if (this.isOptionDisabled(option)) return;
      const value = this.getOptionValue(option);
      this.writeValue(value, event);
      this.$emit("select", { originalEvent: event, value });
      this.hide();
    },
    clear(event) {
      event.stopPropagation();
      this.writeValue(null, event);
      this.$emit("clear");
    },
  },
};
</script>
