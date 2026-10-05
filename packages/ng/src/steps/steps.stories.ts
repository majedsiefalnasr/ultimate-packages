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

/** GAP-064 G3-C1 verification story (Spec §9.2): an explicitly disabled item (PX-C1). */
export const WithDisabledItem: Story = {
  args: {
    model: [{ label: "Personal" }, { label: "Payment", disabled: true }, { label: "Confirmation" }],
    activeIndex: 0,
    readonly: false,
  },
};
