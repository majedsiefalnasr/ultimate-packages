import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { UToggleSwitch } from "./toggle-switch";

describe("UToggleSwitch", () => {
  it("renders a native input[type=checkbox][role=switch]", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"][role="switch"]');
    expect(input).not.toBeNull();
  });

  it("toggles checked state on click, reflecting modelValue === trueValue", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(fixture.componentInstance.modelValue()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it("toggles back to falseValue on a second click", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
    expect(fixture.componentInstance.modelValue()).toBe(false);
  });

  it("respects custom trueValue/falseValue", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.componentRef.setInput("trueValue", "on");
    fixture.componentRef.setInput("falseValue", "off");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.modelValue()).toBe("on");
  });

  it("respects the disabled input by disabling the native input and ignoring clicks", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it("respects CVA setDisabledState independent of the disabled input", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });

  it("integrates with FormControl — writeValue reflects into the switch, user interaction propagates back", () => {
    @Component({
      standalone: true,
      imports: [UToggleSwitch, ReactiveFormsModule],
      template: `<u-toggle-switch [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [UToggleSwitch, ReactiveFormsModule],
      template: `<u-toggle-switch [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query((de) => de.name === "u-toggle-switch")
      .componentInstance as UToggleSwitch;
    const spy = vi.spyOn(toggle, "writeControlValue");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
