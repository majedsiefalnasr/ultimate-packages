import { Component, input } from "@angular/core";
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
  imports: [ImageModule, ImageCompareModule],
  template: `
    @switch (id()) {
      @case ("image/default") {
        <p-image src="/media/landscape-1.png" alt="Image" width="200" />
      }
      @case ("image/preview") {
        <p-image src="/media/landscape-1.png" alt="Image" width="200" [preview]="true" />
      }
      @case ("imagecompare/sized") {
        <div style="width: 20rem">
          <p-imagecompare>
            <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
            <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
          </p-imagecompare>
        </div>
      }
      @case ("imagecompare/rtl") {
        <div dir="rtl" style="width: 20rem">
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
    }
  `,
})
export class G3ECases {
  readonly id = input.required<string>();
}
