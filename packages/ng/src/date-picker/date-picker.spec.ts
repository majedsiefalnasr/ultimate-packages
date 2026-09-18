import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { UDatePicker } from "./date-picker";

describe("UDatePicker", () => {
  // UOverlay appends the panel directly to document.body (same pattern
  // documented in select.spec.ts/color-picker.spec.ts) — clean up leftover
  // overlay hosts between tests.
  afterEach(() => {
    document.querySelectorAll(".u-date-picker-panel").forEach((el) => el.remove());
  });

  function fixedToday(): Date {
    return new Date(2026, 8, 18); // 2026-09-18 (matches session date)
  }

  it("renders a readonly text input showing empty value when nothing is selected", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker],
      template: `<u-date-picker />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
    expect(input.value).toBe("");
    expect(input.readOnly).toBe(true);
  });

  it("clicking the input opens the overlay panel with a day grid", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker],
      template: `<u-date-picker />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();

    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();

    expect(document.querySelector(".u-date-picker-panel")).not.toBeNull();
    expect(document.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(27);
  });

  it("selecting a date updates the model value, formats the input, and closes the overlay", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker, FormsModule],
      template: `<u-date-picker [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: Date | null = fixedToday();
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();

    const day15 = Array.from(document.querySelectorAll('[role="gridcell"]')).find(
      (el) => el.textContent?.trim() === "15" && !el.classList.contains("p-datepicker-other-month")
    ) as HTMLElement;
    day15.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value?.getDate()).toBe(15);
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
    expect(input.value).toMatch(/^\d{2}\/15\/\d{4}$/);
  });

  it("navigates months with the header prev/next buttons", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker],
      template: `<u-date-picker />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();

    const titleBefore = document.querySelector(".u-date-picker-title")?.textContent?.trim();
    const nextButton = document.querySelectorAll(".u-date-picker-nav-button")[1] as HTMLElement;
    nextButton.click();
    fixture.detectChanges();
    const titleAfter = document.querySelector(".u-date-picker-title")?.textContent?.trim();

    expect(titleAfter).not.toBe(titleBefore);
  });

  it("supports arrow-key grid navigation across the day grid", async () => {
    @Component({
      standalone: true,
      imports: [UDatePicker, FormsModule],
      template: `<u-date-picker [(ngModel)]="value" />`,
    })
    class HostComponent {
      value: Date | null = new Date(2026, 8, 15);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // ngModel's initial-value write to the CVA lands asynchronously (a
    // microtask after the first change-detection pass) — wait for it before
    // asserting on state that depends on the initial modelValue.
    await fixture.whenStable();
    fixture.detectChanges();
    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();

    let focusedCell = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focusedCell.textContent?.trim()).toBe("15");

    focusedCell.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    focusedCell = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focusedCell.textContent?.trim()).toBe("16");

    focusedCell.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    focusedCell = document.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement;
    expect(focusedCell.textContent?.trim()).toBe("23");

    focusedCell.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value?.getDate()).toBe(23);
  });

  it("closes the overlay on Escape", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker],
      template: `<u-date-picker />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-date-picker-panel")).not.toBeNull();

    input.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
  });

  it("respects minDate/maxDate — dates outside the range are marked disabled and cannot be selected", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker, FormsModule],
      template: `<u-date-picker [(ngModel)]="value" [minDate]="minDate" [maxDate]="maxDate" />`,
    })
    class HostComponent {
      value: Date | null = null;
      minDate = new Date(2026, 8, 10);
      maxDate = new Date(2026, 8, 20);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();

    const day5 = Array.from(document.querySelectorAll('[role="gridcell"]')).find(
      (el) => el.textContent?.trim() === "5" && !el.classList.contains("p-datepicker-other-month")
    ) as HTMLElement;
    expect(day5.getAttribute("aria-disabled")).toBe("true");
    day5.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeNull();
  });

  it("clears the value via the clear icon when showClear is set", async () => {
    @Component({
      standalone: true,
      imports: [UDatePicker, FormsModule],
      template: `<u-date-picker [(ngModel)]="value" [showClear]="true" />`,
    })
    class HostComponent {
      value: Date | null = fixedToday();
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // See the arrow-key navigation test's comment: ngModel's initial-value
    // CVA write lands one microtask after the first change-detection pass.
    await fixture.whenStable();
    fixture.detectChanges();
    const clearIcon: HTMLElement = fixture.nativeElement.querySelector(".u-date-picker-clear-icon");
    clearIcon.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeNull();
  });

  it("disabled state prevents opening the overlay", () => {
    @Component({
      standalone: true,
      imports: [UDatePicker, FormsModule],
      template: `<u-date-picker [disabled]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLElement = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-date-picker-panel")).toBeNull();
  });
});
