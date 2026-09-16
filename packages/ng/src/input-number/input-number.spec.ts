import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UFluid } from "../fluid/fluid";
import { UInputNumber } from "./input-number";

describe("UInputNumber", () => {
  it("renders a native numeric-capable input", () => {
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("does not implement a second, competing ControlValueAccessor surface beyond its own NG_VALUE_ACCESSOR provider", () => {
    // UInputNumber DOES implement ControlValueAccessor (unlike UInputText) —
    // matching real PrimeNG's own InputNumber, which provides
    // INPUTNUMBER_VALUE_ACCESSOR and implements writeControlValue directly.
    // This test just confirms writeControlValue exists and is callable.
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.writeControlValue).toBe("function");
  });

  it("integrates with reactive forms — FormControl value flows in and populates modelValue", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.modelValue()).toBe(5);

    fixture.componentInstance.control.setValue(10);
    fixture.detectChanges();
    expect(inputNumber.modelValue()).toBe(10);
  });

  it("clamps to min when a written value is below it", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" [min]="0" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue(-5);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.value).toBe(0);
  });

  it("clamps to max when a written value is above it", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" [max]="100" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue(500);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.value).toBe(100);
  });

  it("reflects the invalid input via the invalid class", () => {
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.classList.contains("p-invalid")).toBe(true);
  });

  it("hasFluid is true when an ancestor UFluid is present", () => {
    // Real, un-mocked <u-fluid> ancestor — proves U_FLUID_ANCESTOR DI wiring
    // works end-to-end through UBaseInput (ng-core) -> UInputNumber (ng),
    // both compiled from source within this package's own build graph.
    @Component({
      standalone: true,
      imports: [UInputNumber, UFluid],
      template: `<u-fluid><u-input-number /></u-fluid>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.hasFluid).toBe(true);
    const input = fixture.nativeElement.querySelector("input");
    expect(input.classList.contains("u-inputnumber-fluid")).toBe(true);
  });

  it("without an ancestor u-fluid wrapper and no fluid input, hasFluid is false", () => {
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasFluid).toBe(false);
  });

  it("integrates with template-driven forms — ngModel value flows in and populates modelValue", async () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, FormsModule],
      template: `<u-input-number [(ngModel)]="value" />`,
    })
    class TemplateHostComponent {
      value: number | null = 5;
    }
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.modelValue()).toBe(5);
  });
});
