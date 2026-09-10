import type { Meta, StoryObj } from "@storybook/angular";
import { URipple } from "./ripple";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `URipple` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents. Per this task's
 * brief, this story file's own prose (this comment) is the accessibility-
 * info source for `URipple` instead of an invented metadata record.
 *
 * Accessibility notes: `URipple` (`[uRipple]`) is a purely visual, decorative
 * ink-ripple effect attached to its host element on `mousedown` (see
 * `ripple.ts`). It creates a `<span class="u-ink">` marked
 * `aria-hidden="true"` and `role="presentation"` (see `ripple.ts`'s `create()`
 * method), so it is explicitly excluded from the accessibility tree and adds
 * no semantics, ARIA role, or keyboard behavior of its own — it only
 * augments the host element's existing visual feedback on pointer
 * interaction.
 *
 * State coverage below is sourced from `packages/ng/src/ripple/ripple.spec.ts`
 * (ripple span creation on mousedown).
 */
const meta: Meta<URipple> = {
  title: "Ng/Ripple",
  component: URipple,
};

export default meta;
type Story = StoryObj<URipple>;

/** Default state — click/mousedown the button below to trigger the ink ripple effect. */
export const Default: Story = {
  render: () => ({
    template: `<button type="button" uRipple style="position: relative; overflow: hidden; padding: 0.75rem 1.5rem;">Click me</button>`,
  }),
};
