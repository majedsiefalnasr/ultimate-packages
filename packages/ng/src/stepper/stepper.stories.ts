import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UStep } from "./step";
import { UStepList } from "./step-list";
import { UStepPanel } from "./step-panel";
import { UStepPanels } from "./step-panels";
import { UStepper } from "./stepper";

const meta: Meta<UStepper> = {
  title: "Ng/Stepper",
  component: UStepper,
  decorators: [moduleMetadata({ imports: [UStepList, UStep, UStepPanels, UStepPanel] })],
};

export default meta;
type Story = StoryObj<UStepper>;

export const Default: Story = {
  args: { value: 1 },
  render: (args) => ({
    props: args,
    template: `
      <u-stepper [value]="value">
        <u-step-list>
          <u-step [value]="1">Personal</u-step>
          <u-step [value]="2">Payment</u-step>
          <u-step [value]="3">Confirmation</u-step>
        </u-step-list>
        <u-step-panels>
          <u-step-panel [value]="1">Personal details</u-step-panel>
          <u-step-panel [value]="2">Payment details</u-step-panel>
          <u-step-panel [value]="3">Confirmation</u-step-panel>
        </u-step-panels>
      </u-stepper>
    `,
  }),
};

export const Linear: Story = {
  args: { value: 1, linear: true },
  render: (args) => ({
    props: args,
    template: `
      <u-stepper [value]="value" [linear]="linear">
        <u-step-list>
          <u-step [value]="1">Personal</u-step>
          <u-step [value]="2">Payment</u-step>
          <u-step [value]="3">Confirmation</u-step>
        </u-step-list>
        <u-step-panels>
          <u-step-panel [value]="1">Personal details</u-step-panel>
          <u-step-panel [value]="2">Payment details</u-step-panel>
          <u-step-panel [value]="3">Confirmation</u-step-panel>
        </u-step-panels>
      </u-stepper>
    `,
  }),
};
