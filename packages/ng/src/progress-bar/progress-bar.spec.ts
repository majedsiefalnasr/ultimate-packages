import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UProgressBar } from "./progress-bar";

describe("UProgressBar", () => {
  it("renders a determinate bar with the value width and label text", () => {
    @Component({
      standalone: true,
      imports: [UProgressBar],
      template: `<u-progress-bar [value]="42"></u-progress-bar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const value = fixture.nativeElement.querySelector(".u-progress-bar-value") as HTMLElement;
    expect(value.style.width).toBe("42%");
    expect(fixture.nativeElement.querySelector(".u-progress-bar-label")?.textContent).toBe("42%");
  });

  it("hides the label when showValue is false", () => {
    @Component({
      standalone: true,
      imports: [UProgressBar],
      template: `<u-progress-bar [value]="50" [showValue]="false"></u-progress-bar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-progress-bar-label")).toBeFalsy();
  });

  it("renders indeterminate mode without a value/label", () => {
    @Component({
      standalone: true,
      imports: [UProgressBar],
      template: `<u-progress-bar mode="indeterminate"></u-progress-bar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-progress-bar-label")).toBeFalsy();
    expect(
      fixture.nativeElement.querySelector(".u-progress-bar")?.classList.contains("u-progress-bar-indeterminate")
    ).toBe(true);
  });

  it("sets role=progressbar and aria-valuenow in determinate mode", () => {
    @Component({
      standalone: true,
      imports: [UProgressBar],
      template: `<u-progress-bar [value]="75"></u-progress-bar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-progress-bar");
    expect(root?.getAttribute("role")).toBe("progressbar");
    expect(root?.getAttribute("aria-valuenow")).toBe("75");
  });

  it("appends a custom unit to the value label", () => {
    @Component({
      standalone: true,
      imports: [UProgressBar],
      template: `<u-progress-bar [value]="3" unit=" MB"></u-progress-bar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-progress-bar-label")?.textContent).toBe("3 MB");
  });
});
