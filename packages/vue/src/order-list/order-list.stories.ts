import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import UOrderList from "./OrderList.vue";

const meta: Meta<typeof UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<typeof UOrderList>;

export const Default: Story = {
  args: { modelValue: ["Apple", "Banana", "Cherry", "Date"] },
};

export const Controlled: Story = {
  render: () => ({
    components: { UOrderList },
    setup() {
      const modelValue = ref(["Apple", "Banana", "Cherry", "Date"]);
      return { modelValue };
    },
    template: '<UOrderList v-model="modelValue" />',
  }),
};
