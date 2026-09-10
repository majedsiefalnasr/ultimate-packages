import type { Meta, StoryObj } from "@storybook/react-vite";
import { UButton } from "./button";

/**
 * Accessibility info source: `packages/component-metadata/src/records/button.ts`
 * (the `BUTTON_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/button/button.spec.tsx`'s existing test cases (label
 * rendering, disabled, loading, severity/size/outlined modifiers).
 */
const meta: Meta<typeof UButton> = {
  title: "React/Button",
  component: UButton,
};

export default meta;
type Story = StoryObj<typeof UButton>;

/** Default state — label only, per button.spec.tsx's "renders the label prop as visible text" test. */
export const Default: Story = {
  args: {
    label: "Save",
  },
};

/** Disabled state, per button.spec.tsx's "applies the disabled attribute ... when disabled is true" test. */
export const Disabled: Story = {
  args: {
    label: "Save",
    disabled: true,
  },
};

/** Loading state, per button.spec.tsx's "renders u-button-loading class and a spinner icon when loading is true" test. */
export const Loading: Story = {
  args: {
    label: "Save",
    loading: true,
  },
};

/** Severity/size/outlined modifiers, per button.spec.tsx's "applies severity/size/outlined boolean-modifier classes" test. */
export const Danger: Story = {
  args: {
    label: "Save",
    severity: "danger",
    size: "large",
    outlined: true,
  },
};
