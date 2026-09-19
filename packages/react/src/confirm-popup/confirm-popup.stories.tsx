import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { confirmPopup } from "@ultimate/react-core";
import { UButton } from "../button/button";
import { UConfirmPopup } from "./confirm-popup";

/**
 * `UConfirmPopup` is service-driven, positioned relative to the
 * `target` element — an always-mounted instance listens for
 * `confirmPopup()` calls and renders next to the triggering button.
 */
const meta: Meta<typeof UConfirmPopup> = {
  title: "React/ConfirmPopup",
  component: UConfirmPopup,
};

export default meta;
type Story = StoryObj<typeof UConfirmPopup>;

function Demo() {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <UButton
        ref={ref}
        label="Delete"
        severity="danger"
        onClick={() =>
          confirmPopup({
            message: "Are you sure you want to delete this record?",
            target: ref.current,
            accept: () => {},
          })
        }
      />
      <UConfirmPopup />
    </>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};
