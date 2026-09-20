import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInplace } from "./inplace";

const meta: Meta<typeof UInplace> = {
  title: "React/Inplace",
  component: UInplace,
};

export default meta;
type Story = StoryObj<typeof UInplace>;

export const Default: Story = {
  render: () => (
    <UInplace display={<span>Click to Edit</span>}>
      {(closeCallback) => (
        <>
          <input type="text" defaultValue="Editable content" />
          <button type="button" onClick={(e) => closeCallback(e)}>
            Close
          </button>
        </>
      )}
    </UInplace>
  ),
};
