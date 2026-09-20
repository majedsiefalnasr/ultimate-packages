import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UStepper, UStepList, UStep, UStepPanels, UStepPanel } from "./index";

const meta: Meta<typeof UStepper> = {
  title: "Vue/Stepper",
  component: UStepper,
};

export default meta;
type Story = StoryObj<typeof UStepper>;

export const Default: Story = {
  render: () => ({
    components: { UStepper, UStepList, UStep, UStepPanels, UStepPanel },
    template: `
      <UStepper :value="1">
        <UStepList>
          <UStep :value="1">Personal</UStep>
          <UStep :value="2">Payment</UStep>
          <UStep :value="3">Confirmation</UStep>
        </UStepList>
        <UStepPanels>
          <UStepPanel :value="1">Personal details</UStepPanel>
          <UStepPanel :value="2">Payment details</UStepPanel>
          <UStepPanel :value="3">Confirmation</UStepPanel>
        </UStepPanels>
      </UStepper>
    `,
  }),
};

export const Linear: Story = {
  render: () => ({
    components: { UStepper, UStepList, UStep, UStepPanels, UStepPanel },
    template: `
      <UStepper :value="1" linear>
        <UStepList>
          <UStep :value="1">Personal</UStep>
          <UStep :value="2">Payment</UStep>
          <UStep :value="3">Confirmation</UStep>
        </UStepList>
        <UStepPanels>
          <UStepPanel :value="1" v-slot="{ activateCallback }">
            Personal details
            <button type="button" @click="activateCallback(2)">Next</button>
          </UStepPanel>
          <UStepPanel :value="2">Payment details</UStepPanel>
          <UStepPanel :value="3">Confirmation</UStepPanel>
        </UStepPanels>
      </UStepper>
    `,
  }),
};
