<template>
  <div :class="cx('root', { disabled })" role="group" :aria-labelledby="ariaLabelledby">
    <div
      v-for="star in stars"
      :key="star"
      :class="cx('option', { focused: focusedIndex === star })"
      tabindex="-1"
    >
      <span class="p-hidden-accessible">
        <input
          type="radio"
          :value="star"
          :name="name"
          :disabled="disabled"
          :readonly="readonly"
          :checked="dValue === star"
          :aria-label="starAriaLabel(star)"
          @focus="onInputFocus(star)"
          @blur="onInputBlur"
          @change="onOptionSelect($event, star)"
          @keydown="onStarKeyDown($event, star)"
        />
      </span>
      <svg
        v-if="dValue !== null && dValue !== undefined && star <= dValue"
        :class="cx('onIcon')"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          d="M8 1l2.163 4.279 4.837.626-3.5 3.279.882 4.816L8 11.7l-4.382 2.3.882-4.816-3.5-3.279 4.837-.626z"
        />
      </svg>
      <svg v-else :class="cx('offIcon')" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1l2.163 4.279 4.837.626-3.5 3.279.882 4.816L8 11.7l-4.382 2.3.882-4.816-3.5-3.279 4.837-.626z"
          fill="none"
          stroke="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { createBaseRating } from "./BaseRating";

// Real PrimeVue Rating (.vendor-extracted/vue/rating/Rating.vue) renders a
// flat row of star options, each a hidden radio input plus an on/off SVG
// icon — NOT overlay-based, no panel/dropdown. This port matches that shape
// directly (no sibling composition needed, unlike SelectButton).
//
// Keyboard stepping matches real PrimeReact's own onStarKeyDown (real
// PrimeVue source has no equivalent handler, relying on native radio-group
// arrow behavior) — this batch's task requires explicit keyboard arrow-key
// stepping for Rating, so this port adds the same stepping the React
// realization in this same batch establishes.
export default {
  name: "URating",
  extends: createBaseRating(),
  emits: ["rate", "focus", "blur"],
  data() {
    // Base tier's own data() (createBaseEditableHolder) initializes dValue
    // independently of this child's own data() — same corrected pattern
    // documented in Select.vue's own data(). focusedIndex is independent of
    // dValue, so no derivation pitfall applies here, but this comment
    // documents the same known pitfall was checked.
    return {
      focusedIndex: -1,
    };
  },
  methods: {
    starAriaLabel(value) {
      return value === 1 ? "1 star" : `${value} stars`;
    },
    onOptionSelect(event, value) {
      if (this.readonly || this.disabled) return;
      const newValue = this.dValue === value ? null : value;
      this.focusedIndex = newValue === null ? -1 : value;
      this.writeValue(newValue, event);
      this.$emit("rate", { originalEvent: event, value: newValue });
    },
    onInputFocus(value) {
      if (this.readonly || this.disabled) return;
      this.focusedIndex = value;
      this.$emit("focus", new FocusEvent("focus"));
    },
    onInputBlur() {
      this.focusedIndex = -1;
      this.$emit("blur", new FocusEvent("blur"));
    },
    onStarKeyDown(event, value) {
      if (this.readonly || this.disabled) return;
      switch (event.key) {
        case "Enter":
        case " ":
          this.onOptionSelect(event, value);
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "ArrowUp": {
          event.preventDefault();
          const prev = this.dValue ? this.dValue - 1 : this.stars;
          this.onOptionSelect(event, prev < 1 ? this.stars : prev);
          break;
        }
        case "ArrowRight":
        case "ArrowDown": {
          event.preventDefault();
          const next = this.dValue ? this.dValue + 1 : 1;
          this.onOptionSelect(event, next > this.stars ? 1 : next);
          break;
        }
        default:
          break;
      }
    },
  },
};
</script>
