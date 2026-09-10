import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UButton } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/button.ts`
 * (the `BUTTON_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/button/button.spec.ts`'s existing test cases (label
 * rendering, icon, loading spinner, boolean-modifier classes, `as` prop).
 */
const meta: Meta<typeof UButton> = {
  title: "Vue/Button",
  component: UButton,
};

export default meta;
type Story = StoryObj<typeof UButton>;

/** Default state — label only, per button.spec.ts's "renders a native button element with the label" test. */
export const Default: Story = {
  args: {
    label: "Save",
  },
};

/** Icon state, per button.spec.ts's "renders an icon when the icon prop is set" test. */
export const WithIcon: Story = {
  args: {
    label: "Save",
    icon: "pi pi-check",
  },
};

/** Loading state, per button.spec.ts's "shows a spinner icon and hides the label icon when loading" test. */
export const Loading: Story = {
  args: {
    label: "Save",
    icon: "pi pi-check",
    loading: true,
  },
};

/** Severity/raised/rounded modifiers, per button.spec.ts's "applies boolean-modifier classes for severity/raised/rounded/text/outlined" test. */
export const Danger: Story = {
  args: {
    label: "Save",
    severity: "danger",
    raised: true,
    rounded: true,
  },
};
