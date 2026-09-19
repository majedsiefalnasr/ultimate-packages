import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UTab } from "./tab";
import { UTabList } from "./tab-list";
import { UTabPanel } from "./tab-panel";
import { UTabPanels } from "./tab-panels";
import { UTabs } from "./tabs";

const meta: Meta<UTabs> = {
  title: "Ng/Tabs",
  component: UTabs,
  decorators: [moduleMetadata({ imports: [UTabList, UTab, UTabPanels, UTabPanel] })],
};

export default meta;
type Story = StoryObj<UTabs>;

export const Default: Story = {
  args: { value: 0 },
  render: (args) => ({
    props: args,
    template: `
      <u-tabs [value]="value">
        <u-tab-list>
          <u-tab [value]="0">Header 1</u-tab>
          <u-tab [value]="1">Header 2</u-tab>
          <u-tab [value]="2">Header 3</u-tab>
        </u-tab-list>
        <u-tab-panels>
          <u-tab-panel [value]="0">Content 1</u-tab-panel>
          <u-tab-panel [value]="1">Content 2</u-tab-panel>
          <u-tab-panel [value]="2">Content 3</u-tab-panel>
        </u-tab-panels>
      </u-tabs>
    `,
  }),
};
