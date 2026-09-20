import type { Meta, StoryObj } from "@storybook/react-vite";
import { confirmDialog } from "@ultimate/react-core";
import { UButton } from "../button/button";
import { UConfirmDialog } from "./confirm-dialog";

/**
 * `UConfirmDialog` is service-driven — an always-mounted instance listens
 * for `confirmDialog()` calls and renders whenever one arrives with a
 * matching `group`, mirrored here via a trigger button calling the
 * imported `confirmDialog()` function directly.
 */
const meta: Meta<typeof UConfirmDialog> = {
  title: "React/ConfirmDialog",
  component: UConfirmDialog,
};

export default meta;
type Story = StoryObj<typeof UConfirmDialog>;

export const Default: Story = {
  render: () => (
    <>
      <UButton
        label="Delete"
        onClick={() =>
          confirmDialog({
            header: "Confirm",
            message: "Are you sure you want to delete this item?",
            accept: () => {},
          })
        }
      />
      <UConfirmDialog />
    </>
  ),
};
