import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UIconField, UInputIcon } from "./icon-field";

@Component({
  standalone: true,
  imports: [UIconField, UInputIcon],
  template: `
    <u-icon-field [iconPosition]="iconPosition">
      <u-input-icon>search</u-input-icon>
      <input type="text" />
    </u-icon-field>
  `,
})
class TestHostComponent {
  iconPosition: "left" | "right" = "left";
}

describe("UIconField", () => {
  it("projects its content (icon + input) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("u-input-icon")).toBeTruthy();
    expect(host.querySelector("input")).toBeTruthy();
  });

  it("applies the u-icon-field root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-icon-field");
    expect(root.classList.contains("u-icon-field")).toBe(true);
  });

  it("positions the icon leading/trailing via DOM order, not an added class per position", () => {
    // Real source resolves icon position via CSS :first-child/:last-child
    // sibling selectors, not a positional class swap. Two independent
    // fixtures (left vs. right), avoiding a mid-test bound-property
    // mutation that would trip Angular's dev-mode
    // ExpressionChangedAfterItHasBeenChecked check. This test confirms
    // UIconField's own root class list doesn't change with iconPosition —
    // the DOM-order the consumer supplies is what drives positioning.
    const leftFixture = TestBed.createComponent(TestHostComponent);
    leftFixture.detectChanges();
    const rootLeft = leftFixture.nativeElement.querySelector("u-icon-field").className;

    const rightFixture = TestBed.createComponent(TestHostComponent);
    rightFixture.componentInstance.iconPosition = "right";
    rightFixture.detectChanges();
    const rootRight = rightFixture.nativeElement.querySelector("u-icon-field").className;

    expect(rootRight).toBe(rootLeft);

    const icon = leftFixture.nativeElement.querySelector("u-input-icon");
    expect(icon).toBe(leftFixture.nativeElement.querySelector("u-icon-field").firstElementChild);
  });
});

describe("UInputIcon", () => {
  it("projects its content and applies the u-input-icon root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector("u-input-icon");
    expect(icon.classList.contains("u-input-icon")).toBe(true);
    expect(icon.textContent.trim()).toBe("search");
  });
});
