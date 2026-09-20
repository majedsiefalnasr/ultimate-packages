import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDatePicker } from "./index";

/**
 * `UDatePicker` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `select.stories.ts`.
 */
const meta: Meta<typeof UDatePicker> = {
  title: "Vue/DatePicker",
  component: UDatePicker,
};

export default meta;
type Story = StoryObj<typeof UDatePicker>;

/** Default state — click the input to open the calendar overlay. */
export const Default: Story = {
  args: {
    modelValue: null,
    placeholder: "Select a date",
  },
  render: (args) => ({
    components: { UDatePicker },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UDatePicker v-bind="args" v-model="modelValue" />`,
  }),
};

/** Shows a calendar trigger icon alongside the text input. */
export const WithIcon: Story = {
  args: {
    modelValue: null,
    placeholder: "Select a date",
    showIcon: true,
  },
  render: Default.render,
};

/** Shows a clear icon once a date is selected. */
export const Clearable: Story = {
  args: {
    modelValue: new Date(),
    showClear: true,
  },
  render: Default.render,
};

/** Constrains selectable dates to a min/max range. */
export const MinMaxDate: Story = {
  args: {
    modelValue: null,
    placeholder: "Select a date",
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
  },
  render: Default.render,
};
