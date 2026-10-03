import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { overlayBadgeStyleModule } from "./overlay-badge-style";

/**
 * Prop surface verified against real upstream `BaseOverlayBadge.vue`
 * (`.vendor-extracted/vue/overlaybadge/BaseOverlayBadge.vue`): it forwards
 * Badge's own `value`/`severity`/`size` props directly (real source's own
 * `Overlaybadge.vue` template does `v-bind="$props"` onto its composed
 * `Badge`), matching the already-Built Vue `UBadge`'s own real prop surface
 * (`packages/vue/src/badge/base-badge.ts` — no `badgeDisabled`/`badgeSize`
 * aliases, unlike Angular's `UBadge`, since this Vue realization follows
 * real PrimeVue's own prop surface, not Angular's — Option B: reference the
 * real framework source, not a sibling framework's port).
 */
export function createBaseOverlayBadge() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "overlay-badge", styleModule: overlayBadgeStyleModule }),
    props: {
      value: { type: [String, Number], default: null },
      severity: { type: String, default: null },
      size: { type: String, default: null },
    },
  });
}
