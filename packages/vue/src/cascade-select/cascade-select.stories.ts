import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UCascadeSelect } from "./index";

/**
 * `UCascadeSelect` is controlled via `modelValue`/`update:modelValue`
 * (Vue's `v-model` convention), same harness pattern as
 * `../select/select.stories.ts`.
 */
const meta: Meta<typeof UCascadeSelect> = {
  title: "Vue/CascadeSelect",
  component: UCascadeSelect,
};

export default meta;
type Story = StoryObj<typeof UCascadeSelect>;

const COUNTRIES = [
  {
    name: "Germany",
    items: [
      { name: "Berlin", items: [{ name: "Mitte" }, { name: "Charlottenburg" }] },
      { name: "Hamburg", items: [{ name: "Altstadt" }] },
    ],
  },
  {
    name: "USA",
    items: [
      { name: "New York", items: [{ name: "Manhattan" }, { name: "Brooklyn" }] },
      { name: "California", items: [{ name: "Los Angeles" }] },
    ],
  },
];

/** Default state — click to drill through Country > City > District. */
export const Default: Story = {
  args: {
    modelValue: null,
    options: COUNTRIES,
    optionLabel: "name",
    placeholder: "Select a district",
  },
  render: (args) => ({
    components: { UCascadeSelect },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UCascadeSelect v-bind="args" v-model="modelValue" />`,
  }),
};
