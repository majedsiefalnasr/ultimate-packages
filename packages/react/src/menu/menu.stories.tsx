import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMenu, type UMenuItem } from "./menu";

/**
 * Accessibility info source: `packages/component-metadata/src/records/menu.ts`
 * (the `MENU_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/menu/menu.spec.tsx`'s existing test cases (inline mode
 * renders role="menu" with a menuitem per model entry, separators,
 * disabled items).
 */
const meta: Meta<typeof UMenu> = {
  title: "React/Menu",
  component: UMenu,
};

export default meta;
type Story = StoryObj<typeof UMenu>;

const model: UMenuItem[] = [
  { label: "New", command: () => {} },
  { label: "Open", command: () => {} },
  { separator: true },
  { label: "Disabled", disabled: true, command: () => {} },
];

/** Default state — inline mode (popup=false, UMenu's own default), per menu.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    model,
  },
};
