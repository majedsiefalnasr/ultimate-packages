import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { checkboxStyleModule } from "./checkbox-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseCheckbox.vue's real
// chain exactly: Checkbox extends BaseCheckbox extends BaseInput extends
// BaseEditableHolder extends BaseComponent (spec §7, §19).
//
// Implementation-time verification finding (Global Constraints: "verify,
// don't assume" — createBaseInput's real, shipped signature is
// `createBaseInput()` (a `defineComponent(...)` result), taking NO parameters (confirmed
// against packages/vue-core/src/base/base-input.ts and its own
// base-input.spec.ts, which only ever calls `createBaseInput()`). It always
// internally calls `createBaseEditableHolder()` with THAT function's own
// default empty `{ componentName: "", styleModule: { css: "", classes: {} } }`
// — there is no way to thread this component's real `componentName`/
// `styleModule` through `createBaseInput()` itself. `cx()`
// (`createBaseComponent`'s method) is a closure over whichever styleModule
// was passed to the specific `createBaseComponent()` call that produced it,
// not something later `extends` tiers can override by re-passing props —
// so calling bare `createBaseInput()` alone (as the brief's original draft
// did) would silently give this component a permanently-empty `cx()` that
// resolves no real checkbox classes at all, a real correctness bug caught
// during this task's own verification, not present in Task 17/18 (Button/
// Tooltip), which extend `createBaseComponent(...)` directly since neither
// needs the editable-holder/input tiers.
//
// Fix: extend `createBaseInput()` for the real 4-tier prop/computed/inject
// surface (`resolvedFluid`/`resolvedVariant`/`pcFluid` injection), then
// shadow `cx()` and `mounted()` locally with real closures over
// `checkboxStyleModule` — Vue's Options API `methods` merge is
// override-by-name (closer to the leaf wins), so this method declared here
// replaces the empty one inherited via createBaseInput -> createBaseEditableHolder
// -> createBaseComponent(default). `mounted()` hooks, by contrast, are
// merged into an array and ALL run — so the inherited empty-name
// registerComponentStyle("", ...) no-op still fires harmlessly alongside
// this real one; re-implementing `mounted` here rather than relying on it
// keeps the real checkbox style registration explicit and independently
// verifiable in this file, matching the same "verify sync in mounted"
// pattern the brief's own Checkbox.vue draft already uses for
// updateIndeterminate().
export function createBaseCheckbox() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      value: { type: null as unknown as PropType<any>, default: null },
      binary: { type: Boolean, default: false },
      indeterminate: { type: Boolean, default: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      trueValue: { type: null as unknown as PropType<any>, default: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      falseValue: { type: null as unknown as PropType<any>, default: false },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      inputId: { type: String, default: null },
      inputClass: { type: [String, Object], default: null },
      inputStyle: { type: Object, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = checkboxStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("checkbox", checkboxStyleModule);
    },
  });
}
