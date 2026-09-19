import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UConfirmPopup } from "./index";
import { confirmationEventBus } from "@ultimate/vue-core";

/**
 * `UConfirmPopup` is service-driven, positioned relative to the request's
 * `target` element — an always-mounted instance listens on
 * `confirmationEventBus` and renders next to the triggering button.
 */
const meta: Meta<typeof UConfirmPopup> = {
  title: "Vue/ConfirmPopup",
  component: UConfirmPopup,
};

export default meta;
type Story = StoryObj<typeof UConfirmPopup>;

export const Default: Story = {
  render: () => ({
    components: { UConfirmPopup },
    methods: {
      requestConfirm(event: MouseEvent) {
        confirmationEventBus.emit("confirm", {
          message: "Are you sure you want to delete this record?",
          target: event.currentTarget,
          accept: () => {},
        });
      },
    },
    template: `
      <div>
        <button @click="requestConfirm">Delete</button>
        <UConfirmPopup />
      </div>
    `,
  }),
};
