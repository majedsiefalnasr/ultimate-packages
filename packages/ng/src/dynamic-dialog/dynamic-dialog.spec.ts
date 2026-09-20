import { Component, Input } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, beforeEach } from "vitest";
import { ComponentIdGenerator, UDialogService } from "@ultimate/ng-core";
import { UDynamicDialog } from "./dynamic-dialog";

@Component({ standalone: true, template: `<p class="dynamic-content">{{ label }}</p>` })
class DynamicContentComponent {
  @Input() label = "default";
}

@Component({
  standalone: true,
  imports: [UDynamicDialog],
  template: `<u-dynamic-dialog></u-dynamic-dialog>`,
})
class HostComponent {}

describe("UDynamicDialog", () => {
  // UDynamicDialog composes UDialog, which injects ComponentIdGenerator —
  // see dialog.spec.ts's own identical beforeEach for the full rationale.
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

  it("renders nothing until open() is called", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("renders the dialog with the loaded component and header when open() is called", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UDialogService);
    fixture.detectChanges();

    service.open(DynamicContentComponent, { header: "Details", inputValues: { label: "hello" } });
    fixture.detectChanges();

    expect(document.querySelector(".u-dialog")).not.toBeNull();
    expect(document.querySelector(".u-dialog-title")?.textContent).toBe("Details");
    expect(document.querySelector(".dynamic-content")?.textContent).toBe("hello");

    fixture.destroy();
  });

  it("closes the dialog when ref.close() is called", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UDialogService);
    fixture.detectChanges();

    const ref = service.open(DynamicContentComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    ref.close("result-value");
    fixture.detectChanges();
    expect(document.querySelector(".u-dialog")).toBeNull();

    fixture.destroy();
  });

  it("emits the result on ref.onClose when closed", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UDialogService);
    fixture.detectChanges();

    const ref = service.open(DynamicContentComponent);
    fixture.detectChanges();
    let result: unknown;
    ref.onClose.subscribe((value) => (result = value));

    ref.close({ confirmed: true });
    fixture.detectChanges();

    expect(result).toEqual({ confirmed: true });

    fixture.destroy();
  });

  it("supports multiple simultaneously-open dialogs", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UDialogService);
    fixture.detectChanges();

    service.open(DynamicContentComponent, { header: "First", inputValues: { label: "one" } });
    service.open(DynamicContentComponent, { header: "Second", inputValues: { label: "two" } });
    fixture.detectChanges();

    expect(document.querySelectorAll(".u-dialog").length).toBe(2);
    expect(document.querySelectorAll(".dynamic-content").length).toBe(2);

    fixture.destroy();
  });

  it("closes the dialog when the dialog's own close button is clicked", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UDialogService);
    fixture.detectChanges();

    // UDialog's header block — the only place its close button renders —
    // is gated on `header()` being set (`@if (header())`), so a header is
    // required here for the close button to exist at all.
    const ref = service.open(DynamicContentComponent, { header: "Details" });
    fixture.detectChanges();
    let closed = false;
    ref.onClose.subscribe(() => (closed = true));

    const closeButton = document.querySelector(".u-dialog-close-button button") as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();
    // UDialog keeps its DOM present through an async leave-motion promise —
    // see dialog.spec.ts's own "keeps the dialog DOM present..." test.
    await fixture.whenStable();

    expect(closed).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();

    fixture.destroy();
  });
});
