import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UPanel } from "./index";

const meta: Meta<typeof UPanel> = {
  title: "Vue/Panel",
  component: UPanel,
};

export default meta;
type Story = StoryObj<typeof UPanel>;

export const Default: Story = {
  args: { header: "Panel" },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};

export const Toggleable: Story = {
  args: { header: "Toggleable Panel", toggleable: true },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { header: "Collapsed Panel", toggleable: true, collapsed: true },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): footer slot (Vue renders the footer wrapper). */
export const WithFooter: Story = {
  args: { header: "Panel with Footer" },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p><template #footer>Footer content</template></UPanel>`,
  }),
};
