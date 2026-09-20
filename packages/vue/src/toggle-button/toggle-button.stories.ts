import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UToggleButton } from "./index";

/**
 * `UToggleButton` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention, per toggle-button.spec.ts's "does not manage its own
 * pressed state when controlled" test) — every interactive story below
 * renders it with a local `ref` bound via a real template `v-model`,
 * mirroring `radio-button.stories.ts`'s own harness pattern.
 */
const meta: Meta<typeof UToggleButton> = {
  title: "Vue/ToggleButton",
  component: UToggleButton,
};

export default meta;
type Story = StoryObj<typeof UToggleButton>;

/** Default state — inactive, per toggle-button.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    modelValue: false,
  },
  render: (args) => ({
    components: { UToggleButton },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UToggleButton v-bind="args" v-model="modelValue" />`,
  }),
};

/** Active state, per toggle-button.spec.ts's "aria-pressed reflects modelValue" test. */
export const Active: Story = {
  args: {
    modelValue: true,
  },
  render: Default.render,
};

/** Custom labels, per toggle-button.spec.ts's "shows onLabel/offLabel" test. */
export const CustomLabels: Story = {
  args: {
    modelValue: false,
    onLabel: "I confirm",
    offLabel: "I reject",
  },
  render: Default.render,
};

/** Disabled state, per toggle-button.spec.ts's "disabled/tabindex pass through" test. */
export const Disabled: Story = {
  args: {
    modelValue: false,
    disabled: true,
  },
  render: Default.render,
};

/** Invalid state, per toggle-button.spec.ts's "aria-invalid reflects the invalid prop" test. */
export const Invalid: Story = {
  args: {
    modelValue: false,
    invalid: true,
  },
  render: Default.render,
};
