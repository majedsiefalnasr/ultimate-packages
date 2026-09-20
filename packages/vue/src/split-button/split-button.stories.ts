import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USplitButton } from "./index";

const meta: Meta<typeof USplitButton> = {
  title: "Vue/SplitButton",
  component: USplitButton,
};

export default meta;
type Story = StoryObj<typeof USplitButton>;

const model = [
  { label: "Save As...", icon: "pi pi-file" },
  { label: "Export", icon: "pi pi-download" },
  { separator: true },
  { label: "Delete", icon: "pi pi-trash" },
];

/** Default state — a labeled default action, attached to a dropdown of secondary commands. */
export const Default: Story = {
  args: {
    label: "Save",
    model,
  },
};
