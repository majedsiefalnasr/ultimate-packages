import type { Meta, StoryObj } from "@storybook/angular";
import { UGalleria } from "./galleria";

const meta: Meta<UGalleria> = {
  title: "Ng/Galleria",
  component: UGalleria,
};

export default meta;
type Story = StoryObj<UGalleria>;

const images = [
  "https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg",
  "https://primefaces.org/cdn/primeng/images/galleria/galleria2.jpg",
  "https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg",
];

export const Default: Story = {
  render: () => ({
    props: { images },
    template: `
      <u-galleria [value]="images" style="max-width: 40rem;">
        <ng-template #item let-item>
          <img [src]="item" style="width: 100%; display: block;" />
        </ng-template>
        <ng-template #thumbnail let-item>
          <img [src]="item" style="width: 5rem; display: block;" />
        </ng-template>
      </u-galleria>
    `,
  }),
};
