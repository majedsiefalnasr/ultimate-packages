import type { Meta, StoryObj } from "@storybook/react-vite";
import { UProgressSpinner } from "./progress-spinner";

const meta: Meta<typeof UProgressSpinner> = {
  title: "React/ProgressSpinner",
  component: UProgressSpinner,
};

export default meta;
type Story = StoryObj<typeof UProgressSpinner>;

export const Default: Story = {};
