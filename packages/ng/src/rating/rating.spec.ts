import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { URating } from "./rating";

describe("URating", () => {
  it("wraps each star's radio input in the shared u-hidden-accessible class (GAP-074)", () => {
    @Component({
      standalone: true,
      imports: [URating],
      template: `<u-rating [stars]="5" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll(".u-hidden-accessible input[type=radio]").length).toBeGreaterThan(0);
    expect(host.querySelector(".p-hidden-accessible")).toBeNull();
  });

  it("renders one option per star", () => {
    @Component({
      standalone: true,
      imports: [URating],
      template: `<u-rating [stars]="5" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs.length).toBe(5);
  });

  it("clicking a star selects it and reflects via ngModel", () => {
    @Component({
      standalone: true,
      imports: [URating, FormsModule],
      template: `<u-rating [stars]="5" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: number | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
    options[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(3);
  });

  it("clicking the already-selected star clears the value", async () => {
    @Component({
      standalone: true,
      imports: [URating, FormsModule],
      template: `<u-rating [stars]="5" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: number | null = 3;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // NgModel's own writeValue call is dispatched via a queued microtask,
    // not synchronously inside the first detectChanges() (zoneless testing)
    // — await whenStable() before asserting on the initial bound value,
    // same pattern as dialog.spec.ts.
    await fixture.whenStable();
    fixture.detectChanges();
    const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
    options[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(null);
  });

  it("ArrowRight/ArrowDown steps to the next star, wrapping past the max", () => {
    @Component({
      standalone: true,
      imports: [URating, FormsModule],
      template: `<u-rating [stars]="3" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: number | null = 3;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(1);
  });

  it("ArrowLeft/ArrowUp steps to the previous star", async () => {
    @Component({
      standalone: true,
      imports: [URating, FormsModule],
      template: `<u-rating [stars]="5" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: number | null = 3;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const inputs: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(2);
  });

  it("readonly prevents value changes", () => {
    @Component({
      standalone: true,
      imports: [URating, FormsModule],
      template: `<u-rating [stars]="5" [readonly]="true" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: number | null = 2;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
    options[4].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(2);
  });

  it("disabled state disables every radio input", () => {
    @Component({
      standalone: true,
      imports: [URating, ReactiveFormsModule],
      template: `<u-rating [stars]="3" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>({ value: null, disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input) => expect(input.disabled).toBe(true));
  });

  it("integrates with reactive forms", () => {
    @Component({
      standalone: true,
      imports: [URating, ReactiveFormsModule],
      template: `<u-rating [stars]="5" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(2);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const rating = fixture.debugElement.query((de) => de.name === "u-rating")
      .componentInstance as URating;
    expect(rating.modelValue()).toBe(2);

    const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
    options[3].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(4);
  });
});
