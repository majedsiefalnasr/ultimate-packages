import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UInputMask, UInputMaskDirective } from "./input-mask";

function type(input: HTMLInputElement, chars: string): void {
  input.focus();
  input.setSelectionRange(0, 0);
  for (const ch of chars) {
    input.dispatchEvent(
      new KeyboardEvent("keypress", { key: ch, bubbles: true, cancelable: true })
    );
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
      new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true })
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
    input.focus();
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

    expect(input.value).toBe("");
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

function setup(inputs: Record<string, unknown> = { mask: "9999" }) {
  const fixture = TestBed.createComponent(UInputMask);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
  return { fixture, input };
}

describe("UInputMask editing behavior", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("deletes the character at the caret on Delete", () => {
    const { input } = setup();
    type(input, "1234");
    input.setSelectionRange(1, 1);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", cancelable: true }));
    expect(input.value).toBe("134_");
  });

  it("restores the value captured on focus when Escape is pressed", () => {
    const { input } = setup();
    input.focus();
    type(input, "12");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    expect(input.value).toBe("");
  });

  it("finalizes an incomplete value when Enter is pressed", () => {
    const { fixture, input } = setup();
    type(input, "12");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", cancelable: true }));
    fixture.detectChanges();
    expect(input.value).toBe("");
  });

  it("reformats pasted text after the browser applied it", () => {
    vi.useFakeTimers();
    const { input } = setup({ mask: "99-99" });
    input.focus();
    input.value = "1234";
    input.dispatchEvent(new Event("paste", { bubbles: true }));
    vi.advanceTimersByTime(5);
    expect(input.value).toBe("12-34");
  });

  it("keeps pasted text around the selection instead of replacing the whole value", () => {
    vi.useFakeTimers();
    const { input } = setup({ mask: "99-99" });
    type(input, "12");
    input.setSelectionRange(3, 3);
    input.value = "12-9_";
    input.dispatchEvent(new Event("paste", { bubbles: true }));
    vi.advanceTimersByTime(5);
    expect(input.value).toBe("12-9_");
  });

  it("ignores input events during composition and reformats when it ends", () => {
    vi.useFakeTimers();
    const { input } = setup({ mask: "99-99" });
    input.focus();
    input.dispatchEvent(new Event("compositionstart", { bubbles: true }));
    input.value = "1x2";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(5);
    expect(input.value).toBe("1x2");
    input.dispatchEvent(new Event("compositionend", { bubbles: true }));
    vi.advanceTimersByTime(5);
    expect(input.value).toBe("12-__");
  });

  it("reconciles native edits through the Android Chrome branch", () => {
    vi.useFakeTimers();
    const { fixture, input } = setup({ mask: "99-99" });
    const engine = (fixture.componentInstance as unknown as { engine: { androidChrome: boolean } })
      .engine;
    engine.androidChrome = true;
    input.focus();
    input.value = "12";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("12-__");
    vi.advanceTimersByTime(5);
    expect(input.value).toBe("12-__");
  });

  it("keeps an incomplete value on blur when keepBuffer is set", () => {
    const { input } = setup({ mask: "9999", keepBuffer: true });
    input.focus();
    input.value = "12";
    input.dispatchEvent(new Event("blur"));
    expect(input.value).toBe("12");
  });

  it("re-applies a changed mask to the current value", () => {
    const { fixture, input } = setup({ mask: "9999" });
    type(input, "1234");
    fixture.componentRef.setInput("mask", "99-99");
    fixture.detectChanges();
    expect(input.value).toBe("12-34");
  });

  it("emits the formatted value to the model when a reformat changes it", () => {
    vi.useFakeTimers();
    const changes: unknown[] = [];
    const { fixture, input } = setup({ mask: "99-99" });
    (
      fixture.componentInstance as unknown as { registerOnChange(fn: (v: unknown) => void): void }
    ).registerOnChange((value) => changes.push(value));
    input.focus();
    input.value = "1234";
    input.dispatchEvent(new Event("paste", { bubbles: true }));
    vi.advanceTimersByTime(5);
    expect(changes.at(-1)).toBe("12-34");
  });
});

describe("UInputMask public surface", () => {
  it("emits focus, blur and keydown outputs", () => {
    const { fixture, input } = setup();
    const seen: string[] = [];
    fixture.componentInstance.onFocus.subscribe(() => seen.push("focus"));
    fixture.componentInstance.onBlur.subscribe(() => seen.push("blur"));
    fixture.componentInstance.onKeydown.subscribe(() => seen.push("keydown"));
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "a", cancelable: true }));
    input.dispatchEvent(new Event("blur"));
    expect(seen).toEqual(["focus", "keydown", "blur"]);
  });

  it("exposes focus() on the component", () => {
    const { fixture, input } = setup();
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(input);
  });

  it("shows a clear icon for a filled value and clears it", () => {
    const { fixture, input } = setup({ mask: "9999", showClear: true });
    let cleared = 0;
    fixture.componentInstance.onClear.subscribe(() => cleared++);
    expect(fixture.nativeElement.querySelector(".u-inputmask-clear-icon")).toBeNull();
    type(input, "1234");
    fixture.detectChanges();
    const icon: HTMLElement = fixture.nativeElement.querySelector(".u-inputmask-clear-icon");
    expect(icon).not.toBeNull();
    icon.click();
    fixture.detectChanges();
    expect(input.value).toBe("");
    expect(cleared).toBe(1);
    expect(fixture.nativeElement.querySelector(".u-inputmask-clear-icon")).toBeNull();
  });

  it("binds native field attributes and aria-invalid on the input", () => {
    const { input } = setup({
      mask: "9999",
      inputId: "phone",
      name: "phone",
      ariaLabel: "Phone",
      required: true,
      invalid: true,
    });
    expect(input.id).toBe("phone");
    expect(input.getAttribute("name")).toBe("phone");
    expect(input.getAttribute("aria-label")).toBe("Phone");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("applies size, variant and fluid presentation to the input", () => {
    const { input } = setup({ mask: "9999", size: "small", variant: "filled", fluid: true });
    expect(input.classList.contains("u-inputtext-sm")).toBe(true);
    expect(input.classList.contains("p-variant-filled")).toBe(true);
    expect(input.classList.contains("u-inputtext-fluid")).toBe(true);
  });

  it("applies pass-through to the root and the inner input", () => {
    const { fixture, input } = setup({
      mask: "9999",
      pt: { root: { "data-root": "r" }, pcInputText: { "data-input": "i" } },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-root")).toBe("r");
    expect(input.getAttribute("data-input")).toBe("i");
  });

  it("drops the style classes when unstyled", () => {
    const { fixture, input } = setup({ mask: "9999", unstyled: true });
    expect(fixture.nativeElement.classList.contains("u-inputmask")).toBe(false);
    expect(input.classList.contains("u-inputtext")).toBe(false);
  });

  it("shows a value written before the view exists and a value written without a mask", () => {
    const fixture = TestBed.createComponent(UInputMask);
    fixture.componentInstance.writeValue("1234");
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("1234");
    fixture.componentInstance.writeValue("abc");
    expect(input.value).toBe("abc");
  });
});

describe("UInputMaskDirective", () => {
  it("masks a native input bound with ngModel and reports completion", () => {
    @Component({
      standalone: true,
      imports: [UInputMaskDirective, FormsModule],
      template: `<input
        uInputMask="99-99"
        [(ngModel)]="value"
        (onComplete)="completed.set(completed() + 1)"
      />`,
    })
    class HostComponent {
      value: string | null = null;
      completed = signal(0);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    type(input, "1234");
    fixture.detectChanges();
    expect(input.value).toBe("12-34");
    expect(fixture.componentInstance.value).toBe("12-34");
    expect(fixture.componentInstance.completed()).toBe(1);
    expect(input.classList.contains("u-inputmask")).toBe(true);
  });

  it("applies pass-through from the inherited pt input", () => {
    @Component({
      standalone: true,
      imports: [UInputMaskDirective],
      template: `<input uInputMask="9999" [pt]="{ root: { 'data-x': 'y' } }" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.getAttribute("data-x")).toBe("y");
  });
});
