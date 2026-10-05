import type { Meta, StoryObj } from "@storybook/angular";
import { UPanel } from "./panel";

const meta: Meta<UPanel> = {
  title: "Ng/Panel",
  component: UPanel,
};

export default meta;
type Story = StoryObj<UPanel>;

export const Default: Story = {
  args: { header: "Panel" },
  render: (args) => ({
    props: args,
    template: `<u-panel [header]="header"><p>Panel content.</p></u-panel>`,
  }),
};

export const Toggleable: Story = {
  args: { header: "Toggleable Panel", toggleable: true },
  render: (args) => ({
    props: args,
    template: `<u-panel [header]="header" [toggleable]="toggleable"><p>Panel content.</p></u-panel>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { header: "Collapsed Panel", toggleable: true, collapsed: true },
  render: (args) => ({
    props: args,
    template: `<u-panel [header]="header" [toggleable]="toggleable" [collapsed]="collapsed"><p>Panel content.</p></u-panel>`,
  }),
};
