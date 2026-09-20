import type { Meta, StoryObj } from "@storybook/angular";
import { URating } from "./rating";

const meta: Meta<URating> = {
  title: "Ng/Rating",
  component: URating,
};

export default meta;
type Story = StoryObj<URating>;

/** Default 5-star rating. */
export const Default: Story = {
  args: {
    stars: 5,
  },
};

/** Fewer stars. */
export const ThreeStars: Story = {
  args: {
    stars: 3,
  },
};

/** Read-only — value is displayed but cannot be changed. */
export const Readonly: Story = {
  args: {
    stars: 5,
    readonly: true,
  },
};
