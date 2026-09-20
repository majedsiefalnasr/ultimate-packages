import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USelectButton } from "./index";

/**
 * `USelectButton` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `toggle-button.stories.ts`.
 */
const meta: Meta<typeof USelectButton> = {
  title: "Vue/SelectButton",
  component: USelectButton,
};

export default meta;
type Story = StoryObj<typeof USelectButton>;

/** Single-select — default state. */
export const Default: Story = {
  args: {
    modelValue: null,
    options: ["Off", "Medium", "High"],
  },
  render: (args) => ({
    components: { USelectButton },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<USelectButton v-bind="args" v-model="modelValue" />`,
  }),
};

/** Multi-select — more than one option can be active at once. */
export const Multiple: Story = {
  args: {
    modelValue: [],
    options: ["Bold", "Italic", "Underline"],
    multiple: true,
  },
  render: Default.render,
};
