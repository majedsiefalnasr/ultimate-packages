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

/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled tab. */
export const WithDisabledTab: Story = {
  args: { value: 0 },
  render: (args) => ({
    props: args,
    template: `
      <u-tabs [value]="value">
        <u-tab-list>
          <u-tab [value]="0">Header 1</u-tab>
          <u-tab [value]="1" disabled>Header 2</u-tab>
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

/** GAP-064 G3-C1 verification story (Spec §9.2): overflowing tabs show the navigators. */
export const WithNavigators: Story = {
  args: { value: 0 },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 20rem;">
        <u-tabs [value]="value">
          <u-tab-list>
            <u-tab [value]="0">Header 1</u-tab>
            <u-tab [value]="1">Header 2</u-tab>
            <u-tab [value]="2">Header 3</u-tab>
            <u-tab [value]="3">Header 4</u-tab>
            <u-tab [value]="4">Header 5</u-tab>
            <u-tab [value]="5">Header 6</u-tab>
          </u-tab-list>
          <u-tab-panels>
            <u-tab-panel [value]="0">Content 1</u-tab-panel>
            <u-tab-panel [value]="1">Content 2</u-tab-panel>
            <u-tab-panel [value]="2">Content 3</u-tab-panel>
            <u-tab-panel [value]="3">Content 4</u-tab-panel>
            <u-tab-panel [value]="4">Content 5</u-tab-panel>
            <u-tab-panel [value]="5">Content 6</u-tab-panel>
          </u-tab-panels>
        </u-tabs>
      </div>
    `,
  }),
};
