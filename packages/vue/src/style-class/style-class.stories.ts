import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UStyleClass } from "./style-class";

/**
 * `UStyleClass` (`v-style-class`) has no `packages/component-metadata/src/records/`
 * entry — same fallback pattern documented across this batch's other
 * stories. It is a click-driven class-toggle/animation directive, not a
 * form control or standalone component — it renders no UI of its own.
 *
 * State coverage below is sourced from
 * `packages/vue/src/style-class/style-class.spec.ts` (toggle, enter/leave
 * class sequence, selector resolution, outside-click/Escape dismissal).
 */
const meta: Meta = {
  title: "Vue/StyleClass",
};

export default meta;
type Story = StoryObj;

/** Toggles a single class on the next sibling element. */
export const ToggleClass: Story = {
  render: () => ({
    directives: { "style-class": UStyleClass },
    template: `
      <div>
        <button v-style-class="{ selector: '@next', toggleClass: 'u-storybook-active' }">Toggle</button>
        <div style="margin-top: 8px; padding: 8px; border: 1px solid #ccc;">Target content</div>
      </div>
    `,
  }),
};

/** Enter/leave animation class sequence on the next sibling, dismissed by outside click. */
export const EnterLeaveWithOutsideClick: Story = {
  render: () => ({
    directives: { "style-class": UStyleClass },
    template: `
      <div>
        <button
          v-style-class="{
            selector: '@next',
            enterFromClass: 'u-storybook-hidden',
            enterToClass: 'u-storybook-visible',
            leaveFromClass: 'u-storybook-visible',
            leaveToClass: 'u-storybook-hidden',
            hideOnOutsideClick: true,
          }"
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
