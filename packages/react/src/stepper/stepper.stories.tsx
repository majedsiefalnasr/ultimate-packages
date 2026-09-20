import type { Meta, StoryObj } from "@storybook/react-vite";
import { UStepper } from "./stepper";
import { UStepperPanel } from "./stepper-panel";

const meta: Meta<typeof UStepper> = {
  title: "React/Stepper",
  component: UStepper,
};

export default meta;
type Story = StoryObj<typeof UStepper>;

export const Default: Story = {
  render: () => (
    <UStepper activeStep={0}>
      <UStepperPanel header="Personal">Personal details</UStepperPanel>
      <UStepperPanel header="Payment">Payment details</UStepperPanel>
      <UStepperPanel header="Confirmation">Confirmation</UStepperPanel>
    </UStepper>
  ),
};

export const Linear: Story = {
  render: () => (
    <UStepper activeStep={0} linear>
      <UStepperPanel header="Personal">
        {({ nextCallback }) => (
          <>
            Personal details
            <button type="button" onClick={nextCallback}>
              Next
            </button>
          </>
        )}
      </UStepperPanel>
      <UStepperPanel header="Payment">Payment details</UStepperPanel>
      <UStepperPanel header="Confirmation">Confirmation</UStepperPanel>
    </UStepper>
  ),
};
