import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UCarousel } from "./index";

const meta: Meta<typeof UCarousel> = {
  title: "Vue/Carousel",
  component: UCarousel,
};

export default meta;
type Story = StoryObj<typeof UCarousel>;

const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <UCarousel :value="items" :numVisible="3" :numScroll="1">
        <template #item="{ data }">
          <div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem;">{{ data }}</div>
        </template>
      </UCarousel>
    `,
  }),
};

export const CircularWithAutoplay: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <UCarousel :value="items" :numVisible="1" circular :autoplayInterval="3000">
        <template #item="{ data }">
          <div style="padding: 2rem; text-align: center; border: 1px solid #ddd;">{{ data }}</div>
        </template>
      </UCarousel>
    `,
  }),
};

/** GAP-064 G3-E verification story: vertical orientation. */
export const Vertical: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <UCarousel :value="items" :numVisible="1" :numScroll="1" orientation="vertical">
        <template #item="{ data }">
          <div style="padding: 2rem; text-align: center; border: 1px solid #ddd;">{{ data }}</div>
        </template>
      </UCarousel>
    `,
  }),
};

/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) rules). */
export const Rtl: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <div dir="rtl">
        <UCarousel :value="items" :numVisible="3" :numScroll="1">
          <template #item="{ data }">
            <div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem;">{{ data }}</div>
          </template>
        </UCarousel>
      </div>
    `,
  }),
};
