import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDynamicDialog } from "./index";
import { dialogEventBus } from "@ultimate/vue-core";

const DemoContent = {
  props: { label: { type: String, default: "" } },
  template: `<p>Dynamically-loaded content for: {{ label }}</p>`,
};

/**
 * `UDialogService.open(component, options)` dispatches an open request the
 * always-mounted `UDynamicDialog` subscribes to and renders, loading the
 * given component's props via `inputValues`. This story dispatches
 * directly on `dialogEventBus`, the same bus `UDialogService.open()` emits
 * on internally.
 */
const meta: Meta<typeof UDynamicDialog> = {
  title: "Vue/DynamicDialog",
  component: UDynamicDialog,
};

export default meta;
type Story = StoryObj<typeof UDynamicDialog>;

export const Default: Story = {
  render: () => ({
    components: { UDynamicDialog },
    methods: {
      openDialog() {
        const ref = {
          content: DemoContent,
          options: { header: "Dynamic Dialog", inputValues: { label: "Ultimate" } },
          close(params?: unknown) {
            dialogEventBus.emit("close", { ref, params });
          },
        };
        dialogEventBus.emit("open", { ref });
      },
    },
    template: `
      <div>
        <button @click="openDialog">Open dynamic dialog</button>
        <UDynamicDialog />
      </div>
    `,
  }),
};
