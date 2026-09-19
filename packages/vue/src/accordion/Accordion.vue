<template>
  <div :class="cx('root')">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Accordion` component (see
// .vendor-extracted/vue/accordion/Accordion.vue). Container/state-owner
// for the Accordion family — provides `$pcAccordion: this` so descendant
// family members (`UAccordionPanel` -> `UAccordionHeader`/
// `UAccordionContent`) can `inject` the active `value` and related
// settings, matching real PrimeVue's own `provide() { return { $pcAccordion:
// this } }` mechanism (verified against real BaseAccordion.vue) — the same
// provide/inject wiring already proven by this package's own `UTabs`
// family (packages/vue/src/tabs/Tabs.vue). Built container-first, ahead of
// `UAccordionPanel`/`UAccordionHeader`/`UAccordionContent`, per this
// capability's own within-family container-first ordering convention.
//
// `d_value` is derived directly from `this.value` (the `value` prop),
// independently of any parent tier's own `data()` — per the documented
// Vue multi-tier-`data()` pitfall, `this.value` (the prop) is always
// safely readable here since props resolve before `data()` runs.
import { createBaseAccordion } from "./BaseAccordion";

export default {
  name: "UAccordion",
  extends: createBaseAccordion(),
  inheritAttrs: false,
  emits: ["update:value", "tab-open", "tab-close"],
  data() {
    return {
      d_value: this.value,
    };
  },
  provide() {
    return {
      $pcAccordion: this,
    };
  },
  watch: {
    value(newValue) {
      this.d_value = newValue;
    },
  },
  methods: {
    isItemActive(value) {
      return this.multiple ? Array.isArray(this.d_value) && this.d_value.includes(value) : this.d_value === value;
    },
    updateValue(newValue) {
      const active = this.isItemActive(newValue);

      if (this.multiple) {
        const currentArray = Array.isArray(this.d_value) ? [...this.d_value] : [];
        if (active) {
          this.d_value = currentArray.filter((v) => v !== newValue);
        } else {
          currentArray.push(newValue);
          this.d_value = currentArray;
        }
      } else {
        this.d_value = active ? undefined : newValue;
      }

      this.$emit("update:value", this.d_value);
      this.$emit(active ? "tab-close" : "tab-open", { originalEvent: undefined, index: newValue });
    },
  },
};
</script>
