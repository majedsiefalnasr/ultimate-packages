import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UListbox } from "./index";

/**
 * `UListbox` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `../select/select.stories.ts`.
 */
const meta: Meta<typeof UListbox> = {
  title: "Vue/Listbox",
  component: UListbox,
};

export default meta;
type Story = StoryObj<typeof UListbox>;

/** Default state — always-visible single-select list. */
export const Default: Story = {
  args: {
    modelValue: null,
    options: ["Apple", "Banana", "Cherry"],
  },
  render: (args) => ({
    components: { UListbox },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UListbox v-bind="args" v-model="modelValue" />`,
  }),
};

/** Multi-select — checkbox per option. */
export const Multiple: Story = {
  args: {
    modelValue: [],
    options: ["Apple", "Banana", "Cherry"],
    multiple: true,
  },
  render: Default.render,
};

/** Filterable — types into a search box above the list. */
export const Filterable: Story = {
  args: {
    modelValue: null,
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    filter: true,
  },
  render: Default.render,
};
