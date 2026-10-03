import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent, type BaseComponentOptions } from "./base-component";

// Layered on createBaseComponent via `extends:`, matching verified
// BaseEditableHolder.vue's own `extends: BaseComponent` chain. The
// @primevue/forms-coupled portions ($pcForm/$pcFormField injection,
// formField.onChange, $formNovalidate/$formValue/$formDefaultValue/
// $formControl) are excluded entirely — deliberate boundary cut of a real,
// verified, working PrimeVue feature (spec §19/§20), not an
// absence-of-feature finding the way it was for React (Phase 3 had nothing
// to exclude here since PrimeReact's own Checkbox has no forms integration).
export function createBaseEditableHolder(
  base: Partial<BaseComponentOptions> = { componentName: "", styleModule: { css: "", classes: {} } }
) {
  return defineComponent({
    extends: createBaseComponent(base as BaseComponentOptions),
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      modelValue: { type: null as unknown as PropType<any>, default: undefined },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      defaultValue: { type: null as unknown as PropType<any>, default: undefined },
    },
    emits: ["update:modelValue", "value-change"],
    data() {
      return {
        dValue: this.defaultValue !== undefined ? this.defaultValue : this.modelValue,
      };
    },
    watch: {
      modelValue(newValue: unknown) {
        this.dValue = newValue;
      },
      defaultValue(newValue: unknown) {
        this.dValue = newValue;
      },
    },
    computed: {
      // Verified BaseEditableHolder.vue detects "was this prop actually
      // passed by the caller" (vs. merely resolved to `undefined` by Vue's
      // default-prop-value mechanism) via `this.$inProps.hasOwnProperty(...)`
      // — a Vue-internal helper. Verified in BaseComponent.vue, `$inProps`
      // is itself built from `Object.keys(this.$.vnode?.props || {})`,
      // i.e. the raw VNode props the parent actually passed, filtered
      // against the component's own declared prop keys.
      //
      // `this.$.vnode.props` (the internal component instance exposed as
      // `this.$` in Options API, equivalent to `getCurrentInstance().vnode`
      // in Composition API) is accessible through Vue's public
      // component-instance surface — it is the same mechanism $inProps
      // itself uses, not a simpler approximation of it. It was verified by
      // test (see base-editable-holder.spec.ts) to produce identical
      // `controlled` results to the four brief test cases, including the
      // "prop passed as `undefined`" edge case, where an attrs/prop-value
      // presence check (the brief's draft) is unreliable: Vue does not
      // expose passed-but-undefined props via $attrs (they're consumed as
      // declared props), so a value-presence check can't distinguish
      // "modelValue explicitly passed as undefined" from "modelValue not
      // passed at all" — but vnode.props key-presence can, because Vue
      // preserves the key in the raw vnode props object either way.
      controlled(): boolean {
        const vnodeProps = (this.$.vnode?.props ?? {}) as Record<string, unknown>;
        const passedModelValue = "modelValue" in vnodeProps || "model-value" in vnodeProps;
        const passedDefaultValue = "defaultValue" in vnodeProps || "default-value" in vnodeProps;
        return passedModelValue || (!passedModelValue && !passedDefaultValue);
      },
      filled(): boolean {
        return this.dValue !== undefined && this.dValue !== null && this.dValue !== "";
      },
    },
    methods: {
      // `event` matches verified BaseEditableHolder.vue's writeValue(value, event)
      // signature — required for interface parity with callers (e.g. Task 5's
      // BaseInput, which threads the native DOM event through on input/change).
      // Unused here because the only real consumer of `event` in the upstream
      // source is the excluded formField.onChange({ originalEvent: event, value })
      // call (@primevue/forms integration — out of scope per Global Constraints).
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      writeValue(value: unknown, event?: Event) {
        if (this.controlled) {
          this.dValue = value;
          this.$emit("update:modelValue", value);
        }
        this.$emit("value-change", value);
      },
    },
  });
}
