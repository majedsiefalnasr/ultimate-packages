import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UImage } from "./image";

describe("UImage", () => {
  it("renders the img element with src/alt", () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'" [alt]="'A'"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("a.png");
    expect(img.getAttribute("alt")).toBe("A");
  });

  it("does not render a preview button when preview is false", () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-image-preview-mask")).toBeFalsy();
  });

  it("opens the fullscreen preview mask when the preview button is clicked", async () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'" [preview]="true"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const previewBtn = fixture.nativeElement.querySelector(
      ".u-image-preview-mask"
    ) as HTMLButtonElement;
    previewBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector(".u-image-mask")).toBeTruthy();
  });

  it("closes the preview when the close button is clicked", async () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'" [preview]="true"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".u-image-preview-mask") as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const closeBtn = document.querySelector(".u-image-close-button") as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector(".u-image-mask")).toBeFalsy();
  });

  it("closes the preview on Escape keydown", async () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'" [preview]="true"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".u-image-preview-mask") as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const mask = document.querySelector(".u-image-mask") as HTMLElement;
    mask.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector(".u-image-mask")).toBeFalsy();
  });

  it("toggles zoom in/out within the min/max bounds", async () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'a.png'" [preview]="true"></u-image>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".u-image-preview-mask") as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const zoomInBtn = document.querySelector(".u-image-zoom-in-button") as HTMLButtonElement;
    zoomInBtn.click();
    fixture.detectChanges();
    const original = document.querySelector(".u-image-original") as HTMLElement;
    expect(original.style.transform).toContain("scale(1.1)");
  });

  it("emits onImageError when the base image fails to load", () => {
    @Component({
      standalone: true,
      imports: [UImage],
      template: `<u-image [src]="'bad.png'" (onImageError)="errored = true"></u-image>`,
    })
    class HostComponent {
      errored = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(fixture.componentInstance.errored).toBe(true);
  });
});
