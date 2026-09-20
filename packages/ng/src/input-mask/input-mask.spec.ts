import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UInputMask } from "./input-mask";

function type(input: HTMLInputElement, chars: string): void {
  input.focus();
  input.setSelectionRange(0, 0);
  for (const ch of chars) {
    input.dispatchEvent(new KeyboardEvent("keypress", { key: ch, bubbles: true, cancelable: true }));
  }
}

describe("UInputMask", () => {
  it("renders a native input", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "99-999999");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("formats digit-slot ('9') keystrokes into the mask pattern with static separators", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "99-999999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "99999999");
    fixture.detectChanges();

    expect(input.value).toBe("99-999999");
  });

  it("rejects a keystroke that doesn't match the slot's character class", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "9999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "a"); // not a digit — must not fill slot 0
    fixture.detectChanges();

    expect(input.value.charAt(0)).toBe("_");
  });

  it("re-inserts the slotChar placeholder and shifts left on backspace", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "9999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "1234");
    fixture.detectChanges();
    expect(input.value).toBe("1234");

    input.setSelectionRange(4, 4);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(input.value).toBe("123_");
  });

  it("uses a custom slotChar as the placeholder", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "9999");
    fixture.componentRef.setInput("slotChar", "*");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("****");
  });

  it("emits the formatted (masked) value as modelValue by default (unmask=false)", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "99-999999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "99999999");
    fixture.detectChanges();

    expect(fixture.componentInstance.modelValue()).toBe("99-999999");
  });

  it("emits the raw unmasked value as modelValue when unmask=true", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "99-999999");
    fixture.componentRef.setInput("unmask", true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "99999999");
    fixture.detectChanges();

    expect(fixture.componentInstance.modelValue()).toBe("99999999");
  });

  it("respects the disabled state via CVA setDisabledState", () => {
    @Component({
      standalone: true,
      imports: [UInputMask, ReactiveFormsModule],
      template: `<u-input-mask [formControl]="control" mask="9999" />`,
    })
    class HostComponent {
      control = new FormControl({ value: "", disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });

  it("clears an incomplete value on blur when autoClear is true (default)", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "9999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");

    type(input, "12"); // incomplete
    fixture.detectChanges();
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(input.value).toBe("____");
  });

  it("integrates with reactive forms — writing a full value through the FormControl populates the buffer", () => {
    @Component({
      standalone: true,
      imports: [UInputMask, ReactiveFormsModule],
      template: `<u-input-mask [formControl]="control" mask="99-999999" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>(null);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue("99-999999");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("99-999999");
  });

  it("reflects the invalid input via the invalid class on the host", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentRef.setInput("mask", "9999");
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains("p-invalid")).toBe(true);
  });
});
