import type { Meta, StoryObj } from "@storybook/angular";
import { UCarousel } from "./carousel";

const meta: Meta<UCarousel> = {
  title: "Ng/Carousel",
  component: UCarousel,
};

export default meta;
type Story = StoryObj<UCarousel>;

const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  args: { value: items, numVisible: 3, numScroll: 1 },
  render: (args) => ({
    props: args,
    template: `
      <u-carousel [value]="value" [numVisible]="numVisible" [numScroll]="numScroll">
        <ng-template #item let-item>
          <div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem;">{{ item }}</div>
        </ng-template>
      </u-carousel>
    `,
  }),
};

export const CircularWithAutoplay: Story = {
  args: { value: items, numVisible: 1, circular: true, autoplayInterval: 3000 },
  render: (args) => ({
    props: args,
    template: `
      <u-carousel [value]="value" [numVisible]="numVisible" [circular]="circular" [autoplayInterval]="autoplayInterval">
        <ng-template #item let-item>
          <div style="padding: 2rem; text-align: center; border: 1px solid #ddd;">{{ item }}</div>
        </ng-template>
      </u-carousel>
    `,
  }),
};
