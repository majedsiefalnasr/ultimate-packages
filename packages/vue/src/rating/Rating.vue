<template>
  <div
    :class="cx('root', { readonly, disabled })"
    role="group"
    :aria-labelledby="ariaLabelledby"
    :data-p="dataP"
    v-bind="ptmi('root')"
  >
    <div
      v-for="value in stars"
      :key="value"
      :class="cx('option', optionParams(value))"
      :data-p-active="value <= current"
      :data-p-focused="value === focusedOptionIndex"
      v-bind="getPTOptions('option', value)"
      @click="onOptionClick($event, value)"
    >
      <span
        class="u-hidden-accessible"
        :data-p-hidden-accessible="true"
        v-bind="ptm('hiddenOptionInputContainer')"
      >
        <input
          type="radio"
          :value="value"
          :name="namex"
          :checked="current === value"
          :disabled="disabled"
          :readonly="readonly"
          :aria-label="starAriaLabel(value)"
          :aria-invalid="invalid || undefined"
          v-bind="ptm('hiddenOptionInput')"
          @focus="onFocus($event, value)"
          @blur="onBlur"
          @change="onChange($event, value)"
        />
      </span>
      <slot
        v-if="value <= current"
        name="onicon"
        :value="value"
        :class="cx('onIcon', iconParams)"
        :toggleCallback="(event) => onChange(event, value)"
      >
        <span v-if="onIcon" :class="[cx('onIcon', iconParams), onIcon]" v-bind="ptm('onIcon')" />
        <svg
          v-else
          :class="cx('onIcon', iconParams)"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          v-bind="ptm('onIcon')"
        >
          <path :d="starFillPath" fill="currentColor" />
        </svg>
      </slot>
      <slot
        v-else
        name="officon"
        :value="value"
        :class="cx('offIcon', iconParams)"
        :toggleCallback="(event) => onChange(event, value)"
      >
        <span
          v-if="offIcon"
          :class="[cx('offIcon', iconParams), offIcon]"
          v-bind="ptm('offIcon')"
        />
        <svg
          v-else
          :class="cx('offIcon', iconParams)"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          v-bind="ptm('offIcon')"
        >
          <path :d="starPath" fill="currentColor" />
        </svg>
      </slot>
    </div>
  </div>
</template>

<script>
import { cn } from "@ultimate/uix-utils/classnames";
import { uuid } from "@ultimate/uix-utils/uuid";
import { createBaseRating } from "./BaseRating";
import { RATING_STAR_FILL_PATH, RATING_STAR_PATH } from "./rating-icons";

// Adapted from PrimeVue's Rating (.vendor-extracted/vue/rating/Rating.vue):
// a flat row of star options, each a visually hidden native radio plus an on
// or off icon (the `onicon` and `officon` slots, or the `onIcon`/`offIcon`
// class props, replace the default star).
//
// Keyboard use is the native radio group, as in PrimeVue: the arrow keys move
// to the next or previous star and select it, Space selects the focused star.
// Every radio shares `name` or a generated group name. A native change only
// ever selects; PrimeVue's clearing when the changed star is the focused one
// is not ported, because arrowing focuses the star before its change fires.
// Clicking the selected star with a pointer clears the value, and a click
// moves focus to the star's radio. The focus ring shows only for keyboard
// focus (PrimeVue reads `sourceCapabilities`, which only Chromium has).
//
// `focus` and `blur` emit the native events; `rate` emits the event with the
// new value. `pt`, `unstyled` and `dt` come from the base chain, and
// `inheritAttrs` is off because `ptmi('root')` places the attributes on the
// root. The star labels stay English: there is no core locale surface.
export default {
  name: "URating",
  extends: createBaseRating(),
  inheritAttrs: false,
  emits: ["rate", "focus", "blur"],
  data() {
    return {
      focusedOptionIndex: -1,
      isFocusVisibleItem: true,
      focusFromPointer: false,
      generatedName: `${uuid("u_id_")}_name`,
      starPath: RATING_STAR_PATH,
      starFillPath: RATING_STAR_FILL_PATH,
    };
  },
  computed: {
    current() {
      return typeof this.dValue === "number" ? this.dValue : 0;
    },
    editable() {
      return !this.readonly && !this.disabled;
    },
    namex() {
      return this.name || this.generatedName;
    },
    iconParams() {
      return { invalid: this.invalid };
    },
    dataP() {
      return cn({ readonly: this.readonly, disabled: this.disabled });
    },
  },
  methods: {
    optionParams(value) {
      return {
        active: value <= this.current,
        focusVisible: value === this.focusedOptionIndex && this.isFocusVisibleItem,
      };
    },
    getPTOptions(key, value) {
      return this.ptm(key, {
        context: {
          active: value <= this.current,
          focused: value === this.focusedOptionIndex,
        },
      });
    },
    starAriaLabel(value) {
      return value === 1 ? "1 star" : `${value} stars`;
    },
    onOptionClick(event, value) {
      if (!this.editable || event.target?.tagName === "INPUT") return;
      this.select(event, value === this.current ? null : value);
      const radio = event.currentTarget.querySelector("input:not([disabled])");
      this.focusFromPointer = true;
      radio?.focus();
      this.focusFromPointer = false;
      this.isFocusVisibleItem = false;
    },
    onChange(event, value) {
      if (!this.editable) {
        this.syncRadios();
        return;
      }
      this.select(event, value);
      this.isFocusVisibleItem = true;
    },
    onFocus(event, value) {
      if (!this.editable) return;
      this.focusedOptionIndex = value;
      this.isFocusVisibleItem = !this.focusFromPointer;
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.focusedOptionIndex = -1;
      this.$emit("blur", event);
    },
    select(event, value) {
      this.focusedOptionIndex = value === null ? -1 : value;
      this.writeValue(value, event);
      this.$emit("rate", { originalEvent: event, value });
    },
    syncRadios() {
      const radios = this.$el.querySelectorAll("input[type=radio]");
      radios.forEach((radio, index) => {
        radio.checked = index + 1 === this.current;
      });
    },
  },
};
</script>
