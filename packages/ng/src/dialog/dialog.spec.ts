import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentIdGenerator } from "@ultimate/ng-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
  // UOverlay appends each dialog's DOM directly to document.body via
  // Renderer2, and Angular's TestBed does not remove those elements when a
  // fixture is destroyed — clean them up explicitly so later tests in this
  // file don't observe a leftover dialog from an earlier one (found during
  // Task 15's review; see the header-input test below for the workaround
  // needed before this cleanup existed).
  afterEach(() => {
    document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
  });

  // UDialog now injects ComponentIdGenerator (application/SSR-safe
  // replacement for a module-scope id counter — see dialog.ts's own JSDoc
  // above ariaLabelledBy). It has no providedIn, so every test in this
  // describe block that constructs a UDialog needs it provided at the
  // TestBed/application injector level, exactly as a real application must
  // provide it at bootstrap. Deliberately provided here — at
  // configureTestingModule level — rather than on TestHostComponent's own
  // component-level providers, which would give each host its own isolated
  // generator instance and silently defeat the one-shared-instance-per-
  // application-injector design this fix exists to establish.
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

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

  it("does not set aria-labelledby when header is unset (avoiding a dangling id reference)", () => {
    // UOverlay appends each dialog directly to document.body, and TestBed
    // does not tear that down between tests, so prior tests' dialog
    // elements can still be present in the document here. Querying the
    // *last* [role="dialog"] scopes this assertion to the one this test
    // itself just created.
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `<u-dialog [(visible)]="visible" [modal]="true">Body</u-dialog>`,
    })
    class NoHeaderHostComponent {
      visible = false;
    }
    const fixture = TestBed.createComponent(NoHeaderHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const allDialogs = document.querySelectorAll('[role="dialog"]');
    const thisRunsDialog = allDialogs[allDialogs.length - 1];
    expect(thisRunsDialog.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("traps focus within the dialog while open", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogEl.querySelector("[uFocusTrap]")).not.toBeNull();
  });

  it("keeps the dialog DOM present through the same tick the leave animation starts in", () => {
    // Regression guard: renderMask must not flip to false in the same tick
    // visible() does, or the leave motion has no element left to animate
    // (found during review — @ultimate/uix-motion's .leave() is a real
    // async transition, not instantaneous).
    // UOverlay appends the dialog to document.body, so it's queried via the
    // global document, not fixture.nativeElement (matching the established
    // pattern in the "renders with role=dialog" test above).
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    fixture.componentInstance.visible = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    // Immediately after the visible→false transition, in the very same
    // change-detection pass the leave motion starts in, the dialog must
    // still be in the DOM — this is exactly the window the pre-fix code
    // skipped (renderMask flipping false in lockstep with visible() would
    // have already removed it here, leaving .leave() nothing to animate).
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
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

  it("emits onHide exactly once when visible genuinely transitions true→false", async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    let hideCount = 0;
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogInstance = fixture.debugElement.query(
      (de) => de.name === "u-dialog"
    ).componentInstance;
    dialogInstance.onHide.subscribe(() => hideCount++);

    fixture.componentInstance.visible = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    await fixture.whenStable();

    expect(hideCount).toBe(1);
  });

  it("does not emit onHide when visible never actually changes (e.g. a one-way binding that stays true)", async () => {
    // Regression guard: emitClose() previously called onHide.emit()
    // unconditionally on Escape/close-button, even when a one-way
    // [visible]="true" binding meant visible() never actually transitioned
    // to false — onHide must describe a real state change, not an attempt.
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `<u-dialog [visible]="true" header="Confirm">Body</u-dialog>`,
    })
    class OneWayHostComponent {}
    const fixture = TestBed.createComponent(OneWayHostComponent);
    fixture.detectChanges();
    const dialogDebugEl = fixture.debugElement.query((de) => de.name === "u-dialog");
    let hideCount = 0;
    dialogDebugEl.componentInstance.onHide.subscribe(() => hideCount++);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(hideCount).toBe(0);
  });

  it("gives two dialogs sharing one TestBed-provided ComponentIdGenerator distinct, sequential ariaLabelledBy ids", () => {
    // Proves the application-injector-scoping design itself, not merely
    // that two ids differ: ComponentIdGenerator is provided exactly once,
    // at the outer beforeEach's TestBed/application injector level (never
    // in a component-level `providers` array), so both u-dialog instances
    // created below must resolve the *same* generator instance. A
    // component-scoped (incorrect) generator would produce two independent
    // "u_dialog_1_header" ids instead of the sequential pair asserted here.
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `
        <u-dialog [(visible)]="visibleA" header="Dialog A">A body</u-dialog>
        <u-dialog [(visible)]="visibleB" header="Dialog B">B body</u-dialog>
      `,
    })
    class TwoDialogHostComponent {
      visibleA = true;
      visibleB = true;
    }

    const fixture = TestBed.createComponent(TwoDialogHostComponent);
    fixture.detectChanges();

    // ariaLabelledBy is a protected field on UDialog (internal detail), so
    // it is read here via its one public, observable effect: the
    // rendered aria-labelledby attribute on each dialog's root element.
    const dialogEls = document.querySelectorAll('[role="dialog"]');
    expect(dialogEls).toHaveLength(2);
    const [firstId, secondId] = Array.from(dialogEls).map((el) =>
      el.getAttribute("aria-labelledby")
    );

    expect(firstId).not.toBe(secondId);
    expect(firstId).toBe("u_dialog_1_header");
    expect(secondId).toBe("u_dialog_2_header");
  });

  it("renders the header span's id equal to the dialog root's aria-labelledby when open", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]') as HTMLElement;
    const labelledBy = dialogEl.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const headerSpan = dialogEl.querySelector("span");
    expect(headerSpan!.id).toBe(labelledBy);
  });
});

describe("UDialog without ComponentIdGenerator provided", () => {
  afterEach(() => {
    document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
  });

  it("throws Angular's no-provider error instead of silently producing a broken id", () => {
    // Deliberately does NOT configure ComponentIdGenerator on this TestBed,
    // proving the JSDoc requirement above UDialog's ariaLabelledBy field is
    // real and enforced by Angular DI, not just documented.
    expect(() => {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
    }).toThrow(/NG0201|No provider found for `?ComponentIdGenerator`?/);
  });
});
