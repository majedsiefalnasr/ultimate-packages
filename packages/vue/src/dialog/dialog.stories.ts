import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDialog } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/dialog.ts`
 * (the `DIALOG_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/dialog/dialog.spec.ts`'s existing test cases (renders
 * nothing when visible=false, role="dialog"/aria-modal/aria-labelledby when
 * visible, close button emits update:visible(false), non-closable variant).
 *
 * `UDialog` is fully controlled via `visible`/`update:visible` with no
 * internal open/close state of its own (per Dialog.vue's `close()` method,
 * which only emits), so every story below wraps it in a small local-ref
 * harness — a "Show dialog" trigger button plus `visible`/`update:visible`
 * wiring — so the dialog is actually togglable when rendered in Storybook,
 * matching how any real consumer must drive it (same harness pattern as
 * `packages/react/src/dialog/dialog.stories.tsx`).
 */
const meta: Meta<typeof UDialog> = {
  title: "Vue/Dialog",
  component: UDialog,
};

export default meta;
type Story = StoryObj<typeof UDialog>;

/** Default state — closed (visible=false is UDialog's own caller-supplied default). */
export const Default: Story = {
  args: {
    visible: false,
    header: "Confirm",
  },
  render: (args) => ({
    components: { UDialog },
    setup() {
      const visible = ref(args.visible);
      return { args, visible };
    },
    template: `
      <button type="button" @click="visible = true">Show dialog</button>
      <UDialog v-bind="args" v-model:visible="visible">Dialog body content.</UDialog>
    `,
  }),
};

/**
 * Interactive open state, per dialog.spec.ts's 'renders when visible is
 * true, with role=dialog/aria-modal/aria-labelledby' test. `UDialog` renders
 * via a real `Portal` appended to `document.body` (not the story's own
 * canvas root), matching its real runtime behavior.
 */
export const Open: Story = {
  args: {
    visible: true,
    header: "Confirm",
    modal: true,
  },
  render: Default.render,
};

/** Non-closable variant, per dialog.spec.ts's `closable` prop coverage (no close button rendered). */
export const NonClosable: Story = {
  args: {
    visible: true,
    header: "Non-closable",
    closable: false,
  },
  render: (args) => ({
    components: { UDialog },
    setup() {
      const visible = ref(args.visible);
      return { args, visible };
    },
    template: `
      <button type="button" @click="visible = true">Show dialog</button>
      <UDialog v-bind="args" v-model:visible="visible">Cannot be closed via the header button.</UDialog>
    `,
  }),
};
