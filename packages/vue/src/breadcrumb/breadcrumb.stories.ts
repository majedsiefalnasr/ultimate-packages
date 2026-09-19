import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UBreadcrumb } from "./index";

const meta: Meta<typeof UBreadcrumb> = {
  title: "Vue/Breadcrumb",
  component: UBreadcrumb,
};

export default meta;
type Story = StoryObj<typeof UBreadcrumb>;

const defaultModel = [
  { label: "Category", url: "/category" },
  { label: "Details", url: "/category/details" },
];

/** Default state — a home icon followed by a two-item trail. */
export const Default: Story = {
  args: {
    home: { icon: "pi pi-home", url: "/" },
    model: defaultModel,
  },
};

/** No home item — model-only trail. */
export const WithoutHome: Story = {
  args: {
    model: defaultModel,
  },
};

/** A disabled trailing item. */
export const WithDisabledItem: Story = {
  args: {
    home: { icon: "pi pi-home", url: "/" },
    model: [{ label: "Category", url: "/category" }, { label: "Disabled", disabled: true }],
  },
};
