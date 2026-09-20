import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { URadioButton } from "./radio-button";

describe("URadioButton", () => {
  it("renders a native input[type=radio]", () => {
    const fixture = TestBed.createComponent(URadioButton);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
  });

  it("checks the native input on click when value matches", () => {
    const fixture = TestBed.createComponent(URadioButton);
    fixture.componentRef.setInput("value", "option1");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    input.click();
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it("binary mode toggles a boolean value instead of matching against value()", () => {
    const fixture = TestBed.createComponent(URadioButton);
    fixture.componentRef.setInput("binary", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.modelValue()).toBe(true);
  });

  it("respects the disabled input by disabling the native input and ignoring clicks", () => {
    const fixture = TestBed.createComponent(URadioButton);
    fixture.componentRef.setInput("disabled", true);
    fixture.componentRef.setInput("value", "option1");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    expect(input.disabled).toBe(true);
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it("respects CVA setDisabledState independent of the disabled input", () => {
    const fixture = TestBed.createComponent(URadioButton);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    expect(input.disabled).toBe(true);
  });

  it("native name grouping: radios sharing a name are mutually exclusive via the browser", () => {
    @Component({
      standalone: true,
      imports: [URadioButton],
      template: `
        <u-radio-button name="group" value="a" />
        <u-radio-button name="group" value="b" />
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[0].click();
    fixture.detectChanges();
    expect(inputs[0].checked).toBe(true);
    inputs[1].click();
    fixture.detectChanges();
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].checked).toBe(false);
  });

  it("integrates with FormControl — writeValue reflects into the radio, user interaction propagates back", () => {
    @Component({
      standalone: true,
      imports: [URadioButton, ReactiveFormsModule],
      template: `<u-radio-button [formControl]="control" value="option1" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>(null);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="radio"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("option1");
  });

  it("modelValue synchronizes with values written through Angular Forms", () => {
    @Component({
      standalone: true,
      imports: [URadioButton, ReactiveFormsModule],
      template: `<u-radio-button [formControl]="control" value="option1" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>(null);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const radio = fixture.debugElement.query((de) => de.name === "u-radio-button")
      .componentInstance as URadioButton;

    fixture.componentInstance.control.setValue("option1");
    fixture.detectChanges();
    expect(radio.modelValue()).toBe("option1");
    expect(radio.checked()).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [URadioButton, ReactiveFormsModule],
      template: `<u-radio-button [formControl]="control" value="option1" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>(null);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const radio = fixture.debugElement.query((de) => de.name === "u-radio-button")
      .componentInstance as URadioButton;
    const spy = vi.spyOn(radio, "writeControlValue");

    fixture.componentInstance.control.setValue("option1");
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
