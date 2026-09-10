import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDialog } from "./dialog";

/**
 * Accessibility info source: `packages/component-metadata/src/records/dialog.ts`
 * (the `DIALOG_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/dialog/dialog.spec.tsx`'s existing test cases (renders
 * nothing when visible=false, role="dialog"/aria-modal/aria-labelledby/
 * aria-describedby when visible, closable).
 *
 * `UDialog` is fully controlled via its own `visible`/`onHide` props with no
 * internal open/close state (per dialog.tsx), so every story below wraps it
 * in a small local-state harness — a "Show dialog" trigger button plus
 * `visible`/`onHide` wiring — so the dialog is actually togglable when
 * rendered in Storybook, matching how any real consumer must drive it.
 */
const meta: Meta<typeof UDialog> = {
  title: "React/Dialog",
  component: UDialog,
};

export default meta;
type Story = StoryObj<typeof UDialog>;

function DialogHarness(props: React.ComponentProps<typeof UDialog>) {
  const [visible, setVisible] = React.useState(props.visible);
  return (
    <>
      <button type="button" onClick={() => setVisible(true)}>
        Show dialog
      </button>
      <UDialog {...props} visible={visible} onHide={() => setVisible(false)}>
        {props.children}
      </UDialog>
    </>
  );
}

/** Default state — closed (visible=false is UDialog's own caller-supplied default). */
export const Default: Story = {
  args: {
    visible: false,
    header: "Confirm",
    children: "Dialog body content.",
  },
  render: (args) => <DialogHarness {...args} />,
};

/**
 * Interactive open state, per dialog.spec.tsx's 'has role="dialog",
 * aria-modal, aria-labelledby, aria-describedby' test. `UDialog` renders via
 * a real `Portal` appended to `document.body` (not the story's own canvas
 * root), matching its real runtime behavior.
 */
export const Open: Story = {
  args: {
    visible: true,
    header: "Confirm",
    modal: true,
    children: "Dialog body content.",
  },
  render: (args) => <DialogHarness {...args} />,
};

/** Non-closable variant, per dialog.spec.tsx's `closable` prop coverage (no close icon rendered). */
export const NonClosable: Story = {
  args: {
    visible: true,
    header: "Non-closable",
    closable: false,
    children: "Cannot be closed via the header button.",
  },
  render: (args) => <DialogHarness {...args} />,
};
