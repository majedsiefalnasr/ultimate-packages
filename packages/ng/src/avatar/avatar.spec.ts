import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UAvatar } from "./avatar";

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'AB'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-avatar-text")?.textContent).toBe("AB");
  });

  it("renders an icon when no image is provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [icon]="'pi pi-user'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-user")).not.toBeNull();
  });

  it("renders an image when provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [image]="'avatar.png'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img");
    expect(img?.src).toContain("avatar.png");
  });

  it("falls back to the label after an image load error", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [image]="'broken.png'" [label]="'AB'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector("img");
    img.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("img")).toBeNull();
    expect(fixture.nativeElement.querySelector(".u-avatar-text")?.textContent).toBe("AB");
  });

  it("emits onImageError when the image fails to load", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [image]="'broken.png'" (onImageError)="onError($event)"></u-avatar>`,
    })
    class HostComponent {
      called = false;
      onError(_event: Event) {
        this.called = true;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector("img");
    img.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(fixture.componentInstance.called).toBe(true);
  });

  it("applies the circle shape class", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'A'" [shape]="'circle'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-avatar-circle")).not.toBeNull();
  });

  it("applies the large size class", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'A'" [size]="'large'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-avatar-lg")).not.toBeNull();
  });
});
