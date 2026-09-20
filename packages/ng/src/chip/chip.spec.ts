import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UChip } from "./chip";

describe("UChip", () => {
  it("renders the label text", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-chip-label")?.textContent).toBe("Apple");
  });

  it("renders an icon class when icon is provided and no image", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [icon]="'pi pi-apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-apple")).toBeTruthy();
  });

  it("renders an image and prefers it over icon", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [image]="'a.png'" [icon]="'pi pi-apple'" [alt]="'fruit'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img.u-chip-image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe("fruit");
    expect(fixture.nativeElement.querySelector(".pi-apple")).toBeFalsy();
  });

  it("does not render a remove control by default", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-chip-remove-icon")).toBeFalsy();
  });

  it("removes the chip and emits onRemove when the remove control is clicked", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" (onRemove)="removed = true"></u-chip>`,
    })
    class HostComponent {
      removed = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl).toBeTruthy();
    removeEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(true);
    expect(fixture.nativeElement.querySelector(".u-chip-label")).toBeFalsy();
  });

  it("removes the chip on Enter and Backspace keydown on the remove control", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" (onRemove)="removed = removed + 1"></u-chip>`,
    })
    class HostComponent {
      removed = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    removeEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(1);
  });

  it("does not remove when disabled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" [disabled]="true" (onRemove)="removed = true"></u-chip>`,
    })
    class HostComponent {
      removed = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    removeEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(false);
    expect(fixture.nativeElement.querySelector(".u-chip")).toBeTruthy();
  });

  it("sets tabindex -1 on the remove control when disabled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" [disabled]="true"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.getAttribute("tabindex")).toBe("-1");
  });

  it("emits onImageError when the image fails to load", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [image]="'bad.png'" (onImageError)="errored = true"></u-chip>`,
    })
    class HostComponent {
      errored = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img.u-chip-image") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(fixture.componentInstance.errored).toBe(true);
  });
});
