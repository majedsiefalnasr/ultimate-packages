import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { UColorPicker } from "./color-picker";

describe("UColorPicker", () => {
  // UOverlay appends the panel directly to document.body (same pattern
  // documented in select.spec.ts/autocomplete.spec.ts) — clean up leftover
  // overlay hosts between tests.
  afterEach(() => {
    document.querySelectorAll(".u-color-picker-panel").forEach((el) => el.remove());
  });

  it("renders a readonly preview input reflecting the default color", () => {
    @Component({ standalone: true, imports: [UColorPicker], template: `<u-color-picker />` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    expect(input.readOnly).toBe(true);
  });

  it("clicking the preview opens the overlay panel", () => {
    @Component({ standalone: true, imports: [UColorPicker], template: `<u-color-picker />` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
  });

  it("Escape closes the overlay panel", () => {
    @Component({ standalone: true, imports: [UColorPicker], template: `<u-color-picker />` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    input.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("dragging in the color selector emits a hex value and updates ngModel", () => {
    @Component({
      standalone: true,
      imports: [UColorPicker, FormsModule],
      template: `<u-color-picker [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();

    const selector = document.querySelector(".u-color-picker-color-selector") as HTMLElement;
    Object.defineProperty(selector, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }),
    });
    selector.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 75, clientY: 75 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("dragging the hue strip updates the value", () => {
    @Component({
      standalone: true,
      imports: [UColorPicker, FormsModule],
      template: `<u-color-picker [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = "#ff0000";
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();

    const hue = document.querySelector(".u-color-picker-hue") as HTMLElement;
    Object.defineProperty(hue, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 20, height: 150, right: 20, bottom: 150 }),
    });
    // clientY 75 (mid-strip) maps to hue 180 (cyan) — clearly distinct from
    // the starting red (#ff0000, hue 0/360).
    hue.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 75 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value).not.toBe("#ff0000");
  });

  it("respects the rgb format", () => {
    @Component({
      standalone: true,
      imports: [UColorPicker, FormsModule],
      template: `<u-color-picker format="rgb" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: { r: number; g: number; b: number } | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();

    const selector = document.querySelector(".u-color-picker-color-selector") as HTMLElement;
    Object.defineProperty(selector, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 150, height: 150, right: 150, bottom: 150 }),
    });
    selector.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 75, clientY: 75 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(
      expect.objectContaining({ r: expect.any(Number), g: expect.any(Number), b: expect.any(Number) })
    );
  });

  it("disabled state prevents opening the overlay", () => {
    @Component({
      standalone: true,
      imports: [UColorPicker, ReactiveFormsModule],
      template: `<u-color-picker [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>({ value: null, disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    input.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });
});
