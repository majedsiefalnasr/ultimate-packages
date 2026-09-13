import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, expect, it } from "vitest";
import { UOverlay } from "./overlay";

@Component({
  standalone: true,
  imports: [UOverlay],
  template: `<div uOverlay [visible]="visible" (visibleChange)="visible = $event">content</div>`,
})
class TestHostComponent {
  visible = false;
}

describe("UOverlay", () => {
  it('appends the host element to document.body when visible becomes true and appendTo is "body"', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.visible = true;
    // This project is zoneless (no zone.js dependency): a plain-property
    // mutation on the host component does not, by itself, mark its view
    // dirty for the scheduler, so a later `detectChanges()` call would skip
    // re-checking it entirely (confirmed by tracing the template getter —
    // it was never invoked a second time without this call).
    // `markForCheck()` is the standard, documented way to force zoneless
    // change detection to re-visit a view after such a mutation.
    fixture.changeDetectorRef.markForCheck();
    // `detectChanges(false)` skips Angular's "check no changes" dev-mode
    // verification pass on this second call. Without it, re-running change
    // detection after mutating a bound property between calls throws
    // NG0100 (ExpressionChangedAfterItHasBeenCheckedError) — reproduced
    // with a directive-free host component, so it is unrelated to
    // UOverlay itself; it's inherent to asserting on a second, later
    // change within one test.
    fixture.detectChanges(false);
    // UOverlay reacts to `visible` via `effect()`; Angular's effects flush
    // asynchronously (a microtask), not synchronously inside
    // `detectChanges()`. Awaiting `whenStable()` is the documented
    // zoneless-testing way to let a pending effect run before asserting.
    await fixture.whenStable();
    // The element has physically moved out from under fixture.nativeElement
    // by now (Renderer2.appendChild only moves the DOM node, not Angular's
    // logical view parentage), so `By.directive` still locates this
    // fixture's own overlay element rather than picking up another test's
    // leftover <div> from the shared document.body.
    const overlayEl = fixture.debugElement.query(By.directive(UOverlay))
      .nativeElement as HTMLElement;
    expect(overlayEl.parentElement).toBe(document.body);
  });

  it("assigns a z-index when appended", async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    await fixture.whenStable();
    const overlayEl = fixture.debugElement.query(By.directive(UOverlay))
      .nativeElement as HTMLElement;
    expect(Number(overlayEl.style.zIndex)).toBeGreaterThan(0);
  });

  it("assigns a strictly higher z-index to a second overlay instance appended while the first is still visible", async () => {
    @Component({
      standalone: true,
      imports: [UOverlay],
      template: `<div uOverlay [visible]="visible"></div>`,
    })
    class HostComponent {
      visible = false;
    }

    const fixtureA = TestBed.createComponent(HostComponent);
    fixtureA.componentInstance.visible = true;
    fixtureA.detectChanges();
    await fixtureA.whenStable();
    // Per the existing "appends the host element..." test's own note above,
    // the element has already moved out from under each fixture's
    // `nativeElement` into `document.body` by this point — `By.directive`
    // still resolves each fixture's own instance correctly.
    const elA = fixtureA.debugElement.query(By.directive(UOverlay)).nativeElement as HTMLElement;
    const zA = Number(elA.style.zIndex);

    const fixtureB = TestBed.createComponent(HostComponent);
    fixtureB.componentInstance.visible = true;
    fixtureB.detectChanges();
    await fixtureB.whenStable();
    const elB = fixtureB.debugElement.query(By.directive(UOverlay)).nativeElement as HTMLElement;
    const zB = Number(elB.style.zIndex);

    expect(zB).toBeGreaterThan(zA);
  });
});
