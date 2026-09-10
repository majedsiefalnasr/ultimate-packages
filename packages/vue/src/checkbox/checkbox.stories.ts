import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UCheckbox } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/checkbox.ts`
 * (the `CHECKBOX_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/checkbox/checkbox.spec.ts`'s existing test cases (binary
 * mode checked/unchecked reflecting `modelValue`, indeterminate, disabled,
 * aria-invalid).
 *
 * `UCheckbox` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention, per checkbox.spec.ts's "does not manage its own
 * checked state when controlled" test) — every interactive story below
 * renders it with a local `ref` bound via a real template `v-model`, so the
 * checkbox is actually togglable when rendered in Storybook, mirroring how
 * any real consumer must drive it (same harness pattern as
 * `packages/react/src/checkbox/checkbox.stories.tsx`'s local-state wrapper).
 */
const meta: Meta<typeof UCheckbox> = {
  title: "Vue/Checkbox",
  component: UCheckbox,
};

export default meta;
type Story = StoryObj<typeof UCheckbox>;

/** Default state — unchecked, per checkbox.spec.ts's binary-mode base fixture. */
export const Default: Story = {
  args: {
    binary: true,
    modelValue: false,
  },
  render: (args) => ({
    components: { UCheckbox },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UCheckbox v-bind="args" v-model="modelValue" />`,
  }),
};

/** Checked state, per checkbox.spec.ts's "binary mode: checked reflects modelValue === trueValue" test. */
export const Checked: Story = {
  args: {
    binary: true,
    modelValue: true,
  },
  render: Default.render,
};

/** Indeterminate state, per checkbox.spec.ts's "renders MinusIcon and sets the native input's indeterminate DOM property" test. */
export const Indeterminate: Story = {
  args: {
    binary: true,
    modelValue: false,
    indeterminate: true,
  },
  render: Default.render,
};

/** Disabled state, per checkbox.spec.ts's "disabled/readonly/required/name/tabindex pass through to the native input" test. */
export const Disabled: Story = {
  args: {
    binary: true,
    modelValue: false,
    disabled: true,
  },
  render: Default.render,
};

/** Invalid state, per checkbox.spec.ts's "aria-invalid reflects the invalid prop" test. */
export const Invalid: Story = {
  args: {
    binary: true,
    modelValue: false,
    invalid: true,
  },
  render: Default.render,
};
