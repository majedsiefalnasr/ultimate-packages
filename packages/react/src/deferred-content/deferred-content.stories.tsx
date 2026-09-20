import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDeferredContent } from "./deferred-content";

const meta: Meta<typeof UDeferredContent> = {
  title: "React/DeferredContent",
  component: UDeferredContent,
};

export default meta;
type Story = StoryObj<typeof UDeferredContent>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "150vh" }}>
      <p>Scroll down</p>
      <UDeferredContent>
        <div style={{ marginTop: "100vh", padding: "2rem", background: "#eee" }}>
          I load once scrolled into view
        </div>
      </UDeferredContent>
    </div>
  ),
};
