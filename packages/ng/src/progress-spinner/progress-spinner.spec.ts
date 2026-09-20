import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UProgressSpinner } from "./progress-spinner";

describe("UProgressSpinner", () => {
  it("renders an svg with role=progressbar and aria-busy", () => {
    @Component({
      standalone: true,
      imports: [UProgressSpinner],
      template: `<u-progress-spinner></u-progress-spinner>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-progress-spinner");
    expect(root?.getAttribute("role")).toBe("progressbar");
    expect(root?.getAttribute("aria-busy")).toBe("true");
    expect(fixture.nativeElement.querySelector("svg.u-progress-spinner-spin")).toBeTruthy();
  });

  it("applies a custom stroke width and fill to the circle", () => {
    @Component({
      standalone: true,
      imports: [UProgressSpinner],
      template: `<u-progress-spinner strokeWidth="4" fill="red"></u-progress-spinner>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector("circle");
    expect(circle?.getAttribute("stroke-width")).toBe("4");
    expect(circle?.getAttribute("fill")).toBe("red");
  });

  it("applies a custom animation duration to the svg style", () => {
    @Component({
      standalone: true,
      imports: [UProgressSpinner],
      template: `<u-progress-spinner animationDuration="4s"></u-progress-spinner>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector("svg") as SVGElement;
    expect(svg.style.animationDuration).toBe("4s");
  });

  it("sets aria-label when ariaLabel is provided", () => {
    @Component({
      standalone: true,
      imports: [UProgressSpinner],
      template: `<u-progress-spinner ariaLabel="Loading"></u-progress-spinner>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("u-progress-spinner")?.getAttribute("aria-label")
    ).toBe("Loading");
  });
});
