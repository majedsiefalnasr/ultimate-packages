import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMeterGroup } from "./meter-group";

const meta: Meta<typeof UMeterGroup> = {
  title: "React/MeterGroup",
  component: UMeterGroup,
};

export default meta;
type Story = StoryObj<typeof UMeterGroup>;

export const Default: Story = {
  args: {
    value: [
      { label: "Apps", value: 25, color: "#3b82f6" },
      { label: "Photos", value: 15, color: "#22c55e" },
      { label: "System", value: 10, color: "#f59e0b" },
    ],
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    value: [
      { label: "Apps", value: 25, color: "#3b82f6" },
      { label: "Photos", value: 15, color: "#22c55e" },
    ],
  },
};
