import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTabView } from "./tab-view";
import { UTabPanel } from "./tab-panel";
import { UTabMenu } from "./tab-menu";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UTabView> = {
  title: "React/Tabs",
  component: UTabView,
};

export default meta;
type Story = StoryObj<typeof UTabView>;

export const TabView: Story = {
  render: () => (
    <UTabView>
      <UTabPanel header="Header 1">Content 1</UTabPanel>
      <UTabPanel header="Header 2">Content 2</UTabPanel>
      <UTabPanel header="Header 3">Content 3</UTabPanel>
    </UTabView>
  ),
};

const tabMenuModel: UMenuItem[] = [{ label: "Home" }, { label: "Calendar" }, { label: "Settings" }];

export const TabMenu: Story = {
  render: () => <UTabMenu model={tabMenuModel} activeIndex={0} />,
};
