import type { Meta, StoryObj } from "@storybook/angular";
import { UIftaLabel } from "./ifta-label";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UIftaLabel` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UIftaLabel` renders a `<u-ifta-label>` host wrapping
 * projected content (typically an input plus its `<label>`), applying no
 * ARIA role of its own. The projected `<label>`/`<input>` pair remains
 * responsible for its own label association (`for`/`id`).
 */
const meta: Meta<UIftaLabel> = {
  title: "Ng/IftaLabel",
  component: UIftaLabel,
};

export default meta;
type Story = StoryObj<UIftaLabel>;

/** Default — infield top-aligned label. */
export const Default: Story = {
  render: () => ({
    template: `
      <u-ifta-label>
        <input id="ifta-username" type="text" class="u-input-text" />
        <label for="ifta-username">Username</label>
      </u-ifta-label>
    `,
  }),
};
