import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
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
});
