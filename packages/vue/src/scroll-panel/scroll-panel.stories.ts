import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UScrollPanel } from "./index";

const meta: Meta<typeof UScrollPanel> = {
  title: "Vue/ScrollPanel",
  component: UScrollPanel,
};

export default meta;
type Story = StoryObj<typeof UScrollPanel>;

export const Default: Story = {
  render: () => ({
    components: { UScrollPanel },
    template: `
      <UScrollPanel style="width: 200px; height: 200px; border: 1px solid #ccc;">
        <div style="width: 400px; height: 400px; background: linear-gradient(45deg, #eee, #ccc);">
          Scrollable content
        </div>
      </UScrollPanel>
    `,
  }),
};
