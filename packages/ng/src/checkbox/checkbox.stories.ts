import type { Meta, StoryObj } from "@storybook/angular";
import { UCheckbox } from "./checkbox";

/**
 * Accessibility info source: `packages/component-metadata/src/records/checkbox.ts`
 * (the `CHECKBOX_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/checkbox/checkbox.spec.ts`'s existing test cases (binary
 * checked/unchecked, label rendering, disabled).
 */
const meta: Meta<UCheckbox> = {
  title: "Ng/Checkbox",
  component: UCheckbox,
};

export default meta;
type Story = StoryObj<UCheckbox>;

/** Default state — unchecked, no label. */
export const Default: Story = {
  args: {
    binary: true,
  },
};

/** With a text label, per checkbox.spec.ts's "renders the label input with a real u-checkbox-label class" test. */
export const WithLabel: Story = {
  args: {
    binary: true,
    label: "Accept terms",
  },
};

/** Disabled state, per checkbox.spec.ts's "respects the disabled input" test. */
export const Disabled: Story = {
  args: {
    binary: true,
    label: "Accept terms",
    disabled: true,
  },
};
