<template>
  <nav :class="cx('root')">
    <ol :class="cx('list')" @keydown="onKeydown">
      <template v-for="(item, index) in model" :key="(item.label || '') + index">
        <li
          v-if="isVisible(item)"
          :class="cx('item', { active: isActive(index), disabled: isItemDisabled(item, index) })"
          :aria-current="isActive(index) ? 'step' : undefined"
        >
          <a
            :href="item.url || '#'"
            :class="cx('itemLink')"
            :tabindex="isItemDisabled(item, index) ? -1 : 0"
            :aria-disabled="isItemDisabled(item, index)"
            @click="onItemClick($event, item, index)"
          >
            <span :class="cx('itemNumber')">{{ index + 1 }}</span>
            <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
          </a>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Steps` component (see
// `.vendor-extracted/vue/steps/Steps.vue`). Renders a linear, read-only-
// by-default step *indicator* for a wizard workflow — distinct from
// `UStepper`, which is an interactive, content-switching component.
//
// Real PrimeVue's `Steps` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component driven by a
// flat `model` array and an `activeStep`, not a composition of `Menu`.
//
// `d_activeStep` is derived directly from `this.activeStep` (the prop),
// matching the same "derive independently from props, not from a parent
// tier's `data()`" pattern this task's other Vue components follow.
import { createBaseSteps } from "./BaseSteps";

export default {
  name: "USteps",
  extends: createBaseSteps(),
  inheritAttrs: false,
  emits: ["select"],
  data() {
    return {
      d_activeStep: this.activeStep,
    };
  },
  watch: {
    activeStep(newValue) {
      this.d_activeStep = newValue;
    },
  },
  methods: {
    isVisible(item) {
      return item.visible !== false;
    },
    isActive(index) {
      return index === this.d_activeStep;
    },
    isItemDisabled(item, index) {
      return !!item.disabled || (this.readonly && index !== this.d_activeStep);
    },
    onKeydown(event) {
      const links = Array.from(this.$el.querySelectorAll("a"));
      if (links.length === 0) return;
      const isEnabled = (index) => !this.isItemDisabled(this.model[index], index);
      const currentIndex = links.indexOf(document.activeElement);

      let targetIndex;
      switch (event.code) {
        case "ArrowRight":
          for (let i = currentIndex + 1; i < links.length; i++) {
            if (isEnabled(i)) {
              targetIndex = i;
              break;
            }
          }
          break;
        case "ArrowLeft":
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (isEnabled(i)) {
              targetIndex = i;
              break;
            }
          }
          break;
        case "Home":
          targetIndex = links.findIndex((_, i) => isEnabled(i));
          break;
        case "End":
          for (let i = links.length - 1; i >= 0; i--) {
            if (isEnabled(i)) {
              targetIndex = i;
              break;
            }
          }
          break;
        default:
          return;
      }

      event.preventDefault();
      if (targetIndex !== undefined && targetIndex >= 0) {
        links[targetIndex].focus();
      }
    },
    onItemClick(event, item, index) {
      if (this.readonly || item.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit("select", { originalEvent: event, item, index });
      if (item.command) item.command({ originalEvent: event, item, index });
      if (!item.url) {
        event.preventDefault();
      }
    },
  },
};
</script>
