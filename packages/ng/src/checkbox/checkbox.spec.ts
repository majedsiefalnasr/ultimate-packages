import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { UCheckbox } from "./checkbox";

describe("UCheckbox", () => {
  it("renders a native input[type=checkbox] with role reflecting native semantics", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it("toggles aria-checked / checked state on click", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it("toggles on Space keypress", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it("integrates with FormControl — writeValue reflects into the checkbox, user interaction propagates back", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("respects the disabled input by disabling the native input", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input.disabled).toBe(true);
  });

  it("respects CVA setDisabledState by disabling the native input, independent of the disabled input", () => {
    // Distinct from the input-bound test above: this exercises the
    // $disabled = disabled() || _disabled() split directly via the CVA
    // method, not a template [disabled] binding — the two are backed by
    // different signals in UBaseEditableHolder.
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input.disabled).toBe(true);
  });

  it("renders the label input with a real u-checkbox-label class, not an empty class list", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.componentRef.setInput("label", "Accept terms");
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector("span");
    expect(label).not.toBeNull();
    expect(label.classList.contains("u-checkbox-label")).toBe(true);
    expect(label.textContent).toContain("Accept terms");
  });

  it("modelValue synchronizes with values written through Angular Forms", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(checkbox.modelValue()).toBe(true);
  });

  it("$filled reflects the synchronized modelValue correctly", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl<boolean | null>(null);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;

    expect(checkbox.$filled()).toBe(false);

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(checkbox.$filled()).toBe(true);
  });

  it("user-driven writes (click) also populate modelValue, not just CVA-driven writes", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.componentRef.setInput("binary", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.modelValue()).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;
    const spy = vi.spyOn(checkbox, "writeControlValue");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
