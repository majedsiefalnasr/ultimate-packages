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

/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled tab. */
export const WithDisabledTab: Story = {
  render: () => ({
    components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
    template: `
      <UTabs :value="0">
        <UTabList>
          <UTab :value="0">Header 1</UTab>
          <UTab :value="1" disabled>Header 2</UTab>
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

/** GAP-064 G3-C1 verification story (Spec §9.2): overflowing tabs show the navigators. */
export const WithNavigators: Story = {
  render: () => ({
    components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
    template: `
      <div style="width: 20rem;">
        <UTabs :value="0">
          <UTabList>
            <UTab :value="0">Header 1</UTab>
            <UTab :value="1">Header 2</UTab>
            <UTab :value="2">Header 3</UTab>
            <UTab :value="3">Header 4</UTab>
            <UTab :value="4">Header 5</UTab>
            <UTab :value="5">Header 6</UTab>
          </UTabList>
          <UTabPanels>
            <UTabPanel :value="0">Content 1</UTabPanel>
            <UTabPanel :value="1">Content 2</UTabPanel>
            <UTabPanel :value="2">Content 3</UTabPanel>
            <UTabPanel :value="3">Content 4</UTabPanel>
            <UTabPanel :value="4">Content 5</UTabPanel>
            <UTabPanel :value="5">Content 6</UTabPanel>
          </UTabPanels>
        </UTabs>
      </div>
    `,
  }),
};
