import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UMessage } from "./message";

describe("UMessage", () => {
  it("renders projected content with default info severity", () => {
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message>Hello</u-message>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-message");
    expect(root?.textContent?.trim()).toContain("Hello");
    expect(root?.classList.contains("u-message-info")).toBe(true);
  });

  it("applies the severity class", () => {
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message severity="error">Oops</u-message>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-message");
    expect(root?.classList.contains("u-message-error")).toBe(true);
  });

  it("does not render a close button when closable is false", () => {
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message>Hi</u-message>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-message-close-button")).toBeFalsy();
  });

  it("closes and emits onClose when the close button is clicked", () => {
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message [closable]="true" (onClose)="closed = true">Hi</u-message>`,
    })
    class HostComponent {
      closed = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      ".u-message-close-button"
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-message")).toBeFalsy();
    expect(fixture.componentInstance.closed).toBe(true);
  });

  it("auto-closes after the life delay elapses", () => {
    vi.useFakeTimers();
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message [life]="1000">Bye</u-message>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-message")).toBeTruthy();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-message")).toBeFalsy();
    vi.useRealTimers();
  });

  it("renders an icon when icon is provided", () => {
    @Component({
      standalone: true,
      imports: [UMessage],
      template: `<u-message icon="pi pi-check">Done</u-message>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-check")).toBeTruthy();
  });
});
