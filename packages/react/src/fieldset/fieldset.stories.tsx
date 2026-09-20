import type { Meta, StoryObj } from "@storybook/react-vite";
import { UFieldset } from "./fieldset";

const meta: Meta<typeof UFieldset> = {
  title: "React/Fieldset",
  component: UFieldset,
};

export default meta;
type Story = StoryObj<typeof UFieldset>;

export const Default: Story = {
  args: { legend: "Fieldset" },
  render: (args) => (
    <UFieldset {...args}>
      <p>Content within the fieldset.</p>
    </UFieldset>
  ),
};

export const Toggleable: Story = {
  args: { legend: "Toggleable Fieldset", toggleable: true },
  render: (args) => (
    <UFieldset {...args}>
      <p>Content within the fieldset.</p>
    </UFieldset>
  ),
};
