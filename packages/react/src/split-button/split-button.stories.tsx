import type { Meta, StoryObj } from "@storybook/react-vite";
import { USplitButton } from "./split-button";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof USplitButton> = {
  title: "React/SplitButton",
  component: USplitButton,
};

export default meta;
type Story = StoryObj<typeof USplitButton>;

const defaultItems: UMenuItem[] = [{ label: "Delete" }, { label: "Rename" }, { label: "Duplicate" }];

export const Default: Story = {
  args: { label: "Save", model: defaultItems },
};

export const Disabled: Story = {
  args: { label: "Save", model: defaultItems, disabled: true },
};
