import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTag } from "./index";

const meta: Meta<typeof UTag> = {
  title: "Vue/Tag",
  component: UTag,
};

export default meta;
type Story = StoryObj<typeof UTag>;

export const Default: Story = {
  render: () => ({ components: { UTag }, template: `<UTag>New</UTag>` }),
};

export const Severity: Story = {
  render: () => ({ components: { UTag }, template: `<UTag severity="success">Success</UTag>` }),
};

/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UTag },
    template: `
      <UTag severity="success" value="Success" />
      <UTag severity="info" value="Info" />
      <UTag severity="warn" value="Warn" />
      <UTag severity="danger" value="Danger" />
      <UTag severity="secondary" value="Secondary" />
      <UTag severity="contrast" value="Contrast" />
    `,
  }),
};
