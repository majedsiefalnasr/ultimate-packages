import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTextarea } from "./index";

/**
 * `UTextarea` is controlled via `modelValue`/`update:modelValue`, per
 * textarea.spec.ts's "does not manage its own value when controlled" test.
 */
const meta: Meta<typeof UTextarea> = {
  title: "Vue/Textarea",
  component: UTextarea,
};

export default meta;
type Story = StoryObj<typeof UTextarea>;

export const Default: Story = {
  args: {
    modelValue: "",
    placeholder: "Enter a description",
  },
  render: (args) => ({
    components: { UTextarea },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UTextarea v-bind="args" v-model="modelValue" />`,
  }),
};

/** Grows/shrinks with content, per textarea.spec.ts's autoResize suite. */
export const AutoResize: Story = {
  args: {
    modelValue: "Type more lines and watch this grow automatically.",
    autoResize: true,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    modelValue: "Cannot edit",
    disabled: true,
  },
  render: Default.render,
};

export const Invalid: Story = {
  args: {
    modelValue: "",
    invalid: true,
  },
  render: Default.render,
};
