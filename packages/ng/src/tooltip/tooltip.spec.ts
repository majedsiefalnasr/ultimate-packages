import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentIdGenerator } from "@ultimate/ng-core";
import { beforeEach, describe, expect, it } from "vitest";
import { UTooltip } from "./tooltip";

@Component({
  standalone: true,
  imports: [UTooltip],
  template: `<button [uTooltip]="'Save changes'">Save</button>`,
})
class TestHostComponent {}

describe("UTooltip", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

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

  it("sets numeric left/top pixel styles on the tooltip container after positioning", () => {
    // Regression guard for align(): jsdom returns zeroed
    // getBoundingClientRect()/offsetWidth/offsetHeight, so this can't assert
    // exact coordinates, but it does prove align() actually ran and applied
    // real numeric styles rather than silently no-oping or throwing (which
    // would leave these unset).
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.style.left).toMatch(/^-?\d+(\.\d+)?px$/);
    expect(tooltip.style.top).toMatch(/^-?\d+(\.\d+)?px$/);
  });

  it("applies a position-specific class matching uTooltipPosition", () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<button [uTooltip]="'Save changes'" uTooltipPosition="right">Save</button>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.classList.contains("u-tooltip-right")).toBe(true);
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

  it("wires aria-describedby from the trigger to the tooltip's own id while visible", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(tooltip.id).toBe(describedBy);
  });

  it("clears aria-describedby from the trigger on hide", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("preserves a pre-existing aria-describedby token on the trigger and restores it on hide", () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<button aria-describedby="other-id" [uTooltip]="'Save changes'">Save</button>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");

    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const describedBy = button.getAttribute("aria-describedby")!;
    expect(describedBy.split(" ")).toContain("other-id");

    button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute("aria-describedby")).toBe("other-id");
  });

  it("gives two tooltip instances distinct ids from one shared ComponentIdGenerator", () => {
    @Component({
      standalone: true,
      imports: [UTooltip],
      template: `
        <button [uTooltip]="'First'">A</button>
        <button [uTooltip]="'Second'">B</button>
      `,
    })
    class TwoTooltipHostComponent {}

    const fixture = TestBed.createComponent(TwoTooltipHostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("button");

    buttons[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const firstId = document.querySelector('[role="tooltip"]')!.id;
    buttons[0].dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();

    buttons[1].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const secondId = document.querySelector('[role="tooltip"]')!.id;

    expect(firstId).not.toBe(secondId);
  });

  it("clears its owned aria-describedby token from the trigger on destroy while still visible", () => {
    // Mirrors dialog.ts's own destroy-cleanup requirement (Task 3): a
    // tooltip torn down while its floating panel is still shown (e.g. its
    // host element is removed from an *ngIf-gated template without a prior
    // mouseleave/blur) must not leave a stale aria-describedby token
    // pointing at a tooltip id that no longer exists in the DOM.
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute("aria-describedby")).toBeTruthy();

    fixture.destroy();

    expect(button.getAttribute("aria-describedby")).toBeNull();
  });
});
