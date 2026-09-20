import { ZIndex } from "@ultimate/uix-utils/zindex";

// Verified real PrimeVue keys — Dialog.vue's `ZIndex.set('modal', this.mask,
// ...)`, Menu.vue's `ZIndex.set('menu', el, ...)`, Tooltip.js's
// `ZIndex.set('tooltip', tooltipElement, ...)` (spec §12, all three verified).
// `overlay` added during Phase C Batch 1's Overlay family task
// (Popover/ConfirmPopup), matching real PrimeVue's own Popover.vue/
// ConfirmPopup.vue (`ZIndex.set('overlay', el, ...)`, verified this session
// via extract-primevue-source.mjs) — same "extend only when a real
// component needs a tier" precedent this file's own comment already
// establishes.
export const Z_INDEX_KEYS = {
  modal: "modal",
  menu: "menu",
  tooltip: "tooltip",
  overlay: "overlay",
} as const;

// Thin wrapper around @ultimate/uix-utils/zindex's ZIndex — does not modify
// that module (spec §12's component-level-configuration-only posture).
export function useZIndex(): {
  set: (key: keyof typeof Z_INDEX_KEYS, element: HTMLElement | null, baseZIndex?: number) => void;
  clear: (element: HTMLElement | null) => void;
} {
  return {
    set(key, element, baseZIndex) {
      if (!element) return;
      ZIndex.set(key, element, baseZIndex);
    },
    clear(element) {
      if (!element) return;
      ZIndex.clear(element);
    },
  };
}
