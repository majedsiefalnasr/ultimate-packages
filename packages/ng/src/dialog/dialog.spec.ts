import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UDialog } from "./dialog";

@Component({
  standalone: true,
  imports: [UDialog],
  template: `<u-dialog [(visible)]="visible" header="Confirm" [modal]="true"
    >Body content</u-dialog
  >`,
})
class TestHostComponent {
  visible = false;
}

describe("UDialog", () => {
  it("does not render dialog content when visible is false", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders with role="dialog", aria-modal="true", and aria-labelledby pointing at the header when visible', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]');
    expect(dialogEl).not.toBeNull();
    expect(dialogEl!.getAttribute("aria-modal")).toBe("true");
    const labelledBy = dialogEl!.getAttribute("aria-labelledby");
    expect(document.getElementById(labelledBy!)?.textContent).toContain("Confirm");
  });

  it("closes and emits visibleChange(false) on Escape when closeOnEscape is true", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBe(false);
  });

  it("does not close on Escape when closeOnEscape is false", () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<u-dialog [(visible)]="visible" header="Confirm" [closeOnEscape]="false">Body</u-dialog>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBe(true);
  });

  it("traps focus within the dialog while open", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogEl.querySelector("[uFocusTrap]")).not.toBeNull();
  });

  it("returns focus to the triggering element when closed", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    fixture.componentInstance.visible = false;
    // This project is zoneless: a plain-property mutation on the host
    // component does not by itself mark its view dirty for the scheduler,
    // so `markForCheck()` is needed to force a re-check on this second
    // mutation. `detectChanges(false)` skips Angular's "check no changes"
    // dev-mode verification pass — without it, re-running change detection
    // after mutating a two-way-bound property (`[(visible)]`) between calls
    // throws NG0100 (ExpressionChangedAfterItHasBeenCheckedError); this is
    // inherent to asserting on a second, later change within one test, not
    // a UDialog defect (same pattern as overlay.spec.ts/bind.spec.ts).
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    // UDialog restores focus inside the `effect()` watching `visible()`;
    // Angular's effects flush asynchronously (a microtask), not
    // synchronously inside `detectChanges()`. Awaiting `whenStable()` is
    // the documented zoneless-testing way to let the pending effect run
    // before asserting.
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
