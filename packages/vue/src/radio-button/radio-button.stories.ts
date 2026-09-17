import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { URadioButton } from "./index";

/**
 * `URadioButton` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention, per radio-button.spec.ts's "does not manage its own
 * checked state when controlled" test) — every interactive story below
 * renders it with a local `ref` bound via a real template `v-model`,
 * mirroring `checkbox.stories.ts`'s own harness pattern.
 */
const meta: Meta<typeof URadioButton> = {
  title: "Vue/RadioButton",
  component: URadioButton,
};

export default meta;
type Story = StoryObj<typeof URadioButton>;

/** Default state — unselected, per radio-button.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    value: "option1",
    modelValue: null,
  },
  render: (args) => ({
    components: { URadioButton },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<URadioButton v-bind="args" v-model="modelValue" />`,
  }),
};

/** Checked state, per radio-button.spec.ts's "checked reflects modelValue === value" test. */
export const Checked: Story = {
  args: {
    value: "option1",
    modelValue: "option1",
  },
  render: Default.render,
};

/** Disabled state, per radio-button.spec.ts's "disabled/readonly/required/name/tabindex pass through" test. */
export const Disabled: Story = {
  args: {
    value: "option1",
    modelValue: null,
    disabled: true,
  },
  render: Default.render,
};

/** Invalid state, per radio-button.spec.ts's "aria-invalid reflects the invalid prop" test. */
export const Invalid: Story = {
  args: {
    value: "option1",
    modelValue: null,
    invalid: true,
  },
  render: Default.render,
};
