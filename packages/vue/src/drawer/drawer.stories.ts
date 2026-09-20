import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDrawer } from "./index";

const meta: Meta<typeof UDrawer> = {
  title: "Vue/Drawer",
  component: UDrawer,
};

export default meta;
type Story = StoryObj<typeof UDrawer>;

export const Default: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="Menu">Drawer body content.</UDrawer>
      </div>
    `,
  }),
  args: {},
};

export const RightPosition: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="Settings" position="right">Right-positioned drawer.</UDrawer>
      </div>
    `,
  }),
};
