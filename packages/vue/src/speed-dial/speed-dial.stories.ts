import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USpeedDial } from "./index";

const meta: Meta<typeof USpeedDial> = {
  title: "Vue/SpeedDial",
  component: USpeedDial,
};

export default meta;
type Story = StoryObj<typeof USpeedDial>;

const model = [
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
const commandModel = [
  { label: "Add", icon: "pi pi-plus", command: record("Add") },
  { label: "Edit", icon: "pi pi-pencil", command: record("Edit") },
  { label: "Hidden", icon: "pi pi-eye-slash", visible: false },
  { label: "Delete", icon: "pi pi-trash", disabled: true, command: record("Delete") },
];

/** GAP-064 G3-D verification story (Spec §9.1, PR-2): the four linear directions, a hidden and a disabled action, and a disabled trigger. The grid and padding are scaffolding only. */
export const Directions: Story = {
  render: () => ({
    components: { USpeedDial },
    setup: () => ({ model: commandModel }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, 12rem); gap: 1rem; padding: 12rem 2rem;">
        <USpeedDial :model="model" icon="pi pi-plus" direction="up" aria-label="Up" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="down" aria-label="Down" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="left" aria-label="Left" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="right" aria-label="Right" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="up" :disabled="true" aria-label="Disabled" />
      </div>
    `,
  }),
};

/** GAP-064 G3-D verification story (Spec §9.1): the mask (D3 B-2 overlay role + group 7). */
export const Mask: Story = {
  render: () => ({
    components: { USpeedDial },
    setup: () => ({ model: commandModel }),
    template: `<div style="padding: 12rem 2rem;"><USpeedDial :model="model" icon="pi pi-plus" direction="up" :mask="true" aria-label="Mask" /></div>`,
  }),
};
