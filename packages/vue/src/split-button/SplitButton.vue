<template>
  <div :class="cx('root')">
    <UButton
      :class="cx('pcButton')"
      :label="label"
      :icon="icon"
      :icon-pos="iconPos"
      :severity="severity"
      :text="text"
      :outlined="outlined"
      :size="size"
      :disabled="disabled"
      @click="onDefaultButtonClick"
    />
    <UButton
      ref="dropdownButton"
      :class="cx('pcDropdown')"
      icon="pi pi-chevron-down"
      :severity="severity"
      :text="text"
      :outlined="outlined"
      :size="size"
      :disabled="disabled"
      aria-haspopup="menu"
      @click="onDropdownButtonClick"
    />
    <UMenu ref="menu" :model="menuModel" :popup="true" @show="$emit('show')" @hide="$emit('hide')" />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `SplitButton` component (see
// `.vendor-extracted/vue/splitbutton/SplitButton.vue`). Renders a default
// command button attached to a dropdown-toggle button, which opens a
// popup `Menu` of secondary commands.
//
// Real PrimeVue's `SplitButton` composes `Button` + `TieredMenu`
// (verified this task's Step 1 — `SplitButton.vue` imports
// `primevue/tieredmenu`, not `primevue/menu`), since upstream's own
// secondary items may themselves have nested `items`. This task's binding
// instruction (implementation-plan §5, Task Group C table) is explicit:
// SplitButton "composes already-Built Button + Menu — no dependency wait
// needed, both already exist" — so this adaptation composes Ultimate's
// own already-Built `UButton` + `UMenu` (in `popup` mode) directly, not
// `UTieredMenu` (itself one of this same batch's own new capabilities,
// not the plan's stated dependency) — same binding choice this task's
// Angular `USplitButton`/React `split-button.tsx` siblings already made
// for this same capability.
//
// `UMenu` (read-only reference, already Built) exposes no event for item
// selection — it only ever invokes each item's own `command` callback
// directly. `menuModel` below wraps every item's own `command` so the
// popup closes after any item is chosen, without modifying `UMenu` itself.
import { createBaseSplitButton } from "./BaseSplitButton";
import { UButton } from "../button";
import { UMenu } from "../menu";

export default {
  name: "USplitButton",
  extends: createBaseSplitButton(),
  inheritAttrs: false,
  emits: ["click", "show", "hide"],
  components: { UButton, UMenu },
  computed: {
    menuModel() {
      return this.model.map((item) => ({
        ...item,
        command: (event) => {
          this.$refs.menu.hide();
          if (item.command) item.command(event);
        },
      }));
    },
  },
  methods: {
    onDefaultButtonClick(event) {
      if (this.$refs.menu.overlayVisible) {
        this.$refs.menu.hide();
      }
      this.$emit("click", event);
    },
    onDropdownButtonClick(event) {
      this.$refs.menu.toggle(event, this.$refs.dropdownButton.$el);
    },
  },
};
</script>
