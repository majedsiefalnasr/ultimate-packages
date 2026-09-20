import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UBadge } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UBadge` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents; the same fallback
 * notice already used by `packages/ng/src/badge/badge.stories.ts` applies
 * here too.
 *
 * Accessibility notes: `UBadge` renders its `value` prop (or default slot
 * content) as plain text inside a `<span>` (see `Badge.vue`) — no ARIA role
 * is applied. It is purely a small status indicator and carries no
 * interactive/keyboard semantics of its own; when it conveys meaning beyond
 * decoration (e.g. an unread count), the consumer is responsible for
 * associating it with an accessible name on the element it annotates.
 *
 * State coverage below is sourced from `packages/vue/src/badge/badge.spec.ts`
 * (value rendering, default-slot override, root/circle/dot classes) plus
 * `base-badge.ts`'s own `severity`/`size` props.
 */
const meta: Meta<typeof UBadge> = {
  title: "Vue/Badge",
  component: UBadge,
};

export default meta;
type Story = StoryObj<typeof UBadge>;

/** Default state — a numeric value, per badge.spec.ts's "renders its value prop as text content" test. */
export const Default: Story = {
  args: {
    value: "5",
  },
};

/** Severity variant, per UBadge's own `severity` prop. */
export const Success: Story = {
  args: {
    value: "Active",
    severity: "success",
  },
};

/** Size variant, per UBadge's own `size` prop. */
export const Large: Story = {
  args: {
    value: "99+",
    size: "large",
  },
};

/** Dot variant — no value, no default slot, per badge.spec.ts's "applies u-badge-dot" test. */
export const Dot: Story = {
  args: {},
};
