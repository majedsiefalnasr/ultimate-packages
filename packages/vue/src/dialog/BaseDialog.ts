import { createBaseComponent } from "@ultimate/vue-core";
import { dialogStyleModule } from "./dialog-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent({ componentName, styleModule }) directly —
// Dialog has no editable-holder/input tier need (unlike Checkbox, Task 19),
// so createBaseComponent's real parameterized signature threads
// componentName/styleModule cleanly with no cx()-shadowing workaround
// required.
//
// Verified real upstream prop surface (BaseDialog.vue, this task's Step 1),
// scoped to Phase 4's excluded-draggable/maximizable boundary (spec §15) —
// no draggable/keepInViewport/minX/minY/maximizable/maximizeIcon/
// minimizeIcon/breakpoints/maximizeButtonProps props anywhere in this shape.
// showHeader/contentStyle/contentClass/contentProps/closeIcon/
// closeButtonProps are also real upstream props this proof-set component
// does not need to reproduce (no demonstrated Ultimate consumer need,
// YAGNI). ariaCloseLabel is this implementation's own addition, replacing
// upstream's `$primevue.config.locale.aria.close` (Option B — no
// PrimeVueService global config, spec §7).
export function createBaseDialog(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "dialog", styleModule: dialogStyleModule }),
    props: {
      visible: { type: Boolean, default: false },
      header: { type: String, default: null },
      footer: { type: String, default: null },
      modal: { type: Boolean, default: true },
      closable: { type: Boolean, default: true },
      closeOnEscape: { type: Boolean, default: true },
      dismissableMask: { type: Boolean, default: false },
      blockScroll: { type: Boolean, default: false },
      baseZIndex: { type: Number, default: 0 },
      autoZIndex: { type: Boolean, default: true },
      // ARIA role override for the dialog's root element. Defaults to
      // "dialog"; ConfirmDialog.vue overrides this to "alertdialog" to
      // match real upstream's own Dialog composition (GAP-049).
      role: { type: String, default: "dialog" },
      position: { type: String, default: "center" },
      appendTo: { type: [String, Object], default: "body" },
      ariaCloseLabel: { type: String, default: "Close" },
    },
  };
}
