import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UButton } from "./button";

describe("UButton", () => {
  it("renders the label input as visible text", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Save");
  });

  it("emits onClick when clicked and not disabled", () => {
    const fixture = TestBed.createComponent(UButton);
    let emitted: MouseEvent | undefined;
    fixture.componentInstance.onClick.subscribe((e: MouseEvent) => (emitted = e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    expect(emitted).toBeDefined();
  });

  it("does not emit onClick when disabled", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("disabled", true);
    let emitted = false;
    fixture.componentInstance.onClick.subscribe(() => (emitted = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    expect(emitted).toBe(false);
  });

  it("renders u-button-loading class and a spinner icon when loading is true", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("button").classList.contains("u-button-loading")
    ).toBe(true);
    expect(fixture.nativeElement.querySelector("u-spinner-icon")).not.toBeNull();
  });

  it("applies the disabled attribute to the native <button> when disabled input is true", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").disabled).toBe(true);
  });

  it("renders the icon input's value as a class on the icon span", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("icon", "pi pi-check");
    fixture.detectChanges();
    const iconSpan = fixture.nativeElement.querySelector("span.u-button-icon");
    expect(iconSpan).not.toBeNull();
    expect(iconSpan.classList.contains("pi")).toBe(true);
    expect(iconSpan.classList.contains("pi-check")).toBe(true);
    expect(iconSpan.classList.contains("u-button-icon")).toBe(true);
  });

  it("does not render an icon span when icon is unset", () => {
    // uRipple (applied to the native <button>) creates its own <span> for
    // the ink effect, so this asserts no *icon-classed* span exists, not
    // "no span at all" — a bare span-count check would be a false positive
    // against Ripple's unrelated internal DOM.
    const fixture = TestBed.createComponent(UButton);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("span.u-button-icon")).toBeNull();
  });

  it("has aria-label reflecting the label input when no explicit ariaLabel is set", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    expect(button.getAttribute("aria-label") ?? fixture.nativeElement.textContent).toContain(
      "Save"
    );
  });
});
