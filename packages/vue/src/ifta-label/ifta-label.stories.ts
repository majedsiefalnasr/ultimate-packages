import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UIftaLabel } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UIftaLabel` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UIftaLabel` renders a `<span>` wrapping its default
 * slot (typically an input plus its `<label>`), applying no ARIA role of
 * its own.
 */
const meta: Meta<typeof UIftaLabel> = {
  title: "Vue/IftaLabel",
  component: UIftaLabel,
};

export default meta;
type Story = StoryObj<typeof UIftaLabel>;

/** Default — infield top-aligned label. */
export const Default: Story = {
  render: () => ({
    components: { UIftaLabel },
    template: `
      <UIftaLabel>
        <input id="ifta-username" type="text" class="u-input-text" />
        <label for="ifta-username">Username</label>
      </UIftaLabel>
    `,
  }),
};
