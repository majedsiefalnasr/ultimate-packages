import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UKeyFilter, type UKeyFilterPattern } from "./key-filter";

@Component({
  standalone: true,
  imports: [UKeyFilter],
  template: `<input type="text" [uKeyFilter]="pattern" />`,
})
class TestHostComponent {
  pattern: RegExp | UKeyFilterPattern | undefined = "int";
}

function keypress(input: HTMLInputElement, key: string): boolean {
  const event = new KeyboardEvent("keypress", { key, cancelable: true });
  input.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("UKeyFilter", () => {
  it("blocks a non-matching keypress for the 'int' preset", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const prevented = keypress(input, "a");
    expect(prevented).toBe(true);
  });

  it("allows a matching keypress for the 'int' preset", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const prevented = keypress(input, "5");
    expect(prevented).toBe(false);
  });

  it("allows the leading '-' for the 'int' preset (negative numbers)", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const prevented = keypress(input, "-");
    expect(prevented).toBe(false);
  });

  it("blocks a non-numeric character for the 'pint' preset", () => {
    @Component({
      standalone: true,
      imports: [UKeyFilter],
      template: `<input type="text" uKeyFilter="pint" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(keypress(input, "-")).toBe(true);
    expect(keypress(input, "3")).toBe(false);
  });

  it("accepts a custom RegExp pattern", () => {
    @Component({
      standalone: true,
      imports: [UKeyFilter],
      template: `<input type="text" [uKeyFilter]="pattern" />`,
    })
    class HostComponent {
      pattern = /^[a-c]*$/;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(keypress(input, "a")).toBe(false);
    expect(keypress(input, "z")).toBe(true);
  });

  it("blocks pasting text containing an invalid character", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const event = new Event("paste", { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "12a3" },
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows pasting text that fully matches the pattern", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const event = new Event("paste", { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "123" },
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not block keys when validateOnly is enabled", () => {
    @Component({
      standalone: true,
      imports: [UKeyFilter],
      template: `<input type="text" uKeyFilter="int" [validateOnly]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(keypress(input, "a")).toBe(false);
  });
});
