import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTooltip } from "./tooltip";

@Component({
  standalone: true,
  imports: [UTooltip],
  template: `<button [uTooltip]="'Save changes'">Save</button>`,
})
class TestHostComponent {}

describe("UTooltip", () => {
  it("does not render a tooltip element before hover/focus", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('shows a tooltip element with role="tooltip" and the bound text on mouseenter', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip!.textContent).toContain("Save changes");
  });

  it("hides the tooltip on mouseleave", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("does not show a tooltip when uTooltipDisabled is true", () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<button [uTooltip]="'Save changes'" [uTooltipDisabled]="true">Save</button>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
