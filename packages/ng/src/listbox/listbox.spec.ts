import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UListbox } from "./listbox";

describe("UListbox", () => {
  it("renders an always-visible role=listbox with the provided options — no overlay", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="['Apple', 'Banana']" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="listbox"]');
    expect(list).not.toBeNull();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
  });

  it("single-select — clicking an option updates the value", () => {
    @Component({
      standalone: true,
      imports: [UListbox, FormsModule],
      template: `<u-listbox [options]="['Apple', 'Banana']" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string | null = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("Banana");
  });

  it("multi-select — toggles values in and out of an array, renders checkboxes", () => {
    @Component({
      standalone: true,
      imports: [UListbox, FormsModule],
      template: `<u-listbox [options]="['Apple', 'Banana', 'Cherry']" [multiple]="true" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: string[] = [];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    let options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options[0].querySelector('input[type="checkbox"]')).not.toBeNull();

    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Apple"]);

    options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Apple", "Banana"]);

    options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(["Banana"]);
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="['Apple', 'Banana', 'Cherry']" (onChange)="onChange($event)" />`,
    })
    class HostComponent {
      lastValue: unknown;
      onChange(event: { value: unknown }) {
        this.lastValue = event.value;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const list: HTMLElement = fixture.nativeElement.querySelector('[role="listbox"]');
    list.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    list.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    list.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.lastValue).toBe("Banana");
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="['Apple', 'Banana', 'Cherry']" [filter]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const filterInput: HTMLInputElement = fixture.nativeElement.querySelector('[role="searchbox"]');
    filterInput.value = "ban";
    filterInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain("Banana");
  });

  it("respects the disabled option — clicking it does not select", () => {
    @Component({
      standalone: true,
      imports: [UListbox, FormsModule],
      template: `<u-listbox [options]="options" [optionLabel]="'label'" [optionDisabled]="'disabled'" [(ngModel)]="value" />`,
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
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(null);
  });

  it("integrates with reactive forms — FormControl value flows in", () => {
    @Component({
      standalone: true,
      imports: [UListbox, ReactiveFormsModule],
      template: `<u-listbox [options]="['Apple', 'Banana']" [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("Banana");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const listbox = fixture.debugElement.query((de) => de.name === "u-listbox")
      .componentInstance as UListbox;
    expect(listbox.modelValue()).toBe("Banana");
  });
});

describe("UListbox trackBy", () => {
  it("reuses option DOM by position after an equivalent-object refresh by default", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="options" [optionLabel]="'label'" />`,
    })
    class HostComponent {
      options = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const before = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    fixture.componentInstance.options = [
      { id: "a", label: "A refreshed" },
      { id: "b", label: "B refreshed" },
    ];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const after = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    expect(after.map((option) => option.textContent?.trim())).toEqual(["A refreshed", "B refreshed"]);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
  });

  it("reuses option DOM by supplied key across a reorder", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="options" [optionLabel]="'label'" [trackBy]="trackBy" />`,
    })
    class HostComponent {
      options = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
      trackBy(_index: number, option: unknown): unknown {
        return (option as { id: string }).id;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const before = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    fixture.componentInstance.options = [
      { id: "b", label: "B refreshed" },
      { id: "a", label: "A refreshed" },
    ];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const after = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    expect(after.map((option) => option.textContent?.trim())).toEqual(["B refreshed", "A refreshed"]);
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });
});
