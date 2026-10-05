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

/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { legend: "Collapsed Fieldset", toggleable: true, collapsed: true },
  render: (args) => ({
    props: args,
    template: `
      <u-fieldset [legend]="legend" [toggleable]="toggleable" [collapsed]="collapsed">
        <p>Content within the fieldset.</p>
      </u-fieldset>
    `,
  }),
};
