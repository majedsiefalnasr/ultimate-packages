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
