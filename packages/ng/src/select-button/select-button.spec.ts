import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { USelectButton } from "./select-button";

describe("USelectButton", () => {
  it("renders one toggle button per option, with role=group on the host", () => {
    @Component({
      standalone: true,
      imports: [USelectButton],
      template: `<u-select-button [options]="['A', 'B', 'C']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-select-button");
    expect(host.getAttribute("role")).toBe("group");
    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    expect(buttons.length).toBe(3);
  });

  it("single-select — clicking an option selects it and deselects the previous one", () => {
    @Component({
      standalone: true,
      imports: [USelectButton, FormsModule],
      template: `<u-select-button [options]="['A', 'B', 'C']" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("A");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");

    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("B");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
  });

  it("single-select — allowEmpty false prevents deselecting the last selection", () => {
    @Component({
      standalone: true,
      imports: [USelectButton, FormsModule],
      template: `<u-select-button [options]="['A', 'B']" [allowEmpty]="false" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = "A";
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("A");
  });

  it("multi-select — toggles values in and out of an array", () => {
    @Component({
      standalone: true,
      imports: [USelectButton, FormsModule],
      template: `<u-select-button [options]="['A', 'B', 'C']" [multiple]="true" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string[] = [];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["A", "B"]);

    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["B"]);
  });

  it("respects per-option disabled via optionDisabled", () => {
    @Component({
      standalone: true,
      imports: [USelectButton, FormsModule],
      template: `<u-select-button [options]="options" [optionDisabled]="'disabled'" [(ngModel)]="value" />`,
    })
    class HostComponent {
      options = [
        { label: "A", disabled: true },
        { label: "B", disabled: false },
      ];
      value: unknown = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(null);
  });

  it("integrates with reactive forms — FormControl value flows in and out", () => {
    @Component({
      standalone: true,
      imports: [USelectButton, ReactiveFormsModule],
      template: `<u-select-button [options]="['A', 'B']" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("A");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const selectButton = fixture.debugElement.query((de) => de.name === "u-select-button")
      .componentInstance as USelectButton;
    expect(selectButton.modelValue()).toBe("A");

    const buttons = fixture.nativeElement.querySelectorAll("u-toggle-button");
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("B");
  });
});
