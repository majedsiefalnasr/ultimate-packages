import { defineComponent, h, ref, onMounted, Teleport, type PropType } from "vue";

export interface PortalProps {
  appendTo?: string | HTMLElement;
  disabled?: boolean;
}

// Thin wrapper around native <Teleport>, matching verified Portal.vue exactly:
// an `inline` escape hatch (disabled || appendTo === "self") renders the slot
// in place; otherwise gated by a `mounted` flag (set via isClient()-equivalent
// check in onMounted) before teleporting — SSR-safe, no extra guard needed
// beyond this gate (spec §13).
export const Portal = defineComponent({
  name: "UPortal",
  props: {
    appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const mounted = ref(false);

    onMounted(() => {
      mounted.value = typeof document !== "undefined";
    });

    return () => {
      const inline = props.disabled || props.appendTo === "self";
      if (inline) return slots.default?.();
      if (!mounted.value) return null;
      return h(Teleport, { to: props.appendTo }, slots.default?.() ?? []);
    };
  },
});
