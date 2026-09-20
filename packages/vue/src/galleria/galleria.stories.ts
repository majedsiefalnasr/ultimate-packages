import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UGalleria } from "./index";

const meta: Meta<typeof UGalleria> = {
  title: "Vue/Galleria",
  component: UGalleria,
};

export default meta;
type Story = StoryObj<typeof UGalleria>;

const images = [
  "https://primefaces.org/cdn/primevue/images/galleria/galleria1.jpg",
  "https://primefaces.org/cdn/primevue/images/galleria/galleria2.jpg",
  "https://primefaces.org/cdn/primevue/images/galleria/galleria3.jpg",
];

export const Default: Story = {
  render: () => ({
    components: { UGalleria },
    data() {
      return { images };
    },
    template: `
      <div style="max-width: 40rem;">
        <UGalleria :value="images">
          <template #item="{ item }">
            <img :src="item" style="width: 100%; display: block;" />
          </template>
          <template #thumbnail="{ item }">
            <img :src="item" style="width: 5rem; display: block;" />
          </template>
        </UGalleria>
      </div>
    `,
  }),
};
