import type { Meta, StoryObj } from "@storybook/angular";
import { UAutoFocus } from "./auto-focus";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UAutoFocus` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents. Per this task's
 * brief, this story file's own prose (this comment) is the accessibility-
 * info source for `UAutoFocus` instead of an invented metadata record.
 *
 * Accessibility notes: `UAutoFocus` (`[uAutoFocus]`) manages DOM focus on
 * its host (or its first focusable descendant) once, deferred to after the
 * current change-detection pass (see `auto-focus.ts`). Automatic focus
 * movement on load is a well-known accessibility trade-off — it can
 * disorient screen-reader users if applied broadly — so it should only be
 * used deliberately (e.g. the first field of a freshly opened dialog), never
 * as a default on every page/component.
 *
 * State coverage below is sourced from
 * `packages/ng/src/autofocus/auto-focus.spec.ts` (focus moves to the host
 * element when `[uAutoFocus]="true"`).
 */
const meta: Meta<UAutoFocus> = {
  title: "Ng/AutoFocus",
  component: UAutoFocus,
};

export default meta;
type Story = StoryObj<UAutoFocus>;

/** Default state — the input below receives DOM focus automatically once rendered. */
export const Default: Story = {
  render: () => ({
    template: `<input type="text" placeholder="Auto-focused on load" [uAutoFocus]="true" />`,
  }),
};
