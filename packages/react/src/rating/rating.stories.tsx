import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { URating } from "./rating";

const meta: Meta<typeof URating> = {
  title: "React/Rating",
  component: URating,
};

export default meta;
type Story = StoryObj<typeof URating>;

function RatingHarness(props: Omit<React.ComponentProps<typeof URating>, "value" | "onChange">) {
  const [value, setValue] = React.useState<number | null>(null);
  return <URating {...props} value={value} onChange={(event) => setValue(event.value)} />;
}

/** Default 5-star rating. */
export const Default: Story = {
  render: () => <RatingHarness stars={5} />,
};

/** Fewer stars. */
export const ThreeStars: Story = {
  render: () => <RatingHarness stars={3} />,
};

/** Read-only — value is displayed but cannot be changed. */
export const ReadOnly: Story = {
  render: () => <URating value={4} onChange={() => {}} stars={5} readOnly />,
};
