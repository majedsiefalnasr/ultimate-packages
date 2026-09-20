import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UToolbar } from "./index";

const meta: Meta<typeof UToolbar> = {
  title: "Vue/Toolbar",
  component: UToolbar,
};

export default meta;
type Story = StoryObj<typeof UToolbar>;

export const Default: Story = {
  render: () => ({
    components: { UToolbar },
    template: `<UToolbar>
      <template #start>Left</template>
      <template #end>Right</template>
    </UToolbar>`,
  }),
};
