import type { ObjectDirective, DirectiveBinding as VueDirectiveBinding } from "vue";

export interface DirectiveBinding<TValue = unknown> {
  value: TValue;
  oldValue?: TValue;
}

export interface DirectiveInstanceOptions<TValue = unknown> {
  name: string;
  hooks: {
    mounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    updated?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
    unmounted?: (el: HTMLElement, binding: DirectiveBinding<TValue>) => void;
  };
}

// A separate mechanism from createBaseComponent (Task 3) — returns a real Vue
// ObjectDirective, not an extends:-consumed mixin, matching verified
// BaseDirective.js's own structural distinction from BaseComponent.vue (spec
// §7). No pt/ptm/ptmo passthrough, no PrimeVueService global config-change
// subscription — no demonstrated Phase 4 need for either.
export function createDirective<TValue = unknown>(
  options: DirectiveInstanceOptions<TValue>
): ObjectDirective<HTMLElement, TValue> {
  const { hooks } = options;

  function toBinding(binding: VueDirectiveBinding<TValue>): DirectiveBinding<TValue> {
    return { value: binding.value, oldValue: binding.oldValue ?? undefined };
  }

  return {
    mounted(el, binding) {
      hooks.mounted?.(el, toBinding(binding));
    },
    updated(el, binding) {
      hooks.updated?.(el, toBinding(binding));
    },
    unmounted(el, binding) {
      hooks.unmounted?.(el, toBinding(binding));
    },
  };
}
