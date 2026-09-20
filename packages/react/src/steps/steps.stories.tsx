import type { Meta, StoryObj } from "@storybook/react-vite";
import { USteps } from "./steps";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof USteps> = {
  title: "React/Steps",
  component: USteps,
};

export default meta;
type Story = StoryObj<typeof USteps>;

const model: UMenuItem[] = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

export const Default: Story = {
  args: { model, activeIndex: 0 },
};

export const NotReadonly: Story = {
  args: { model, activeIndex: 1, readonly: false },
};
