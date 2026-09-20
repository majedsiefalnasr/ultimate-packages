import type { Meta, StoryObj } from "@storybook/react-vite";
import { UBreadcrumb } from "./breadcrumb";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UBreadcrumb> = {
  title: "React/Breadcrumb",
  component: UBreadcrumb,
};

export default meta;
type Story = StoryObj<typeof UBreadcrumb>;

const defaultModel: UMenuItem[] = [
  { label: "Category", url: "/category" },
  { label: "Details", url: "/category/details" },
];

export const Default: Story = {
  args: { home: { icon: "🏠", url: "/" }, model: defaultModel },
};

export const WithoutHome: Story = {
  args: { model: defaultModel },
};

export const WithDisabledItem: Story = {
  args: {
    home: { icon: "🏠", url: "/" },
    model: [{ label: "Category", url: "/category" }, { label: "Disabled", disabled: true }],
  },
};
