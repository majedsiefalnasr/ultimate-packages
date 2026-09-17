import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { USelect } from "./select";

describe("USelect", () => {
  // UOverlay appends the panel directly to document.body (same pattern
  // documented in autocomplete.spec.ts/password.spec.ts) — clean up leftover
  // overlay hosts between tests.
  afterEach(() => {
    document.querySelectorAll(".u-select-overlay").forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    @Component({
      standalone: true,
      imports: [USelect],
      template: `<u-select [options]="['A', 'B']" [placeholder]="'Choose'" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger).not.toBeNull();
    expect(trigger.textContent?.trim()).toBe("Choose");
  });

  it("opens the overlay on click and lists the provided options", () => {
    @Component({
      standalone: true,
      imports: [USelect],
      template: `<u-select [options]="['Apple', 'Banana']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain("Apple");
  });

  it("selects an option on click, updates the label, and closes the overlay", () => {
    @Component({
      standalone: true,
      imports: [USelect, FormsModule],
      template: `<u-select [options]="['Apple', 'Banana']" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const option = document.querySelectorAll('[role="option"]')[1] as HTMLElement;
    option.click();
    fixture.detectChanges();

    expect(trigger.textContent?.trim()).toBe("Banana");
    expect(document.querySelector(".u-select-overlay")).toBeNull();
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", () => {
    @Component({
      standalone: true,
      imports: [USelect],
      template: `<u-select [options]="['Apple', 'Banana', 'Cherry']" (onChange)="onChange($event)" />`,
    })
    class HostComponent {
      lastValue: unknown;
      onChange(event: { value: unknown }) {
        this.lastValue = event.value;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.lastValue).toBe("Apple");
  });

  it("closes the overlay on Escape", () => {
    @Component({
      standalone: true,
      imports: [USelect],
      template: `<u-select [options]="['Apple']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-select-overlay")).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-select-overlay")).toBeNull();
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    @Component({
      standalone: true,
      imports: [USelect],
      template: `<u-select [options]="['Apple', 'Banana', 'Cherry']" [filter]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const filterInput: HTMLInputElement = document.querySelector('[role="searchbox"]')!;
    filterInput.value = "ban";
    filterInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain("Banana");
  });

  it("integrates with reactive forms — FormControl value flows in and populates the label", () => {
    @Component({
      standalone: true,
      imports: [USelect, ReactiveFormsModule],
      template: `<u-select [options]="['Apple', 'Banana']" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("Banana");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const select = fixture.debugElement.query((de) => de.name === "u-select")
      .componentInstance as USelect;
    expect(select.modelValue()).toBe("Banana");
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.textContent?.trim()).toBe("Banana");
  });

  it("respects the disabled option — clicking it does not select or close", () => {
    @Component({
      standalone: true,
      imports: [USelect, FormsModule],
      template: `<u-select [options]="options" [optionLabel]="'label'" [optionDisabled]="'disabled'" [(ngModel)]="value" />`,
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
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const option = document.querySelectorAll('[role="option"]')[0] as HTMLElement;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe(null);
  });
});
