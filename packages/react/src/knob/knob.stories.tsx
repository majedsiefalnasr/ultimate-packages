import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UKnob } from "./knob";

const meta: Meta<typeof UKnob> = {
  title: "React/Knob",
  component: UKnob,
};

export default meta;
type Story = StoryObj<typeof UKnob>;

function KnobHarness(props: Omit<React.ComponentProps<typeof UKnob>, "value" | "onChange">) {
  const [value, setValue] = React.useState(50);
  return <UKnob {...props} value={value} onChange={setValue} />;
}

/** Default knob. */
export const Default: Story = {
  render: () => <KnobHarness min={0} max={100} />,
};

/** Larger knob without the value text. */
export const NoValueText: Story = {
  render: () => <KnobHarness size={150} showValue={false} />,
};

/** Read-only — value displayed but cannot be changed. */
export const ReadOnly: Story = {
  render: () => <UKnob value={70} onChange={() => {}} readOnly />,
};
