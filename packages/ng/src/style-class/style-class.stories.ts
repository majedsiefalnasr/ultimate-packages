import type { Meta, StoryObj } from "@storybook/angular";
import { UStyleClass } from "./style-class";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UStyleClass` has no
 * `packages/component-metadata/src/records/` entry (same fallback pattern
 * `UKeyFilter`'s own story file documents) — this comment is the
 * accessibility-info source instead of an invented metadata record.
 *
 * `UStyleClass` (`[uStyleClass]`) is a click-driven class-toggle/animation
 * behavior, not a form control or standalone visible component — it does
 * not manage focus or ARIA state of its own; the triggering element and the
 * target element retain their own accessibility semantics.
 *
 * State coverage below is sourced from
 * `packages/ng/src/style-class/style-class.spec.ts` (toggle, enter/leave
 * class sequence, selector resolution, outside-click/Escape dismissal).
 */
const meta: Meta<UStyleClass> = {
  title: "Ng/StyleClass",
  component: UStyleClass,
};

export default meta;
type Story = StoryObj<UStyleClass>;

/** Toggles a single class on the next sibling element. */
export const ToggleClass: Story = {
  render: () => ({
    template: `
      <div>
        <button uStyleClass="@next" toggleClass="u-storybook-active">Toggle</button>
        <div style="margin-top: 8px; padding: 8px; border: 1px solid #ccc;">Target content</div>
      </div>
    `,
  }),
};

/** Enter/leave animation class sequence on the next sibling, dismissed by outside click. */
export const EnterLeaveWithOutsideClick: Story = {
  render: () => ({
    template: `
      <div>
        <button
          uStyleClass="@next"
          enterFromClass="u-storybook-hidden"
          enterToClass="u-storybook-visible"
          leaveFromClass="u-storybook-visible"
          leaveToClass="u-storybook-hidden"
          [hideOnOutsideClick]="true"
        >
          Show panel
        </button>
        <div class="u-storybook-hidden" style="margin-top: 8px; padding: 8px; border: 1px solid #ccc;">
          Panel content
        </div>
      </div>
    `,
  }),
};
