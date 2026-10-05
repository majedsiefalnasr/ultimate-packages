import type { Meta, StoryObj } from "@storybook/angular";
import { UMeterGroup } from "./meter-group";

const meta: Meta<UMeterGroup> = {
  title: "Ng/MeterGroup",
  component: UMeterGroup,
};

export default meta;
type Story = StoryObj<UMeterGroup>;

export const Default: Story = {
  render: () => ({
    props: {
      value: [
        { label: "Apps", value: 25, color: "#3b82f6" },
        { label: "Photos", value: 15, color: "#22c55e" },
        { label: "System", value: 10, color: "#f59e0b" },
      ],
    },
    template: `<u-meter-group [value]="value"></u-meter-group>`,
  }),
};

export const Vertical: Story = {
  render: () => ({
    props: {
      value: [
        { label: "Apps", value: 25, color: "#3b82f6" },
        { label: "Photos", value: 15, color: "#22c55e" },
      ],
    },
    // The vertical meter fills its container's height, so the story gives it a fixed-height one
    // (the host is a flex container too, so the inner root receives that height).
    template: `<div style="display: flex; height: 12rem"><u-meter-group [value]="value" orientation="vertical" style="display: flex"></u-meter-group></div>`,
  }),
};
