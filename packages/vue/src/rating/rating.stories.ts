import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { URating } from "./index";

const meta: Meta<typeof URating> = {
  title: "Vue/Rating",
  component: URating,
};

export default meta;
type Story = StoryObj<typeof URating>;

/** Default 5-star rating. */
export const Default: Story = {
  args: {
    modelValue: null,
    stars: 5,
  },
};

/** Fewer stars. */
export const ThreeStars: Story = {
  args: {
    modelValue: null,
    stars: 3,
  },
};

/** Read-only — value is displayed but cannot be changed. */
export const Readonly: Story = {
  args: {
    modelValue: 4,
    stars: 5,
    readonly: true,
  },
};
