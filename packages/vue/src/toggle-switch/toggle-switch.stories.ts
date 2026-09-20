import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UToggleSwitch } from "./index";

/**
 * `UToggleSwitch` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention, per toggle-switch.spec.ts's "does not manage its own
 * checked state when controlled" test) — every interactive story below
 * renders it with a local `ref` bound via a real template `v-model`,
 * mirroring `radio-button.stories.ts`'s own harness pattern.
 */
const meta: Meta<typeof UToggleSwitch> = {
  title: "Vue/ToggleSwitch",
  component: UToggleSwitch,
};

export default meta;
type Story = StoryObj<typeof UToggleSwitch>;

/** Default state — unchecked, per toggle-switch.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    modelValue: false,
  },
  render: (args) => ({
    components: { UToggleSwitch },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UToggleSwitch v-bind="args" v-model="modelValue" />`,
  }),
};

/** Checked state, per toggle-switch.spec.ts's "checked reflects modelValue === trueValue" test. */
export const Checked: Story = {
  args: {
    modelValue: true,
  },
  render: Default.render,
};

/** Disabled state, per toggle-switch.spec.ts's "disabled/readonly/tabindex pass through" test. */
export const Disabled: Story = {
  args: {
    modelValue: false,
    disabled: true,
  },
  render: Default.render,
};

/** Invalid state, per toggle-switch.spec.ts's "aria-invalid reflects the invalid prop" test. */
export const Invalid: Story = {
  args: {
    modelValue: false,
    invalid: true,
  },
  render: Default.render,
};
