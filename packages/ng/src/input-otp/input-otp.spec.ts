import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UInputOtp } from "./input-otp";

function inputEvent(target: HTMLInputElement, inputType: string): Event {
  const event = new Event("input", { bubbles: true, cancelable: true }) as InputEvent;
  Object.defineProperty(event, "inputType", { value: inputType });
  Object.defineProperty(event, "target", { value: target, configurable: true });
  return event;
}

describe("UInputOtp", () => {
  it("renders `length` (default 4) separate native inputs", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll("input");
    expect(inputs.length).toBe(4);
  });

  it("renders a custom `length` number of segments", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.componentRef.setInput("length", 6);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll("input");
    expect(inputs.length).toBe(6);
  });

  it("joins segment tokens into a single string modelValue as the user types", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");

    inputs[0].value = "1";
    inputs[0].dispatchEvent(inputEvent(inputs[0], "insertText"));
    fixture.detectChanges();
    inputs[1].value = "2";
    inputs[1].dispatchEvent(inputEvent(inputs[1], "insertText"));
    fixture.detectChanges();

    expect(fixture.componentInstance.modelValue()).toBe("12");
  });

  it("moves focus to the next segment after a character is typed", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");

    inputs[0].value = "1";
    inputs[0].dispatchEvent(inputEvent(inputs[0], "insertText"));
    fixture.detectChanges();

    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(inputs[1]);
  });

  it("moves focus to the previous segment on ArrowLeft", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");

    inputs[1].dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(inputs[0]);
  });

  it("moves focus to the previous segment on Backspace when the current segment is empty", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");
    inputs[1].focus();

    inputs[1].dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(inputs[0]);
  });

  it("splits a pasted value across the segment inputs", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");

    const clipboardData = { getData: () => "1234" };
    const pasteEvent = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
      clipboardData,
    });
    inputs[0].dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(fixture.componentInstance.modelValue()).toBe("1234");
  });

  it("rejects non-digit keys when integerOnly is set", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.componentRef.setInput("integerOnly", true);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");

    const keydownEvent = new KeyboardEvent("keydown", {
      key: "a",
      bubbles: true,
      cancelable: true,
    });
    const prevented = !inputs[0].dispatchEvent(keydownEvent);

    expect(prevented).toBe(true);
  });

  it("renders each segment as type=password when mask is set", () => {
    const fixture = TestBed.createComponent(UInputOtp);
    fixture.componentRef.setInput("mask", true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.getAttribute("type")).toBe("password");
  });

  it("integrates with reactive forms — a FormControl string value splits into segment tokens", () => {
    @Component({
      standalone: true,
      imports: [UInputOtp, ReactiveFormsModule],
      template: `<u-input-otp [formControl]="control" [length]="4" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("1234");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll("input");
    expect(inputs[0].value).toBe("1");
    expect(inputs[3].value).toBe("4");
  });

  it("respects the disabled state via CVA setDisabledState", () => {
    @Component({
      standalone: true,
      imports: [UInputOtp, ReactiveFormsModule],
      template: `<u-input-otp [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl({ value: "", disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });
});
