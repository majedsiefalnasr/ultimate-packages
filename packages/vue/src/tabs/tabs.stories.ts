import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTabs, UTabList, UTab, UTabPanels, UTabPanel } from "./index";

const meta: Meta<typeof UTabs> = {
  title: "Vue/Tabs",
  component: UTabs,
};

export default meta;
type Story = StoryObj<typeof UTabs>;

export const Default: Story = {
  render: () => ({
    components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
    template: `
      <UTabs :value="0">
        <UTabList>
          <UTab :value="0">Header 1</UTab>
          <UTab :value="1">Header 2</UTab>
          <UTab :value="2">Header 3</UTab>
        </UTabList>
        <UTabPanels>
          <UTabPanel :value="0">Content 1</UTabPanel>
          <UTabPanel :value="1">Content 2</UTabPanel>
          <UTabPanel :value="2">Content 3</UTabPanel>
        </UTabPanels>
      </UTabs>
    `,
  }),
};
