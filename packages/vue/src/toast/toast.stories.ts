import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { toastEventBus } from "@ultimate/vue-core";
import { onMounted } from "vue";
import { UToast } from "./index";

const meta: Meta<typeof UToast> = {
  title: "Vue/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<typeof UToast>;

export const Default: Story = {
  render: () => ({ components: { UToast }, template: `<UToast />` }),
};

/**
 * GAP-064 G3-A verification story (Spec §13.3): six sticky messages, one per
 * severity. UToast is mounted (and listening) before the parent's onMounted.
 */
export const AllSeverities: Story = {
  render: () => ({
    components: { UToast },
    setup() {
      onMounted(() => {
        for (const severity of ["success", "info", "warn", "error", "secondary", "contrast"]) {
          toastEventBus.emit("add", {
            severity,
            summary: `${severity} summary`,
            detail: `${severity} detail`,
            sticky: true,
          });
        }
      });
      return {};
    },
    template: `<UToast />`,
  }),
};
