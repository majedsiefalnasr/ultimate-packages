import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UToastService } from "@ultimate/ng-core";
import { UToast } from "./toast";

describe("UToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a message queued via UToastService.add()", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ severity: "info", summary: "Saved", detail: "Your changes were saved." });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".u-toast-summary")?.textContent).toBe("Saved");
    expect(fixture.nativeElement.querySelector(".u-toast-detail")?.textContent).toBe(
      "Your changes were saved."
    );
  });

  it("applies the severity class", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ severity: "error", summary: "Failed" });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".u-toast-message")?.classList.contains("u-toast-message-error")
    ).toBe(true);
  });

  it("auto-dismisses after the default life elapses", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "Bye" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toast-message")).toBeTruthy();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toast-message")).toBeFalsy();
  });

  it("does not auto-dismiss a sticky message", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "Persistent", sticky: true });
    fixture.detectChanges();
    vi.advanceTimersByTime(10000);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".u-toast-message")).toBeTruthy();
  });

  it("dismisses manually via the close button, removing only that message (queue-identity)", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "First", sticky: true });
    service.add({ summary: "Second", sticky: true });
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll(
      ".u-toast-close-button"
    );
    expect(buttons.length).toBe(2);
    buttons[0].click();
    fixture.detectChanges();

    const summaries = fixture.nativeElement.querySelectorAll(".u-toast-summary");
    expect(summaries.length).toBe(1);
    expect(summaries[0].textContent).toBe("Second");
  });

  it("stacks multiple queued messages in order", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "One", sticky: true });
    service.add({ summary: "Two", sticky: true });
    service.add({ summary: "Three", sticky: true });
    fixture.detectChanges();

    const summaries: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-toast-summary");
    expect(Array.from(summaries).map((el) => el.textContent)).toEqual(["One", "Two", "Three"]);
  });

  it("only accepts messages matching its own key", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast key="secondary"></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "Wrong key" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toast-message")).toBeFalsy();

    service.add({ summary: "Right key", key: "secondary" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toast-summary")?.textContent).toBe("Right key");
  });

  it("clears all messages when UToastService.clear() is called", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "A", sticky: true });
    service.add({ summary: "B", sticky: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-toast-message").length).toBe(2);

    service.clear();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-toast-message").length).toBe(0);
  });

  it("applies the position class", () => {
    @Component({
      standalone: true,
      imports: [UToast],
      template: `<u-toast position="bottom-left"></u-toast>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".u-toast")?.classList.contains("u-toast-bottom-left")
    ).toBe(true);
  });

  it("does not render a close button when closable is false", () => {
    @Component({ standalone: true, imports: [UToast], template: `<u-toast></u-toast>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const service = TestBed.inject(UToastService);

    service.add({ summary: "No close", closable: false, sticky: true });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".u-toast-close-button")).toBeFalsy();
  });
});
