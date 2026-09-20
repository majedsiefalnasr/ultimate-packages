import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { UMultiSelect } from "./multi-select";

describe("UMultiSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".u-multi-select-overlay").forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect],
      template: `<u-multi-select [options]="['A', 'B']" [placeholder]="'Choose'" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.textContent?.trim()).toBe("Choose");
  });

  it("opens the overlay on click and lists the provided options with checkboxes", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect],
      template: `<u-multi-select [options]="['Apple', 'Banana']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it("toggles options in and out of the array value, and does not close the overlay", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect, FormsModule],
      template: `<u-multi-select [options]="['Apple', 'Banana', 'Cherry']" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string[] = [];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    let options = document.querySelectorAll('[role="option"]');
    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Apple"]);
    expect(document.querySelector(".u-multi-select-overlay")).not.toBeNull();

    options = document.querySelectorAll('[role="option"]');
    (options[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Apple", "Banana"]);

    options = document.querySelectorAll('[role="option"]');
    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Banana"]);
  });

  it("select-all header checkbox selects/deselects every visible option", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect, FormsModule],
      template: `<u-multi-select [options]="['Apple', 'Banana']" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string[] = [];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const selectAll: HTMLInputElement = document.querySelector('[aria-label="Select All"]')!;
    selectAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Apple", "Banana"]);

    selectAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual([]);
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect],
      template: `<u-multi-select [options]="['Apple', 'Banana', 'Cherry']" [filter]="true" />`,
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
  });

  it("closes the overlay on Escape", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect],
      template: `<u-multi-select [options]="['Apple']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-multi-select-overlay")).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-multi-select-overlay")).toBeNull();
  });

  it("integrates with reactive forms — FormControl array value flows in and populates the label", () => {
    @Component({
      standalone: true,
      imports: [UMultiSelect, ReactiveFormsModule],
      template: `<u-multi-select [options]="['Apple', 'Banana']" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string[]>(["Apple", "Banana"]);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.textContent).toContain("Apple");
    expect(trigger.textContent).toContain("Banana");
  });
});
