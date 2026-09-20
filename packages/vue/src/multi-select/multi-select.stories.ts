import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMultiSelect } from "./index";

/**
 * `UMultiSelect` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `../select/select.stories.ts`.
 */
const meta: Meta<typeof UMultiSelect> = {
  title: "Vue/MultiSelect",
  component: UMultiSelect,
};

export default meta;
type Story = StoryObj<typeof UMultiSelect>;

/** Default state — click to open the checkbox-per-option list. */
export const Default: Story = {
  args: {
    modelValue: [],
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose fruits",
  },
  render: (args) => ({
    components: { UMultiSelect },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UMultiSelect v-bind="args" v-model="modelValue" />`,
  }),
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    modelValue: [],
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose fruits",
    filter: true,
  },
  render: Default.render,
};
