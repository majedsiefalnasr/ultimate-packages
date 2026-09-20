<template>
  <div :class="cx('root', { disabled })">
    <div v-if="filter" :class="cx('header')">
      <input
        type="text"
        role="searchbox"
        autocomplete="off"
        :class="cx('pcFilter')"
        :value="filterValue"
        :placeholder="filterPlaceholder"
        @input="onFilterInputChange"
      />
    </div>
    <div :class="cx('listContainer')">
      <ul
        :class="cx('list')"
        role="listbox"
        :aria-multiselectable="multiple"
        :aria-label="ariaLabel"
        :tabindex="disabled ? -1 : 0"
        @keydown="onKeyDown"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <li
          v-for="(option, index) in visibleOptions"
          :key="index"
          role="option"
          :aria-selected="isSelected(option)"
          :aria-disabled="isOptionDisabled(option)"
          :class="cx('option', { focused: focusedIndex === index, selected: isSelected(option), disabled: isOptionDisabled(option) })"
          @click="onOptionSelect($event, option)"
          @mouseenter="!isOptionDisabled(option) && (focusedIndex = index)"
        >
          <input v-if="multiple" type="checkbox" :checked="isSelected(option)" :disabled="isOptionDisabled(option)" tabindex="-1" readonly />
          <span>{{ getOptionLabel(option) }}</span>
        </li>
        <li v-if="visibleOptions.length === 0" :class="cx('emptyMessage')" role="option">
          {{ emptyMessage }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { createBaseListbox } from "./BaseListbox";

// Real PrimeVue Listbox (.vendor-extracted/vue/listbox/Listbox.vue) renders
// an always-visible role="listbox" list directly (optional filter header,
// an options list, no panel/dropdown/trigger) — confirmed real source has
// no Portal/Teleport import at all, unlike Select/MultiSelect (this batch's
// overlay-based siblings). This port follows USelectButton's established
// "no overlay composition" precedent for the same reason.
//
// Supports single-select (multiple=false, default — dValue is the selected
// option's value or null) and multi-select (multiple=true — dValue is an
// array), matching real source's own isSelected/onOptionSelect multiple
// branch.
//
// Deliberately excludes real source's much larger surface: grouped
// options, virtual scrolling, drag reordering, range selection
// (Shift-click), slot templates, passthrough — matching every sibling
// component's established "smaller surface than upstream" precedent.
export default {
  name: "UListbox",
  extends: createBaseListbox(),
  emits: ["change", "focus", "blur"],
  data() {
    return {
      focusedIndex: -1,
      filterValue: "",
    };
  },
  computed: {
    visibleOptions() {
      const query = this.filterValue.trim().toLowerCase();
      if (!query) return this.options;
      return this.options.filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
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
      const optionValue = this.getOptionValue(option);
      if (this.multiple) {
        return Array.isArray(this.dValue) && this.dValue.includes(optionValue);
      }
      return this.dValue === optionValue;
    },
    onFilterInputChange(event) {
      this.filterValue = event.target.value;
      this.focusedIndex = -1;
    },
    onKeyDown(event) {
      if (this.disabled) return;
      switch (event.code) {
        case "ArrowDown":
          this.moveFocus(1);
          event.preventDefault();
          break;
        case "ArrowUp":
          this.moveFocus(-1);
          event.preventDefault();
          break;
        case "Home":
          this.focusedIndex = 0;
          event.preventDefault();
          break;
        case "End":
          this.focusedIndex = this.visibleOptions.length - 1;
          event.preventDefault();
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          if (this.focusedIndex !== -1 && this.visibleOptions[this.focusedIndex] !== undefined) {
            this.onOptionSelect(event, this.visibleOptions[this.focusedIndex]);
          }
          event.preventDefault();
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
    onOptionSelect(event, option) {
      if (this.isOptionDisabled(option)) return;
      const optionValue = this.getOptionValue(option);
      let newValue;
      if (this.multiple) {
        const current = Array.isArray(this.dValue) ? this.dValue : [];
        newValue = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
      } else {
        newValue = optionValue;
      }
      this.writeValue(newValue, event);
      this.$emit("change", { originalEvent: event, value: newValue });
    },
  },
};
</script>
