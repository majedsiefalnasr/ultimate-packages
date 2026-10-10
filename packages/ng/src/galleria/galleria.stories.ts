import type { Meta, StoryObj } from "@storybook/angular";
import { UGalleria } from "./galleria";

const meta: Meta<UGalleria> = {
  title: "Ng/Galleria",
  component: UGalleria,
};

export default meta;
type Story = StoryObj<UGalleria>;

const images = ["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"];

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

/** GAP-064 G3-E verification story: item navigators without thumbnails (same setup as Default). */
export const WithoutThumbnails: Story = {
  render: () => ({
    props: { images },
    template: `
      <u-galleria [value]="images" [showThumbnails]="false" style="max-width: 40rem;">
        <ng-template #item let-item><img [src]="item" style="width: 100%; display: block;" /></ng-template>
      </u-galleria>
    `,
  }),
};

/** GAP-064 G3-E verification story: full screen, opened through its trigger. */
export const FullScreen: Story = {
  render: () => ({
    props: { images },
    template: `
      <button type="button" (click)="g.openFullScreen()">Show</button>
      <u-galleria #g [value]="images" [fullScreen]="true">
        <ng-template #item let-item><img [src]="item" style="width: 100%; display: block;" /></ng-template>
        <ng-template #thumbnail let-item><img [src]="item" style="width: 5rem; display: block;" /></ng-template>
      </u-galleria>
    `,
  }),
};
