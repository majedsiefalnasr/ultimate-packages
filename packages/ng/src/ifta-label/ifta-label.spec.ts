import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UIftaLabel } from "./ifta-label";

@Component({
  standalone: true,
  imports: [UIftaLabel],
  template: `
    <u-ifta-label>
      <input type="text" [class.u-filled]="filled" />
      <label>Username</label>
    </u-ifta-label>
  `,
})
class TestHostComponent {
  filled = false;
}

describe("UIftaLabel", () => {
  it("projects its content (input + label) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("input")).toBeTruthy();
    expect(host.querySelector("label")).toBeTruthy();
  });

  it("applies the u-ifta-label root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-ifta-label");
    expect(root.classList.contains("u-ifta-label")).toBe(true);
  });

  it("label-position trigger is pure CSS (:has()), no JS-side focus/content tracking of its own", () => {
    // Two independent fixtures (unfilled vs. pre-filled), avoiding a
    // mid-test bound-property mutation that would trip Angular's dev-mode
    // ExpressionChangedAfterItHasBeenChecked check.
    const unfilled = TestBed.createComponent(TestHostComponent);
    unfilled.detectChanges();
    const rootBefore = unfilled.nativeElement.querySelector("u-ifta-label").className;

    const filledFixture = TestBed.createComponent(TestHostComponent);
    filledFixture.componentInstance.filled = true;
    filledFixture.detectChanges();
    const rootAfter = filledFixture.nativeElement.querySelector("u-ifta-label").className;

    expect(rootAfter).toBe(rootBefore);
    expect(filledFixture.nativeElement.querySelector("input.u-filled")).toBeTruthy();
  });
});
