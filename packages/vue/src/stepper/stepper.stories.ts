import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UStepper, UStepItem, UStepList, UStep, UStepPanels, UStepPanel } from "./index";

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

/** GAP-064 G3-C1 verification story (Spec §9.2): vertical layout with step items. */
export const Vertical: Story = {
  render: () => ({
    components: { UStepper, UStepItem, UStep, UStepPanel },
    template: `
      <UStepper :value="1">
        <UStepItem :value="1">
          <UStep :value="1">Personal</UStep>
          <UStepPanel :value="1">Personal details</UStepPanel>
        </UStepItem>
        <UStepItem :value="2">
          <UStep :value="2">Payment</UStep>
          <UStepPanel :value="2">Payment details</UStepPanel>
        </UStepItem>
        <UStepItem :value="3">
          <UStep :value="3">Confirmation</UStep>
          <UStepPanel :value="3">Confirmation</UStepPanel>
        </UStepItem>
      </UStepper>
    `,
  }),
};
