<template>
  <div :class="cx('root')" v-bind="ptmi('root')">
    <slot />
    <UBadge v-bind="$props" :pt="ptm('pcBadge')" />
  </div>
</template>

<script>
import { UBadge } from "../badge";
import { createBaseOverlayBadge } from "./BaseOverlayBadge";

// Ultimate-owned adaptation of PrimeVue's `OverlayBadge` component (see
// .vendor-extracted/vue/overlaybadge/OverlayBadge.vue). Confirmed against
// real source: OverlayBadge is a small wrapper — a single root <div> that
// renders the default slot (host content) plus a composed <Badge
// v-bind="$props"> positioned absolutely at the content's top-right corner
// via CSS — not a standalone visible component of its own.
//
// This port composes the already-Built UBadge the same way real upstream
// composes Badge, forwarding the same value/severity/size prop surface
// UBadge already exposes (Vue's own real prop surface, per BaseOverlayBadge's
// own doc comment).
export default {
  name: "UOverlayBadge",
  extends: createBaseOverlayBadge(),
  inheritAttrs: false,
  components: { UBadge },
};
</script>
