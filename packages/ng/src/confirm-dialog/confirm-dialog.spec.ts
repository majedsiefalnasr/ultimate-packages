import { Component } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { describe, expect, it, beforeEach } from "vitest";
import { ComponentIdGenerator, UConfirmationService } from "@ultimate/ng-core";
import { UConfirmDialog } from "./confirm-dialog";

@Component({
  standalone: true,
  imports: [UConfirmDialog],
  template: `<u-confirm-dialog></u-confirm-dialog>`,
})
class HostComponent {}

/**
 * UDialog (composed by UConfirmDialog) keeps its DOM present through an
 * async leave-motion promise before actually removing it (see
 * dialog.spec.ts's own "keeps the dialog DOM present..." test). That
 * promise resolves via `createMotion`'s jsdom-safe synchronous-resolve path
 * (no real CSS animation/transition duration), but the resulting
 * `renderMask.set(false)` write's own consuming-view re-render is scheduled
 * on a macrotask `fixture.whenStable()` alone does not reliably surface in
 * this environment — an explicit `setTimeout(0)` flush plus one more
 * `detectChanges()` picks it up.
 */
async function flushDialogLeaveMotion(fixture: ComponentFixture<unknown>): Promise<void> {
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
  await fixture.whenStable();
}

describe("UConfirmDialog", () => {
  // UConfirmDialog composes UDialog, which injects ComponentIdGenerator
  // (an application-bootstrap-level provider, no providedIn) — see
  // dialog.spec.ts's own identical beforeEach for the full rationale.
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

  it("renders nothing until a matching confirmation is requested", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("shows the dialog with message/header when confirm() is called with no key", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    service.confirm({ message: "Delete this item?", header: "Confirm" });
    fixture.detectChanges();

    expect(document.querySelector(".u-dialog")).not.toBeNull();
    expect(document.querySelector(".u-confirmdialog-message")?.textContent).toBe("Delete this item?");
    expect(document.querySelector(".u-dialog-title")?.textContent).toBe("Confirm");

    fixture.destroy();
  });

  it("invokes accept() and hides when the accept button is clicked", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    let accepted = false;
    service.confirm({ message: "Proceed?", accept: () => (accepted = true) });
    fixture.detectChanges();

    const buttons = document.querySelectorAll(".u-confirmdialog-footer button");
    const acceptButton = buttons[buttons.length - 1] as HTMLButtonElement;
    acceptButton.click();
    fixture.detectChanges();
    await flushDialogLeaveMotion(fixture);

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();

    fixture.destroy();
  });

  it("invokes reject() and hides when the reject button is clicked", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    let rejected = false;
    service.confirm({ message: "Proceed?", reject: () => (rejected = true) });
    fixture.detectChanges();

    const rejectButton = document.querySelector(".u-confirmdialog-footer button") as HTMLButtonElement;
    rejectButton.click();
    fixture.detectChanges();
    await flushDialogLeaveMotion(fixture);

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();

    fixture.destroy();
  });

  it("only responds to confirmations matching its own key", () => {
    @Component({
      standalone: true,
      imports: [UConfirmDialog],
      template: `<u-confirm-dialog key="secondary"></u-confirm-dialog>`,
    })
    class KeyedHost {}
    const fixture = TestBed.createComponent(KeyedHost);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    service.confirm({ message: "For a different dialog", key: "other" });
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).toBeNull();

    service.confirm({ message: "For this dialog", key: "secondary" });
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    fixture.destroy();
  });

  it("renders role=alertdialog on the composed UDialog's root element (Spec §5.2, GAP-049)", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    service.confirm({ message: "Proceed?" });
    fixture.detectChanges();

    expect(document.querySelector("[role=alertdialog]")).toBeTruthy();
    expect(document.querySelector("[role=dialog]")).toBeFalsy();

    fixture.destroy();
  });

  it("hides when the service dispatches close()", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    fixture.detectChanges();

    service.confirm({ message: "Proceed?" });
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    service.close();
    fixture.detectChanges();
    await flushDialogLeaveMotion(fixture);
    expect(document.querySelector(".u-dialog")).toBeNull();

    fixture.destroy();
  });
});
