<template>
  <div :class="cx('root', styleParams)">
    <span
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="overlayVisible"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      :class="cx('label', { placeholder: selectedValues.length === 0 })"
      @click="onContainerClick"
      @keydown="onKeyDown"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      {{ label }}
    </span>
    <span v-if="isVisibleClearIcon" :class="cx('clearIcon')" aria-hidden="true" @click="clear">&times;</span>
    <div :class="cx('dropdown')" role="button" aria-hidden="true" @click="onContainerClick">
      <span aria-hidden="true">&#9662;</span>
    </div>
    <UPortal v-if="overlayVisible" :appendTo="appendTo">
      <div :class="cx('overlay')">
        <div :class="cx('header')" @click.stop>
          <input
            v-if="showToggleAll"
            type="checkbox"
            aria-label="Select All"
            :checked="allSelected"
            @change="toggleAll"
          />
          <input
            v-if="filter"
            ref="filterInput"
            type="text"
            role="searchbox"
            autocomplete="off"
            :class="cx('pcFilter')"
            :value="filterValue"
            :placeholder="filterPlaceholder"
            @input="onFilterInputChange"
            @click.stop
          />
        </div>
        <div :class="cx('listContainer')">
          <ul :class="cx('list')" role="listbox" aria-multiselectable="true">
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
              <input type="checkbox" :checked="isSelected(option)" :disabled="isOptionDisabled(option)" tabindex="-1" readonly />
              <span>{{ getOptionLabel(option) }}</span>
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
import { createBaseMultiSelect } from "./BaseMultiSelect";

// Real PrimeVue MultiSelect (.vendor-extracted/vue/multiselect/MultiSelect.vue)
// renders a trigger (label + dropdown icon) plus a filterable,
// checkbox-per-option panel with a "select all" header checkbox — this port
// composes UPortal the same way USelect does, matching real source's own
// shape. Unlike USelect, selecting an option does NOT close the overlay,
// matching real source's own onOptionSelect (never calls hide()).
//
// dValue is array-valued, matching real source's own array-valued model.
//
// Deliberately excludes real source's much larger surface: grouped options,
// virtual scrolling, chip-display mode, range selection (Shift-click),
// selectionLimit, slot templates, passthrough — matching every sibling
// component's established "smaller surface than upstream" precedent.
export default {
  name: "UMultiSelect",
  extends: createBaseMultiSelect(),
  emits: ["change", "focus", "blur", "select-all-change", "clear"],
  components: { UPortal },
  data() {
    return {
      overlayVisible: false,
      focusedIndex: -1,
      filterValue: "",
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
    selectedValues() {
      return Array.isArray(this.dValue) ? this.dValue : [];
    },
    visibleOptions() {
      const query = this.filterValue.trim().toLowerCase();
      if (!query) return this.options;
      return this.options.filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
    },
    allSelected() {
      const selectable = this.visibleOptions.filter((option) => !this.isOptionDisabled(option));
      return selectable.length > 0 && selectable.every((option) => this.isSelected(option));
    },
    label() {
      const selected = this.selectedValues;
      if (selected.length === 0) return this.placeholder;
      if (selected.length > this.maxSelectedLabels) {
        return this.selectedItemsLabel.replace("{0}", String(selected.length));
      }
      return selected
        .map((value) => {
          const option = this.options.find((o) => this.getOptionValue(o) === value);
          return option !== undefined ? this.getOptionLabel(option) : String(value);
        })
        .join(", ");
    },
    isVisibleClearIcon() {
      return this.showClear && this.selectedValues.length > 0 && !this.disabled;
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
      return this.selectedValues.includes(this.getOptionValue(option));
    },
    onContainerClick(event) {
      if (this.disabled) return;
      this.overlayVisible ? this.hide() : this.show();
      event.stopPropagation();
    },
    show() {
      if (this.disabled) return;
      this.overlayVisible = true;
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
      const optionValue = this.getOptionValue(option);
      const current = this.selectedValues;
      const newValue = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      this.writeValue(newValue, event);
      this.$emit("change", { originalEvent: event, value: newValue });
    },
    toggleAll() {
      const selectable = this.visibleOptions.filter((option) => !this.isOptionDisabled(option));
      const newValue = this.allSelected
        ? this.selectedValues.filter((v) => !selectable.some((option) => this.getOptionValue(option) === v))
        : [
            ...this.selectedValues,
            ...selectable.map((option) => this.getOptionValue(option)).filter((v) => !this.selectedValues.includes(v)),
          ];
      this.writeValue(newValue);
      this.$emit("select-all-change", { value: newValue });
    },
    clear(event) {
      event.stopPropagation();
      this.writeValue([], event);
      this.$emit("clear");
    },
  },
};
</script>
