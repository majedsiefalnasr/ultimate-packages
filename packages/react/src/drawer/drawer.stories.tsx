import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDrawer } from "./drawer";

const meta: Meta<typeof UDrawer> = {
  title: "React/Drawer",
  component: UDrawer,
};

export default meta;
type Story = StoryObj<typeof UDrawer>;

function DrawerHarness(props: React.ComponentProps<typeof UDrawer>) {
  const [visible, setVisible] = React.useState(props.visible);
  return (
    <>
      <button type="button" onClick={() => setVisible(true)}>
        Show drawer
      </button>
      <UDrawer {...props} visible={visible} onHide={() => setVisible(false)}>
        {props.children}
      </UDrawer>
    </>
  );
}

export const Default: Story = {
  args: { visible: false, header: "Menu" },
  render: (args) => <DrawerHarness {...args}>Drawer body content.</DrawerHarness>,
};

export const RightPosition: Story = {
  args: { visible: false, header: "Settings", position: "right" },
  render: (args) => <DrawerHarness {...args}>Right-positioned drawer.</DrawerHarness>,
};
