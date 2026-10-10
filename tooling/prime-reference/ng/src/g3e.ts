import { Component, input, signal } from "@angular/core";
import { CarouselModule } from "primeng/carousel";
import { GalleriaModule } from "primeng/galleria";
import { ImageModule } from "primeng/image";
import { ImageCompareModule } from "primeng/imagecompare";

/**
 * G3-E reference cases (route `#/g3e/<key>/<case>`, received here as `<key>/<case>`); one
 * `@case` per case, added per batch (Plan Tasks 5, 8, 11, 14). Each case mirrors the content
 * of the matching @ultimate/ng story.
 */
@Component({
  selector: "app-g3e",
  standalone: true,
  imports: [ImageModule, ImageCompareModule, CarouselModule, GalleriaModule],
  template: `
    @switch (id()) {
      @case ("image/default") {
        <p-image src="/media/landscape-1.png" alt="Image" width="200" />
      }
      @case ("image/preview") {
        <p-image src="/media/landscape-1.png" alt="Image" width="200" [preview]="true" />
      }
      @case ("imagecompare/sized") {
        <div style="width: 20rem; display: flex">
          <p-imagecompare>
            <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
            <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
          </p-imagecompare>
        </div>
      }
      @case ("imagecompare/rtl") {
        <div dir="rtl" style="width: 20rem; display: flex">
          <p-imagecompare>
            <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
            <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
          </p-imagecompare>
        </div>
      }
      @case ("imagecompare/root-style") {
        <p-imagecompare style="width: 20rem">
          <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
          <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
        </p-imagecompare>
      }
      @case ("carousel/basic") {
        <p-carousel [value]="items" [numVisible]="3" [numScroll]="1">
          <ng-template #item let-item
            ><div
              style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem"
            >
              {{ item }}
            </div></ng-template
          >
        </p-carousel>
      }
      @case ("carousel/circular") {
        <p-carousel [value]="items" [numVisible]="1" [circular]="true" [autoplayInterval]="3000">
          <ng-template #item let-item
            ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
              {{ item }}
            </div></ng-template
          >
        </p-carousel>
      }
      @case ("carousel/vertical") {
        <p-carousel [value]="items" [numVisible]="1" [numScroll]="1" orientation="vertical">
          <ng-template #item let-item
            ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
              {{ item }}
            </div></ng-template
          >
        </p-carousel>
      }
      @case ("carousel/rtl") {
        <div dir="rtl">
          <p-carousel [value]="items" [numVisible]="3" [numScroll]="1">
            <ng-template #item let-item
              ><div
                style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem"
              >
                {{ item }}
              </div></ng-template
            >
          </p-carousel>
        </div>
      }
      @case ("galleria/item-thumbnails") {
        <p-galleria [value]="images" [showItemNavigators]="true" style="max-width: 40rem">
          <ng-template #item let-item
            ><img [src]="item" style="width: 100%; display: block"
          /></ng-template>
          <ng-template #thumbnail let-item
            ><img [src]="item" style="width: 5rem; display: block"
          /></ng-template>
        </p-galleria>
      }
      @case ("galleria/no-thumbnails") {
        <p-galleria
          [value]="images"
          [showItemNavigators]="true"
          [showThumbnails]="false"
          style="max-width: 40rem"
        >
          <ng-template #item let-item
            ><img [src]="item" style="width: 100%; display: block"
          /></ng-template>
        </p-galleria>
      }
      @case ("galleria/fullscreen") {
        <button type="button" (click)="visible.set(true)">Show</button>
        <p-galleria
          [visible]="visible()"
          (visibleChange)="visible.set($event)"
          [value]="images"
          [fullScreen]="true"
          [showItemNavigators]="true"
        >
          <ng-template #item let-item
            ><img [src]="item" style="width: 100%; display: block"
          /></ng-template>
          <ng-template #thumbnail let-item
            ><img [src]="item" style="width: 5rem; display: block"
          /></ng-template>
        </p-galleria>
      }
    }
  `,
})
export class G3ECases {
  readonly id = input.required<string>();
  readonly items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
  readonly images = ["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"];
  readonly visible = signal(false);
}
