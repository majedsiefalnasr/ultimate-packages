import { Component, signal } from "@angular/core";
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
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
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
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
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

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
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

  it("closes only the topmost of two simultaneously open dialogs on Escape", async () => {
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
    await fixture.whenStable();

    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();

    // Dialog B was displayed second (registered later, higher display
    // order), so it is topmost and must be the one Escape closes — Dialog
    // A must remain open. Asserted via the host's own bound signals rather
    // than DOM count alone, so a failure clearly names which dialog closed.
    expect(fixture.componentInstance.visibleA).toBe(true);
    expect(fixture.componentInstance.visibleB).toBe(false);
  });

  it("closes the remaining dialog on a second Escape after the topmost one closes", async () => {
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
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibleB).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibleA).toBe(false);
  });

  it("does not react to Escape after a still-open dialog is destroyed (registry entries cleared on destroy)", async () => {
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `@if (showB()) {
        <u-dialog [(visible)]="visibleB" header="Dialog B">B body</u-dialog>
      }`,
    })
    class DestroyableDialogHostComponent {
      visibleB = true;
      showB = signal(true);
    }

    const fixture = TestBed.createComponent(DestroyableDialogHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    // Destroy Dialog B while it is still visible=true and still registered
    // (never toggled to visible=false first) — a real scenario, e.g. an
    // *ngIf/@if-gated dialog whose host is torn down directly, or a router
    // navigation that destroys the component tree mid-dialog. Without an
    // explicit ngOnDestroy unregistering both registries, this dialog's
    // now-stale escapeRegistry/displayOrderRegistry entries would remain
    // registered forever, permanently occupying the topmost display-order
    // slot and silently swallowing every future Escape keypress meant for
    // any dialog opened afterward.
    fixture.componentInstance.showB.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);

    @Component({
      standalone: true,
      imports: [UDialog],
      template: `<u-dialog [(visible)]="visibleC" header="Dialog C">C body</u-dialog>`,
    })
    class SingleDialogHostComponent {
      visibleC = true;
    }
    const fixtureC = TestBed.createComponent(SingleDialogHostComponent);
    fixtureC.detectChanges();
    await fixtureC.whenStable();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixtureC.detectChanges();
    await fixtureC.whenStable();

    // If Dialog B's registry entries leaked past its destruction, Dialog C
    // (registered later, genuinely topmost) would not receive this Escape —
    // the stale, higher-priority-looking B entry would still win the
    // registry's "highest pair" comparison. Asserting C actually closes
    // proves the leak did not happen.
    expect(fixtureC.componentInstance.visibleC).toBe(false);
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

describe("scroll-lock (Spec §5.1, GAP-048)", () => {
  // UOverlay appends each dialog's DOM directly to document.body, and
  // scrollLockRegistry mutates document.body's classList directly (see
  // packages/uix-utils/src/scroll-lock/registry.ts) — neither is torn down
  // by TestBed between tests, so a failing assertion mid-suite could leave
  // document.body locked for later tests. Clean up both explicitly, mirroring
  // the established afterEach precedent in the "UDialog" describe block above.
  afterEach(() => {
    document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
    document.body.classList.remove("u-overflow-hidden");
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

  it("locks background scroll while the dialog is visible", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("restores background scroll when the dialog closes", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    fixture.componentRef.setInput("visible", false);
    fixture.detectChanges();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("keeps scroll locked while a second dialog remains open after the first closes", () => {
    // Both instances created via independent TestBed.createComponent(UDialog)
    // calls, per the brief's own literal test shape — confirmed by direct
    // run (not assumed) that this is safe here: unlike Vue's mount(), which
    // scopes useId()-derived ids per independent app root and previously
    // collided in an analogous two-instance scroll-lock test (see
    // dialog.spec.ts's Vue counterpart, "spec §16"), each
    // TestBed.createComponent(UDialog) call here creates a genuinely
    // independent component instance/injector, and this component's lockId
    // is a fresh Math.random()-derived string per instance (matching
    // BlockUI's own established pattern in block-ui.ts), not derived from
    // any shared or app-root-scoped id source — so no cross-instance
    // collision analogous to Vue's exists for this counter.
    const a = TestBed.createComponent(UDialog);
    const b = TestBed.createComponent(UDialog);
    a.componentRef.setInput("visible", true);
    a.detectChanges();
    b.componentRef.setInput("visible", true);
    b.detectChanges();
    a.componentRef.setInput("visible", false);
    a.detectChanges();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    b.componentRef.setInput("visible", false);
    b.detectChanges();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregisters the scroll lock on destroy even if the dialog was never explicitly closed", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    fixture.destroy();
    const next = TestBed.createComponent(UDialog);
    next.componentRef.setInput("visible", true);
    next.detectChanges();
    next.componentRef.setInput("visible", false);
    next.detectChanges();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
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
