import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { USplitButton } from "./split-button";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<USplitButton> = {
  title: "Ng/SplitButton",
  component: USplitButton,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<USplitButton>;

const defaultItems: UMenuItem[] = [{ label: "Delete" }, { label: "Rename" }, { label: "Duplicate" }];

export const Default: Story = {
  args: { label: "Save", model: defaultItems },
};

export const Disabled: Story = {
  args: { label: "Save", model: defaultItems, disabled: true },
};
