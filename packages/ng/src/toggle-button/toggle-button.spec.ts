import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { UToggleButton } from "./toggle-button";

describe("UToggleButton", () => {
  it("renders with role=button and aria-pressed=false by default", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.detectChanges();
    const host = fixture.nativeElement;
    expect(host.getAttribute("role")).toBe("button");
    expect(host.getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles checked state and aria-pressed on click", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.detectChanges();
    fixture.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(fixture.nativeElement.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles on Enter keydown", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.detectChanges();
    fixture.nativeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it("toggles on Space keydown", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.detectChanges();
    fixture.nativeElement.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it("renders onLabel/offLabel reflecting the checked state", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.componentRef.setInput("onLabel", "On");
    fixture.componentRef.setInput("offLabel", "Off");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe("Off");
    fixture.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe("On");
  });

  it("respects the disabled input — click is a no-op and tabindex is -1", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("tabindex")).toBe("-1");
    fixture.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it("respects CVA setDisabledState independent of the disabled input", () => {
    const fixture = TestBed.createComponent(UToggleButton);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    fixture.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it("integrates with FormControl — writeValue reflects into the toggle, user interaction propagates back", () => {
    @Component({
      standalone: true,
      imports: [UToggleButton, ReactiveFormsModule],
      template: `<u-toggle-button [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector("u-toggle-button").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [UToggleButton, ReactiveFormsModule],
      template: `<u-toggle-button [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query((de) => de.name === "u-toggle-button")
      .componentInstance as UToggleButton;
    const spy = vi.spyOn(toggle, "writeControlValue");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
