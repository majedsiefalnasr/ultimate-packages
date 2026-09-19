import type { Meta, StoryObj } from "@storybook/angular";
import { USteps } from "./steps";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<USteps> = {
  title: "Ng/Steps",
  component: USteps,
};

export default meta;
type Story = StoryObj<USteps>;

const model: UMenuItem[] = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

export const Default: Story = {
  args: { model, activeIndex: 0 },
};

export const NotReadonly: Story = {
  args: { model, activeIndex: 1, readonly: false },
};
