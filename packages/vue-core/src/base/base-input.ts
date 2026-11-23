import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseEditableHolder } from "./base-editable-holder";
import type { BaseComponentOptions } from "./base-component";

// Layered on createBaseEditableHolder via `extends:`, matching verified
// BaseInput.vue's own `extends: BaseEditableHolder` chain — a real
// intermediate tier not previously documented until this Phase's Checkbox
// verification gap closed (spec §7, §19). Matches the same ambient-Fluid-
// context pattern already independently confirmed for Button (spec §18) and
// Angular's UButton (ADR-018).
//
// `base` is forwarded to the editable holder, so a component that passes its
// `componentName` and `styleModule` gets `unstyled`, per-instance `dt`, `pt`
// and style registration from the base chain instead of shadowing `cx` and
// `mounted` locally. Omitting it keeps the earlier no-style behavior.
export function createBaseInput(base?: Partial<BaseComponentOptions>) {
  return defineComponent({
    extends: createBaseEditableHolder(base),
    props: {
      size: { type: null as unknown as PropType<string | null>, default: null },
      fluid: { type: null as unknown as PropType<boolean | null>, default: null },
      variant: { type: null as unknown as PropType<string | null>, default: null },
    },
    inject: {
      pcFluid: { default: undefined },
    },
    computed: {
      resolvedVariant(): string | null {
        return this.variant ?? null;
      },
      resolvedFluid(): boolean {
        return this.fluid ?? !!(this as unknown as { pcFluid?: boolean }).pcFluid;
      },
    },
  });
}
