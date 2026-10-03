import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { splitButtonStyleModule } from "./split-button-style";

// Props verified against real .vendor-extracted/vue/splitbutton/BaseSplitButton.vue
// (this task's Step 1) — reduced to this task's own smaller surface
// (label, icon, severity, text, outlined, size, disabled, model), matching
// this same capability's already-Built Angular/React `USplitButton`
// siblings' own reduced prop set. Real BaseSplitButton.vue also carries
// fluid (ancestor-Fluid detection, out of this task's smaller surface),
// appendTo/autoZIndex/baseZIndex (its inner TieredMenu's own overlay
// positioning — this adaptation composes `UMenu` in popup mode instead,
// which owns its own positioning), and dropdownIcon/menuButtonIcon
// (deprecated upstream aliases). Real BaseSplitButton.vue also does
// `provide() { return { $parentInstance: this } }` — the
// passthrough-system inject/provide wiring this project's "Option B"
// posture excludes entirely (spec §7); not reproduced here.
export function createBaseSplitButton() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "split-button", styleModule: splitButtonStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      label: { type: String, default: null },
      icon: { type: String, default: null },
      iconPos: { type: String, default: "left" },
      severity: { type: String, default: null },
      text: { type: Boolean, default: false },
      outlined: { type: Boolean, default: false },
      size: { type: String, default: null },
      disabled: { type: Boolean, default: false },
    },
  });
}
