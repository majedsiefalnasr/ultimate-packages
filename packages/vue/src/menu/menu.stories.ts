import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMenu } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/menu.ts`
 * (the `MENU_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/menu/menu.spec.ts`'s existing test cases (non-popup mode
 * renders an always-visible inline ul[role=menu] with a role=menuitem per
 * model entry, role=separator for separator entries, aria-disabled on
 * disabled items).
 */
const meta: Meta<typeof UMenu> = {
  title: "Vue/Menu",
  component: UMenu,
};

export default meta;
type Story = StoryObj<typeof UMenu>;

const model = [
  { label: "New", command: () => {} },
  { label: "Open", command: () => {} },
  { separator: true },
  { label: "Disabled", disabled: true, command: () => {} },
  { label: "Delete", command: () => {} },
];

/** Default state — inline mode (popup=false, UMenu's own default), per menu.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    model,
  },
};
