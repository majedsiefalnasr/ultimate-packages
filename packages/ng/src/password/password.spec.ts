import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { UPassword } from "./password";

describe("UPassword", () => {
  // UOverlay appends the strength-meter overlay directly to document.body via
  // Renderer2 (same pattern documented in dialog.spec.ts), and Angular's
  // TestBed does not remove those elements when a fixture is destroyed —
  // clean them up explicitly so later tests don't observe a leftover overlay.
  afterEach(() => {
    document.querySelectorAll(".u-password-overlay").forEach((el) => el.remove());
  });

  it("renders a native password input", () => {
    const fixture = TestBed.createComponent(UPassword);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
    expect(input.type).toBe("password");
  });

  it("integrates with reactive forms — FormControl value flows in and populates modelValue", () => {
    @Component({
      standalone: true,
      imports: [UPassword, ReactiveFormsModule],
      template: `<u-password [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("secret1");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const password = fixture.debugElement.query((de) => de.name === "u-password")
      .componentInstance as UPassword;
    expect(password.modelValue()).toBe("secret1");

    fixture.componentInstance.control.setValue("newsecret");
    fixture.detectChanges();
    expect(password.modelValue()).toBe("newsecret");
  });

  it("toggles unmasked state, switching the input type to text", () => {
    @Component({
      standalone: true,
      imports: [UPassword],
      template: `<u-password [toggleMask]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.type).toBe("password");

    const toggle: SVGElement = fixture.nativeElement.querySelector('svg[aria-label="Show Password"]');
    toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    expect(input.type).toBe("text");
  });

  it("shows the strength-meter overlay on focus when feedback is enabled", () => {
    const fixture = TestBed.createComponent(UPassword);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    // UOverlay moves the overlay host to document.body once visible — see dialog.spec.ts's
    // own documented finding for the same reason.
    const overlay = document.querySelector(".u-password-overlay");
    expect(overlay).not.toBeNull();
  });

  it("classifies a strong password and updates the meter width/label", () => {
    const fixture = TestBed.createComponent(UPassword);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "Str0ngPass!";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("focus"));
    fixture.detectChanges();

    const meterLabel: HTMLElement | null = document.querySelector(".u-password-meter-label");
    expect(meterLabel?.style.width).toBe("100%");
    const meterText: HTMLElement | null = document.querySelector(".u-password-meter-text");
    expect(meterText?.textContent).toBe("Strong");
  });

  it("classifies a weak password", () => {
    const fixture = TestBed.createComponent(UPassword);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "abc";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("focus"));
    fixture.detectChanges();

    const meterText: HTMLElement | null = document.querySelector(".u-password-meter-text");
    expect(meterText?.textContent).toBe("Weak");
  });

  it("hides the overlay when Escape is pressed", () => {
    const fixture = TestBed.createComponent(UPassword);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    const component = fixture.componentInstance;
    // @ts-expect-error -- accessing protected signal for a direct assertion
    expect(component.overlayVisible()).toBe(true);

    input.dispatchEvent(new KeyboardEvent("keyup", { code: "Escape" }));
    fixture.detectChanges();
    // @ts-expect-error -- accessing protected signal for a direct assertion
    expect(component.overlayVisible()).toBe(false);
  });
});
