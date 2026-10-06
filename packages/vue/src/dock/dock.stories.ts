import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDock } from "./index";

const meta: Meta<typeof UDock> = {
  title: "Vue/Dock",
  component: UDock,
};

export default meta;
type Story = StoryObj<typeof UDock>;

const model = [
  { label: "Finder", icon: "pi pi-search" },
  { label: "Mail", icon: "pi pi-envelope" },
  { label: "Calendar", icon: "pi pi-calendar" },
  { label: "Trash", icon: "pi pi-trash" },
];

export const Default: Story = {
  args: { model, position: "bottom" },
};

export const LeftPosition: Story = {
  args: { model, position: "left" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): top position. */
export const TopPosition: Story = {
  args: { model, position: "top" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): right position. */
export const RightPosition: Story = {
  args: { model, position: "right" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled item. */
export const WithDisabledItem: Story = {
  args: {
    model: [model[0], { ...model[1], disabled: true }, model[2], model[3]],
    position: "bottom",
  },
};
