import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USteps } from "./index";

const meta: Meta<typeof USteps> = {
  title: "Vue/Steps",
  component: USteps,
};

export default meta;
type Story = StoryObj<typeof USteps>;

const model = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

export const Default: Story = {
  args: { model, activeStep: 0 },
};

export const NotReadonly: Story = {
  args: { model, activeStep: 1, readonly: false },
};
