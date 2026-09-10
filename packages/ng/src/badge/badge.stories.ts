import type { Meta, StoryObj } from "@storybook/angular";
import { UBadge } from "./badge";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UBadge` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents. Per this task's
 * brief, this story file's own prose (this comment) is the accessibility-
 * info source for `UBadge` instead of an invented metadata record.
 *
 * Accessibility notes: `UBadge` renders its `value()` input as plain text
 * content inside a `<u-badge>` host element (see `badge.ts`) — no ARIA role
 * is applied. It is purely a small status indicator and carries no
 * interactive/keyboard semantics of its own; when it conveys meaning beyond
 * decoration (e.g. an unread count), the consumer is responsible for
 * associating it with an accessible name on the element it annotates.
 *
 * State coverage below is sourced from `packages/ng/src/badge/badge.spec.ts`
 * (value rendering, root class application) plus `badge.ts`'s own
 * `severity`/`badgeSize` inputs.
 */
const meta: Meta<UBadge> = {
  title: "Ng/Badge",
  component: UBadge,
};

export default meta;
type Story = StoryObj<UBadge>;

/** Default state — a numeric value, per badge.spec.ts's "renders its value input as text content" test. */
export const Default: Story = {
  args: {
    value: "5",
  },
};

/** Severity variant, per UBadge's own `severity` input. */
export const Success: Story = {
  args: {
    value: "Active",
    severity: "success",
  },
};

/** Size variant, per UBadge's own `badgeSize` input. */
export const Large: Story = {
  args: {
    value: "99+",
    badgeSize: "large",
  },
};
