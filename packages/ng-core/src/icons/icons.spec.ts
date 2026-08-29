import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon } from ".";

@Component({
  standalone: true,
  imports: [USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon],
  template: `
    <u-spinner-icon aria-label="loading" />
    <u-times-icon aria-label="close" />
    <u-window-maximize-icon aria-label="maximize" />
    <u-window-minimize-icon aria-label="minimize" />
  `,
})
class TestHostComponent {}

describe("icon components", () => {
  it("each renders exactly one <svg> element", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const svgs = fixture.nativeElement.querySelectorAll("svg");
    expect(svgs.length).toBe(4);
  });

  it('each svg has role="img" and reflects the aria-label input', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const spinnerSvg = fixture.nativeElement.querySelector("u-spinner-icon svg");
    expect(spinnerSvg.getAttribute("role")).toBe("img");
    expect(spinnerSvg.getAttribute("aria-label")).toBe("loading");
  });
});
