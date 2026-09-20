import type { Meta, StoryObj } from "@storybook/angular";
import { UFieldset } from "./fieldset";

const meta: Meta<UFieldset> = {
  title: "Ng/Fieldset",
  component: UFieldset,
};

export default meta;
type Story = StoryObj<UFieldset>;

export const Default: Story = {
  args: { legend: "Fieldset" },
  render: (args) => ({
    props: args,
    template: `
      <u-fieldset [legend]="legend">
        <p>Content within the fieldset.</p>
      </u-fieldset>
    `,
  }),
};

export const Toggleable: Story = {
  args: { legend: "Toggleable Fieldset", toggleable: true },
  render: (args) => ({
    props: args,
    template: `
      <u-fieldset [legend]="legend" [toggleable]="toggleable">
        <p>Content within the fieldset.</p>
      </u-fieldset>
    `,
  }),
};
