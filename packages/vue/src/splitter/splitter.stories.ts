import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USplitter } from "./index";

const meta: Meta<typeof USplitter> = {
  title: "Vue/Splitter",
  component: USplitter,
};

export default meta;
type Story = StoryObj<typeof USplitter>;

export const Default: Story = {
  render: () => ({
    components: { USplitter },
    setup: () => ({ panels: [{ label: "Left panel" }, { label: "Right panel", minSize: 20 }] }),
    template: `<USplitter :panels="panels" style="height: 200px;">
      <template #default="{ item }">{{ item.label }}</template>
    </USplitter>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): vertical layout. */
export const Vertical: Story = {
  render: () => ({
    components: { USplitter },
    setup: () => ({ panels: [{ label: "Top panel" }, { label: "Bottom panel", minSize: 20 }] }),
    template: `<USplitter :panels="panels" layout="vertical" style="height: 200px;">
      <template #default="{ item }">{{ item.label }}</template>
    </USplitter>`,
  }),
};
