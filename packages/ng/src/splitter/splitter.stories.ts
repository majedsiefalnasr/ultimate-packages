import type { Meta, StoryObj } from "@storybook/angular";
import { USplitter, USplitterPanel } from "./splitter";

const meta: Meta<USplitter> = {
  title: "Ng/Splitter",
  component: USplitter,
};

export default meta;
type Story = StoryObj<USplitter>;

export const Default: Story = {
  render: () => ({
    moduleMetadata: { imports: [USplitterPanel] },
    template: `<u-splitter style="height: 200px; display: flex;">
      <ng-template uSplitterPanel>Left panel</ng-template>
      <ng-template uSplitterPanel [uSplitterPanelMinSize]="20">Right panel</ng-template>
    </u-splitter>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): vertical layout. */
export const Vertical: Story = {
  render: () => ({
    moduleMetadata: { imports: [USplitterPanel] },
    template: `<u-splitter layout="vertical" style="height: 200px; display: flex;">
      <ng-template uSplitterPanel>Top panel</ng-template>
      <ng-template uSplitterPanel [uSplitterPanelMinSize]="20">Bottom panel</ng-template>
    </u-splitter>`,
  }),
};
