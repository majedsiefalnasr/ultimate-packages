import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UFloatLabel } from "./float-label";

@Component({
  standalone: true,
  imports: [UFloatLabel],
  template: `
    <u-float-label [variant]="variant">
      <input type="text" [class.u-filled]="filled" />
      <label>Username</label>
    </u-float-label>
  `,
})
class TestHostComponent {
  variant: "in" | "over" | "on" = "over";
  filled = false;
}

describe("UFloatLabel", () => {
  it("projects its content (input + label) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("input")).toBeTruthy();
    expect(host.querySelector("label")).toBeTruthy();
  });

  it("applies the u-float-label root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label")).toBe(true);
  });

  it("applies the default 'over' variant class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label-over")).toBe(true);
  });

  it("applies the 'in' variant class when set", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = "in";
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label-in")).toBe(true);
  });

  it("label-float trigger is pure CSS (:has()), driven by the projected input's own filled/focus state", () => {
    // Real source (and this port) carries no JS-side focus/content tracking
    // of its own — the label-float visual trigger is entirely CSS `:has()`
    // selectors against the projected input's class/attribute state. This
    // test confirms the wrapper does not add any extra DOM class in response
    // to the child's filled state (two independent fixtures, one unfilled,
    // one pre-filled, to avoid mutating a bound property mid-test and
    // tripping Angular's dev-mode ExpressionChangedAfterItHasBeenChecked
    // check) — that responsibility belongs to the CSS, not to
    // UFloatLabel's own class list.
    const unfilled = TestBed.createComponent(TestHostComponent);
    unfilled.detectChanges();
    const rootBefore = unfilled.nativeElement.querySelector("u-float-label").className;

    const filledFixture = TestBed.createComponent(TestHostComponent);
    filledFixture.componentInstance.filled = true;
    filledFixture.detectChanges();
    const rootAfter = filledFixture.nativeElement.querySelector("u-float-label").className;

    expect(rootAfter).toBe(rootBefore);
    expect(filledFixture.nativeElement.querySelector("input.u-filled")).toBeTruthy();
  });
});
