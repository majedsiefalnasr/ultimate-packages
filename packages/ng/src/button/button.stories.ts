import type { Meta, StoryObj } from "@storybook/angular";
import { UButton } from "./button";

/**
 * Accessibility info source: `packages/component-metadata/src/records/button.ts`
 * (the `BUTTON_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/button/button.spec.ts`'s existing test cases (label
 * rendering, disabled, loading, icon).
 */
const meta: Meta<UButton> = {
  title: "Ng/Button",
  component: UButton,
};

export default meta;
type Story = StoryObj<UButton>;

/** Default state — label only, per button.spec.ts's "renders the label input" test. */
export const Default: Story = {
  args: {
    label: "Save",
  },
};

/** Disabled state, per button.spec.ts's "does not emit onClick when disabled" test. */
export const Disabled: Story = {
  args: {
    label: "Save",
    disabled: true,
  },
};

/** Loading state, per button.spec.ts's "renders u-button-loading class ... when loading is true" test. */
export const Loading: Story = {
  args: {
    label: "Save",
    loading: true,
  },
};

/** Icon variant, per button.spec.ts's "renders the icon input's value as a class" test. */
export const WithIcon: Story = {
  args: {
    label: "Check",
    icon: "pi pi-check",
  },
};
