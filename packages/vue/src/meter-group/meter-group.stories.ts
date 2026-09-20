import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMeterGroup } from "./index";

const meta: Meta<typeof UMeterGroup> = {
  title: "Vue/MeterGroup",
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
  render: (args) => ({
    components: { UMeterGroup },
    setup: () => ({ args }),
    template: `<UMeterGroup v-bind="args" />`,
  }),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    value: [
      { label: "Apps", value: 25, color: "#3b82f6" },
      { label: "Photos", value: 15, color: "#22c55e" },
    ],
  },
  render: (args) => ({
    components: { UMeterGroup },
    setup: () => ({ args }),
    template: `<UMeterGroup v-bind="args" />`,
  }),
};
