import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UBreadcrumb } from "./breadcrumb";
import type { UMenuItem } from "@ultimate/ng-core";

/**
 * `UBreadcrumb`'s template binds `[routerLink]`, which requires Angular's
 * Router to be provided — matching `breadcrumb.spec.ts`'s own
 * `provideRouter([])` pattern, applied here via Storybook's
 * `applicationConfig` decorator.
 */
const meta: Meta<UBreadcrumb> = {
  title: "Ng/Breadcrumb",
  component: UBreadcrumb,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UBreadcrumb>;

const defaultModel: UMenuItem[] = [
  { label: "Category", routerLink: "/category" },
  { label: "Details", routerLink: "/category/details" },
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
    model: [{ label: "Category", routerLink: "/category" }, { label: "Disabled", disabled: true }],
  },
};
