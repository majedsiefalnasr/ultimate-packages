import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USelect } from "./index";

/**
 * `USelect` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `autocomplete.stories.ts`.
 */
const meta: Meta<typeof USelect> = {
  title: "Vue/Select",
  component: USelect,
};

export default meta;
type Story = StoryObj<typeof USelect>;

/** Default state — click to open the option list. */
export const Default: Story = {
  args: {
    modelValue: null,
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
  },
  render: (args) => ({
    components: { USelect },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<USelect v-bind="args" v-model="modelValue" />`,
  }),
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    modelValue: null,
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose a fruit",
    filter: true,
  },
  render: Default.render,
};

/** Shows a clear icon once a value is selected. */
export const Clearable: Story = {
  args: {
    modelValue: "Apple",
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
    showClear: true,
  },
  render: Default.render,
};
