import { createBaseEditableHolder } from "./base-editable-holder";
import type { ComponentOptions } from "vue";

// Layered on createBaseEditableHolder via `extends:`, matching verified
// BaseInput.vue's own `extends: BaseEditableHolder` chain — a real
// intermediate tier not previously documented until this Phase's Checkbox
// verification gap closed (spec §7, §19). Matches the same ambient-Fluid-
// context pattern already independently confirmed for Button (spec §18) and
// Angular's UButton (ADR-018).
export function createBaseInput(): ComponentOptions {
  return {
    extends: createBaseEditableHolder(),
    props: {
      size: { default: null },
      fluid: { default: null },
      variant: { default: null },
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
  };
}
