import { createBaseComponent } from "@ultimate/vue-core";
import { buttonStyleModule } from "./button-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...), matching verified BaseButton.vue's own
// extends: BaseComponent chain exactly (spec §7, §18). Prop surface verified
// against the real extracted .vendor-extracted/vue/button/BaseButton.vue —
// label/icon/iconPos/iconClass/badge/badgeClass/badgeSeverity/loading/
// loadingIcon/as/asChild/link/severity/raised/rounded/text/outlined/size/
// variant/plain/fluid all match verbatim (including the odd
// `fluid: { type: Boolean, default: null }`, matching upstream exactly).
//
// One deliberate deviation from upstream: upstream has NO `ariaLabel` prop
// — its `defaultAriaLabel` computed falls back to reading `this.$attrs.ariaLabel`
// (an arbitrary fallthrough attr), which relies on Vue's attrs-fallthrough
// mechanism. Option B's scoped-down architecture (no `pt`/passthrough system)
// still wants a clean, typed, explicit prop for this, so `ariaLabel` is kept
// as its own declared prop here (also matches this task's own spec'd test
// contract, which passes `ariaLabel` as a prop, not an arbitrary attr).
export function createBaseButton(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "button", styleModule: buttonStyleModule }),
    props: {
      label: { type: String, default: null },
      icon: { type: String, default: null },
      iconPos: { type: String, default: "left" },
      iconClass: { type: [String, Object], default: null },
      badge: { type: String, default: null },
      badgeClass: { type: [String, Object], default: null },
      badgeSeverity: { type: String, default: "secondary" },
      loading: { type: Boolean, default: false },
      loadingIcon: { type: String, default: undefined },
      as: { type: [String, Object], default: "BUTTON" },
      asChild: { type: Boolean, default: false },
      link: { type: Boolean, default: false },
      severity: { type: String, default: null },
      raised: { type: Boolean, default: false },
      rounded: { type: Boolean, default: false },
      text: { type: Boolean, default: false },
      outlined: { type: Boolean, default: false },
      size: { type: String, default: null },
      variant: { type: String, default: null },
      plain: { type: Boolean, default: false },
      fluid: { type: Boolean, default: null },
      ariaLabel: { type: String, default: null },
    },
    inject: {
      pcFluid: { default: undefined },
    },
  };
}
