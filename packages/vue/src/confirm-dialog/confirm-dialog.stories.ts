import { UConfirmDialog } from "./index";
import { confirmationEventBus } from "@ultimate/vue-core";

/**
 * `UConfirmDialog` is service-driven — an always-mounted instance listens
 * on `confirmationEventBus` (the same event bus `UConfirmationService`
 * dispatches through) and renders whenever a confirmation matching its own
 * `group` arrives. This story dispatches directly on the bus, the same way
 * `UConfirmationService.require()` does internally.
 */
export default {
  title: "Vue/ConfirmDialog",
  component: UConfirmDialog,
};

export const Default = {
  render: () => ({
    components: { UConfirmDialog },
    methods: {
      requestConfirm() {
        confirmationEventBus.emit("confirm", {
          header: "Confirm",
          message: "Are you sure you want to delete this item?",
          accept: () => {},
        });
      },
    },
    template: `
      <div>
        <button @click="requestConfirm">Delete</button>
        <UConfirmDialog />
      </div>
    `,
  }),
};
