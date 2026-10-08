import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { USpeedDial } from "./speed-dial";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<USpeedDial> = {
  title: "Ng/SpeedDial",
  component: USpeedDial,
};

export default meta;
type Story = StoryObj<USpeedDial>;

const model: UMenuItem[] = [
  { label: "Add", icon: "pi pi-plus" },
  { label: "Edit", icon: "pi pi-pencil" },
  { label: "Upload", icon: "pi pi-upload" },
  { label: "Delete", icon: "pi pi-trash" },
];

export const Default: Story = {
  args: { model, icon: "pi pi-plus", direction: "up" },
};

export const Circle: Story = {
  args: { model, icon: "pi pi-plus", type: "circle", radius: 80 },
};

const record = (label: string) => () => {
  document.body.dataset.g3dCommand = label;
};
const commandModel: UMenuItem[] = [
  { label: "Add", icon: "pi pi-plus", command: record("Add") },
  { label: "Edit", icon: "pi pi-pencil", command: record("Edit") },
  { label: "Hidden", icon: "pi pi-eye-slash", visible: false },
  { label: "Delete", icon: "pi pi-trash", disabled: true, command: record("Delete") },
];

/** GAP-064 G3-D verification story (Spec §9.1, PR-2): the four linear directions, a hidden and a disabled action, and a disabled trigger. The grid and padding are scaffolding only. */
export const Directions: Story = {
  decorators: [moduleMetadata({ imports: [USpeedDial] })],
  args: { model: commandModel },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, 12rem); gap: 1rem; padding: 12rem 2rem;">
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="up" ariaLabel="Up"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="down" ariaLabel="Down"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="left" ariaLabel="Left"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="right" ariaLabel="Right"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="up" [disabled]="true" ariaLabel="Disabled"></u-speed-dial>
      </div>
    `,
  }),
};

/** GAP-064 G3-D verification story (Spec §9.1): the mask (D3 B-2 overlay role + group 7). */
export const Mask: Story = {
  args: { model: commandModel, icon: "pi pi-plus", direction: "up", mask: true, ariaLabel: "Mask" },
  render: (args) => ({
    props: args,
    template: `<div style="padding: 12rem 2rem;"><u-speed-dial [model]="model" [icon]="icon" [direction]="direction" [mask]="mask" [ariaLabel]="ariaLabel"></u-speed-dial></div>`,
  }),
};
