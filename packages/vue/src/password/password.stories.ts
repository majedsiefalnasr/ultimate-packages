import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UPassword } from "./index";

/**
 * `UPassword` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention) — every interactive story below renders it with a
 * local `ref` bound via a real template `v-model`, mirroring
 * `toggle-switch.stories.ts`'s own harness pattern.
 *
 * State coverage below is sourced from
 * `packages/vue/src/password/password.spec.ts`'s existing test cases (mask
 * toggle, strength-meter overlay, weak/strong classification,
 * Escape-to-hide).
 */
const meta: Meta<typeof UPassword> = {
  title: "Vue/Password",
  component: UPassword,
};

export default meta;
type Story = StoryObj<typeof UPassword>;

/** Default state — strength-meter feedback enabled, no mask toggle. */
export const Default: Story = {
  args: {
    modelValue: "",
  },
  render: (args) => ({
    components: { UPassword },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UPassword v-bind="args" v-model="modelValue" />`,
  }),
};

/** Adds a show/hide icon that toggles the input between masked and plain text. */
export const WithToggleMask: Story = {
  args: {
    modelValue: "",
    toggleMask: true,
  },
  render: Default.render,
};

/** Strength feedback overlay disabled — a plain password input. */
export const NoFeedback: Story = {
  args: {
    modelValue: "",
    feedback: false,
  },
  render: Default.render,
};
