import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UScrollTop } from "./scroll-top";

describe("UScrollTop", () => {
  it("is hidden below the scroll threshold", async () => {
    @Component({
      standalone: true,
      imports: [UScrollTop],
      template: `<u-scroll-top [threshold]="100"></u-scroll-top>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector("u-button")).toBeFalsy();
  });

  it("becomes visible once window scroll exceeds the threshold", async () => {
    @Component({
      standalone: true,
      imports: [UScrollTop],
      template: `<u-scroll-top [threshold]="100"></u-scroll-top>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    Object.defineProperty(window, "pageYOffset", { value: 200, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector("u-button")).toBeTruthy();

    Object.defineProperty(window, "pageYOffset", { value: 0, configurable: true });
  });

  it("emits onShow when crossing the threshold and scrolls to top on click", async () => {
    @Component({
      standalone: true,
      imports: [UScrollTop],
      template: `<u-scroll-top [threshold]="50" (onShow)="shown = true"></u-scroll-top>`,
    })
    class HostComponent {
      shown = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    Object.defineProperty(window, "pageYOffset", { value: 100, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.shown).toBe(true);

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy as unknown as typeof window.scroll;
    const button = fixture.nativeElement.querySelector("u-button button") as HTMLButtonElement;
    button.click();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    Object.defineProperty(window, "pageYOffset", { value: 0, configurable: true });
  });

  it("respects a custom behavior value", async () => {
    @Component({
      standalone: true,
      imports: [UScrollTop],
      template: `<u-scroll-top [threshold]="10" behavior="auto"></u-scroll-top>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    Object.defineProperty(window, "pageYOffset", { value: 50, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    await fixture.whenStable();

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy as unknown as typeof window.scroll;
    const button = fixture.nativeElement.querySelector("u-button button") as HTMLButtonElement;
    button.click();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    Object.defineProperty(window, "pageYOffset", { value: 0, configurable: true });
  });
});
