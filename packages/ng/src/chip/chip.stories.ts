import type { Meta, StoryObj } from "@storybook/angular";
import { UChip } from "./chip";

const meta: Meta<UChip> = {
  title: "Ng/Chip",
  component: UChip,
};

export default meta;
type Story = StoryObj<UChip>;

export const Default: Story = {
  args: { label: "Action" },
  render: (args) => ({
    props: args,
    template: `<u-chip [label]="label"></u-chip>`,
  }),
};

export const WithIcon: Story = {
  args: { label: "Apple", icon: "pi pi-apple" },
  render: (args) => ({
    props: args,
    template: `<u-chip [label]="label" [icon]="icon"></u-chip>`,
  }),
};

export const Removable: Story = {
  args: { label: "Removable Chip", removable: true },
  render: (args) => ({
    props: args,
    template: `<u-chip [label]="label" [removable]="removable"></u-chip>`,
  }),
};
