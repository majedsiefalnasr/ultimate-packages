import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputText } from "./index";

/**
 * `UInputText` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention, per input-text.spec.ts's "does not manage its own
 * value when controlled" test) — every interactive story below renders it
 * with a local `ref` bound via a real template `v-model`, mirroring
 * `radio-button.stories.ts`'s own harness pattern.
 */
const meta: Meta<typeof UInputText> = {
  title: "Vue/InputText",
  component: UInputText,
};

export default meta;
type Story = StoryObj<typeof UInputText>;

/** Default state, per input-text.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    modelValue: "",
    placeholder: "Enter text",
  },
  render: (args) => ({
    components: { UInputText },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UInputText v-bind="args" v-model="modelValue" />`,
  }),
};

/** Filled with an initial value. */
export const Filled: Story = {
  args: {
    modelValue: "Hello world",
  },
  render: Default.render,
};

/** Disabled state, per input-text.spec.ts's "disabled/name/placeholder pass through" test. */
export const Disabled: Story = {
  args: {
    modelValue: "Cannot edit",
    disabled: true,
  },
  render: Default.render,
};

/** Invalid state, per input-text.spec.ts's "aria-invalid reflects the invalid prop" test. */
export const Invalid: Story = {
  args: {
    modelValue: "",
    invalid: true,
  },
  render: Default.render,
};

/** Fluid state, spans 100% width of its container. */
export const Fluid: Story = {
  args: {
    modelValue: "",
    fluid: true,
  },
  render: Default.render,
};
