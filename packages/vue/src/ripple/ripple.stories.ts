import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { rippleDirective } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `rippleDirective` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip), confirmed by listing its contents. Per the approved
 * Phase 10 Track A plan's §0 correction (Vue ships 9 items, not 8) and this
 * task's brief, this story file's own prose (this comment) is the
 * accessibility-info source for `v-ripple` instead of an invented metadata
 * record — same accommodation as Angular's Fluid/Badge/Ripple/AutoFocus in
 * Task 1 (see `packages/ng/src/ripple/ripple.stories.ts` for the equivalent
 * fallback-documentation pattern this mirrors).
 *
 * Accessibility notes, sourced from reading `packages/vue/src/ripple/ripple.ts`'s
 * real implementation: `rippleDirective` (`v-ripple`) is a purely visual,
 * decorative ink-ripple effect attached to its host element on `mousedown`
 * (see `onMouseDown()`). Its `mounted` hook creates a
 * `<span class="u-ink" role="presentation" aria-hidden="true">` (see
 * `createInk()`), so the ink element is explicitly excluded from the
 * accessibility tree and adds no semantics, ARIA role, or keyboard behavior
 * of its own — it only augments the host element's existing visual feedback
 * on pointer interaction. The directive registers no keyboard listeners at
 * all (only `mousedown` on the host and `animationend` on the ink element),
 * so it introduces no new interaction surface beyond what the host element
 * already exposes.
 *
 * State coverage below is sourced from `packages/vue/src/ripple/ripple.spec.ts`
 * (ink element creation on mount, `u-ink-active` class toggle on mousedown,
 * ink removal on unmount).
 */
const meta: Meta = {
  title: "Vue/Ripple",
  render: () => ({
    directives: { ripple: rippleDirective },
    template: `<button type="button" v-ripple style="position: relative; overflow: hidden; padding: 0.75rem 1.5rem;">Click me</button>`,
  }),
};

export default meta;
type Story = StoryObj;

/** Default state — click/mousedown the button below to trigger the ink ripple effect. */
export const Default: Story = {};
