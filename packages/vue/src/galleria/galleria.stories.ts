import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UGalleria } from "./index";

const meta: Meta<typeof UGalleria> = {
  title: "Vue/Galleria",
  component: UGalleria,
};

export default meta;
type Story = StoryObj<typeof UGalleria>;

const images = ["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"];

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

/** GAP-064 G3-E verification story: item navigators without thumbnails (same setup as Default). */
export const WithoutThumbnails: Story = {
  render: () => ({
    components: { UGalleria },
    data: () => ({ images }),
    template: `
      <div style="max-width: 40rem;">
        <UGalleria :value="images" :showThumbnails="false">
          <template #item="{ item }"><img :src="item" style="width: 100%; display: block;" /></template>
        </UGalleria>
      </div>
    `,
  }),
};

/** GAP-064 G3-E verification story: full screen, opened through its trigger. */
export const FullScreen: Story = {
  render: () => ({
    components: { UGalleria },
    setup() {
      const active = ref(false);
      return { images, active };
    },
    template: `
      <div>
        <button type="button" @click="active = true">Show</button>
        <UGalleria :value="images" fullScreen v-model:fullScreenActive="active">
          <template #item="{ item }"><img :src="item" style="width: 100%; display: block;" /></template>
          <template #thumbnail="{ item }"><img :src="item" style="width: 5rem; display: block;" /></template>
        </UGalleria>
      </div>
    `,
  }),
};
