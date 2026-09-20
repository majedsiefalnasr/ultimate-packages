import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UAutoComplete } from "./autocomplete";

describe("UAutoComplete", () => {
  // UOverlay appends the suggestion overlay directly to document.body via
  // Renderer2 (same pattern documented in dialog.spec.ts/password.spec.ts) —
  // clean up leftover overlay hosts between tests.
  afterEach(() => {
    document.querySelectorAll(".u-autocomplete-overlay").forEach((el) => el.remove());
  });

  it("renders a native combobox input", () => {
    const fixture = TestBed.createComponent(UAutoComplete);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
    expect(input.getAttribute("role")).toBe("combobox");
  });

  it("emits completeMethod after the debounce delay once minLength is met", async () => {
    vi.useFakeTimers();
    @Component({
      standalone: true,
      imports: [UAutoComplete],
      template: `<u-autocomplete [delay]="10" (completeMethod)="onComplete($event)" />`,
    })
    class HostComponent {
      onComplete = vi.fn();
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "ab";
    input.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(10);
    expect(fixture.componentInstance.onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ query: "ab" })
    );
    vi.useRealTimers();
  });

  it("opens the suggestion overlay and lists provided suggestions", async () => {
    vi.useFakeTimers();
    @Component({
      standalone: true,
      imports: [UAutoComplete],
      template: `<u-autocomplete [delay]="1" [suggestions]="suggestions" (completeMethod)="load()" />`,
    })
    class HostComponent {
      suggestions: string[] = [];
      load() {
        this.suggestions = ["Apple", "Banana"];
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(1);
    fixture.detectChanges();

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain("Apple");
    vi.useRealTimers();
  });

  it("navigates suggestions with ArrowDown/ArrowUp and selects with Enter", async () => {
    vi.useFakeTimers();
    @Component({
      standalone: true,
      imports: [UAutoComplete],
      template: `<u-autocomplete [delay]="1" [suggestions]="['Apple', 'Banana']" (onSelect)="onSelect($event)" />`,
    })
    class HostComponent {
      onSelect = vi.fn();
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(1);
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
    fixture.detectChanges();
    input.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "Apple" })
    );
    vi.useRealTimers();
  });

  it("closes the overlay on Escape", async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(UAutoComplete);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    // @ts-expect-error -- accessing protected signal for a direct assertion
    expect(component.overlayVisible()).toBe(true);

    input.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    // @ts-expect-error -- accessing protected signal for a direct assertion
    expect(component.overlayVisible()).toBe(false);
    vi.useRealTimers();
  });

  it("integrates with reactive forms — FormControl value flows in and populates modelValue", () => {
    @Component({
      standalone: true,
      imports: [UAutoComplete, ReactiveFormsModule],
      template: `<u-autocomplete [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>("Apple");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const autocomplete = fixture.debugElement.query((de) => de.name === "u-autocomplete")
      .componentInstance as UAutoComplete;
    expect(autocomplete.modelValue()).toBe("Apple");
  });
});
