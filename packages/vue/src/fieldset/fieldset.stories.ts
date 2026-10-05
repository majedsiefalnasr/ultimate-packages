import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UFieldset } from "./index";

const meta: Meta<typeof UFieldset> = {
  title: "Vue/Fieldset",
  component: UFieldset,
};

export default meta;
type Story = StoryObj<typeof UFieldset>;

export const Default: Story = {
  args: { legend: "Fieldset" },
  render: (args) => ({
    components: { UFieldset },
    setup() {
      return { args };
    },
    template: `<UFieldset v-bind="args"><p>Content within the fieldset.</p></UFieldset>`,
  }),
};

export const Toggleable: Story = {
  args: { legend: "Toggleable Fieldset", toggleable: true },
  render: (args) => ({
    components: { UFieldset },
    setup() {
      return { args };
    },
    template: `<UFieldset v-bind="args"><p>Content within the fieldset.</p></UFieldset>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { legend: "Collapsed Fieldset", toggleable: true, collapsed: true },
  render: (args) => ({
    components: { UFieldset },
    setup: () => ({ args }),
    template: `<UFieldset v-bind="args"><p>Content within the fieldset.</p></UFieldset>`,
  }),
};
