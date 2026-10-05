import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInplace } from "./index";

const meta: Meta<typeof UInplace> = {
  title: "Vue/Inplace",
  component: UInplace,
};

export default meta;
type Story = StoryObj<typeof UInplace>;

export const Default: Story = {
  render: () => ({
    components: { UInplace },
    template: `
      <UInplace>
        <template #display>Click to Edit</template>
        <template #content="{ closeCallback }">
          <input type="text" value="Editable content" />
          <button type="button" @click="closeCallback">Close</button>
        </template>
      </UInplace>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): disabled display. */
export const Disabled: Story = {
  render: () => ({
    components: { UInplace },
    template: `
      <UInplace disabled>
        <template #display>Click to Edit</template>
        <template #content="{ closeCallback }">
          <input type="text" value="Editable content" />
          <button type="button" @click="closeCallback">Close</button>
        </template>
      </UInplace>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): active (content shown). */
export const Active: Story = {
  render: () => ({
    components: { UInplace },
    template: `
      <UInplace active>
        <template #display>Click to Edit</template>
        <template #content="{ closeCallback }">
          <input type="text" value="Editable content" />
          <button type="button" @click="closeCallback">Close</button>
        </template>
      </UInplace>
    `,
  }),
};
