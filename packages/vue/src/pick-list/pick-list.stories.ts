import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import UPickList from "./PickList.vue";

const meta: Meta<typeof UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<typeof UPickList>;
export const Default: Story = { args: { modelValue: [["Apple", "Banana"], ["Cherry"]] } };

export const Controlled: Story = {
  render: () => ({
    components: { UPickList },
    setup() {
      const modelValue = ref([["Apple", "Banana"], ["Cherry"]] as [string[], string[]]);
      return { modelValue };
    },
    template: '<UPickList v-model="modelValue" />',
  }),
};
