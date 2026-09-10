import type { Meta, StoryObj } from "@storybook/angular";
import { UFluid } from "./fluid";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UFluid` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents. Per this task's
 * brief, this story file's own prose (this comment) is the accessibility-
 * info source for `UFluid` instead of an invented metadata record.
 *
 * Accessibility notes: `UFluid` is a purely presentational layout wrapper
 * (`<u-fluid>` renders `<ng-content>` with a `.u-fluid` host class, see
 * `fluid.ts`) — it has no interactive semantics, no ARIA role, and no
 * keyboard behavior of its own. It exists to make descendant form/input
 * components span the full width of their container; accessibility of any
 * given usage is entirely determined by the projected content.
 *
 * State coverage below is sourced from `packages/ng/src/fluid/fluid.spec.ts`
 * (host class application, content projection).
 */
const meta: Meta<UFluid> = {
  title: "Ng/Fluid",
  component: UFluid,
};

export default meta;
type Story = StoryObj<UFluid>;

/** Default state — projects arbitrary content, spanning full container width. */
export const Default: Story = {
  render: () => ({
    template: `<u-fluid><button type="button" style="width: 100%;">Full-width child</button></u-fluid>`,
  }),
};
