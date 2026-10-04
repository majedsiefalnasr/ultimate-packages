import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inputGroupAddonStyleModule } from "./input-group-style";

// extends: createBaseComponent(...) directly — matching verified
// BaseInputGroupAddon.vue's own `extends: BaseComponent` chain: real
// InputGroupAddon has no CVA/controlled-value concept and no props of its
// own beyond BaseComponent's own `dt`/`unstyled`/`class` — Angular's
// sibling realization carries a `style`/`inlineStyle` input (from real
// PrimeNG's own `@HostBinding('style')`), but real PrimeVue's own
// BaseInputGroupAddon.vue declares no such prop (an inline style there is
// applied the ordinary Vue way, via the consumer's own `style` attribute on
// the component, already covered by BaseComponent's passthrough — no
// dedicated prop needed).
export function createBaseInputGroupAddon() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "input-group-addon",
      styleModule: inputGroupAddonStyleModule,
    }),
  });
}
