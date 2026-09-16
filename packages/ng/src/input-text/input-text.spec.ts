import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UFluid } from "../fluid/fluid";
import { UInputText } from "./input-text";

describe("UInputText", () => {
  it("applies to a native input via the [uInputText] selector", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
    expect(input.classList.contains("u-inputtext")).toBe(true);
  });

  it("updates modelValue/$filled when the input's value changes", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText #ref="uInputText" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect(directive.$filled()).toBe(false);

    input.value = "hello";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(directive.modelValue()).toBe("hello");
    expect(directive.$filled()).toBe(true);
    expect(input.classList.contains("p-filled")).toBe(true);
  });

  it("does not implement ControlValueAccessor — no writeValue/registerOnChange/registerOnTouched/setDisabledState", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect((directive as unknown as Record<string, unknown>)["writeValue"]).toBeUndefined();
    expect(
      (directive as unknown as Record<string, unknown>)["registerOnChange"],
    ).toBeUndefined();
    expect(
      (directive as unknown as Record<string, unknown>)["registerOnTouched"],
    ).toBeUndefined();
    expect(
      (directive as unknown as Record<string, unknown>)["setDisabledState"],
    ).toBeUndefined();
  });

  it("reflects the invalid input as a p-invalid class", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText [invalid]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.classList.contains("p-invalid")).toBe(true);
  });

  it("reflects variant='filled' as a p-variant-filled class and exposes it via $variant", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText variant="filled" #ref="uInputText" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect(input.classList.contains("p-variant-filled")).toBe(true);
    expect(directive.$variant()).toBe("filled");
  });

  it("reflects the fluid input as a u-inputtext-fluid class and hasFluid getter", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText [fluid]="true" #ref="uInputText" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect(input.classList.contains("u-inputtext-fluid")).toBe(true);
    expect(directive.hasFluid).toBe(true);
  });

  it("detects an ancestor u-fluid wrapper and reflects hasFluid/u-inputtext-fluid even without an explicit fluid input", () => {
    @Component({
      standalone: true,
      imports: [UInputText, UFluid],
      template: `<u-fluid><input uInputText #ref="uInputText" /></u-fluid>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.query((de) => de.name === "input").injector.get(
      UInputText,
    );
    expect(directive.hasFluid).toBe(true);
    expect(input.classList.contains("u-inputtext-fluid")).toBe(true);
  });

  it("without an ancestor u-fluid wrapper and no fluid input, hasFluid is false", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText #ref="uInputText" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect(directive.hasFluid).toBe(false);
  });

  it("integrates with reactive forms (formControl) — DefaultValueAccessor drives the value, UInputText syncs modelValue read-only", () => {
    @Component({
      standalone: true,
      imports: [UInputText, ReactiveFormsModule],
      template: `<input uInputText [formControl]="control" #ref="uInputText" />`,
    })
    class HostComponent {
      control = new FormControl("initial");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);

    expect(input.value).toBe("initial");
    expect(directive.modelValue()).toBe("initial");

    fixture.componentInstance.control.setValue("updated");
    fixture.detectChanges();
    fixture.detectChanges();
    expect(input.value).toBe("updated");
    expect(directive.modelValue()).toBe("updated");

    input.value = "typed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("typed");
    expect(directive.modelValue()).toBe("typed");
  });

  it("integrates with template-driven forms (ngModel) — DefaultValueAccessor drives the value, UInputText syncs modelValue read-only", async () => {
    @Component({
      standalone: true,
      imports: [UInputText, FormsModule],
      template: `<input uInputText [(ngModel)]="value" #ref="uInputText" />`,
    })
    class HostComponent {
      value = "start";
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // NgModel's own writeValue (via ngOnChanges) is scheduled asynchronously
    // relative to the first detectChanges() call — whenStable() flushes that
    // before assertions, independent of UInputText's own sync mechanism
    // (confirmed via isolation: an unrelated plain `[(ngModel)]` input
    // without UInputText shows the identical empty-value timing gap).
    await fixture.whenStable();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);

    expect(input.value).toBe("start");
    expect(directive.modelValue()).toBe("start");

    input.value = "changed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("changed");
    expect(directive.modelValue()).toBe("changed");
  });
});
